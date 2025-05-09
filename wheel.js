import * as PIXI from './pixi.mjs';

// Размеры приложения
const app = new PIXI.Application({ width: 1920, height: 1080 });
document.getElementById('app').appendChild(app.view);

// Центрирование
const centerX = app.view.width / 2;
const centerY = app.view.height / 2;
const radius = 250;
const segments = 8; // Количество секторов
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff7700, 0x7700ff];
const prizes = ['100', '200', '300', '400', '500', '600', '700', '800'];
let wheel = new PIXI.Graphics();
let backdrop = new PIXI.Graphics();
let resultText = new PIXI.Text('', { fontSize: 36, fill: 'white', align: 'center' });
let totalWinText = new PIXI.Text('', { fontSize: 24, fill: 'yellow', align: 'center' });

// Настраиваем текст
resultText.anchor.set(0.5);
totalWinText.anchor.set(0.5);

// Добавляем контейнер для результатов
const resultContainer = new PIXI.Container();
resultContainer.addChild(resultText);
resultContainer.addChild(totalWinText);

// Функция для рисования колеса
function drawWheel() {
    wheel.clear();

    const sectorAngle = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
        const startAngle = i * sectorAngle;
        const endAngle = startAngle + sectorAngle;

        wheel.beginFill(colors[i % colors.length]);
        wheel.moveTo(0, 0); // Центрирование относительно (0, 0)
        wheel.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
        wheel.lineTo(radius * Math.cos(endAngle), radius * Math.sin(endAngle));
        wheel.endFill();

        // Добавление текста на колесо
        const text = new PIXI.Text(prizes[i], { fontSize: 20, fill: 'white' });
        const textAngle = startAngle + sectorAngle / 2; // Центр сектора
        text.anchor.set(0.5);
        text.position.set(
            (radius - 30) * Math.cos(textAngle),  // Уменьшаем радиус для текста
            (radius - 30) * Math.sin(textAngle)
        );

        // Поворачиваем текст
        text.rotation = textAngle + Math.PI / 2; // Поворачиваем текст, чтобы он был ровно
        wheel.addChild(text); // Добавляем текст в графику колеса
    }

    wheel.x = centerX;
    wheel.y = centerY; // Центрируем графику
}

// Функция вращения колеса
let spinning = false;
function spinWheel() {
    if (spinning) return;

    spinning = true;
    resultText.text = ''; // Очищаем текст выигрыша
    totalWinText.text = ''; // Очищаем текст суммы
    backdrop.clear(); // Очищаем фон

    const spinTime = Math.random() * 4000 + 2000; // Время вращения
    const totalRotations = 5; // Количество полных оборотов

    // Используем Tween для анимации
    let rotationTarget = wheel.rotation + (Math.PI * 2 * totalRotations) + (Math.random() * Math.PI * 2);

    // Создание анимации вращения
    const ticker = new PIXI.Ticker();
    ticker.add(() => {
        if (spinning) {
            wheel.rotation += 0.1; // Увеличиваем угол вращения
            if (wheel.rotation >= rotationTarget) {
                spinning = false;
                ticker.stop();
                const resultAngle = wheel.rotation % (Math.PI * 2);
                const sectorIndex = Math.floor((resultAngle / (Math.PI * 2)) * segments + segments) % segments;
                
                // Добавляем затемнение
                backdrop.beginFill(0x000000, 0.5); // Небольшое затемнение
                backdrop.drawRect(0, 0, app.view.width, app.view.height);
                backdrop.endFill();
                app.stage.addChild(backdrop); // Добавляем затемнение на сцену

                // Обновляем текст выигрыша и суммы
                resultText.text = "Вы выиграли: " + prizes[sectorIndex];
                totalWinText.text = "Сумма выигрыша: " + prizes[sectorIndex];

                // Центрируем текст в контейнере
                resultContainer.position.set(centerX, centerY); // Центрируем контейнер
                totalWinText.position.set(0, 50); // Позиция для суммы выигрыша

                app.stage.addChild(resultContainer); // Добавляем контейнер с результатами на сцену

                // Добавляем обработчик клика для закрытия окна
                app.view.addEventListener('click', closeResultWindow);
            }
        }
    });
    ticker.start();
}

// Функция закрытия окна выигрыша
function closeResultWindow(event) {
    // Проверяем, попадает ли клик вне контейнера результата
    const isInsideResultContainer = resultContainer.getBounds().contains(event.clientX, event.clientY);

    if (!isInsideResultContainer) {
        // Удаляем затемнение и контейнер сбоку с результатами
        app.stage.removeChild(backdrop);
        app.stage.removeChild(resultContainer);

        // Удаляем обработчик клика
        app.view.removeEventListener('click', closeResultWindow);
    }
}

// Кнопка спин
const spinButton = new PIXI.Graphics();
spinButton.beginFill(0xffffff); // Цвет рамки кнопки (белый)
spinButton.drawRoundedRect(centerX - 120, app.view.height - 150, 240, 60, 20); // Прямоугольная кнопка с закругленными углами
spinButton.endFill();

const spinButtonText = new PIXI.Text('Вращать', { fontSize: 36, fill: 'black', align: 'center' }); // Чёрный текст
spinButtonText.anchor.set(0.5);
spinButtonText.x = centerX; // Центрируем текст по оси X
spinButtonText.y = app.view.height - 150 + 30; // Центруем текст по вертикали

spinButton.interactive = true;
spinButton.buttonMode = true;

// Добавляем обработчик события
spinButton.on('pointerdown', spinWheel);

// Добавляем кнопку на сцену
app.stage.addChild(spinButton);
app.stage.addChild(spinButtonText);

// Инициализация колеса
drawWheel();
app.stage.addChild(wheel); // Добавляем колесо на сцену