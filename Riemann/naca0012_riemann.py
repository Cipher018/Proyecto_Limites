"""
Cálculo de Área de un Perfil Alar NACA 0012 mediante Sumas de Riemann (Extremo Derecho).
Proyecto: Proyecto_Limites
"""

import sys
import argparse
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Parámetros estándar NACA 0012 (t = 0.12, cuerda unitaria c = 1.0)
T = 0.12
C = 1.0

def naca0012_yt(x, t=T, c=C):
    """Calcula el semiespesor yt(x) del perfil NACA 0012."""
    xn = np.clip(x / c, 0.0, 1.0)
    return 5.0 * t * c * (
        0.2969 * np.sqrt(xn)
        - 0.1260 * xn
        - 0.3516 * (xn ** 2)
        + 0.2843 * (xn ** 3)
        - 0.1015 * (xn ** 4)
    )

def area_exacta(t=T, c=C):
    """Área analítica por integración directa: 2 * integral_0^c yt(x) dx."""
    integral_yt = 5.0 * t * (c ** 2) * (
        0.2969 * (2.0 / 3.0)
        - 0.1260 * (1.0 / 2.0)
        - 0.3516 * (1.0 / 3.0)
        + 0.2843 * (1.0 / 4.0)
        - 0.1015 * (1.0 / 5.0)
    )
    return 2.0 * integral_yt

def riemann_derecho(n, t=T, c=C):
    """Calcula la suma de Riemann usando únicamente extremos derechos."""
    dx = c / n
    x_edges = np.linspace(0.0, c, n + 1)
    x_right = x_edges[1:]               # Extremos derechos de cada subintervalo
    yt_right = naca0012_yt(x_right, t, c)
    area = 2.0 * np.sum(yt_right * dx)  # Perfil simétrico (superior + inferior)
    return area, x_edges, x_right, yt_right, dx

def graficar(n, output_path='naca0012_riemann.png', mostrar=False):
    """Grafica el perfil alar, los rectángulos de Riemann (derechos) y muestra el resumen."""
    a_ref = area_exacta()
    a_riem, x_edges, x_right, yt_right, dx = riemann_derecho(n)
    err_abs = abs(a_riem - a_ref)
    err_pct = (err_abs / a_ref) * 100.0

    # Curva suave del perfil
    x_smooth = np.linspace(0.0, C, 600)
    yt_smooth = naca0012_yt(x_smooth)

    fig, ax = plt.subplots(figsize=(12, 6), dpi=200)

    # Dibujar rectángulos de extremos derechos (superior e inferior)
    for i in range(n):
        xi = x_edges[i]
        yi = yt_right[i]
        ax.add_patch(patches.Rectangle((xi, 0), dx, yi, facecolor='#f39c12', edgecolor='#d35400', alpha=0.4,
                                       label='Rectángulos Riemann (Extremo Derecho)' if i == 0 else ""))
        ax.add_patch(patches.Rectangle((xi, -yi), dx, yi, facecolor='#f39c12', edgecolor='#d35400', alpha=0.4))

    # Puntos evaluados en los extremos derechos
    ax.scatter(x_right, yt_right, color='#c0392b', s=16, zorder=5, label='Extremos derechos $y_t(x_i)$')
    ax.scatter(x_right, -yt_right, color='#c0392b', s=16, zorder=5)

    # Contorno del perfil
    ax.plot(x_smooth, yt_smooth, color='#1f4e79', lw=2, label='Perfil NACA 0012')
    ax.plot(x_smooth, -yt_smooth, color='#1f4e79', lw=2)
    ax.axhline(0, color='gray', linestyle='--', lw=0.8, alpha=0.7)

    # Cuadro informativo
    info = (
        f"Particiones (n): {n}\n"
        f"Δx: {dx:.6f}\n"
        f"Área Exacta: {a_ref:.6f}\n"
        f"Área Riemann: {a_riem:.6f}\n"
        f"Error: {err_abs:.4e} ({err_pct:.3f}%)"
    )
    ax.text(0.02, 0.95, info, transform=ax.transAxes, va='top', fontsize=10,
            bbox=dict(boxstyle='round,pad=0.5', facecolor='white', edgecolor='#7f8c8d', alpha=0.9))

    ax.set_title(f"Aproximación Área NACA 0012 - Riemann Extremo Derecho (n = {n})", fontweight='bold')
    ax.set_xlabel("x / c")
    ax.set_ylabel("y / c")
    ax.set_aspect('equal')
    ax.set_xlim(-0.03, 1.03)
    ax.set_ylim(-0.16, 0.20)
    ax.grid(True, linestyle=':', alpha=0.6)
    ax.legend(loc='lower right', fontsize=9)

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight')
    print(f"[OK] Gráfico guardado en: {output_path}")

    print("\n--- REPORTE (EXTREMO DERECHO) ---")
    print(f"n = {n} | Dx = {dx:.6f}")
    print(f"Area Exacta:  {a_ref:.8f}")
    print(f"Area Riemann: {a_riem:.8f}")
    print(f"Error Absoluto: {err_abs:.6e} ({err_pct:.4f}%)\n")

    if mostrar:
        plt.show()
    plt.close()

def parse_n_val(val_str):
    """Parsea y valida el número de particiones n desde un string (admite formatos como '4' o 'n=4')."""
    if not val_str:
        return None
    val_str = str(val_str).strip()
    if val_str.lower().startswith('n='):
        val_str = val_str[2:].strip()
    try:
        val = int(val_str)
        if val > 0:
            return val
        print("[!] El número de particiones debe ser un entero positivo (> 0).")
        return None
    except ValueError:
        print(f"[!] '{val_str}' no es un número entero válido.")
        return None

def main():
    parser = argparse.ArgumentParser(description="Área NACA 0012 por Sumas de Riemann (Extremo Derecho)")
    parser.add_argument('posicional_n', nargs='?', type=str, default=None,
                        help="Número de particiones (opcional, ej: 4 o n=4)")
    parser.add_argument('-n', '--particiones', type=str, default=None,
                        help="Número de particiones (ej: -n 4)")
    parser.add_argument('-o', '--output', type=str, default='naca0012_riemann.png',
                        help="Ruta de imagen de salida (defecto: naca0012_riemann.png)")
    parser.add_argument('--show', action='store_true',
                        help="Mostrar gráfico interactivo")
    args = parser.parse_args()

    n = None
    # 1. Comprobar si se pasó por flag (-n) o por argumento posicional directo (ej: 4 o n=4)
    raw_arg = args.particiones if args.particiones is not None else args.posicional_n
    if raw_arg is not None:
        n = parse_n_val(raw_arg)

    # 2. Si no se especificó ningún argumento en la terminal, solicitar interactivamente mediante input()
    if n is None:
        try:
            entrada = input("Ingrese el número de particiones (n) [Presione Enter para 30]: ").strip()
            if entrada:
                n = parse_n_val(entrada)
            if n is None:
                n = 30
        except (EOFError, KeyboardInterrupt):
            n = 30

    print(f"\n=> Ejecutando Suma de Riemann con n = {n} particiones...")
    graficar(n=n, output_path=args.output, mostrar=args.show)

if __name__ == '__main__':
    main()
