const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, 'sounds');
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir);
}

// Simple function to generate a beep sound with sox
function generateSound(filename, frequency, duration) {
    try {
        execSync(`sox -n -r 44100 -b 16 -c 2 ${filename} synth ${duration} sine ${frequency} vol 0.5`);
        console.log(`Generated ${filename}`);
    } catch (error) {
        console.warn(`Could not generate ${filename}. Make sure SoX (http://sox.sourceforge.net/) is installed.`);
        // Create empty files as fallback
        fs.writeFileSync(filename, '');
    }
}

// Generate different sounds
generateSound(path.join(soundsDir, 'flip.mp3'), 440, 0.1);
generateSound(path.join(soundsDir, 'match.mp3'), 880, 0.2);
generateSound(path.join(soundsDir, 'win.mp3'), 660, 0.5);
generateSound(path.join(soundsDir, 'hint.mp3'), 550, 0.15);

console.log('Sound files generated in the sounds/ directory');
