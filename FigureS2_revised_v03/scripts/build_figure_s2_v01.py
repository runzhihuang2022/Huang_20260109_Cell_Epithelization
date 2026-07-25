from __future__ import annotations

import json
import math
import os
from pathlib import Path

import h5py
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.patches import Polygon
from PIL import Image
from scipy.stats import fisher_exact, gaussian_kde, kruskal, spearmanr
from statsmodels.stats.multitest import multipletests


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DATA = ROOT / "source_data"
OUT_VECTOR = ROOT / "outputs" / "vector"
OUT_RASTER = ROOT / "outputs" / "raster"
QC = ROOT / "QC"
for folder in (SOURCE_DATA, OUT_VECTOR, OUT_RASTER, QC):
    folder.mkdir(parents=True, exist_ok=True)

PROJECT = Path(
    os.environ.get(
        "FIGURES2_STEREOSEQ_ROOT",
        r"F:\20250325cell背靠背拒稿\20251214上皮化\20260313重新拼图\时空组学\stereoseq",
    )
)
PDF_ROOT = PROJECT / "pdf_output"
ANNOTATED = PDF_ROOT / "Wound_Healing_Annotation_Output_White"
MASK_ROOT = PDF_ROOT / "mask"
FIGURE2_UNIT = ROOT.parents[1]

REGIONS = ["Un-epi", "Epi-Front", "Newly-epi"]
REGION_COLORS = {"Un-epi": "#D7191C", "Epi-Front": "#E3BE28", "Newly-epi": "#377EB8"}
GROUP_COLORS = {
    "Other KC/SAC": "#6A3D9A",
    "Fib/Endo": "#E67E22",
    "Immune": "#168A83",
}
TARGETS = ["KC_Spinous_Mig", "SAC_SG_Progenitor", "Fib_K14"]
TARGET_DISPLAY = {
    "KC_Spinous_Mig": "KC_Spinous_Mig",
    "SAC_SG_Progenitor": "SAC_SG_Progenitor",
    "Fib_K14": "Fib_K14",
}

SAMPLES = {
    "5dpb": {
        "sample_id": "BW32_A01597A3_SDSDB_5dpb",
        "day": 5,
        "title": "5 dpb\nSPTDI & DPTDI",
    },
    "12dpb_DPTDI1": {
        "sample_id": "BW13_1_B1_DSDB_12dpb",
        "day": 12,
        "title": "12 dpb\nDPTDI",
    },
    "12dpb_SPTDI1": {
        "sample_id": "BW14_1_C1_SSDB_12dpb",
        "day": 12,
        "title": "12 dpb\nSPTDI",
    },
    "12dpb_DPTDI2": {
        "sample_id": "BW13_A3_DSDB_12dpb",
        "day": 12,
        "title": "12 dpb\nDPTDI",
    },
    "12dpb_SPTDI2": {
        "sample_id": "BW14_B3_SSDB_12dpb",
        "day": 12,
        "title": "12 dpb\nSPTDI",
    },
    "19dpb": {
        "sample_id": "BW15D_C6_SDSDB_19dpb",
        "day": 19,
        "title": "19 dpb\nSPTDI & DPTDI",
    },
    "19dpb_p1": {
        "sample_id": "BW15D_1_D1_SDSDB_19dpb",
        "day": 19,
        "title": "19 dpb\nSPTDI & DPTDI",
    },
    "26dpb_p1": {
        "sample_id": "BW81_C02846B6_SDSDB_26dpb_part1",
        "day": 26,
        "title": "26 dpb\nSPTDI & DPTDI",
    },
    "26dpb_p2": {
        "sample_id": "BW81_C02846B6_SDSDB_26dpb_part2",
        "day": 26,
        "title": "26 dpb\nSPTDI & DPTDI",
    },
    "2mph": {
        "sample_id": "2mph_A03699G6.SCT",
        "day": 60,
        "title": "2 mph\nSPTDI & DPTDI",
    },
}

DISPLAY_SAMPLES = ["5dpb", "12dpb_DPTDI1", "12dpb_SPTDI2", "19dpb_p1", "26dpb_p1", "2mph"]

