/**
 * naca_math.js
 * Motor matemático para el perfil alar NACA 0012 y Sumas de Riemann (Extremo Derecho).
 */

const NACA_CONSTANTS = {
    DEFAULT_T: 0.12, // 12% espesor relativo
    DEFAULT_C: 1.0,  // Cuerda unitaria
    A0: 0.2969,
    A1: -0.1260,
    A2: -0.3516,
    A3: 0.2843,
    A4: -0.1015
};

/**
 * Calcula el semiespesor yt(x) para una posición x dada [0, c].
 */
function naca0012_yt(x, t = NACA_CONSTANTS.DEFAULT_T, c = NACA_CONSTANTS.DEFAULT_C) {
    if (x < 0) return 0;
    if (x > c) return 0;
    const xn = x / c;
    return 5.0 * t * c * (
        NACA_CONSTANTS.A0 * Math.sqrt(xn)
        + NACA_CONSTANTS.A1 * xn
        + NACA_CONSTANTS.A2 * Math.pow(xn, 2)
        + NACA_CONSTANTS.A3 * Math.pow(xn, 3)
        + NACA_CONSTANTS.A4 * Math.pow(xn, 4)
    );
}

/**
 * Calcula el área exacta del perfil mediante integración analítica directa.
 * A_ref = 2 * integral_0^c yt(x) dx
 */
function area_exacta(t = NACA_CONSTANTS.DEFAULT_T, c = NACA_CONSTANTS.DEFAULT_C) {
    const integral_yt = 5.0 * t * Math.pow(c, 2) * (
        NACA_CONSTANTS.A0 * (2.0 / 3.0)
        + NACA_CONSTANTS.A1 * (1.0 / 2.0)
        + NACA_CONSTANTS.A2 * (1.0 / 3.0)
        + NACA_CONSTANTS.A3 * (1.0 / 4.0)
        + NACA_CONSTANTS.A4 * (1.0 / 5.0)
    );
    return 2.0 * integral_yt;
}

/**
 * Calcula la suma de Riemann usando exclusivamente Extremos Derechos.
 * Retorna el área calculada, los rectángulos para visualización y métricas de error.
 */
function riemann_derecho(n, t = NACA_CONSTANTS.DEFAULT_T, c = NACA_CONSTANTS.DEFAULT_C) {
    const dx = c / n;
    const rectangulos = [];
    let suma_yt = 0;

    for (let i = 1; i <= n; i++) {
        const x_right = i * dx;
        const x_left = (i - 1) * dx;
        const yt = naca0012_yt(x_right, t, c);
        suma_yt += yt;

        rectangulos.push({
            index: i,
            x_left: x_left,
            x_right: x_right,
            dx: dx,
            yt: yt,
            area_rect: 2.0 * yt * dx
        });
    }

    const area_riemann = 2.0 * suma_yt * dx;
    const area_ref = area_exacta(t, c);
    const err_abs = Math.abs(area_riemann - area_ref);
    const err_pct = (err_abs / area_ref) * 100.0;

    return {
        n: n,
        dx: dx,
        t: t,
        c: c,
        area_riemann: area_riemann,
        area_exacta: area_ref,
        err_abs: err_abs,
        err_pct: err_pct,
        rectangulos: rectangulos
    };
}
