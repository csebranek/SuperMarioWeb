import Phaser from 'phaser';

/** Shown at end of run — both for victory and game-over. */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { score: number; won: boolean }): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    const title = data.won ? 'LEVEL CLEAR!' : 'GAME OVER';
    this.add
      .text(width / 2, height / 2 - 60, title, {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: data.won ? '#7cffae' : '#ff7c7c',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `Final Score: ${data.score}`, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 60, 'Press SPACE or ENTER to play again', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    const restart = () => this.scene.start('PlayScene');
    this.input.keyboard?.once('keydown-SPACE', restart);
    this.input.keyboard?.once('keydown-ENTER', restart);
  }
}
