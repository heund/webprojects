import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import AudioController from './audio.js';

class FibonacciVisualizer {
    constructor() {
        this.nodes = [];
        this.links = [];
        this.forceStrength = 100;
        this.bloomStrength = 2.5;
        this.audioController = new AudioController();
        this.init();
    }

    init() {
        this.initGraph();
        this.initControls();
    }

    generateGraphData() {
        const groups = ['blue', 'azure', 'indigo', 'violet', 'purple'];
        const numLevels = 4;  // Increased to 4 levels
        const branchingFactor = 3;  // Back to 3 children per node
        const goldenRatio = 1.618033988749895;
        const baseRadius = 50;

        // Clear existing arrays
        this.nodes = [];
        this.links = [];

        // Create root node
        this.nodes.push({
            id: '0',
            group: groups[0],
            level: 0,
            x: 0,
            y: 0,
            z: 0,
            size: 6
        });

        let nodeId = 1;
        let currentLevel = 1;

        // Generate nodes level by level
        while (currentLevel <= numLevels) {
            const parentStartId = Math.pow(branchingFactor, currentLevel - 1) - 1;
            const parentsInLevel = Math.pow(branchingFactor, currentLevel - 1);
            
            for (let parentIndex = 0; parentIndex < parentsInLevel; parentIndex++) {
                const parentId = parentStartId + parentIndex;
                const parentNode = this.nodes[parentId];

                // Create children for each parent
                for (let child = 0; child < branchingFactor; child++) {
                    const angle = (2 * Math.PI * child) / branchingFactor + (currentLevel * Math.PI / 4);
                    const radius = baseRadius * Math.pow(goldenRatio, currentLevel - 1);
                    
                    // Calculate spiral position using golden ratio
                    const spiralAngle = angle + (currentLevel * goldenRatio);
                    const x = Math.cos(spiralAngle) * radius;
                    const y = Math.sin(spiralAngle) * radius;
                    const z = radius * Math.sin(spiralAngle * goldenRatio);

                    // Skip some nodes randomly at deeper levels to create interesting gaps
                    if (currentLevel >= 3 && Math.random() < 0.3) {
                        continue;
                    }

                    // Add node with size based on level
                    this.nodes.push({
                        id: nodeId.toString(),
                        group: groups[currentLevel % groups.length],
                        level: currentLevel,
                        x: x,
                        y: y,
                        z: z,
                        size: Math.max(3, 7 - currentLevel)
                    });

                    // Add link to parent
                    this.links.push({
                        source: parentId.toString(),
                        target: nodeId.toString(),
                        value: 1.5 / currentLevel
                    });

                    nodeId++;
                }
            }
            currentLevel++;
        }

        // Add cross-connections between nodes at the same level
        this.nodes.forEach((node, i) => {
            if (node.level > 0) {
                const sameLevel = this.nodes.filter(n => n.level === node.level && n.id !== node.id);
                // More connections for middle levels, fewer for outer levels
                const connectionFactor = node.level === 2 ? 2 : 1;
                const numConnections = Math.floor(Math.random() * connectionFactor);
                
                for (let j = 0; j < numConnections; j++) {
                    const target = sameLevel[Math.floor(Math.random() * sameLevel.length)];
                    if (target && Math.random() < 0.7) { // 70% chance to create connection
                        this.links.push({
                            source: node.id,
                            target: target.id,
                            value: 0.75 / node.level
                        });
                    }
                }
            }
        });

        // Add some diagonal connections between levels
        this.nodes.forEach((node, i) => {
            if (node.level < numLevels - 1) {
                const nextLevel = this.nodes.filter(n => n.level === node.level + 1);
                if (Math.random() < 0.3) { // 30% chance for diagonal connections
                    const target = nextLevel[Math.floor(Math.random() * nextLevel.length)];
                    if (target) {
                        this.links.push({
                            source: node.id,
                            target: target.id,
                            value: 0.5
                        });
                    }
                }
            }
        });
    }

