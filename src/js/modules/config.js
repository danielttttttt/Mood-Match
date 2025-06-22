// Game configuration and constants
export const DIFFICULTY_LEVELS = {
  easy: { pairs: 6, maxMoves: 20, gridColumns: 4 },
  medium: { pairs: 8, maxMoves: 30, gridColumns: 4 },
  hard: { pairs: 18, maxMoves: 50, gridColumns: 6 }
};

export const THEMES = {
  emojis: ['😊', '🤩', '😎', '🤗', '😍', '🤪', '🥳', '😴', '🤠', '😇', '🤓', '😜', '😺', '🐶', '🦊', '🐻', '🐼', '🐨'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐺', '🦒', '🦝'],
  fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆']
};

export const SOUNDS = {
  flip: { src: 'https://www.soundjay.com/buttons/button-09.mp3', volume: 0.5 },
  match: { src: 'https://www.soundjay.com/buttons/button-10.mp3', volume: 0.7 },
  win: { src: 'https://www.soundjay.com/buttons/button-11.mp3', volume: 0.7 },
  hint: { src: 'https://www.soundjay.com/buttons/button-12.mp3', volume: 0.5 }
};

export const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'memoryMatchSettings',
  BEST_SCORE: 'memoryMatchBestScore'
};
