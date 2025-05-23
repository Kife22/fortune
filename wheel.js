import * as PIXI from './pixi.mjs';

// Конфигурационный объект
const config = {
    width: 1920,
    height: 1080,
    radius: 300,
    borderThickness: 8,
    goldenBorderThickness: 10,
    segments: 8,
    colors: [0x1E90FF, 0x32CD32, 0xFF4500, 0xFFD700, 0x6A5ACD, 0xFF69B4, 0x00CED1, 0x8A2BE2],
    prizes: [400, 300, 200, 100, 800, 700, 600, 500],
    spinTime: 4000,
    totalRotations: 5,
    buttonWidth: 240,
    buttonHeight: 60,
    buttonRadius: 20,
    prizeTextStyle: { fontFamily: 'Arial', fontSize: 24, fill: 'white', align: 'center' },
    totalWinTextStyle: { fontFamily: 'Arial', fontSize: 20, fill: 'yellow', align: 'center' }
};

// Создание приложения PIXI
const app = new PIXI.Application({ width: config.width, height: config.height });
document.getElementById('app').appendChild(app.view);

// Центр координат
const centerX = app.view.width / 2;
const centerY = app.view.height / 2;

let wheel = new PIXI.Graphics();
let border = new PIXI.Graphics();
let goldenBorder = new PIXI.Graphics();
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
    const sectorAngle = (Math.PI * 2) / config.segments;

    for (let i = 0; i < config.segments; i++) {
        const startAngle = i * sectorAngle;
        const endAngle = startAngle + sectorAngle;

        const color = config.colors[i % config.colors.length];
        wheel.beginFill(color);
        wheel.arc(0, 0, config.radius, startAngle, endAngle);
        wheel.lineTo(0, 0);
        wheel.endFill();

        const text = new PIXI.Text('Prize ' + (i + 1), config.prizeTextStyle); // Исправлено здесь
        const textAngle = startAngle + sectorAngle / 2;
        text.anchor.set(0.5);
        text.position.set((config.radius - 30) * Math.cos(textAngle), (config.radius - 30) * Math.sin(textAngle));
        text.rotation = textAngle + Math.PI / 2;
        wheel.addChild(text);
    }

    wheel.x = centerX;
    wheel.y = centerY;

    border.lineStyle(config.borderThickness, 0xffd700);
    border.drawCircle(centerX, centerY, config.radius + config.borderThickness);
    border.endFill();

    goldenBorder.lineStyle(config.goldenBorderThickness, 0x0000ff);
    goldenBorder.drawCircle(centerX, centerY, config.radius + config.borderThickness + config.goldenBorderThickness);
    goldenBorder.endFill();
}

    wheel.x = centerX;
    wheel.y = centerY;

    border.lineStyle(config.borderThickness, 0xffd700);
    border.drawCircle(centerX, centerY, config.radius + config.borderThickness);
    border.endFill();

    goldenBorder.lineStyle(config.goldenBorderThickness, 0x0000ff);
    goldenBorder.drawCircle(centerX, centerY, config.radius + config.borderThickness + config.goldenBorderThickness);
    goldenBorder.endFill();


function drawTriangleAtWheel() {
    const triangleHeight = 40;
    triangle = new PIXI.Graphics();
    triangle.beginFill(0xffd700);
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

            const angleAtTriangle = Math.PI / 2;
            const resultAngle = (wheel.rotation % (Math.PI * 2));
            const adjustedAngle = resultAngle + angleAtTriangle;

            const sectorIndex = Math.floor(((adjustedAngle + (Math.PI * 2)) % (Math.PI * 2)) / (Math.PI * 2) * config.segments) % config.segments;

            // Валидация индекса
            const winAmount = config.prizes[sectorIndex] !== undefined ? config.prizes[sectorIndex] : 0;

            setTimeout(() => {
                backdrop.beginFill(0x000000, 0.5);
                backdrop.drawRect(0, 0, app.view.width, app.view.height);
                backdrop.endFill();
                app.stage.addChild(backdrop);

                resultText.text = "Вы выиграли: " + winAmount;
                totalWinText.text = "Сумма выигрыша: " + winAmount;

                resultContainer.position.set(centerX, centerY);
                totalWinText.position.set(0, 50);

                app.stage.addChild(resultContainer);
                app.view.addEventListener('click', closeResultWindow);
            }, 2000);
        }
    }
    requestAnimationFrame(update);
}

function closeResultWindow(event) {
    const isInsideResultContainer = resultContainer.getBounds().contains(event.clientX, event.clientY);

    if (!isInsideResultContainer) {
        app.stage.removeChild(backdrop);
        app.stage.removeChild(resultContainer);
        app.view.removeEventListener('click', closeResultWindow);
    }
}

// Создание кнопки вращения
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

// Добавление эффектов для кнопки
spinButton.on('pointerdown', () => {
    spinButton.tint = 0xdddddd; // Уменьшаем яркость
});
spinButton.on('pointerup', () => {
    spinButton.tint = 0xffffff; // Восстанавливаем цвет
    spinWheel(); // Запускаем вращение
});
spinButton.on('pointerover', () => {
    spinButton.tint = 0xcccccc; // Меняем цвет при наведении
});
spinButton.on('pointerout', () => {
    spinButton.tint = 0xffffff; // Восстанавливаем цвет при уходе
});

app.stage.addChild(spinButton);
app.stage.addChild(spinButtonText);

// Рисование колеса, окантовки и треугольника
drawWheel();
app.stage.addChild(wheel);
app.stage.addChild(border);
app.stage.addChild(goldenBorder);
drawTriangleAtWheel();