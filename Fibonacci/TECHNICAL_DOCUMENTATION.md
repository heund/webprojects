# Technical Documentation: Prime Harmonic Network Visualization

## Project Structure

### Core Components

1. **Main Application (`main.js`)**
   - Manages 3D visualization using Three.js and Force Graph
   - Handles node generation and graph structure
   - Implements bloom and glow effects
   - Controls user interaction and UI updates

2. **Audio Controller (`audio.js`)**
   - Manages sound synthesis using Tone.js
   - Implements prime number-based frequency calculations
   - Handles audio propagation through the network
   - Controls volume and audio state

3. **UI Layer (`index.html`, `styles.css`)**
   - Minimal, data-driven interface
   - Real-time data visualization
   - Interactive controls
   - Responsive layout

## Technical Implementation

### Graph Generation

```javascript
generateGraphData() {
    // Creates nodes based on prime number relationships
    // Each node's level determines its harmonic properties
}
```

- Uses force-directed layout
- Node positions determined by harmonic relationships
- Links represent mathematical relationships between nodes

### Audio Synthesis

```javascript
calculateFrequency(primeIndex) {
    const pn = this.primes[primeIndex];
    const p1 = this.primes[0];
    return this.baseFrequency * (pn / p1);
}
```

- Base frequency: 440Hz (A4)
- Frequencies calculated using prime number ratios
- Octave wrapping for audible range (20Hz - 20kHz)

### Visual Effects

1. **Node Glow**
   - MeshBasicMaterial for core
   - Sprite-based halo effect
   - Bloom post-processing
   - Dynamic intensity based on activation

2. **Bloom Effect**
   ```javascript
   setupPostProcessing(renderer) {
       // Implements UnrealBloomPass for glow
       // Configures bloom parameters
   }
   ```

### Data Visualization

1. **Prime Sequence Display**
   - Shows first 10 prime numbers
   - Interactive click-to-play functionality
   - Real-time highlighting of active prime
   - Visual feedback on hover and selection
   ```javascript
   // Prime number click handler
   element.addEventListener('click', (e) => {
       const index = parseInt(e.target.dataset.index);
       const prime = parseInt(e.target.dataset.prime);
       const frequency = this.audioController.calculateFrequency(index);
       // Trigger audio and update UI
   });
   ```

2. **Circular Indicator**
   - SVG-based progress ring
   - Shows position in prime sequence
   - Updates on prime selection
   - Animated transitions

3. **Harmonic Ratios**
   - Displays mathematical relationships
   - Shows ratios between primes
   - Updates with node activation

## Event Handling

### Node Interaction
```javascript
onNodeClick(node) {
    // Triggers audio
    // Updates visuals
    // Propagates through network
}
```

### Sound Propagation
```javascript
startPropagation(startNode, nodes, links, onNodePlayed) {
    // Implements breadth-first traversal
    // Calculates delays based on primes
    // Triggers audio and visual feedback
}
```

## Interactive Features

### Prime Number Selection
```javascript
updateDataOverlay(node) {
    // Generate interactive prime number elements
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
}
```

- Direct interaction with prime numbers
- Visual feedback on hover and selection
- Real-time frequency playback
- Synchronized visual updates

## Dependencies

1. **Three.js**
   - 3D rendering
   - Post-processing effects
   - Camera and controls

2. **Tone.js**
   - Audio synthesis
   - Envelope control
   - Effects processing

3. **D3.js**
   - Force simulation
   - Graph layout
   - Node positioning

4. **3D-Force-Graph**
   - Graph visualization
   - Physics simulation
   - Interactive features

## Performance Considerations

1. **Audio**
   - Efficient frequency calculation
   - Audio buffer management
   - Controlled polyphony

2. **Visual**
   - Optimized bloom effect
   - Efficient sprite rendering
   - Managed update cycles

3. **Data**
   - Cached prime calculations
   - Optimized graph traversal
   - Efficient state updates

## Browser Support

- Modern browsers with WebGL support
- Web Audio API compatibility
- ES6+ JavaScript features
- CSS Grid and Flexbox
