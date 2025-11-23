#!/bin/bash
set -Eeuo pipefail

ROOT_DIR="${CODEX_ROOT_DIR:-/home/ubuntu/work/zzik-live}"
REQUEST_DIR="${CODEX_REQUEST_DIR:-$ROOT_DIR/docs/backend/requests}"
PENDING_DIR="${PENDING_DIR:-$REQUEST_DIR/pending}"
DONE_DIR="${DONE_DIR:-$REQUEST_DIR/done}"
FAILED_DIR="${FAILED_DIR:-$REQUEST_DIR/failed}"
MASTER_FILE="${CODEX_MASTER_FILE:-$ROOT_DIR/docs/backend/ZZIK_BACKEND_MASTER.md}"
LOG_DIR="${CODEX_LOG_DIR:-$ROOT_DIR/.codex-auto/logs}"
LOOP_INTERVAL="${CODEX_LOOP_INTERVAL:-300}"
NVM_SH="${NVM_SH:-$HOME/.nvm/nvm.sh}"

mkdir -p "$PENDING_DIR" "$DONE_DIR" "$FAILED_DIR" "$LOG_DIR"

if [[ -f "$NVM_SH" ]]; then
  source "$NVM_SH"
  nvm use 20 >/dev/null
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI not found in PATH." >&2
  exit 1
fi

if [[ ! -f "$MASTER_FILE" ]]; then
  echo "Master prompt missing: $MASTER_FILE" >&2
  exit 1
fi

readarray -t CODEX_ARGS < <(printf '%s\n' --cd "$ROOT_DIR" --sandbox workspace-write)
CODEX_ARGS+=(--full-auto)

if [[ -n "${CODEX_MODEL:-}" ]]; then
  CODEX_ARGS+=(-m "$CODEX_MODEL")
fi
if [[ -n "${CODEX_PROFILE:-}" ]]; then
  CODEX_ARGS+=(-p "$CODEX_PROFILE")
fi

MASTER_PROMPT="$(cat "$MASTER_FILE")"

loop=0
while true; do
  echo "[$(date --iso-8601=seconds)] Codex auto loop pass #$loop" | tee -a "$LOG_DIR/loop.log"
  shopt -s nullglob
  REQUEST_FILES=("$PENDING_DIR"/*.request)
  shopt -u nullglob
  echo "[$(date --iso-8601=seconds)] Pending files: ${#REQUEST_FILES[@]}" | tee -a "$LOG_DIR/loop.log"
  for request_path in "${REQUEST_FILES[@]}"; do
    if [[ ! -s "$request_path" ]]; then
      continue
    fi
    req_name="$(basename "$request_path" .request)"
    timestamp="$(date +%Y%m%d-%H%M%S)"
    log_file="$LOG_DIR/${req_name}-${timestamp}.log"
    echo "[$(date --iso-8601=seconds)] Processing $request_path" | tee -a "$LOG_DIR/loop.log"
    {
      echo "$MASTER_PROMPT"
      echo
      cat "$request_path"
    } | codex exec "${CODEX_ARGS[@]}" - | tee "$log_file"
    exit_code=$?
    dest_dir="$DONE_DIR"
    if [[ $exit_code -ne 0 ]]; then
      echo "Codex run failed for $request_path (details in $log_file)" | tee -a "$LOG_DIR/loop.log"
      dest_dir="$FAILED_DIR"
    fi
    mv "$request_path" "$dest_dir/${req_name}-${timestamp}.request"
    sleep 5
  done
  loop=$((loop + 1))
  sleep "$LOOP_INTERVAL"
done
