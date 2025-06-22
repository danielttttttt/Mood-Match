import { gameState } from './modules/state.js';
import { soundManager } from './modules/soundManager.js';
import { GameBoard } from './modules/gameBoard.js';
import { formatTime } from './modules/utils.js';

let gameBoard;

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing game...');
    
    // Initialize game board
    gameBoard = new GameBoard('game-board');
    console.log('Game board initialized:', gameBoard);
    
    // Set up UI event listeners
    setupEventListeners();
    
    // Update UI with initial state
    updateUI();
    
    // Show initial message
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = 'Click New Game to start!';
      messageElement.className = 'message show';
    }
    
    console.log('Game initialization complete');
  } catch (error) {
    console.error('Error initializing game:', error);
  }
});

// Set up all UI event listeners
function setupEventListeners() {
  // Settings panel toggle
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('show');
  });
  
  // Sound toggle
  const soundToggle = document.getElementById('sound-toggle');
  soundToggle.checked = gameState.settings.sound;
  
  soundToggle.addEventListener('change', (e) => {
    gameState.updateSettings({ sound: e.target.checked });
  });
  
  // Theme selection
  const themeSelect = document.getElementById('theme');
  themeSelect.value = gameState.settings.theme;
  
  themeSelect.addEventListener('change', (e) => {
    gameState.updateSettings({ theme: e.target.value });
    // Reload the game with the new theme
    window.location.reload();
  });
  
  // New Game button
  const newGameBtn = document.getElementById('new-game');
  if (!newGameBtn) {
    console.error('New Game button not found!');
    return;
  }
  
  console.log('Adding click event listener to New Game button');
  newGameBtn.addEventListener('click', () => {
    try {
      console.log('New Game button clicked');
      
      // Ensure gameBoard is initialized
      if (!gameBoard) {
        console.log('Initializing new game board...');
        gameBoard = new GameBoard('game-board');
      }
      
      // Get the current settings
      const difficulty = document.getElementById('difficulty').value;
      const theme = document.getElementById('theme').value;
      
      console.log('Current settings - Difficulty:', difficulty, 'Theme:', theme);
      
      // Update settings if needed
      if (difficulty !== gameState.settings.difficulty || theme !== gameState.settings.theme) {
        console.log('Updating game settings...');
        gameState.updateSettings({ difficulty, theme });
        // If theme or difficulty changed, reload the page to apply changes
        console.log('Reloading page to apply new settings...');
        window.location.reload();
        return;
      }
      
      console.log('Starting new game...');
      
      // Start a new game with the existing board
      gameBoard.startNewGame();
      
      // Update UI
      updateUI();
      
      // Play sound
      soundManager.play('flip');
      
      console.log('New game started successfully');
    } catch (error) {
      console.error('Error starting new game:', error);
      
      // Try to show error message to user
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'Error starting new game. Please refresh the page.';
        messageElement.className = 'message show error';
      }
    }
  });
  
  // Difficulty selection
  const difficultySelect = document.getElementById('difficulty');
  difficultySelect.value = gameState.settings.difficulty;
  
  difficultySelect.addEventListener('change', (e) => {
    gameState.updateSettings({ difficulty: e.target.value });
    // Reload the game with the new difficulty
    window.location.reload();
  });
  
  // Handle window resize for responsive design
  window.addEventListener('resize', handleResize);
  
  // Preload sounds
  soundManager.preload();
}

// Update UI elements based on game state
function updateUI() {
  // Update best score display
  const bestScore = gameState.stats.bestScore;
  const bestScoreElement = document.getElementById('best-score');
  if (bestScoreElement) {
    bestScoreElement.textContent = bestScore ? formatTime(bestScore) : '--:--';
  }
  
  // Update other UI elements as needed
  updateStarRating();
}

// Update star rating display
function updateStarRating() {
  const starElements = document.querySelectorAll('.star');
  const stars = calculateStars();
  
  starElements.forEach((star, index) => {
    if (index < stars) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
  
  document.querySelector('.star-rating').setAttribute('aria-label', `Star rating: ${stars} out of 3`);
}

// Calculate stars based on moves and difficulty
function calculateStars() {
  const { moves } = gameState;
  const { maxMoves } = gameState.currentDifficulty;
  
  if (moves <= maxMoves * 0.4) return 3;
  if (moves <= maxMoves * 0.7) return 2;
  if (moves <= maxMoves) return 1;
  return 0;
}

// Handle window resize for responsive design
function handleResize() {
  // Adjust card sizes based on viewport
  const cards = document.querySelectorAll('.card');
  const container = document.querySelector('.game-board');
  
  if (!container || !cards.length) return;
  
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const numColumns = container.classList.contains('hard') ? 6 : 4;
  const numRows = Math.ceil(cards.length / numColumns);
  
  // Calculate card size based on container dimensions
  const cardWidth = Math.min(
    (containerWidth - ((numColumns - 1) * 12)) / numColumns, // 12px gap
    (containerHeight - ((numRows - 1) * 12)) / numRows
  );
  
  // Apply card size
  cards.forEach(card => {
    card.style.width = `${cardWidth}px`;
    card.style.height = `${cardWidth}px`;
  });
}

// Initialize the game
function initGame() {
  // Any additional initialization can go here
  handleResize();
}

// Start the application
initGame();
