import { gameState } from './state.js';
import { soundManager } from './soundManager.js';

export class Card {
  constructor(emoji, index) {
    this.emoji = emoji;
    this.index = index;
    this.isFlipped = false;
    this.isMatched = false;
    this.element = this.createElement();
    this.addEventListeners();
  }

  createElement() {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = this.index;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Card ${this.index + 1}, unflipped`);

    const front = document.createElement('div');
    front.className = 'card-front';
    front.textContent = '?';

    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = this.emoji;

    card.appendChild(front);
    card.appendChild(back);

    return card;
  }

  addEventListeners() {
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  handleClick() {
    if (this.isFlipped || this.isMatched || gameState.lockBoard || gameState.isPaused) {
      return;
    }
    this.flip();
    gameState.firstCard = this;
  }

  handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick();
    }
  }

  handleMouseEnter() {
    if (!this.isFlipped && !this.isMatched) {
      this.element.style.transform = 'translateY(-5px)';
      this.element.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
    }
  }

  handleMouseLeave() {
    if (!this.isFlipped && !this.isMatched) {
      this.element.style.transform = '';
      this.element.style.boxShadow = '';
    }
  }

  flip() {
    this.isFlipped = true;
    this.element.classList.add('flipped');
    this.element.setAttribute('aria-label', `Card ${this.index + 1}, ${this.emoji}`);
    soundManager.play('flip');
  }

  unflip() {
    this.isFlipped = false;
    this.element.classList.remove('flipped');
    this.element.setAttribute('aria-label', `Card ${this.index + 1}, unflipped`);
  }

  match() {
    this.isMatched = true;
    this.element.classList.add('matched');
    this.element.setAttribute('aria-label', `Matched card ${this.index + 1}, ${this.emoji}`);
    this.element.style.pointerEvents = 'none';
  }

  reset() {
    this.isFlipped = false;
    this.isMatched = false;
    this.element.classList.remove('flipped', 'matched');
    this.element.style.pointerEvents = 'auto';
    this.element.setAttribute('aria-label', `Card ${this.index + 1}, unflipped`);
  }
}
