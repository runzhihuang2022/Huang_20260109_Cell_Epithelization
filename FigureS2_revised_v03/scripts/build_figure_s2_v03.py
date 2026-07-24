from __future__ import annotations

import math
from itertools import combinations

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.stats import gaussian_kde, kruskal, mannwhitneyu, spearmanr
from statsmodels.stats.multitest import multipletests

import build_figure_s2_v01 as base


ROOT = base.ROOT
SOURCE_DATA = base.SOURCE_DATA
OUT_VECTOR = base.OUT_VECTOR
OUT_RASTER = base.OUT_RASTER

EXCLUDED_MAIN_FIGURE2A = {"SAC_SG_Dark", "SAC_SG_Progenitor", "KC_Spinous_Mig"}
CELL_COLORS = (
    pd.read_csv(SOURCE_DATA / "FigureS2_cell_state_colors.csv")
    .set_index("cell_type")["color"]
    .to_dict()
)


def cell_compartment(cell_type: str) -> str:
    if cell_type.startswith(("KC_", "SAC_")) or cell_type == "Melanocyte":
        return "Other KC/SAC"
    if cell_type.startswith(("Fib_", "Endo_")) or cell_type in {"Pericyte", "Schwann"}:
        return "Fib/Endo"
    return "Immune"


def collect_cell_section_data(cached: dict[str, dict]) -> tuple[list[str], pd.DataFrame, pd.DataFrame]:
    observed = set()
    for sample in cached.values():
        observed.update(map(str, np.unique(sample["labels"])))
    cells = [
        cell
        for cell in base.CELL_ORDER
        if cell in observed and cell not in EXCLUDED_MAIN_FIGURE2A
    ]
    extras = sorted(observed - set(cells) - EXCLUDED_MAIN_FIGURE2A)
    cells.extend(extras)

    rows: list[dict] = []
    for cell in cells:
        for sample_key, spec in base.SAMPLES.items():
            data = cached[sample_key]
            keep = data["labels"] == cell
            rows.append(
                {
                    "cell_type": cell,
                    "compartment": cell_compartment(cell),
                    "sample_key": sample_key,
                    "sample_id": spec["sample_id"],
                    "day": spec["day"],
                    "n_bins": int(keep.sum()),
                    "median_x_um": float(np.median(data["x_um"][keep])) if keep.any() else np.nan,
                    "median_depth": float(np.median(data["depth"][keep])) if keep.any() else np.nan,
                }
            )
    section_df = pd.DataFrame(rows)
    section_df.to_csv(SOURCE_DATA / "FigureS2AB_per_cell_section_trajectories.csv", index=False)

    stats_rows: list[dict] = []
    for cell in cells:
        sub = section_df[section_df["cell_type"].eq(cell)]
        for metric in ("median_x_um", "median_depth"):
            valid = sub.dropna(subset=[metric])
            day_arrays = [
                valid.loc[valid["day"].eq(day), metric].to_numpy()
                for day in sorted(valid["day"].unique())
            ]
            day_arrays = [arr for arr in day_arrays if len(arr)]
            if len(day_arrays) >= 2 and len(valid) >= 3:
                kw_stat, kw_p = kruskal(*day_arrays)
                rho, rho_p = spearmanr(valid["day"], valid[metric])
            else:
                kw_stat = kw_p = rho = rho_p = np.nan
            stats_rows.append(
                {
                    "cell_type": cell,
                    "compartment": cell_compartment(cell),
                    "metric": metric,
                    "n_sections": len(valid),
                    "kruskal_statistic": kw_stat,
                    "kruskal_p": kw_p,
                    "spearman_rho": rho,
                    "spearman_p": rho_p,
                }
            )
    stats = pd.DataFrame(stats_rows)
    for p_col, q_col in (("kruskal_p", "kruskal_fdr"), ("spearman_p", "spearman_fdr")):
        stats[q_col] = np.nan
        valid = stats[p_col].notna()
        stats.loc[valid, q_col] = multipletests(stats.loc[valid, p_col], method="fdr_bh")[1]
    stats.to_csv(SOURCE_DATA / "FigureS2B_per_cell_statistics.csv", index=False)

    pairwise_rows: list[dict] = []
    for cell in cells:
        sub = section_df[section_df["cell_type"].eq(cell)]
        for metric in ("median_x_um", "median_depth"):
            valid = sub.dropna(subset=[metric])
            days = sorted(valid["day"].unique())
            for day_1, day_2 in combinations(days, 2):
                values_1 = valid.loc[valid["day"].eq(day_1), metric].to_numpy(dtype=float)
                values_2 = valid.loc[valid["day"].eq(day_2), metric].to_numpy(dtype=float)
                if len(values_1) and len(values_2):
                    statistic, p_value = mannwhitneyu(
                        values_1, values_2, alternative="two-sided", method="auto"
                    )
                else:
                    statistic = p_value = np.nan
                pairwise_rows.append(
                    {
                        "cell_type": cell,
                        "compartment": cell_compartment(cell),
                        "metric": metric,
                        "day_1": int(day_1),
                        "day_2": int(day_2),
                        "n_sections_day_1": len(values_1),
                        "n_sections_day_2": len(values_2),
                        "mannwhitney_u": statistic,
                        "p_value": p_value,
                    }
                )
    pairwise = pd.DataFrame(pairwise_rows)
    pairwise["fdr_bh"] = np.nan
    valid = pairwise["p_value"].notna()
    pairwise.loc[valid, "fdr_bh"] = multipletests(
        pairwise.loc[valid, "p_value"], method="fdr_bh"
    )[1]
    pairwise["significant_fdr_0.05"] = pairwise["fdr_bh"] < 0.05
    pairwise.to_csv(
        SOURCE_DATA / "FigureS2B_timepoint_pairwise_statistics.csv", index=False
    )
    return cells, section_df, stats


