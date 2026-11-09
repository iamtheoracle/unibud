#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "README.md"
  "docs/README.md"
  "docs/product/MASTER-VISION.md"
  "docs/product/SPACE-BOUNDARIES.md"
  "docs/product/PROFILE-ARCHITECTURE.md"
  "docs/architecture/SYSTEM-ARCHITECTURE.md"
  "docs/architecture/DATA-ARCHITECTURE.md"
  "docs/security/SECURITY-BASELINE.md"
  "docs/oracle-arc/ORACLE-ARC-SPEC.md"
  "docs/concierge/CONCIERGE-SPEC.md"
  "docs/operations/OPERATIONS-SPEC.md"
  "docs/quality/TEST-STRATEGY.md"
  "docs/quality/RELEASE-PLAN.md"
  "docs/design/DESIGN-PRINCIPLES.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -s "$file" ]]; then
    echo "Missing or empty foundation file: $file" >&2
    exit 1
  fi
done

echo "UNIBUD foundation documentation integrity: PASS"
