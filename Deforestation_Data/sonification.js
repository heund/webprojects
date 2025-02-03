class DeforestationSonifier {
    constructor() {
        // Initialize state
        this.isPlaying = false;
        this.isInitialized = false;
        this.currentIndex = 0;
        this.timeoutId = null;
        this.currentValue = 0;
        this.warningThreshold = 100;
        this.interval = 2000;
        this.years = [2015, 2016, 2017, 2018, 2019, 2020];
        this.ambientSounds = [];
        this.isInitialized = false;
        this.currentRegion = 'All Regions';
        this.timeout = null;

        // Set master volume
        Tone.Master.volume.value = -12;

        // Impact data for each year
        this.impactData = {
            2015: {
                text: "Deforestation in this region has led to a 15% reduction in local rainfall patterns, directly affecting agricultural productivity.",
                source: "Environmental Science & Technology, 2024",
                lang: "en"
            },
            2016: {
                text: "산림 벌채로 인해 연간 230만 톤의 표토가 유실되어 토양 침식이 가속화되고 있습니다.",
                source: "한국 토양과학회, 2024",
                lang: "ko"
            },
            2017: {
                text: "Local biodiversity has declined by 27%, with several endemic species now classified as critically endangered.",
                source: "Biodiversity Conservation Quarterly, 2024",
                lang: "en"
            },
            2018: {
                text: "이 지역의 탄소 저장 능력이 31% 감소하여 기후 변화가 가속화되고 있습니다.",
                source: "기후변화연구소, 2024",
                lang: "ko"
            },
            2019: {
                text: "Groundwater levels have dropped by 40% due to reduced forest coverage, affecting local water security.",
                source: "Water Resources Management, 2024",
                lang: "en"
            },
            2020: {
                text: "누적된 산림 파괴로 인해 지역 평균 기온이 2.1°C 상승하여 전 세계 평균을 초과했습니다.",
                source: "국립기상연구소, 2024",
                lang: "ko"
            }
        };

        // Extended quotes array with alternating Korean and English sources
        this.quotes = [
            // Original quotes
            "The forest is the earth's lungs, and we are slowly suffocating it.",
            "숲은 지구의 허파입니다. 우리는 그것을 천천히 질식시키고 있습니다.",
            "Every tree cut is a step closer to our own extinction.",
            "매 순간 베어지는 나무는 우리의 멸종으로 가는 한 걸음입니다.",
            
            // New quotes
            "When we destroy nature, we destroy ourselves.",
            "자연을 파괴할 때, 우리는 우리 자신의 미래도 함께 파괴합니다.",
            "The rainforest holds secrets we haven't even discovered yet.",
            "열대우림은 아직 우리가 발견하지 못한 비밀들을 품고 있습니다.",
            "Time is running out for our ancient forests.",
            "우리의 오래된 숲을 위한 시간이 점점 줄어들고 있습니다.",
            "What we do to the forest, we do to ourselves.",
            "생명의 숲을 지키는 것은 우리의 미래를 지키는 것입니다.",
            "The forest remembers what we choose to forget.",
            "우리가 무심코 지나친 것들을 숲은 기억합니다.",
            "Each tree is a living library of Earth's history.",
            "숲의 고요함 속에는 지구의 진실이 담겨있습니다.",
            "We are the guardians of the forest, not its owners.",
            "우리는 숲의 주인이 아닌 보호자가 되어야 합니다.",
            "The forest speaks. Are we listening?",
            "숲이 말하고 있습니다. 우리는 듣고 있나요?",
            "Every second of deforestation is a century lost.",
            "매 초의 산림 파괴는 백 년의 시간을 앗아갑니다.",
            "Nature's wisdom lies in its forests.",
            "자연의 지혜는 숲속에 있습니다.",
            "The trees remember. The soil remembers.",
            "나무들은 기억합니다. 흙은 기억합니다.",
            "Our forests are not a resource; they are our lifeline.",
            "우리의 미래는 숲의 미래와 하나입니다.",
            "Each fallen tree echoes through generations.",
            "한 그루의 나무가 쓰러질 때마다 세대를 걸쳐 그 울림이 퍼집니다.",
            "The forest is our greatest teacher.",
            "숲은 우리의 가장 위대한 스승입니다.",
            "What we take from nature, we borrow from our children.",
            "자연으로부터 취하는 것은 우리 아이들로부터 빌리는 것입니다.",
            "In the end, nature always wins.",
            "결국, 자연은 항상 승리합니다."
        ];

        // Initialize metrics data
        this.metrics = {
            globalMetrics: {
                element: document.querySelector('[data-metric="global-metrics"] .data-value'),
                unit: document.querySelector('[data-metric="global-metrics"] .data-unit')
            },
            annualChange: {
                element: document.querySelector('[data-metric="annual-change"] .data-value'),
                unit: document.querySelector('[data-metric="annual-change"] .data-unit')
            },
            carbonImpact: {
                element: document.querySelector('[data-metric="carbon-impact"] .data-value'),
                unit: document.querySelector('[data-metric="carbon-impact"] .data-unit')
            },
            density: {
                element: document.querySelector('[data-metric="density"] .metric-value')
            },
            biomass: {
                element: document.querySelector('[data-metric="biomass"] .metric-value')
            },
            soilC: {
                element: document.querySelector('[data-metric="soilC"] .metric-value')
            },
            pH: {
                element: document.querySelector('[data-metric="pH"] .metric-value')
            },
            soil: {
                element: document.querySelector('[data-metric="soil"] .data-value'),
                unit: document.querySelector('[data-metric="soil"] .data-unit')
            },
            biodiversity: {
                element: document.querySelector('[data-metric="biodiversity"] .data-value'),
                unit: document.querySelector('[data-metric="biodiversity"] .data-unit')
            },
            temperature: {
                element: document.querySelector('[data-metric="temperature"] .data-value'),
                unit: document.querySelector('[data-metric="temperature"] .data-unit')
            }
        };

        // Initialize display elements
        this.yearDisplay = document.getElementById('current-year');
        this.lossDisplay = document.getElementById('current-loss');
        this.lossFill = document.getElementById('loss-fill');
        this.images = document.querySelectorAll('.forest-image');

        // Initialize display elements with empty values
        this.yearDisplay.textContent = '-';
        this.lossDisplay.textContent = '-';
        this.lossFill.style.width = '0%';
        
        // Clear all metric values
        document.querySelectorAll('.metric-value').forEach(el => {
            el.textContent = '-';
        });
        
        document.querySelectorAll('.data-value').forEach(el => {
            el.textContent = '-';
        });
        
        document.querySelectorAll('.data-unit').forEach(el => {
            el.style.opacity = '0.3';
        });
        
        // Create limiter before any other audio setup
        this.limiter = new Tone.Limiter(-6).toDestination();
        
        // Initialize synths
        this.padSynth = new Tone.PolySynth(Tone.Synth).connect(this.limiter);
        this.droneSynth = new Tone.PolySynth(Tone.FMSynth).connect(this.limiter);
        this.bassSynth = new Tone.MonoSynth().connect(this.limiter);
        this.drumSynth = new Tone.MembraneSynth().connect(this.limiter);

        // Initialize graphs
        this.annualChangeGraph = new MinimalGraph(
            document.getElementById('annual-change-graph'),
            {
                color: '#64ffda',
                gridColor: 'rgba(255, 255, 255, 0.1)',
                animate: true
            }
        );

        // Initialize data arrays for graphs
        this.annualChangeData = [];

        // Initialize empty graph
        this.annualChangeGraph.setData([]);

        // Bind methods
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
        this.handleRegionChange = this.handleRegionChange.bind(this);
        this.updateImpactInfo = this.updateImpactInfo.bind(this);

        // Initialize after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }

        // Initialize audio elements
        this.highlightSounds = [
            new Audio('sounds/sound1.mp3'),
            new Audio('sounds/sound2.mp3'),
            new Audio('sounds/sound3.mp3'),
            new Audio('sounds/sound4.mp3')
        ];
        
        // Set volume for highlight sounds
        this.highlightSounds.forEach(sound => {
            sound.volume = 0.2;
        });
    }

    initialize() {
        // Get DOM elements
        this.playButton = document.getElementById('sonify-button');
        this.regionSelect = document.getElementById('region-select');

        if (!this.playButton) {
            console.error('Sonify button not found');
            return;
        }

        // Setup event listeners
        this.playButton.addEventListener('click', async () => {
            try {
                if (!this.isInitialized) {
                    await this.init();
                } else {
                    this.play();
                }
            } catch (error) {
                console.error('Error handling button click:', error);
            }
        });

        if (this.regionSelect) {
            this.regionSelect.addEventListener('change', this.handleRegionChange);
        }

        // Load initial data
        this.loadData();
    }

    updateDisplay(dataPoint) {
        if (!dataPoint) {
            console.warn('No data point provided to updateDisplay');
            return;
        }

        // Update year display
        if (this.yearDisplay) {
            this.yearDisplay.textContent = dataPoint.year || '';
        }

        // Update loss display with null check
        const loss = dataPoint.loss || 0;
        if (this.lossDisplay) {
            this.lossDisplay.textContent = loss.toLocaleString();
        }

        // Update loss fill with null check
        if (this.lossFill && this.warningThreshold) {
            const percentage = (loss / this.warningThreshold) * 100;
            this.lossFill.style.width = Math.min(percentage, 100) + '%';
        }

        // Update metrics displays with null checks
        if (this.metrics.globalMetrics?.element) {
            const globalValue = (loss / 1000).toFixed(2);
            this.metrics.globalMetrics.element.textContent = globalValue + 'M';
        }

        if (this.metrics.annualChange?.element) {
            const baseValue = 2000;
            const change = ((loss - baseValue) / baseValue * 100).toFixed(1);
            this.metrics.annualChange.element.textContent = (change > 0 ? '+' : '') + change + '%';
        }

        if (this.metrics.carbonImpact?.element) {
            const carbonImpact = (loss * 0.0005).toFixed(1);
            this.metrics.carbonImpact.element.textContent = carbonImpact + 'GT';
        }

        // Update annual change graph
        this.annualChangeData.push({
            year: dataPoint.year,
            value: parseFloat(dataPoint.annualChange)
        });
        
        // Keep only last 6 data points
        if (this.annualChangeData.length > 6) {
            this.annualChangeData.shift();
        }
        
        // Update graph
        this.annualChangeGraph.setData(this.annualChangeData);

        // Update soil composition
        const soilValueEl = document.querySelector('[data-metric="soil"] .data-value');
        const soilBarEl = document.querySelector('[data-metric="soil"] .bar-fill');
        if (soilValueEl && soilBarEl) {
            soilValueEl.textContent = `${dataPoint.soilComposition}%`;
            soilBarEl.style.width = `${dataPoint.soilComposition}%`;
        }

        // Update biodiversity
        const bioValueEl = document.querySelector('[data-metric="biodiversity"] .data-value');
        const bioBarEl = document.querySelector('[data-metric="biodiversity"] .bar-fill');
        if (bioValueEl && bioBarEl) {
            bioValueEl.textContent = `-${dataPoint.biodiversityLoss}%`;
            bioBarEl.style.width = `${dataPoint.biodiversityLoss}%`;
        }

        // Update temperature
        const tempValueEl = document.querySelector('[data-metric="temperature"] .data-value');
        const tempBarEl = document.querySelector('[data-metric="temperature"] .bar-fill');
        if (tempValueEl && tempBarEl) {
            tempValueEl.textContent = `+${dataPoint.tempIncrease}°C`;
            tempBarEl.style.width = `${dataPoint.tempIncrease * 20}%`; // Scale for better visualization
        }

        // Update metrics grid
        const metrics = {
            density: `${dataPoint.density} t/ha`,
            biomass: `${dataPoint.biomass} Mg`,
            soilC: `${dataPoint.soilC} t/ha`,
            pH: dataPoint.pH
        };

        Object.entries(metrics).forEach(([metric, value]) => {
            const valueEl = document.querySelector(`[data-metric="${metric}"] .metric-value`);
            if (valueEl) {
                valueEl.textContent = value;
                // Add updating animation
                valueEl.classList.add('updating');
                setTimeout(() => valueEl.classList.remove('updating'), 500);
            }
        });

        // Update impact info if year changed
        if (dataPoint.year) {
            this.updateImpactInfo(dataPoint.year);
        }

        // Update image highlight
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.remove('active');
            const img = card.querySelector('img');
            if (img) {
                img.style.opacity = '0.3';
                img.style.transform = 'scale(1)';
            }
        });
        
        // Calculate which image to highlight (0-3) and loop after 4 years
        const cardIndex = (this.currentIndex % 4);
        if (cards[cardIndex]) {
            cards[cardIndex].classList.add('active');
            const img = cards[cardIndex].querySelector('img');
            if (img) {
                img.style.opacity = '1';
                img.style.transform = 'scale(1.05)';
                
                // Play corresponding highlight sound
                if (this.highlightSounds[cardIndex]) {
                    this.highlightSounds[cardIndex].currentTime = 0; // Reset to start
                    this.highlightSounds[cardIndex].play();
                }
            }
        }
    }

    generateDataPoint(year) {
        // Base values
        const baseDeforestation = 2000; // base hectares
        const yearIndex = year - 2015;
        const randomFactor = 0.2 + (Math.random() * 0.6); // Random between 0.2 and 0.8
        const loss = Math.round(baseDeforestation * (1 + yearIndex * 0.1) * randomFactor);
        
        // Calculate annual change percentage
        const previousLoss = this.previousLoss || baseDeforestation;
        const annualChange = ((loss - previousLoss) / previousLoss * 100).toFixed(1);
        this.previousLoss = loss;

        // Calculate other metrics based on the year and loss
        const density = Math.round(800 - (yearIndex * 20) + (Math.random() * 40 - 20));
        const biomass = Math.round(250 - (yearIndex * 15) + (Math.random() * 30 - 15));
        const soilC = Math.round(160 - (yearIndex * 5) + (Math.random() * 20 - 10));
        const pH = (6.5 - (yearIndex * 0.1) + (Math.random() * 0.2 - 0.1)).toFixed(1);
        
        // Calculate soil composition (decreasing over time)
        const soilComposition = Math.round(45 - (yearIndex * 2) + (Math.random() * 4 - 2));
        
        // Calculate biodiversity loss (increasing over time)
        const biodiversityLoss = Math.round(20 + (yearIndex * 4) + (Math.random() * 4 - 2));
        
        // Calculate temperature increase (increasing over time)
        const tempIncrease = (1.2 + (yearIndex * 0.15) + (Math.random() * 0.2 - 0.1)).toFixed(1);
        
        return {
            year,
            loss,
            annualChange,
            density,
            biomass,
            soilC,
            pH,
            soilComposition,
            biodiversityLoss,
            tempIncrease
        };
    }

    handleRegionChange() {
        if (this.regionSelect) {
            this.currentRegion = this.regionSelect.value;
            if (this.data && this.data[this.currentIndex]) {
                this.updateDisplay(this.data[this.currentIndex]);
            }
        }
    }

    async init() {
        try {
            // Start audio context
            await Tone.start();
            console.log('Audio context started');

            // Initialize Tone.js components
            this.initTone();
            await this.loadAmbientSounds();
            
            this.isInitialized = true;
            console.log('Audio initialized successfully');

            // Start playback
            this.play();
        } catch (error) {
            console.error('Error initializing audio:', error);
            throw error;
        }
    }

    initTone() {
        // Long reverb for ambient space
        this.reverb = new Tone.Reverb({
            decay: 15,
            preDelay: 0.2,
            wet: 0.7
        }).connect(this.limiter);

        // Ping-pong delay for space
        this.delay = new Tone.PingPongDelay({
            delayTime: "8n",
            feedback: 0.4,
            wet: 0.4
        }).connect(this.reverb);

        // Compressor for better dynamics
        this.compressor = new Tone.Compressor({
            threshold: -24,
            ratio: 3,
            attack: 0.1,
            release: 0.3
        }).connect(this.delay);

        // Dark pad synth with more experimental character
        this.padSynth = new Tone.PolySynth(Tone.FMSynth, {
            maxPolyphony: 6,
            harmonicity: 2,
            modulationIndex: 3,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 2,
                decay: 3,
                sustain: 0.8,
                release: 8
            },
            modulation: {
                type: "triangle"
            },
            modulationEnvelope: {
                attack: 1,
                decay: 2,
                sustain: 0.8,
                release: 6
            },
            volume: -8
        }).connect(this.compressor);

        // Cinematic bass synth
        this.bassSynth = new Tone.MonoSynth({
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.8,
                decay: 0.4,
                sustain: 0.9,
                release: 6
            },
            filter: {
                Q: 1,
                type: "lowpass",
                rolloff: -24
            },
            filterEnvelope: {
                attack: 0.8,
                decay: 0.4,
                sustain: 0.9,
                release: 4,
                baseFrequency: 50,
                octaves: 2.5
            },
            volume: -2  // Increased from -10
        }).connect(this.compressor);

        // Ambient drone synth
        this.droneSynth = new Tone.PolySynth(Tone.AMSynth, {
            maxPolyphony: 4,
            harmonicity: 1.5,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 3,
                decay: 2,
                sustain: 0.9,
                release: 10
            },
            modulation: {
                type: "square"
            },
            modulationEnvelope: {
                attack: 2,
                decay: 2,
                sustain: 0.9,
                release: 8
            },
            volume: -12  // Increased from -25
        }).connect(this.compressor);

        // Slow chorus for movement
        this.chorus = new Tone.Chorus({
            frequency: 0.1,
            delayTime: 8,
            depth: 0.9,
            spread: 180,
            wet: 0.5
        }).connect(this.reverb);

        this.padSynth.connect(this.chorus);
        this.droneSynth.connect(this.chorus);

        // Gentle filter
        this.filter = new Tone.Filter({
            type: "lowpass",
            frequency: 800,  // Increased from 600
            rolloff: -24,   // Less steep rolloff
            Q: 0.3
        }).connect(this.limiter);

        this.padSynth.connect(this.filter);
        this.droneSynth.connect(this.filter);

        // Dark bass drum
        this.drumSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 6,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4,
                attackCurve: "exponential"
            },
            volume: -8
        }).connect(this.compressor);

        // Drum reverb
        this.drumReverb = new Tone.Reverb({
            decay: 4.0,
            preDelay: 0.1,
            wet: 0.4
        }).connect(this.limiter);

        this.drumSynth.connect(this.drumReverb);

        // Keep track of active notes
        this.activeNotes = new Set();
        this.droneNotes = new Set();
        this.lastDrumTime = 0;
    }
    
    async loadAmbientSounds() {
        try {
            this.ambientSounds = [
                new Tone.Player("sounds/sound1.mp3").toDestination(),
                new Tone.Player("sounds/sound2.mp3").toDestination(),
                new Tone.Player("sounds/sound3.mp3").toDestination(),
                new Tone.Player("sounds/sound4.mp3").toDestination()
            ];
            console.log('Ambient sounds loaded');
        } catch (error) {
            console.error('Error loading ambient sounds:', error);
        }
    }

    playRandomAmbient() {
        const sound = this.ambientSounds[Math.floor(Math.random() * this.ambientSounds.length)];
        if (sound && sound.loaded) {
            sound.start();
        }
    }

    loadData() {
        // Sample deforestation data with regions
        const rawData = [
            {
                year: 2015,
                regions: {
                    'Seoul Capital Area': { loss: 5000, metrics: this.generateMetrics(0.3) },
                    'Yeongnam Region': { loss: 4000, metrics: this.generateMetrics(0.25) },
                    'Honam Region': { loss: 3000, metrics: this.generateMetrics(0.2) },
                    'Chungcheong Region': { loss: 2000, metrics: this.generateMetrics(0.15) },
                    'Gangwon Region': { loss: 1000, metrics: this.generateMetrics(0.1) }
                }
            },
            {
                year: 2016,
                regions: {
                    'Seoul Capital Area': { loss: 6000, metrics: this.generateMetrics(0.35) },
                    'Yeongnam Region': { loss: 5000, metrics: this.generateMetrics(0.3) },
                    'Honam Region': { loss: 4000, metrics: this.generateMetrics(0.25) },
                    'Chungcheong Region': { loss: 2500, metrics: this.generateMetrics(0.2) },
                    'Gangwon Region': { loss: 1000, metrics: this.generateMetrics(0.15) }
                }
            },
            {
                year: 2017,
                regions: {
                    'Seoul Capital Area': { loss: 7000, metrics: this.generateMetrics(0.4) },
                    'Yeongnam Region': { loss: 6000, metrics: this.generateMetrics(0.35) },
                    'Honam Region': { loss: 5000, metrics: this.generateMetrics(0.3) },
                    'Chungcheong Region': { loss: 3000, metrics: this.generateMetrics(0.25) },
                    'Gangwon Region': { loss: 1000, metrics: this.generateMetrics(0.2) }
                }
            },
            {
                year: 2018,
                regions: {
                    'Seoul Capital Area': { loss: 8000, metrics: this.generateMetrics(0.45) },
                    'Yeongnam Region': { loss: 7000, metrics: this.generateMetrics(0.4) },
                    'Honam Region': { loss: 6000, metrics: this.generateMetrics(0.35) },
                    'Chungcheong Region': { loss: 3000, metrics: this.generateMetrics(0.3) },
                    'Gangwon Region': { loss: 1000, metrics: this.generateMetrics(0.25) }
                }
            },
            {
                year: 2019,
                regions: {
                    'Seoul Capital Area': { loss: 9000, metrics: this.generateMetrics(0.5) },
                    'Yeongnam Region': { loss: 8000, metrics: this.generateMetrics(0.45) },
                    'Honam Region': { loss: 7000, metrics: this.generateMetrics(0.4) },
                    'Chungcheong Region': { loss: 3000, metrics: this.generateMetrics(0.35) },
                    'Gangwon Region': { loss: 1000, metrics: this.generateMetrics(0.3) }
                }
            },
            {
                year: 2020,
                regions: {
                    'Seoul Capital Area': { loss: 10000, metrics: this.generateMetrics(0.55) },
                    'Yeongnam Region': { loss: 9000, metrics: this.generateMetrics(0.5) },
                    'Honam Region': { loss: 8000, metrics: this.generateMetrics(0.45) },
                    'Chungcheong Region': { loss: 4000, metrics: this.generateMetrics(0.4) },
                    'Gangwon Region': { loss: 1000, metrics: this.generateMetrics(0.35) }
                }
            }
        ];
        
        // Store regions list
        this.regions = Object.keys(rawData[0].regions);
        
        // Process and normalize data
        this.data = rawData.map(yearData => {
            const totalLoss = Object.values(yearData.regions).reduce((sum, r) => sum + r.loss, 0);
            const aggregatedMetrics = this.aggregateMetrics(yearData.regions);
            
            return {
                year: yearData.year,
                regions: yearData.regions,
                totalLoss: totalLoss,
                aggregatedMetrics: aggregatedMetrics,
                normalizedLoss: 0 // Will be set after finding max
            };
        });
        
        // Normalize losses
        const maxLoss = Math.max(...this.data.map(d => d.totalLoss));
        this.data.forEach(d => {
            d.normalizedLoss = d.totalLoss / maxLoss;
        });
        
        // Update region selector if it exists
        this.updateRegionSelector();
        
        console.log('Data loaded:', this.data);
    }
    
    generateMetrics(factor) {
        return {
            density: Math.round(800 + factor * 100),
            biomass: Math.round(200 + factor * 50),
            soilC: Math.round(140 + factor * 30),
            pH: (6.0 + factor).toFixed(1),
            globalMetrics: `${(2.0 + factor * 0.5).toFixed(1)}M`,
            annualChange: `+${(8 + factor * 5).toFixed(1)}%`,
            carbonImpact: `${(0.8 + factor * 0.4).toFixed(1)}GT`,
            soilComposition: `${(40 + factor * 5).toFixed(1)}%`,
            biodiversity: `-${(20 + factor * 10).toFixed(1)}%`,
            temperature: `+${(1.0 + factor).toFixed(1)}°C`
        };
    }
    
    aggregateMetrics(regions) {
        const regionCount = Object.keys(regions).length;
        const summedMetrics = Object.values(regions).reduce((sum, region) => {
            Object.entries(region.metrics).forEach(([key, value]) => {
                if (!sum[key]) sum[key] = 0;
                // Handle both number and string values
                const numValue = typeof value === 'string' ? 
                    parseFloat(value.replace(/[^-\d.]/g, '')) : 
                    value;
                sum[key] += numValue;
            });
            return sum;
        }, {});
        
        // Average the metrics
        const averaged = {};
        Object.entries(summedMetrics).forEach(([key, value]) => {
            const avg = value / regionCount;
            switch(key) {
                case 'globalMetrics':
                    averaged[key] = `${avg.toFixed(1)}M`;
                    break;
                case 'annualChange':
                    averaged[key] = `+${avg.toFixed(1)}%`;
                    break;
                case 'carbonImpact':
                    averaged[key] = `${avg.toFixed(1)}GT`;
                    break;
                case 'soilComposition':
                    averaged[key] = `${avg.toFixed(1)}%`;
                    break;
                case 'biodiversity':
                    averaged[key] = `-${avg.toFixed(1)}%`;
                    break;
                case 'temperature':
                    averaged[key] = `+${avg.toFixed(1)}°C`;
                    break;
                default:
                    averaged[key] = Math.round(avg);
            }
        });
        
        return averaged;
    }
    
    updateRegionSelector() {
        if (!this.regionSelect) return;
        
        // Clear existing options
        this.regionSelect.innerHTML = '';
        
        // Add "All Regions" option
        const allOption = document.createElement('option');
        allOption.value = 'All Regions';
        allOption.textContent = 'All Regions';
        this.regionSelect.appendChild(allOption);
        
        // Add region options
        this.regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            this.regionSelect.appendChild(option);
        });
    }
    
    play() {
        if (!this.isInitialized) {
            console.log('Initializing audio...');
            this.init().then(() => {
                console.log('Starting playback...');
                this.startPlayback();
            });
        } else {
            console.log('Starting playback...');
            this.startPlayback();
        }
    }

    startPlayback() {
        if (this.isPlaying) {
            this.stop();
            return;
        }

        this.isPlaying = true;
        this.currentIndex = 0;
        console.log('Playback started');
        
        // Update button state
        const button = document.getElementById('sonify-button');
        if (button) {
            button.classList.add('playing');
        }

        this.playSequence();
    }

    stop() {
        this.isPlaying = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.releaseAllNotes();
        
        // Reset button state
        const button = document.getElementById('sonify-button');
        if (button) {
            button.classList.remove('playing');
        }
        
        // Optional: Reset display to empty state
        this.yearDisplay.textContent = '-';
        this.lossDisplay.textContent = '-';
        this.lossFill.style.width = '0%';
        
        document.querySelectorAll('.metric-value').forEach(el => {
            el.textContent = '-';
        });
        
        document.querySelectorAll('.data-value').forEach(el => {
            el.textContent = '-';
        });
    }

    playSequence() {
        if (!this.isPlaying) return;

        const startTime = Date.now();
        let currentIndex = this.currentIndex;
        let lastNoteTime = 0;

        const playNextNote = () => {
            if (!this.isPlaying) return;

            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            // Only play notes every 500ms to prevent polyphony overload
            if (currentTime - lastNoteTime < 500) {
                this.timeoutId = setTimeout(playNextNote, 100);
                return;
            }

            // Extend duration per year to 8 seconds
            const yearDuration = 8000;
            currentIndex = Math.floor(elapsed / yearDuration) % this.years.length;

            // Check if we've completed all years
            if (currentIndex === 0 && this.currentIndex === this.years.length - 1) {
                // We've gone through all years, stop playback
                this.stop();
                return;
            }

            if (currentIndex !== this.currentIndex) {
                this.currentIndex = currentIndex;
                const currentYear = this.years[this.currentIndex];
                const dataPoint = this.generateDataPoint(currentYear);
                this.updateDisplay(dataPoint);
                console.log(`Playing year: ${currentYear}`);

                // Release all notes when changing years
                this.releaseAllNotes();
            }

            // Calculate current value based on data
            const currentYear = this.years[this.currentIndex];
            const dataPoint = this.generateDataPoint(currentYear);
            this.currentValue = dataPoint.loss / this.warningThreshold;

            // Play drums sparsely based on data intensity
            const intensity = this.currentValue;
            if (currentTime - this.lastDrumTime > 3000) { // Increased drum spacing
                if (Math.random() < 0.3 * intensity) {
                    const drumNote = 30 + (intensity * 20);
                    this.drumSynth.triggerAttackRelease(drumNote, "8n", Tone.now(), 0.7);
                    this.lastDrumTime = currentTime;
                }
            }

            // Play the main sonification
            this.playNote(this.currentValue);
            lastNoteTime = currentTime;

            // Schedule next note with longer interval
            this.timeoutId = setTimeout(playNextNote, 500);
        };

        playNextNote();
    }

    releaseAllNotes() {
        // Release all active notes
        if (this.activeNotes) {
            this.activeNotes.forEach(note => {
                this.padSynth?.triggerRelease(note);
            });
        }
        if (this.droneNotes) {
            this.droneNotes.forEach(note => {
                this.droneSynth?.triggerRelease(note);
            });
        }
        this.bassSynth?.triggerRelease();
        this.drumSynth?.triggerRelease();

        // Clear note tracking
        this.activeNotes?.clear();
        this.droneNotes?.clear();
    }

    playNote(value, range = 'mid') {
        if (!this.isPlaying) return;

        // Clean up previous notes
        this.releaseAllNotes();

        value = parseFloat(value);
        if (isNaN(value)) value = 0;
        value = Math.max(0, Math.min(1, value));

        const baseFreq = 110; // Lower base frequency
        const maxFreq = 440; // Reduced max frequency
        let freq = baseFreq + (value * (maxFreq - baseFreq));
        
        // Add subtle randomization for experimental character
        freq += (Math.random() - 0.5) * 20;
        
        freq = Math.min(freq, maxFreq);

        const velocity = this.mapToVelocity(value) * 0.8;  // Increased volume
        
        const currentYear = this.years[this.currentIndex];
        const dataPoint = this.generateDataPoint(currentYear);
        const chords = this.generateChord(freq, currentYear, dataPoint);

        // Reduce number of simultaneous notes
        const maxNotesPerChord = 3;
        
        // Play bass notes first (limit to 1)
        const bassNote = chords.bass[0];
        if (bassNote && !isNaN(bassNote)) {
            this.bassSynth.triggerAttackRelease(bassNote, "2n", Tone.now(), velocity * 0.9);
        }

        // Play limited pad notes
        chords.pad.slice(0, maxNotesPerChord).forEach((note, i) => {
            if (!isNaN(note)) {
                const time = Tone.now() + (i * 0.7);
                this.droneSynth.triggerAttackRelease(note, "2n", time, velocity * 0.7);
                this.droneNotes.add(note);
            }
        });

        // Play limited chord notes
        chords.root.slice(0, maxNotesPerChord).forEach((note, i) => {
            if (!isNaN(note)) {
                const time = Tone.now() + (i * 0.5);
                this.padSynth.triggerAttackRelease(note, "2n", time, velocity);
                this.activeNotes.add(note);
            }
        });
    }

    generateChord(baseFreq, year, dataPoint) {
        const tension = (dataPoint.loss / this.warningThreshold);
        const complexity = (dataPoint.density / 1000);
        
        // Base intervals for minor scale (restored)
        const intervals = {
            minor2nd: 1.067,
            minor3rd: 1.2,
            perfect4th: 1.33,
            perfect5th: 1.5,
            minor6th: 1.6,
            minor7th: 1.778,
            octave: 2.0
        };

        // Create different chord progressions for each year
        let chordNotes;
        switch(year) {
            case 2015:
                chordNotes = [
                    baseFreq,
                    baseFreq * intervals.minor3rd,
                    baseFreq * intervals.perfect5th
                ];
                break;
            case 2016:
                chordNotes = [
                    baseFreq,
                    baseFreq * intervals.minor3rd,
                    baseFreq * intervals.minor7th
                ];
                break;
            case 2017:
                chordNotes = [
                    baseFreq,
                    baseFreq * intervals.minor2nd,
                    baseFreq * intervals.perfect4th,
                    baseFreq * intervals.minor6th
                ];
                break;
            case 2018:
                chordNotes = [
                    baseFreq,
                    baseFreq * intervals.minor3rd,
                    baseFreq * intervals.perfect5th,
                    baseFreq * intervals.octave
                ];
                break;
            case 2019:
                chordNotes = [
                    baseFreq,
                    baseFreq * intervals.minor2nd,
                    baseFreq * intervals.perfect5th,
                    baseFreq * intervals.minor7th
                ];
                break;
            case 2020:
                chordNotes = [
                    baseFreq,
                    baseFreq * intervals.minor2nd,
                    baseFreq * intervals.minor3rd,
                    baseFreq * intervals.minor7th
                ];
                break;
            default:
                chordNotes = [baseFreq, baseFreq * intervals.minor3rd, baseFreq * intervals.perfect5th];
        }

        // Restore bass notes
        const bassNotes = [
            baseFreq / 4,  // Two octaves down
            (baseFreq / 4) * intervals.perfect5th
        ];

        // Add tension-based harmonics
        if (tension > 0.5) {
            chordNotes.push(baseFreq * intervals.minor2nd);
        }
        if (tension > 0.7) {
            chordNotes.push(baseFreq * intervals.minor7th);
        }

        // Dark experimental pad notes (only for the high sparse ones)
        const padNotes = [
            baseFreq / 2,
            (baseFreq / 2) * intervals.perfect5th,
            baseFreq * intervals.minor7th
        ].map(freq => {
            // Add microtonal variations only to high notes
            if (freq > 220) {
                const microtonalShift = (Math.random() - 0.5) * 8;
                freq += microtonalShift;
                // Ensure it stays in a darker range
                return Math.min(freq, 350);
            }
            return freq;
        });

        return {
            root: chordNotes,
            bass: bassNotes,
            pad: padNotes
        };
    }

    mapToFrequency(value, range = 'mid') {
        // Clamp value between 0 and 1
        value = Math.max(0, Math.min(1, value));
        
        // Restore original ranges but cap high range
        const ranges = {
            'low': [55, 110],    // A1 to A2
            'mid': [110, 220],   // A2 to A3
            'high': [220, 350]   // A3 to F4 (capped lower for darkness)
        };
        
        const [min, max] = ranges[range] || ranges['mid'];
        let freq = min + (value * (max - min));
        
        // Add subtle variation only to high notes
        if (freq > 220) {
            freq += (Math.random() - 0.5) * 10;
            freq = Math.min(freq, 350); // Keep high notes darker
        }
        
        return freq;
    }

    mapToVelocity(value) {
        // Ensure value is a valid number
        value = parseFloat(value);
        if (isNaN(value)) value = 0;
        
        // Clamp value between 0 and 1
        value = Math.max(0, Math.min(1, value));
        
        // More nuanced velocity mapping
        return 0.3 + (value * 0.5); // Range from 0.3 to 0.8
    }

    mapToFilter(value) {
        // Ensure value is a valid number
        value = parseFloat(value);
        if (isNaN(value)) value = 0;
        
        // Clamp value between 0 and 1
        value = Math.max(0, Math.min(1, value));
        
        // More dramatic filter sweep
        return 200 + (value * 4000); // Range from 200Hz to 4200Hz
    }

    updateImpactInfo(year) {
        const impactText = document.getElementById('impact-text');
        const impactSource = document.getElementById('impact-source');
        
        if (!impactText || !impactSource || !this.impactData || !this.impactData[year]) {
            console.warn('Missing impact elements or data for year:', year);
            return;
        }

        const impact = this.impactData[year];
        
        // Update text with fade effect
        impactText.style.opacity = '0';
        impactSource.style.opacity = '0';
        
        setTimeout(() => {
            impactText.textContent = impact.text;
            impactSource.textContent = impact.source;
            impactText.setAttribute('lang', impact.lang);
            
            impactText.style.opacity = '1';
            impactSource.style.opacity = '1';
        }, 300);
    }

    animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = Math.round(end).toLocaleString();
                return;
            }
            element.textContent = Math.round(current).toLocaleString();
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Create instance and export to window
let sonifier;
document.addEventListener('DOMContentLoaded', () => {
    sonifier = new DeforestationSonifier();
    window.sonifier = sonifier; // Make it accessible globally
});
