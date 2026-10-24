# Proyecto_Limites: Aproximación del Área NACA 0012 por Sumas de Riemann

Este repositorio contiene la implementación matemática, computacional e interactiva para el cálculo del área transversal del perfil aerodinámico **NACA 0012** mediante **Sumas de Riemann con extremos derechos** y el estudio de su **convergencia asintótica al valor analítico exacto** ($\lim_{n \to \infty} A_n = A_{\mathrm{exacta}}$).

---

## Estructura del Repositorio

* [`Maqueta digital/`](./Maqueta%20digital/): Aplicación web interactiva tipo SPA (Single Page Application) en HTML5, CSS3 y Vanilla JavaScript.
  * [`index.html`](./Maqueta%20digital/index.html): Maqueta interactiva con pestañas de Explorador Manual y Simulador de Convergencia en Pantalla Dividida.
  * [**`DESCRIPCION_ARTEFACTO.md`**](./Maqueta%20digital/DESCRIPCION_ARTEFACTO.md): **Memoria descriptiva y técnica completa del artefacto web**, tecnologías utilizadas, fundamentos de cálculo y aerodinámica, y validación numérica.
* [`Riemann/`](./Riemann/): Scripts de cómputo numérico y generación de gráficos en Python.
  * [`naca0012_riemann.py`](./Riemann/naca0012_riemann.py): Genera gráficos a 200 DPI y reportes de error para cualquier partición $n$ (soporta `input()` interactivo y argumentos por consola como `python naca0012_riemann.py 4`).
  * [`convergencia_riemann.py`](./Riemann/convergencia_riemann.py): Script de estudio asintótico desde $n=2$ hasta $n=10\,000$ con tabla comparativa y curvas en escala logarítmica.

---

## Resultados Clave

* **Área analítica exacta:** $A_{\mathrm{ref}} \approx 0.08221000 \, c^2$ (para cuerda $c=1.0$, espesor $t=12\%$).
* **Fórmula de Riemann (Extremo Derecho):**
  $$A_{\mathrm{Riemann}}(n) = 2 \sum_{i=1}^n y_t(i \cdot \Delta x) \cdot \Delta x, \quad \Delta x = \frac{c}{n}$$
* **Error para $n=4$:** $11.680\%$ ($A_4 = 0.07260787$).
* **Error para $n=30$:** $0.512\%$ ($A_{30} = 0.08178927$).
* **Error para $n=1\,000$:** $0.001\%$ ($A_{1000} = 0.08220898$).
