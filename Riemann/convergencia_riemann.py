"""
Análisis de Convergencia de la Suma de Riemann (Extremo Derecho) para NACA 0012.
Evalúa valores de particiones n desde potencias bajas hasta 10^4 (10,000),
mostrando resultados en tabla comparativa y gráficos de convergencia y error.
"""

import numpy as np
import matplotlib.pyplot as plt

# Parámetros del perfil NACA 0012
T = 0.12
C = 1.0

def naca0012_yt(x, t=T, c=C):
    """Calcula la semialtura yt(x) del perfil NACA 0012."""
    xn = np.clip(x / c, 0.0, 1.0)
    return 5.0 * t * c * (
        0.2969 * np.sqrt(xn)
        - 0.1260 * xn
        - 0.3516 * (xn ** 2)
        + 0.2843 * (xn ** 3)
        - 0.1015 * (xn ** 4)
    )

def area_exacta(t=T, c=C):
    """Área analítica por integración directa."""
    integral_yt = 5.0 * t * (c ** 2) * (
        0.2969 * (2.0 / 3.0)
        - 0.1260 * (1.0 / 2.0)
        - 0.3516 * (1.0 / 3.0)
        + 0.2843 * (1.0 / 4.0)
        - 0.1015 * (1.0 / 5.0)
    )
    return 2.0 * integral_yt

def riemann_derecho(n, t=T, c=C):
    """Calcula el área con n rectángulos usando extremos derechos."""
    dx = c / n
    # Extremos derechos de cada subintervalo: x_i = i * dx para i = 1 .. n
    x_right = np.linspace(dx, c, n)
    yt_right = naca0012_yt(x_right, t, c)
    return 2.0 * np.sum(yt_right * dx)

def analizar_convergencia(limite_max=10000, output_img="Riemann/convergencia_riemann.png"):
    a_exacta = area_exacta()

    # Selección de valores de n representativos hasta 10^4
    # Incluye potencias de 10 y valores intermedios estándar
    valores_n = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, limite_max]
    
    resultados = []
    for n in valores_n:
        dx = C / n
        a_riem = riemann_derecho(n)
        err_abs = abs(a_riem - a_exacta)
        err_pct = (err_abs / a_exacta) * 100.0
        resultados.append({
            'n': n,
            'dx': dx,
            'area': a_riem,
            'err_abs': err_abs,
            'err_pct': err_pct
        })

    # Imprimir tabla en consola
    print("=" * 78)
    print("     TABLA DE CONVERGENCIA - SUMAS DE RIEMANN (EXTREMO DERECHO)")
    print(f"     Perfil: NACA 0012 | Cuerda c = {C} | Area Exacta: {a_exacta:.8f}")
    print("=" * 78)
    print(f"{'n':>7} | {'Dx':>11} | {'Area Riemann':>14} | {'Error Absoluto':>15} | {'Error (%)':>10}")
    print("-" * 78)
    for r in resultados:
        print(f"{r['n']:7d} | {r['dx']:11.6e} | {r['area']:14.8f} | {r['err_abs']:15.6e} | {r['err_pct']:9.4f}%")
    print("=" * 78)

    # Gráficos de convergencia
    n_arr = np.array([r['n'] for r in resultados])
    area_arr = np.array([r['area'] for r in resultados])
    err_abs_arr = np.array([r['err_abs'] for r in resultados])
    err_pct_arr = np.array([r['err_pct'] for r in resultados])

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5), dpi=200)

    # 1. Gráfico de Convergencia del Área hacia el valor exacto
    ax1.plot(n_arr, area_arr, 'o-', color='#e67e22', lw=1.8, ms=5, label='Suma de Riemann (Extr. Derecho)')
    ax1.axhline(a_exacta, color='#1f4e79', linestyle='--', lw=1.5, label=f'Área exacta ({a_exacta:.6f})')
    ax1.set_xscale('log')
    ax1.set_xlabel('Número de particiones (n)', fontweight='bold')
    ax1.set_ylabel('Área calculada', fontweight='bold')
    ax1.set_title('Convergencia del Área vs n', fontweight='bold')
    ax1.grid(True, which='both', linestyle=':', alpha=0.6)
    ax1.legend(loc='lower right')

    # 2. Gráfico log-log del Error Absoluto y Porcentual
    color_err = '#c0392b'
    ax2.loglog(n_arr, err_abs_arr, 's-', color=color_err, lw=1.8, ms=5, label='Error Absoluto')
    ax2.set_xlabel('Número de particiones (n)', fontweight='bold')
    ax2.set_ylabel('Error Absoluto |A_Riem - A_ref|', color=color_err, fontweight='bold')
    ax2.tick_params(axis='y', labelcolor=color_err)
    ax2.grid(True, which='both', linestyle=':', alpha=0.6)

    # Eje secundario para el error porcentual
    ax2_twin = ax2.twinx()
    color_pct = '#8e44ad'
    ax2_twin.loglog(n_arr, err_pct_arr, '^--', color=color_pct, lw=1.4, ms=5, label='Error Porcentual (%)')
    ax2_twin.set_ylabel('Error Relativo (%)', color=color_pct, fontweight='bold')
    ax2_twin.tick_params(axis='y', labelcolor=color_pct)

    ax2.set_title(r'Decaimiento del Error ($\lim_{n \to 10^4} Error = 0$)', fontweight='bold')

    plt.suptitle('Análisis Asintótico y Convergencia de Riemann - Airfoil NACA 0012', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_img, bbox_inches='tight')
    plt.close()

    print(f"\n[OK] Gráfico de convergencia guardado en: {output_img}\n")

if __name__ == '__main__':
    analizar_convergencia(limite_max=10000)
