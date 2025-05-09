import * as PIXI from './pixi.mjs';


const app = new PIXI.Application({ width: 1920, height: 1080 });
document.getElementById('app').appendChild(app.view);


const centerX = app.view.width / 2;
const centerY = app.view.height / 2;
const radius = 250;
const segments = 8; 
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff7700, 0x7700ff];
const prizes = ['100', '200', '300', '400', '500', '600', '700', '800'];
let wheel = new PIXI.Graphics();
let backdrop = new PIXI.Graphics();
let resultText = new PIXI.Text('', { fontSize: 36, fill: 'white', align: 'center' });
let totalWinText = new PIXI.Text('', { fontSize: 24, fill: 'yellow', align: 'center' });


resultText.anchor.set(0.5);
totalWinText.anchor.set(0.5);


const resultContainer = new PIXI.Container();
resultContainer.addChild(resultText);
resultContainer.addChild(totalWinText);


function drawWheel() {
    wheel.clear();

    const sectorAngle = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
        const startAngle = i * sectorAngle;
        const endAngle = startAngle + sectorAngle;

        wheel.beginFill(colors[i % colors.length]);
        wheel.moveTo(0, 0);
        wheel.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
        wheel.lineTo(radius * Math.cos(endAngle), radius * Math.sin(endAngle));
        wheel.endFill();

  
        const text = new PIXI.Text(prizes[i], { fontSize: 20, fill: 'white' });
        const textAngle = startAngle + sectorAngle / 2; 
        text.anchor.set(0.5);
        text.position.set(
            (radius - 30) * Math.cos(textAngle),  
            (radius - 30) * Math.sin(textAngle)
        );

        text.rotation = textAngle + Math.PI / 2; 
        wheel.addChild(text); 
    }

    wheel.x = centerX;
    wheel.y = centerY; 
}


let spinning = false;
function spinWheel() {
    if (spinning) return;

    spinning = true;
    resultText.text = ''; 
    totalWinText.text = ''; 
    backdrop.clear(); 
    const spinTime = Math.random() * 4000 + 2000; 
    const totalRotations = 5; 


    let rotationTarget = wheel.rotation + (Math.PI * 2 * totalRotations) + (Math.random() * Math.PI * 2);

    
    const ticker = new PIXI.Ticker();
    ticker.add(() => {
        if (spinning) {
            wheel.rotation += 0.1;
            if (wheel.rotation >= rotationTarget) {
                spinning = false;
                ticker.stop();
                const resultAngle = wheel.rotation % (Math.PI * 2);
                const sectorIndex = Math.floor((resultAngle / (Math.PI * 2)) * segments + segments) % segments;
                
             
                backdrop.beginFill(0x000000, 0.5); 
                backdrop.drawRect(0, 0, app.view.width, app.view.height);
                backdrop.endFill();
                app.stage.addChild(backdrop); 

                
                resultText.text = "Вы выиграли: " + prizes[sectorIndex];
                totalWinText.text = "Сумма выигрыша: " + prizes[sectorIndex];

               
                resultContainer.position.set(centerX, centerY); 
                totalWinText.position.set(0, 50); 

                app.stage.addChild(resultContainer); 

          
                app.view.addEventListener('click', closeResultWindow);
            }
        }
    });
    ticker.start();
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
spinButton.drawRoundedRect(centerX - 120, app.view.height - 150, 240, 60, 20); 
spinButton.endFill();

const spinButtonText = new PIXI.Text('Вращать', { fontSize: 36, fill: 'black', align: 'center' }); 
spinButtonText.anchor.set(0.5);
spinButtonText.x = centerX; 
spinButtonText.y = app.view.height - 150 + 30; 

spinButton.interactive = true;
spinButton.buttonMode = true;


spinButton.on('pointerdown', spinWheel);


app.stage.addChild(spinButton);
app.stage.addChild(spinButtonText);


drawWheel();
app.stage.addChild(wheel); 