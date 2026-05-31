import Phaser from 'phaser';
/**
 * Mushroom power-up. Once spawned it walks horizontally and is affected by
 * gravity; if it hits a wall it reverses direction.
 */
export class Mushroom extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'mushroom');
        Object.defineProperty(this, "dir", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body;
        body.setSize(22, 20).setOffset(2, 2);
        body.setVelocityX(90 * this.dir);
        // Small upward pop so the mushroom visibly emerges from the block.
        body.setVelocityY(-180);
    }
    /**
     * Re-apply movement after being added to a physics group (the group's
     * config can reset the body) and aim away from the player so the player
     * doesn't accidentally walk straight into it.
     */
    kickstart(playerX) {
        this.dir = playerX < this.x ? 1 : -1;
        const body = this.body;
        body.setVelocityX(90 * this.dir);
        body.setVelocityY(-180);
    }
    tick() {
        const body = this.body;
        if (body.blocked.left || body.blocked.right) {
            this.dir = this.dir === 1 ? -1 : 1;
            body.setVelocityX(90 * this.dir);
        }
    }
}
