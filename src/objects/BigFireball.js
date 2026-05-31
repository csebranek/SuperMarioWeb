import Phaser from 'phaser';
import { BOSS } from '../constants';
/**
 * Bowser's BigFireball — slower and arcing so the player has time to jump
 * over it. Lethal on contact (or breaks armor).
 */
export class BigFireball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, dir) {
        super(scene, x, y, 'big-fireball');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body;
        body.setSize(22, 22).setOffset(2, 2);
        body.setVelocity(BOSS.bigFireSpeedX * dir, BOSS.bigFireJumpVy);
        body.setAllowGravity(true);
        scene.tweens.add({
            targets: this,
            angle: 360 * dir,
            duration: 800,
            repeat: -1
        });
        scene.time.delayedCall(4500, () => this.destroy());
    }
    tick() {
        const body = this.body;
        if (body.blocked.down) {
            // One little bounce, then dies on second floor contact.
            body.setVelocityY(BOSS.bigFireJumpVy * 0.6);
            this.scene.time.delayedCall(600, () => this.destroy());
        }
    }
}