def significance(q: float) -> str:
    if not np.isfinite(q):
        return "NA"
    if q < 0.001:
        return "***"
    if q < 0.01:
        return "**"
    if q < 0.05:
        return "*"
    return "ns"


def density_scatter(ax: plt.Axes, x: np.ndarray, y: np.ndarray, rng: np.random.Generator) -> None:
    if len(x) == 0:
        return
    n_show = min(len(x), 190)
    idx = rng.choice(len(x), n_show, replace=False)
    xx, yy = x[idx], y[idx]
    if len(xx) >= 8:
        try:
            z = gaussian_kde(np.vstack([xx, yy]))(np.vstack([xx, yy]))
            order = np.argsort(z)
            ax.scatter(xx[order], yy[order], c=z[order], cmap="plasma", s=0.65, linewidths=0, alpha=0.95)
            return
        except (np.linalg.LinAlgError, ValueError):
            pass
    ax.scatter(xx, yy, color="#6A3D9A", s=0.65, linewidths=0, alpha=0.8)


def draw_spatial_cell_atlas(
    fig: plt.Figure,
    rect: list[float],
    cached: dict[str, dict],
    cells: list[str],
) -> tuple[list[float], float]:
    x0, y0, width, height = rect
    label_w = 0.105
    map_gap = 0.003
    map_w = (width - label_w - map_gap * 5) / 6
    row_h = height / len(cells)
    rng = np.random.default_rng(20260724)

    for row, cell in enumerate(cells):
        bottom = y0 + height - (row + 1) * row_h
        compartment = cell_compartment(cell)
        color = base.GROUP_COLORS[compartment]
        fig.text(
            x0 + label_w - 0.006,
            bottom + row_h * 0.50,
            cell,
            ha="right",
            va="center",
            fontsize=6,
            color=color,
            fontweight="bold" if cell in {"Fib_K14"} else "normal",
        )
        fig.add_artist(
            plt.Line2D(
                [x0 + 0.002, x0 + width],
                [bottom, bottom],
                transform=fig.transFigure,
                color="#E6E6E6",
                lw=0.28,
                zorder=0,
            )
        )
        fig.add_artist(
            plt.Line2D(
                [x0 + 0.003, x0 + 0.003],
                [bottom + row_h * 0.15, bottom + row_h * 0.85],
                transform=fig.transFigure,
                color=color,
                lw=1.8,
            )
        )

        for col, sample_key in enumerate(base.DISPLAY_SAMPLES):
            left = x0 + label_w + col * (map_w + map_gap)
            ax = fig.add_axes([left, bottom + row_h * 0.08, map_w, row_h * 0.84])
            data = cached[sample_key]
            keep = data["labels"] == cell
            all_x = data["x_um"]
            lim = max(float(np.quantile(np.abs(all_x[np.isfinite(all_x)]), 0.985)), 500)
            base.draw_background(ax, -lim, lim)
            density_scatter(ax, data["x_um"][keep], data["depth"][keep], rng)
            ax.set_xlim(-lim, lim)
            ax.set_ylim(1.02, -0.02)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_linewidth(0.28)
                spine.set_color("#808080")
            if row == 0:
                for x_pos, region in zip((0.12, 0.50, 0.88), base.REGIONS):
                    ax.text(
                        x_pos,
                        0.90,
                        region,
                        transform=ax.transAxes,
                        rotation=30,
                        rotation_mode="anchor",
                        ha="center",
                        va="top",
                        fontsize=6,
                        color=base.REGION_COLORS[region],
                        fontweight="bold",
                    )

    sample_centers = [
        x0 + label_w + col * (map_w + map_gap) + map_w / 2
        for col in range(6)
    ]
    return sample_centers, row_h


