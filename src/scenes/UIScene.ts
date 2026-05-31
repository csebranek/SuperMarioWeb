import Phaser from 'phaser';
import { HUD_KEY } from './PlayScene';
import { BOSS } from '../constants';

interface HudState {
  score: number;
  coins: number;
  lives: number;
  level: string;
  armor: boolean;
  power: 'small' | 'big' | 'fire';
  bossHp?: number;
}

export class UIScene extends Phaser.Scene {
  private label!: Phaser.GameObjects.Text;
  private bossBarBg!: Phaser.GameObjects.Rectangle;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossLabel!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create(): void {
    this.label = this.add
      .text(16, 12, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setScrollFactor(0);

    this.add
      .text(16, this.scale.height - 28, '←→ / A D move    SPACE / ↑ / W jump    [ F ] shoot fireball (Fire form only)', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setScrollFactor(0);

    // Boss HP bar (hidden by default). Positioned BELOW the score line so
    // it doesn't overlap the top HUD text.
    const W = 280;
    const BAR_Y = 56;
    this.bossBarBg = this.add
      .rectangle(this.scale.width / 2, BAR_Y, W, 14, 0x000000, 0.75)
      .setStrokeStyle(2, 0xffffff)
      .setScrollFactor(0)
      .setVisible(false);
    this.bossBarFill = this.add
      .rectangle(this.scale.width / 2 - W / 2 + 2, BAR_Y, W - 4, 10, 0xff3030)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setVisible(false);
    this.bossLabel = this.add
      .text(this.scale.width / 2, BAR_Y - 14, 'BOWSER', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setVisible(false);

    this.render(this.registry.get(HUD_KEY) as HudState | undefined);
    this.registry.events.on(`changedata-${HUD_KEY}`, (_p: unknown, value: HudState) => {
      this.render(value);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off(`changedata-${HUD_KEY}`);
    });
  }

  private render(s: HudState | undefined): void {
    if (!s || !this.label) return;
    const power = s.power === 'fire' ? '🔥FIRE' : s.power === 'big' ? 'BIG' : 'SMALL';
    const armor = s.armor ? '  [ARMOR]' : '';
    this.label.setText(
      `${s.level}    SCORE ${s.score.toString().padStart(6, '0')}    COINS ${s.coins}    LIVES ${s.lives}    ${power}${armor}`
    );

    const W = 280;
    if (s.bossHp !== undefined && s.bossHp > 0) {
      const pct = Math.max(0, s.bossHp / BOSS.hp);
      this.bossBarBg.setVisible(true);
      this.bossBarFill.setVisible(true).setSize((W - 4) * pct, 10);
      this.bossLabel.setText(`BOWSER  ${s.bossHp}/${BOSS.hp}`).setVisible(true);
    } else {
      this.bossBarBg.setVisible(false);
      this.bossBarFill.setVisible(false);
      this.bossLabel.setVisible(false);
    }
  }
}
