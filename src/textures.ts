import Phaser from 'phaser';
import { TILE, COLORS } from './constants';

/**
 * Builds all the placeholder textures the game uses, drawn at runtime with
 * `Phaser.GameObjects.Graphics`. The intent is to ship a self-contained
 * prototype with zero external image assets — every visual is generated here.
 *
 * Once real sprite sheets are available, just `load.spritesheet(...)` in the
 * scene's preload and remove the corresponding entry from this file.
 */
export function buildTextures(scene: Phaser.Scene): void {
  // Helper to draw a rectangle texture with an outline.
  const rect = (key: string, w: number, h: number, fill: number, outline?: number) => {
    const g = scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(fill, 1);
    g.fillRect(0, 0, w, h);
    if (outline !== undefined) {
      g.lineStyle(2, outline, 1);
      g.strokeRect(1, 1, w - 2, h - 2);
    }
    g.generateTexture(key, w, h);
    g.destroy();
  };

  // --- Solid tiles ---------------------------------------------------------
  // Ground = brown body with a green grassy top stripe.
  {
    const g = scene.add.graphics();
    g.fillStyle(COLORS.ground, 1);
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle(COLORS.groundTop, 1);
    g.fillRect(0, 0, TILE, 6);
    g.lineStyle(1, 0x000000, 0.3);
    g.strokeRect(0, 0, TILE, TILE);
    g.generateTexture('tile-ground', TILE, TILE);
    g.destroy();
  }

  // Brick: striped pattern.
  {
    const g = scene.add.graphics();
    g.fillStyle(COLORS.brick, 1);
    g.fillRect(0, 0, TILE, TILE);
    g.lineStyle(2, 0x000000, 0.35);
    g.strokeRect(0, 0, TILE, TILE);
    g.lineBetween(0, TILE / 2, TILE, TILE / 2);
    g.lineBetween(TILE / 2, 0, TILE / 2, TILE / 2);
    g.lineBetween(TILE / 4, TILE / 2, TILE / 4, TILE);
    g.lineBetween((TILE * 3) / 4, TILE / 2, (TILE * 3) / 4, TILE);
    g.generateTexture('tile-brick', TILE, TILE);
    g.destroy();
  }

  // Pipe segment.
  {
    const g = scene.add.graphics();
    g.fillStyle(COLORS.pipe, 1);
    g.fillRect(0, 0, TILE, TILE);
    g.lineStyle(2, 0x0c5c1f, 1);
    g.strokeRect(0, 0, TILE, TILE);
    g.fillStyle(0x9ce8a6, 1);
    g.fillRect(4, 4, 4, TILE - 8);
    g.generateTexture('tile-pipe', TILE, TILE);
    g.destroy();
  }

  // Question block (active).
  {
    const g = scene.add.graphics();
    g.fillStyle(COLORS.question, 1);
    g.fillRect(0, 0, TILE, TILE);
    g.lineStyle(2, 0x6b4a00, 1);
    g.strokeRect(0, 0, TILE, TILE);
    // Bolts in corners.
    g.fillStyle(0x6b4a00, 1);
    g.fillRect(4, 4, 3, 3);
    g.fillRect(TILE - 7, 4, 3, 3);
    g.fillRect(4, TILE - 7, 3, 3);
    g.fillRect(TILE - 7, TILE - 7, 3, 3);
    // Question mark glyph (simple).
    g.fillStyle(0xffffff, 1);
    g.fillRect(TILE / 2 - 2, 10, 4, 4);
    g.fillRect(TILE / 2 - 2, 16, 4, 4);
    g.fillRect(TILE / 2 - 2, 22, 4, 3);
    g.generateTexture('tile-question', TILE, TILE);
    g.destroy();
  }

  // Used (spent) block.
  rect('tile-used', TILE, TILE, COLORS.questionUsed, 0x000000);

  // --- Entities ------------------------------------------------------------

  // Small player (16x24 hit, drawn 20x28).
  {
    const w = 22;
    const h = 28;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.player, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xffd9b0, 1); // face
    g.fillRect(4, 4, w - 8, 8);
    g.fillStyle(0x000000, 1);
    g.fillRect(8, 6, 2, 3);
    g.fillRect(w - 10, 6, 2, 3);
    g.generateTexture('player-small', w, h);
    g.destroy();
  }

  // Big player (after mushroom).
  {
    const w = 22;
    const h = 44;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.playerBig, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xffd9b0, 1);
    g.fillRect(4, 4, w - 8, 10);
    g.fillStyle(0x000000, 1);
    g.fillRect(8, 7, 2, 3);
    g.fillRect(w - 10, 7, 2, 3);
    g.generateTexture('player-big', w, h);
    g.destroy();
  }

  // Goomba.
  {
    const w = 28;
    const h = 26;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.goomba, 1);
    g.fillRoundedRect(0, 0, w, h, 6);
    g.fillStyle(0xffffff, 1);
    g.fillRect(6, 8, 4, 5);
    g.fillRect(w - 10, 8, 4, 5);
    g.fillStyle(0x000000, 1);
    g.fillRect(7, 9, 2, 3);
    g.fillRect(w - 9, 9, 2, 3);
    g.fillStyle(0x4a2511, 1);
    g.fillRect(4, h - 6, 6, 6);
    g.fillRect(w - 10, h - 6, 6, 6);
    g.generateTexture('goomba', w, h);
    g.destroy();
  }

  // Squished goomba (for death animation, brief).
  {
    const w = 28;
    const h = 10;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.goomba, 1);
    g.fillRoundedRect(0, 0, w, h, 4);
    g.generateTexture('goomba-flat', w, h);
    g.destroy();
  }

  // Koopa (taller).
  {
    const w = 26;
    const h = 36;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.koopa, 1);
    g.fillRoundedRect(0, 8, w, h - 8, 6);
    g.fillStyle(0xffe066, 1); // head
    g.fillRect(4, 0, w - 8, 12);
    g.fillStyle(0x000000, 1);
    g.fillRect(8, 4, 2, 3);
    g.fillRect(w - 10, 4, 2, 3);
    g.fillStyle(0x1f7a36, 1); // shell pattern
    g.fillRect(4, 14, w - 8, h - 22);
    g.generateTexture('koopa', w, h);
    g.destroy();
  }

  // Koopa shell.
  {
    const w = 26;
    const h = 22;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.shell, 1);
    g.fillRoundedRect(0, 0, w, h, 8);
    g.lineStyle(2, 0x0e4a20, 1);
    g.strokeRoundedRect(1, 1, w - 2, h - 2, 7);
    g.lineBetween(4, h / 2, w - 4, h / 2);
    g.generateTexture('shell', w, h);
    g.destroy();
  }

  // Coin (small spinning disc placeholder).
  {
    const size = 18;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.coin, 1);
    g.fillCircle(size / 2, size / 2, size / 2);
    g.lineStyle(2, 0x8a6a00, 1);
    g.strokeCircle(size / 2, size / 2, size / 2 - 1);
    g.fillStyle(0x8a6a00, 1);
    g.fillRect(size / 2 - 1, 4, 2, size - 8);
    g.generateTexture('coin', size, size);
    g.destroy();
  }

  // Mushroom power-up.
  {
    const w = 26;
    const h = 24;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.mushroom, 1);
    g.fillRoundedRect(0, 0, w, h - 8, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(7, 8, 4);
    g.fillCircle(w - 7, 8, 4);
    g.fillCircle(w / 2, 4, 4);
    g.fillStyle(0xffe2b5, 1);
    g.fillRect(4, h - 10, w - 8, 10);
    g.generateTexture('mushroom', w, h);
    g.destroy();
  }

  // Flag.
  {
    const w = 18;
    const h = 16;
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(0, 0, w, h / 2, 0, h);
    g.generateTexture('flag', w, h);
    g.destroy();
  }

  // Flag pole.
  rect('flagpole', 4, TILE * 10, COLORS.pole);

  // --- Fire-form player ---------------------------------------------------
  {
    const w = 22;
    const h = 44;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.playerFire, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xff3030, 1);
    g.fillRect(0, 0, w, 14);
    g.fillStyle(0xffd9b0, 1);
    g.fillRect(4, 4, w - 8, 10);
    g.fillStyle(0x000000, 1);
    g.fillRect(8, 7, 2, 3);
    g.fillRect(w - 10, 7, 2, 3);
    g.generateTexture('player-fire', w, h);
    g.destroy();
  }

  // --- Fire Flower power-up ----------------------------------------------
  {
    const w = 26;
    const h = 26;
    const g = scene.add.graphics();
    g.fillStyle(0x2ca44a, 1);
    g.fillRect(w / 2 - 2, h - 10, 4, 10);
    g.fillStyle(COLORS.fireFlower, 1);
    g.fillCircle(w / 2, h / 2 - 2, 8);
    g.fillStyle(0xfff067, 1);
    g.fillCircle(w / 2, h / 2 - 2, 4);
    g.fillStyle(0xff3030, 1);
    g.fillCircle(w / 2, h / 2 - 5, 2);
    g.generateTexture('fire-flower', w, h);
    g.destroy();
  }

  // --- Player fireball ----------------------------------------------------
  {
    const s = 12;
    const g = scene.add.graphics();
    g.fillStyle(COLORS.fireball, 1);
    g.fillCircle(s / 2, s / 2, s / 2);
    g.fillStyle(0xfff067, 1);
    g.fillCircle(s / 2, s / 2, s / 2 - 3);
    g.generateTexture('fireball', s, s);
    g.destroy();
  }

  // --- Bowser big fireball (player must jump over) ------------------------
  {
    const s = 26;
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(s / 2, s / 2 + 1, s / 2);
    g.fillStyle(COLORS.bigFireball, 1);
    g.fillCircle(s / 2, s / 2, s / 2 - 1);
    g.fillStyle(0xfff067, 1);
    g.fillCircle(s / 2, s / 2 - 1, s / 2 - 6);
    g.generateTexture('big-fireball', s, s);
    g.destroy();
  }

  // --- Shockwave ring -----------------------------------------------------
  {
    const s = 220;
    const g = scene.add.graphics();
    g.lineStyle(8, COLORS.shockwave, 1);
    g.strokeCircle(s / 2, s / 2, s / 2 - 4);
    g.lineStyle(4, 0xffffff, 0.8);
    g.strokeCircle(s / 2, s / 2, s / 2 - 12);
    g.generateTexture('shockwave', s, s);
    g.destroy();
  }

  // --- Armor ring (player overlay) ---------------------------------------
  {
    const s = 36;
    const g = scene.add.graphics();
    g.lineStyle(3, COLORS.armor, 1);
    g.strokeCircle(s / 2, s / 2, s / 2 - 2);
    g.generateTexture('armor-ring', s, s);
    g.destroy();
  }

  // --- Bowser -------------------------------------------------------------
  // Drawn as a stylised pixel-art portrait of classic Bowser:
  //   - red mohawk + horns up top
  //   - yellow head/body with cream belly panel
  //   - green spiked shell behind the body
  //   - black spiked collar
  // The texture is intentionally a bit larger than the body hitbox so the
  // shell + spikes can extend past it visually.
  {
    const W = 80;
    const H = 96;
    const g = scene.add.graphics();

    // Soft drop shadow under the feet.
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(W / 2, H - 4, 56, 8);

    // ----- Green shell with spikes (drawn behind the body) ---------------
    g.fillStyle(COLORS.bowserShell, 1);
    g.fillRoundedRect(8, 30, W - 16, H - 40, 14);
    // Shell highlight
    g.fillStyle(0x4cb24c, 1);
    g.fillRoundedRect(12, 34, W - 24, 10, 6);
    // Shell spikes (white triangles along the top of the shell)
    g.fillStyle(COLORS.bowserSpike, 1);
    for (let i = 0; i < 5; i++) {
      const sx = 14 + i * 13;
      g.fillTriangle(sx, 32, sx + 6, 18, sx + 12, 32);
    }

    // ----- Yellow body / belly area --------------------------------------
    g.fillStyle(COLORS.bowser, 1);
    g.fillRoundedRect(16, 38, W - 32, H - 50, 10);
    // Cream belly panel with horizontal scales.
    g.fillStyle(COLORS.bowserBelly, 1);
    g.fillRoundedRect(22, 46, W - 44, H - 64, 6);
    g.lineStyle(1, 0xb89a4a, 0.6);
    for (let y = 52; y < H - 22; y += 6) g.lineBetween(24, y, W - 24, y);

    // ----- Arms (yellow blocks with black spiked cuffs) ------------------
    g.fillStyle(COLORS.bowser, 1);
    g.fillRoundedRect(2, 44, 16, 22, 6);
    g.fillRoundedRect(W - 18, 44, 16, 22, 6);
    g.fillStyle(0x101010, 1);
    g.fillRect(2, 50, 16, 6);
    g.fillRect(W - 18, 50, 16, 6);
    g.fillStyle(COLORS.bowserSpike, 1);
    // Cuff spikes
    for (let i = 0; i < 3; i++) {
      g.fillTriangle(4 + i * 5, 50, 6 + i * 5, 46, 8 + i * 5, 50);
      g.fillTriangle(W - 16 + i * 5, 50, W - 14 + i * 5, 46, W - 12 + i * 5, 50);
    }

    // ----- Feet ----------------------------------------------------------
    g.fillStyle(COLORS.bowserBelly, 1);
    g.fillRoundedRect(18, H - 14, 18, 12, 4);
    g.fillRoundedRect(W - 36, H - 14, 18, 12, 4);
    g.fillStyle(0xffffff, 1);
    // Toe claws
    g.fillTriangle(20, H - 4, 23, H - 12, 26, H - 4);
    g.fillTriangle(28, H - 4, 31, H - 12, 34, H - 4);
    g.fillTriangle(W - 34, H - 4, W - 31, H - 12, W - 28, H - 4);
    g.fillTriangle(W - 26, H - 4, W - 23, H - 12, W - 20, H - 4);

    // ----- Head ----------------------------------------------------------
    g.fillStyle(COLORS.bowser, 1);
    g.fillRoundedRect(18, 12, W - 36, 28, 10);
    // Snout (lighter)
    g.fillStyle(0xfde488, 1);
    g.fillRoundedRect(24, 24, W - 48, 14, 6);
    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillRect(24, 18, 8, 8);
    g.fillRect(W - 32, 18, 8, 8);
    g.fillStyle(0x000000, 1);
    g.fillRect(28, 20, 4, 5);
    g.fillRect(W - 28, 20, 4, 5);
    // Eyebrows (red, angry)
    g.fillStyle(COLORS.bowserHair, 1);
    g.fillTriangle(22, 14, 34, 14, 34, 18);
    g.fillTriangle(W - 34, 14, W - 22, 14, W - 34, 18);
    // Mouth + fangs
    g.fillStyle(0x000000, 1);
    g.fillRect(28, 32, W - 56, 4);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(30, 32, 32, 38, 34, 32);
    g.fillTriangle(W - 34, 32, W - 32, 38, W - 30, 32);

    // ----- Horns ---------------------------------------------------------
    g.fillStyle(COLORS.bowserHorn, 1);
    g.fillTriangle(20, 12, 26, 0, 30, 12);
    g.fillTriangle(W - 30, 12, W - 26, 0, W - 20, 12);
    g.lineStyle(1, 0x8a7a3a, 1);
    g.strokeTriangle(20, 12, 26, 0, 30, 12);
    g.strokeTriangle(W - 30, 12, W - 26, 0, W - 20, 12);

    // ----- Red mohawk hair ----------------------------------------------
    g.fillStyle(COLORS.bowserHair, 1);
    // Three flame-like tufts.
    g.fillTriangle(W / 2 - 14, 14, W / 2 - 8, -4, W / 2 - 2, 14);
    g.fillTriangle(W / 2 - 6, 14, W / 2, -8, W / 2 + 6, 14);
    g.fillTriangle(W / 2 + 2, 14, W / 2 + 8, -4, W / 2 + 14, 14);

    // ----- Spiked collar -------------------------------------------------
    g.fillStyle(0x101010, 1);
    g.fillRect(16, 40, W - 32, 6);
    g.fillStyle(COLORS.bowserSpike, 1);
    for (let i = 0; i < 6; i++) {
      const sx = 18 + i * 7;
      g.fillTriangle(sx, 40, sx + 3, 36, sx + 6, 40);
    }

    g.generateTexture('bowser', W, H);
    g.destroy();
  }

  // --- Wario boss ---------------------------------------------------------
  // Chunky pixel-art villain: yellow cap with a blue "W" emblem, big pink
  // nose, brown zig-zag mustache, yellow shirt and purple overalls.
  {
    const W = 60;
    const H = 80;
    const g = scene.add.graphics();

    // Drop shadow.
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(W / 2, H - 3, 44, 7);

    // Legs / boots (purple overalls legs + green boots).
    g.fillStyle(COLORS.warioOveralls, 1);
    g.fillRect(14, 52, 12, 20);
    g.fillRect(W - 26, 52, 12, 20);
    g.fillStyle(0x1f7a36, 1);
    g.fillRoundedRect(10, 68, 18, 10, 3);
    g.fillRoundedRect(W - 28, 68, 18, 10, 3);

    // Torso — yellow shirt.
    g.fillStyle(COLORS.warioShirt, 1);
    g.fillRoundedRect(10, 30, W - 20, 26, 6);
    // Purple overalls bib over the shirt.
    g.fillStyle(COLORS.warioOveralls, 1);
    g.fillRect(18, 36, W - 36, 22);
    // Overall straps.
    g.fillRect(16, 30, 6, 12);
    g.fillRect(W - 22, 30, 6, 12);
    // Gold buttons.
    g.fillStyle(0xffe066, 1);
    g.fillCircle(20, 40, 2.5);
    g.fillCircle(W - 20, 40, 2.5);

    // Arms.
    g.fillStyle(COLORS.warioShirt, 1);
    g.fillRoundedRect(2, 32, 10, 20, 4);
    g.fillRoundedRect(W - 12, 32, 10, 20, 4);
    // White-gloved hands.
    g.fillStyle(0xffffff, 1);
    g.fillCircle(7, 52, 5);
    g.fillCircle(W - 7, 52, 5);

    // Head.
    g.fillStyle(COLORS.warioSkin, 1);
    g.fillRoundedRect(14, 8, W - 28, 24, 8);
    // Cap (yellow with a wide brim).
    g.fillStyle(COLORS.warioCap, 1);
    g.fillRoundedRect(12, 2, W - 24, 12, 5);
    g.fillRect(10, 12, W - 20, 5);
    // Blue circle + white "W" emblem on the cap.
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2, 8, 6);
    g.fillStyle(COLORS.warioEmblem, 1);
    g.fillCircle(W / 2, 8, 5);
    g.fillStyle(0xffffff, 1);
    g.fillRect(W / 2 - 4, 5, 1.5, 6);
    g.fillRect(W / 2 + 2.5, 5, 1.5, 6);
    g.fillRect(W / 2 - 0.75, 5, 1.5, 6);

    // Eyes.
    g.fillStyle(0xffffff, 1);
    g.fillRect(20, 18, 6, 6);
    g.fillRect(W - 26, 18, 6, 6);
    g.fillStyle(0x000000, 1);
    g.fillRect(23, 19, 3, 4);
    g.fillRect(W - 23, 19, 3, 4);
    // Angry eyebrows.
    g.fillStyle(0x3a2410, 1);
    g.fillRect(19, 16, 8, 2);
    g.fillRect(W - 27, 16, 8, 2);

    // Big pink nose.
    g.fillStyle(0xf2a07a, 1);
    g.fillRoundedRect(W / 2 - 6, 22, 12, 9, 4);

    // Zig-zag mustache under the nose.
    g.fillStyle(COLORS.warioMustache, 1);
    g.fillTriangle(W / 2 - 12, 31, W / 2 - 4, 31, W / 2 - 8, 37);
    g.fillTriangle(W / 2 - 4, 31, W / 2 + 4, 31, W / 2, 37);
    g.fillTriangle(W / 2 + 4, 31, W / 2 + 12, 31, W / 2 + 8, 37);

    g.generateTexture('wario', W, H);
    g.destroy();
  }

  // --- Wario throwing knife ----------------------------------------------
  {
    const w = 22;
    const h = 8;
    const g = scene.add.graphics();
    // Brown handle.
    g.fillStyle(COLORS.knifeHandle, 1);
    g.fillRect(0, h / 2 - 2, 7, 4);
    // Steel blade (pointed triangle).
    g.fillStyle(COLORS.knife, 1);
    g.fillTriangle(7, 0, w, h / 2, 7, h);
    g.lineStyle(1, 0x9aa3b0, 1);
    g.strokeTriangle(7, 0, w, h / 2, 7, h);
    g.generateTexture('knife', w, h);
    g.destroy();
  }

  // --- Wario bomb / grenade ----------------------------------------------
  {
    const s = 20;
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(s / 2, s / 2 + 1, s / 2 - 1);
    g.fillStyle(COLORS.bomb, 1);
    g.fillCircle(s / 2, s / 2, s / 2 - 2);
    // Highlight.
    g.fillStyle(0x555555, 1);
    g.fillCircle(s / 2 - 2, s / 2 - 2, 2);
    // Fuse cap + spark.
    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(s / 2 - 2, 1, 4, 4);
    g.fillStyle(COLORS.bombFuse, 1);
    g.fillCircle(s / 2 + 2, 1, 2);
    g.generateTexture('bomb', s, s);
    g.destroy();
  }

  // --- Lasso loop (visual only) ------------------------------------------
  {
    const s = 28;
    const g = scene.add.graphics();
    g.lineStyle(3, COLORS.lasso, 1);
    g.strokeEllipse(s / 2, s / 2, s - 6, s - 12);
    g.generateTexture('lasso-loop', s, s);
    g.destroy();
  }
}
