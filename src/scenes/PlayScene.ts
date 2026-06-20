import Phaser from 'phaser';
import { TILE, WORLD_WIDTH, WORLD_HEIGHT, ARMOR, BOSS, WARIO, COLORS } from '../constants';
import { buildTextures } from '../textures';
import { LEVELS, LevelData } from '../levels';
import { tileCenter } from '../utils';
import { Player, PlayerSize } from '../objects/Player';
import { Goomba } from '../objects/Goomba';
import { Koopa } from '../objects/Koopa';
import { Coin } from '../objects/Coin';
import { Mushroom } from '../objects/Mushroom';
import { Flag } from '../objects/Flag';
import { FireFlower } from '../objects/FireFlower';
import { Fireball } from '../objects/Fireball';
import { BigFireball } from '../objects/BigFireball';
import { Bowser } from '../objects/Bowser';
import { Wario } from '../objects/Wario';
import { ThrowingKnife } from '../objects/ThrowingKnife';
import { Bomb } from '../objects/Bomb';

interface SolidData {
  type: 'ground' | 'brick' | 'pipe' | 'q' | 'used';
  contents?: 'coin' | 'mushroom';
}

export const HUD_KEY = 'hud';
export const LEVEL_KEY = 'levelIndex';
export const SIZE_KEY = 'playerSize';

export class PlayScene extends Phaser.Scene {
  private player!: Player;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private goombas!: Phaser.Physics.Arcade.Group;
  private koopas!: Phaser.Physics.Arcade.Group;
  private mushrooms!: Phaser.Physics.Arcade.Group;
  private fireFlowers!: Phaser.Physics.Arcade.StaticGroup;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private bigFireballs!: Phaser.Physics.Arcade.Group;
  private warioProjectiles!: Phaser.Physics.Arcade.Group;
  private flag!: Flag;
  private bowser?: Bowser;
  private wario?: Wario;
  private onPole = false;

  private score = 0;
  private lives = 3;
  private coinsCollected = 0;
  private armorCoins = 0;
  private levelCleared = false;
  private levelIndex = 0;
  private level!: LevelData;

  constructor() {
    super('PlayScene');
  }

  preload(): void {
    if (!this.textures.exists('player-small')) buildTextures(this);
  }

  create(): void {
    this.levelIndex = (this.registry.get(LEVEL_KEY) as number | undefined) ?? 0;
    this.score = (this.registry.get('score') as number | undefined) ?? 0;
    this.lives = (this.registry.get('lives') as number | undefined) ?? 3;
    this.coinsCollected = (this.registry.get('coins') as number | undefined) ?? 0;
    this.armorCoins = (this.registry.get('armorCoins') as number | undefined) ?? 0;
    const persistedSize =
      (this.registry.get(SIZE_KEY) as PlayerSize | undefined) ?? 'small';
    this.levelCleared = false;
    this.bowser = undefined;
    this.wario = undefined;
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
    this.warioProjectiles = this.physics.add.group();

    this.buildLevel();
    this.spawnPlayer(persistedSize);
    this.wireCollisions();

    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setDeadzone(120, 80);

    this.registry.set('levelName', this.level.name);
    this.pushHud();

    if (!this.scene.isActive('UIScene')) this.scene.launch('UIScene');
    this.scene.bringToTop('UIScene');

    // Announce boss approach on level 3 (index 2).
    if (this.levelIndex === 2) {
      this.showToast('BOWSER APPROACHES!', 3200);
    }
    if (this.level.wario) {
      this.showToast('WARIO IS HERE!  Use fireballs to beat him', 3600);
    }
  }

  private buildLevel(): void {
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
      (tile.getData('solid') as SolidData).contents = q.contents;
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
      this.bowser = new Bowser(this, p.x, p.y, this.bigFireballs, (sx, sy) =>
        this.triggerShockwave(sx, sy), this.level.bowser.hp
      );
    }
    if (this.level.wario) {
      const p = tileCenter(this.level.wario.col, 13);
      this.wario = new Wario(
        this,
        p.x,
        p.y,
        this.warioProjectiles,
        (sx, sy) => this.triggerShockwave(sx, sy),
        () => this.triggerLasso(),
        this.level.wario.hp
      );
    }

