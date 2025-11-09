// Chart rendering utilities using Canvas API
// No external dependencies - pure vanilla JavaScript

export class ChartRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.padding = 40;
        this.colors = {
            line: '#3b82f6',
            grid: '#334155',
            text: '#94a3b8',
            point: '#60a5fa',
            pointHover: '#3b82f6',
            background: '#1e293b'
        };
    }

    setDimensions(width, height) {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.ctx.scale(dpr, dpr);
        this.width = width;
        this.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawLineChart(data, options = {}) {
        this.clear();
        
        if (!data || data.length === 0) {
            this.drawEmptyState('No data available');
            return;
        }

        const {
            xLabel = 'Date',
            yLabel = 'Weight (kg)',
            showGrid = true,
            showPoints = true,
            smooth = false
        } = options;

        const chartWidth = this.width - 2 * this.padding;
        const chartHeight = this.height - 2 * this.padding;

        // Find min/max values for scaling
        const yValues = data.map(d => d.y);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        const yRange = maxY - minY || 1;
        const yPadding = yRange * 0.1;

        // Scale functions
        const scaleX = (index) => this.padding + (index / (data.length - 1)) * chartWidth;
        const scaleY = (value) => this.height - this.padding - 
            ((value - (minY - yPadding)) / (yRange + 2 * yPadding)) * chartHeight;

        // Draw grid
        if (showGrid) {
            this.drawGrid(5, 5, scaleX, scaleY, data.length, minY - yPadding, maxY + yPadding);
        }

        // Draw axes
        this.drawAxes(xLabel, yLabel);

        // Draw line
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.line;
        this.ctx.lineWidth = 2;
        
        data.forEach((point, index) => {
            const x = scaleX(index);
            const y = scaleY(point.y);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();

        // Draw points
        if (showPoints) {
            data.forEach((point, index) => {
                const x = scaleX(index);
                const y = scaleY(point.y);
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = point.isPR ? '#fbbf24' : this.colors.point;
                this.ctx.fill();
                
                // Add border for PR points
                if (point.isPR) {
                    this.ctx.strokeStyle = '#f59e0b';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            });
        }

        // Draw Y-axis labels
        this.drawYAxisLabels(minY - yPadding, maxY + yPadding, scaleY, 5);

        // Draw X-axis labels (dates)
        this.drawXAxisLabels(data, scaleX);
    }

    drawGrid(xDivisions, yDivisions, scaleX, scaleY, dataLength, minY, maxY) {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);

        // Horizontal grid lines
        for (let i = 0; i <= yDivisions; i++) {
            const y = this.height - this.padding - (i / yDivisions) * (this.height - 2 * this.padding);
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(this.width - this.padding, y);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    drawAxes(xLabel, yLabel) {
        this.ctx.strokeStyle = this.colors.text;
        this.ctx.lineWidth = 2;

        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.height - this.padding);
        this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
        this.ctx.stroke();

        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding);
        this.ctx.lineTo(this.padding, this.height - this.padding);
        this.ctx.stroke();

        // Labels
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px system-ui, -apple-system, sans-serif';
        this.ctx.textAlign = 'center';
        
        // X-axis label
        this.ctx.fillText(xLabel, this.width / 2, this.height - 5);
        
        // Y-axis label (rotated)
        this.ctx.save();
        this.ctx.translate(15, this.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(yLabel, 0, 0);
        this.ctx.restore();
    }

    drawYAxisLabels(minY, maxY, scaleY, divisions) {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '11px system-ui, -apple-system, sans-serif';
        this.ctx.textAlign = 'right';

        for (let i = 0; i <= divisions; i++) {
            const value = minY + (i / divisions) * (maxY - minY);
            const y = scaleY(value);
            this.ctx.fillText(Math.round(value), this.padding - 10, y + 4);
        }
    }

    drawXAxisLabels(data, scaleX) {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '11px system-ui, -apple-system, sans-serif';
        this.ctx.textAlign = 'center';

        // Show first, middle, and last date
        const indices = data.length > 2 
            ? [0, Math.floor(data.length / 2), data.length - 1]
            : data.map((_, i) => i);

        indices.forEach(index => {
            if (index < data.length) {
                const point = data[index];
                const x = scaleX(index);
                const date = new Date(point.x);
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                this.ctx.fillText(label, x, this.height - this.padding + 20);
            }
        });
    }

    drawEmptyState(message) {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px system-ui, -apple-system, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.width / 2, this.height / 2);
    }

    getPointAtPosition(data, x, y) {
        if (!data || data.length === 0) return null;

        const chartWidth = this.width - 2 * this.padding;
        const scaleX = (index) => this.padding + (index / (data.length - 1)) * chartWidth;

        // Find closest point to x coordinate
        let closestIndex = 0;
        let closestDistance = Infinity;

        data.forEach((point, index) => {
            const pointX = scaleX(index);
            const distance = Math.abs(pointX - x);
            
            if (distance < closestDistance && distance < 20) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestDistance < 20) {
            return { index: closestIndex, data: data[closestIndex] };
        }

        return null;
    }
}

// Export utility function for creating charts
export function createLineChart(canvas, data, options) {
    const renderer = new ChartRenderer(canvas);
    const rect = canvas.getBoundingClientRect();
    renderer.setDimensions(rect.width, rect.height);
    renderer.drawLineChart(data, options);
    return renderer;
}
