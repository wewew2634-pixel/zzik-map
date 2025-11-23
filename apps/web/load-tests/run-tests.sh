#!/bin/bash
# ZZIK LIVE v4 - Load Test Runner Script
# Convenience script for running k6 load tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
RESULTS_DIR="load-tests/results"

# Print banner
echo -e "${BLUE}"
echo "========================================"
echo "  ZZIK LIVE v4 - Load Test Runner"
echo "========================================"
echo -e "${NC}"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Please install k6 first:"
    echo "  macOS:   brew install k6"
    echo "  Linux:   See load-tests/README.md"
    echo "  Windows: choco install k6"
    exit 1
fi

echo -e "k6 version: ${GREEN}$(k6 version)${NC}"

# Check if server is running
echo -e "\nChecking server at ${YELLOW}${BASE_URL}${NC}..."
if curl -s -f "${BASE_URL}/api/health" > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not responding at ${BASE_URL}${NC}"
    echo "Please start the server first: npm run dev"
    exit 1
fi

# Create results directory
mkdir -p "${RESULTS_DIR}"

# Function to run a test
run_test() {
    local test_name=$1
    local test_file=$2
    local duration=$3

    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo -e "${BLUE}Duration: ~${duration}${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    local timestamp=$(date +%Y%m%d-%H%M%S)
    local result_file="${RESULTS_DIR}/${test_name}-${timestamp}"

    k6 run \
        --out "json=${result_file}.json" \
        --summary-export="${result_file}-summary.json" \
        --env BASE_URL="${BASE_URL}" \
        "load-tests/${test_file}" | tee "${result_file}.log"

    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✓ ${test_name} completed successfully${NC}"
    else
        echo -e "\n${YELLOW}⚠ ${test_name} completed with warnings${NC}"
    fi

    echo -e "Results saved to: ${result_file}.*"

    return $exit_code
}

# Parse command line arguments
TEST_TYPE="${1:-menu}"

run_all_tests() {
    echo -e "\n${YELLOW}Running all tests (this will take ~25 minutes)${NC}\n"

    run_test "baseline" "baseline.js" "4 minutes"
    sleep 5  # Cool down between tests

    run_test "mission-flow" "mission-flow.js" "8 minutes"
    sleep 5

    run_test "stress" "stress.js" "13 minutes"

    echo -e "\n${GREEN}All tests completed!${NC}"
    echo -e "Results are in: ${RESULTS_DIR}/"
}

# Interactive menu
show_menu() {
    echo ""
    echo "Select test to run:"
    echo "  1) Baseline Test (4 min, 50 users)"
    echo "  2) Mission Flow Test (8 min, 100 users)"
    echo "  3) Stress Test (13 min, 500 users)"
    echo "  4) All Tests (~25 min)"
    echo "  5) Custom Test (specify file)"
    echo "  6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice

    case $choice in
        1)
            run_test "baseline" "baseline.js" "4 minutes"
            ;;
        2)
            run_test "mission-flow" "mission-flow.js" "8 minutes"
            ;;
        3)
            run_test "stress" "stress.js" "13 minutes"
            ;;
        4)
            run_all_tests
            ;;
        5)
            read -p "Enter test file name: " custom_file
            run_test "custom" "${custom_file}" "unknown"
            ;;
        6)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            show_menu
            ;;
    esac
}

# Main execution
case $TEST_TYPE in
    baseline)
        run_test "baseline" "baseline.js" "4 minutes"
        ;;
    mission-flow)
        run_test "mission-flow" "mission-flow.js" "8 minutes"
        ;;
    stress)
        run_test "stress" "stress.js" "13 minutes"
        ;;
    all)
        run_all_tests
        ;;
    menu)
        show_menu
        ;;
    *)
        echo "Usage: $0 [baseline|mission-flow|stress|all|menu]"
        echo ""
        echo "Examples:"
        echo "  $0              # Show interactive menu"
        echo "  $0 baseline     # Run baseline test"
        echo "  $0 all          # Run all tests"
        echo ""
        echo "Environment variables:"
        echo "  BASE_URL        # Target URL (default: http://localhost:3000)"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Done!${NC}"
