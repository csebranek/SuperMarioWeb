import Phaser from 'phaser';
import { BOSS } from '../constants';

/** Bowser's fireball. Bounces off the floor forever.
 *  Destroyed only when it hits a wall or the player (handled in PlayScene). */
export class BigFireball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, dir: 1 | -1) {
    super(scene, x, y, 'big-fireball');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(22, 22).setOffset(2, 2);
    body.setVelocity(BOSS.bigFireSpeedX * dir, BOSS.bigFireJumpVy);
    body.setAllowGravity(true);
    // Spin animation — no timer, lives until it hits something.
    scene.tweens.add({ targets: this, angle: 360 * dir, duration: 800, repeat: -1 });
  }

  public tick(): void {
    if (!this.active) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    // Bounce off the floor indefinitely.
    if (body.blocked.down) {
      body.setVelocityY(BOSS.bigFireJumpVy * 0.6);
    }
    // Disappear only on wall contact.
    if (body.blocked.left || body.blocked.right) {
      this.destroy();
    }
  }
}
