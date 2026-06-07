import Phaser from 'phaser';
import { HUD_KEY } from './PlayScene';
export class UIScene extends Phaser.Scene {
    // Boss HP UI removed — Bowser will appear only in later levels.
    constructor() {
        super('UIScene');
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    create() {
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
        // Boss HP bar removed — omit boss UI elements.
        this.render(this.registry.get(HUD_KEY));
        this.registry.events.on(`changedata-${HUD_KEY}`, (_p, value) => {
            this.render(value);
        });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.registry.events.off(`changedata-${HUD_KEY}`);
        });
    }
    render(s) {
        if (!s || !this.label)
            return;
        const power = s.power === 'fire' ? '🔥FIRE' : s.power === 'big' ? 'BIG' : 'SMALL';
        const armor = s.armor ? '  [ARMOR]' : '';
        this.label.setText(`${s.level}    SCORE ${s.score.toString().padStart(6, '0')}    COINS ${s.coins}    LIVES ${s.lives}    ${power}${armor}`);
        // Boss HP display removed; nothing to render for boss HP here.
    }
}
