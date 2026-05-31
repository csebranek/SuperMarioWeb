import Phaser from 'phaser';
import { TILE, WORLD_WIDTH, WORLD_HEIGHT, ARMOR, BOSS } from '../constants';
import { buildTextures } from '../textures';
import { LEVELS } from '../levels';
import { tileCenter } from '../utils';
import { Player } from '../objects/Player';
import { Goomba } from '../objects/Goomba';
import { Koopa } from '../objects/Koopa';
import { Coin } from '../objects/Coin';
import { Mushroom } from '../objects/Mushroom';
import { Flag } from '../objects/Flag';
import { FireFlower } from '../objects/FireFlower';
import { Fireball } from '../objects/Fireball';
import { Bowser } from '../objects/Bowser';
export const HUD_KEY = 'hud';
export const LEVEL_KEY = 'levelIndex';
export const SIZE_KEY = 'playerSize';
export class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "solids", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "coins", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "goombas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "koopas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mushrooms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fireFlowers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fireballs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bigFireballs", {
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
        Object.defineProperty(this, "bowser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lives", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "coinsCollected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "levelCleared", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "levelIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    preload() {
        if (!this.textures.exists('player-small'))
            buildTextures(this);
    }
    create() {
        this.levelIndex = this.registry.get(LEVEL_KEY) ?? 0;
        this.score = this.registry.get('score') ?? 0;
        this.lives = this.registry.get('lives') ?? 3;
        this.coinsCollected = this.registry.get('coins') ?? 0;
        const persistedSize = this.registry.get(SIZE_KEY) ?? 'small';
        this.levelCleared = false;
        this.bowser = undefined;
        this.level = LEVELS[this.levelIndex];
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT + 600);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setBackgroundColor('#5c94fc');
        this.solids = this.physics.add.staticGroup();
        this.coins = this.physics.add.staticGroup();
        this.fireFlowers = this.physics.add.staticGroup();
        this.goombas = this.physics.add.group();
        this.koopas = this.physics.add.group();
        this.mushrooms = this.physics.add.group();
        this.fireballs = this.physics.add.group();
        this.bigFireballs = this.physics.add.group();
        this.buildLevel();
        this.spawnPlayer(persistedSize);
        this.wireCollisions();
        this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
        this.cameras.main.setDeadzone(120, 80);
        this.registry.set('levelName', this.level.name);
        this.pushHud();
        if (!this.scene.isActive('UIScene'))
            this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
    }
    buildLevel() {
        for (const span of this.level.groundSpans) {
            for (let c = span.start; c <= span.end; c++) {
                this.addSolid(c, 15, 'tile-ground', 'ground');
                this.addSolid(c, 16, 'tile-ground', 'ground');
            }
        }
        for (const pipe of this.level.pipes) {
            for (let i = 0; i < pipe.height; i++) {
                this.addSolid(pipe.col, 14 - i, 'tile-pipe', 'pipe');
                this.addSolid(pipe.col + 1, 14 - i, 'tile-pipe', 'pipe');
            }
        }
        for (const b of this.level.bricks) {
            this.addSolid(b.col, b.row, 'tile-brick', 'brick');
        }
        for (const q of this.level.qBlocks) {
            const tile = this.addSolid(q.col, q.row, 'tile-question', 'q');
            tile.getData('solid').contents = q.contents;
        }
        for (const c of this.level.coins) {
            const pos = tileCenter(c.col, c.row);
            this.coins.add(new Coin(this, pos.x, pos.y));
        }
        for (const col of this.level.goombas) {
            const pos = tileCenter(col, 14);
            const g = new Goomba(this, pos.x, pos.y);
            this.goombas.add(g);
            g.kickstart();
        }
        for (const col of this.level.koopas) {
            const pos = tileCenter(col, 14);
            const k = new Koopa(this, pos.x, pos.y);
            this.koopas.add(k);
            k.kickstart();
        }
        if (this.level.fireFlowers) {
            for (const f of this.level.fireFlowers) {
                const p = tileCenter(f.col, f.row);
                this.fireFlowers.add(new FireFlower(this, p.x, p.y));
            }
        }
        if (this.level.bowser) {
            const p = tileCenter(this.level.bowser.col, 13);
            this.bowser = new Bowser(this, p.x, p.y, this.bigFireballs, (sx, sy) => this.triggerShockwave(sx, sy));
        }
        const fp = tileCenter(this.level.flagCol, 15);
        this.flag = new Flag(this, fp.x, fp.y);
    }
    addSolid(col, row, key, type) {
        const pos = tileCenter(col, row);
        const sprite = this.solids.create(pos.x, pos.y, key);
        sprite.setData('solid', { type });
        sprite.refreshBody();
        return sprite;
    }
    spawnPlayer(persistedSize) {
        const p = tileCenter(this.level.playerStart.col, this.level.playerStart.row);
        this.player = new Player(this, p.x, p.y);
        if (persistedSize === 'big')
            this.player.powerUp('mushroom');
        if (persistedSize === 'fire')
            this.player.powerUp('fire');
        if (this.coinsCollected >= ARMOR.coinThreshold)
            this.player.grantArmor();
        this.player.onShootFireball = (x, y, dir) => this.shootFireball(x, y, dir);
    }
    wireCollisions() {
        this.physics.add.collider(this.player, this.solids, (_p, tile) => {
            const data = tile.getData('solid');
            const body = this.player.body;
            if (data?.type === 'q' && body.blocked.up) {
                this.bumpQuestionBlock(tile, data);
            }
        });
        this.physics.add.collider(this.goombas, this.solids);
        this.physics.add.collider(this.koopas, this.solids);
        this.physics.add.collider(this.mushrooms, this.solids);
        this.physics.add.collider(this.fireballs, this.solids);
        this.physics.add.collider(this.bigFireballs, this.solids);
        if (this.bowser)
            this.physics.add.collider(this.bowser, this.solids);
        this.physics.add.collider(this.goombas, this.koopas, (g, k) => {
            const koopa = k;
            if (koopa.state === 'sliding') {
                g.stomp();
                this.addScore(100);
            }
        });
        this.physics.add.overlap(this.player, this.goombas, (_p, gObj) => this.handlePlayerEnemy(gObj));
        this.physics.add.overlap(this.player, this.koopas, (_p, kObj) => this.handlePlayerKoopa(kObj));
        this.physics.add.overlap(this.player, this.coins, (_p, coin) => {
            coin.destroy();
            this.coinsCollected += 1;
            this.addScore(50);
            if (this.coinsCollected >= ARMOR.coinThreshold)
                this.player.grantArmor();
        });
        this.physics.add.overlap(this.player, this.mushrooms, (_p, m) => {
            m.destroy();
            this.player.powerUp('mushroom');
            this.addScore(1000);
        });
        this.physics.add.overlap(this.player, this.fireFlowers, (_p, f) => {
            f.destroy();
            const wasFire = this.player.isFire();
            this.player.powerUp('fire');
            this.addScore(1500);
            if (!wasFire)
                this.showToast('FIRE POWER!  Press  F  to shoot fireballs');
        });
        // Fireball ↔ enemies.
        this.physics.add.overlap(this.fireballs, this.goombas, (fb, gObj) => {
            const g = gObj;
            if (!g.alive)
                return;
            fb.destroy();
            g.stomp();
            this.addScore(150);
        });
        this.physics.add.overlap(this.fireballs, this.koopas, (fb, kObj) => {
            const k = kObj;
            fb.destroy();
            // Treat as a stomp on walking koopas.
            if (k.state === 'walk')
                k.stomp();
            this.addScore(150);
        });
        // Fireball vs Bowser.
        if (this.bowser) {
            this.physics.add.overlap(this.fireballs, this.bowser, (fb) => {
                const b = this.bowser;
                fb.destroy();
                if (b.hit(this.time.now)) {
                    this.addScore(5000);
                    this.completeLevel();
                }
                else {
                    this.addScore(100);
                    this.pushHud();
                }
            });
            // Stomping Bowser also counts as one hit (and bounces the player).
            this.physics.add.overlap(this.player, this.bowser, (_p, bObj) => {
                const b = bObj;
                if (!b.alive || !this.player.alive)
                    return;
                const pBody = this.player.body;
                if (pBody.velocity.y > 0 && this.player.y < b.y - 16) {
                    this.player.bounce();
                    if (b.hit(this.time.now)) {
                        this.addScore(5000);
                        this.completeLevel();
                    }
                    else {
                        this.pushHud();
                    }
                }
                else {
                    this.damagePlayer();
                }
            });
        }
        // BigFireballs hurt the player.
        this.physics.add.overlap(this.player, this.bigFireballs, (_p, bfb) => {
            bfb.destroy();
            this.damagePlayer();
        });
        this.physics.add.overlap(this.player, this.flag, () => this.completeLevel());
    }
    bumpQuestionBlock(tile, data) {
        if (data.type !== 'q')
            return;
        data.type = 'used';
        tile.setTexture('tile-used');
        this.tweens.add({ targets: tile, y: tile.y - 6, yoyo: true, duration: 80 });
        // Smart upgrade: if the question block holds a mushroom but the player
        // is already big (non-fire), spawn a fire flower instead.
        if (data.contents === 'mushroom') {
            if (this.player.isFire()) {
                this.spawnCoin(tile.x, tile.y - TILE);
            }
            else if (this.player.isBig()) {
                this.fireFlowers.add(new FireFlower(this, tile.x, tile.y - TILE));
            }
            else {
                const m = new Mushroom(this, tile.x, tile.y - TILE);
                this.mushrooms.add(m);
                m.kickstart(this.player.x);
            }
        }
        else {
            this.spawnCoin(tile.x, tile.y - TILE);
        }
    }
    spawnCoin(x, y) {
        const coin = new Coin(this, x, y);
        this.coins.add(coin);
    }
    shootFireball(x, y, dir) {
        const fb = new Fireball(this, x, y, dir);
        this.fireballs.add(fb);
        // Adding to a group can reset the body — re-apply launch velocity.
        fb.launch();
    }
    triggerShockwave(x, y) {
        if (!this.player.alive)
            return;
        // Visual.
        const ring = this.add.image(x, y, 'shockwave').setScale(0.2).setAlpha(0.9);
        this.tweens.add({
            targets: ring,
            scale: 1.1,
            alpha: 0,
            duration: 500,
            onComplete: () => ring.destroy()
        });
        // Damage check by distance.
        const dx = this.player.x - x;
        const dy = this.player.y - y;
        if (Math.hypot(dx, dy) < BOSS.shockwaveDamageRange) {
            this.damagePlayer();
        }
    }
    handlePlayerEnemy(g) {
        if (!g.alive || !this.player.alive)
            return;
        const pBody = this.player.body;
        if (pBody.velocity.y > 0 && this.player.y < g.y - 4) {
            g.stomp();
            this.player.bounce();
            this.addScore(100);
        }
        else {
            this.damagePlayer();
        }
    }
    handlePlayerKoopa(k) {
        if (!this.player.alive)
            return;
        const pBody = this.player.body;
        const stomping = pBody.velocity.y > 0 && this.player.y < k.y - 4;
        if (stomping) {
            if (k.state === 'walk' || k.state === 'sliding') {
                k.stomp();
                this.player.bounce();
                this.addScore(100);
            }
            else if (k.state === 'shell') {
                k.kick(this.player.x);
                this.player.bounce();
            }
            return;
        }
        if (k.state === 'shell') {
            k.kick(this.player.x);
        }
        else {
            this.damagePlayer();
        }
    }
    damagePlayer() {
        const died = this.player.takeDamage(this.time.now);
        this.pushHud();
        if (died)
            this.handlePlayerDeath();
    }
    pushHud() {
        this.registry.set(HUD_KEY, {
            score: this.score,
            coins: this.coinsCollected,
            lives: this.lives,
            level: this.level.name,
            armor: this.player ? this.player.armor : false,
            power: this.player ? this.playerPower() : 'small',
            bossHp: this.bowser?.alive ? this.bowser.hp : undefined
        });
    }
    playerPower() {
        if (this.player.isFire())
            return 'fire';
        if (this.player.isBig())
            return 'big';
        return 'small';
    }
    addScore(n) {
        this.score += n;
        this.pushHud();
    }
    handlePlayerDeath() {
        this.lives -= 1;
        this.pushHud();
        this.cameras.main.shake(250, 0.01);
        this.time.delayedCall(1200, () => {
            if (this.lives <= 0) {
                this.resetRegistry();
                this.scene.stop('UIScene');
                this.scene.start('GameOverScene', { score: this.score, won: false });
            }
            else {
                this.registry.set('score', this.score);
                this.registry.set('lives', this.lives);
                this.registry.set('coins', this.coinsCollected);
                // Lose one power level on death (small → restart, big/fire → big).
                // Persisting fire across death would be too forgiving; persist big.
                const downSize = this.playerPower() === 'fire' ? 'big' : 'small';
                this.registry.set(SIZE_KEY, downSize);
                this.scene.restart();
            }
        });
    }
    completeLevel() {
        if (this.levelCleared)
            return;
        // If a boss is in this level, you can ONLY clear it by killing Bowser.
        if (this.bowser && this.bowser.alive)
            return;
        this.levelCleared = true;
        this.addScore(2000);
        this.time.delayedCall(1200, () => {
            const next = this.levelIndex + 1;
            if (next >= LEVELS.length) {
                this.resetRegistry();
                this.scene.stop('UIScene');
                this.scene.start('GameOverScene', { score: this.score, won: true });
            }
            else {
                this.registry.set(LEVEL_KEY, next);
                this.registry.set('score', this.score);
                this.registry.set('lives', this.lives);
                this.registry.set('coins', this.coinsCollected);
                this.registry.set(SIZE_KEY, this.playerPower());
                this.scene.restart();
            }
        });
    }
    resetRegistry() {
        this.registry.set('score', 0);
        this.registry.set('lives', 3);
        this.registry.set('coins', 0);
        this.registry.set(LEVEL_KEY, 0);
        this.registry.set(SIZE_KEY, 'small');
    }
    /** Brief on-screen message anchored to the camera, used for tutorials. */
    showToast(text, durationMs = 3200) {
        const cam = this.cameras.main;
        const x = cam.width / 2;
        const y = cam.height - 80;
        const bg = this.add
            .rectangle(x, y, Math.min(text.length * 11 + 40, cam.width - 40), 36, 0x000000, 0.7)
            .setScrollFactor(0)
            .setStrokeStyle(2, 0xffd54a);
        const label = this.add
            .text(x, y, text, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffd54a',
            stroke: '#000000',
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setScrollFactor(0);
        this.tweens.add({
            targets: [bg, label],
            alpha: { from: 1, to: 0 },
            delay: durationMs - 600,
            duration: 600,
            onComplete: () => {
                bg.destroy();
                label.destroy();
            }
        });
    }
    update(time, delta) {
        this.player.tick(time, delta);
        if (this.player.alive && this.player.y > WORLD_HEIGHT + 32) {
            this.player.die();
            this.handlePlayerDeath();
        }
        this.goombas.children.iterate((c) => {
            if (c && c.active)
                c.tick();
            return true;
        });
        this.koopas.children.iterate((c) => {
            if (c && c.active)
                c.tick();
            return true;
        });
        this.mushrooms.children.iterate((c) => {
            if (c && c.active)
                c.tick();
            return true;
        });
        this.fireballs.children.iterate((c) => {
            if (c && c.active)
                c.tick(time);
            return true;
        });
        this.bigFireballs.children.iterate((c) => {
            if (c && c.active)
                c.tick();
            return true;
        });
        if (this.bowser && this.bowser.alive) {
            this.bowser.tick(time, this.player.x, this.player.y);
        }
    }
}
