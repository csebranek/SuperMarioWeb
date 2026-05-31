import Phaser from 'phaser';
import { TILE } from '../constants';
/** End-of-level flagpole. Overlap with the pole or flag triggers level clear. */
export class Flag extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        Object.defineProperty(this, "pole", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "flag", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        scene.add.existing(this);
        this.pole = scene.add.image(0, 0, 'flagpole').setOrigin(0.5, 1);
        this.flag = scene.add.image(10, -TILE * 9, 'flag').setOrigin(0, 0.5);
        this.add([this.pole, this.flag]);
        scene.physics.add.existing(this, false);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(8, TILE * 10);
        this.body.setOffset(-4, -TILE * 10);
    }
}