def draw_cell_statistics(
    fig: plt.Figure,
    rect: list[float],
    cells: list[str],
    section_df: pd.DataFrame,
    stats: pd.DataFrame,
) -> None:
    x0, y0, width, height = rect
    axis_gap = 0.018
    stat_w = 0.052
    axis_w = (width - stat_w - axis_gap) / 2
    row_h = height / len(cells)
    days = np.array([5, 12, 19, 26, 60])

    for row, cell in enumerate(cells):
        bottom = y0 + height - (row + 1) * row_h
        color = CELL_COLORS.get(cell, base.GROUP_COLORS[cell_compartment(cell)])
        sub = section_df[section_df["cell_type"].eq(cell)]
        for col, metric in enumerate(("median_x_um", "median_depth")):
            left = x0 + col * (axis_w + axis_gap)
            ax = fig.add_axes([left, bottom + row_h * 0.10, axis_w, row_h * 0.80])
            summary = sub.groupby("day")[metric].median().reindex(days)
            values = summary.to_numpy(dtype=float)
            valid = np.isfinite(values)
            scale = 0.001 if metric == "median_x_um" else 1.0
            ax.plot(
                days[valid],
                values[valid] * scale,
                "o-",
                color=color,
                markeredgecolor="#333333",
                markeredgewidth=0.18,
                ms=1.35,
                lw=0.72,
            )
            if metric == "median_x_um":
                ax.axhline(0, color="#999999", lw=0.25, ls="--")
            else:
                ax.invert_yaxis()
            ax.set_xlim(3, 62)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)
        fig.text(
            x0 + width - stat_w / 2,
            bottom + row_h * 0.50,
            f"n={int(sub['n_bins'].sum()):,}",
            ha="center",
            va="center",
            fontsize=6,
            color="#555555",
        )
        fig.add_artist(
            plt.Line2D(
                [x0, x0 + width],
                [bottom, bottom],
                transform=fig.transFigure,
                color="#E6E6E6",
                lw=0.28,
                zorder=0,
            )
        )


def build_figure() -> None:
    cached, _, _ = base.read_all_samples()
    cells, section_df, stats = collect_cell_section_data(cached)
    if len(cells) != 44:
        raise RuntimeError(f"Expected 44 supplementary cell states, found {len(cells)}: {cells}")

    enrichment = base.read_enrichment()
    pairwise = base.target_pairwise(enrichment)

    fig = plt.figure(figsize=(8.2677165, 11.692913), facecolor="white")

    atlas_rect = [0.035, 0.345, 0.635, 0.610]
    stats_rect = [0.695, 0.345, 0.270, 0.610]
    centers, _ = draw_spatial_cell_atlas(fig, atlas_rect, cached, cells)
    draw_cell_statistics(fig, stats_rect, cells, section_df, stats)

    for center, sample_key in zip(centers, base.DISPLAY_SAMPLES):
        title = cached[sample_key]["title"]
        fig.text(center, 0.965, title, ha="center", va="bottom", fontsize=6, fontweight="bold", linespacing=0.90)
    fig.text(
        atlas_rect[0] + 0.105 / 2,
        0.966,
        "Cell state",
        ha="center",
        va="bottom",
        fontsize=7,
        fontweight="bold",
    )
    fig.text(stats_rect[0] + 0.055, 0.966, "Horizontal trajectory", ha="center", va="bottom", fontsize=6.5, fontweight="bold")
    fig.text(stats_rect[0] + 0.180, 0.966, "Vertical trajectory", ha="center", va="bottom", fontsize=6.5, fontweight="bold")
    fig.text(stats_rect[0] + stats_rect[2] - 0.019, 0.966, "Bins", ha="center", va="bottom", fontsize=6.5, fontweight="bold")

    legend_x = atlas_rect[0]
    for compartment in ("Other KC/SAC", "Fib/Endo", "Immune"):
        fig.text(legend_x, 0.980, compartment, ha="left", va="bottom", fontsize=6.5, fontweight="bold", color=base.GROUP_COLORS[compartment])
        legend_x += 0.115
    fig.text(
        0.695,
        0.980,
        "Pairwise time-point tests: no FDR q<0.05",
        ha="left",
        va="bottom",
        fontsize=6,
    )

    base.add_panel_letter(fig, 0.008, 0.992, "A")
    base.add_panel_letter(fig, 0.675, 0.992, "B")

    base.draw_panel_c(fig, [0.035, 0.045, 0.615, 0.255], enrichment)
    base.add_panel_letter(fig, 0.008, 0.315, "C")
    base.draw_panel_d(fig, [0.700, 0.045, 0.255, 0.255], enrichment, pairwise)
    base.add_panel_letter(fig, 0.662, 0.315, "D")

    svg = OUT_VECTOR / "FigureS2_revised_v03_editable.svg"
    pdf = OUT_VECTOR / "FigureS2_revised_v03.pdf"
    png = OUT_RASTER / "FigureS2_revised_v03_600dpi.png"
    tiff = OUT_RASTER / "FigureS2_revised_v03_600dpi.tiff"
    fig.savefig(svg, format="svg", facecolor="white")
    fig.savefig(pdf, format="pdf", facecolor="white", dpi=600)
    fig.savefig(png, format="png", facecolor="white", dpi=600)
    fig.savefig(tiff, format="tiff", facecolor="white", dpi=600, pil_kwargs={"compression": "tiff_lzw"})
    plt.close(fig)

    (ROOT / "source_data" / "FigureS2AB_cell_state_registry.txt").write_text(
        "\n".join(cells) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    build_figure()

