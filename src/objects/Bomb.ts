import Phaser from 'phaser';
import { WARIO } from '../constants';

/**
 * Wario's grenade-style bomb. Lobbed in an arc (gravity on). Explodes on
 * landing or on player contact, triggering an AOE via the supplied callback.
 */
export class Bomb extends Phaser.Physics.Arcade.Sprite {
  private exploded = false;
  private onExplode: (x: number, y: number) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    dir: 1 | -1,
    onExplode: (x: number, y: number) => void
  ) {
    super(scene, x, y, 'bomb');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.onExplode = onExplode;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 18).setOffset(1, 1);
    body.setAllowGravity(true);
    body.setVelocity(WARIO.bombSpeedX * dir, WARIO.bombJumpVy);
    body.setBounce(0.3, 0.2);
    scene.tweens.add({ targets: this, angle: 360 * dir, duration: 700, repeat: -1 });
  }

  public launch(dir: 1 | -1): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setVelocity(WARIO.bombSpeedX * dir, WARIO.bombJumpVy);
  }

  public tick(): void {
    if (!this.active || this.exploded) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    // Explode shortly after it settles on the ground.
    if (body.blocked.down && Math.abs(body.velocity.x) < 30) {
      this.explode();
    }
  }

  public explode(): void {
    if (this.exploded) return;
    this.exploded = true;
    this.onExplode(this.x, this.y);
    this.destroy();
  }
}
