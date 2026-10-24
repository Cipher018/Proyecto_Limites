# Plan de Acción: Maqueta Digital Interactiva NACA 0012 & Sumas de Riemann

## 1. Visión General del Proyecto
Crear una aplicación web interactiva independiente (*Single Page Application* en HTML5, CSS3 y Vanilla JavaScript) alojada en la carpeta `Maqueta digital/`. La aplicación servirá como laboratorio visual pedagógico e ingenieril para estudiar el cálculo del área del perfil aerodinámico simétrico **NACA 0012** mediante **Sumas de Riemann con extremos derechos** y su convergencia asintótica al valor exacto $\lim_{n \to \infty} A_n = A_{\mathrm{exacta}}$.

---

## 2. Arquitectura de Navegación y Módulos

La maqueta contará con una barra superior de navegación por pestañas (*tabs*):

```
+-----------------------------------------------------------------------------------+
|  [Logo / Título]  NACA 0012 - Laboratorio de Integración por Sumas de Riemann     |
|  [Tab 1: Explorador Interactivo]        [Tab 2: Animación y Convergencia Dinámica]|
+-----------------------------------------------------------------------------------+
```

### Pestaña 1: "Explorador Interactivo" (Modo Manual)
* **Objetivo:** Permitir al usuario experimentar libremente con el número de subdivisiones $n$ y parámetros del perfil.
* **Componentes:**
  * **Panel de Control Lateral / Superior:**
    * *Slider* interactivo de subdivisiones $n$ (rango: 2 a 500, con inputs numéricos y presets rápidos: $n=5, 10, 30, 50, 100, 300$).
    * Selector opcional de visualización: mostrar/ocultar contorno continuo real, rectángulos superiores e inferiores, puntos de muestra en extremo derecho ($x_i, y_i$), línea de cuerda media ($y=0$).
    * Opción para ajustar espesor $t$ (por defecto $12\% = 0.12$) y cuerda $c$ ($1.0$).
  * **Lienzo Principal (Canvas Interactivo / SVG Reactivo):**
    * Renderizado en tiempo real a 60 FPS del perfil aerodinámico y de cada rectángulo de Riemann con su altura correspondiente al extremo derecho $x_i = i \cdot \Delta x$.
    * Efecto *hover/tooltip* sobre los rectángulos mostrando: índice de intervalo $i$, coordenadas $(x_i, y_i)$, ancho $\Delta x$ y área local del rectángulo.
  * **HUD / Tarjetas de Métricas en Tiempo Real:**
    * $A_{\mathrm{exacta}}$ (Integral analítica directa).
    * $A_{\mathrm{Riemann}}$ (Suma con extremo derecho).
    * Error Absoluto $|A_{\mathrm{Riem}} - A_{\mathrm{ref}}|$.
    * Error Relativo Porcentual ($\%$).
    * Ancho de paso $\Delta x = c / n$.

---

### Pestaña 2: "Simulador / Animación de Convergencia" (Modo Video/GIF Sincronizado)
* **Objetivo:** Demostración visual automatizada y sincronizada de la convergencia en pantalla dividida (*Side-by-Side*).
* **Distribución de Pantalla Dividida (Split Screen):**
  * **Lado Izquierdo (Geometría):** Renderizado animado del perfil NACA 0012 donde los rectángulos se van haciendo cada vez más delgados a medida que $n$ avanza (desde $n=2$ hasta $n=1000$ o $10^4$).
  * **Lado Derecho (Gráfica de Convergencia):** Curva dinámica en tiempo real que traza simultáneamente:
    * El valor del área aproximada acercándose a la asíntota horizontal del valor exacto.
    * Gráfica secundaria o panel inferior con la curva logarítmica del decaimiento del error.
* **Controles Tipo Reproductor Multimedia (Video/GIF):**
  * Botones: **Play / Pause**, **Reiniciar (Reset)**, **Paso a paso (Step forward/backward)**.
  * Barra de progreso / tiempo de la animación.
  * Selector de velocidad: $0.5\times$, $1\times$, $2\times$, $5\times$.
  * Selector de escala de avance: Lineal o Exponencial/Geométrica (para apreciar tanto los saltos iniciales $n=2\to20$ como la aproximación fina hasta $10^4$).
  * Botón de bucle (*Loop/GIF mode*) para presentaciones o captura continua.

---

## 3. Modelo Físico y Matemático

