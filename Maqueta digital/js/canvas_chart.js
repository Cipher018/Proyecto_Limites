/**
 * canvas_chart.js
 * Gráficas de convergencia y evolución de error para la Pestaña 2.
 * Canvas independientes para Área y Error, garantizando que nunca se solapen.
 */

class AreaChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.displayWidth = 0;
        this.displayHeight = 0;
        this.dataPoints = [];
        this.areaRef = 0.08221000;
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            this.render();
        });
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.floor(rect.width * dpr);
        this.canvas.height = Math.floor(rect.height * dpr);
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }

    setData(points, areaRef) {
        this.dataPoints = points;
        if (areaRef) this.areaRef = areaRef;
        this.render();
    }

    render() {
        const ctx = this.ctx;
        const w = this.displayWidth;
        const h = this.displayHeight;
        if (w <= 0 || h <= 0) return;

        ctx.clearRect(0, 0, w, h);
        if (!this.dataPoints || this.dataPoints.length === 0) return;

        const padL = 65;
        const padR = 25;
        const padT = 16;
        const padB = 26;

        const plotW = Math.max(10, w - padL - padR);
        const plotH = Math.max(10, h - padT - padB);

        const nMin = 2;
        const nMax = 10000;
        const logMin = Math.log10(nMin);
        const logMax = Math.log10(nMax);

        const nToPx = (n) => {
            const val = Math.max(nMin, Math.min(nMax, n));
            const frac = (Math.log10(val) - logMin) / (logMax - logMin);
            return padL + frac * plotW;
        };

        const topYMin = 0.064;
        const topYMax = 0.086;
        const areaToPx = (a) => {
            const frac = (a - topYMin) / (topYMax - topYMin);
            return padT + plotH - frac * plotH;
        };

        // Marco y grid
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(padL, padT, plotW, plotH);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.strokeRect(padL, padT, plotW, plotH);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        for (let i = 1; i <= 3; i++) {
            const gy = padT + (plotH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padL, gy);
            ctx.lineTo(padL + plotW, gy);
            ctx.stroke();
        }

        // Línea exacta
        const yRefPx = areaToPx(this.areaRef);
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, yRefPx);
        ctx.lineTo(padL + plotW, yRefPx);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = '9.5px monospace';
        ctx.fillText(`A_ref = ${this.areaRef.toFixed(6)}`, padL + 8, Math.max(padT + 12, yRefPx - 4));
        ctx.restore();

        // Curva
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        this.dataPoints.forEach((pt, i) => {
            const px = nToPx(pt.n);
            const py = areaToPx(pt.area);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Puntos
        this.dataPoints.forEach((pt) => {
            const px = nToPx(pt.n);
            const py = areaToPx(pt.area);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Punto actual
        const currentPt = this.dataPoints[this.dataPoints.length - 1];
        if (currentPt) {
            const curX = nToPx(currentPt.n);
            const curY = areaToPx(currentPt.area);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(curX, curY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            const labelText = `A = ${currentPt.area.toFixed(6)}`;
            const textWidth = ctx.measureText(labelText).width;
            let textX = curX - textWidth / 2;
            if (textX < padL + 4) textX = padL + 4;
            if (textX + textWidth > padL + plotW - 4) textX = padL + plotW - textWidth - 4;
            ctx.fillText(labelText, textX, Math.max(padT + 12, curY - 7));
        }
        ctx.restore();

        this.drawTicks(padL, padT + plotH, plotW, logMin, logMax);
    }

    drawTicks(x, y, w, logMin, logMax) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        const ticks = [2, 10, 100, 1000, 10000];
        ticks.forEach((t) => {
            const frac = (Math.log10(t) - logMin) / (logMax - logMin);
            const px = x + frac * w;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.beginPath();
            ctx.moveTo(px, y);
            ctx.lineTo(px, y + 3);
            ctx.stroke();
            const label = t >= 1000 ? `10^${Math.log10(t)}` : `${t}`;
            ctx.fillText(label, px - (label.length * 2.8), y + 13);
        });
        ctx.restore();
    }
}

class ErrorChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.displayWidth = 0;
        this.displayHeight = 0;
        this.dataPoints = [];
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            this.render();
        });
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.floor(rect.width * dpr);
        this.canvas.height = Math.floor(rect.height * dpr);
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }

    setData(points) {
        this.dataPoints = points;
        this.render();
    }

    render() {
        const ctx = this.ctx;
        const w = this.displayWidth;
        const h = this.displayHeight;
        if (w <= 0 || h <= 0) return;

        ctx.clearRect(0, 0, w, h);
        if (!this.dataPoints || this.dataPoints.length === 0) return;

        const padL = 65;
        const padR = 25;
        const padT = 16;
        const padB = 26;

        const plotW = Math.max(10, w - padL - padR);
        const plotH = Math.max(10, h - padT - padB);

        const nMin = 2;
        const nMax = 10000;
        const logMin = Math.log10(nMin);
        const logMax = Math.log10(nMax);

        const nToPx = (n) => {
            const val = Math.max(nMin, Math.min(nMax, n));
            const frac = (Math.log10(val) - logMin) / (logMax - logMin);
            return padL + frac * plotW;
        };

        const errMinLog = -4;
        const errMaxLog = 1.5;
        const errToPx = (errPct) => {
            const safeErr = Math.max(1e-4, errPct);
            const frac = (Math.log10(safeErr) - errMinLog) / (errMaxLog - errMinLog);
            return padT + plotH - frac * plotH;
        };

        // Marco y grid
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(padL, padT, plotW, plotH);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.strokeRect(padL, padT, plotW, plotH);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        for (let i = 1; i <= 3; i++) {
            const gy = padT + (plotH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padL, gy);
            ctx.lineTo(padL + plotW, gy);
            ctx.stroke();
        }

        // Curva de error
        ctx.save();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        this.dataPoints.forEach((pt, i) => {
            const px = nToPx(pt.n);
            const py = errToPx(pt.err_pct);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        this.dataPoints.forEach((pt) => {
            const px = nToPx(pt.n);
            const py = errToPx(pt.err_pct);
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Resaltar error actual
        const currentPt = this.dataPoints[this.dataPoints.length - 1];
        if (currentPt) {
            const curX = nToPx(currentPt.n);
            const curY = errToPx(currentPt.err_pct);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(curX, curY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#38bdf8';
            ctx.font = '9.5px monospace';
            const errLabel = `Err: ${currentPt.err_pct.toFixed(3)}%`;
            const errTextWidth = ctx.measureText(errLabel).width;
            let errTextX = curX - errTextWidth / 2;
            if (errTextX < padL + 4) errTextX = padL + 4;
            if (errTextX + errTextWidth > padL + plotW - 4) errTextX = padL + plotW - errTextWidth - 4;
            ctx.fillText(errLabel, errTextX, Math.max(padT + 12, curY - 7));
        }
        ctx.restore();

        this.drawTicks(padL, padT + plotH, plotW, logMin, logMax);
    }

    drawTicks(x, y, w, logMin, logMax) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        const ticks = [2, 10, 100, 1000, 10000];
        ticks.forEach((t) => {
            const frac = (Math.log10(t) - logMin) / (logMax - logMin);
            const px = x + frac * w;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.beginPath();
            ctx.moveTo(px, y);
            ctx.lineTo(px, y + 3);
            ctx.stroke();
            const label = t >= 1000 ? `10^${Math.log10(t)}` : `${t}`;
            ctx.fillText(label, px - (label.length * 2.8), y + 13);
        });
        ctx.restore();
    }
}

class ConvergenceChartManager {
    constructor(areaCanvasId, errorCanvasId) {
        this.areaChart = new AreaChart(areaCanvasId);
        this.errorChart = new ErrorChart(errorCanvasId);
    }

    resize() {
        this.areaChart.resize();
        this.errorChart.resize();
    }

    setData(points, areaRef) {
        this.areaChart.setData(points, areaRef);
        this.errorChart.setData(points);
    }
}
