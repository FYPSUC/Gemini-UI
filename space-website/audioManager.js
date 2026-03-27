/**
 * AudioManager - 负责背景音乐的加载、控制与 UI 交互
 */

const STAY_URL = 'https://archive.org/download/interstellar-soundtrack/15%20S.T.A.Y..mp3';

class AudioManager {
    constructor() {
        this.audio = new Audio(STAY_URL);
        this.audio.loop = true;
        this.audio.volume = 0.5;
        
        this.isPlaying = false;
        this.btn = document.getElementById('music-toggle');
        this.waves = document.getElementById('music-waves');
        this.icon = this.btn.querySelector('.music-icon');
        
        this.init();
    }

    init() {
        if (!this.btn) return;

        this.btn.addEventListener('click', () => {
            this.toggle();
        });

        // 预加载
        this.audio.load();
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.waves.classList.add('playing');
            this.icon.textContent = '⏸️';
            
            // 简单的音量淡入
            this.audio.volume = 0;
            gsap.to(this.audio, { volume: 0.5, duration: 2 });
        }).catch(err => {
            console.warn('Audio playback failed, possibly due to browser policy:', err);
        });
    }

    pause() {
        gsap.to(this.audio, { 
            volume: 0, 
            duration: 1, 
            onComplete: () => {
                this.audio.pause();
                this.isPlaying = false;
                this.waves.classList.remove('playing');
                this.icon.textContent = '🎵';
            }
        });
    }
}

export const initAudio = () => {
    return new AudioManager();
};
