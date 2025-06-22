import { DIFFICULTY_LEVELS, LOCAL_STORAGE_KEYS } from './config.js';

class GameState {
  constructor() {
    this.state = {
      cards: [],
      firstCard: null,
      secondCard: null,
      hasFlippedCard: false,
      lockBoard: false,
      matches: 0,
      moves: 0,
      seconds: 0,
      timerInterval: null,
      isPaused: false,
      stars: 3,
      settings: {
        difficulty: 'medium',
        theme: 'emojis',
        sound: true
      },
      stats: {
        bestScore: null,
        gamesPlayed: 0
      }
    };
    this.loadSettings();
    this.loadStats();
  }

  // Getters
  get cards() { return this.state.cards; }
  get firstCard() { return this.state.firstCard; }
  get secondCard() { return this.state.secondCard; }
  get hasFlippedCard() { return this.state.hasFlippedCard; }
  get lockBoard() { return this.state.lockBoard; }
  get matches() { return this.state.matches; }
  get moves() { return this.state.moves; }
  get seconds() { return this.state.seconds; }
  get isPaused() { return this.state.isPaused; }
  get stars() { return this.state.stars; }
  get settings() { return { ...this.state.settings }; }
  get stats() { return { ...this.state.stats }; }
  get currentDifficulty() { return DIFFICULTY_LEVELS[this.state.settings.difficulty]; }

  // Setters
  set cards(value) { this.state.cards = value; }
  set firstCard(card) { this.state.firstCard = card; }
  set secondCard(card) { this.state.secondCard = card; }
  set hasFlippedCard(value) { this.state.hasFlippedCard = value; }
  set lockBoard(value) { this.state.lockBoard = value; }
  set matches(value) { this.state.matches = value; }
  set moves(value) { this.state.moves = value; }
  set seconds(value) { this.state.seconds = value; }
  set isPaused(value) { this.state.isPaused = value; }
  set stars(value) { this.state.stars = Math.max(0, Math.min(3, value)); }

  // Methods
  incrementMoves() { this.state.moves++; }
  incrementMatches() { this.state.matches++; }
  incrementSeconds() { this.state.seconds++; }
  togglePause() { this.state.isPaused = !this.state.isPaused; }

  resetGameState() {
    this.state.matches = 0;
    this.state.moves = 0;
    this.state.seconds = 0;
    this.state.stars = 3;
    this.state.hasFlippedCard = false;
    this.state.lockBoard = false;
    this.state.firstCard = null;
    this.state.secondCard = null;
    this.state.isPaused = false;
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveSettings();
  }

  updateBestScore() {
    const currentBest = this.state.stats.bestScore;
    if (!currentBest || this.state.seconds < currentBest) {
      this.state.stats.bestScore = this.state.seconds;
      this.saveStats();
      return true;
    }
    return false;
  }

  saveSettings() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(this.state.settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  loadSettings() {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.state.settings = { ...this.state.settings, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  saveStats() {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.BEST_SCORE,
        JSON.stringify({
          bestScore: this.state.stats.bestScore
        })
      );
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  }

  loadStats() {
    try {
      const savedStats = localStorage.getItem(LOCAL_STORAGE_KEYS.BEST_SCORE);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        this.state.stats.bestScore = parsed.bestScore;
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  }
}

export const gameState = new GameState();
