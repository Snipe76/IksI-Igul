# Tic Tac Toe Game

A modern, responsive implementation of the classic Tic Tac Toe game built with HTML, CSS, and JavaScript.

![Tic Tac Toe Screenshot](screenshot.png)

## Features

- 🎮 Clean and modern user interface
- 📱 Fully responsive design - works perfectly on all mobile devices
- 🤖 AI opponent with multiple difficulty levels
- ✨ Smooth animations and visual feedback
- 🎯 Win detection with highlighted winning line
- 🤝 Tie game detection with unique animations
- 🔄 Easy game reset functionality
- 🎨 Distinctive player colors and animations
- 🌈 Confetti celebrations for wins
- 📱 Optimized mobile experience:
  - Dynamic viewport handling
  - Touch-friendly controls
  - Mobile-specific animations
  - Prevent unwanted zooming
  - Proper button states and feedback

## Live Demo

You can play the game here: https://snipe76.github.io/IksI-Igul/

## Getting Started

### Prerequisites

No special prerequisites are needed! Just a modern web browser.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Snipe76/IksI-Igul.git
   ```

2. Open `index.html` in your web browser

That's it! No build process or dependencies required.

## How to Play

1. Choose your game mode: vs Player or vs Computer
2. The game starts with player X
3. Players take turns clicking/tapping on empty squares
4. First to get three in a row (horizontal, vertical, or diagonal) wins
5. If all squares are filled with no winner, it's a tie
6. Use the Reset button to start a new game anytime

## Technical Details

The project uses modern web technologies and best practices:

- Vanilla JavaScript with modular code structure
- Modern CSS features:
  - CSS Grid for game board
  - CSS Variables for theming
  - Dynamic viewport units (dvh) for mobile
  - Fluid typography with clamp()
  - Modern animations and transitions
- Mobile-first responsive design
- Semantic HTML with accessibility features
- Touch event handling with mobile optimizations

## Project Structure

```
IksI-Igul/
├── css/
│   └── style.css      # Styles and animations
├── javascript/
│   ├── game.js        # Core game logic
│   ├── ai-player.js   # AI opponent logic
│   └── version.js     # Version tracking
├── index.html
└── README.md
```

## Development

The project uses vanilla JavaScript with no external dependencies except for the confetti effect. The code is organized into separate files for better maintainability:

- `index.html`: Main HTML structure with semantic markup
- `style.css`: Modern CSS with responsive design and animations
- `game.js`: Game logic, event handlers, and mobile optimizations
- `ai-player.js`: AI opponent implementation with multiple difficulty levels
- `version.js`: Automatic version tracking functionality

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## Author

**Evgeniy Gutman**

## Version History

Check the version number in the footer of the game. The version number is automatically updated with each commit.

## License

This project is open source and available under the [MIT License](LICENSE). 