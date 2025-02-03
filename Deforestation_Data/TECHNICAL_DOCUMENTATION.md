# Technical Documentation: Korean Forest Deforestation Data Sonification

## Project Structure

### Files and Their Purposes

1. **Frontend Interface**
   - `index.html`: Main application interface and structure
   - `styles.css`: Visual styling and animations
   
2. **JavaScript Modules**
   - `sonification.js`: Core sonification engine and data-to-sound mapping
   - `audio.js`: Audio synthesis and effects management
   - `earth.js`: 3D Earth background visualization
   - `graphs.js`: Data visualization and graphing utilities
   - `script.js`: Main application logic and UI interactions

3. **Assets**
   - `/images/`: Visual assets for the interface
   - `/sounds/`: Audio samples and presets
   - `/data/`: Deforestation and environmental data

### Core Components

1. **Sonification Engine (`sonification.js`)**
   - Class: `DeforestationSonifier`
   - Manages audio synthesis and playback using Tone.js
   - Handles data-to-sound mapping algorithms
   - Controls animation timing and synchronization

2. **Audio System (`audio.js`)**
   - Synthesizer configurations
   - Audio effects chain setup
   - Frequency mapping functions
   - Dynamic range compression

3. **Visualization System**
   - Real-time data graphs using Canvas API
   - Image opacity transitions
   - Interactive UI elements
   - 3D Earth background rendering

## Technical Implementation Details

### 1. Audio Synthesis

```javascript
// Tone.js synthesizer configuration
const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "sine"
    },
    envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
    }
});

// Frequency mapping function
const mapToFrequency = (value, min, max) => {
    return scale(value, min, max, 200, 800);
};
```

### 2. Interface Components

1. **Main Container**
   - Grid layout with three columns
   - Responsive design with flexbox
   - Backdrop blur effects

2. **Data Cards**
   - Real-time metric updates
   - Animated transitions
   - Interactive hover states

3. **Play Button**
   - Centered overlay on image grid
   - SVG icons for play/stop states
   - Animated transitions and effects

### 3. Visual Elements

1. **Image Grid**
   - 2x2 layout with gap spacing
   - Opacity transitions based on data
   - Hover effects and active states

2. **Data Visualization**
   - Canvas-based graphs
   - Real-time updates
   - Color-coded indicators

3. **Background Effects**
   - Three.js Earth visualization
   - Particle effects
   - Ambient animations

## Dependencies

1. **Tone.js** (v14.8.49)
   - Audio synthesis and effects
   - Transport control
   - Effects processing

2. **Three.js** (r128)
   - 3D background visualization
   - WebGL rendering
   - Camera and scene management

3. **GSAP** (v3.7.1)
   - Animation system
   - Smooth transitions
   - Timeline control

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance Optimizations

1. **Audio**
   - Buffer preloading
   - Dynamic sample rate
   - Memory management

2. **Visual**
   - Hardware acceleration
   - Efficient DOM updates
   - Canvas optimization

3. **Data**
   - Lazy loading
   - Batch processing
   - Efficient state management
