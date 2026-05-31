import Phaser from 'phaser';

/** Free-floating collectible coin (overlap only, no physics body movement).
 *
 *  Implementation note: the sprite has a small bobbing tween for visual
 *  flair, but a static physics body does NOT follow tween updates. If we
 *  let the sprite move while the body stayed put, the hitbox would drift
 *  out of sync and the player could pass through the visual coin without
 *  triggering an overlap. To avoid that, we keep the body anchored and
 *  give it a generous height that covers the entire bob range (and a bit
 *  more) so a big player can always grab it.
 */
export class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    // Texture is 18x18; expand the hitbox vertically so the bob can't desync.
    body.setSize(20, 28);
    body.updateFromGameObject();

    // Use a separate visual proxy for the bob so the sprite (and its body)
    // stays in place. We hide the underlying texture on the body sprite and
    // draw a duplicate image that bobs.
    const bob = scene.add.image(x, y, 'coin');
    this.setVisible(false);
    scene.tweens.add({
      targets: bob,
      y: y - 4,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    // When the coin is destroyed (collected), also remove the visual.
    this.once(Phaser.GameObjects.Events.DESTROY, () => bob.destroy());
  }
}
