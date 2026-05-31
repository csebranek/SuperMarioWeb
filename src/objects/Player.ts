import Phaser from 'phaser';
import { PLAYER, FIRE } from '../constants';

export type PlayerSize = 'small' | 'big' | 'fire';
export type PowerUpKind = 'mushroom' | 'fire';

/**
 * Player controller.
 *
 * Power state machine:
 *   small ──mushroom──▶ big ──fire──▶ fire
 *   small ─────────fire──────────────▶ fire
 *   fire   ──damage──▶ big   ──damage──▶ small ──damage──▶ dead
 *
 * Armor:
 *   - Granted by collecting >= ARMOR.coinThreshold coins (handled in
 *     PlayScene). Consumed by the next damage event (no demotion).
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private fireKey!: Phaser.Input.Keyboard.Key;
  // WASD aliases for movement.
  private wKey!: Phaser.Input.Keyboard.Key;
  private aKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;

  private size: PlayerSize = 'small';
  private isJumping = false;
  private jumpHeldFor = 0;
  private invulnUntil = 0;
  private lastFireAt = 0;

  public alive = true;
  public armor = false;
  /** Set by PlayScene to direct projectiles into its fireballs group. */
  public onShootFireball?: (x: number, y: number, dir: 1 | -1) => void;

  /** Visual armor ring overlay, kept in sync with the player position. */
  private armorRing?: Phaser.GameObjects.Image;
  private facing: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-small');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(PLAYER.maxSpeed, PLAYER.maxFallSpeed);
    body.setDragX(PLAYER.drag);
    body.setSize(18, 26).setOffset(2, 2);

    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.jumpKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fireKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.wKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  public tick(time: number, deltaMs: number): void {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Horizontal movement.
    const left = this.cursors.left?.isDown || this.aKey.isDown;
    const right = this.cursors.right?.isDown || this.dKey.isDown;
    if (left && !right) {
      body.setAccelerationX(-PLAYER.acceleration);
      this.setFlipX(true);
      this.facing = -1;
    } else if (right && !left) {
      body.setAccelerationX(PLAYER.acceleration);
      this.setFlipX(false);
      this.facing = 1;
    } else {
      body.setAccelerationX(0);
    }

    // Jumping.
    const jumpDown =
      this.jumpKey.isDown || this.cursors.up?.isDown || this.cursors.space?.isDown || this.wKey.isDown;
    const jumpJustDown =
      Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
      Phaser.Input.Keyboard.JustDown(this.wKey) ||
      (this.cursors.up ? Phaser.Input.Keyboard.JustDown(this.cursors.up) : false);

    if (jumpJustDown && body.blocked.down) {
      body.setVelocityY(-PLAYER.jumpVelocity);
      this.isJumping = true;
      this.jumpHeldFor = 0;
    }
    if (this.isJumping && jumpDown && body.velocity.y < 0) {
      this.jumpHeldFor += deltaMs;
      if (this.jumpHeldFor < PLAYER.jumpHoldMs) {
        body.velocity.y -= (PLAYER.jumpHoldBoost * deltaMs) / 1000;
      }
    }
    if (!jumpDown || body.velocity.y >= 0) {
      this.isJumping = false;
    }

    // Shoot fireballs (fire state only).
    if (
      this.size === 'fire' &&
      Phaser.Input.Keyboard.JustDown(this.fireKey) &&
      time - this.lastFireAt >= FIRE.cooldownMs &&
      this.onShootFireball
    ) {
      this.lastFireAt = time;
      this.onShootFireball(this.x + this.facing * 12, this.y, this.facing);
    }

    // Clamp X to world.
    if (this.x < 8) {
      this.x = 8;
      body.setVelocityX(0);
    }

    // Invuln flicker.
    if (time < this.invulnUntil) {
      this.setAlpha((Math.floor(time / 60) % 2) === 0 ? 0.4 : 1);
    } else {
      this.setAlpha(1);
    }

    // Keep armor ring glued to us.
    if (this.armorRing) {
      this.armorRing.setPosition(this.x, this.y);
    }
  }

  public isBig(): boolean {
    return this.size === 'big' || this.size === 'fire';
  }

  public isFire(): boolean {
    return this.size === 'fire';
  }

  public powerUp(kind: PowerUpKind): void {
    if (kind === 'mushroom') {
      if (this.size === 'small') this.setSizeState('big');
      return;
    }
    if (kind === 'fire') {
      this.setSizeState('fire');
    }
  }

  /** Returns `true` if the player died from this hit. */
  public takeDamage(time: number): boolean {
    if (time < this.invulnUntil) return false;

    // Armor absorbs the hit without demoting power state.
    if (this.armor) {
      this.armor = false;
      this.removeArmorRing();
      this.invulnUntil = time + 1200;
      return false;
    }

    if (this.size === 'fire') {
      this.setSizeState('big');
      this.invulnUntil = time + 1500;
      return false;
    }
    if (this.size === 'big') {
      this.setSizeState('small');
      this.invulnUntil = time + 1500;
      return false;
    }
    this.die();
    return true;
  }

  public die(): void {
    if (!this.alive) return;
    this.alive = false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAccelerationX(0);
    body.setVelocity(0, -400);
    body.checkCollision.none = true;
    this.setTint(0x444444);
    this.removeArmorRing();
  }

  public bounce(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(-320);
  }

  public grantArmor(): void {
    if (this.armor) return;
    this.armor = true;
    if (!this.armorRing) {
      this.armorRing = this.scene.add
        .image(this.x, this.y, 'armor-ring')
        .setDepth(this.depth + 1)
        .setAlpha(0.85);
      this.scene.tweens.add({
        targets: this.armorRing,
        alpha: { from: 0.6, to: 1.0 },
        duration: 600,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private removeArmorRing(): void {
    if (this.armorRing) {
      this.armorRing.destroy();
      this.armorRing = undefined;
    }
  }

  private setSizeState(next: PlayerSize): void {
    const wasBig = this.isBig();
    this.size = next;
    if (next === 'small') {
      this.setTexture('player-small');
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(18, 26).setOffset(2, 2);
      if (wasBig) this.y += 8;
    } else if (next === 'big') {
      this.setTexture('player-big');
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(18, 42).setOffset(2, 2);
      if (!wasBig) this.y -= 16;
    } else if (next === 'fire') {
      this.setTexture('player-fire');
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(18, 42).setOffset(2, 2);
      if (!wasBig) this.y -= 16;
    }
  }

  /** Used by PlayScene to clean up the standalone armor-ring overlay. */
  public destroyArmorOverlay(): void {
    this.removeArmorRing();
  }
}
