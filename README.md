# IPL Top Trumps — 2026 Cards

A modern take on the classic card game using real-world stats and "Vizag Performance Bonuses."

## Project Overview

**Concept:** Build an interactive web app for playing Top Trumps with IPL 2026 player cards featuring real stats and special performance bonuses.

**Target:** Mobile-first web application with 8 starter cards, QR scanning, and multiple game modes.

## Technical Architecture

### Three-Agent Workflow

1. **Agent 1: Stat Scraper**
   - Scrapes IPL player statistics
   - Fetches real-time data
   - Validates and formats stat data

2. **Agent 2: Visual Design Agent (Gemini)**
   - Generates card designs via Gemini API
   - Creates visual representations
   - Handles card styling and layout

3. **Agent 3: Game Engine**
   - Implements 1v1 game logic
   - Manages game states
   - Calculates winners and scoring

## Features

- ✅ **8 Starter Cards** - Pre-configured IPL players
- 🔲 **QR Scanning** - Quick card access via QR codes
- ⚡ **Powerplay Mode** - Fast-paced gameplay with multipliers
- 🌙 **Death Over Mode** - High-stakes endgame scenarios
- 📱 **Mobile Optimized** - Responsive web design
- 📊 **Vizag Performance Bonuses** - Special stat modifiers

## Assigned Teams

- **Team 7** - Pranam
- **Team 13** - Ananta
- **Team 9** - Harsha

## Project Structure

```
vibecoding/
├── README.md
├── backend/
│   ├── agent1_stat_scraper/
│   ├── agent2_visual_design/
│   └── agent3_game_engine/
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── data/
│   └── starter_cards.json
└── config/
    └── env.example
```

## Getting Started

(To be implemented)

## Setup Instructions

(To be implemented)

## Game Rules

(To be implemented)

## API Documentation

(To be implemented)

## Contributing

Assign work to respective teams and document changes.