    initGraph() {
        const elem = document.getElementById('container');
        if (!elem) return;

        this.generateGraphData();

        // Create base material for nodes
        const nodeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });

        this.graph = ForceGraph3D()(elem)
            .backgroundColor('#000000')
            .nodeThreeObject(node => {
                // Create sphere mesh for each node
                const mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(node.size || 4),
                    nodeMaterial.clone()
                );
                
                // Add a glow effect using sprite
                const spriteMaterial = new THREE.SpriteMaterial({
                    map: this.generateGlowTexture(),
                    color: 0x00ffff,
                    transparent: true,
                    opacity: 0.4,
                    blending: THREE.AdditiveBlending
                });
                const sprite = new THREE.Sprite(spriteMaterial);
                const spriteScale = (node.size || 4) * 2.5;
                sprite.scale.set(spriteScale, spriteScale, spriteScale);
                mesh.add(sprite);
                
                return mesh;
            })
            .linkWidth(link => link.value || 0.5)
            .linkOpacity(0.2)
            .linkColor(() => '#00ffff')
            .onNodeClick(node => {
                if (this.audioController.isPlaying) {
                    this.audioController.startPropagation(
                        node,
                        this.nodes,
                        this.links,
                        (nodeId) => {
                            const playedNode = this.nodes.find(n => n.id === nodeId);
                            if (playedNode && playedNode.__threeObj) {
                                this.createBloomEffect(playedNode);
                            }
                        }
                    );
                }
            })
            .enableNodeDrag(true)
            .enableNavigationControls(true)
            .showNavInfo(true)
            // Camera settings
            .cameraPosition({ x: 200, y: 200, z: 200 })
            // Simplified 3D force layout
            .d3Force('link', d3.forceLink()
                .id(d => d.id)
                .distance(80)  // Increased for better spacing
            )
            .d3Force('charge', d3.forceManyBody()
                .strength(-70)  // Slightly stronger repulsion
                .distanceMax(300)
            )
            .d3Force('center', d3.forceCenter())
            .numDimensions(3)
            // Increase default distance
            .nodeRelSize(6)  // Makes nodes slightly bigger relative to space
            .graphData({
                nodes: this.nodes,
                links: this.links
            });

        // Add ambient and directional lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(100, 100, 100);
        this.graph.scene().add(ambientLight);
        this.graph.scene().add(directionalLight);

        // Configure controls for better 3D navigation
        const controls = this.graph.controls();
        if (controls) {
            controls.enableDamping = true;
            controls.dampingFactor = 0.2;
            controls.rotateSpeed = 0.5;
            controls.zoomSpeed = 1.0;
            controls.minDistance = 50;   // Allow closer zoom
            controls.maxDistance = 1000; // Allow much further zoom out
            controls.enableZoom = true;  // Ensure zoom is enabled
        }

        // Update camera settings
        const camera = this.graph.camera();
        if (camera) {
            camera.near = 1;     // Closer near plane
            camera.far = 2000;   // Further far plane
            camera.fov = 60;     // Wider field of view
            camera.updateProjectionMatrix();
        }

        // Get the renderer from the graph
        const renderer = this.graph.renderer();
        
        // Configure renderer
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 1);

        // Setup post-processing
        this.setupPostProcessing(renderer);

        // Handle window resizing
        window.addEventListener('resize', () => {
            if (this.graph) {
                this.graph.width(window.innerWidth);
                this.graph.height(window.innerHeight);
            }
        });
    }

    generateGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');

        // Create radial gradient for glow
        const gradient = context.createRadialGradient(
            32, 32, 0,    // inner circle
            32, 32, 32    // outer circle
        );
        gradient.addColorStop(0, 'rgba(0,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(0,255,255,0.3)');
        gradient.addColorStop(1, 'rgba(0,255,255,0)');

        // Fill with gradient
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    createBloomEffect(node) {
        if (!node.__threeObj) return;

        // Store original scale
        const originalScale = node.__threeObj.scale.x;

        // Get the sprite (glow) from the node
        const sprite = node.__threeObj.children[0];
        const originalSpriteScale = sprite.scale.x;

        // Temporarily increase bloom strength
        const originalBloomStrength = this.bloomPass.strength;
        this.bloomPass.strength = 3.0;

        // Create point light for additional glow
        const pointLight = new THREE.PointLight(0x00ffff, 2, 50);
        pointLight.position.copy(node.__threeObj.position);
        this.graph.scene().add(pointLight);

        // Animate the glow
        const startTime = Date.now();
        const duration = 600;

        const animateGlow = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                // Pulse the node and sprite scale
                const pulseScale = 1 + Math.sin(progress * Math.PI) * 0.5;
                node.__threeObj.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Make sprite glow bigger
                const spriteScale = originalSpriteScale * (1.5 + Math.sin(progress * Math.PI) * 0.5);
                sprite.scale.set(spriteScale, spriteScale, spriteScale);

                // Pulse the light intensity
                pointLight.intensity = 2 * (1 - progress);

                requestAnimationFrame(animateGlow);
            } else {
                // Reset everything
                node.__threeObj.scale.set(originalScale, originalScale, originalScale);
                sprite.scale.set(originalSpriteScale, originalSpriteScale, originalSpriteScale);
                this.bloomPass.strength = originalBloomStrength;
                this.graph.scene().remove(pointLight);
                pointLight.dispose();
            }
        };

        animateGlow();

        // Update data overlay
        this.updateDataOverlay(node);
    }

    updateDataOverlay(node) {
        // Update prime sequence
        const primeIndex = node.level % this.audioController.primes.length;
        const currentPrime = this.audioController.primes[primeIndex];
        const primesDiv = document.getElementById('current-primes');
        primesDiv.innerHTML = this.audioController.primes
            .slice(0, 10)
            .map((p, i) => `
                <span class="prime-number ${i === primeIndex ? 'active' : ''}" 
                      data-index="${i}" 
                      data-prime="${p}"
                      style="cursor: pointer">
                    ${p}
                </span>
            `)
            .join('');

        // Add click handlers to prime numbers
        const primeElements = primesDiv.getElementsByClassName('prime-number');
        Array.from(primeElements).forEach(element => {
            element.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const prime = parseInt(e.target.dataset.prime);
                const frequency = this.audioController.calculateFrequency(index);
                
                // Play the tone
                if (this.audioController.isPlaying) {
                    this.audioController.synth.triggerAttackRelease(frequency, 0.5);
                    
                    // Update visual feedback
                    Array.from(primeElements).forEach(el => el.classList.remove('active'));
                    element.classList.add('active');
                    
                    // Update frequency display
                    const frequencyDisplay = document.getElementById('frequency-display');
                    frequencyDisplay.innerHTML = `
                        <div>f${index} = ${Math.round(frequency)} Hz</div>
                        <div style="opacity: 0.5">p${index} = ${prime}</div>
                    `;

                    // Update circular indicator
                    const circle = document.querySelector('.progress-ring-circle');
                    const radius = circle.r.baseVal.value;
                    const circumference = radius * 2 * Math.PI;
                    const offset = circumference - (index / 10) * circumference;
                    circle.style.strokeDasharray = `${circumference} ${circumference}`;
                    circle.style.strokeDashoffset = offset;
                }
            });
        });

        // Update frequency display
        const frequency = this.audioController.calculateFrequency(primeIndex);
        const frequencyDisplay = document.getElementById('frequency-display');
        frequencyDisplay.innerHTML = `
            <div>f${primeIndex} = ${Math.round(frequency)} Hz</div>
            <div style="opacity: 0.5">p${primeIndex} = ${currentPrime}</div>
        `;

        // Update circular indicator
        const circle = document.querySelector('.progress-ring-circle');
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (primeIndex / 10) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;

        // Update harmonic ratios
        const ratiosDiv = document.getElementById('current-ratios');
        const ratios = [];
        for (let i = Math.max(0, primeIndex - 2); i <= Math.min(primeIndex + 2, this.audioController.primes.length - 1); i++) {
            const ratio = this.audioController.primes[i] / this.audioController.primes[0];
            ratios.push(`
                <div class="harmonic-ratio ${i === primeIndex ? 'active-node' : ''}">
                    <span>p${i}/p₁</span>
                    <span>${ratio.toFixed(3)}</span>
                </div>
            `);
        }
        ratiosDiv.innerHTML = ratios.join('');

        // Update node details
        const nodeDetails = document.getElementById('node-details');
        nodeDetails.innerHTML = `
            <div class="node-detail">
                <span>LEVEL</span>
                <span>${node.level}</span>
            </div>
            <div class="node-detail">
                <span>CONNECTIONS</span>
                <span>${this.links.filter(l => l.source.id === node.id || l.target.id === node.id).length}</span>
            </div>
            <div class="node-detail">
                <span>PRIME INDEX</span>
                <span>${primeIndex}</span>
            </div>
        `;

        // Update total nodes
        document.getElementById('total-nodes').textContent = this.nodes.length;
    }

    setupPostProcessing(renderer) {
        const scene = this.graph.scene();
        const camera = this.graph.camera();

        // Create composer
        this.composer = new EffectComposer(renderer);

        // Add render pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // Add bloom pass with settings similar to the example
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,    // Strength
            1.0,    // Radius
            0.1     // Threshold (lower for more glow)
        );
        
        this.composer.addPass(this.bloomPass);

        // Override render function to include post-processing
        const originalRenderFunc = this.graph._animationCycle;
        this.graph._animationCycle = () => {
            originalRenderFunc.call(this.graph);
            if (this.composer) {
                this.composer.render();
            }
        };
    }

    getNodeColor(group) {
        const colors = {
            blue: '#00ffff',     // Cyan
            azure: '#007fff',    // Azure blue
            indigo: '#4b0082',   // Deep indigo
            violet: '#9400d3',   // Dark violet
            purple: '#8a2be2'    // Blue violet
        };
        return colors[group] || '#00ffff';
    }

    updateNodePositions() {
        if (!this.nodes) return;
        
        const time = Date.now() * 0.001;
        this.nodes.forEach(node => {
            if (!node.dragging) {
                const wobble = 0.02 / (node.level + 1);  // Less movement for deeper nodes
                const id = parseInt(node.id);
                const levelFactor = Math.pow(0.8, node.level);  // Reduced movement for deeper levels
                
                node.x += Math.sin(time + id) * wobble * levelFactor;
                node.y += Math.cos(time + id) * wobble * levelFactor;
                node.z += Math.sin(time * 0.5 + id) * wobble * levelFactor;
            }
        });
    }

    reset() {
        this.generateGraphData();
        this.graph.graphData({ nodes: this.nodes, links: this.links });
    }

    initControls() {
        const toggleAudio = document.getElementById('toggleAudio');
        const volume = document.getElementById('volume');
        const reset = document.getElementById('reset');

        toggleAudio.addEventListener('click', () => {
            if (!this.audioController.isPlaying) {
                this.audioController.start().then(() => {
                    toggleAudio.textContent = 'STOP AUDIO';
                    toggleAudio.classList.add('active');
                });
            } else {
                this.audioController.stop();
                toggleAudio.textContent = 'START AUDIO';
                toggleAudio.classList.remove('active');
            }
        });

        volume.addEventListener('input', (e) => {
            this.audioController.setVolume(e.target.value);
        });

        reset.addEventListener('click', () => {
            this.resetGraph();
        });
    }

    createRippleEffect(node) {
        if (!node.__threeObj) return;

        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5
        });

        const ripple = new THREE.Mesh(geometry, material);
        ripple.position.copy(node.__threeObj.position);
        this.graph.scene().add(ripple);

        // Animate ripple
        const startScale = 1;
        const endScale = 4;
        const duration = 500; // ms
        const startTime = Date.now();

        const animateRipple = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const scale = startScale + (endScale - startScale) * progress;
                ripple.scale.set(scale, scale, scale);
                material.opacity = 0.5 * (1 - progress);
                
                requestAnimationFrame(animateRipple);
            } else {
                this.graph.scene().remove(ripple);
                geometry.dispose();
                material.dispose();
            }
        };

        animateRipple();
    }

    pulseNode(nodeObj, duration) {
        const startTime = Date.now();
        const startScale = 1.5;
        const pulseScale = 2;

        const animatePulse = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1 && nodeObj) {
                // Pulse the scale
                const scale = startScale + Math.sin(progress * Math.PI) * (pulseScale - startScale);
                nodeObj.scale.set(scale, scale, scale);

                requestAnimationFrame(animatePulse);
            }
        };

        animatePulse();
    }

    resetGraph() {
        this.generateGraphData();
        this.graph.graphData({ nodes: this.nodes, links: this.links });
    }
}

// Initialize the application
window.addEventListener('load', () => {
    window.app = new FibonacciVisualizer();
});
