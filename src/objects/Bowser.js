import Phaser from 'phaser';
import { BOSS } from '../constants';
import { BigFireball } from './BigFireball';
/** Bowser boss. Paces back and forth, throws BigFireballs.
 *  Requires BOSS.hp fireball hits (or stomps) to defeat. */
export class Bowser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, bigFireballs, onShockwave) {
        super(scene, x, y, 'bowser');
        Object.defineProperty(this, "alive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "hp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: BOSS.hp
        });
        Object.defineProperty(this, "homeX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dir", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -1
        });
        Object.defineProperty(this, "nextAttackAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "nextShockwaveAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "nextJumpAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "bigFireballs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onShockwave", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.homeX = x;
        this.bigFireballs = bigFireballs;
        this.onShockwave = onShockwave;
        const body = this.body;
        body.setSize(60, 80).setOffset(10, 12);
        body.setMaxVelocity(BOSS.paceSpeed, 800);
        body.setVelocityX(BOSS.paceSpeed * this.dir);
        body.setDragX(0);
        // NOTE: do NOT setImmovable(true) — in Arcade Physics, two immovable
        // bodies can't separate, so an immovable Bowser would fall straight
        // through the (also-immovable) static ground tiles. `pushable = false`
        // is what we actually want: the player can't shove him around, but he
        // still resolves collisions with the ground.
        body.pushable = false;
        this.nextAttackAt = scene.time.now + 1200;
        // First shockwave fires after 5–7 seconds.
        const swRange = BOSS.shockwaveMaxMs - BOSS.shockwaveMinMs;
        this.nextShockwaveAt = scene.time.now + BOSS.shockwaveMinMs + Math.random() * swRange;
        this.nextJumpAt = scene.time.now + 1500;
    }
    tick(now, playerX, playerY) {
        if (!this.alive)
            return;
        const body = this.body;
        // If the physics body has been removed (object destroyed or detached),
        // bail out to avoid runtime errors while the scene update loop still
        // references this object for a short time.
        if (!body)
            return;
        // Pace within ±paceRangeTiles of home.
        const range = BOSS.paceRangeTiles * 32;
        if (this.x < this.homeX - range)
            this.dir = 1;
        if (this.x > this.homeX + range)
            this.dir = -1;
        if (body.blocked.left)
            this.dir = 1;
        if (body.blocked.right)
            this.dir = -1;
        body.setVelocityX(BOSS.paceSpeed * this.dir);
        // Periodic jump (only when grounded).
        if (now >= this.nextJumpAt && body.blocked.down) {
            this.nextJumpAt = now + BOSS.jumpIntervalMs;
            body.setVelocityY(BOSS.jumpVy);
        }
        // Face the player.
        this.setFlipX(playerX > this.x);
        // BigFireball attack.
        if (now >= this.nextAttackAt) {
            this.nextAttackAt = now + BOSS.attackIntervalMs;
            const aim = playerX < this.x ? -1 : 1;
            const fb = new BigFireball(this.scene, this.x + aim * 30, this.y - 10, aim);
            this.bigFireballs.add(fb);
            // Adding to a group can re-init the body; re-apply velocity.
            const fbBody = fb.body;
            fbBody.setVelocity(BOSS.bigFireSpeedX * aim, BOSS.bigFireJumpVy);
            fbBody.setAllowGravity(true);
        }
        // Shockwave AOE — fires every 5–7 seconds regardless of player distance;
        // PlayScene.triggerShockwave handles the distance/damage check.
        if (now >= this.nextShockwaveAt) {
            // Randomise next interval between shockwaveMinMs and shockwaveMaxMs.
            const range = BOSS.shockwaveMaxMs - BOSS.shockwaveMinMs;
            this.nextShockwaveAt = now + BOSS.shockwaveMinMs + Math.random() * range;
            // Telegraph: Bowser flashes before the AOE hits.
            this.scene?.tweens?.add({
                targets: this,
                alpha: 0.4,
                duration: 120,
                yoyo: true,
                repeat: 3,
            });
            this.scene?.time?.delayedCall(BOSS.shockwaveTelegraphMs, () => {
                if (this.alive)
                    this.onShockwave(this.x, this.y);
            });
        }
    }
    /** Deduct one HP. Returns true when Bowser is defeated. */
    hit() {
        if (!this.alive)
            return false;
        this.hp -= 1;
        // Flash red on every hit — guard scene in case callback fires during teardown.
        this.scene?.tweens?.add({
            targets: this,
            tint: { from: 0xffffff, to: 0xff0000 },
            duration: 80,
            yoyo: true,
            onComplete: () => this.clearTint()
        });
        if (this.hp <= 0) {
            this.alive = false;
            const body = this.body;
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
