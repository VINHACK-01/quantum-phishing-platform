import json
import logging
import os
from typing import Dict, Any
from app.schemas.analyze import QuantumComparison

logger = logging.getLogger(__name__)

# Path to the JSON file produced by quantum_vs_classical.py
# (that script now writes this file automatically after training — see the
# "SAVE RAW NUMBERS" block added to it)
_METRICS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "quantum", "quantum_metrics.json"
)

# These describe the ACTUAL circuit in quantum_vs_classical.py:
# num_qubits = 4, num_layers = 3 (see that script's "# 3. QUANTUM VARIATIONAL
# CLASSIFIER" section). If someone changes those values there, update here too.
_REAL_QUBITS = 4
_REAL_CIRCUIT_DEPTH = 3
_REAL_ANSATZ = "Rot + Ring CNOT Entanglement (custom, 3 layers)"
_REAL_FEATURE_MAP = "AngleEmbedding"


class QuantumBenchmarkService:
    """
    Provides real, honest quantum-classical comparative metrics (PennyLane VQC vs Classical RF).

    IMPORTANT: this reads the ACTUAL numbers your teammate's quantum_vs_classical.py
    script produced, from quantum_metrics.json. It does NOT invent or hardcode
    accuracy numbers — if the file isn't there yet, it says so honestly instead
    of returning a fake number.
    """
    def __init__(self):
        self._stats = self._load_real_metrics()

    def _load_real_metrics(self) -> dict:
        try:
            with open(_METRICS_PATH) as f:
                real = json.load(f)
            classical_acc = float(real["classical_accuracy"])
            quantum_acc = float(real["quantum_accuracy"])
            logger.info(f"[quantum_service] Loaded REAL metrics from {_METRICS_PATH}: "
                        f"classical={classical_acc}, quantum={quantum_acc}")
            source_note = "real"
        except (FileNotFoundError, KeyError, ValueError, json.JSONDecodeError) as exc:
            logger.warning(
                f"[quantum_service] Could not load real quantum_metrics.json "
                f"({exc}) — run quantum_vs_classical.py first. Using placeholder "
                f"values, CLEARLY MARKED as such."
            )
            classical_acc = None
            quantum_acc = None
            source_note = "placeholder — quantum_vs_classical.py has not been run yet"

        return {
            "classical_acc": classical_acc,
            "quantum_acc": quantum_acc,
            "qubits_used": _REAL_QUBITS,
            "ansatz": _REAL_ANSATZ,
            "feature_map": _REAL_FEATURE_MAP,
            "circuit_depth": _REAL_CIRCUIT_DEPTH,
            "data_source": source_note,
        }

    def reload(self):
        """Call this if quantum_vs_classical.py is re-run after the server started."""
        self._stats = self._load_real_metrics()

    def get_comparison(self) -> QuantumComparison:
        # If the real script hasn't been run yet, classical_acc/quantum_acc will
        # be None here. Falling back to 0.0 rather than a fake plausible number
        # so it's visually obvious on the dashboard that this hasn't run yet,
        # instead of silently showing a number nobody can verify.
        classical = self._stats["classical_acc"]
        quantum = self._stats["quantum_acc"]
        return QuantumComparison(
            classical_acc=classical if classical is not None else 0.0,
            quantum_acc=quantum if quantum is not None else 0.0,
        )

    def get_detailed_benchmark(self) -> Dict[str, Any]:
        return dict(self._stats)

quantum_service = QuantumBenchmarkService()