CELL_ORDER = [
    "KC_Basal", "KC_Basal_Mig", "KC_Basal_Prolif", "KC_Spinous",
    "KC_Spinous_Mig", "KC_Spinous_Mat", "KC_Granular",
    "SAC_SG_Progenitor", "SAC_SG_Clear", "SAC_SG_Dark", "SAC_SG_Ductal",
    "SAC_HF_IRS", "SAC_HF_ORS", "SAC_HF_HFSC", "SAC_HF_DP_DS",
    "SAC_HF_Matrix", "Melanocyte",
    "Fib_Papi", "Fib_SFRP2", "Fib_Myo", "Fib_Inflama", "Fib_Fasci", "Fib_EN1",
    "Fib_Prolif", "Fib_K14", "Fib_CD45",
    "Endo_Capillary", "Endo_Arterial", "Endo_Venous", "Endo_Lymphatic",
    "Endo_Prolif", "Pericyte", "Schwann",
    "M1_Macrophage", "M2_Macrophage", "LAM", "Neutrophil", "Mast", "cDC1",
    "cDC2", "pDC", "LGHS", "B_Mature", "B_Plasma", "CD4_T", "CD8_T", "NK",
]

mpl.rcParams.update(
    {
        "font.family": "Arial",
        "font.sans-serif": ["Arial"],
        "font.size": 6,
        "axes.titlesize": 7,
        "axes.labelsize": 6,
        "xtick.labelsize": 6,
        "ytick.labelsize": 6,
        "legend.fontsize": 6,
        "svg.fonttype": "none",
        "pdf.fonttype": 42,
        "ps.fonttype": 42,
        "axes.linewidth": 0.55,
        "lines.linewidth": 0.8,
        "xtick.major.width": 0.5,
        "ytick.major.width": 0.5,
    }
)


def decode_categorical(group: h5py.Group) -> np.ndarray:
    categories = np.asarray(group["categories"])
    categories = np.array(
        [x.decode("utf-8") if isinstance(x, (bytes, np.bytes_)) else str(x) for x in categories],
        dtype=object,
    )
    return categories[np.asarray(group["codes"], dtype=int)]


def rotate_coordinates(coords: np.ndarray, angle: float) -> np.ndarray:
    theta = np.radians(angle)
    return np.column_stack(
        (
            coords[:, 0] * np.cos(theta) - coords[:, 1] * np.sin(theta),
            coords[:, 0] * np.sin(theta) + coords[:, 1] * np.cos(theta),
        )
    )


def distance_to_polyline(points: np.ndarray, line: list[list[float]]) -> np.ndarray:
    vertices = np.asarray(line, dtype=float)
    result = np.full(points.shape[0], np.inf, dtype=float)
    for start, end in zip(vertices[:-1], vertices[1:]):
        vector = end - start
        denom = float(np.dot(vector, vector))
        if denom <= np.finfo(float).eps:
            continue
        delta = points - start
        projection = np.clip((delta @ vector) / denom, 0, 1)
        nearest = start + projection[:, None] * vector
        result = np.minimum(result, np.sqrt(((points - nearest) ** 2).sum(axis=1)))
    return result


def group_labels(labels: np.ndarray) -> np.ndarray:
    result = np.full(len(labels), "", dtype=object)
    epithelial = np.array(
        [
            (x.startswith("KC_") or x.startswith("SAC_") or x == "Melanocyte")
            and x not in {"KC_Spinous_Mig", "SAC_SG_Progenitor", "SAC_SG_Dark"}
            for x in labels
        ]
    )
    stromal = np.array(
        [
            (
                x.startswith("Fib_")
                or x.startswith("Endo_")
                or x in {"Pericyte", "Schwann"}
            )
            and x != "Fib_K14"
            for x in labels
        ]
    )
    immune = np.array(
        [
            x.startswith(("M1_", "M2_", "B_", "CD4_", "CD8_", "cDC"))
            or x in {"LAM", "Neutrophil", "Mast", "pDC", "LGHS", "NK"}
            for x in labels
        ]
    )
    result[epithelial] = "Other KC/SAC"
    result[stromal] = "Fib/Endo"
    result[immune] = "Immune"
    return result


