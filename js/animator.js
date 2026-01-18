/**
 * Animator - Text-prompt based animation system
 * Extended with 25+ animations!
 */

export class Animator {
    constructor() {
        this.model = null;
        this.currentAnimation = null;
        this.speed = 1.0;
        this.isPlaying = true;
        this.time = 0;
        this.initialState = null;

        // Animation definitions - 25+ animations!
        this.animations = {
            // Basic rotations
            rotate: this.animateRotate.bind(this),
            spin: this.animateSpin.bind(this),
            roll: this.animateRoll.bind(this),
            flip: this.animateFlip.bind(this),

            // Vertical motions
            bounce: this.animateBounce.bind(this),
            float: this.animateFloat.bind(this),
            jump: this.animateJump.bind(this),
            hop: this.animateHop.bind(this),
            levitate: this.animateLevitate.bind(this),

            // Scale effects
            pulse: this.animatePulse.bind(this),
            breathe: this.animateBreathe.bind(this),
            heartbeat: this.animateHeartbeat.bind(this),
            grow: this.animateGrow.bind(this),
            shrink: this.animateShrink.bind(this),

            // Horizontal motions
            shake: this.animateShake.bind(this),
            wave: this.animateWave.bind(this),
            swing: this.animateSwing.bind(this),
            sway: this.animateSway.bind(this),
            wobble: this.animateWobble.bind(this),

            // Character animations
            walk: this.animateWalk.bind(this),
            run: this.animateRun.bind(this),
            dance: this.animateDance.bind(this),
            march: this.animateMarch.bind(this),
            strut: this.animateStrut.bind(this),

            // Special effects
            spiral: this.animateSpiral.bind(this),
            orbit: this.animateOrbit.bind(this),
            fly: this.animateFly.bind(this),
            zigzag: this.animateZigzag.bind(this),
            pendulum: this.animatePendulum.bind(this),
            tornado: this.animateTornado.bind(this),
            earthquake: this.animateEarthquake.bind(this),
            crazy: this.animateCrazy.bind(this)
        };

        // Natural language aliases
        this.aliases = {
            'rotating': 'rotate', 'turn': 'rotate', 'turning': 'rotate',
            'spinning': 'spin', 'twirl': 'spin',
            'bouncing': 'bounce', 'boing': 'bounce',
            'floating': 'float', 'hover': 'float', 'hovering': 'float',
            'pulsing': 'pulse', 'throb': 'pulse',
            'waving': 'wave',
            'shaking': 'shake', 'vibrate': 'shake', 'vibrating': 'shake',
            'swinging': 'swing',
            'rolling': 'roll',
            'flipping': 'flip',
            'wobbling': 'wobble',
            'jumping': 'jump', 'leap': 'jump',
            'walking': 'walk', 'stepping': 'walk',
            'running': 'run', 'jog': 'run', 'jogging': 'run', 'sprint': 'run',
            'dancing': 'dance', 'boogie': 'dance', 'groove': 'dance',
            'breathing': 'breathe',
            'flying': 'fly', 'soar': 'fly', 'soaring': 'fly', 'glide': 'fly',
            'spiraling': 'spiral', 'corkscrew': 'spiral',
            'orbiting': 'orbit', 'circle': 'orbit', 'circling': 'orbit',
            'hopping': 'hop', 'skip': 'hop',
            'marching': 'march', 'parade': 'march',
            'strutting': 'strut',
            'swaying': 'sway', 'rock': 'sway',
            'levitating': 'levitate', 'rise': 'levitate',
            'zig-zag': 'zigzag', 'snake': 'zigzag',
            'wild': 'crazy', 'random': 'crazy', 'chaos': 'crazy'
        };
    }

    setModel(model) {
        this.model = model;
        this.saveInitialState();
    }

    saveInitialState() {
        if (!this.model) return;
        this.initialState = {
            position: this.model.position.clone(),
            rotation: this.model.rotation.clone(),
            scale: this.model.scale.clone()
        };
    }

    resetToInitialState() {
        if (!this.model || !this.initialState) return;
        this.model.position.copy(this.initialState.position);
        this.model.rotation.copy(this.initialState.rotation);
        this.model.scale.copy(this.initialState.scale);
        this.time = 0;
    }

