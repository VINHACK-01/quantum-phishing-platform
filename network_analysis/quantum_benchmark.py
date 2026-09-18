import matplotlib.patheffects as path_effects
import matplotlib.pyplot as plt
import pandas as pd
import pennylane as qml
from pennylane import numpy as np
from pennylane.optimize import NesterovMomentumOptimizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# ==========================================
# 1. LOAD & PREPROCESS DATASET (5,000 ROWS)
# ==========================================
print("--> Loading and sampling 5,000 rows for maximum accuracy...")
df = pd.read_csv("malicious_phish.csv")

# Filter to balance binary classification: phishing (1) vs benign (0)
df = df[df["type"].isin(["phishing", "benign"])].copy()

# Scale up sample size to 5,000 rows
sample_size = min(5000, len(df))
df = df.sample(n=sample_size, random_state=42)

# Extract 4 lexical features
df["url_length"] = df["url"].apply(len)
df["digit_count"] = df["url"].apply(lambda x: sum(c.isdigit() for c in x))
df["slash_count"] = df["url"].apply(lambda x: x.count("/"))
df["dot_count"] = df["url"].apply(lambda x: x.count("."))

X = df[["url_length", "digit_count", "slash_count", "dot_count"]].values
y_classical = (df["type"] == "phishing").astype(int).values
y_quantum = np.where(y_classical == 0, -1, 1)

# Split data (80/20 train-test)
X_train, X_test, y_train_q, y_test_q = train_test_split(
    X, y_quantum, test_size=0.2, random_state=42
)
_, _, y_train_c, y_test_c = train_test_split(
    X, y_classical, test_size=0.2, random_state=42
)

# Standardize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ==========================================
# 2. CLASSICAL MODEL (Random Forest - 100 Trees)
# ==========================================
print("--> Training Classical Random Forest (100 Trees)...")
rf_model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
rf_model.fit(X_train_scaled, y_train_c)
rf_preds = rf_model.predict(X_test_scaled)
classical_accuracy = accuracy_score(y_test_c, rf_preds)
print(f"Classical Random Forest Accuracy: {classical_accuracy:.4f}")

# ==========================================
# 3. QUANTUM VARIATIONAL CLASSIFIER (4 Qubits, 3 Layers, Ring Entanglement)
# ==========================================
print("--> Training PennyLane Quantum Classifier (4 Qubits, 3 Layers, 30 Epochs)...")
num_qubits = 4
dev = qml.device("default.qubit", wires=num_qubits)


def state_preparation(x):
    # 4 features mapped directly across 4 qubits
    qml.AngleEmbedding(x, wires=range(num_qubits))


def layer(weights):
    # Rotations for all 4 qubits
    for i in range(num_qubits):
        qml.Rot(*weights[i], wires=i)
    # Ring entanglement pattern across all 4 qubits for deeper correlation
    for i in range(num_qubits):
        qml.CNOT(wires=[i, (i + 1) % num_qubits])


@qml.qnode(dev)
def circuit(weights, bias, x):
    state_preparation(x)
    for w in weights:
        layer(w)
    return qml.expval(qml.PauliZ(0))


def variational_classifier(weights, bias, x):
    return circuit(weights, bias, x) + bias


def cost(weights, bias, X_batch, Y_batch):
    predictions = [variational_classifier(weights, bias, x) for x in X_batch]
    return np.mean((np.array(Y_batch) - np.array(predictions)) ** 2)


np.random.seed(42)
num_layers = 3  # Increased depth for higher expressivity
weights_init = 0.05 * np.random.randn(num_layers, num_qubits, 3, requires_grad=True)
bias_init = np.array(0.0, requires_grad=True)

opt = NesterovMomentumOptimizer(stepsize=0.08)
batch_size = 40
epochs = 30  # Increased training iterations for convergence

weights = weights_init
bias = bias_init

for epoch in range(epochs):
    permutation = np.random.permutation(len(X_train_scaled))
    X_train_shuffled = X_train_scaled[permutation]
    y_train_shuffled = y_train_q[permutation]

    for i in range(0, len(X_train_scaled), batch_size):
        X_batch = X_train_shuffled[i : i + batch_size]
        y_batch = y_train_shuffled[i : i + batch_size]

        (weights, bias), cost_val = opt.step_and_cost(
            lambda w, b: cost(w, b, X_batch, y_batch), weights, bias
        )
    print(f"Epoch {epoch + 1:2d}/{epochs} | Cost: {cost_val:.4f}")

# Predict & Evaluate Quantum Model
q_raw_preds = [variational_classifier(weights, bias, x) for x in X_test_scaled]
q_preds = np.sign(q_raw_preds)
quantum_accuracy = accuracy_score(y_test_q, q_preds)
print(f"Quantum Variational Classifier Accuracy: {quantum_accuracy:.4f}")

# ==========================================
# 4. CHART GENERATION (OPTION 1: SEABORN DARKGRID + TEAL/COPPER)
# ==========================================
print("--> Plotting and saving enhanced chart...")

# 1. SET VISUAL STYLE
plt.style.use('seaborn-v0_8-darkgrid') 

# Define corporate-tech color palette
# Classical: Professional Teal (#008080) | Quantum: Advanced Copper/Orange (#E07A5F)
palette = ["#008080", "#E07A5F"] 

models = ["Classical\n(Random Forest)", "Quantum\n(4-Qubit VQC)"]
accuracies = [classical_accuracy, quantum_accuracy]

# 2. CREATE FIGURE
fig, ax = plt.subplots(figsize=(9, 6), dpi=300)

bars = ax.bar(
    models, accuracies, 
    color=palette, 
    width=0.5, 
    edgecolor="black", 
    linewidth=1.2
)

# 3. ENHANCE AXES AND TITLE
ax.set_title(
    "SENTINEL AI: Threat Detection Benchmarking", 
    fontsize=18, 
    fontweight="bold", 
    family="serif", 
    pad=20, 
    color="#333333"
)
ax.set_ylabel(
    "Prediction Accuracy (0 to 1.0)", 
    fontsize=13, 
    fontweight="bold", 
    color="#555555",
    labelpad=10
)
ax.set_xlabel("Model Architecture", fontsize=13, fontweight="bold", color="#555555", labelpad=10)

ax.set_ylim(0, 1.1)
ax.set_yticks(np.arange(0, 1.1, 0.1))

# 4. ADD DATA LABELS WITH GLOW EFFECT
for bar in bars:
    height = bar.get_height()
    ax.annotate(
        f"{height*100:.1f}%",
        xy=(bar.get_x() + bar.get_width() / 2, height),
        xytext=(0, 6),
        textcoords="offset points",
        ha="center", 
        va="bottom", 
        fontsize=13, 
        fontweight="bold",
        color="black",
        path_effects=[path_effects.withStroke(linewidth=3, foreground="white")]
    )

# 5. EXPORT
plt.tight_layout()
filename = "sentinel_ai_threat_report.png"
plt.savefig(filename, facecolor=fig.get_facecolor(), bbox_inches='tight')
print(f"--> Saved high-resolution enhanced output to '{filename}'")