def anchor_coordinates(coords: np.ndarray, anchors: dict) -> tuple[np.ndarray, np.ndarray, str]:
    rotation = float(anchors.get("rotation_applied", 0))
    rotated = rotate_coordinates(coords, rotation)
    mode = anchors.get("analysis_mode", "wound_healing")
    epi = anchors.get("epi_baseline")
    der = anchors.get("der_bottom")
    if epi and der:
        d_epi = distance_to_polyline(rotated, epi)
        d_der = distance_to_polyline(rotated, der)
        denom = d_epi + d_der
        depth = np.divide(d_epi, denom, out=np.zeros_like(d_epi), where=denom > 0)
    elif epi:
        depth = distance_to_polyline(rotated, epi)
        q99 = np.quantile(depth, 0.99)
        depth = np.clip(depth / q99 if q99 > 0 else depth, 0, 1)
    else:
        depth = np.zeros(len(coords), dtype=float)

    if mode in {"wound_healing", "almost_healed"} and len(anchors.get("leading_edge", [])) >= 2:
        ref = anchors["leading_edge"]
        distance = distance_to_polyline(rotated, ref)
        right_positive = anchors.get("healed_direction", "right_is_healed") == "right_is_healed"
        positive = rotated[:, 0] > float(ref[0][0])
        if not right_positive:
            positive = ~positive
        x = distance * np.where(positive, 1, -1)
    elif mode == "unhealed_gradient":
        ref = anchors["healing_source"]
        distance = distance_to_polyline(rotated, ref)
        positive = rotated[:, 0] > float(ref[0][0])
        if anchors.get("unhealed_direction") == "left_is_unhealed":
            positive = ~positive
        x = distance * np.where(positive, 1, -1)
    elif mode in {"scar_to_scarless", "vertical_stratification", "mechanical_stretch", "wound_edges_to_center"}:
        ref = anchors.get("origin_line", anchors.get("leading_edge"))
        distance = distance_to_polyline(rotated, ref)
        positive = rotated[:, 0] > float(ref[0][0])
        if anchors.get("target_direction") == "left_is_scarless":
            positive = ~positive
        x = distance * np.where(positive, 1, -1)
    else:
        x = rotated[:, 0] - np.median(rotated[:, 0])

    return x * 0.5, np.clip(depth, 0, 1), mode


def region_names(sample_key: str, mode: str) -> tuple[str, str, str]:
    if sample_key == "5dpb":
        return "SPTDI", "Center", "DPTDI"
    if mode == "vertical_stratification":
        return "Left side", "Center", "Right side"
    if mode == "scar_to_scarless":
        return "Scar", "Boundary", "Scarless"
    return "Un-epi", "Epi-Front", "Newly-epi"


def mask_path(sample_id: str) -> Path:
    return MASK_ROOT / f"boundary_mask_{sample_id}.png"


def read_all_samples() -> tuple[dict[str, dict], pd.DataFrame, pd.DataFrame]:
    cached: dict[str, dict] = {}
    section_rows: list[dict] = []
    mask_rows: list[dict] = []

    for sample_key, spec in SAMPLES.items():
        h5_path = ANNOTATED / f"{spec['sample_id']}_Annotated.h5ad"
        anchor_path = MASK_ROOT / f"{sample_key}_spatial_anchors.json"
        m_path = mask_path(spec["sample_id"])
        if not h5_path.exists() or not anchor_path.exists() or not m_path.exists():
            raise FileNotFoundError(
                f"Missing registered source for {sample_key}: "
                f"h5={h5_path.exists()}, json={anchor_path.exists()}, mask={m_path.exists()}"
            )
        anchors = json.loads(anchor_path.read_text(encoding="utf-8"))
        with h5py.File(h5_path, "r") as handle:
            labels = decode_categorical(handle["obs"]["sub_labels"])
            coords = np.asarray(handle["obsm"]["spatial"], dtype=float)
        x_um, depth, mode = anchor_coordinates(coords, anchors)
        groups = group_labels(labels)
        cached[sample_key] = {
            "labels": labels,
            "groups": groups,
            "x_um": x_um,
            "depth": depth,
            "mode": mode,
            "title": spec["title"],
            "day": spec["day"],
            "sample_id": spec["sample_id"],
        }
        for group_name in GROUP_COLORS:
            keep = groups == group_name
            section_rows.append(
                {
                    "sample_key": sample_key,
                    "sample_id": spec["sample_id"],
                    "day": spec["day"],
                    "group": group_name,
                    "n_bins": int(keep.sum()),
                    "median_x_um": float(np.median(x_um[keep])) if keep.any() else np.nan,
                    "median_depth": float(np.median(depth[keep])) if keep.any() else np.nan,
                }
            )
        mask = np.asarray(Image.open(m_path))
        values, counts = np.unique(mask, return_counts=True)
        mask_rows.append(
            {
                "sample_key": sample_key,
                "sample_id": spec["sample_id"],
                "mask_path": str(m_path),
                "mask_shape": "x".join(map(str, mask.shape)),
                "mask_values": "|".join(map(str, values.tolist())),
                "nonzero_fraction": float(np.sum(mask != 0) / mask.size),
                "json_path": str(anchor_path),
                "analysis_mode": mode,
                "rotation_applied": anchors.get("rotation_applied", ""),
            }
        )

    section_df = pd.DataFrame(section_rows)
    mask_df = pd.DataFrame(mask_rows)
    section_df.to_csv(SOURCE_DATA / "FigureS2AB_section_level_group_trajectories.csv", index=False)
    mask_df.to_csv(SOURCE_DATA / "FigureS2AB_mask_json_audit.csv", index=False)
    return cached, section_df, mask_df


