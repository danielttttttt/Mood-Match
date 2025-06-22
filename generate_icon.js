const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#6B73FF';
    ctx.fillRect(0, 0, size, size);
    
    // Draw a simple card symbol
    ctx.fillStyle = '#FFFFFF';
    const padding = size * 0.2;
    const cardWidth = size - (padding * 2);
    const cardHeight = cardWidth * 1.4;
    const cornerRadius = size * 0.1;
    
    // Draw card
    roundRect(ctx, padding, padding, cardWidth, cardHeight, cornerRadius, true, false);
    
    // Draw question mark
    ctx.fillStyle = '#6B73FF';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', size / 2, size / 2);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`Generated ${filename}`);
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

// Generate icons
generateIcon(192, 'icon.png');
generateIcon(512, 'icon-512x512.png');

console.log('Icons generated');
