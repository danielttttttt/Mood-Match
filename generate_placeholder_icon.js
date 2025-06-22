// Simple script to create a base64-encoded icon
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size = 512) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#6B73FF';
    ctx.fillRect(0, 0, size, size);
    
    // Draw card
    const padding = size * 0.15;
    const cardWidth = size - (padding * 2);
    const cardHeight = cardWidth * 1.4;
    const cornerRadius = size * 0.05;
    
    // Draw card with rounded corners
    roundRect(ctx, padding, (size - cardHeight) / 2, cardWidth, cardHeight, cornerRadius, true, false);
    
    // Draw question mark
    ctx.fillStyle = '#6B73FF';
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', size / 2, size / 2);
    
    // Save as base64
    return canvas.toDataURL('image/png');
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

// Create and save icons
const iconSizes = [192, 512];
const icons = {};

iconSizes.forEach(size => {
    const dataUrl = createIcon(size);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(`icon-${size}x${size}.png`, base64Data, 'base64');
    console.log(`Created icon-${size}x${size}.png`);
});

console.log('Icons created successfully!');