def trajectory_statistics(section_df: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict] = []
    for group_name in GROUP_COLORS:
        sub = section_df[section_df["group"].eq(group_name)].dropna()
        for metric in ("median_x_um", "median_depth"):
            day_groups = [
                sub.loc[sub["day"].eq(day), metric].to_numpy()
                for day in sorted(sub["day"].unique())
            ]
            day_groups = [x for x in day_groups if len(x)]
            kw_stat, kw_p = kruskal(*day_groups)
            rho, trend_p = spearmanr(sub["day"], sub[metric])
            rows.append(
                {
                    "group": group_name,
                    "metric": metric,
                    "n_sections": len(sub),
                    "kruskal_statistic": kw_stat,
                    "kruskal_p": kw_p,
                    "spearman_rho": rho,
                    "spearman_p": trend_p,
                }
            )
    stats = pd.DataFrame(rows)
    stats["kruskal_fdr"] = multipletests(stats["kruskal_p"], method="fdr_bh")[1]
    stats["spearman_fdr"] = multipletests(stats["spearman_p"], method="fdr_bh")[1]
    stats.to_csv(SOURCE_DATA / "FigureS2B_section_level_statistics.csv", index=False)
    return stats


def clean_axis(ax: plt.Axes) -> None:
    ax.spines[["top", "right"]].set_visible(False)
    ax.tick_params(direction="out", length=1.8, pad=1.2)


def add_panel_letter(fig: plt.Figure, x: float, y: float, letter: str) -> None:
    fig.text(x, y, letter, fontsize=14, fontweight="bold", ha="left", va="top")


def draw_background(ax: plt.Axes, xmin: float, xmax: float) -> tuple[float, float]:
    b1_top, b1_bottom = -0.25 * max(abs(xmin), abs(xmax)), -0.10 * max(abs(xmin), abs(xmax))
    b2_top, b2_bottom = 0.15 * max(abs(xmin), abs(xmax)), 0.30 * max(abs(xmin), abs(xmax))
    ax.add_patch(
        Polygon(
            [[xmin, 0], [b1_top, 0], [b1_bottom, 1], [xmin, 1]],
            facecolor=REGION_COLORS["Un-epi"],
            alpha=0.08,
            edgecolor="none",
            zorder=0,
        )
    )
    ax.add_patch(
        Polygon(
            [[b1_top, 0], [b2_top, 0], [b2_bottom, 1], [b1_bottom, 1]],
            facecolor=REGION_COLORS["Epi-Front"],
            alpha=0.10,
            edgecolor="none",
            zorder=0,
        )
    )
    ax.add_patch(
        Polygon(
            [[b2_top, 0], [xmax, 0], [xmax, 1], [b2_bottom, 1]],
            facecolor=REGION_COLORS["Newly-epi"],
            alpha=0.08,
            edgecolor="none",
            zorder=0,
        )
    )
    ax.plot([b1_top, b1_bottom], [0, 1], "--", color="#8A8A8A", lw=0.45, zorder=1)
    ax.plot([b2_top, b2_bottom], [0, 1], "--", color="#8A8A8A", lw=0.45, zorder=1)
    return b1_top, b2_top


