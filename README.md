# 🎮 Memory Match Game

A fun and challenging memory matching card game built with vanilla JavaScript, HTML5, and CSS3. Test your memory skills with different themes and difficulty levels!

[![Play Now](https://img.shields.io/badge/Play-Now-brightgreen?style=for-the-badge)](https://your-deployed-app-url.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎴 Multiple difficulty levels (Easy, Medium, Hard)
- 🎨 Multiple card themes (Emoji, Animals, Food, etc.)
- 🎵 Sound effects and background music
- 🌙 Dark/Light mode
- 📱 Fully responsive design
- ⚡ Progressive Web App (PWA) support
- 📊 Track your best scores
- ⭐ Star rating based on performance

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for initial load)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/memory-match-game.git
   cd memory-match-game
   ```

2. Open `index.html` in your browser:
   ```bash
   # For Windows
   start index.html
   
   # For macOS
   open index.html
   
   # Or simply double-click the file in your file explorer
   ```

## 🎮 How to Play

1. Click on any card to flip it over
2. Find and match pairs of cards with the same symbol
3. Try to match all pairs in the fewest moves and shortest time
4. Earn stars based on your performance
5. Beat your high score!

## 🛠️ Development

### Project Structure

```
memory-match-game/
├── src/
│   ├── css/
│   │   └── main.css        # Main styles
│   └── js/
│       ├── modules/      # Game modules
│       │   ├── card.js     # Card logic
│       │   ├── config.js   # Game configuration
│       │   ├── gameBoard.js # Game board management
│       │   ├── soundManager.js # Audio handling
│       │   ├── state.js    # Game state management
│       │   └── utils.js    # Utility functions
│       └── app.js          # Main application entry point
├── assets/                 # Images, sounds, etc.
├── index.html             # Main HTML file
├── manifest.json          # Web app manifest
├── sw.js                 # Service Worker
└── README.md             # This file
```

### Building

This is a vanilla JavaScript project with no build step required. However, if you want to optimize for production:

1. Minify CSS and JavaScript
2. Optimize images
3. Generate service worker with Workbox

## 📱 Progressive Web App

This game is a Progressive Web App (PWA) that can be installed on your device:

- **Installation**: Click the install button in your browser's address bar (Chrome/Edge) or add to home screen (Safari on iOS)
- **Offline Play**: Play the game even without an internet connection after the first load
- **App-like Experience**: Full-screen mode and standalone display

## 🎨 Customization

### Themes

You can create custom themes by adding new theme objects to the `themes` array in `src/js/modules/config.js`.

### Difficulty Levels

Adjust the game difficulty by modifying the grid size in the settings or by editing the `difficultyLevels` object in `src/js/modules/config.js`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Google Fonts](https://fonts.google.com/) for the Poppins font
- [EmojiOne](https://www.joypixels.com/) for emoji assets
- [Font Awesome](https://fontawesome.com/) for icons
- All the open-source projects that made this possible

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

Project Link: [https://github.com/yourusername/memory-match-game](https://github.com/yourusername/memory-match-game)

---

<div align="center">
  Made with ❤️ and JavaScript
</div> Match Game

A fun and interactive memory matching card game built with vanilla JavaScript, HTML, and CSS.

## Features

- Multiple difficulty levels
- Different card themes
- Sound effects
- Responsive design
- Keyboard accessible
- Score tracking

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Select your preferred settings and click "New Game"

## Development

### Project Structure

- `index.html` - Main HTML file
- `styles.css` - All styles
- `script.js` - Game logic
- `assets/` - Images and sounds

### Code Style

- Follow JavaScript Standard Style
- Use semantic HTML5
- BEM naming convention for CSS

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
