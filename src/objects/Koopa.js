import Phaser from 'phaser';
import { ENEMY } from '../constants';
export class Koopa extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'koopa');
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'walk'
        });
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
        body.setSize(22, 32).setOffset(2, 4);
        body.setVelocityX(ENEMY.koopaSpeed * this.dir);
    }
    /** Re-apply walking velocity (call after adding to a group). */
    kickstart() {
        if (this.state === 'walk') {
            this.body.setVelocityX(ENEMY.koopaSpeed * this.dir);
        }
    }
    tick() {
        if (!this.alive)
            return;
        const body = this.body;
        if (this.state === 'walk' || this.state === 'sliding') {
            if (body.blocked.left || body.blocked.right) {
                this.dir = this.dir === 1 ? -1 : 1;
                const speed = this.state === 'sliding' ? ENEMY.shellSpeed : ENEMY.koopaSpeed;
                body.setVelocityX(speed * this.dir);
            }
            // Walking koopas also respect ledges (sliding shells do NOT — they
            // should fly off into pits, classic Mario behaviour).
            if (this.state === 'walk' && body.blocked.down) {
                const probeX = this.dir === 1 ? body.right + 2 : body.left - 4;
                const probeY = body.bottom + 2;
                const hits = this.scene.physics.overlapRect(probeX, probeY, 2, 6, false, true);
                if (hits.length === 0) {
                    this.dir = this.dir === 1 ? -1 : 1;
                    body.setVelocityX(ENEMY.koopaSpeed * this.dir);
                }
            }
        }
    }
    stomp() {
        if (this.state === 'walk') {
            this.state = 'shell';
            this.setTexture('shell');
            const body = this.body;
            body.setSize(22, 18).setOffset(2, 2);
            body.setVelocityX(0);
        }
        else if (this.state === 'sliding') {
            // Stopping a sliding shell.
            this.state = 'shell';
            this.body.setVelocityX(0);
        }
    }
    kick(fromX) {
        if (this.state !== 'shell')
            return;
        this.state = 'sliding';
        this.dir = this.x < fromX ? -1 : 1;
        this.body.setVelocityX(ENEMY.shellSpeed * this.dir);
    }
    isHarmless() {
        return this.state === 'shell';
    }
}