def draw_panel_a(fig: plt.Figure, rect: list[float], cached: dict[str, dict]) -> None:
    x0, y0, width, height = rect
    groups = list(GROUP_COLORS)
    nrows, ncols = 3, len(DISPLAY_SAMPLES)
    col_gap, row_gap = 0.007, 0.017
    cell_w = (width - col_gap * (ncols - 1)) / ncols
    cell_h = (height - row_gap * (nrows - 1)) / nrows
    rng = np.random.default_rng(20260724)

    for r, group_name in enumerate(groups):
        for c, sample_key in enumerate(DISPLAY_SAMPLES):
            left = x0 + c * (cell_w + col_gap)
            bottom = y0 + (nrows - 1 - r) * (cell_h + row_gap)
            ax = fig.add_axes([left, bottom, cell_w, cell_h])
            data = cached[sample_key]
            keep = data["groups"] == group_name
            x = data["x_um"][keep]
            y = data["depth"][keep]
            all_x = data["x_um"]
            lim = float(np.quantile(np.abs(all_x[np.isfinite(all_x)]), 0.985))
            lim = max(lim, 500)
            draw_background(ax, -lim, lim)
            if len(x):
                n_show = min(len(x), 1400)
                idx = rng.choice(len(x), n_show, replace=False)
                xx, yy = x[idx], y[idx]
                try:
                    density = gaussian_kde(np.vstack([xx, yy]))(np.vstack([xx, yy]))
                    order = np.argsort(density)
                    ax.scatter(
                        xx[order],
                        yy[order],
                        c=density[order],
                        cmap="plasma",
                        s=1.05,
                        linewidths=0,
                        alpha=0.92,
                    )
                except (np.linalg.LinAlgError, ValueError):
                    ax.scatter(xx, yy, color=GROUP_COLORS[group_name], s=1.0, linewidths=0, alpha=0.7)
            ax.set_xlim(-lim, lim)
            ax.set_ylim(1.02, -0.02)
            ax.set_xticks([-round(lim, -2), 0, round(lim, -2)])
            ax.set_yticks([0, 0.5, 1])
            ax.tick_params(labelsize=6, length=1.4, pad=0.8)
            for spine in ax.spines.values():
                spine.set_linewidth(0.45)
                spine.set_color("#4A4A4A")
            if c == 0:
                ax.set_ylabel("Epidermis-dermis axis", labelpad=1)
                ax.text(
                    0.02,
                    0.88,
                    group_name,
                    transform=ax.transAxes,
                    rotation=0,
                    ha="left",
                    va="top",
                    fontsize=6.2,
                    fontweight="bold",
                    color=GROUP_COLORS[group_name],
                    bbox={"facecolor": "white", "edgecolor": "none", "alpha": 0.78, "pad": 0.5},
                )
            else:
                ax.set_yticklabels([])
            if r == nrows - 1:
                ax.set_xlabel("Distance to reference (µm)", labelpad=1)
            else:
                ax.set_xticklabels([])
            if r == 0:
                ax.set_title(data["title"], fontsize=6.4, fontweight="bold", pad=1.5)
                labels = region_names(sample_key, data["mode"])
                ax.text(0.08, 0.96, labels[0], transform=ax.transAxes, color=REGION_COLORS["Un-epi"], fontsize=6, ha="left", va="top")
                ax.text(0.50, 0.96, labels[1], transform=ax.transAxes, color="#AA8400", fontsize=6, ha="center", va="top")
                ax.text(0.92, 0.96, labels[2], transform=ax.transAxes, color=REGION_COLORS["Newly-epi"], fontsize=6, ha="right", va="top")


def p_text(value: float) -> str:
    if value < 1e-4:
        return f"{value:.1e}"
    return f"{value:.3f}"


def draw_panel_b(fig: plt.Figure, rect: list[float], section_df: pd.DataFrame, stats: pd.DataFrame) -> None:
    x0, y0, width, height = rect
    groups = list(GROUP_COLORS)
    group_gap = 0.018
    group_w = (width - group_gap * 2) / 3
    metric_gap = 0.010
    ax_w = (group_w - metric_gap) / 2
    rng = np.random.default_rng(113)
    metric_specs = [
        ("median_x_um", "Horizontal\nposition (mm)", 0.001, False),
        ("median_depth", "Relative depth", 1.0, True),
    ]
    for i, group_name in enumerate(groups):
        group_left = x0 + i * (group_w + group_gap)
        for j, (metric, ylabel, scale, invert) in enumerate(metric_specs):
            ax = fig.add_axes([group_left + j * (ax_w + metric_gap), y0, ax_w, height])
            sub = section_df[section_df["group"].eq(group_name)].copy()
            days = np.array(sorted(sub["day"].unique()))
            medians = sub.groupby("day")[metric].median().reindex(days).to_numpy() * scale
            ax.plot(days, medians, "o-", color=GROUP_COLORS[group_name], ms=2.4, lw=0.9, zorder=3)
            for day in days:
                vals = sub.loc[sub["day"].eq(day), metric].to_numpy() * scale
                jitter = rng.normal(0, 0.45, len(vals))
                ax.scatter(np.full(len(vals), day) + jitter, vals, s=7, facecolor="white", edgecolor=GROUP_COLORS[group_name], lw=0.55, zorder=4)
            if metric == "median_x_um":
                ax.axhline(0, color="#777777", lw=0.45, ls="--")
            if invert:
                ax.invert_yaxis()
            ax.set_xticks([5, 12, 19, 26, 60])
            ax.set_xlabel("Healing time (days)", labelpad=1)
            ax.set_ylabel(ylabel, labelpad=1)
            clean_axis(ax)
            row = stats[(stats["group"].eq(group_name)) & (stats["metric"].eq(metric))].iloc[0]
            ax.text(
                0.03,
                0.97,
                f"KW q={p_text(row.kruskal_fdr)}\nρ={row.spearman_rho:.2f}, q={p_text(row.spearman_fdr)}",
                transform=ax.transAxes,
                ha="left",
                va="top",
                fontsize=6,
            )
            if j == 0:
                ax.set_title(group_name, color=GROUP_COLORS[group_name], fontweight="bold", fontsize=7, pad=2)


