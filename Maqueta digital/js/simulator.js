/**
 * simulator.js
 * Controlador de la animación sincronizada para la Pestaña 2 (Perfil + Gráficas).
 */

class RiemannSimulator {
    constructor(airfoilCanvasInstance, convergenceChartInstance) {
        this.airfoil = airfoilCanvasInstance;
        this.chart = convergenceChartInstance;

        this.stepsN = this.generateNSequence();
        this.currentIndex = 0;
        this.isPlaying = false;
        this.speed = 1.0;
        this.isLoop = true;
        this.history = [];

        this.lastFrameTime = 0;
        this.stepIntervalMs = 180;
    }

    generateNSequence() {
        const seq = [];
        for (let i = 2; i <= 30; i++) seq.push(i);
        for (let i = 35; i <= 100; i += 5) seq.push(i);
        for (let i = 120; i <= 500; i += 20) seq.push(i);
        for (let i = 600; i <= 2000; i += 100) seq.push(i);
        for (let i = 2500; i <= 10000; i += 500) seq.push(i);
        return seq;
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
        if (this.onStateChange) this.onStateChange({ isPlaying: true });
    }

    pause() {
        this.isPlaying = false;
        if (this.onStateChange) this.onStateChange({ isPlaying: false });
    }

    toggle() {
        if (this.isPlaying) this.pause();
        else this.start();
    }

    reset() {
        this.pause();
        this.currentIndex = 0;
        this.history = [];
        this.updateStep(0);
        if (this.onStateChange) this.onStateChange({ isPlaying: false, progress: 0 });
    }

    stepForward() {
        this.pause();
        if (this.currentIndex < this.stepsN.length - 1) {
            this.currentIndex++;
            this.updateStep(this.currentIndex);
        }
    }

    stepBackward() {
        this.pause();
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateStep(this.currentIndex);
        }
    }

    setSpeed(speedVal) {
        this.speed = parseFloat(speedVal) || 1.0;
    }

    setLoop(enabled) {
        this.isLoop = !!enabled;
    }

    seek(index) {
        this.currentIndex = Math.max(0, Math.min(this.stepsN.length - 1, index));
        this.updateStep(this.currentIndex);
    }

    updateStep(index) {
        const n = this.stepsN[index];
        const data = riemann_derecho(n);

        this.history = [];
        for (let i = 0; i <= index; i++) {
            const stepN = this.stepsN[i];
            const stepData = riemann_derecho(stepN);
            this.history.push({
                n: stepN,
                area: stepData.area_riemann,
                err_abs: stepData.err_abs,
                err_pct: stepData.err_pct
            });
        }

        this.airfoil.render(data);
        this.chart.setData(this.history, data.area_exacta);

        if (this.onUpdate) {
            this.onUpdate({
                n: n,
                data: data,
                currentIndex: index,
                totalSteps: this.stepsN.length,
                progress: index / (this.stepsN.length - 1)
            });
        }
    }

    loop(timestamp) {
        if (!this.isPlaying) return;

        const delta = timestamp - this.lastFrameTime;
        const targetInterval = this.stepIntervalMs / this.speed;

        if (delta >= targetInterval) {
            this.lastFrameTime = timestamp;

            if (this.currentIndex < this.stepsN.length - 1) {
                this.currentIndex++;
                this.updateStep(this.currentIndex);
            } else {
                if (this.isLoop) {
                    this.currentIndex = 0;
                    this.updateStep(0);
                } else {
                    this.pause();
                    return;
                }
            }
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}
