import Phaser from 'phaser';
import { FIRE } from '../constants';

/**
 * A player fireball: arcing projectile that bounces off the ground a few
 * times and dies on contact with walls or enemies.
 */
export class Fireball extends Phaser.Physics.Arcade.Sprite {
  private bounces = 0;
  private dieAt = 0;
  private dir: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, dir: 1 | -1) {
    super(scene, x, y, 'fireball');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 10).setOffset(1, 1);
    body.setAllowGravity(true);
    this.dir = dir;
    this.launch();
    this.dieAt = scene.time.now + FIRE.lifetimeMs;
  }

  /** Re-apply launch velocity. MUST be called after adding to a group, as
   *  Phaser groups can re-initialise the body and clear velocity. */
  public launch(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(FIRE.speedX * this.dir, FIRE.jumpVy);
  }

  public tick(now: number): void {
    if (now >= this.dieAt) {
      this.destroy();
      return;
    }
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down) {
      this.bounces += 1;
      if (this.bounces >= FIRE.maxBounces) {
        this.destroy();
        return;
      }
      body.setVelocityY(FIRE.bounceVy);
    }
    if (body.blocked.left || body.blocked.right) {
      this.destroy();
    }
  }
}