def read_enrichment() -> pd.DataFrame:
    path = FIGURE2_UNIT / "source_data" / "Figure2B_S2AB_19dpb_p1_region_enrichment.csv"
    df = pd.read_csv(path)
    df["cell_type"] = df["cell_type"].astype(str)
    return df


def draw_heatmap_block(
    fig: plt.Figure,
    rect: list[float],
    matrix: pd.DataFrame,
    fdr: pd.DataFrame,
    epi_red: set[str],
    vlim: float,
) -> plt.Axes:
    ax = fig.add_axes(rect)
    image = ax.imshow(matrix.to_numpy(), aspect="auto", cmap="RdBu_r", vmin=-vlim, vmax=vlim, interpolation="nearest")
    ax.set_xticks(range(3), REGIONS)
    ax.set_yticks(range(len(matrix)), matrix.index)
    ax.tick_params(axis="y", length=0, pad=1, labelsize=6)
    ax.tick_params(axis="x", length=1.5, pad=1, labelsize=6)
    for tick in ax.get_yticklabels():
        if tick.get_text() in epi_red:
            tick.set_color("#D7191C")
            tick.set_fontweight("bold")
    for row in range(len(matrix)):
        for col in range(3):
            q = float(fdr.iloc[row, col])
            star = "***" if q < 0.001 else "**" if q < 0.01 else "*" if q < 0.05 else ""
            if star:
                ax.text(col, row, star, ha="center", va="center", fontsize=6, color="black")
    for spine in ax.spines.values():
        spine.set_linewidth(0.45)
    ax._heatmap_image = image
    return ax


def draw_panel_c(fig: plt.Figure, rect: list[float], enrichment: pd.DataFrame) -> None:
    x0, y0, width, height = rect
    available = [x for x in CELL_ORDER if x in set(enrichment["cell_type"])]
    extras = sorted(set(enrichment["cell_type"]) - set(available))
    order = available + extras
    matrix = enrichment.pivot(index="cell_type", columns="region", values="log2_enrichment").reindex(index=order, columns=REGIONS)
    fdr = enrichment.pivot(index="cell_type", columns="region", values="fisher_fdr").reindex(index=order, columns=REGIONS)
    epi = enrichment[(enrichment["region"].eq("Epi-Front")) & (enrichment["log2_enrichment"] > 0) & (enrichment["fisher_fdr"] < 0.05)]
    epi_red = set(epi["cell_type"])
    (SOURCE_DATA / "FigureS2C_EpiFront_enriched_red_labels.txt").write_text(
        "\n".join(sorted(epi_red)) + "\n", encoding="utf-8"
    )
    vlim = float(np.nanmax(np.abs(matrix.to_numpy())))
    split = math.ceil(len(matrix) / 2)
    left_matrix, right_matrix = matrix.iloc[:split], matrix.iloc[split:]
    left_fdr, right_fdr = fdr.iloc[:split], fdr.iloc[split:]
    label_left = 0.068
    internal_gap = 0.085
    colorbar_w = 0.018
    block_w = (width - label_left - internal_gap - colorbar_w - 0.010) / 2
    first_x = x0 + label_left
    ax1 = draw_heatmap_block(fig, [first_x, y0, block_w, height], left_matrix, left_fdr, epi_red, vlim)
    ax2 = draw_heatmap_block(
        fig,
        [first_x + block_w + internal_gap, y0, block_w, height],
        right_matrix,
        right_fdr,
        epi_red,
        vlim,
    )
    cax = fig.add_axes([x0 + width - colorbar_w, y0 + 0.10 * height, colorbar_w, 0.80 * height])
    cb = fig.colorbar(ax1._heatmap_image, cax=cax)
    cb.set_label("log2 enrichment", fontsize=6, labelpad=1)
    cb.ax.tick_params(labelsize=6, width=0.45, length=1.5, pad=1)
    fig.text(x0 + width / 2, y0 + height + 0.008, "19 dpb_p1 regional enrichment", ha="center", va="bottom", fontsize=7.5, fontweight="bold")
    fig.text(
        x0 + width / 2,
        y0 + height + 0.001,
        "Epi-Front-enriched cell-state labels are shown in red",
        ha="center",
        va="bottom",
        fontsize=6,
        color="#D7191C",
    )


