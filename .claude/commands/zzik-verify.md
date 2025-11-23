---
description: 작업 완료 검증 및 누락 사항 체크 (자동 교차 검증)
---

# 🔍 ZZIK 작업 검증

이전 작업을 철저히 검증하고 누락 사항을 찾아냅니다.

## 검증 대상

1. **파일 작업**:
   - 생성 예정 파일이 실제로 생성되었는가?
   - 수정 예정 파일이 올바르게 수정되었는가?
   - 삭제 예정 파일/폴더가 완전히 삭제되었는가?

2. **설정 변경**:
   - `.claude/settings.json` 프로젝트 정보
   - `.claude/settings.local.json` 권한 경로
   - `.claude/mcp-settings.json` MCP 설정
   - `package.json` 메타 정보
   - `README.md` 프로젝트 문서

3. **프로젝트 상태**:
   - v5.1 잔재물 완전 제거 여부
   - Scenario 5 반영 완성도
   - 불필요 폴더/파일 존재 여부
   - 경로 일관성 (zzik-live vs zzik-map)

4. **수치 검증**:
   - 주장한 용량 절감량 vs 실제
   - "100% 완료" 주장의 정확성
   - 파일 개수 주장 vs 실제

## 검증 프로세스

### Step 1: 핵심 설정 파일 체크

```bash
# 프로젝트 이름
grep '"name"' /home/ubuntu/work/zzik-map/.claude/settings.json
grep '"name"' /home/ubuntu/work/zzik-map/package.json

# 경로 일관성
grep -c "zzik-live" /home/ubuntu/work/zzik-map/.claude/settings.local.json
grep "PRISMA_SCHEMA_PATH" /home/ubuntu/work/zzik-map/.claude/mcp-settings.json
```

### Step 2: 불필요 파일/폴더 스캔

```bash
# 루트 v5.1 잔재
ls -la /home/ubuntu/work/zzik-map/ | grep -E "(coverage|artifacts|health-check|figma|growth-loop|self-heal)"

# apps/web/ 내부 잔재
ls -d /home/ubuntu/work/zzik-map/apps/web/{coverage,playwright-report,test-results} 2>/dev/null

# JSON/HTML 리포트 파일
find /home/ubuntu/work/zzik-map -name "*report*.json" -o -name "*report*.html" ! -path "*/node_modules/*" ! -path "*/.next/*"
```

### Step 3: Agent/Skills 확인

```bash
# Agents 개수
ls -1 /home/ubuntu/work/zzik-map/.claude/agents/*.md 2>/dev/null | wc -l

# Skills 개수
ls -d /home/ubuntu/work/zzik-map/.claude/skills/*/ 2>/dev/null | wc -l

# Commands 개수
ls -1 /home/ubuntu/work/zzik-map/.claude/commands/*.md 2>/dev/null | wc -l
```

### Step 4: 프로젝트 크기 측정

```bash
# 전체 크기
du -sh /home/ubuntu/work/zzik-map

# 빌드 제외 크기
du -sh /home/ubuntu/work/zzik-map --exclude=node_modules --exclude=.next
```

## 검증 보고서 생성

검증 완료 후 다음 형식으로 보고:

```markdown
# 🔍 검증 보고서

**검증 시각**: [현재 시각]
**주장**: "[이전 AI의 주장]"

## 검증 결과

| 카테고리 | 약속 | 실제 | 달성률 |
|----------|------|------|--------|
| 설정 파일 | N개 | N개 | X% |
| 파일 삭제 | N개 | N개 | X% |
| Agent/Skills | N개 | N개 | X% |
| **전체** | **N개** | **N개** | **X%** |

## ✅ 완료된 항목

1. ✅ [항목] - 검증 완료
2. ✅ [항목] - 검증 완료

## ❌ 누락된 항목

1. ❌ [항목] - [문제 설명]
   - 위치: [파일 경로]
   - 수정 명령: `[bash 명령]`

## 🎯 정직한 평가

**실제 달성률**: X/100점

**즉시 개발 가능**: [예/아니오]

**권장 조치**: [수정 사항]
```

## 자동 수정 스크립트

누락 사항 발견 시 즉시 수정 명령 제공:

```bash
#!/bin/bash
# 자동 수정 스크립트

# 1. settings.json 수정
sed -i 's/"ZZIK LIVE"/"ZZIK Map"/g' .claude/settings.json
sed -i 's/"4.0.0"/"0.1.0"/g' .claude/settings.json

# 2. settings.local.json 경로 수정
sed -i 's/zzik-live/zzik-map/g' .claude/settings.local.json

# 3. 불필요 폴더 삭제
rm -rf apps/web/{coverage,playwright-report,test-results}

# 4. 검증
echo "✅ 수정 완료. 재검증 중..."
bash scripts/verify-completion.sh
```

## 사용 예시

**작업 완료 후**:
```
작업자: "README 업데이트하고 설정 3개 수정했습니다. 100% 완료!"
사용자: "/zzik-verify"
검증 Agent: [철저한 검증 후 정직한 보고]
```

**정기 검증**:
```
사용자: "/zzik-verify"
검증 Agent: "현재 프로젝트 상태를 전수 조사합니다..."
```

---

**검증 Agent를 활성화합니다. 엄격하고 정직하게 검증하세요!** 🔍
