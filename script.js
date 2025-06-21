document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matches = 0;
    let moves = 0;
    let seconds = 0;
    let timerInterval = null;
    const totalPairs = 8; // 4x4 grid (16 cards total)
    
    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game');
    const hintBtn = document.getElementById('hint-btn');
    const messageEl = document.getElementById('message');
    let hintTimeout = null;
    let hintActive = false;
    
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
        
        // Reset and start timer
        stopTimer();
        startTimer();
        
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
        stopTimer();
        const timeTaken = formatTime(seconds);
        messageEl.textContent = `🎉 You won in ${moves} moves! Time: ${timeTaken}`;
        messageEl.classList.add('success');
        
        // Update best score if this one is better
        const bestScoreEl = document.getElementById('best-score');
        const bestScore = localStorage.getItem('bestScore');
        if (!bestScore || seconds < parseInt(bestScore)) {
            localStorage.setItem('bestScore', seconds.toString());
            bestScoreEl.textContent = timeTaken;
        }
        
        // Create container for confetti
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
        
        // Add confetti effect
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-20px';
                confetti.style.width = (Math.random() * 10 + 5) + 'px';
                confetti.style.height = (Math.random() * 10 + 5) + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.position = 'fixed';
                confetti.style.zIndex = '1000';
                
                container.appendChild(confetti);
                
                // Animate confetti
                const animation = confetti.animate([
                    { 
                        top: '-20px', 
                        transform: `rotate(0deg) scale(1)`,
                        opacity: 1
                    },
                    { 
                        top: '100vh', 
                        transform: `rotate(${Math.random() * 360}deg) scale(0.5)`,
                        opacity: 0
                    }
                ], {
                    duration: 2000 + Math.random() * 3000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.8, 1)'
                });
                
                // Remove confetti after animation
                animation.onfinish = () => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                    
                    // Remove container when all confetti is gone
                    if (container.children.length === 0) {
                        container.remove();
                    }
                };
                
            }, Math.random() * 2000); // Stagger the confetti creation
        }
        
        // Remove container after all animations complete
        setTimeout(() => {
            if (container.parentNode) {
                container.remove();
            }
        }, 10000);
    }
    
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
        initGame();
    });
    
    hintBtn.addEventListener('click', showHint);
    
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