def star_from_q(q: float) -> str:
    return "***" if q < 0.001 else "**" if q < 0.01 else "*" if q < 0.05 else "ns"


def target_pairwise(enrichment: pd.DataFrame) -> pd.DataFrame:
    rows = []
    comparisons = [("Epi-Front", "Un-epi"), ("Epi-Front", "Newly-epi")]
    for state in TARGETS:
        d = enrichment[enrichment["cell_type"].eq(state)].set_index("region").loc[REGIONS]
        for region_a, region_b in comparisons:
            a = d.loc[region_a]
            b = d.loc[region_b]
            table = [
                [int(a["count"]), int(a["region_bins"] - a["count"])],
                [int(b["count"]), int(b["region_bins"] - b["count"])],
            ]
            odds, p = fisher_exact(table, alternative="two-sided")
            rows.append(
                {
                    "cell_type": state,
                    "region_a": region_a,
                    "region_b": region_b,
                    "odds_ratio": odds,
                    "fisher_p": p,
                }
            )
    out = pd.DataFrame(rows)
    out["fisher_fdr"] = multipletests(out["fisher_p"], method="fdr_bh")[1]
    out.to_csv(SOURCE_DATA / "FigureS2D_pairwise_Fisher_FDR.csv", index=False)
    return out


def draw_bracket(ax: plt.Axes, x1: float, x2: float, y: float, text: str) -> None:
    span = max(abs(ax.get_ylim()[0]), abs(ax.get_ylim()[1]))
    h = max(0.05 * span, 0.08)
    ax.plot([x1, x1, x2, x2], [y - h * 0.25, y, y, y - h * 0.25], color="black", lw=0.55, clip_on=False)
    ax.text((x1 + x2) / 2, y + h * 0.05, text, ha="center", va="bottom", fontsize=6)


def draw_panel_d(fig: plt.Figure, rect: list[float], enrichment: pd.DataFrame, pairwise: pd.DataFrame) -> None:
    x0, y0, width, height = rect
    row_gap = 0.025
    row_h = (height - 2 * row_gap) / 3
    for i, state in enumerate(TARGETS):
        bottom = y0 + (2 - i) * (row_h + row_gap)
        ax = fig.add_axes([x0, bottom, width, row_h])
        d = enrichment[enrichment["cell_type"].eq(state)].set_index("region").loc[REGIONS]
        vals = d["log2_enrichment"].to_numpy()
        ax.bar(range(3), vals, color=[REGION_COLORS[x] for x in REGIONS], width=0.66, edgecolor="black", linewidth=0.4)
        ax.axhline(0, color="#5A5A5A", lw=0.5)
        ax.set_xticks(range(3))
        if i == 2:
            ax.set_xticklabels(REGIONS, rotation=20, ha="right")
        else:
            ax.set_xticklabels([])
        ax.set_ylabel("", labelpad=1)
        ax.set_title(TARGET_DISPLAY[state], fontsize=6.8, fontweight="bold", pad=1.0)
        clean_axis(ax)
        top = max(vals.max(), 0)
        span = max(vals.max() - vals.min(), 1.0)
        y1 = top + 0.14 * span
        y2 = top + 0.31 * span
        q_un = pairwise[(pairwise["cell_type"].eq(state)) & (pairwise["region_b"].eq("Un-epi"))]["fisher_fdr"].iloc[0]
        q_new = pairwise[(pairwise["cell_type"].eq(state)) & (pairwise["region_b"].eq("Newly-epi"))]["fisher_fdr"].iloc[0]
        draw_bracket(ax, 0, 1, y1, star_from_q(float(q_un)))
        draw_bracket(ax, 1, 2, y2, star_from_q(float(q_new)))
        ymin = min(vals.min() - 0.12 * span, 0)
        ax.set_ylim(ymin, y2 + 0.20 * span)


