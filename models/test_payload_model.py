import joblib
import json
import numpy as np

# Load sklearn model
clf = joblib.load("training/models/payload_clf.joblib")
features = json.load(open("training/models/payload_features.json"))

# ----------- FEATURE HELPERS (same as training) -----------

import re, math
from collections import Counter

SQLI_RE = re.compile(r"(?i)(union|select|sleep\(|benchmark|or\s+1=1|--|;|drop|insert|update)")
XSS_RE = re.compile(r"(?i)(<script|alert\(|onerror=|svg)")
TRAV_RE = re.compile(r"(\.\./|%2e%2e)")

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

def extract(method, url, content):
    combined = f"{url} {content}".strip()
    return {
        "method_post": 1 if method.upper() == "POST" else 0,
        "path_depth": path_depth(url),
        "body_length": len(content),
        "body_entropy": entropy(content),
        "combined_entropy": entropy(combined),
        "special_ratio": special_ratio(combined),
        "contains_sqli": 1 if SQLI_RE.search(combined) else 0,
        "contains_xss": 1 if XSS_RE.search(combined) else 0,
        "contains_trav": 1 if TRAV_RE.search(combined) else 0
    }

# --------- Dummy Samples ---------

tests = [
    {
        "name": "Normal browsing",
        "method": "GET",
        "url": "http://localhost/products?id=10&category=shoes",
        "content": ""
    },
    {
        "name": "SQL Injection",
        "method": "GET",
        "url": "http://localhost/login?user=admin' OR 1=1 -- &pass=x",
        "content": ""
    },
    {
        "name": "XSS attempt",
        "method": "POST",
        "url": "http://localhost/comment",
        "content": "<script>alert('x')</script>"
    },
    {
        "name": "Path traversal",
        "method": "GET",
        "url": "http://localhost/file?name=../../etc/passwd",
        "content": ""
    },
]

print("===== Testing sklearn model =====")

for t in tests:
    feat = extract(t["method"], t["url"], t["content"])
    row = np.array([[feat[f] for f in features]])

    pred = clf.predict(row)[0]
    prob = clf.predict_proba(row)[0][1]

    print(f"\n[{t['name']}]")
    print("Prediction:", "Attack" if pred == 1 else "Normal")
    print("Score:", round(prob, 4))
