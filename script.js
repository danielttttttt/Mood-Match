document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matches = 0;
    let moves = 0;
    const totalPairs = 8; // 4x4 grid (16 cards total)
    
    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game');
    const messageEl = document.getElementById('message');
    
    // Emoji pairs for the game
    const emojis = ['😊', '🤩', '😎', '🤗', '😍', '🤪', '🥳', '😴'];
    
    // Initialize game
    function initGame() {
        // Reset game state
        gameBoard.innerHTML = ''; // Clear the board
        cards = [];
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
        matches = 0;
        moves = 0;
        
        // Update UI
        messageEl.textContent = 'Find all matching pairs!';
        messageEl.className = 'message';
        
        // Create cards
        createCards();
    }
    
    // Create and shuffle cards
    function createCards() {
        // Create pairs of cards
        const cardEmojis = [];
        for (let i = 0; i < totalPairs; i++) {
            cardEmojis.push(emojis[i]);
            cardEmojis.push(emojis[i]);
        }
        
        // Shuffle the cards
        const shuffledCards = shuffleArray(cardEmojis);
        
        // Create card elements
        shuffledCards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji;
            
            const cardContent = document.createElement('div');
            cardContent.classList.add('card-content');
            cardContent.textContent = emoji;
            
            card.appendChild(cardContent);
            card.addEventListener('click', flipCard);
            
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
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (this.classList.contains('flipped') || this.classList.contains('matched')) return;
        
        this.classList.add('flipped');
        
        if (!hasFlippedCard) {
            // First card flipped
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second card flipped
        secondCard = this;
        moves++;
        checkForMatch();
    }
    
    // Check for a match
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
    
    // Flip cards back if no match
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }
    
    // Reset board state
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // End game
    function endGame() {
        messageEl.textContent = `🎉 You won in ${moves} moves!`;
        messageEl.classList.add('success');
        
        // Add confetti effect
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-20px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.position = 'fixed';
            confetti.style.zIndex = '1000';
            document.body.appendChild(confetti);
            
            // Animate confetti
            const animation = confetti.animate([
                { top: '-20px', transform: `rotate(${Math.random() * 360}deg)` },
                { top: '100vh', transform: `rotate(${Math.random() * 360}deg)` }
            ], {
                duration: 2000 + Math.random() * 3000,
                easing: 'cubic-bezier(0.1, 0.8, 0.8, 1)'
            });
            
            // Remove confetti after animation
            animation.onfinish = () => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            };
        }
    }
    
    // Toggle settings panel
    function toggleSettings() {
        settingsPanel.classList.toggle('show');
    }
    
    // Event Listeners
    newGameBtn.addEventListener('click', initGame);
    hintBtn.addEventListener('click', giveHint);
    settingsBtn.addEventListener('click', toggleSettings);
    
    // Settings changes
    difficultySelect.addEventListener('change', initGame);
    themeSelect.addEventListener('change', () => {
        currentTheme = themeSelect.value;
        initGame();
    });
    soundToggle.addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
    });
    
    // Load best time
    const bestTime = localStorage.getItem('bestTime');
    if (bestTime) {
        bestScoreDisplay.textContent = formatTime(parseInt(bestTime));
    }
    
    // Initialize the game
    initGame();
});
