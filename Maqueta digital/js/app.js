/**
 * app.js
 * Coordinador principal de la Maqueta Digital: gestión de pestañas, inputs de usuario y eventos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- GESTIÓN DE PESTAÑAS (TABS) ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');

            // Redimensionar canvas tras el cambio de pestaña para asegurar nitidez y contención perfecta
            setTimeout(() => {
                if (targetId === 'tab-manual') {
                    manualAirfoil.resize();
                    updateManualView();
                } else if (targetId === 'tab-anim') {
                    animAirfoil.resize();
                    animChart.resize();
                    simulator.updateStep(simulator.currentIndex);
                }
            }, 60);
        });
    });

    // ResizeObserver para mantener los canvas contenidos al redimensionar ventanas o paneles
    const resizeObserver = new ResizeObserver(() => {
        const activeTab = document.querySelector('.tab-pane.active');
        if (activeTab && activeTab.id === 'tab-manual') {
            manualAirfoil.resize();
            updateManualView();
        } else if (activeTab && activeTab.id === 'tab-anim') {
            animAirfoil.resize();
            animChart.resize();
            simulator.updateStep(simulator.currentIndex);
        }
    });

    document.querySelectorAll('.canvas-wrapper, .split-panel, .chart-card').forEach(el => {
        resizeObserver.observe(el);
    });

    // --- PESTAÑA 1: EXPLORADOR MANUAL ---
    const manualAirfoil = new AirfoilCanvas('canvas-manual-airfoil', {
        interactiveHover: true
    });

    const sliderN = document.getElementById('slider-n');
    const inputN = document.getElementById('input-n');
    const badgeDx = document.getElementById('metric-dx');
    const badgeExact = document.getElementById('metric-exact');
    const badgeRiem = document.getElementById('metric-riemann');
    const badgeErrAbs = document.getElementById('metric-err-abs');
    const badgeErrPct = document.getElementById('metric-err-pct');
    const tooltip = document.getElementById('canvas-tooltip');

    // Checkboxes de visualización
    const chkAirfoil = document.getElementById('chk-airfoil');
    const chkRects = document.getElementById('chk-rects');
    const chkPoints = document.getElementById('chk-points');
    const chkChord = document.getElementById('chk-chord');

    function updateManualView() {
        const n = parseInt(sliderN.value) || 30;
        const data = riemann_derecho(n);

        badgeDx.textContent = data.dx.toFixed(6);
        badgeExact.textContent = data.area_exacta.toFixed(8);
        badgeRiem.textContent = data.area_riemann.toFixed(8);
        badgeErrAbs.textContent = data.err_abs.toExponential(4);
        badgeErrPct.textContent = data.err_pct.toFixed(4) + '%';

        manualAirfoil.options.showAirfoil = chkAirfoil.checked;
        manualAirfoil.options.showRectangles = chkRects.checked;
        manualAirfoil.options.showSamplePoints = chkPoints.checked;
        manualAirfoil.options.showChordLine = chkChord.checked;
        manualAirfoil.render(data);
    }

    sliderN.addEventListener('input', (e) => {
        inputN.value = e.target.value;
        updateManualView();
    });

    inputN.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 2) val = 2;
        if (val > 1000) val = 1000;
        sliderN.value = val;
        inputN.value = val;
        updateManualView();
    });

    document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const presetVal = chip.getAttribute('data-n');
            sliderN.value = presetVal;
            inputN.value = presetVal;
            updateManualView();
        });
    });

    [chkAirfoil, chkRects, chkPoints, chkChord].forEach(chk => {
        chk.addEventListener('change', updateManualView);
    });

    manualAirfoil.onHover = (rect, mousePos) => {
        if (!rect) {
            tooltip.style.opacity = '0';
            return;
        }
        tooltip.style.opacity = '1';
        tooltip.style.left = `${mousePos.clientX + 14}px`;
        tooltip.style.top = `${mousePos.clientY + 14}px`;
        tooltip.innerHTML = `
            <div class="tooltip-title">Subintervalo #${rect.index}</div>
            <div><strong>Rango x:</strong> [${rect.x_left.toFixed(4)}, ${rect.x_right.toFixed(4)}]</div>
            <div><strong>Extremo der. (x_i):</strong> ${rect.x_right.toFixed(4)}</div>
            <div><strong>Semiespesor y_t:</strong> ${rect.yt.toFixed(5)}</div>
            <div><strong>Altura total (2*y_t):</strong> ${(2 * rect.yt).toFixed(5)}</div>
            <div><strong>Área rect.:</strong> ${rect.area_rect.toFixed(6)}</div>
        `;
    };

    // --- PESTAÑA 2: SIMULADOR DUAL CONVERGENCIA ---
    const animAirfoil = new AirfoilCanvas('canvas-anim-airfoil', {
        interactiveHover: false
    });
    const animChart = new ConvergenceChartManager('canvas-chart-area', 'canvas-chart-error');
    const simulator = new RiemannSimulator(animAirfoil, animChart);

    const btnPlay = document.getElementById('btn-play');
    const btnStepBack = document.getElementById('btn-step-back');
    const btnStepFwd = document.getElementById('btn-step-fwd');
    const btnReset = document.getElementById('btn-reset');
    const speedSelect = document.getElementById('select-speed');
    const loopChk = document.getElementById('chk-loop');
    const timeline = document.getElementById('anim-timeline');

    const animN = document.getElementById('anim-val-n');
    const animDx = document.getElementById('anim-val-dx');
    const animRiem = document.getElementById('anim-val-riem');
    const animErr = document.getElementById('anim-val-err');

    btnPlay.addEventListener('click', () => simulator.toggle());
    btnStepBack.addEventListener('click', () => simulator.stepBackward());
    btnStepFwd.addEventListener('click', () => simulator.stepForward());
    btnReset.addEventListener('click', () => simulator.reset());

    speedSelect.addEventListener('change', (e) => simulator.setSpeed(e.target.value));
    loopChk.addEventListener('change', (e) => simulator.setLoop(e.target.checked));

    timeline.addEventListener('input', (e) => {
        const stepIdx = Math.round((e.target.value / 100) * (simulator.stepsN.length - 1));
        simulator.seek(stepIdx);
    });

    simulator.onStateChange = (state) => {
        btnPlay.innerHTML = state.isPlaying
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pausar`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Reproducir`;
    };

    simulator.onUpdate = (info) => {
        animN.textContent = info.n;
        animDx.textContent = info.data.dx.toFixed(6);
        animRiem.textContent = info.data.area_riemann.toFixed(7);
        animErr.textContent = `${info.data.err_pct.toFixed(4)}%`;
        timeline.value = Math.round(info.progress * 100);
    };

    // Renderizar pestaña activa inicial
    updateManualView();
});
