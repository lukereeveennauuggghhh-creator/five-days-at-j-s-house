const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    scene: GameScene
};

const game = new Phaser.Game(config);

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.currentNight = 1;
        this.nightDuration = 60000; // 1 minute in milliseconds
        this.nightTimer = this.nightDuration;
        this.isGameOver = false;
        this.hasWon = false;
        
        this.power = 100;
        this.powerDrainRate = 0.3; // Power drains per millisecond
        
        this.doorsLocked = {
            left: false,
            right: false
        };
        
        this.characters = [
            { name: 'Character 1', aggression: 0.5, position: 'left' },
            { name: 'Character 2', aggression: 0.7, position: 'right' }
        ];
        
        this.threatLevel = 0;
        
        // Background
        this.add.rectangle(512, 384, 1024, 768, 0x1a1a1a);
        
        // Title
        this.nightText = this.add.text(512, 40, `Night ${this.currentNight}`, {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Timer display
        this.timerText = this.add.text(512, 100, 'Time: 1:00', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Power display
        this.powerText = this.add.text(50, 100, 'Power: 100%', {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0);
        
        // Threat indicator
        this.threatText = this.add.text(50, 150, 'Threat: 0%', {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0);
        
        // Camera view area
        this.add.rectangle(512, 400, 800, 400, 0x000000).setStrokeStyle(2, 0x00ff00);
        this.cameraText = this.add.text(512, 400, 'CAMERA FEED\n\nMonitor the area...', {
            fontSize: '28px',
            fill: '#00ff00',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);
        
        // Door controls
        this.leftDoorText = this.add.text(100, 650, '[L] Left Door: OPEN', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0);
        
        this.rightDoorText = this.add.text(512, 650, '[R] Right Door: OPEN', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0);
        
        // Input handling
        this.input.keyboard.on('keydown-L', () => this.toggleDoor('left'));
        this.input.keyboard.on('keydown-R', () => this.toggleDoor('right'));
        
        this.time.addEvent({
            delay: 100,
            callback: this.update,
            callbackScope: this,
            loop: true
        });
    }
    
    toggleDoor(side) {
        if (this.power < 5) return; // Not enough power
        
        this.doorsLocked[side] = !this.doorsLocked[side];
        this.power -= 5;
        
        const doorText = side === 'left' ? this.leftDoorText : this.rightDoorText;
        const status = this.doorsLocked[side] ? 'LOCKED' : 'OPEN';
        doorText.setText(`[${side === 'left' ? 'L' : 'R'}] ${side.charAt(0).toUpperCase() + side.slice(1)} Door: ${status}`);
    }
    
    update() {
        if (this.isGameOver || this.hasWon) return;
        
        // Update timer
        this.nightTimer -= 100;
        const seconds = Math.ceil(this.nightTimer / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.timerText.setText(`Time: ${minutes}:${secs.toString().padStart(2, '0')}`);
        
        // Update power
        this.power = Math.max(0, this.power - (this.powerDrainRate / 10));
        this.powerText.setText(`Power: ${Math.floor(this.power)}%`);
        
        if (this.power <= 0) {
            this.powerText.setFill('#ff0000');
        }
        
        // Increase threat over time
        this.threatLevel = Math.min(100, (this.nightDuration - this.nightTimer) / this.nightDuration * 100);
        this.threatText.setText(`Threat: ${Math.floor(this.threatLevel)}%`);
        
        // Check if night is over
        if (this.nightTimer <= 0) {
            this.endNight();
        }
        
        // Check for game over (threat gets through)
        if (this.threatLevel > 100 || (this.power <= 0 && this.threatLevel > 80)) {
            this.gameOver();
        }
    }
    
    endNight() {
        this.currentNight++;
        
        if (this.currentNight > 5) {
            this.winGame();
        } else {
            // Reset for next night
            this.nightTimer = this.nightDuration;
            this.threatLevel = 0;
            this.nightText.setText(`Night ${this.currentNight}`);
            this.power = Math.min(100, this.power + 20); // Restore some power
            this.doorsLocked.left = false;
            this.doorsLocked.right = false;
            this.leftDoorText.setText('[L] Left Door: OPEN');
            this.rightDoorText.setText('[R] Right Door: OPEN');
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.add.rectangle(512, 384, 1024, 768, 0x000000).setAlpha(0.7);
        this.add.text(512, 300, 'u touchd', {
            fontSize: '72px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(512, 450, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add.text(512, 550, 'Press R to restart', {
            fontSize: '24px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-R', () => this.scene.restart());
    }
    
    winGame() {
        this.hasWon = true;
        this.add.rectangle(512, 384, 1024, 768, 0x000000).setAlpha(0.7);
        this.add.text(512, 300, 'YOU SURVIVED', {
            fontSize: '72px',
            fill: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(512, 450, '5 DAYS AT BIG JEFF\'S', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add.text(512, 550, 'Press R to play again', {
            fontSize: '24px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-R', () => this.scene.restart());
    }
}\
