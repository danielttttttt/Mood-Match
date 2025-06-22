document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game');
    const hintBtn = document.getElementById('hint-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const messageEl = document.getElementById('message');
    const difficultySelect = document.getElementById('difficulty');
    const themeSelect = document.getElementById('theme');
    const soundToggle = document.getElementById('sound-toggle');
    const timerEl = document.getElementById('timer');
    const bestScoreEl = document.getElementById('best-score');

    // Game state
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matches = 0;
    let moves = 0;
    let maxMoves = 0;
    let seconds = 0;
    let timerInterval = null;
    let hintTimeout = null;
    let hintActive = false;
    let totalPairs = 8; // Default to medium (4x4 grid)
    let soundEnabled = true;
    let currentTheme = 'emojis';
    let stars = 3; // Maximum stars by default
    let isPaused = false;

    // Game settings
    let gameSettings = {
        difficulty: 'medium',
        theme: 'emojis',
        sound: true
    };

    // Theme definitions
    const themes = {
        emojis: ['😊', '🤩', '😎', '🤗', '😍', '🤪', '🥳', '😴', '🤠', '😇', '🤓', '😜', '😺', '🐶', '🦊', '🐻', '🐼', '🐨'],
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐺', '🦒', '🦝'],
        fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆']
    };

    // Star thresholds per difficulty
    const starThresholds = {
        easy: { three: 12, two: 16, one: 20 },
        medium: { three: 18, two: 24, one: 30 },
        hard: { three: 30, two: 40, one: 50 }
    };

    // Sound configuration with Web Audio API fallback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Sound frequencies for Web Audio fallback
    const soundFrequencies = {
        flip: 440,
        match: 880,
        win: 660,
        hint: 550
    };

    // Play sound if enabled
    const playSound = (soundName) => {
        if (!gameSettings.sound) return;
        
        // Try to play HTML5 audio first
        const soundElement = document.getElementById(`${soundName}-sound`);
        if (soundElement) {
            try {
                soundElement.currentTime = 0;
                soundElement.play().catch(e => {
                    console.warn('HTML5 Audio failed, falling back to Web Audio');
                    playFallbackSound(soundName);
                });
                return;
            } catch (e) {
                console.warn('Error with HTML5 Audio, falling back to Web Audio:', e);
            }
        }
        
        // Fallback to Web Audio API
        playFallbackSound(soundName);
    };
    
    // Fallback sound using Web Audio API
    function playFallbackSound(soundName) {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = soundFrequencies[soundName] || 440;
        gainNode.gain.value = 0.1;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        oscillator.start(now);
        gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        oscillator.stop(now + 0.2);
    }

    // Format time as MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Update timer display
    function updateTimer() {
        document.getElementById('timer').textContent = formatTime(seconds);
    }

    // Start the game timer
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        seconds = 0;
        updateTimer();
        timerInterval = setInterval(() => {
            seconds++;
            updateTimer();
        }, 1000);
    }

    // Stop the game timer
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Load settings from localStorage
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('gameSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.difficulty && ['easy', 'medium', 'hard'].includes(parsed.difficulty)) {
                    gameSettings.difficulty = parsed.difficulty;
                }
                if (parsed.theme && ['emojis', 'animals', 'fruits'].includes(parsed.theme)) {
                    gameSettings.theme = parsed.theme;
                }
                if (typeof parsed.sound === 'boolean') {
                    gameSettings.sound = parsed.sound;
                }
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        difficultySelect.value = gameSettings.difficulty;
        themeSelect.value = gameSettings.theme;
        soundToggle.checked = gameSettings.sound;
    }

    // Save settings to localStorage
    function saveSettings() {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    // Apply theme to the game
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    // Initialize game
    function initGame() {
        gameBoard.innerHTML = '';
        gameBoard.className = 'game-board';
        const difficulty = gameSettings.difficulty;
        if (difficulty === 'easy') {
            totalPairs = 6;
            maxMoves = 20;
            gameBoard.classList.remove('hard');
        } else if (difficulty === 'hard') {
            totalPairs = 18;
            maxMoves = 50;
            gameBoard.classList.add('hard');
        } else {
            totalPairs = 8;
            maxMoves = 30;
            gameBoard.classList.remove('hard');
        }
        stars = 3;
        updateStarRating();
        cards = [];
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        matches = 0;
        moves = 0;
        seconds = 0;
        isPaused = false;
        pauseBtn.textContent = '⏸️';
        pauseBtn.setAttribute('aria-label', 'Pause game');
        stopTimer();
        startTimer();
        messageEl.textContent = 'Find all matching pairs!';
        messageEl.className = 'message';
        applyTheme(gameSettings.theme);
        createCards();
    }

    // Update star rating display
    function updateStarRating() {
        const starElements = document.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            if (index < stars) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
        document.querySelector('.star-rating').setAttribute('aria-label', `Star rating: ${stars} stars`);
    }

    // Calculate stars based on moves
    function calculateStars() {
        const movesElement = document.getElementById('moves');
        if (movesElement) {
            movesElement.textContent = moves;
        }
        const thresholds = starThresholds[gameSettings.difficulty];
        stars = moves <= thresholds.three ? 3 :
                moves <= thresholds.two ? 2 :
                moves <= thresholds.one ? 1 : 0;
        updateStarRating();
    }

    // Handle card flip
    function flipCard(event) {
        // Prevent default behavior if it's a keyboard event
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Prevent multiple rapid clicks
            if (event.timeStamp - (this.lastClickTime || 0) < 500) {
                console.log('Click too fast, ignoring');
                return;
            }
            this.lastClickTime = event.timeStamp;
        }

        console.log('Attempting to flip card:', this.dataset.emoji, this);
        
        // Check if the card can be flipped
        if (lockBoard) {
            console.log('Cannot flip: board is locked');
            return;
        }
        
        if (isPaused) {
            console.log('Cannot flip: game is paused');
            return;
        }
        
        if (this === firstCard) {
            console.log('Cannot flip: this is already the first card');
            return;
        }
        
        if (this.classList.contains('flipped')) {
            console.log('Card already flipped');
            return;
        }
        
        if (this.classList.contains('matched')) {
            console.log('Card already matched');
            return;
        }
        
        console.log('Flipping card:', this.dataset.emoji);
        
        // Flip the card with animation
        this.classList.add('flipped');
        this.setAttribute('aria-label', `Card, ${this.dataset.emoji}, flipped`);
        
        // Play flip sound if sound is enabled
        if (gameSettings.sound) {
            playSound('flip');
        }

        if (!hasFlippedCard) {
            // First card flipped
            console.log('First card flipped:', this.dataset.emoji);
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second card flipped
        console.log('Second card flipped:', this.dataset.emoji);
        secondCard = this;
        lockBoard = true;
        moves++;
        
        // Update moves display
        const movesElement = document.getElementById('moves');
        if (movesElement) {
            movesElement.textContent = moves;
        }
        
        calculateStars();
        checkForMatch();
    }

    // Create and shuffle cards
    function createCards() {
        console.log('Creating cards...');
        const fragment = document.createDocumentFragment();
        let cardSymbols = themes[gameSettings.theme];
        const cardEmojis = [];
        
        // Reset cards array
        cards = [];
        
        // Create pairs of emojis
        for (let i = 0; i < totalPairs; i++) {
            const emoji = cardSymbols[i % cardSymbols.length];
            cardEmojis.push(emoji, emoji); // Add each emoji twice for matching pairs
        }
        
        // Shuffle the cards
        const shuffledCards = shuffleArray(cardEmojis);
        
        // Create card elements
        shuffledCards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.emoji = emoji;
            card.dataset.index = index; // Add index for debugging
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Card ${index}, unflipped`);
            
            // Create card inner elements
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            cardFront.textContent = '?';
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = emoji;
            
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            
            // Add click event listener
            card.addEventListener('click', function() {
                console.log('Card clicked:', index, emoji);
                flipCard.call(this);
            });
            
            // Add keyboard support
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log('Card keyboard activated:', index, emoji);
                    flipCard.call(this);
                }
            });
            
            // Add hover effects
            card.addEventListener('mouseenter', function() {
                if (!this.classList.contains('flipped') && !this.classList.contains('matched')) {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                    this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.classList.contains('flipped') && !this.classList.contains('matched')) {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                }
            });
            
            // Add to fragment and cards array
            fragment.appendChild(card);
            cards.push(card);
        });
        
                // Clear previous cards and add new ones
        gameBoard.innerHTML = '';
        gameBoard.appendChild(fragment);
        console.log('Cards created:', cards.length);
    }

    /* ------------------------------------------------------------------
       GAME RESET / NEW GAME HANDLING
    ------------------------------------------------------------------*/
    function resetAllCards() {
        // Remove any pending hint timer
        if (hintTimeout) {
            clearTimeout(hintTimeout);
            hintTimeout = null;
        }
        // Remove any lingering classes / inline styles
        cards.forEach(card => {
            card.classList.remove('flipped', 'matched', 'hint');
            card.removeAttribute('style');
            card.lastClickTime = 0;
        });
        // Clean arrays / flags
        cards = [];
        firstCard = null;
        secondCard = null;
        hasFlippedCard = false;
        lockBoard = false;
    }

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Check if the flipped cards match
    function checkForMatch() {
        console.log('Checking for match...');
        
        // Safety check
        if (!firstCard || !secondCard || !firstCard.dataset || !secondCard.dataset) {
            console.error('Invalid cards for matching:', { firstCard, secondCard });
            resetBoard();
            return;
        }
        
        const firstEmoji = firstCard.dataset.emoji;
        const secondEmoji = secondCard.dataset.emoji;
        const isMatch = firstEmoji === secondEmoji;
        
        console.log(`Matching cards: ${firstEmoji} and ${secondEmoji} - ${isMatch ? 'MATCH!' : 'No match'}`);
        
        if (isMatch) {
            // Mark cards as matched and keep them flipped
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            
            // Keep the cards flipped by ensuring the flipped class stays
            firstCard.classList.add('flipped');
            secondCard.classList.add('flipped');
            
            // Update accessibility
            firstCard.setAttribute('aria-label', `Card, ${firstEmoji}, matched`);
            secondCard.setAttribute('aria-label', `Card, ${secondEmoji}, matched`);
            
            // Add a visual effect for matched cards
            firstCard.style.opacity = '0.8';
            secondCard.style.opacity = '0.8';
            
            matches++;
            console.log(`Matches: ${matches}/${totalPairs}`);
            
            // Play match sound if sound is enabled
            if (gameSettings.sound) {
                playSound('match');
            }
            
            // Check for win condition
            if (matches === totalPairs) {
                console.log('All matches found! Game won!');
                endGame();
            }
            
            // Reset board after a short delay
            setTimeout(() => {
                resetBoard();
            }, 500);
        } else {
            // No match, flip cards back after a delay
            console.log('No match, flipping cards back');
            
            if (gameSettings.sound) {
                playSound('flip');
            }
            
            setTimeout(() => {
                if (firstCard && !firstCard.classList.contains('matched')) {
                    firstCard.classList.remove('flipped');
                    firstCard.setAttribute('aria-label', `Card, ${firstCard.dataset.emoji}, unflipped`);
                }
                if (secondCard && !secondCard.classList.contains('matched')) {
                    secondCard.classList.remove('flipped');
                    secondCard.setAttribute('aria-label', `Card, ${secondCard.dataset.emoji}, unflipped`);
                }
                resetBoard();
            }, 1000);
        }
        
        // Check for game over condition
        if (moves > maxMoves && matches < totalPairs) {
            console.log('Game over - too many moves');
            stopTimer();
            if (messageEl) {
                messageEl.textContent = 'Game Over! You\'ve used too many moves.';
                messageEl.className = 'message';
            }
            lockBoard = true;
            if (pauseBtn) {
                pauseBtn.disabled = true;
            }
        }
    }

    // Disable matched cards
    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.setAttribute('aria-label', `Card, ${firstCard.dataset.emoji}, matched`);
        secondCard.setAttribute('aria-label', `Card, ${secondCard.dataset.emoji}, matched`);
        playSound('match');
        resetBoard();
    }

    // Unflip cards that don't match
    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            firstCard.setAttribute('aria-label', `Card, ${firstCard.dataset.emoji}, unflipped`);
            secondCard.setAttribute('aria-label', `Card, ${secondCard.dataset.emoji}, unflipped`);
            resetBoard();
        }, 1000);
    }

    // Reset the board state
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // End the game
    function endGame() {
        stopTimer();
        playSound('win');
        messageEl.textContent = `Congratulations! You won in ${moves} moves and ${formatTime(seconds)}!`;
        messageEl.className = 'message celebration';
        const bestTime = localStorage.getItem('bestTime');
        if (!bestTime || seconds < parseInt(bestTime)) {
            localStorage.setItem('bestTime', seconds);
            bestScoreEl.textContent = formatTime(seconds);
        }
        createConfetti();
        pauseBtn.disabled = true;
    }

    // Create confetti animation
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = `${Math.random() * 100}vh`;
            confetti.style.animation = `fall ${1 + Math.random()}s linear`;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    // Toggle settings panel
    function toggleSettings(event) {
        if (event) event.stopPropagation();
        
        // Toggle the panel visibility
        const isVisible = settingsPanel.classList.toggle('visible');
        settingsPanel.setAttribute('aria-hidden', !isVisible);
        settingsBtn.setAttribute('aria-expanded', isVisible);
        settingsBtn.classList.toggle('active', isVisible);
        
        // Save settings when closing the panel
        if (!isVisible) {
            saveSettings();
        }
    }

    // Show a hint by highlighting a matching pair
    function showHint() {
        console.log('Hint button clicked');
        if (hintActive) {
            console.log('Hint already active');
            return;
        }
        if (matches === totalPairs) {
            console.log('All pairs matched');
            return;
        }
        if (isPaused) {
            console.log('Game is paused');
            return;
        }
        
        console.log('Activating hint...');
        hintActive = true;
        hintBtn.disabled = true;
        hintBtn.classList.add('disabled');
        
        const unpairedCards = Array.from(document.querySelectorAll('.card:not(.matched)'));
        console.log('Unpaired cards found:', unpairedCards.length);
        
        let firstCard, secondCard;
        const emojiMap = new Map();
        
        // Find a matching pair
        for (const card of unpairedCards) {
            const emoji = card.dataset.emoji;
            if (!emoji) {
                console.log('Card missing emoji data:', card);
                continue;
            }
            
            if (emojiMap.has(emoji)) {
                firstCard = emojiMap.get(emoji);
                secondCard = card;
                console.log('Found matching pair:', { firstCard, secondCard });
                break;
            }
            emojiMap.set(emoji, card);
        }
        
        if (firstCard && secondCard) {
            console.log('Showing hint for pair');
            firstCard.classList.add('hint');
            secondCard.classList.add('hint');
            playSound('hint');
            
            hintTimeout = setTimeout(() => {
                console.log('Removing hint effect');
                firstCard.classList.remove('hint');
                secondCard.classList.remove('hint');
                
                // Re-enable the hint button after a delay
                setTimeout(() => {
                    hintBtn.disabled = false;
                    hintBtn.classList.remove('disabled');
                    hintActive = false;
                    console.log('Hint deactivated');
                }, 2000);
            }, 1500);
        } else {
            console.log('No matching pairs found');
            // If no pairs found, reset the button
            hintBtn.disabled = false;
            hintBtn.classList.remove('disabled');
            hintActive = false;
        }
    }

    // Pause or resume game
    function togglePause() {
        if (matches === totalPairs || moves > maxMoves) return;
        isPaused = !isPaused;
        if (isPaused) {
            stopTimer();
            lockBoard = true;
            messageEl.textContent = 'Game Paused';
            pauseBtn.textContent = '▶️';
            pauseBtn.setAttribute('aria-label', 'Resume game');
        } else {
            startTimer();
            lockBoard = false;
            messageEl.textContent = 'Find all matching pairs!';
            pauseBtn.textContent = '⏸️';
            pauseBtn.setAttribute('aria-label', 'Pause game');
        }
    }

    // Add keyboard navigation for cards
    function setupCardEventListeners(card) {
        card.addEventListener('click', flipCard);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                flipCard.call(card);
            }
        });
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('flipped') && !card.classList.contains('matched')) {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            }
        });
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('flipped') && !card.classList.contains('matched')) {
                card.style.transform = '';
                card.style.boxShadow = '';
            }
        });
    }

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = settingsPanel.contains(e.target) || settingsBtn.contains(e.target);
        if (!isClickInside && settingsPanel.getAttribute('aria-hidden') === 'false') {
            settingsPanel.setAttribute('aria-hidden', 'true');
            settingsBtn.setAttribute('aria-expanded', 'false');
            settingsBtn.classList.remove('active');
            saveSettings();
        }
    });

    // Event Listeners
    newGameBtn.addEventListener('click', () => {
        if (matches > 0 && matches < totalPairs && moves <= maxMoves && !isPaused) {
            if (!confirm('Are you sure you want to start a new game? Your progress will be lost.')) {
                return;
            }
        }
        if (hintTimeout) clearTimeout(hintTimeout);
        hintActive = false;
        hintBtn.disabled = false;
        hintBtn.classList.remove('disabled');
        pauseBtn.disabled = false;
        initGame();
    });

    settingsBtn.addEventListener('click', toggleSettings);
    hintBtn.addEventListener('click', showHint);
    pauseBtn.addEventListener('click', togglePause);

    difficultySelect.addEventListener('change', (e) => {
        gameSettings.difficulty = e.target.value;
        saveSettings();
    });

    themeSelect.addEventListener('change', (e) => {
        gameSettings.theme = e.target.value;
        applyTheme(e.target.value);
        saveSettings();
    });

    soundToggle.addEventListener('change', (e) => {
        gameSettings.sound = e.target.checked;
        saveSettings();
    });

    // Initialize settings panel
    if (settingsPanel) {
        settingsPanel.style.display = ''; // Make sure it's visible for JS to work with
    }
    
    // Load settings and initialize game
    loadSettings();
    const bestTime = localStorage.getItem('bestTime');
    if (bestTime && bestScoreEl) {
        bestScoreEl.textContent = formatTime(parseInt(bestTime));
    }
    
    // Make sure all required elements exist before initializing the game
    if (gameBoard && newGameBtn && hintBtn && settingsBtn && pauseBtn && settingsPanel) {
        initGame();
    } else {
        console.error('Required game elements not found');
    }
});

