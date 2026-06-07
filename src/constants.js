/**
 * Centralised constants. Tweak these to change the "feel" of the game without
 * digging through individual object files.
 */
export const TILE = 32;
export const WORLD = {
    cols: 100,
    rows: 17
};
export const WORLD_WIDTH = WORLD.cols * TILE;
export const WORLD_HEIGHT = WORLD.rows * TILE;
export const PLAYER = {
    // Horizontal motion
    acceleration: 900, // px/s^2 while a direction key is held
    drag: 1200, // px/s^2 friction when no key is held (ground)
    maxSpeed: 240, // horizontal terminal velocity
    // Vertical motion
    jumpVelocity: 520, // initial upward speed when the jump key is tapped
    jumpHoldBoost: 1100, // extra upward acceleration while jump is held & rising
    maxFallSpeed: 900, // vertical terminal velocity
    jumpHoldMs: 220 // max additional time the jump can be "held"
};
export const ENEMY = {
    goombaSpeed: 50,
    koopaSpeed: 70,
    shellSpeed: 320
};
export const FIRE = {
    cooldownMs: 350,
    speedX: 380,
    jumpVy: -180,
    bounceVy: -260,
    maxBounces: 3,
    lifetimeMs: 2500
};
export const ARMOR = {
    coinThreshold: 15
};
export const BOSS = {
    hp: 10,
    paceSpeed: 80,
    paceRangeTiles: 8,
    attackIntervalMs: 1800,
    // AOE fires every 5–7 seconds (randomised in Bowser.tick).
    shockwaveMinMs: 5000,
    shockwaveMaxMs: 7000,
    // 4 tiles = 128px trigger range; damage range slightly smaller.
    shockwaveRange: 130,
    shockwaveDamageRange: 110,
    shockwaveTelegraphMs: 600,
    bigFireSpeedX: 220,
    bigFireJumpVy: -380,
    // 600ms invuln per hit — ensures one fireball can never trigger twice.
    invulnAfterHitMs: 600,
    jumpIntervalMs: 2200,
    jumpVy: -650
};
export const COLORS = {
    ground: 0xc56a23,
    groundTop: 0x39b54a,
    brick: 0xb8732e,
    pipe: 0x2bb24b,
    question: 0xf5c542,
    questionUsed: 0x7a5a23,
    coin: 0xffd54a,
    goomba: 0x8a4b2a,
    koopa: 0x2ca44a,
    shell: 0x1f7a36,
    player: 0xd92b2b,
    playerBig: 0xff5757,
    playerFire: 0xfff2c4,
    mushroom: 0xff3030,
    fireFlower: 0xff7a1a,
    fireball: 0xffb347,
    bigFireball: 0xff5500,
    bowser: 0xf2c41a,
    bowserBelly: 0xfff2c4,
    bowserShell: 0x2f8a2f,
    bowserHair: 0xd8261a,
    bowserHorn: 0xfff5d6,
    bowserSpike: 0xffffff,
    shockwave: 0xff8a00,
    armor: 0x8ad6ff,
    flag: 0xffffff,
    pole: 0xeeeeee
};
