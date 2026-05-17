#!/bin/bash
# Test script to verify mock API is working

echo "🚗 Car Comparison Mock API - Test Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="${REACT_APP_API_URL:-http://localhost:3000}"

# Function to test API endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo "URL: $API_URL/api/cars$endpoint"
    
    response=$(curl -s "$API_URL/api/cars$endpoint")
    count=$(echo "$response" | grep -o '"id"' | wc -l)
    
    if [ $count -gt 0 ]; then
        echo -e "${GREEN}✓ Success${NC} - Found $count car(s)"
    else
        echo -e "${RED}✗ Failed${NC} - No cars found or endpoint error"
        echo "Response: $response"
    fi
    echo ""
}

# Check if backend is running
echo -e "${YELLOW}Checking if backend is running...${NC}"
if ! curl -s "$API_URL/api/cars?make=Toyota" > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend not running at $API_URL${NC}"
    echo "Please start the backend server:"
    echo "  cd server/backend && npm start"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Test different endpoints
echo -e "${YELLOW}Running API Tests...${NC}"
echo ""

test_endpoint "?make=Toyota" "Get all Toyota cars"
test_endpoint "?make=Honda&model=Civic" "Get Honda Civic"
test_endpoint "?make=Ford&model=Mustang&year=2023" "Get Ford Mustang 2023"
test_endpoint "?make=Tesla" "Get Tesla vehicles"
test_endpoint "?make=BMW&limit=10" "Get BMW with limit"
test_endpoint "" "Get all cars (no filter)"

echo -e "${YELLOW}Test Summary${NC}"
echo "========================================"
echo "If all tests passed with ✓, your mock API is working!"
echo ""
echo "Sample cars in database:"
echo "  - Toyota Camry (2021-2023)"
echo "  - Honda Civic (2021-2023)"
echo "  - Ford Mustang (2022-2023)"
echo "  - BMW 3 Series (2022-2023)"
echo "  - Chevrolet Silverado (2022-2023)"
echo "  - Tesla Model 3 (2022-2023)"
echo ""
echo "Try comparing cars in the frontend!"