1. **Ecuación del Semiespesor NACA 0012:**
   $$y_t(x) = 5 t c \left( 0.2969\sqrt{\frac{x}{c}} - 0.1260\left(\frac{x}{c}\right) - 0.3516\left(\frac{x}{c}\right)^2 + 0.2843\left(\frac{x}{c}\right)^3 - 0.1015\left(\frac{x}{c}\right)^4 \right)$$
2. **Partición de Extremo Derecho:**
   $$\Delta x = \frac{c}{n}, \quad x_i = i \cdot \Delta x \quad (i = 1, 2, \dots, n)$$
3. **Suma de Riemann Simétrica:**
   $$A_{\mathrm{Riemann}}(n) = 2 \sum_{i=1}^n y_t(x_i) \cdot \Delta x$$
4. **Valor Analítico Exacto:**
   $$A_{\mathrm{ref}} = 2 \int_0^c y_t(x)\, dx = 10 t c^2 \left[ \frac{2}{3}(0.2969) - \frac{1}{2}(0.1260) - \frac{1}{3}(0.3516) + \frac{1}{4}(0.2843) - \frac{1}{5}(0.1015) \right] \approx 0.08221000 \, c^2$$

---

## 4. Diseño y Estética Visual

* **Sistema de Diseño:** Inspirado en consolas aeronáuticas y de análisis numérico moderno (*Dark Mode* / *Glassmorphism* refinado).
* **Paleta de Colores:**
  * Fondo: Gradientes oscuros profundos (`#0f172a`, `#1e293b`).
  * Perfil Alar: Azul cian brillante aeroespacial (`#38bdf8`) con resplandor sutil.
  * Rectángulos de Riemann: Gradiente ámbar/naranja traslúcido (`#f59e0b`, `alpha: 0.35`) con bordes nítidos (`#d97706`).
  * Puntos de evaluación (extremos derechos): Rubí/carmesí de alto contraste (`#ef4444`).
  * Curva analítica y líneas de referencia: Verde esmeralda fluorescente (`#10b981`).
* **Tipografía:** *Inter* y fuentes monoespaciadas (*JetBrains Mono* / *Fira Code*) para métricas numéricas legibles y sin saltos visuales durante la animación.
* **Renderizado:** HTML5 Canvas de alta resolución con soporte Retina/DPI escalable para que las líneas finas de los rectángulos no sufran pixelación incluso con $n = 1000$.

---

## 5. Estructura de Archivos en `Maqueta digital/`

```
Maqueta digital/
├── index.html           # Estructura semántica, tabs y modales
├── css/
│   └── styles.css       # Diseño visual, glassmorphism, responsive y animaciones
└── js/
    ├── naca_math.js     # Motor matemático (fórmula NACA, integral analítica, Riemann)
    ├── canvas_airfoil.js# Renderizado del perfil y rectángulos en HTML5 Canvas
    ├── canvas_chart.js  # Motor de graficado dinámico de convergencia y errores
    ├── simulator.js     # Controlador de la animación/reproductor split-screen
    └── app.js           # Inicialización, navegación por tabs y gestión de eventos
```

---

## 6. Fases de Ejecución

1. **Fase 1: Estructura y Estilos Base**
   - Creación de `index.html` con sistema de pestañas y contenedores de gráficos.
   - Creación de `styles.css` con el sistema de tokens, temas oscuros, layout responsivo y controles UI.
2. **Fase 2: Motor de Cálculo y Canvas del Perfil**
   - Implementar `naca_math.js` con las funciones vectorizadas en JS para semialtura, integral analítica y sumas por extremo derecho.
   - Implementar `canvas_airfoil.js` con dibujo optimizado, relación de aspecto isométrica 1:1, autoescalado de DPI y *tooltips*.
3. **Fase 3: Motor de Gráficos de Convergencia**
   - Implementar `canvas_chart.js` para dibujar la curva asintótica y el decaimiento de error sin librerías pesadas externas, garantizando máximo rendimiento y carga instantánea offline.
4. **Fase 4: Pestaña de Animación Sincronizada (Reproductor Dual)**
   - Implementar `simulator.js` con bucle de animación (`requestAnimationFrame`), control de velocidad, interpolación de $n$ y reproducción continua tipo video/GIF.
5. **Fase 5: Pruebas, Verificación y Refinamiento**
   - Validar precisión numérica contra los scripts Python de referencia.
   - Probar fluidez a 60 FPS en pantalla dividida y verificar responsividad.
