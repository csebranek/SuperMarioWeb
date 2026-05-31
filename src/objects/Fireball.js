import Phaser from 'phaser';
import { FIRE } from '../constants';
/**
 * A player fireball: arcing projectile that bounces off the ground a few
 * times and dies on contact with walls or enemies.
 */
export class Fireball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, dir) {
        super(scene, x, y, 'fireball');
        Object.defineProperty(this, "bounces", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "dieAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "dir", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body;
        body.setSize(10, 10).setOffset(1, 1);
        body.setAllowGravity(true);
        this.dir = dir;
        this.launch();
        this.dieAt = scene.time.now + FIRE.lifetimeMs;
    }
    /** Re-apply launch velocity. MUST be called after adding to a group, as
     *  Phaser groups can re-initialise the body and clear velocity. */
    launch() {
        const body = this.body;
        body.setVelocity(FIRE.speedX * this.dir, FIRE.jumpVy);
    }
    tick(now) {
        if (now >= this.dieAt) {
            this.destroy();
            return;
        }
        const body = this.body;
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