    const fp = tileCenter(this.level.flagCol, 15);
    this.flag = new Flag(this, fp.x, fp.y);
  }

  private addSolid(
    col: number,
    row: number,
    key: string,
    type: SolidData['type']
  ): Phaser.Physics.Arcade.Sprite {
    const pos = tileCenter(col, row);
    const sprite = this.solids.create(pos.x, pos.y, key) as Phaser.Physics.Arcade.Sprite;
    sprite.setData('solid', { type } as SolidData);
    sprite.refreshBody();
    return sprite;
  }

  private spawnPlayer(persistedSize: PlayerSize): void {
    const p = tileCenter(this.level.playerStart.col, this.level.playerStart.row);
    this.player = new Player(this, p.x, p.y);
    if (persistedSize === 'big') this.player.powerUp('mushroom');
    if (persistedSize === 'fire') this.player.powerUp('fire');
    if (this.armorCoins >= ARMOR.coinThreshold) this.player.grantArmor();
    this.player.onShootFireball = (x, y, dir) => this.shootFireball(x, y, dir);
  }

  private wireCollisions(): void {
    this.physics.add.collider(this.player, this.solids, (_p, tile) => {
      const data = (tile as Phaser.Physics.Arcade.Sprite).getData('solid') as SolidData | undefined;
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (data?.type === 'q' && body.blocked.up) {
        this.bumpQuestionBlock(tile as Phaser.Physics.Arcade.Sprite, data);
      }
    });

    this.physics.add.collider(this.goombas, this.solids);
    this.physics.add.collider(this.koopas, this.solids);
    this.physics.add.collider(this.mushrooms, this.solids);
    this.physics.add.collider(this.fireballs, this.solids);
    this.physics.add.collider(this.bigFireballs, this.solids);
    this.physics.add.collider(this.warioProjectiles, this.solids);
    if (this.bowser) this.physics.add.collider(this.bowser, this.solids);
    if (this.wario) this.physics.add.collider(this.wario, this.solids);

    this.physics.add.collider(this.goombas, this.koopas, (g, k) => {
      const koopa = k as Koopa;
      if (koopa.state === 'sliding') {
        (g as Goomba).stomp();
        this.addScore(100);
      }
    });

    this.physics.add.overlap(this.player, this.goombas, (_p, gObj) =>
      this.handlePlayerEnemy(gObj as Goomba)
    );
    this.physics.add.overlap(this.player, this.koopas, (_p, kObj) => {
      const k = kObj as Koopa;
      if (!this.player.alive) return;
      // Stationary shell — kick it, no damage.
      if (k.state === 'shell') {
        k.kick(this.player.x);
        return;
      }
      this.handlePlayerKoopa(k);
    });
    this.physics.add.overlap(this.player, this.coins, (_p, coin) => {
      (coin as Coin).destroy();
      this.coinsCollected += 1;
      this.addScore(50);
      // Coins only count toward armor while you don't already have it; losing
      // armor resets this progress so you must collect another full set.
      if (!this.player.armor) {
        this.armorCoins += 1;
        if (this.armorCoins >= ARMOR.coinThreshold) this.player.grantArmor();
      }
    });
    this.physics.add.overlap(this.player, this.mushrooms, (_p, m) => {
      (m as Mushroom).destroy();
      this.player.powerUp('mushroom');
      this.addScore(1000);
    });
    this.physics.add.overlap(this.player, this.fireFlowers, (_p, f) => {
      (f as FireFlower).destroy();
      const wasFire = this.player.isFire();
      this.player.powerUp('fire');
      this.addScore(1500);
      if (!wasFire) this.showToast('FIRE POWER!  Press  F  to shoot fireballs');
    });

    // Fireball ↔ enemies.
    this.physics.add.overlap(this.fireballs, this.goombas, (fb, gObj) => {
      const g = gObj as Goomba;
      if (!g.alive) return;
      (fb as Fireball).destroy();
      g.stomp();
      this.addScore(150);
    });
    this.physics.add.overlap(this.fireballs, this.koopas, (fb, kObj) => {
      const k = kObj as Koopa;
      (fb as Fireball).destroy();
      // Treat as a stomp on walking koopas.
      if (k.state === 'walk') k.stomp();
      this.addScore(150);
    });

    // Fireball vs Bowser.
    // IMPORTANT: Bowser (sprite) must be arg1, fireballs (group) must be arg2.
    // When a group is arg1, Phaser internally swaps to collideSpriteVsGroup(sprite, group)
    // and the callback receives (sprite, groupMember) — i.e. (bowser, fireball).
    // Putting Bowser first keeps that ordering explicit and correct.
    if (this.bowser) {
      this.physics.add.overlap(
        this.bowser,
        this.fireballs,
        (_bowserObj, fbObj) => {
          const fb = fbObj as Fireball;
          fb.destroy();
          if (this.bowser!.hit()) {
            this.addScore(5000);
            this.completeLevel();
          } else {
            this.addScore(100);
            this.pushHud();
          }
        },
        (_bowserObj, fbObj) => (fbObj as Fireball).active && !!this.bowser && this.bowser.alive
      );
      // Stomping Bowser counts as one hit.
      this.physics.add.overlap(this.player, this.bowser, (_p, bObj) => {
        const b = bObj as Bowser;
        if (!b.alive || !this.player.alive) return;
        const pBody = this.player.body as Phaser.Physics.Arcade.Body;
        if (pBody.velocity.y > 0 && this.player.y < b.y - 16) {
          this.player.bounce();
          if (b.hit()) {
            this.addScore(5000);
            this.completeLevel();
          } else {
            this.pushHud();
          }
        } else {
          this.damagePlayer();
        }
      });
    }

    // Fireball vs Wario + stomp + projectile contact.
    if (this.wario) {
      this.physics.add.overlap(
        this.wario,
        this.fireballs,
        (_warioObj, fbObj) => {
          const fb = fbObj as Fireball;
          fb.destroy();
          if (this.wario!.hit()) {
            this.addScore(8000);
            this.completeLevel();
          } else {
            this.addScore(100);
            this.pushHud();
          }
        },
        (_warioObj, fbObj) => (fbObj as Fireball).active && !!this.wario && this.wario.alive
      );
      this.physics.add.overlap(this.player, this.wario, (_p, wObj) => {
        const w = wObj as Wario;
        if (!w.alive || !this.player.alive) return;
        const pBody = this.player.body as Phaser.Physics.Arcade.Body;
        if (pBody.velocity.y > 0 && this.player.y < w.y - 16) {
          this.player.bounce();
          if (w.hit()) {
            this.addScore(8000);
            this.completeLevel();
          } else {
            this.pushHud();
          }
        } else {
          this.damagePlayer();
        }
      });
    }

    // Wario's knives + bombs hurt the player.
    this.physics.add.overlap(this.player, this.warioProjectiles, (_p, projObj) => {
      if (!this.player.alive) return;
      if (projObj instanceof Bomb) {
        (projObj as Bomb).explode();
      } else {
        (projObj as ThrowingKnife).destroy();
        this.damagePlayer();
      }
    });

    // BigFireballs hurt the player.
    this.physics.add.overlap(this.player, this.bigFireballs, (_p, bfb) => {
      (bfb as BigFireball).destroy();
      this.damagePlayer();
    });

    this.physics.add.overlap(this.player, this.flag, () => this.startPoleSequence());
  }

  private startPoleSequence(): void {
    if (this.levelCleared) return;
    if (this.bossAlive()) return;
    if (this.onPole) return;
    this.onPole = true;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    // Freeze horizontal movement and gravity, snap to pole x (slight offset)
    body.setVelocity(0, 0);
    body.setAccelerationX(0);
    body.setAllowGravity(false);
    // Position player at pole (slightly to the left so sprite overlaps nicely)
    this.player.x = this.flag.x - 8;

    // Slide down to just above the ground (row 14 is ground surface center)
    const groundPos = tileCenter(this.level.flagCol, 14);
    const targetY = groundPos.y;
    const startY = this.player.y;
    const dist = Math.max(8, targetY - startY);
    const duration = Math.max(400, dist * 6);

    this.tweens.add({
      targets: this.player,
      y: targetY,
      duration,
      ease: 'Linear',
      onComplete: () => {
        // restore physics and complete level
        body.setAllowGravity(true);
        // make sure player is positioned at base of pole
        this.player.x = this.flag.x - 8;
        this.onPole = false;
        this.completeLevel();
      }
    });
  }

  private bumpQuestionBlock(tile: Phaser.Physics.Arcade.Sprite, data: SolidData): void {
    if (data.type !== 'q') return;
    data.type = 'used';
    tile.setTexture('tile-used');
    this.tweens.add({ targets: tile, y: tile.y - 6, yoyo: true, duration: 80 });

    // Smart upgrade: if the question block holds a mushroom but the player
    // is already big (non-fire), spawn a fire flower instead.
    if (data.contents === 'mushroom') {
      if (this.player.isFire()) {
        this.spawnCoin(tile.x, tile.y - TILE);
      } else if (this.player.isBig()) {
        this.fireFlowers.add(new FireFlower(this, tile.x, tile.y - TILE));
      } else {
        const m = new Mushroom(this, tile.x, tile.y - TILE);
        this.mushrooms.add(m);
        m.kickstart(this.player.x);
      }
    } else {
      this.spawnCoin(tile.x, tile.y - TILE);
    }
  }

  private spawnCoin(x: number, y: number): void {
    const coin = new Coin(this, x, y);
    this.coins.add(coin);
  }

  private shootFireball(x: number, y: number, dir: 1 | -1): void {
    const fb = new Fireball(this, x, y, dir);
    this.fireballs.add(fb);
    // Adding to a group can reset the body — re-apply launch velocity.
    fb.launch();
  }

  private triggerShockwave(x: number, y: number): void {
    if (!this.player.alive) return;

    // Draw expanding fire-ring AOE — three concentric circles that grow outward.
    const RANGE = BOSS.shockwaveRange;
    for (let i = 0; i < 3; i++) {
      const delay = i * 120;
      this.time.delayedCall(delay, () => {
        const ring = this.add
          .circle(x, y, 12, 0xff4400, 0.85)
          .setStrokeStyle(4, 0xffaa00)
          .setScrollFactor(1);
        this.tweens.add({
          targets: ring,
          scaleX: (RANGE * 2) / 12,
          scaleY: (RANGE * 2) / 12,
          alpha: 0,
          duration: 700 - delay,
          ease: 'Quad.Out',
          onComplete: () => ring.destroy()
        });
      });
    }

    // Check if player is inside the blast radius.
    const dx = this.player.x - x;
    const dy = this.player.y - y;
    if (Math.hypot(dx, dy) < BOSS.shockwaveDamageRange) {
      this.damagePlayer();
    }
  }

  private handlePlayerEnemy(g: Goomba): void {
    if (!g.alive || !this.player.alive) return;
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (pBody.velocity.y > 0 && this.player.y < g.y - 4) {
      g.stomp();
      this.player.bounce();
      this.addScore(100);
    } else {
      this.damagePlayer();
    }
  }

  private handlePlayerKoopa(k: Koopa): void {
    if (!this.player.alive) return;
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    const stomping = pBody.velocity.y > 0 && this.player.y < k.y - 4;
    if (stomping) {
      if (k.state === 'walk' || k.state === 'sliding') {
        k.stomp();
        this.player.bounce();
        this.addScore(100);
      } else if (k.state === 'shell') {
        k.kick(this.player.x);
        this.player.bounce();
      }
      return;
    }
    if (k.state === 'shell') {
      k.kick(this.player.x);
    } else {
      this.damagePlayer();
    }
  }

  private damagePlayer(): void {
    const hadArmor = this.player.armor;
    const died = this.player.takeDamage(this.time.now);
    // Losing armor resets the progress toward the next armor.
    if (hadArmor && !this.player.armor) {
      this.armorCoins = 0;
      this.registry.set('armorCoins', 0);
    }
    this.pushHud();
    if (died) this.handlePlayerDeath();
  }

  private bossAlive(): boolean {
    return (!!this.bowser && this.bowser.alive) || (!!this.wario && this.wario.alive);
  }

  /** Wario's lasso: if the player is within reach, reel them in and damage. */
  private triggerLasso(): void {
    if (!this.player.alive || !this.wario || !this.wario.alive) return;
    if (Math.abs(this.player.x - this.wario.x) > WARIO.lassoRange) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.enable = false; // freeze physics so the pull isn't fought by movement

    const rope = this.add.graphics().setDepth(50);
    const loop = this.add.image(this.player.x, this.player.y, 'lasso-loop').setDepth(51);
    const targetX = this.wario.x + (this.player.x < this.wario.x ? -40 : 40);
    const draw = () => {
      if (!this.wario) return;
      rope.clear();
      rope.lineStyle(3, COLORS.lasso, 1);
      rope.lineBetween(this.wario.x, this.wario.y - 10, this.player.x, this.player.y);
      loop.setPosition(this.player.x, this.player.y);
    };
    draw();
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: this.wario.y,
      duration: WARIO.lassoPullMs,
      ease: 'Quad.In',
      onUpdate: draw,
      onComplete: () => {
        rope.destroy();
        loop.destroy();
        body.enable = true;
        body.reset(this.player.x, this.player.y);
        this.damagePlayer();
      }
    });
  }

  private pushHud(): void {
    this.registry.set(HUD_KEY, {
      score: this.score,
      coins: this.coinsCollected,
      lives: this.lives,
      level: this.level.name,
      armor: this.player ? this.player.armor : false,
      power: this.player ? this.playerPower() : 'small',
      bossHp: this.bowser?.alive
        ? this.bowser.hp
        : this.wario?.alive
        ? this.wario.hp
        : undefined
    });
  }

  private playerPower(): PlayerSize {
    if (this.player.isFire()) return 'fire';
    if (this.player.isBig()) return 'big';
    return 'small';
  }

  private addScore(n: number): void {
    this.score += n;
    this.pushHud();
  }

  private handlePlayerDeath(): void {
    this.lives -= 1;
    this.pushHud();
    this.cameras.main.shake(250, 0.01);
    this.time.delayedCall(1200, () => {
      if (this.lives <= 0) {
        this.resetRegistry();
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', { score: this.score, won: false });
      } else {
        this.registry.set('score', this.score);
        this.registry.set('lives', this.lives);
        this.registry.set('coins', this.coinsCollected);
        this.registry.set('armorCoins', this.armorCoins);
        // Lose one power level on death (small → restart, big/fire → big).
        // Persisting fire across death would be too forgiving; persist big.
        const downSize: PlayerSize = this.playerPower() === 'fire' ? 'big' : 'small';
        this.registry.set(SIZE_KEY, downSize);
        this.scene.restart();
      }
    });
  }

  private completeLevel(): void {
    if (this.levelCleared) return;
    // If a boss is in this level, you can ONLY clear it by killing the boss.
    if (this.bossAlive()) return;
    this.levelCleared = true;
    this.addScore(2000);

    this.time.delayedCall(1200, () => {
      const next = this.levelIndex + 1;
      if (next >= LEVELS.length) {
        this.resetRegistry();
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', { score: this.score, won: true });
      } else {
        this.registry.set(LEVEL_KEY, next);
        this.registry.set('score', this.score);
        this.registry.set('lives', this.lives);
        this.registry.set('coins', this.coinsCollected);
        this.registry.set('armorCoins', this.armorCoins);
        this.registry.set(SIZE_KEY, this.playerPower());
        this.scene.restart();
      }
    });
  }

  private resetRegistry(): void {
    this.registry.set('score', 0);
    this.registry.set('lives', 3);
    this.registry.set('coins', 0);
    this.registry.set('armorCoins', 0);
    this.registry.set(LEVEL_KEY, 0);
    this.registry.set(SIZE_KEY, 'small');
  }

  /** Brief on-screen message anchored to the camera, used for tutorials. */
  private showToast(text: string, durationMs = 3200): void {
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

  update(time: number, delta: number): void {
    this.player.tick(time, delta);

    if (this.player.alive && this.player.y > WORLD_HEIGHT + 32) {
      this.player.die();
      this.handlePlayerDeath();
    }

    this.goombas.children.iterate((c) => {
      if (c && (c as Goomba).active) (c as Goomba).tick();
      return true;
    });
    this.koopas.children.iterate((c) => {
      if (c && (c as Koopa).active) (c as Koopa).tick();
      return true;
    });
    this.mushrooms.children.iterate((c) => {
      if (c && (c as Mushroom).active) (c as Mushroom).tick();
      return true;
    });
    this.fireballs.children.iterate((c) => {
      if (c && (c as Fireball).active) (c as Fireball).tick(time);
      return true;
    });
    this.bigFireballs.children.iterate((c) => {
      if (c && (c as BigFireball).active) (c as BigFireball).tick();
      return true;
    });
    this.warioProjectiles.children.iterate((c) => {
      if (!c || !(c as Phaser.Physics.Arcade.Sprite).active) return true;
      if (c instanceof Bomb) (c as Bomb).tick();
      else (c as ThrowingKnife).tick(time);
      return true;
    });
    if (this.bowser && this.bowser.alive) {
      this.bowser.tick(time, this.player.x, this.player.y);
    }
    if (this.wario && this.wario.alive) {
      this.wario.tick(time, this.player.x, this.player.y);
    }
  }
}
