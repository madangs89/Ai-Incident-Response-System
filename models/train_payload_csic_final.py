"""
FINAL – WORKING TRAINING SCRIPT FOR CSIC 2010 DATASET
------------------------------------------------------
This script is fully fixed for your dataset structure:

Columns:
 Method, URL, content, classification, ...

Fixes included:
 - Proper label mapping
 - Proper content extraction
 - GET requests include URL query string
 - POST includes content body
 - Balanced RF model
 - Debug prints for label distribution
 - Prevents one-class training issues
"""

import os, re, math, json
from collections import Counter
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# ======= CONFIG =======
CSV_PATH = r"C:\Users\MADANA GS\OneDrive\Desktop\AiAnalyzer\models\csic_database.csv"
OUT_DIR = "training/models"
os.makedirs(OUT_DIR, exist_ok=True)

# ======= REGEXS =======
SQLI_RE = re.compile(r"(?i)(union|select|sleep\(|benchmark|or\s+1=1|--|;|drop|insert|update)")
XSS_RE = re.compile(r"(?i)(<script|alert\(|onerror=|svg)")
TRAV_RE = re.compile(r"(\.\./|%2e%2e)")


# ======= HELPERS =======
def entropy(s):
    if not s: return 0.0
    c = Counter(s)
    probs = [v/len(s) for v in c.values()]
    return -sum(p * math.log2(p) for p in probs)


def special_ratio(s):
    if not s: return 0.0
    return sum(1 for c in s if not c.isalnum()) / len(s)


def path_depth(url):
    try:
        return len([p for p in url.split("/") if p.strip()])
    except:
        return 0


def extract_features(method, url, content):
    if not isinstance(url, str): url = ""
    if not isinstance(content, str): content = ""

    combined = f"{url} {content}".strip()

    return {
        "method_post": 1 if str(method).upper() == "POST" else 0,
        "path_depth": path_depth(url),
        "body_length": len(content),
        "body_entropy": entropy(content),
        "combined_entropy": entropy(combined),
        "special_ratio": special_ratio(combined),
        "contains_sqli": 1 if SQLI_RE.search(combined) else 0,
        "contains_xss": 1 if XSS_RE.search(combined) else 0,
        "contains_trav": 1 if TRAV_RE.search(combined) else 0,
    }


def label_mapper(x):
    """
    FIXED: Handles all your dataset labels.
    """
    s = str(x).strip().lower()

    if s in ("normal", "0", "benign"):
        return 0

    if s in ("anomalous", "1", "attack", "malicious"):
        return 1

    # fallback
    return 1


# ======= MAIN =======
def main():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH, encoding="latin1", low_memory=False)

    print("Columns:", df.columns.tolist())

    required = ["Method", "URL", "content", "classification"]
    for r in required:
        if r not in df.columns:
            raise SystemExit(f"Missing column in CSV: {r}")

    # Clean
    df["Method"] = df["Method"].astype(str)
    df["URL"] = df["URL"].astype(str)
    df["content"] = df["content"].astype(str).replace("nan", "")
    df["classification"] = df["classification"].astype(str)

    df["label"] = df["classification"].apply(label_mapper)

    print("\n===== LABEL DISTRIBUTION =====")
    print(df["label"].value_counts())

    # Safety check — must have both classes
    if df["label"].nunique() < 2:
        raise SystemExit("ERROR: Dataset has only one class after mapping. Fix labels!")

    # Build features
    features = []
    for _, row in df.iterrows():
        feat = extract_features(
            row["Method"],
            row["URL"],
            row["content"]
        )
        features.append(feat)

    X = pd.DataFrame(features)
    y = df["label"].astype(int)

    print("\nX shape:", X.shape)
    print("Positive labels (attacks):", int(y.sum()))

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train balanced RF
    clf = RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    print("\nTraining model...")
    clf.fit(X_train, y_train)

    preds = clf.predict(X_test)
    probs = clf.predict_proba(X_test)[:, 1]

    print("\n===== REPORT =====")
    print(classification_report(y_test, preds, digits=4))
    print("AUC:", roc_auc_score(y_test, probs))

    # Save model
    joblib.dump(clf, f"{OUT_DIR}/payload_clf.joblib")
    json.dump(list(X.columns), open(f"{OUT_DIR}/payload_features.json", "w"))
    print("\nSaved sklearn model + features.")

    # Convert to ONNX
    initial_type = [('input', FloatTensorType([None, len(X.columns)]))]
    onx = convert_sklearn(clf, initial_types=initial_type)
    with open(f"{OUT_DIR}/payload_clf.onnx", "wb") as f:
        f.write(onx.SerializeToString())
    print("Saved ONNX model!")

    print("\nDONE ✔")


if __name__ == "__main__":
    main()
