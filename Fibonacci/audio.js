class AudioController {
    constructor() {
        this.isPlaying = false;
        this.baseFrequency = 440; // A4 as base frequency
        this.maxFrequency = 20000; // Maximum audible frequency
        this.minFrequency = 20;    // Minimum audible frequency
        this.primes = this.generatePrimes(50); // Generate first 50 prime numbers
        
        // Initialize Tone.js
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.02,
                decay: 0.3,
                sustain: 0.2,
                release: 1
            }
        }).toDestination();

        // Add effects with lower wet values
        this.reverb = new Tone.Reverb({
            decay: 4,
            wet: 0.1  // Reduced from 0.2
        }).toDestination();

        this.delay = new Tone.FeedbackDelay({
            delayTime: 0.3,
            feedback: 0.2,  // Reduced from 0.3
            wet: 0.1       // Reduced from 0.2
        }).toDestination();

        // Connect synth to effects
        this.synth.connect(this.reverb);
        this.synth.connect(this.delay);

        // Set initial volume much lower
        this.synth.volume.value = -24; // Reduced from -12
        
        // Set master volume lower
        Tone.Destination.volume.value = -12;
    }

    // Generate prime numbers using Sieve of Eratosthenes
    generatePrimes(count) {
        const primes = [];
        let num = 2;
        
        while (primes.length < count) {
            if (this.isPrime(num)) {
                primes.push(num);
            }
            num++;
        }
        
        return primes;
    }

    isPrime(num) {
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
        }
        return num > 1;
    }

    // Calculate frequency using prime number formula
    calculateFrequency(primeIndex) {
        const pn = this.primes[primeIndex];
        const p1 = this.primes[0]; // First prime (2)
        let frequency = this.baseFrequency * (pn / p1);
        
        // Apply octave wrapping if needed
        return this.wrapFrequency(frequency);
    }

    // Implement octave wrapping
    wrapFrequency(frequency) {
        while (frequency > this.maxFrequency) {
            frequency *= 0.5; // Drop an octave
        }
        while (frequency < this.minFrequency) {
            frequency *= 2; // Raise an octave
        }
        return frequency;
    }

    // Start audio context and enable sound
    async start() {
        await Tone.start();
        this.isPlaying = true;
    }

    // Stop all sound
    stop() {
        this.synth.releaseAll();
        this.isPlaying = false;
    }

    setVolume(value) {
        // Convert 0-100 range to decibels (-60 to 0)
        const db = Tone.gainToDb(value / 100);
        this.synth.volume.value = db;
    }

    // Play a note based on node level using prime harmonics
    playNode(node) {
        if (!this.isPlaying) return;
        
        // Use node level to select prime index
        const primeIndex = node.level % this.primes.length;
        const frequency = this.calculateFrequency(primeIndex);
        
        // Calculate duration based on level (deeper levels = shorter duration)
        const duration = Math.max(0.1, 1 - (node.level * 0.1));
        
        // Play the note
        this.synth.triggerAttackRelease(frequency, duration);
    }

    // Handle sound propagation through the network
    startPropagation(startNode, nodes, links, onNodePlayed) {
        if (!this.isPlaying) return;

        const visited = new Set();
        const queue = [{
            node: startNode,
            delay: 0
        }];

        while (queue.length > 0) {
            const { node, delay } = queue.shift();
            const nodeId = node.id;

            if (visited.has(nodeId)) continue;
            visited.add(nodeId);

            // Schedule note to play after delay
            setTimeout(() => {
                this.playNode(node);
                if (onNodePlayed) onNodePlayed(nodeId);
            }, delay * 1000);

            // Find connected nodes
            const connectedLinks = links.filter(link => 
                link.source.id === nodeId || link.target.id === nodeId
            );

            // Add connected nodes to queue
            for (const link of connectedLinks) {
                const nextNode = link.source.id === nodeId ? link.target : link.source;
                if (!visited.has(nextNode.id)) {
                    // Calculate delay based on prime numbers
                    const nextDelay = delay + (this.primes[node.level % this.primes.length] / 20);
                    queue.push({
                        node: nextNode,
                        delay: nextDelay
                    });
                }
            }
        }
    }
}

export default AudioController;
