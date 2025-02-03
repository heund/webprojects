class EarthAnimation {
    constructor() {
        this.container = document.getElementById('earth-bg');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.clock = new THREE.Clock();
        
        this.init();
        this.createStylizedEarth();
        this.animate();
        
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        this.camera.position.z = 2;
        
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x0066ff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
    }
    
    createStylizedEarth() {
        // Create low-poly sphere
        const geometry = new THREE.IcosahedronGeometry(1, 2);
        
        // Create material with custom shader
        const earthMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                contamination: { value: 0.0 },
                pulseIntensity: { value: 0.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                uniform float contamination;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    
                    // Create wave effect
                    vec3 pos = position;
                    float wave = sin(pos.y * 5.0 + time) * 0.03;
                    wave += sin(pos.x * 4.0 + time * 0.8) * 0.03;
                    pos += normal * wave * (1.0 + contamination);
                    
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                uniform float contamination;
                uniform float pulseIntensity;
                
                void main() {
                    // Create base color gradient
                    vec3 baseColor = vec3(0.1);
                    vec3 highlightColor = vec3(0.3);
                    
                    // Add cellular pattern
                    float pattern = fract(sin(dot(vPosition.xy * 3.0, vec2(12.9898, 78.233))) * 43758.5453123);
                    pattern = smoothstep(0.3, 0.7, pattern);
                    
                    // Create animated contamination effect
                    float contaminationPattern = sin(vPosition.x * 10.0 + time) * sin(vPosition.y * 10.0 + time * 0.7);
                    contaminationPattern = abs(contaminationPattern);
                    
                    // Mix colors based on contamination and pattern
                    vec3 color = mix(baseColor, highlightColor, pattern * 0.5);
                    vec3 contaminationColor = vec3(0.4);
                    color = mix(color, contaminationColor, contamination * contaminationPattern);
                    
                    // Add gaussian blur-like effect
                    float blur = sin(vPosition.x * 5.0 + time * 0.5) * sin(vPosition.y * 5.0 + time * 0.3) * 0.1;
                    color += vec3(blur);
                    
                    // Add fresnel effect (edge glow)
                    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
                    color += vec3(0.2) * fresnel * (1.0 + contamination);
                    
                    // Add noise texture
                    float noise = fract(sin(dot(vPosition.xy * 10.0, vec2(12.9898, 78.233))) * 43758.5453123);
                    color += vec3(noise * 0.05);
                    
                    gl_FragColor = vec4(color, 0.9);
                }
            `,
            side: THREE.DoubleSide
        });
        
        this.earth = new THREE.Mesh(geometry, earthMaterial);
        this.scene.add(this.earth);
        
        // Add wireframe overlay
        const wireframeGeometry = new THREE.IcosahedronGeometry(1.001, 2);
        const wireframeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                contamination: { value: 0.0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                uniform float time;
                uniform float contamination;
                
                void main() {
                    vec3 pos = position;
                    float wave = sin(pos.y * 5.0 + time) * 0.03;
                    wave += sin(pos.x * 4.0 + time * 0.8) * 0.03;
                    pos += normal * wave * (1.0 + contamination);
                    
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                uniform float time;
                uniform float contamination;
                
                void main() {
                    float opacity = 0.1 + contamination * 0.2;
                    vec3 color = vec3(0.0, 0.8, 1.0);
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            transparent: true,
            wireframe: true
        });
        
        this.wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.scene.add(this.wireframe);
        
        // Add particle system for atmosphere
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        
        for(let i = 0; i < particleCount; i++) {
            const radius = 1.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particlesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                contamination: { value: 0.0 }
            },
            vertexShader: `
                uniform float time;
                uniform float contamination;
                
                void main() {
                    vec3 pos = position;
                    float wave = sin(pos.y * 2.0 + time) * 0.05;
                    pos += normalize(pos) * wave * (1.0 + contamination);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 2.0;
                }
            `,
            fragmentShader: `
                uniform float contamination;
                
                void main() {
                    vec3 color = vec3(0.0, 0.8, 1.0);
                    float alpha = 0.3 * (1.0 + contamination);
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    updateContamination(value) {
        if (this.earth && this.earth.material.uniforms) {
            this.earth.material.uniforms.contamination.value = value;
            this.wireframe.material.uniforms.contamination.value = value;
            this.particles.material.uniforms.contamination.value = value;
            this.earth.material.uniforms.pulseIntensity.value = value;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        if (this.earth) {
            // Rotate everything
            this.earth.rotation.y += 0.002;
            this.wireframe.rotation.y += 0.002;
            this.particles.rotation.y += 0.001;
            
            // Update time uniforms
            this.earth.material.uniforms.time.value = time;
            this.wireframe.material.uniforms.time.value = time;
            this.particles.material.uniforms.time.value = time;
            
            // Add some wobble
            this.earth.rotation.x = Math.sin(time * 0.5) * 0.1;
            this.wireframe.rotation.x = this.earth.rotation.x;
            this.particles.rotation.x = this.earth.rotation.x * 0.5;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize earth animation
const earthAnimation = new EarthAnimation();

// Export for use in other files
window.earthAnimation = earthAnimation;
