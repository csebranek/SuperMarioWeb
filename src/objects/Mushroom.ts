import Phaser from 'phaser';

/**
 * Mushroom power-up. Once spawned it walks horizontally and is affected by
 * gravity; if it hits a wall it reverses direction.
 */
export class Mushroom extends Phaser.Physics.Arcade.Sprite {
  private dir: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'mushroom');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(22, 20).setOffset(2, 2);
    body.setVelocityX(90 * this.dir);
    // Small upward pop so the mushroom visibly emerges from the block.
    body.setVelocityY(-180);
  }

  /**
   * Re-apply movement after being added to a physics group (the group's
   * config can reset the body) and aim away from the player so the player
   * doesn't accidentally walk straight into it.
   */
  public kickstart(playerX: number): void {
    this.dir = playerX < this.x ? 1 : -1;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(90 * this.dir);
    body.setVelocityY(-180);
  }

  public tick(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left || body.blocked.right) {
      this.dir = this.dir === 1 ? -1 : 1;
      body.setVelocityX(90 * this.dir);
    }
  }
}
