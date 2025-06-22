import { gameState } from './state.js';
import { soundManager } from './soundManager.js';
import { Card } from './card.js';
import { shuffleArray, formatTime } from './utils.js';
import { DIFFICULTY_LEVELS, THEMES } from './config.js';

export class GameBoard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cards = [];
    this.timerInterval = null;
    this.initialize();
  }

  initialize() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'game-board';
    
    const difficulty = gameState.currentDifficulty;
    if (difficulty.gridColumns === 6) {
      this.container.classList.add('hard');
    }
    
    this.cards = this.createCards();
    this.cards.forEach(card => {
      this.container.appendChild(card.element);
    });
  }

  createCards() {
    const { pairs } = gameState.currentDifficulty;
    const theme = THEMES[gameState.settings.theme] || THEMES.emojis;
    
    // Get pairs of emojis
    const emojis = [];
    for (let i = 0; i < pairs; i++) {
      const emoji = theme[i % theme.length];
      emojis.push(emoji, emoji); // Add pair
    }
    
    // Shuffle and create card instances
    return shuffleArray(emojis).map((emoji, index) => new Card(emoji, index));
  }

  setupEventListeners() {
    // Handle card matching
    document.addEventListener('cardFlipped', this.handleCardFlipped.bind(this));
    
    // Handle game controls
    document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
  }

  handleCardFlipped(event) {
    const { card } = event.detail;
    
    if (!gameState.hasFlippedCard) {
      // First card flipped
      gameState.hasFlippedCard = true;
      gameState.firstCard = card;
      return;
    }
    
    // Second card flipped
    gameState.secondCard = card;
    gameState.incrementMoves();
    this.updateMovesDisplay();
    this.checkForMatch();
  }

  checkForMatch() {
    const { firstCard, secondCard } = gameState;
    const isMatch = firstCard.emoji === secondCard.emoji;
    
    if (isMatch) {
      this.handleMatch();
    } else {
      this.handleMismatch();
    }
    
    this.checkGameOver();
  }

  handleMatch() {
    const { firstCard, secondCard } = gameState;
    firstCard.match();
    secondCard.match();
    
    soundManager.play('match');
    gameState.incrementMatches();
    
    this.resetTurn();
  }

  handleMismatch() {
    gameState.lockBoard = true;
    soundManager.play('flip');
    
    setTimeout(() => {
      gameState.firstCard.unflip();
      gameState.secondCard.unflip();
      this.resetTurn();
    }, 1000);
  }

  resetTurn() {
    gameState.hasFlippedCard = false;
    gameState.lockBoard = false;
    gameState.firstCard = null;
    gameState.secondCard = null;
  }

  checkGameOver() {
    const { matches, currentDifficulty } = gameState;
    
    if (matches === currentDifficulty.pairs) {
      this.endGame();
    } else if (gameState.moves >= currentDifficulty.maxMoves) {
      this.gameOver();
    }
  }

  startNewGame() {
    console.log('Starting new game in GameBoard...');
    
    try {
      // Stop any running timers
      console.log('Stopping timer...');
      this.stopTimer();
      
      // Reset game state
      console.log('Resetting game state...');
      gameState.resetGameState();
      
      // Clear the game board
      console.log('Clearing game board...');
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }
      
      // Recreate cards
      console.log('Creating new cards...');
      this.cards = this.createCards();
      
      // Add cards to the board
      console.log('Adding cards to board...');
      this.cards.forEach(card => {
        this.container.appendChild(card.element);
      });
      
      // Start the timer
      console.log('Starting timer...');
      this.startTimer();
      
      // Update the UI
      console.log('Updating UI...');
      this.updateUI();
      
      // Show start message
      const messageElement = document.getElementById('message');
      if (messageElement) {
        console.log('Showing start message...');
        messageElement.textContent = 'Game started! Find all matching pairs.';
        messageElement.className = 'message show';
        // Hide message after 3 seconds
        setTimeout(() => {
          if (messageElement) {
            messageElement.className = 'message';
          }
        }, 3000);
      }
      
      console.log('New game started successfully');
      return true;
    } catch (error) {
      console.error('Error in startNewGame:', error);
      
      // Show error message
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'Error starting game. Please try again.';
        messageElement.className = 'message show error';
      }
      
      return false;
    }
  }

  togglePause() {
    gameState.togglePause();
    
    if (gameState.isPaused) {
      this.stopTimer();
      document.getElementById('pause-btn').textContent = '▶️';
      document.getElementById('message').textContent = 'Game Paused';
    } else {
      this.startTimer();
      document.getElementById('pause-btn').textContent = '⏸️';
      document.getElementById('message').textContent = 'Game Resumed';
      setTimeout(() => {
        document.getElementById('message').textContent = 'Find all matching pairs!';
      }, 1000);
    }
  }

  showHint() {
    if (gameState.lockBoard || gameState.isPaused) return;
    
    // Find all unflipped, unmatched cards
    const availableCards = this.cards.filter(card => !card.isFlipped && !card.isMatched);
    if (availableCards.length < 2) return;
    
    // Find a matching pair
    const emojiMap = new Map();
    let matchFound = false;
    
    for (const card of availableCards) {
      if (emojiMap.has(card.emoji)) {
        // Found a match
        const firstCard = emojiMap.get(card.emoji);
        this.highlightCards([firstCard, card]);
        matchFound = true;
        break;
      }
      emojiMap.set(card.emoji, card);
    }
    
    if (!matchFound && availableCards.length >= 2) {
      // No matches found, just highlight two random cards
      const randomIndices = this.getRandomIndices(availableCards.length, 2);
      const randomCards = randomIndices.map(i => availableCards[i]);
      this.highlightCards(randomCards);
    }
  }

  highlightCards(cards) {
    soundManager.play('hint');
    
    cards.forEach(card => {
      card.element.classList.add('hint');
      setTimeout(() => {
        card.element.classList.remove('hint');
      }, 1000);
    });
  }

  getRandomIndices(max, count) {
    const indices = [];
    while (indices.length < count) {
      const randomIndex = Math.floor(Math.random() * max);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices;
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      gameState.incrementSeconds();
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = formatTime(gameState.seconds);
    }
  }

  updateMovesDisplay() {
    const movesElement = document.getElementById('moves');
    if (movesElement) {
      movesElement.textContent = gameState.moves;
    }
  }

  updateUI() {
    this.updateTimerDisplay();
    this.updateMovesDisplay();
    // Update other UI elements as needed
  }

  endGame() {
    this.stopTimer();
    soundManager.play('win');
    
    const isNewBest = gameState.updateBestScore();
    const message = isNewBest 
      ? '🎉 New Best Score! 🎉' 
      : 'Congratulations! You won!';
    
    document.getElementById('message').textContent = message;
    this.showConfetti();
  }

  gameOver() {
    this.stopTimer();
    document.getElementById('message').textContent = 'Game Over! Try again!';
  }

  showConfetti() {
    // Add confetti animation
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 5}s`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confettiContainer.appendChild(confetti);
    }
    
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  }
}
