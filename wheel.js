import * as PIXI from './pixi.mjs';

const config = {
    width: 1920,
    height: 1080,
    radius: 300,
    borderThickness: 8,
    segments: [
        { prize: "$100 1", color: 0x006400 },
        { prize: "$200 2", color: 0x8B0000 },
        { prize: "$300 3", color: 0xB8860B },
        { prize: "$400 4", color: 0xA9A9A9 },
        { prize: "$500 5", color: 0x006400 },
        { prize: "$600 6", color: 0x8B0000 },
        { prize: "$700 7", color: 0xB8860B },
        { prize: "$800 8", color: 0xA9A9A9 },
    ],
    spinTime: 4000,
    totalRotations: 5,
    buttonWidth: 240,
    buttonHeight: 60,
    buttonRadius: 20,
    prizeTextStyle: { fontFamily: 'Arial', fontSize: 24, fill: 'white', align: 'center' },
    totalWinTextStyle: { fontFamily: 'Arial', fontSize: 20, fill: 'yellow', align: 'center' },
};

const app = new PIXI.Application({ width: config.width, height: config.height });
document.getElementById('app').appendChild(app.view);

const centerX = app.view.width / 2;
const centerY = app.view.height / 2;

let wheel = new PIXI.Graphics();
let border = new PIXI.Graphics();
let backdrop = new PIXI.Graphics();
let resultText = new PIXI.Text('', config.prizeTextStyle);
let totalWinText = new PIXI.Text('', config.totalWinTextStyle);
let triangle;

resultText.anchor.set(0.5);
totalWinText.anchor.set(0.5);

const resultContainer = new PIXI.Container();
resultContainer.addChild(resultText);
resultContainer.addChild(totalWinText);

function drawWheel() {
    wheel.clear();
    const sectorAngle = (Math.PI * 2) / config.segments.length;

    for (let i = 0; i < config.segments.length; i++) {
        const startAngle = i * sectorAngle;
        const endAngle = startAngle + sectorAngle;
        const { color, prize } = config.segments[i];

        wheel.beginFill(color);
        wheel.moveTo(0, 0);
        wheel.arc(0, 0, config.radius, startAngle, endAngle);
        wheel.lineTo(0, 0);
        wheel.endFill();

        const text = new PIXI.Text(prize, config.prizeTextStyle);
        const textAngle = startAngle + sectorAngle / 2;
        text.anchor.set(0.5);
        text.position.set((config.radius - 30) * Math.cos(textAngle), (config.radius - 30) * Math.sin(textAngle));
        text.rotation = textAngle + Math.PI / 2;
        wheel.addChild(text);

        const line = new PIXI.Graphics();
        line.lineStyle(3, 0xFFFFFF);
        line.moveTo(0, 0);
        line.lineTo(config.radius * Math.cos(endAngle), config.radius * Math.sin(endAngle));
        wheel.addChild(line);
    }

    wheel.x = centerX;
    wheel.y = centerY;

    border.lineStyle(config.borderThickness, 0x0000FF);
    border.drawCircle(centerX, centerY, config.radius + config.borderThickness);
    border.endFill();
}

function drawTriangleAtWheel() {
    const triangleHeight = 40;
    triangle = new PIXI.Graphics();
    triangle.beginFill(0xFF0000);
    triangle.moveTo(centerX, centerY + config.radius);
    triangle.lineTo(centerX - 20, centerY + config.radius + triangleHeight);
    triangle.lineTo(centerX + 20, centerY + config.radius + triangleHeight);
    triangle.endFill();
    app.stage.addChild(triangle);
}

let spinning = false;

function spinWheel() {
    if (spinning) return;

    spinning = true;
    resultText.text = '';
    totalWinText.text = '';
    backdrop.clear();
    
    const randomAdjustment = Math.random() * Math.PI;
    const rotationTarget = wheel.rotation + (Math.PI * 2 * config.totalRotations) + randomAdjustment;

    let startRotation = wheel.rotation;
    let startTime = null;

    function update(time) {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const t = Math.min(elapsed / config.spinTime, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        wheel.rotation = startRotation + (rotationTarget - startRotation) * ease;

        if (t < 1) {
            requestAnimationFrame(update);
        } else {
            spinning = false;
            const resultAngle = wheel.rotation % (Math.PI * 2);
            const prizeIndex = getPrizeIndex(resultAngle);

            setTimeout(() => {
                backdrop.beginFill(0x000000, 0.5);
                backdrop.drawRect(0, 0, app.view.width, app.view.height);
                backdrop.endFill();
                app.stage.addChild(backdrop);

                const winPrize = config.segments[prizeIndex].prize;
                resultText.text = "Вы выиграли: " + winPrize;

                resultContainer.position.set(centerX, centerY);
                totalWinText.position.set(0, 50);
                
                app.stage.addChild(resultContainer);
                app.view.addEventListener('click', closeResultWindow);
            }, 2000);
        }
    }
    requestAnimationFrame(update);
}

function getPrizeIndex(angle) {
    const sectorAngle = (2 * Math.PI) / config.segments.length;
    let adjustedAngle = angle + Math.PI / 2;
    if (adjustedAngle < 0) {
        adjustedAngle += 2 * Math.PI;
    }
    
    return Math.floor(adjustedAngle / sectorAngle) % config.segments.length;
}

function closeResultWindow(event) {
    const isInsideResultContainer = resultContainer.getBounds().contains(event.clientX, event.clientY);

    if (!isInsideResultContainer) {
        app.stage.removeChild(backdrop);
        app.stage.removeChild(resultContainer);
        app.view.removeEventListener('click', closeResultWindow);
    }
}

const spinButton = new PIXI.Graphics();
spinButton.beginFill(0xffffff);
spinButton.drawRoundedRect(centerX - config.buttonWidth / 2, app.view.height - 150, config.buttonWidth, config.buttonHeight, config.buttonRadius);
spinButton.endFill();

const spinButtonText = new PIXI.Text('Вращать', { fontFamily: 'Arial', fontSize: 36, fill: 'black', align: 'center' });
spinButtonText.anchor.set(0.5);
spinButtonText.x = centerX;
spinButtonText.y = app.view.height - 150 + 30;

spinButton.interactive = true;
spinButton.buttonMode = true;

spinButton.on('pointerdown', () => {
    spinButton.tint = 0xdddddd; 
});
spinButton.on('pointerup', () => {
    spinButton.tint = 0xffffff; 
    spinWheel(); 
});
spinButton.on('pointerover', () => {
    spinButton.tint = 0xcccccc; 
});
spinButton.on('pointerout', () => {
    spinButton.tint = 0xffffff; 
});

app.stage.addChild(spinButton);
app.stage.addChild(spinButtonText);

drawWheel();
app.stage.addChild(wheel);
app.stage.addChild(border);
drawTriangleAtWheel();