    parsePrompt(prompt) {
        const lowerPrompt = prompt.toLowerCase().trim();
        if (this.animations[lowerPrompt]) return lowerPrompt;
        if (this.aliases[lowerPrompt]) return this.aliases[lowerPrompt];

        for (const [alias, animation] of Object.entries(this.aliases)) {
            if (lowerPrompt.includes(alias)) return animation;
        }
        for (const animation of Object.keys(this.animations)) {
            if (lowerPrompt.includes(animation)) return animation;
        }
        return null;
    }

    setAnimation(animationName) {
        const parsed = this.parsePrompt(animationName);
        if (parsed && this.animations[parsed]) {
            this.currentAnimation = parsed;
            this.time = 0;
            return true;
        }
        return false;
    }

    setSpeed(speed) { this.speed = speed; }
    play() { this.isPlaying = true; }
    pause() { this.isPlaying = false; }

    stop() {
        this.isPlaying = false;
        this.currentAnimation = null;
        this.resetToInitialState();
    }

    update(deltaTime) {
        if (!this.model || !this.currentAnimation || !this.isPlaying) return;
        this.time += deltaTime * this.speed;
        const animFn = this.animations[this.currentAnimation];
        if (animFn) animFn(this.time);
    }

    getAvailableAnimations() { return Object.keys(this.animations); }
    getCurrentAnimation() { return this.currentAnimation; }

    // ============ BASIC ROTATIONS ============

    animateRotate(t) {
        if (!this.model) return;
        this.model.rotation.y = this.initialState.rotation.y + t;
    }

    animateSpin(t) {
        if (!this.model) return;
        this.model.rotation.y = this.initialState.rotation.y + t * 4;
    }

    animateRoll(t) {
        if (!this.model) return;
        this.model.rotation.x = this.initialState.rotation.x + t * 2;
    }

    animateFlip(t) {
        if (!this.model) return;
        this.model.rotation.x = this.initialState.rotation.x + t * 2;
        const bounce = Math.abs(Math.sin(t * 2)) * 0.3;
        this.model.position.y = this.initialState.position.y + bounce;
    }

    // ============ VERTICAL MOTIONS ============

    animateBounce(t) {
        if (!this.model) return;
        const bounce = Math.abs(Math.sin(t * 4)) * 0.5;
        this.model.position.y = this.initialState.position.y + bounce;
    }

    animateFloat(t) {
        if (!this.model) return;
        const float = Math.sin(t * 1.5) * 0.2;
        this.model.position.y = this.initialState.position.y + float + 0.1;
    }

    animateJump(t) {
        if (!this.model) return;
        const cycle = t % (Math.PI * 2);
        const height = Math.max(0, Math.sin(cycle * 2)) * 1.0;
        this.model.position.y = this.initialState.position.y + height;

        // Squash and stretch
        const squash = 1 - Math.abs(Math.sin(cycle * 2)) * 0.15;
        const stretch = 1 + Math.abs(Math.sin(cycle * 2)) * 0.15;
        const base = this.initialState.scale.x;
        this.model.scale.set(base * squash, base * stretch, base * squash);
    }

    animateHop(t) {
        if (!this.model) return;
        const hop = Math.abs(Math.sin(t * 5)) * 0.3;
        this.model.position.y = this.initialState.position.y + hop;
        this.model.position.x = this.initialState.position.x + Math.sin(t * 2.5) * 0.2;
    }

    animateLevitate(t) {
        if (!this.model) return;
        const rise = Math.sin(t * 0.5) * 0.3 + 0.5;
        const wobble = Math.sin(t * 3) * 0.02;
        this.model.position.y = this.initialState.position.y + rise;
        this.model.rotation.y = this.initialState.rotation.y + wobble;
    }

    // ============ SCALE EFFECTS ============

    animatePulse(t) {
        if (!this.model) return;
        const scale = 1 + Math.sin(t * 4) * 0.15;
        const base = this.initialState.scale.x;
        this.model.scale.setScalar(base * scale);
    }

