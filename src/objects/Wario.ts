import Phaser from 'phaser';
import { WARIO } from '../constants';
import { ThrowingKnife } from './ThrowingKnife';
import { Bomb } from './Bomb';

/**
 * Wario boss (levels 1 test arena + 15 finale).
 *
 * Abilities:
 *   - Throw attack that alternates between a throwing knife (flat trajectory at
 *     one of three heights relative to the player) and a lobbed bomb/grenade
 *     that explodes into an AOE on landing.
 *   - Lasso: periodically reels the player in like a cowboy's noose, dealing
 *     damage (handled by the onLasso callback in PlayScene).
 *   - AOE shockwave centered on himself, telegraphed before it lands.
 *
 * Requires `hp` fireball hits (or stomps) to defeat.
 */
export class Wario extends Phaser.Physics.Arcade.Sprite {
  public alive = true;
  public hp: number = WARIO.hp;

  private homeX: number;
  private dir: 1 | -1 = -1;
  private nextThrowAt = 0;
  private throwIsKnife = true;
  private nextLassoAt = 0;
  private nextAoeAt = 0;
  private nextJumpAt = 0;

  private projectiles: Phaser.Physics.Arcade.Group;
  private onShockwave: (x: number, y: number) => void;
  private onLasso: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    projectiles: Phaser.Physics.Arcade.Group,
    onShockwave: (x: number, y: number) => void,
    onLasso: () => void,
    hp: number = WARIO.hp
  ) {
    super(scene, x, y, 'wario');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.homeX = x;
    this.hp = hp;
    this.projectiles = projectiles;
    this.onShockwave = onShockwave;
    this.onLasso = onLasso;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(44, 64).setOffset(8, 12);
    body.setMaxVelocity(WARIO.paceSpeed, 800);
    body.setVelocityX(WARIO.paceSpeed * this.dir);
    body.setDragX(0);
    body.pushable = false;

    this.nextThrowAt = scene.time.now + 1000;
    this.nextLassoAt = scene.time.now + WARIO.lassoIntervalMs;
    this.nextAoeAt = scene.time.now + WARIO.aoeIntervalMs;
    this.nextJumpAt = scene.time.now + 1500;
  }

  public tick(now: number, playerX: number, playerY: number): void {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    // Pace within ±paceRangeTiles of home.
    const range = WARIO.paceRangeTiles * 32;
    if (this.x < this.homeX - range) this.dir = 1;
    if (this.x > this.homeX + range) this.dir = -1;
    if (body.blocked.left) this.dir = 1;
    if (body.blocked.right) this.dir = -1;
    body.setVelocityX(WARIO.paceSpeed * this.dir);

    // Periodic jump (only when grounded).
    if (now >= this.nextJumpAt && body.blocked.down) {
      this.nextJumpAt = now + WARIO.jumpIntervalMs;
      body.setVelocityY(WARIO.jumpVy);
    }

    // Face the player.
    this.setFlipX(playerX > this.x);

    const aim: 1 | -1 = playerX < this.x ? -1 : 1;

    // Throw attack — alternates knife <-> bomb.
    if (now >= this.nextThrowAt) {
      this.nextThrowAt = now + WARIO.throwIntervalMs;
      if (this.throwIsKnife) {
        this.throwKnife(aim, playerY);
      } else {
        this.throwBomb(aim);
      }
      this.throwIsKnife = !this.throwIsKnife;
    }

    // Lasso reel-in.
    if (now >= this.nextLassoAt) {
      this.nextLassoAt = now + WARIO.lassoIntervalMs;
      this.onLasso();
    }

    // AOE shockwave centered on Wario, telegraphed.
    if (now >= this.nextAoeAt) {
      this.nextAoeAt = now + WARIO.aoeIntervalMs;
      this.scene?.tweens?.add({
        targets: this,
        alpha: 0.4,
        duration: 120,
        yoyo: true,
        repeat: 3
      });
      this.scene?.time?.delayedCall(WARIO.aoeTelegraphMs, () => {
        if (this.alive) this.onShockwave(this.x, this.y);
      });
    }
  }

  private throwKnife(aim: 1 | -1, playerY: number): void {
    // Three heights: close to the ground, around Mario's height, or a couple
    // tiles above Mario.
    const mode = Phaser.Math.Between(0, 2);
    let y = this.y;
    if (mode === 0) y = playerY + 22; // low — rides close to the ground
    else if (mode === 1) y = playerY; // about Mario's height
    else y = playerY - 70; // a couple tiles above Mario
    const knife = new ThrowingKnife(this.scene, this.x + aim * 28, y, aim);
    this.projectiles.add(knife);
    knife.launch(aim);
  }

  private throwBomb(aim: 1 | -1): void {
    const bomb = new Bomb(this.scene, this.x + aim * 24, this.y - 24, aim, (sx, sy) =>
      this.onShockwave(sx, sy)
    );
    this.projectiles.add(bomb);
    bomb.launch(aim);
  }

  /** Deduct one HP. Returns true when Wario is defeated. */
  public hit(): boolean {
    if (!this.alive) return false;
    this.hp -= 1;
    this.scene?.tweens?.add({
      targets: this,
      tint: { from: 0xffffff, to: 0xff0000 },
      duration: 80,
      yoyo: true,
      onComplete: () => this.clearTint()
    });
    if (this.hp <= 0) {
      this.alive = false;
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(0, -300);
        body.checkCollision.none = true;
      }
      this.setTint(0x444444);
      this.scene?.time?.delayedCall(800, () => this.destroy());
      return true;
    }
    return false;
  }
}
