# Sound Files

This directory contains the game's sound effects. The following files are required:

- `flip.mp3` - Played when a card is flipped
- `match.mp3` - Played when a matching pair is found
- `win.mp3` - Played when the game is won
- `hint.mp3` - Played when the hint button is used

## Regenerating Sounds (Optional)

To regenerate these sounds, you'll need SoX (Sound eXchange) installed:

```bash
# Install SoX (example for macOS with Homebrew)
brew install sox

# Or on Ubuntu/Debian
# sudo apt-get install sox

# Then run the generator
node generate_sounds.js
```

If SoX is not available, the game will fall back to using the Web Audio API for sound effects.
