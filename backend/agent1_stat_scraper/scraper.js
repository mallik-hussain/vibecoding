// Agent 1: IPL Stat Scraper
// Fetches and validates player statistics

const axios = require('axios');

class StatScraper {
  constructor() {
    this.baseURL = 'https://api.cricapi.com/v1';
    this.apiKey = process.env.CRICKET_API_KEY;
  }

  /**
   * Fetch IPL player statistics
   * @param {string} playerId - Cricket API player ID
   * @returns {Promise<Object>} Player stats object
   */
  async fetchPlayerStats(playerId) {
    try {
      const response = await axios.get(`${this.baseURL}/players`, {
        params: {
          apikey: this.apiKey,
          id: playerId
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching stats for player ${playerId}:`, error.message);
      throw error;
    }
  }

  /**
   * Scrape multiple player stats
   * @param {Array<string>} playerIds - Array of player IDs
   * @returns {Promise<Array>} Array of player stats
   */
  async scrapeMultiplePlayers(playerIds) {
    const players = [];
    for (const id of playerIds) {
      try {
        const stats = await this.fetchPlayerStats(id);
        players.push(stats);
      } catch (error) {
        console.warn(`Skipping player ${id} due to error`);
      }
    }
    return players;
  }

  /**
   * Calculate Vizag Performance Bonus
   * Special multiplier for players with strong Vizag venue stats
   * @param {Object} playerStats - Player statistics object
   * @returns {number} Bonus multiplier (1.0 - 1.5)
   */
  calculateVizagBonus(playerStats) {
    const vizagMatches = playerStats.vizag_matches || 0;
    const vizagAverage = playerStats.vizag_average || 0;
    
    if (vizagMatches === 0) return 1.0;
    
    // Bonus calculation: 1.0 + (venue_average / 100) * 0.5
    const bonus = 1.0 + Math.min((vizagAverage / 100) * 0.5, 0.5);
    return Math.round(bonus * 100) / 100;
  }

  /**
   * Format player data for card generation
   * @param {Object} rawStats - Raw stats from API
   * @returns {Object} Formatted card data
   */
  formatCardData(rawStats) {
    return {
      id: rawStats.id,
      name: rawStats.name,
      role: rawStats.role,
      team: rawStats.team,
      stats: {
        runsScored: rawStats.runs_scored || 0,
        wickets: rawStats.wickets || 0,
        matches: rawStats.matches || 0,
        average: rawStats.average || 0,
        strikeRate: rawStats.strike_rate || 0
      },
      vizagBonus: this.calculateVizagBonus(rawStats)
    };
  }
}

// Export for use in other modules
module.exports = StatScraper;

// Main execution
if (require.main === module) {
  const scraper = new StatScraper();
  console.log('✅ Stat Scraper Agent Initialized');
  console.log('Ready to fetch IPL player statistics');
}
