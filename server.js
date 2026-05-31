// Main Server Entry Point
// Express server for IPL Top Trumps API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import agents
const StatScraper = require('./backend/agent1_stat_scraper/scraper');
const VisualDesignAgent = require('./backend/agent2_visual_design/generator');
const GameEngine = require('./backend/agent3_game_engine/engine');

// Load starter cards
const starterCards = require('./data/starter_cards.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend/public'));

// Initialize agents
const scraper = new StatScraper();
const designAgent = new VisualDesignAgent();
const gameEngine = new GameEngine();

// ============== API ENDPOINTS ==============

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IPL Top Trumps API is running' });
});

/**
 * Get all starter cards
 */
app.get('/api/cards', (req, res) => {
  try {
    res.json({
      success: true,
      count: starterCards.cards.length,
      cards: starterCards.cards
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get a specific card by ID
 */
app.get('/api/cards/:cardId', (req, res) => {
  try {
    const card = starterCards.cards.find(c => c.id === req.params.cardId);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get card SVG design
 */
app.get('/api/cards/:cardId/design', (req, res) => {
  try {
    const card = starterCards.cards.find(c => c.id === req.params.cardId);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    const svg = designAgent.generateSVGCard(card);
    res.type('image/svg+xml').send(svg);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create a new game session
 */
app.post('/api/games/create', (req, res) => {
  try {
    const { gameId, player1, player2, mode } = req.body;
    
    if (!gameId || !player1 || !player2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: gameId, player1, player2' 
      });
    }

    const gameState = gameEngine.createGame(gameId, player1, player2, mode || 'powerplay');
    res.json({ success: true, gameState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Assign decks to players
 */
app.post('/api/games/:gameId/assign-deck', (req, res) => {
  try {
    const { playerIndex, cardIds } = req.body;
    
    if (playerIndex === undefined || !cardIds || !Array.isArray(cardIds)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: playerIndex, cardIds (array)' 
      });
    }

    const cards = cardIds.map(id => starterCards.cards.find(c => c.id === id)).filter(Boolean);
    gameEngine.assignDeck(req.params.gameId, playerIndex, cards);
    
    res.json({ success: true, message: 'Deck assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Play a round
 */
app.post('/api/games/:gameId/play-round', (req, res) => {
  try {
    const { stat } = req.body;
    
    if (!stat) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: stat' 
      });
    }

    const roundResult = gameEngine.playRound(req.params.gameId, stat);
    res.json({ success: true, roundResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get game state
 */
app.get('/api/games/:gameId', (req, res) => {
  try {
    const gameState = gameEngine.getGameState(req.params.gameId);
    if (!gameState) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    res.json({ success: true, gameState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get game summary
 */
app.get('/api/games/:gameId/summary', (req, res) => {
  try {
    const summary = gameEngine.getGameSummary(req.params.gameId);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get available stats for comparison
 */
app.get('/api/game-stats', (req, res) => {
  try {
    const stats = gameEngine.getAvailableStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get team colors
 */
app.get('/api/teams', (req, res) => {
  try {
    const teams = [
      { name: 'CSK', colors: { primary: '#FFEB3B', secondary: '#FBC02D' } },
      { name: 'MI', colors: { primary: '#1976D2', secondary: '#1565C0' } },
      { name: 'RCB', colors: { primary: '#D32F2F', secondary: '#C62828' } },
      { name: 'KKR', colors: { primary: '#37474F', secondary: '#263238' } },
      { name: 'DC', colors: { primary: '#7E57C2', secondary: '#5E35B1' } },
      { name: 'SRH', colors: { primary: '#FF6F00', secondary: '#E65100' } },
      { name: 'PBKS', colors: { primary: '#E91E63', secondary: '#C2185B' } },
      { name: 'RR', colors: { primary: '#FF9800', secondary: '#F57C00' } }
    ];
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== ERROR HANDLING ==============

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    path: req.path 
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// ============== SERVER START ==============

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   IPL Top Trumps 2026 API Server      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 ${starterCards.cards.length} starter cards loaded`);
  console.log(`🎮 Game modes: powerplay, death_over`);
  console.log('');
  console.log('API Endpoints:');
  console.log('  GET  /api/health              - Health check');
  console.log('  GET  /api/cards               - List all cards');
  console.log('  GET  /api/cards/:cardId       - Get card details');
  console.log('  GET  /api/cards/:cardId/design - Get card SVG');
  console.log('  POST /api/games/create        - Create new game');
  console.log('  POST /api/games/:gameId/assign-deck - Assign cards');
  console.log('  POST /api/games/:gameId/play-round  - Play round');
  console.log('  GET  /api/games/:gameId       - Get game state');
  console.log('  GET  /api/games/:gameId/summary - Get summary');
  console.log('  GET  /api/game-stats          - Available stats');
  console.log('  GET  /api/teams               - Team colors');
  console.log('');
});

module.exports = app;
