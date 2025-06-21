document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game');
    const hintBtn = document.getElementById('hint-btn');
    const settingsBtn = document.getElementById('settings-btn');
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
    
    // Game settings
    let gameSettings = {
        difficulty: 'medium',
        theme: 'emojis',
        sound: true
    };
    
    // Sound elements
    const sounds = {
        flip: document.getElementById('flip-sound'),
        match: document.getElementById('match-sound'),
        win: document.getElementById('win-sound'),
        hint: document.getElementById('hint-sound')
    };
    
    // Play sound if enabled
    const playSound = (soundName) => {
        const sound = sounds[soundName];
        if (sound && gameSettings.sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Could not play sound:', e));
        }
    };
    
    // Emoji pairs for the game
    const emojis = ['😊', '🤩', '😎', '🤗', '😍', '🤪', '🥳', '😴'];
    
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
        // Clear any existing timer
        if (timerInterval) clearInterval(timerInterval);
        
        // Reset and start the timer
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
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            gameSettings = {...gameSettings, ...JSON.parse(savedSettings)};
        }
        
        // Update UI to match settings
        difficultySelect.value = gameSettings.difficulty;
        themeSelect.value = gameSettings.theme;
        soundToggle.checked = gameSettings.sound;
    }
    
    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    }
    
    // Apply theme to the game
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }
    
    // Initialize game
    function initGame() {
        // Reset game state
        gameBoard.innerHTML = ''; // Clear the board
        gameBoard.className = 'game-board';
        
        // Set up board based on difficulty
        const difficulty = gameSettings.difficulty;
        if (difficulty === 'easy') {
            totalPairs = 6;
            maxMoves = 20; // More lenient for easy mode
            gameBoard.classList.remove('hard');
        } else if (difficulty === 'hard') {
            totalPairs = 18;
            maxMoves = 50; // More challenging for hard mode
            gameBoard.classList.add('hard');
        } else { // medium
            totalPairs = 8;
            maxMoves = 30; // Balanced for medium
            gameBoard.classList.remove('hard');
        }
        
        // Reset stars to max
        stars = 3;
        updateStarRating();
        
        // Reset game state
        cards = [];
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        matches = 0;
        moves = 0;
        seconds = 0;
        
        // Reset and start timer
        stopTimer();
        startTimer();
        
        // Update UI
        messageEl.textContent = 'Find all matching pairs!';
        messageEl.className = 'message';
        
        // Apply theme
        applyTheme(gameSettings.theme);
        
        // Create cards
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
    }
    
    // Calculate stars based on moves
    function calculateStars() {
        const movesElement = document.getElementById('moves');
        if (movesElement) {
            movesElement.textContent = moves;
        }
        
        const maxPossibleMoves = maxMoves;
        const movePercentage = (moves / maxPossibleMoves) * 100;
        
        if (movePercentage < 60) {
            stars = 3; // 3 stars for excellent performance
        } else if (movePercentage < 80) {
            stars = 2; // 2 stars for good performance
        } else if (movePercentage < 100) {
            stars = 1; // 1 star for average performance
        } else {
            stars = 0; // 0 stars for poor performance
        }
        
        updateStarRating();
    }

    // Create and shuffle cards
    function createCards() {
        // Get emojis based on theme
        let cardSymbols = [];
        if (gameSettings.theme === 'animals') {
            cardSymbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];
        } else if (gameSettings.theme === 'fruits') {
            cardSymbols = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑'];
        } else { // emojis
            cardSymbols = ['😊', '🤩', '😎', '🤗', '😍', '🤪', '🥳', '😴', '🤠', '😇', '🤓', '😜'];
        }
        
        // Create pairs of cards
        const cardEmojis = [];
        for (let i = 0; i < totalPairs; i++) {
            cardEmojis.push(cardSymbols[i % cardSymbols.length]);
            cardEmojis.push(cardSymbols[i % cardSymbols.length]);
        }
        
        // Shuffle the cards
        const shuffledCards = shuffleArray(cardEmojis);
        
        // Create card elements
        shuffledCards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji;
            
            // Create card faces
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-content', 'card-front');
            cardFront.textContent = '?';
            
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-content', 'card-back');
            cardBack.textContent = emoji;
            
            // Make sure card starts face down
            card.style.transform = 'rotateY(0deg)';
            
            card.appendChild(cardFront);
            card.appendChild(cardBack);
            
            // Initialize card state
            card.classList.remove('flipped', 'matched');
            card.style.animation = '';
            
            card.addEventListener('click', flipCard);
            
            // Add hover effect
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
            
            gameBoard.appendChild(card);
            cards.push(card);
        });
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

    // Handle card flip
    const flipCard = function() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (this.classList.contains('flipped') || this.classList.contains('matched')) return;
        
        // Add flip animation
        this.style.transform = 'rotateY(180deg)';
        this.classList.add('flipped');
        playSound('flip');
        
        if (!hasFlippedCard) {
            // First card flipped
            hasFlippedCard = true;
            firstCard = this;
            // Add subtle bounce effect
            this.style.animation = 'bounce 0.5s ease';
            return;
        }
        
        // Second card flipped
        secondCard = this;
        secondCard.style.animation = 'bounce 0.5s ease';
        
        // Update moves and check for match
        moves++;
        calculateStars();
        checkForMatch();
    };
    
    // Check if the flipped cards match
    function checkForMatch() {
        const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
        
        if (isMatch) {
            disableCards();
            matches++;
            
            if (matches === totalPairs) {
                endGame();
            }
        } else {
            unflipCards();
        }
    }
    
    // Disable matched cards
    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        resetBoard();
    }
    
    // Unflip cards that don't match
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            resetBoard();
        }, 1000);
    }
    
    // Reset the board state
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Reset and start timer
    stopTimer();
    startTimer();

    // Update UI
    messageEl.textContent = 'Find all matching pairs!';
    messageEl.className = 'message';

    // Create cards
    createCards();

    // Toggle settings panel
    function toggleSettings() {
        settingsPanel.classList.toggle('show');
    }
    
    // Show a hint by highlighting a matching pair
    function showHint() {
        if (hintActive || matches === totalPairs) return;

        // Disable hint button temporarily
        hintActive = true;
        hintBtn.disabled = true;
        hintBtn.classList.add('disabled');

        // Find all unpaired cards
        const unpairedCards = Array.from(document.querySelectorAll('.card:not(.matched)'));

        // Find a matching pair
        let firstCard, secondCard;
        const emojiMap = new Map();

        for (const card of unpairedCards) {
            const emoji = card.dataset.emoji;
            if (emojiMap.has(emoji)) {
                firstCard = emojiMap.get(emoji);
                secondCard = card;
                break;
            }
            emojiMap.set(emoji, card);
        }

        if (firstCard && secondCard) {
            // Highlight the matching pair
            firstCard.classList.add('hint');
            secondCard.classList.add('hint');

            // Play hint sound if available
            const hintSound = document.getElementById('hint-sound');
            if (hintSound) {
                hintSound.currentTime = 0;
                hintSound.play().catch(e => console.log('Could not play hint sound'));
            }

            // Remove highlight after delay
            hintTimeout = setTimeout(() => {
                firstCard.classList.remove('hint');
                secondCard.classList.remove('hint');

                // Re-enable hint button after cooldown
                setTimeout(() => {
                    hintBtn.disabled = false;
                    hintBtn.classList.remove('disabled');
                    hintActive = false;
                }, 2000);
            }, 1500);
        }
    }

    // Event Listeners
    newGameBtn.addEventListener('click', () => {
        // Clear any active hints when starting a new game
        if (hintTimeout) clearTimeout(hintTimeout);
        hintActive = false;
        const bestTime = localStorage.getItem('bestTime');
        if (bestTime) {
            bestScoreEl.textContent = formatTime(parseInt(bestTime));
        }
        
        // Initialize the game
        initGame();
    });

    // Settings button event listener
    settingsBtn.addEventListener('click', toggleSettings);

    // Hint button event listener
    hintBtn.addEventListener('click', showHint);

    // Settings change event listeners
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

    // Load settings and initialize game
    loadSettings();
    initGame();
});