    animateBreathe(t) {
        if (!this.model) return;
        const breathe = 1 + Math.sin(t * 1.5) * 0.08;
        const base = this.initialState.scale.x;
        this.model.scale.setScalar(base * breathe);
        this.model.position.y = this.initialState.position.y + Math.sin(t * 1.5) * 0.05;
    }

    animateHeartbeat(t) {
        if (!this.model) return;
        const beat = Math.sin(t * 8);
        const scale = 1 + (beat > 0.7 ? 0.15 : beat > 0.3 ? 0.08 : 0);
        const base = this.initialState.scale.x;
        this.model.scale.setScalar(base * scale);
    }

    animateGrow(t) {
        if (!this.model) return;
        const grow = 1 + (Math.sin(t * 0.5) + 1) * 0.25;
        const base = this.initialState.scale.x;
        this.model.scale.setScalar(base * grow);
    }

    animateShrink(t) {
        if (!this.model) return;
        const shrink = 1 - (Math.sin(t * 0.5) + 1) * 0.2;
        const base = this.initialState.scale.x;
        this.model.scale.setScalar(base * Math.max(0.3, shrink));
    }

    // ============ HORIZONTAL MOTIONS ============

    animateShake(t) {
        if (!this.model) return;
        const shake = Math.sin(t * 25) * 0.05;
        this.model.position.x = this.initialState.position.x + shake;
    }

    animateWave(t) {
        if (!this.model) return;
        this.model.rotation.z = this.initialState.rotation.z + Math.sin(t * 2) * 0.4;
        this.model.position.y = this.initialState.position.y + Math.sin(t * 2) * 0.1;
    }

    animateSwing(t) {
        if (!this.model) return;
        this.model.rotation.z = this.initialState.rotation.z + Math.sin(t * 2) * 0.6;
    }

    animateSway(t) {
        if (!this.model) return;
        this.model.rotation.z = this.initialState.rotation.z + Math.sin(t * 1.5) * 0.2;
        this.model.position.x = this.initialState.position.x + Math.sin(t * 1.5) * 0.1;
    }

    animateWobble(t) {
        if (!this.model) return;
        this.model.rotation.x = this.initialState.rotation.x + Math.sin(t * 3) * 0.25;
        this.model.rotation.z = this.initialState.rotation.z + Math.cos(t * 3) * 0.25;
    }

    // ============ CHARACTER ANIMATIONS ============

    animateWalk(t) {
        if (!this.model) return;
        const step = Math.abs(Math.sin(t * 4)) * 0.1;
        const sway = Math.sin(t * 2) * 0.1;
        const bob = Math.sin(t * 4) * 0.05;

        this.model.position.y = this.initialState.position.y + step;
        this.model.rotation.z = this.initialState.rotation.z + sway;
        this.model.position.x = this.initialState.position.x + bob;
    }

    animateRun(t) {
        if (!this.model) return;
        const step = Math.abs(Math.sin(t * 8)) * 0.15;
        const lean = Math.sin(t * 4) * 0.15;
        const bounce = Math.abs(Math.sin(t * 8)) * 0.1;

        this.model.position.y = this.initialState.position.y + step + bounce;
        this.model.rotation.z = this.initialState.rotation.z + lean;
        this.model.rotation.x = this.initialState.rotation.x + 0.1; // Lean forward
    }

    animateDance(t) {
        if (!this.model) return;
        this.model.rotation.y = this.initialState.rotation.y + Math.sin(t * 4) * 0.6;
        this.model.position.y = this.initialState.position.y + Math.abs(Math.sin(t * 6)) * 0.4;
        this.model.rotation.z = this.initialState.rotation.z + Math.sin(t * 3) * 0.25;

        const scale = 1 + Math.sin(t * 6) * 0.08;
        const base = this.initialState.scale.x;
        this.model.scale.setScalar(base * scale);
    }

    animateMarch(t) {
        if (!this.model) return;
        const step = Math.abs(Math.sin(t * 3)) * 0.2;
        const swing = Math.sin(t * 3) * 0.1;

        this.model.position.y = this.initialState.position.y + step;
        this.model.rotation.z = this.initialState.rotation.z + swing;
    }

