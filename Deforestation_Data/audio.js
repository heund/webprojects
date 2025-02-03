// Audio Context and Analysis setup
let audioInitialized = false;
let audioContext;
let players = {};
let filter, distortion, reverb;
let analyzer;

// Initialize audio context and effects
function initAudio() {
    audioContext = new Tone.Context();
    Tone.setContext(audioContext);
    
    // Create effects chain
    filter = new Tone.Filter(1000, "lowpass").toDestination();
    distortion = new Tone.Distortion(0.5).connect(filter);
    reverb = new Tone.Reverb(1.5).connect(distortion);
    
    // Create analyzer
    analyzer = new Tone.Analyser("waveform", 256);
    reverb.connect(analyzer);
    
    // Initialize players
    players = {
        'img-1': new Tone.Player("sounds/sound1.mp3").connect(reverb),
        'img-2': new Tone.Player("sounds/sound2.mp3").connect(reverb),
        'img-3': new Tone.Player("sounds/sound3.mp3").connect(reverb),
        'img-4': new Tone.Player("sounds/sound4.mp3").connect(reverb)
    };
    
    audioInitialized = true;
}

// Play sound
function playSound(gridId) {
    if (!audioInitialized) {
        initAudio();
    }
    
    const player = players[gridId];
    
    if (player) {
        // Stop all other players
        Object.values(players).forEach(p => {
            if (p.state === 'started') p.stop();
        });
        
        // Play the sound
        player.start();
        
        // Animate Earth with random contamination value
        if (window.earthAnimation) {
            window.earthAnimation.updateContamination(Math.random() * 0.5 + 0.2);
        }
    }
}

// Canvas setup
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// Resize handler
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Animation function
function draw() {
    requestAnimationFrame(draw);
    
    // Clear canvas
    ctx.fillStyle = 'rgba(14, 16, 15, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get audio data
    const waveformData = analyzer.getValue();
    
    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.5)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < waveformData.length; i++) {
        const x = (i / waveformData.length) * canvas.width;
        const y = ((waveformData[i] + 1) / 2) * canvas.height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

// Initialize audio and start visualization
async function initAudioAndStartVisualization() {
    if (!audioInitialized) {
        await Tone.start();
        initAudio();
        audioInitialized = true;
        draw();
    }
}

// Export functions for use in script.js
window.playSound = playSound;
window.initAudioAndStartVisualization = initAudioAndStartVisualization;
