import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np

# ── Load data ──────────────────────────────────────────────────────────────────
df = pd.read_csv("privacy_data.csv")

k_train = df[(df.method == "k-anonymity") & (df.dataset == "Training")]
k_val   = df[(df.method == "k-anonymity") & (df.dataset == "Validation")]
dp_train = df[(df.method == "differential") & (df.dataset == "Training")]
dp_val   = df[(df.method == "differential") & (df.dataset == "Validation")]

BLUE   = "#2E4FA3"
ORANGE = "#E07B00"
style  = dict(marker="o", linewidth=2, markersize=7)

# ── Chart 1: k-Anonymity Squared Error ─────────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(k_train.param, k_train.sq_error_combined, color=BLUE,   label="Training",   **style)
ax.plot(k_val.param,   k_val.sq_error_combined,   color=ORANGE, label="Validation", **style, linestyle="--")
ax.set_xlabel("k value", fontsize=12)
ax.set_ylabel("Squared Error — Combined (%)", fontsize=12)
ax.set_title("Chart 1: k-Anonymity — Squared Error vs k Value", fontsize=13, fontweight="bold")
ax.legend()
ax.grid(True, alpha=0.3)
ax.set_xticks([3, 5, 9, 12, 15])
plt.tight_layout()
plt.savefig("chart1_kanon_squared_error.png", dpi=150)
plt.close()
print("Chart 1 saved")

# ── Chart 2: k-Anonymity Score ─────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(k_train.param, k_train.score, color=BLUE,   label="Training",   **style)
ax.plot(k_val.param,   k_val.score,   color=ORANGE, label="Validation", **style, linestyle="--")
ax.set_xlabel("k value", fontsize=12)
ax.set_ylabel("Score", fontsize=12)
ax.set_title("Chart 2: k-Anonymity — Score vs k Value", fontsize=13, fontweight="bold")
ax.legend()
ax.grid(True, alpha=0.3)
ax.set_xticks([3, 5, 9, 12, 15])
plt.tight_layout()
plt.savefig("chart2_kanon_score.png", dpi=150)
plt.close()
print("Chart 2 saved")

# ── Chart 3: Differential Privacy Squared Error (Training only — validation all 0) ──
fig, ax = plt.subplots(figsize=(8, 5))
# exclude epsilon=0.1 as it produced no valid result (0%)
dp_train_valid = dp_train[dp_train.param > 0.1]
ax.plot(dp_train_valid.param, dp_train_valid.sq_error_combined,
        color=BLUE, label="Training (valid results)", **style)
ax.scatter([0.1], [0], color="red", zorder=5, s=80, label="ε=0.1 (no valid result)")
ax.set_xlabel("Epsilon (ε) value", fontsize=12)
ax.set_ylabel("Squared Error — Combined (%)", fontsize=12)
ax.set_title("Chart 3: Differential Privacy — Squared Error vs ε Value\n(Training Data)", fontsize=13, fontweight="bold")
ax.legend()
ax.grid(True, alpha=0.3)
ax.set_xticks([0.1, 1, 1.25, 1.5, 2])
plt.tight_layout()
plt.savefig("chart3_dp_squared_error.png", dpi=150)
plt.close()
print("Chart 3 saved")

# ── Chart 4: Differential Privacy Score ───────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(dp_train.param, dp_train.score, color=BLUE,   label="Training",   **style)
ax.plot(dp_val.param,   dp_val.score,   color=ORANGE, label="Validation", **style, linestyle="--")
ax.set_xlabel("Epsilon (ε) value", fontsize=12)
ax.set_ylabel("Score", fontsize=12)
ax.set_title("Chart 4: Differential Privacy — Score vs ε Value", fontsize=13, fontweight="bold")
ax.legend()
ax.grid(True, alpha=0.3)
ax.set_xticks([0.1, 1, 1.25, 1.5, 2])
plt.tight_layout()
plt.savefig("chart4_dp_score.png", dpi=150)
plt.close()
print("Chart 4 saved")

print("\nAll 4 charts saved as PNG files in the current directory.")
print("Insert them into your report where the [INSERT SCREENSHOT] placeholders are.")
