#!/bin/bash
# ZZIK LIVE v4 - Verification Failure Test Script

API_BASE="http://localhost:3000/api"
MISSION_ID="mission-seoul-forest-walk-basic"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 ZZIK LIVE v4 - Verification Failure Tests"
echo "=============================================="
echo ""

test_failure() {
    local test_name=$1
    local response=$2
    local expected_error=$3

    echo -e "${BLUE}Test: $test_name${NC}"
    echo "$response" | python3 -m json.tool

    if echo "$response" | grep -q "\"ok\": false"; then
        ERROR_CODE=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['error']['code'])" 2>/dev/null || echo "UNKNOWN")
        if [[ "$ERROR_CODE" == "$expected_error" ]]; then
            echo -e "${GREEN}✓ Expected failure: $ERROR_CODE${NC}"
        else
            echo -e "${YELLOW}⚠ Unexpected error: $ERROR_CODE (expected: $expected_error)${NC}"
        fi
    else
        echo -e "${RED}✗ Test should have failed but passed!${NC}"
    fi
    echo ""
}

# Create a new mission run for testing
echo -e "${BLUE}Creating test mission run...${NC}"
RUN_RESPONSE=$(curl -s -X POST "$API_BASE/missions/$MISSION_ID/runs")
MISSION_RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRunId'])")
echo -e "${GREEN}✓ Created: $MISSION_RUN_ID${NC}"
echo ""

# Test 1: GPS - Too far away
echo "========== GPS Failure Tests =========="
RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/gps-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 37.6000,
    "lng": 127.1000,
    "accuracy": 10,
    "provider": "gps",
    "mocked": false
  }')
test_failure "GPS - Too far from place" "$RESPONSE" "VALIDATION_ERROR"

# Reset mission run
RUN_RESPONSE=$(curl -s -X POST "$API_BASE/missions/$MISSION_ID/runs")
MISSION_RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRunId'])")

# Test 2: GPS - Low accuracy
RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/gps-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 37.5445,
    "lng": 127.0375,
    "accuracy": 150,
    "provider": "gps",
    "mocked": false
  }')
test_failure "GPS - Low accuracy (>80m)" "$RESPONSE" "VALIDATION_ERROR"

# Reset mission run
RUN_RESPONSE=$(curl -s -X POST "$API_BASE/missions/$MISSION_ID/runs")
MISSION_RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRunId'])")

# Test 3: GPS - Mock location detected
RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/gps-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 37.5445,
    "lng": 127.0375,
    "accuracy": 10,
    "provider": "mock",
    "mocked": true
  }')
test_failure "GPS - Mock location detected" "$RESPONSE" "VALIDATION_ERROR"

# Create new run and pass GPS for QR tests
RUN_RESPONSE=$(curl -s -X POST "$API_BASE/missions/$MISSION_ID/runs")
MISSION_RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRunId'])")
curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/gps-verify" \
  -H "Content-Type: application/json" \
  -d '{"lat":37.5445,"lng":127.0375,"accuracy":10,"mocked":false}' > /dev/null

# Test 4: QR - Invalid signature
echo "========== QR Failure Tests =========="
RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/qr-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "rawPayload": "zzik://mission?mid=mission-seoul-forest-walk-basic&pid=seoul-forest-walk&nonce=fake-nonce&sig=invalidsignature123"
  }')
test_failure "QR - Invalid signature" "$RESPONSE" "VALIDATION_ERROR"

# Reset and pass GPS+QR for Reels tests
RUN_RESPONSE=$(curl -s -X POST "$API_BASE/missions/$MISSION_ID/runs")
MISSION_RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRunId'])")
curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/gps-verify" \
  -H "Content-Type: application/json" \
  -d '{"lat":37.5445,"lng":127.0375,"accuracy":10,"mocked":false}' > /dev/null
QR_URL=$(curl -s "$API_BASE/missions/$MISSION_ID/generate-qr" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['qrUrl'])")
curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/qr-verify" \
  -H "Content-Type: application/json" \
  -d "{\"rawPayload\": \"$QR_URL\"}" > /dev/null

# Test 5: Reels - Missing hashtags
echo "========== Reels Failure Tests =========="
RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/reels-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "platform": "instagram",
      "url": "https://www.instagram.com/reel/test123/",
      "hashtags": ["only-one-tag"]
    }
  }')
test_failure "Reels - Missing required hashtags" "$RESPONSE" "VALIDATION_ERROR"

# Reset for next test
RUN_RESPONSE=$(curl -s -X POST "$API_BASE/missions/$MISSION_ID/runs")
MISSION_RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['missionRunId'])")
curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/gps-verify" \
  -H "Content-Type: application/json" \
  -d '{"lat":37.5445,"lng":127.0375,"accuracy":10,"mocked":false}' > /dev/null
QR_URL=$(curl -s "$API_BASE/missions/$MISSION_ID/generate-qr" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['qrUrl'])")
curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/qr-verify" \
  -H "Content-Type: application/json" \
  -d "{\"rawPayload\": \"$QR_URL\"}" > /dev/null

# Test 6: Reels - Invalid URL
RESPONSE=$(curl -s -X POST "$API_BASE/mission-runs/$MISSION_RUN_ID/reels-verify" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "platform": "instagram",
      "url": "https://www.facebook.com/video/123/",
      "hashtags": ["zzik", "mission-seoul-forest-walk-basic"]
    }
  }')
test_failure "Reels - Invalid Instagram URL" "$RESPONSE" "VALIDATION_ERROR"

echo "=============================================="
echo -e "${GREEN}✅ All failure tests completed!${NC}"
echo "=============================================="
