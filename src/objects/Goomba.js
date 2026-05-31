import Phaser from 'phaser';
import { ENEMY } from '../constants';
/**
 * A Goomba walks in one direction at a constant speed, reverses when it hits
 * a wall, and dies when stomped from above.
 */
export class Goomba extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'goomba');
        Object.defineProperty(this, "alive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "dir", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -1
        });
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body;
        body.setSize(24, 22).setOffset(2, 4);
        body.setVelocityX(ENEMY.goombaSpeed * this.dir);
    }
    /** Re-apply walking velocity (call after adding to a group). */
    kickstart() {
        this.body.setVelocityX(ENEMY.goombaSpeed * this.dir);
    }
    tick() {
        if (!this.alive)
            return;
        const body = this.body;
        // Reverse direction when blocked horizontally.
        if (body.blocked.left || body.blocked.right) {
            this.reverse(ENEMY.goombaSpeed);
        }
        // Ledge detection: when grounded, probe just past the leading foot for a
        // solid tile. If none, reverse so we don't walk off the edge.
        if (body.blocked.down) {
            const probeX = this.dir === 1 ? body.right + 2 : body.left - 4;
            const probeY = body.bottom + 2;
            const hits = this.scene.physics.overlapRect(probeX, probeY, 2, 6, false, true);
            if (hits.length === 0) {
                this.reverse(ENEMY.goombaSpeed);
            }
        }
    }
    reverse(speed) {
        this.dir = this.dir === 1 ? -1 : 1;
        this.body.setVelocityX(speed * this.dir);
    }
    stomp() {
        if (!this.alive)
            return;
        this.alive = false;
        this.setTexture('goomba-flat');
        const body = this.body;
        body.setVelocity(0, 0);
        body.checkCollision.none = true;
        this.scene.time.delayedCall(500, () => this.destroy());
    }
}
