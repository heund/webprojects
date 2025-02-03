class MinimalGraph {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = options.data || [];
        this.label = options.label || '';
        this.unit = options.unit || '';
        this.color = options.color || 'rgba(255, 255, 255, 0.6)';
        this.gridColor = options.gridColor || 'rgba(255, 255, 255, 0.1)';
        this.animate = options.animate !== undefined ? options.animate : true;
        this.animationProgress = 0;
        this.lastTime = 0;
        
        // Set canvas size
        this.resize();
        
        // Bind resize event
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }
    
    setData(data) {
        this.data = data;
        if (this.animate) {
            this.animationProgress = 0;
            this.lastTime = performance.now();
            this.animateGraph();
        } else {
            this.draw();
        }
    }
    
    animateGraph(currentTime = performance.now()) {
        if (!this.lastTime) this.lastTime = currentTime;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.animationProgress = Math.min(1, this.animationProgress + deltaTime / 1000);
        this.draw();
        
        if (this.animationProgress < 1) {
            requestAnimationFrame((time) => this.animateGraph(time));
        }
    }
    
    drawGrid() {
        const { ctx, canvas } = this;
        const gridSize = 20;
        
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    draw() {
        const { ctx, canvas, data } = this;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        if (!data.length) return;
        
        // Calculate scales
        const padding = 20;
        const graphWidth = canvas.width - padding * 2;
        const graphHeight = canvas.height - padding * 2;
        
        const xScale = graphWidth / (data.length - 1);
        const yMin = Math.min(...data.map(d => parseFloat(d.value)));
        const yMax = Math.max(...data.map(d => parseFloat(d.value)));
        const yRange = yMax - yMin || 1; // Prevent division by zero
        
        // Draw graph line
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        data.forEach((point, i) => {
            const x = padding + (i * xScale);
            const progress = this.animate ? this.animationProgress : 1;
            const value = parseFloat(point.value);
            const y = padding + graphHeight - ((value - yMin) / yRange * graphHeight * progress);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        data.forEach((point, i) => {
            const x = padding + (i * xScale);
            const progress = this.animate ? this.animationProgress : 1;
            const value = parseFloat(point.value);
            const y = padding + graphHeight - ((value - yMin) / yRange * graphHeight * progress);
            
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px "Space Mono"';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.label} (${this.unit})`, padding, padding - 5);
        
        // Draw latest value
        const latestValue = data[data.length - 1].value;
        ctx.textAlign = 'right';
        ctx.fillText(`${latestValue}${this.unit}`, canvas.width - padding, padding - 5);
    }
}

// Sample data
const annualChangeData = [
    { year: 2015, value: 8.2 },
    { year: 2016, value: 9.1 },
    { year: 2017, value: 10.5 },
    { year: 2018, value: 11.2 },
    { year: 2019, value: 11.8 },
    { year: 2020, value: 12.3 }
];

const biodiversityData = [
    { year: 2015, value: -18.5 },
    { year: 2016, value: -21.2 },
    { year: 2017, value: -23.8 },
    { year: 2018, value: -25.4 },
    { year: 2019, value: -27.1 },
    { year: 2020, value: -28.9 }
];

// Initialize graphs when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const annualChangeGraph = new MinimalGraph(
        document.getElementById('annual-change-graph'),
        {
            data: annualChangeData,
            label: 'Annual Change',
            unit: '%',
            color: 'rgba(255, 255, 255, 0.6)',
            animate: true
        }
    );
    
    const biodiversityGraph = new MinimalGraph(
        document.getElementById('biodiversity-graph'),
        {
            data: biodiversityData,
            label: 'Biodiversity Loss',
            unit: '%',
            color: 'rgba(255, 255, 255, 0.6)',
            animate: true
        }
    );
});