def draw_panel_e(fig: plt.Figure, rect: list[float]) -> None:
    path = FIGURE2_UNIT / "source_data" / "FigureS2E_nearest_neighbor_summary.csv"
    df = pd.read_csv(path)
    ax = fig.add_axes(rect)
    x = np.arange(len(df))
    ax.errorbar(
        x - 0.10,
        df["permuted_mean_um"],
        yerr=[
            df["permuted_mean_um"] - df["perm_q025_um"],
            df["perm_q975_um"] - df["permuted_mean_um"],
        ],
        fmt="o",
        color="#777777",
        ms=3,
        capsize=2,
        lw=0.6,
        label="Permuted",
    )
    ax.scatter(x + 0.10, df["observed_mean_nn_um"], s=13, color="#D84A4A", label="Observed", zorder=3)
    for i, row in df.iterrows():
        ax.text(i, row["observed_mean_nn_um"] + 17, f"P={row['permutation_p']:.2f}", ha="center", va="bottom", fontsize=6)
    ax.set_xticks(x, ["Fib-KC", "Fib-SAC", "KC-SAC"])
    ax.set_ylabel("Mean NN distance (µm)")
    ax.legend(frameon=False, ncol=2, loc="upper left")
    clean_axis(ax)


def draw_panel_f(fig: plt.Figure, rect: list[float]) -> None:
    path = FIGURE2_UNIT / "panels" / "FigureS2F_healthy_baseline_MIF.png"
    ax = fig.add_axes(rect)
    ax.imshow(Image.open(path).convert("RGB"))
    ax.axis("off")


def draw_panel_g(fig: plt.Figure, rect: list[float]) -> None:
    ax = fig.add_axes(rect)
    ax.axis("off")
    ax.add_patch(
        plt.Rectangle(
            (0, 0),
            1,
            1,
            transform=ax.transAxes,
            facecolor="#FAFAFA",
            edgecolor="#8A8A8A",
            linestyle="--",
            linewidth=0.7,
        )
    )
    ax.text(
        0.5,
        0.53,
        "Healthy-skin versus Epi-Front quantification reserved for raw positive-cell counts,\n"
        "denominators and biological-replicate identifiers.",
        ha="center",
        va="center",
        fontsize=6.3,
        color="#444444",
    )


def build_figure() -> None:
    cached, section_df, _ = read_all_samples()
    stats = trajectory_statistics(section_df)
    enrichment = read_enrichment()
    pairwise = target_pairwise(enrichment)

    fig = plt.figure(figsize=(8.2677165, 11.692913), facecolor="white")
    draw_panel_a(fig, [0.045, 0.742, 0.915, 0.230], cached)
    add_panel_letter(fig, 0.012, 0.988, "A")

    draw_panel_b(fig, [0.045, 0.585, 0.915, 0.125], section_df, stats)
    add_panel_letter(fig, 0.012, 0.724, "B")

    draw_panel_c(fig, [0.035, 0.315, 0.615, 0.235], enrichment)
    add_panel_letter(fig, 0.012, 0.565, "C")

    draw_panel_d(fig, [0.700, 0.315, 0.255, 0.235], enrichment, pairwise)
    add_panel_letter(fig, 0.662, 0.565, "D")

    draw_panel_e(fig, [0.075, 0.225, 0.880, 0.060])
    add_panel_letter(fig, 0.012, 0.298, "E")

    draw_panel_f(fig, [0.055, 0.075, 0.900, 0.120])
    add_panel_letter(fig, 0.012, 0.208, "F")

    draw_panel_g(fig, [0.055, 0.020, 0.900, 0.033])
    add_panel_letter(fig, 0.012, 0.065, "G")

    svg = OUT_VECTOR / "FigureS2_revised_v01_editable.svg"
    pdf = OUT_VECTOR / "FigureS2_revised_v01.pdf"
    png = OUT_RASTER / "FigureS2_revised_v01_600dpi.png"
    tiff = OUT_RASTER / "FigureS2_revised_v01_600dpi.tiff"
    fig.savefig(svg, format="svg", facecolor="white")
    fig.savefig(pdf, format="pdf", facecolor="white", dpi=600)
    fig.savefig(png, format="png", facecolor="white", dpi=600)
    fig.savefig(tiff, format="tiff", facecolor="white", dpi=600, pil_kwargs={"compression": "tiff_lzw"})
    plt.close(fig)


if __name__ == "__main__":
    build_figure()

