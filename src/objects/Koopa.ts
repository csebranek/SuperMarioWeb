import Phaser from 'phaser';
import { ENEMY } from '../constants';

/**
 * A Koopa walks until stomped, at which point it becomes a stationary shell.
 * Touching the shell from the side kicks it; a kicked shell slides and
 * destroys anything in its path (including the player if they touch it from
 * the side).
 */
export type KoopaState = 'walk' | 'shell' | 'sliding';

export class Koopa extends Phaser.Physics.Arcade.Sprite {
  public state: KoopaState = 'walk';
  public alive = true;
  private dir: 1 | -1 = -1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'koopa');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(22, 32).setOffset(2, 4);
    body.setVelocityX(ENEMY.koopaSpeed * this.dir);
  }

  /** Re-apply walking velocity (call after adding to a group). */
  public kickstart(): void {
    if (this.state === 'walk') {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(ENEMY.koopaSpeed * this.dir);
    }
  }

  public tick(): void {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.state === 'walk' || this.state === 'sliding') {
      if (body.blocked.left || body.blocked.right) {
        this.dir = this.dir === 1 ? -1 : 1;
        const speed = this.state === 'sliding' ? ENEMY.shellSpeed : ENEMY.koopaSpeed;
        body.setVelocityX(speed * this.dir);
      }
      // Walking koopas also respect ledges (sliding shells do NOT — they
      // should fly off into pits, classic Mario behaviour).
      if (this.state === 'walk' && body.blocked.down) {
        const probeX = this.dir === 1 ? body.right + 2 : body.left - 4;
        const probeY = body.bottom + 2;
        const hits = this.scene.physics.overlapRect(probeX, probeY, 2, 6, false, true);
        if (hits.length === 0) {
          this.dir = this.dir === 1 ? -1 : 1;
          body.setVelocityX(ENEMY.koopaSpeed * this.dir);
        }
      }
    }
  }

  public stomp(): void {
    if (this.state === 'walk') {
      this.state = 'shell';
      this.setTexture('shell');
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(22, 18).setOffset(2, 2);
      body.setVelocityX(0);
    } else if (this.state === 'sliding') {
      // Stopping a sliding shell.
      this.state = 'shell';
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }
  }

  public kick(fromX: number): void {
    if (this.state !== 'shell') return;
    this.state = 'sliding';
    this.dir = this.x < fromX ? -1 : 1;
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(ENEMY.shellSpeed * this.dir);
  }

  public isHarmless(): boolean {
    return this.state === 'shell';
  }
}
