/**
 * Scene Manager - Three.js scene setup and management
 * Fixed version with better canvas handling
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.grid = null;
        this.currentModel = null;
        this.lights = [];

        console.log('SceneManager: Initializing with canvas', canvas);
        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);

        // Get container dimensions
        const container = this.canvas.parentElement;
        let width = container ? container.clientWidth : window.innerWidth;
        let height = container ? container.clientHeight : window.innerHeight;

        // Fallback if dimensions are 0
        if (width === 0) width = 800;
        if (height === 0) height = 600;

        console.log('SceneManager: Container dimensions', width, 'x', height);

        // Camera
        const aspect = width / height;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.set(3, 2, 5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: false
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        console.log('SceneManager: Renderer created');

        // Controls
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;
        this.controls.target.set(0, 0, 0);

        // Lights
        this.setupLights();

        // Grid
        this.setupGrid();

        // Floor
        this.setupFloor();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        // Initial resize after a short delay to ensure DOM is ready
        setTimeout(() => this.onResize(), 100);

        console.log('SceneManager: Setup complete');
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        this.scene.add(mainLight);
        this.lights.push(mainLight);

        // Fill light (purple tint)
        const fillLight = new THREE.DirectionalLight(0x6366f1, 0.4);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xa855f7, 0.3);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
        this.lights.push(rimLight);

        // Point light for extra ambiance
        const pointLight = new THREE.PointLight(0x8b5cf6, 0.5, 20);
        pointLight.position.set(0, 3, 3);
        this.scene.add(pointLight);
        this.lights.push(pointLight);
    }

    setupGrid() {
        const gridSize = 20;
        const gridDivisions = 20;

        this.grid = new THREE.GridHelper(gridSize, gridDivisions, 0x6366f1, 0x1a1a25);
        this.grid.material.opacity = 0.4;
        this.grid.material.transparent = true;
        this.scene.add(this.grid);
    }

    setupFloor() {
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    addModel(model) {
        // Remove existing model
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.disposeModel(this.currentModel);
        }

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Normalize size
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 2 / maxDim : 1;
        model.scale.setScalar(scale);

        // Center model
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += (size.y * scale) / 2;

        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene.add(model);
        this.currentModel = model;

        // Reset camera to view model
        this.resetCamera();

        console.log('SceneManager: Model added');
        return model;
    }

    removeModel() {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.disposeModel(this.currentModel);
            this.currentModel = null;
            console.log('SceneManager: Model removed');
        }
    }

    disposeModel(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }

    createPrimitive(type) {
        let geometry;

        switch (type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.5, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.4, 0.15, 16, 100);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 32);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(0.5, 1, 32);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        // Create gradient-like material
        const material = new THREE.MeshStandardMaterial({
            color: 0x6366f1,
            metalness: 0.4,
            roughness: 0.3,
            emissive: 0x1a1a2e,
            emissiveIntensity: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        console.log('SceneManager: Primitive created -', type);
        return this.addModel(mesh);
    }

    resetCamera() {
        this.camera.position.set(3, 2, 5);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    toggleGrid(visible) {
        if (this.grid) {
            this.grid.visible = visible;
        }
    }

    setBackground(color) {
        this.scene.background = new THREE.Color(color);
    }

    setLightIntensity(intensity) {
        this.lights.forEach((light, index) => {
            if (index === 0) {
                light.intensity = 0.5 * intensity;
            } else if (index === 1) {
                light.intensity = 1.2 * intensity;
            } else {
                light.intensity = 0.4 * intensity;
            }
        });
    }

    onResize() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    getCanvas() {
        return this.renderer.domElement;
    }
}
