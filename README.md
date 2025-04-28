# 🎮 Tic Tac Toe Game
A modern, responsive implementation of the classic Tic Tac Toe game with an AI opponent. ✨

![Tic Tac Toe Game Screenshot](screenshot.png)

## 🚀 Features

- 👥 Player vs Player and Player vs Computer modes
- 🤖 Three AI difficulty levels:
  - 🟢 Easy: Makes random moves 60% of the time
  - 🟡 Normal: Occasionally makes suboptimal moves
  - 🔴 Hard: Uses perfect strategy (unbeatable)
- 📱 Responsive design that works on both desktop and mobile
- 🎉 Beautiful animations and celebrations for wins and ties
- 👆 Touch-friendly interface
- 🎨 Modern UI with clean aesthetics

## 🗂️ Code Organization

The project follows clean code principles:

1. **📝 Constants Over Magic Numbers**
   - All configuration values are stored in `config.js`
   - No hard-coded values in the code

2. **🧩 Single Responsibility**
   - Each class has a specific purpose
   - Functions are small and focused
   - Clear separation of concerns

3. **📂 Clean Structure**
   - Modular organization
   - Consistent file naming
   - Logical component hierarchy

4. **💬 Smart Comments**
   - Self-documenting code
   - Comments explain "why" not "what"
   - Clear documentation for complex algorithms

5. **♻️ DRY (Don't Repeat Yourself)**
   - Reusable functions
   - Shared configuration
   - Consistent patterns

## ⚙️ Game Engine

The game engine (`GameEngine.js`) manages:
- 🎲 Game state
- ✅ Move validation
- 🏆 Win detection
- 🔄 Game mode switching

## 🧠 AI Player

The AI player (`AIPlayer.js`) implements:
- 🧮 Minimax algorithm with alpha-beta pruning
- 🎚️ Multiple difficulty levels
- 🎯 Perfect play strategy for hard mode
- ⚡ Optimized first move responses

## 🖥️ UI Controller

The UI controller (`UIController.js`) handles:
- 🖱️ User interactions
- 🎭 Game board updates
- ✨ Animations and effects
- 📱 Mobile responsiveness

## 🏁 Getting Started

1. 📥 Clone the repository
2. 🌐 Open `index.html` in a modern web browser
3. 🎮 Start playing!

## 🌍 Browser Support

- 🌊 Chrome (latest)
- 🦊 Firefox (latest)
- 🍎 Safari (latest)
- 🔷 Edge (latest)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 