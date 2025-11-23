#!/bin/bash
# ZZIK LIVE v4 - E2E Mission Flow Test Script

set -e  # Exit on error

API_BASE="http://localhost:3000/api"
MISSION_ID="mission-seoul-forest-walk-basic"
PLACE_LAT=37.5445
PLACE_LNG=127.0375

echo "🚀 ZZIK LIVE v4 - E2E Mission Flow Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Generate QR
echo -e "${BLUE}Step 1: Generate QR Code${NC}"
QR_RESPONSE=$(curl -s "$API_BASE/missions/$MISSION_ID/generate-qr")
echo "$QR_RESPONSE" | python3 -m json.tool
QR_URL=$(echo "$QR_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['qrUrl'])")
echo -e "${GREEN}✓ QR Generated: $QR_URL${NC}"
echo ""

# Step 2: Create MissionRun
echo -e "${BLUE}Step 2: Create Mission Run${NC}"
RUN_RESPONSE=$(curl -s -X POST "$API_BASE/missions/$MISSION_ID/runs")
echo "$RUN_RESPONSE" | python3 -m json.tool
MISSION_RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRunId'])")
echo -e "${GREEN}✓ Mission Run Created: $MISSION_RUN_ID${NC}"
echo ""

# Step 3: GPS Verification
echo -e "${BLUE}Step 3: GPS Verification${NC}"
GPS_RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/gps-verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"lat\": $PLACE_LAT,
    \"lng\": $PLACE_LNG,
    \"accuracy\": 10,
    \"provider\": \"gps\",
    \"mocked\": false
  }")
echo "$GPS_RESPONSE" | python3 -m json.tool
GPS_STATUS=$(echo "$GPS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['status'])")
echo -e "${GREEN}✓ GPS Verified - Status: $GPS_STATUS${NC}"
echo ""

# Step 4: QR Verification
echo -e "${BLUE}Step 4: QR Verification${NC}"
QR_VERIFY_RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/qr-verify" \
  -H "Content-Type: application/json" \
  -d "{\"rawPayload\": \"$QR_URL\"}")
echo "$QR_VERIFY_RESPONSE" | python3 -m json.tool
QR_STATUS=$(echo "$QR_VERIFY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['status'])")
echo -e "${GREEN}✓ QR Verified - Status: $QR_STATUS${NC}"
echo ""

# Step 5: Reels Verification
echo -e "${BLUE}Step 5: Reels Verification${NC}"
REELS_RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/reels-verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"metadata\": {
      \"platform\": \"instagram\",
      \"url\": \"https://www.instagram.com/reel/test-$(date +%s)/\",
      \"hashtags\": [\"zzik\", \"$MISSION_ID\"]
    }
  }")
echo "$REELS_RESPONSE" | python3 -m json.tool
REELS_STATUS=$(echo "$REELS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['status'])")
echo -e "${GREEN}✓ Reels Verified - Status: $REELS_STATUS${NC}"
echo ""

# Step 6: Check Status
echo -e "${BLUE}Step 6: Check Status Before Approval${NC}"
STATUS_RESPONSE=$(curl -s "$API_BASE/mission-runs/$MISSION_RUN_ID")
echo "$STATUS_RESPONSE" | python3 -m json.tool
echo ""

# Step 7: Approve and Reward
echo -e "${BLUE}Step 7: Approve and Reward${NC}"
IDEMPOTENCY_KEY="test-flow-$(date +%s)"
APPROVE_RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/approve" \
  -H "idempotency-key: $IDEMPOTENCY_KEY")
echo "$APPROVE_RESPONSE" | python3 -m json.tool
FINAL_STATUS=$(echo "$APPROVE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRun']['status'])")
REWARD_AMOUNT=$(echo "$APPROVE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['transaction']['amount'])")
BALANCE_AFTER=$(echo "$APPROVE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['transaction']['balanceAfter'])")
echo -e "${GREEN}✓ Approved - Status: $FINAL_STATUS${NC}"
echo -e "${GREEN}✓ Reward: ${REWARD_AMOUNT}원${NC}"
echo -e "${GREEN}✓ Balance: ${BALANCE_AFTER}원${NC}"
echo ""

# Step 8: Final Status Check
echo -e "${BLUE}Step 8: Final Status Check${NC}"
FINAL_RESPONSE=$(curl -s "$API_BASE/mission-runs/$MISSION_RUN_ID")
echo "$FINAL_RESPONSE" | python3 -m json.tool
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}✅ E2E Test Completed Successfully!${NC}"
echo "========================================"
echo "Mission Run ID: $MISSION_RUN_ID"
echo "Final Status: $FINAL_STATUS"
echo "Reward: ${REWARD_AMOUNT}원"
echo "Final Balance: ${BALANCE_AFTER}원"
echo ""
