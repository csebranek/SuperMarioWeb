import Phaser from 'phaser';
import { WARIO } from '../constants';

/**
 * Wario's throwing knife. Flies horizontally at a fixed height (no gravity)
 * toward the player. Destroyed on wall contact, after its lifetime expires, or
 * on player contact (handled in PlayScene).
 */
export class ThrowingKnife extends Phaser.Physics.Arcade.Sprite {
  private dieAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number, dir: 1 | -1) {
    super(scene, x, y, 'knife');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 8).setOffset(1, 4);
    body.setAllowGravity(false);
    body.setVelocity(WARIO.knifeSpeed * dir, 0);
    this.setFlipX(dir < 0);
    this.dieAt = scene.time.now + WARIO.knifeLifetimeMs;
  }

  public launch(dir: 1 | -1): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(WARIO.knifeSpeed * dir, 0);
  }

  public tick(now: number): void {
    if (!this.active) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    if (body.blocked.left || body.blocked.right || now >= this.dieAt) {
      this.destroy();
    }
  }
}
