// Agent 2: Visual Design Agent via Google Gemini
// Generates card designs and visual representations

const { GoogleGenerativeAI } = require('@google/generative-ai');

class VisualDesignAgent {
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = 'gemini-pro-vision';
  }

  /**
   * Generate card design description via Gemini
   * @param {Object} playerData - Player statistics and info
   * @returns {Promise<string>} Design description
   */
  async generateCardDesign(playerData) {
    try {
      const prompt = `
Create a cricket Top Trumps card design description for:
Name: ${playerData.name}
Role: ${playerData.role}
Team: ${playerData.team}
Stats:
- Runs: ${playerData.stats.runsScored}
- Wickets: ${playerData.stats.wickets}
- Matches: ${playerData.stats.matches}
- Average: ${playerData.stats.average}
- Strike Rate: ${playerData.stats.strikeRate}
Vizag Bonus: ${playerData.vizagBonus}x

Generate a vibrant, modern card design description that includes:
1. Color scheme based on team colors
2. Layout of stats
3. Visual elements and icons
4. Typography suggestions
5. Special effects for Vizag Bonus
`;

      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating design:', error.message);
      throw error;
    }
  }

  /**
   * Generate SVG card template
   * @param {Object} playerData - Player data
   * @returns {string} SVG markup
   */
  generateSVGCard(playerData) {
    const cardWidth = 300;
    const cardHeight = 400;
    const teamColors = this.getTeamColors(playerData.team);

    return `
<?xml version="1.0" encoding="UTF-8"?>
<svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${teamColors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${teamColors.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="${cardWidth}" height="${cardHeight}" fill="url(#grad)" rx="15"/>
  
  <!-- Header Section -->
  <rect width="${cardWidth}" height="80" fill="rgba(0,0,0,0.3)" rx="15"/>
  <text x="20" y="35" font-size="24" font-weight="bold" fill="white">${playerData.name}</text>
  <text x="20" y="60" font-size="14" fill="rgba(255,255,255,0.9)">${playerData.role} • ${playerData.team}</text>
  
  <!-- Stats Section -->
  <text x="20" y="120" font-size="12" fill="rgba(255,255,255,0.8)" font-weight="bold">STATS</text>
  
  <!-- Stat Boxes -->
  <g id="stat-boxes">
    <rect x="20" y="140" width="130" height="60" fill="rgba(255,255,255,0.15)" rx="8"/>
    <text x="30" y="160" font-size="10" fill="rgba(255,255,255,0.8)">Runs</text>
    <text x="30" y="185" font-size="20" font-weight="bold" fill="white">${playerData.stats.runsScored}</text>
    
    <rect x="160" y="140" width="130" height="60" fill="rgba(255,255,255,0.15)" rx="8"/>
    <text x="170" y="160" font-size="10" fill="rgba(255,255,255,0.8)">Wickets</text>
    <text x="170" y="185" font-size="20" font-weight="bold" fill="white">${playerData.stats.wickets}</text>
    
    <rect x="20" y="220" width="130" height="60" fill="rgba(255,255,255,0.15)" rx="8"/>
    <text x="30" y="240" font-size="10" fill="rgba(255,255,255,0.8)">Average</text>
    <text x="30" y="265" font-size="20" font-weight="bold" fill="white">${playerData.stats.average.toFixed(1)}</text>
    
    <rect x="160" y="220" width="130" height="60" fill="rgba(255,255,255,0.15)" rx="8"/>
    <text x="170" y="240" font-size="10" fill="rgba(255,255,255,0.8)">SR</text>
    <text x="170" y="265" font-size="20" font-weight="bold" fill="white">${playerData.stats.strikeRate.toFixed(1)}</text>
  </g>
  
  <!-- Vizag Bonus Badge -->
  <circle cx="260" cy="320" r="35" fill="rgba(255, 215, 0, 0.9)"/>
  <text x="260" y="315" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">Vizag</text>
  <text x="260" y="335" text-anchor="middle" font-size="16" font-weight="bold" fill="#000">${playerData.vizagBonus}x</text>
</svg>
    `;
  }

  /**
   * Get team color scheme
   * @param {string} team - Team name
   * @returns {Object} Color object with primary and secondary
   */
  getTeamColors(team) {
    const teamColorMap = {
      'CSK': { primary: '#FFEB3B', secondary: '#FBC02D' },
      'MI': { primary: '#1976D2', secondary: '#1565C0' },
      'RCB': { primary: '#D32F2F', secondary: '#C62828' },
      'KKR': { primary: '#37474F', secondary: '#263238' },
      'DC': { primary: '#7E57C2', secondary: '#5E35B1' },
      'SRH': { primary: '#FF6F00', secondary: '#E65100' },
      'PBKS': { primary: '#E91E63', secondary: '#C2185B' },
      'RR': { primary: '#FF9800', secondary: '#F57C00' }
    };
    return teamColorMap[team] || { primary: '#666', secondary: '#333' };
  }
}

module.exports = VisualDesignAgent;

// Main execution
if (require.main === module) {
  const agent = new VisualDesignAgent();
  console.log('✅ Visual Design Agent Initialized');
  console.log('Ready to generate card designs');
}
