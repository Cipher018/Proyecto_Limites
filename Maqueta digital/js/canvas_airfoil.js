/**
 * canvas_airfoil.js
 * Renderizador en HTML5 Canvas del perfil aerodinámico y sus rectángulos de Riemann.
 * Optimizado para encajar exactamente dentro de su tarjeta contenedora con escalado 1:1.
 */

class AirfoilCanvas {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.options = Object.assign({
            showAirfoil: true,
            showRectangles: true,
            showSamplePoints: true,
            showChordLine: true,
            interactiveHover: false
        }, options);

        this.hoveredRect = null;
        this.currentData = null;
        this.viewTransform = { scale: 1, offsetX: 0, offsetY: 0 };
        this.displayWidth = 0;
        this.displayHeight = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            if (this.currentData) this.render(this.currentData);
        });

        if (this.options.interactiveHover) {
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('mouseleave', () => {
                this.hoveredRect = null;
                if (this.currentData) this.render(this.currentData);
            });
        }
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

    // Transforma coordenadas aerodinámicas a píxeles
    coordToPx(x, y) {
        const xMin = -0.06;
        const xMax = 1.06;
        const ySpan = 0.38; // Espacio vertical para [-0.19, +0.19]

        const paddingX = Math.max(20, this.displayWidth * 0.04);
        const paddingY = Math.max(16, this.displayHeight * 0.05);
        const availWidth = Math.max(10, this.displayWidth - 2 * paddingX);
        const availHeight = Math.max(10, this.displayHeight - 2 * paddingY);

        // Escala isométrica 1:1
        const scale = Math.min(availWidth / (xMax - xMin), availHeight / ySpan);
        this.viewTransform.scale = scale;

        const originPxX = paddingX + (availWidth - (xMax - xMin) * scale) / 2 - xMin * scale;
        const originPxY = this.displayHeight / 2;

        this.viewTransform.offsetX = originPxX;
        this.viewTransform.offsetY = originPxY;

        return {
            px: originPxX + x * scale,
            py: originPxY - y * scale // Eje Y hacia arriba en cálculo aeronáutico
        };
    }

    pxToCoord(px, py) {
        return {
            x: (px - this.viewTransform.offsetX) / this.viewTransform.scale,
            y: -(py - this.viewTransform.offsetY) / this.viewTransform.scale
        };
    }

    handleMouseMove(e) {
        if (!this.currentData || !this.currentData.rectangulos) return;
        const rect = this.canvas.getBoundingClientRect();
        const mousePxX = e.clientX - rect.left;
        const mousePxY = e.clientY - rect.top;
        const { x, y } = this.pxToCoord(mousePxX, mousePxY);

        // Detectar si está sobre algún rectángulo
        let found = null;
        for (const r of this.currentData.rectangulos) {
            if (x >= r.x_left && x <= r.x_right && Math.abs(y) <= r.yt) {
                found = r;
                break;
            }
        }

        if (this.hoveredRect !== found) {
            this.hoveredRect = found;
            this.render(this.currentData);
        }

        if (this.onHover) {
            this.onHover(found, { clientX: e.clientX, clientY: e.clientY });
        }
    }

    render(riemannData) {
        this.currentData = riemannData;
        const ctx = this.ctx;
        const w = this.displayWidth;
        const h = this.displayHeight;

        if (w <= 0 || h <= 0) return;
        ctx.clearRect(0, 0, w, h);

        // 1. Grid
        this.drawGrid();

        // 2. Línea de cuerda media (y = 0)
        if (this.options.showChordLine) {
            const pStart = this.coordToPx(-0.04, 0);
            const pEnd = this.coordToPx(1.04, 0);
            ctx.save();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(pStart.px, pStart.py);
            ctx.lineTo(pEnd.px, pEnd.py);
            ctx.stroke();
            ctx.restore();
        }

        // 3. Rectángulos de Riemann (Extremo Derecho)
        if (this.options.showRectangles && riemannData.rectangulos) {
            riemannData.rectangulos.forEach((r) => {
                const isHovered = this.hoveredRect && this.hoveredRect.index === r.index;
                const pTopLeft = this.coordToPx(r.x_left, r.yt);
                const pBotRight = this.coordToPx(r.x_right, -r.yt);
                const rw = pBotRight.px - pTopLeft.px;
                const rh = pBotRight.py - pTopLeft.py;

                ctx.save();
                if (isHovered) {
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.75)';
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.8;
                } else {
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.32)';
                    ctx.strokeStyle = 'rgba(217, 119, 6, 0.85)';
                    ctx.lineWidth = r.dx < 0.005 ? 0.3 : 0.8;
                }

                ctx.fillRect(pTopLeft.px, pTopLeft.py, rw, rh);
                ctx.strokeRect(pTopLeft.px, pTopLeft.py, rw, rh);
                ctx.restore();
            });
        }

        // 4. Contorno del perfil NACA 0012
        if (this.options.showAirfoil) {
            this.drawAirfoilContour(riemannData.t, riemannData.c);
        }

        // 5. Puntos de evaluación en el extremo derecho
        if (this.options.showSamplePoints && riemannData.n <= 100) {
            riemannData.rectangulos.forEach((r) => {
                const ptTop = this.coordToPx(r.x_right, r.yt);
                const ptBot = this.coordToPx(r.x_right, -r.yt);

                ctx.save();
                ctx.fillStyle = '#ef4444';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 3;

                const radius = riemannData.n > 50 ? 2 : 3;
                ctx.beginPath();
                ctx.arc(ptTop.px, ptTop.py, radius, 0, Math.PI * 2);
                ctx.arc(ptBot.px, ptBot.py, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
    }

    drawAirfoilContour(t, c) {
        const ctx = this.ctx;
        const steps = 250;
        const upperPts = [];
        const lowerPts = [];

        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * c;
            const yt = naca0012_yt(x, t, c);
            upperPts.push(this.coordToPx(x, yt));
            lowerPts.push(this.coordToPx(x, -yt));
        }

        ctx.save();
        // Relleno suave
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.beginPath();
        ctx.moveTo(upperPts[0].px, upperPts[0].py);
        for (let i = 1; i <= steps; i++) ctx.lineTo(upperPts[i].px, upperPts[i].py);
        for (let i = steps; i >= 0; i--) ctx.lineTo(lowerPts[i].px, lowerPts[i].py);
        ctx.closePath();
        ctx.fill();

        // Contorno
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(upperPts[0].px, upperPts[0].py);
        for (let i = 1; i <= steps; i++) ctx.lineTo(upperPts[i].px, upperPts[i].py);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(lowerPts[0].px, lowerPts[0].py);
        for (let i = 1; i <= steps; i++) ctx.lineTo(lowerPts[i].px, lowerPts[i].py);
        ctx.stroke();
        ctx.restore();
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= 1.0; x += 0.1) {
            const p1 = this.coordToPx(x, -0.16);
            const p2 = this.coordToPx(x, 0.16);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
        }

        for (let y = -0.15; y <= 0.15; y += 0.05) {
            const p1 = this.coordToPx(-0.02, y);
            const p2 = this.coordToPx(1.02, y);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
        }
        ctx.restore();
    }
}
