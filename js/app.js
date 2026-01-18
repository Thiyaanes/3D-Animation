/**
 * 3D Animation Agent - Pure Frontend
 * Supports GLB, GLTF, OBJ files
 */

import { SceneManager } from './scene.js';
import { Animator } from './animator.js';
import { Recorder } from './recorder.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

class App {
    constructor() {
        this.sceneManager = null;
        this.animator = null;
        this.recorder = null;
        this.clock = null;
        this.modelLoaded = false;
        this.gltfLoader = null;
        this.objLoader = null;

        console.log('[App] Starting...');
        this.init();
    }

    async init() {
        try {
            await this.waitForDOM();
            console.log('[App] DOM ready');

            const canvas = document.getElementById('three-canvas');
            if (!canvas) {
                console.error('[App] Canvas not found!');
                return;
            }

            this.sceneManager = new SceneManager(canvas);
            this.animator = new Animator();
            this.recorder = new Recorder(this.sceneManager.getCanvas());
            this.clock = { lastTime: performance.now() };

            this.setupUI();
            this.animate();

            setTimeout(() => this.hideLoading(), 500);
            console.log('[App] Ready!');

        } catch (error) {
            console.error('[App] Init error:', error);
        }
    }

    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState !== 'loading') {
                setTimeout(resolve, 50);
            } else {
                document.addEventListener('DOMContentLoaded', () => setTimeout(resolve, 50));
            }
        });
    }

    hideLoading() {
        const loading = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (loading) loading.classList.add('hidden');
        if (app) app.classList.remove('hidden');
        setTimeout(() => this.sceneManager?.onResize(), 100);
    }

    setupUI() {
        this.setupFileUpload();
        this.setupSampleModels();
        this.setupCategoryTabs();
        this.setupAnimationControls();
        this.setupPlaybackControls();
        this.setupRecorder();
        this.setupSceneSettings();
        this.setupViewportControls();
        console.log('[App] UI setup complete');
    }

    setupCategoryTabs() {
        const tabs = document.querySelectorAll('.category-tab');
        const contents = document.querySelectorAll('.category-content');

        tabs.forEach(tab => {
            tab.onclick = (e) => {
                e.preventDefault();
                const category = tab.dataset.category;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding content
                contents.forEach(c => {
                    c.classList.toggle('active', c.dataset.category === category);
                });

                console.log('[App] Switched to category:', category);
            };
        });
    }

    // ============ FILE UPLOAD ============
    setupFileUpload() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const removeBtn = document.getElementById('btn-remove-model');

        if (!dropZone || !fileInput) {
            console.error('[App] Upload elements not found');
            return;
        }

        // Note: Label handles click natively, no need for onclick
        console.log('[App] Drop zone is a label, click handled by browser');

        // File selected via input
        fileInput.onchange = (e) => {
            console.log('[App] File input changed');
            if (e.target.files && e.target.files[0]) {
                console.log('[App] Loading file:', e.target.files[0].name);
                this.loadFile(e.target.files[0]);
            }
        };

        // Drag over
        dropZone.ondragover = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        };

        // Drag leave
        dropZone.ondragleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        };

        // Drop
        dropZone.ondrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
            console.log('[App] File dropped');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                console.log('[App] Loading dropped file:', e.dataTransfer.files[0].name);
                this.loadFile(e.dataTransfer.files[0]);
            }
        };

        // Remove model button
        if (removeBtn) {
            removeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeModel();
            };
        }

        console.log('[App] File upload setup complete');
    }

    async loadFile(file) {
        const name = file.name;
        const ext = name.split('.').pop().toLowerCase();

        console.log('[App] Loading file:', name, 'format:', ext);

        // Check format
        if (!['glb', 'gltf', 'obj'].includes(ext)) {
            alert('Unsupported format: ' + ext + '\n\nPlease use GLB, GLTF, or OBJ files.');
            return;
        }

        this.showLoadingState('Loading ' + name + '...');

        const url = URL.createObjectURL(file);
        console.log('[App] Created blob URL:', url);

        try {
            let model = null;

            if (ext === 'glb' || ext === 'gltf') {
                console.log('[App] Using GLTF loader');
                if (!this.gltfLoader) {
                    this.gltfLoader = new GLTFLoader();
                }

                const gltf = await new Promise((resolve, reject) => {
                    this.gltfLoader.load(
                        url,
                        (result) => {
                            console.log('[App] GLTF loaded successfully');
                            resolve(result);
                        },
                        (progress) => {
                            if (progress.total > 0) {
                                const pct = Math.round((progress.loaded / progress.total) * 100);
                                this.showLoadingState('Loading... ' + pct + '%');
                            }
                        },
                        (error) => {
                            console.error('[App] GLTF load error:', error);
                            reject(error);
                        }
                    );
                });
                model = gltf.scene;

            } else if (ext === 'obj') {
                console.log('[App] Using OBJ loader');
                if (!this.objLoader) {
                    this.objLoader = new OBJLoader();
                }

                model = await new Promise((resolve, reject) => {
                    this.objLoader.load(
                        url,
                        (result) => {
                            console.log('[App] OBJ loaded successfully');
                            resolve(result);
                        },
                        (progress) => {
                            if (progress.total > 0) {
                                const pct = Math.round((progress.loaded / progress.total) * 100);
                                this.showLoadingState('Loading... ' + pct + '%');
                            }
                        },
                        (error) => {
                            console.error('[App] OBJ load error:', error);
                            reject(error);
                        }
                    );
                });
            }

            URL.revokeObjectURL(url);

            if (model) {
                this.onModelLoaded(model, name);
            } else {
                throw new Error('Model is null');
            }

        } catch (error) {
            console.error('[App] Failed to load model:', error);
            URL.revokeObjectURL(url);
            alert('Failed to load model.\n\nError: ' + error.message + '\n\nPlease try a different file.');
            this.resetDropZone();
        }
    }

    showLoadingState(text) {
        const content = document.querySelector('.drop-zone-content');
        if (content) {
            content.innerHTML = `
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #6366f1; margin-bottom: 12px;"></i>
                <p>${text}</p>
            `;
        }
    }

    resetDropZone() {
        const content = document.querySelector('.drop-zone-content');
        if (content) {
            content.innerHTML = `
                <i class="fas fa-file-upload"></i>
                <p>Drag & drop your 3D model</p>
                <span>or click to browse</span>
            `;
        }
    }

    onModelLoaded(model, name) {
        console.log('[App] Model loaded:', name);

        const addedModel = this.sceneManager.addModel(model);
        this.animator.setModel(addedModel);
        this.modelLoaded = true;

        // Update UI
        const modelInfo = document.getElementById('model-info');
        const modelName = document.getElementById('loaded-model-name');
        const emptyState = document.getElementById('empty-state');

        if (modelInfo) modelInfo.classList.remove('hidden');
        if (modelName) modelName.textContent = name;
        if (emptyState) emptyState.classList.add('hidden');

        this.resetDropZone();
        console.log('[App] Model setup complete');
    }

    removeModel() {
        console.log('[App] Removing model');
        this.sceneManager.removeModel();
        this.animator.setModel(null);
        this.modelLoaded = false;

        const modelInfo = document.getElementById('model-info');
        const emptyState = document.getElementById('empty-state');
        const activeAnim = document.getElementById('active-animation');

        if (modelInfo) modelInfo.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (activeAnim) activeAnim.classList.add('hidden');

        this.updatePresetButtons('');
    }

    // ============ SAMPLE MODELS ============
    setupSampleModels() {
        const btns = document.querySelectorAll('.sample-btn');
        console.log('[App] Found', btns.length, 'sample buttons');

        btns.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const type = btn.dataset.model;
                console.log('[App] Creating sample:', type);

                try {
                    const model = this.sceneManager.createPrimitive(type);
                    this.animator.setModel(model);
                    this.onModelLoaded(model, type + '.primitive');
                } catch (err) {
                    console.error('[App] Failed to create primitive:', err);
                }
            };
        });
    }

    // ============ ANIMATION ============
    setupAnimationControls() {
        const promptInput = document.getElementById('animation-prompt');
        const applyBtn = document.getElementById('btn-apply-animation');
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');

        const applyAnimation = () => {
            const prompt = promptInput?.value.trim();
            if (!prompt) return;

            if (!this.modelLoaded) {
                alert('Please load a 3D model first!');
                return;
            }

            console.log('[App] Applying animation:', prompt);

            if (this.animator.setAnimation(prompt)) {
                this.showActiveAnimation(prompt);
                this.updatePresetButtons(prompt);
            } else {
                alert('Unknown animation: "' + prompt + '"\n\nTry: rotate, bounce, spin, float, pulse, wave, shake, jump, dance, wobble, walk');
            }
        };

        if (applyBtn) {
            applyBtn.onclick = (e) => {
                e.preventDefault();
                applyAnimation();
            };
        }

        if (promptInput) {
            promptInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyAnimation();
                }
            };
        }

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();

                if (!this.modelLoaded) {
                    alert('Please load a 3D model first!');
                    return;
                }

                const anim = btn.dataset.animation;
                console.log('[App] Preset clicked:', anim);

                this.animator.setAnimation(anim);
                this.showActiveAnimation(anim);
                this.updatePresetButtons(anim);
                if (promptInput) promptInput.value = anim;
            };
        });

        // Speed slider
        if (speedSlider && speedValue) {
            speedSlider.oninput = () => {
                const speed = parseFloat(speedSlider.value);
                this.animator.setSpeed(speed);
                speedValue.textContent = speed.toFixed(1) + 'x';
            };
        }
    }

    showActiveAnimation(name) {
        const el = document.getElementById('active-animation');
        const nameEl = document.getElementById('current-animation-name');
        if (el) el.classList.remove('hidden');
        if (nameEl) nameEl.textContent = name;
    }

    updatePresetButtons(active) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.animation === active);
        });
    }

    // ============ PLAYBACK ============
    setupPlaybackControls() {
        const playBtn = document.getElementById('btn-play');
        const pauseBtn = document.getElementById('btn-pause');
        const stopBtn = document.getElementById('btn-stop');

        if (playBtn) {
            playBtn.onclick = (e) => {
                e.preventDefault();
                this.animator.play();
                playBtn.classList.add('active');
                pauseBtn?.classList.remove('active');
            };
        }

        if (pauseBtn) {
            pauseBtn.onclick = (e) => {
                e.preventDefault();
                this.animator.pause();
                pauseBtn.classList.add('active');
                playBtn?.classList.remove('active');
            };
        }

        if (stopBtn) {
            stopBtn.onclick = (e) => {
                e.preventDefault();
                this.animator.stop();
                playBtn?.classList.remove('active');
                pauseBtn?.classList.remove('active');
                document.getElementById('active-animation')?.classList.add('hidden');
                const prompt = document.getElementById('animation-prompt');
                if (prompt) prompt.value = '';
                this.updatePresetButtons('');
            };
        }
    }

    // ============ RECORDER ============
    setupRecorder() {
        const recordBtn = document.getElementById('btn-record');
        const durationSlider = document.getElementById('duration-slider');
        const durationValue = document.getElementById('duration-value');
        const indicator = document.getElementById('recording-indicator');
        const timer = document.getElementById('rec-timer');

        if (durationSlider && durationValue) {
            durationSlider.oninput = () => {
                const dur = parseInt(durationSlider.value);
                this.recorder.setDuration(dur);
                durationValue.textContent = dur + 's';
            };
        }

        if (recordBtn) {
            recordBtn.onclick = (e) => {
                e.preventDefault();
                if (!this.modelLoaded) {
                    alert('Please load a 3D model first!');
                    return;
                }
                if (!this.recorder.canRecord()) {
                    alert('Video recording not supported in this browser.');
                    return;
                }
                console.log('[App] Starting recording');
                this.recorder.start();
            };

            this.recorder.onStart = () => {
                recordBtn.disabled = true;
                recordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Recording...</span>';
                indicator?.classList.remove('hidden');
            };

            this.recorder.onProgress = (elapsed) => {
                if (timer) timer.textContent = this.recorder.formatTime(elapsed);
            };

            this.recorder.onStop = () => {
                recordBtn.disabled = false;
                recordBtn.innerHTML = '<i class="fas fa-circle"></i><span>Record Video</span>';
                indicator?.classList.add('hidden');
                console.log('[App] Recording complete');
            };
        }
    }

    // ============ SCENE SETTINGS ============
    setupSceneSettings() {
        const header = document.getElementById('settings-header');
        const content = document.getElementById('settings-content');
        const lightSlider = document.getElementById('light-slider');
        const lightValue = document.getElementById('light-value');

        if (header && content) {
            header.onclick = (e) => {
                e.preventDefault();
                header.classList.toggle('collapsed');
                content.classList.toggle('hidden');
            };
        }

        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.sceneManager.setBackground(btn.dataset.color);
            };
        });

        if (lightSlider && lightValue) {
            lightSlider.oninput = () => {
                const val = parseFloat(lightSlider.value);
                this.sceneManager.setLightIntensity(val);
                lightValue.textContent = val.toFixed(1);
            };
        }
    }

    // ============ VIEWPORT ============
    setupViewportControls() {
        const resetBtn = document.getElementById('btn-reset-camera');
        const fullBtn = document.getElementById('btn-fullscreen');
        const gridBtn = document.getElementById('btn-grid-toggle');

        if (resetBtn) {
            resetBtn.onclick = (e) => {
                e.preventDefault();
                this.sceneManager.resetCamera();
            };
        }

        if (fullBtn) {
            fullBtn.onclick = (e) => {
                e.preventDefault();
                const container = document.querySelector('.viewport-container');
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    fullBtn.innerHTML = '<i class="fas fa-expand"></i>';
                } else if (container) {
                    container.requestFullscreen();
                    fullBtn.innerHTML = '<i class="fas fa-compress"></i>';
                }
            };
        }

        if (gridBtn) {
            gridBtn.onclick = (e) => {
                e.preventDefault();
                gridBtn.classList.toggle('active');
                this.sceneManager.toggleGrid(gridBtn.classList.contains('active'));
            };
        }
    }

    // ============ RENDER LOOP ============
    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const dt = (now - this.clock.lastTime) / 1000;
        this.clock.lastTime = now;

        this.animator?.update(dt);
        this.sceneManager?.render();
    }
}

// Start app
console.log('[App] Initializing...');
new App();
