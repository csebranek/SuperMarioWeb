import Phaser from 'phaser';
import { PLAYER, FIRE } from '../constants';
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
    constructor(scene, x, y) {
        super(scene, x, y, 'player-small');
        Object.defineProperty(this, "cursors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "jumpKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fireKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // WASD aliases for movement.
        Object.defineProperty(this, "wKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "aKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'small'
        });
        Object.defineProperty(this, "isJumping", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "jumpHeldFor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "invulnUntil", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastFireAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "alive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "armor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /** Set by PlayScene to direct projectiles into its fireballs group. */
        Object.defineProperty(this, "onShootFireball", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Visual armor ring overlay, kept in sync with the player position. */
        Object.defineProperty(this, "armorRing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "facing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body;
        body.setMaxVelocity(PLAYER.maxSpeed, PLAYER.maxFallSpeed);
        body.setDragX(PLAYER.drag);
        body.setSize(18, 26).setOffset(2, 2);
        const kb = scene.input.keyboard;
        this.cursors = kb.createCursorKeys();
        this.jumpKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.fireKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.wKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }
    tick(time, deltaMs) {
        if (!this.alive)
            return;
        const body = this.body;
        // Horizontal movement.
        const left = this.cursors.left?.isDown || this.aKey.isDown;
        const right = this.cursors.right?.isDown || this.dKey.isDown;
        if (left && !right) {
            body.setAccelerationX(-PLAYER.acceleration);
            this.setFlipX(true);
            this.facing = -1;
        }
        else if (right && !left) {
            body.setAccelerationX(PLAYER.acceleration);
            this.setFlipX(false);
            this.facing = 1;
        }
        else {
            body.setAccelerationX(0);
        }
        // Jumping.
        const jumpDown = this.jumpKey.isDown || this.cursors.up?.isDown || this.cursors.space?.isDown || this.wKey.isDown;
        const jumpJustDown = Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
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
        if (this.size === 'fire' &&
            Phaser.Input.Keyboard.JustDown(this.fireKey) &&
            time - this.lastFireAt >= FIRE.cooldownMs &&
            this.onShootFireball) {
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
        }
        else {
            this.setAlpha(1);
        }
        // Keep armor ring glued to us.
        if (this.armorRing) {
            this.armorRing.setPosition(this.x, this.y);
        }
    }
    isBig() {
        return this.size === 'big' || this.size === 'fire';
    }
    isFire() {
        return this.size === 'fire';
    }
    powerUp(kind) {
        if (kind === 'mushroom') {
            if (this.size === 'small')
                this.setSizeState('big');
            return;
        }
        if (kind === 'fire') {
            this.setSizeState('fire');
        }
    }
    /** Returns `true` if the player died from this hit. */
    takeDamage(time) {
        if (time < this.invulnUntil)
            return false;
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
    die() {
        if (!this.alive)
            return;
        this.alive = false;
        const body = this.body;
        body.setAccelerationX(0);
        body.setVelocity(0, -400);
        body.checkCollision.none = true;
        this.setTint(0x444444);
        this.removeArmorRing();
    }
    bounce() {
        this.body.setVelocityY(-320);
    }
    grantArmor() {
        if (this.armor)
            return;
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
    removeArmorRing() {
        if (this.armorRing) {
            this.armorRing.destroy();
            this.armorRing = undefined;
        }
    }
    setSizeState(next) {
        const wasBig = this.isBig();
        this.size = next;
        if (next === 'small') {
            this.setTexture('player-small');
            const body = this.body;
            body.setSize(18, 26).setOffset(2, 2);
            if (wasBig)
                this.y += 8;
        }
        else if (next === 'big') {
            this.setTexture('player-big');
            const body = this.body;
            body.setSize(18, 42).setOffset(2, 2);
            if (!wasBig)
                this.y -= 16;
        }
        else if (next === 'fire') {
            this.setTexture('player-fire');
            const body = this.body;
            body.setSize(18, 42).setOffset(2, 2);
            if (!wasBig)
                this.y -= 16;
        }
    }
    /** Used by PlayScene to clean up the standalone armor-ring overlay. */
    destroyArmorOverlay() {
        this.removeArmorRing();
    }
}
