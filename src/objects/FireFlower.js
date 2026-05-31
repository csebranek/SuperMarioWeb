import Phaser from 'phaser';
/** Stationary fire-flower power-up. Picked up on overlap. */
export class FireFlower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'fire-flower');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body
        scene.tweens.add({
            targets: this,
            y: y - 4,
            duration: 700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}
