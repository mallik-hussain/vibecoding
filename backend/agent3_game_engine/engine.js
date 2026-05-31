// Agent 3: Game Engine
// Implements 1v1 card game logic

class GameEngine {
  constructor() {
    this.games = new Map();
    this.modes = {
      POWERPLAY: 'powerplay',
      DEATH_OVER: 'death_over'
    };
  }

  /**
   * Create a new game session
   * @param {string} gameId - Unique game identifier
   * @param {string} player1 - Player 1 name
   * @param {string} player2 - Player 2 name
   * @param {string} mode - Game mode (powerplay or death_over)
   * @returns {Object} Game state object
   */
  createGame(gameId, player1, player2, mode = 'powerplay') {
    if (this.games.has(gameId)) {
      throw new Error('Game already exists');
    }

    const gameState = {
      id: gameId,
      players: [
        { name: player1, deck: [], hand: null, wins: 0 },
        { name: player2, deck: [], hand: null, wins: 0 }
      ],
      mode: mode,
      currentRound: 0,
      status: 'waiting', // waiting, active, completed
      winner: null,
      history: [],
      startTime: Date.now()
    };

    this.games.set(gameId, gameState);
    return gameState;
  }

  /**
   * Assign cards to player decks
   * @param {string} gameId - Game ID
   * @param {number} playerIndex - 0 or 1
   * @param {Array} cards - Array of card objects
   */
  assignDeck(gameId, playerIndex, cards) {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');
    
    game.players[playerIndex].deck = [...cards];
    game.players[playerIndex].hand = cards[0];
  }

  /**
   * Play a round of Top Trumps
   * @param {string} gameId - Game ID
   * @param {string} stat - Stat name to compare (runs, wickets, average, strikeRate)
   * @returns {Object} Round result
   */
  playRound(gameId, stat) {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status !== 'active') throw new Error('Game is not active');

    const p1 = game.players[0];
    const p2 = game.players[1];

    if (!p1.hand || !p2.hand) throw new Error('Invalid game state');

    // Get stat values
    const p1Stat = p1.hand.stats[stat];
    const p2Stat = p2.hand.stats[stat];

    // Apply Vizag bonus for specific stats
    const p1Value = this.calculateStatValue(p1Stat, p1.hand.vizagBonus, game.mode);
    const p2Value = this.calculateStatValue(p2Stat, p2.hand.vizagBonus, game.mode);

    let winner = null;
    if (p1Value > p2Value) {
      winner = 0;
      p1.wins++;
    } else if (p2Value > p1Value) {
      winner = 1;
      p2.wins++;
    }

    // Record round history
    const roundData = {
      round: game.currentRound,
      stat: stat,
      p1Card: p1.hand.name,
      p2Card: p2.hand.name,
      p1Value: p1Value,
      p2Value: p2Value,
      winner: winner,
      timestamp: Date.now()
    };

    game.history.push(roundData);

    // Draw next cards
    p1.deck.shift();
    p2.deck.shift();
    p1.hand = p1.deck[0] || null;
    p2.hand = p2.deck[0] || null;

    game.currentRound++;

    // Check if game is over
    if (!p1.hand || !p2.hand) {
      game.status = 'completed';
      game.winner = p1.wins > p2.wins ? 0 : (p2.wins > p1.wins ? 1 : null);
    }

    return roundData;
  }

  /**
   * Calculate stat value with mode and bonus modifiers
   * @param {number} baseStat - Base stat value
   * @param {number} vizagBonus - Vizag bonus multiplier
   * @param {string} mode - Game mode
   * @returns {number} Modified stat value
   */
  calculateStatValue(baseStat, vizagBonus, mode) {
    let value = baseStat * vizagBonus;

    if (mode === this.modes.POWERPLAY) {
      // Powerplay mode: 1.5x multiplier for all stats
      value *= 1.5;
    } else if (mode === this.modes.DEATH_OVER) {
      // Death Over mode: Higher variance, bonus on high values
      value *= Math.random() > 0.5 ? 2.0 : 1.0;
    }

    return Math.round(value * 100) / 100;
  }

  /**
   * Get current game state
   * @param {string} gameId - Game ID
   * @returns {Object} Game state
   */
  getGameState(gameId) {
    return this.games.get(gameId) || null;
  }

  /**
   * Get game summary
   * @param {string} gameId - Game ID
   * @returns {Object} Game summary
   */
  getGameSummary(gameId) {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');

    return {
      id: game.id,
      status: game.status,
      mode: game.mode,
      winner: game.winner ? game.players[game.winner].name : 'Draw',
      p1: {
        name: game.players[0].name,
        wins: game.players[0].wins,
        cardsRemaining: game.players[0].deck.length
      },
      p2: {
        name: game.players[1].name,
        wins: game.players[1].wins,
        cardsRemaining: game.players[1].deck.length
      },
      totalRounds: game.currentRound,
      duration: Date.now() - game.startTime,
      history: game.history
    };
  }

  /**
   * Get all stat categories available for comparison
   * @returns {Array} Array of stat names
   */
  getAvailableStats() {
    return ['runsScored', 'wickets', 'matches', 'average', 'strikeRate'];
  }
}

module.exports = GameEngine;

// Main execution
if (require.main === module) {
  const engine = new GameEngine();
  console.log('✅ Game Engine Agent Initialized');
  console.log('Available stats:', engine.getAvailableStats());
}