    animateStrut(t) {
        if (!this.model) return;
        const step = Math.abs(Math.sin(t * 2.5)) * 0.12;
        const sway = Math.sin(t * 2.5) * 0.2;
        const hip = Math.sin(t * 2.5) * 0.15;

        this.model.position.y = this.initialState.position.y + step;
        this.model.rotation.z = this.initialState.rotation.z + sway;
        this.model.position.x = this.initialState.position.x + hip;
    }

    // ============ SPECIAL EFFECTS ============

    animateSpiral(t) {
        if (!this.model) return;
        const radius = 0.3;
        this.model.position.x = this.initialState.position.x + Math.cos(t * 2) * radius;
        this.model.position.z = this.initialState.position.z + Math.sin(t * 2) * radius;
        this.model.position.y = this.initialState.position.y + Math.sin(t * 0.5) * 0.3;
        this.model.rotation.y = this.initialState.rotation.y + t * 2;
    }

    animateOrbit(t) {
        if (!this.model) return;
        const radius = 0.5;
        this.model.position.x = this.initialState.position.x + Math.cos(t * 1.5) * radius;
        this.model.position.z = this.initialState.position.z + Math.sin(t * 1.5) * radius;
        this.model.rotation.y = this.initialState.rotation.y + t * 1.5;
    }

    animateFly(t) {
        if (!this.model) return;
        const glide = Math.sin(t * 0.8) * 0.5 + 0.5;
        const tilt = Math.sin(t * 1.5) * 0.15;
        const sway = Math.sin(t * 2) * 0.2;

        this.model.position.y = this.initialState.position.y + glide;
        this.model.rotation.z = this.initialState.rotation.z + tilt;
        this.model.position.x = this.initialState.position.x + sway;
    }

    animateZigzag(t) {
        if (!this.model) return;
        const zigzag = Math.sin(t * 4) * 0.4;
        const forward = Math.sin(t * 2) * 0.2;

        this.model.position.x = this.initialState.position.x + zigzag;
        this.model.position.z = this.initialState.position.z + forward;
    }

    animatePendulum(t) {
        if (!this.model) return;
        const swing = Math.sin(t * 2) * 0.8;
        const rise = Math.abs(Math.cos(t * 2)) * 0.2;

        this.model.rotation.z = this.initialState.rotation.z + swing;
        this.model.position.y = this.initialState.position.y + rise;
    }

    animateTornado(t) {
        if (!this.model) return;
        const radius = Math.sin(t * 0.5) * 0.3 + 0.2;
        this.model.position.x = this.initialState.position.x + Math.cos(t * 5) * radius;
        this.model.position.z = this.initialState.position.z + Math.sin(t * 5) * radius;
        this.model.position.y = this.initialState.position.y + Math.sin(t * 2) * 0.3;
        this.model.rotation.y = this.initialState.rotation.y + t * 8;
    }

    animateEarthquake(t) {
        if (!this.model) return;
        const shakeX = (Math.random() - 0.5) * 0.1;
        const shakeZ = (Math.random() - 0.5) * 0.1;
        const shakeY = (Math.random() - 0.5) * 0.05;

        this.model.position.x = this.initialState.position.x + shakeX;
        this.model.position.z = this.initialState.position.z + shakeZ;
        this.model.position.y = this.initialState.position.y + shakeY;
    }

    animateCrazy(t) {
        if (!this.model) return;
        this.model.rotation.x = this.initialState.rotation.x + Math.sin(t * 7) * 0.5;
        this.model.rotation.y = this.initialState.rotation.y + t * 3;
        this.model.rotation.z = this.initialState.rotation.z + Math.cos(t * 5) * 0.4;
        this.model.position.y = this.initialState.position.y + Math.abs(Math.sin(t * 8)) * 0.4;
        this.model.position.x = this.initialState.position.x + Math.sin(t * 6) * 0.3;

        const scale = 1 + Math.sin(t * 10) * 0.1;
        const base = this.initialState.scale.x;
        this.model.scale.setScalar(base * scale);
    }
}
