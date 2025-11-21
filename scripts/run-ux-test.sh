#!/usr/bin/env bash
set -euo pipefail

SCENARIO="${1:-MAP_BASIC_FLOW}"

echo "🔎 Checking dev server at http://localhost:3000 ..."

if ! curl -fsS "http://localhost:3000" >/dev/null 2>&1; then
  echo "⚠️  Dev server not running. Starting 'pnpm --filter web dev' ..."
  pnpm --filter web dev >/dev/null 2>&1 &
  DEV_PID=$!
  echo "➡️  Started dev server (PID=${DEV_PID}). Waiting for readiness..."

  # 대충 60초까지 대기
  for i in $(seq 1 30); do
    if curl -fsS "http://localhost:3000" >/dev/null 2>&1; then
      echo "✅ Dev server is up."
      break
    fi
    sleep 2
    echo -n "."
  done
else
  echo "✅ Dev server already running."
fi

echo
echo "📄 Available scenarios (from docs/ux/SCENARIOS_ENHANCED.md):"
if [ -f "docs/ux/SCENARIOS_ENHANCED.md" ]; then
  # '## '로 시작하는 시나리오 헤더만 출력
  grep '^## ' docs/ux/SCENARIOS_ENHANCED.md || true
else
  echo "  (docs/ux/SCENARIOS_ENHANCED.md 파일이 아직 없습니다)"
fi

echo
echo "🚀 To run Claude Code with this UX tester agent, execute:"
echo "  claude --add-dir . \\"
echo "    --mcp-config playwright-mcp.config.json \\"
echo "    --agents \"\$(cat ux-agents.json)\""

echo
echo "Then ask Claude:"
echo "\"ux-tester 에이전트로 ${SCENARIO} 시나리오를 실행하고 결과를 리포트해.\""
