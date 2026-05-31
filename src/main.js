import Phaser from 'phaser';
import { PlayScene } from './scenes/PlayScene';
import { UIScene } from './scenes/UIScene';
import { GameOverScene } from './scenes/GameOverScene';
/**
 * Phaser game configuration.
 *
 * - Arcade Physics gives us simple AABB collisions, fast enough for a
 *   classic-style platformer.
 * - `gravity.y` is a constant downward acceleration (pixels/sec^2). Each frame
 *   Arcade adds `gravity * dt` to the body's `velocity.y`, which is what makes
 *   the player fall faster the longer they're airborne. We cap with
 *   `body.setMaxVelocity` inside the Player class so we never exceed a
 *   "terminal velocity".
 */
const config = {
    type: Phaser.AUTO,
    parent: 'game-root',
    backgroundColor: '#5c94fc', // classic Mario sky blue
    width: 960,
    height: 540,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 1400 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [PlayScene, UIScene, GameOverScene]
};
// eslint-disable-next-line no-new
new Phaser.Game(config);
