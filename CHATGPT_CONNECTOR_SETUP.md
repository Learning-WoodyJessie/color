# ChatGPT Custom GPT Actions Setup Guide

This guide provides all the information needed to connect your HomeBuyMe Property API to ChatGPT as a Custom GPT Action.

## 🔄 About the REST API Layer

**Important:** ChatGPT Custom GPT Actions requires REST APIs with OpenAPI specifications. Your existing MCP connector at `/mcp/messages` works great for MCP clients (like Claude Desktop), but ChatGPT needs REST endpoints.

The REST API routes (`/api/*`) are **thin wrappers** around your existing MCP tools - they use the exact same functions:
- `searchProperties()` 
- `calculatePropertySavings()`
- `getPropertyDetails()`
- etc.

**No code duplication** - just exposing the same tools in REST format for ChatGPT compatibility.

You can use **both simultaneously**:
- MCP endpoint (`/mcp/messages`) for MCP clients
- REST API (`/api/*`) for ChatGPT Custom GPT Actions

## ⚠️ Widget Support Limitation

**Important:** Widgets (interactive property displays) work fully with **MCP protocol** but have **limited/no support** in **ChatGPT Custom GPT Actions**.

- ✅ **MCP Clients (Claude Desktop)**: Full widget support via MCP resources
- ❌ **ChatGPT Custom GPT Actions**: Widgets may not render (OpenAPI doesn't support MCP resources)

**Why:** Widgets require MCP resources (`ui://widget/property-display`) which are part of the MCP protocol. ChatGPT Custom GPT Actions uses OpenAPI/REST which doesn't support MCP resources.

**Workaround:** The REST API includes widget metadata in responses, but ChatGPT may ignore it. For full widget functionality, use the MCP endpoint with MCP-compatible clients.

## 📋 Information for OpenAPI Spec

### 1. Base URL

**Production:** `https://your-api-domain.com`  
**Local Development:** `http://localhost:3001`

⚠️ **Important:** Replace `your-api-domain.com` with your actual deployed API URL (e.g., from Render, Railway, or your hosting provider).

### 2. Available Endpoints

#### Property Search
- **Endpoint:** `GET /api/properties/search`
- **Description:** Search for properties by state with optional filters (city, price range, pagination)
- **Example:** `GET /api/properties/search?state=WA&city=Seattle&minPrice=500000&maxPrice=2000000`

#### Calculate Savings
- **Endpoint:** `POST /api/savings/calculate`
- **Description:** Calculate potential savings on a home purchase
- **Example:** `POST /api/savings/calculate` with body `{"price": 1000000}`

#### Get Property Details
- **Endpoint:** `GET /api/properties/{propertyId}`
- **Description:** Get detailed information about a specific property
- **Example:** `GET /api/properties/prop_12345?state=WA`

#### Get Favorites
- **Endpoint:** `GET /api/favorites`
- **Description:** Get user's saved favorite properties
- **Example:** `GET /api/favorites`

#### Save Favorite
- **Endpoint:** `POST /api/favorites`
- **Description:** Save a property to user's favorites
- **Example:** `POST /api/favorites` with body `{"propertyId": "prop_12345", "state": "WA", "notes": "Great location"}`

### 3. What the API Does

The HomeBuyMe Property API provides:

- **Property Search:** Search for available properties in supported states (WA, CA) with filters for city, price range, and pagination
- **Savings Calculation:** Calculate potential savings from avoiding buyer-agent fees (≈3%) and HomeBuyMe price advantages
- **Property Details:** Get comprehensive property information including:
  - Property address, price, and features (bedrooms, bathrooms, sqft)
  - Savings breakdown (list price vs HomeBuyMe price, buyer agent fee avoided, total savings)
  - Neighborhood information and vibe descriptions
  - Offer availability status
- **Favorite Management:** Save and retrieve favorite properties with optional notes

### 4. Authentication

**Type:** Bearer Token (API Key)

**How it works:**
- All endpoints require authentication via API key
- Include the API key in the `Authorization` header: `Authorization: Bearer YOUR_API_KEY`
- API keys are user-specific and can be generated through:
  - Admin endpoints (`/admin/users/create`)
  - Script: `npm run create-user` (see backend/scripts/create-user.sh)

**Example:**
```bash
curl -H "Authorization: Bearer your_api_key_here" \
     https://your-api-domain.com/api/properties/search?state=WA
```

### 5. Example Input/Output

#### Example 1: Search Properties

**Request:**
```bash
GET /api/properties/search?state=WA&city=Seattle&minPrice=500000&maxPrice=2000000&page=1&perPage=20
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "properties": [
    {
      "id": "prop_12345",
      "property_address_display_name": "123 Main St, Seattle, WA",
      "property_address": {
        "property_address": "123 Main St",
        "city": "Seattle",
        "county": "King County",
        "state": "WA",
        "zip": "98101"
      },
      "property_price": 1000000,
      "property_price_with_hbm": 980000,
      "property_type": "Single Family",
      "status": "Active",
      "property_image": "https://example.com/images/prop12345.jpg",
      "bedrooms": 3,
      "bathrooms": 2.5,
      "sqft": 2500,
      "savings": {
        "listPrice": 1000000,
        "hbmPrice": 980000,
        "priceDifference": 20000,
        "buyerAgentFee": 30000,
        "totalSavings": 50000
      },
      "vibe": "Family-friendly neighborhood with great schools",
      "supportsOffers": true,
      "partner_site_property_website": "https://example.com/property/12345"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "expansionMessage": "HomeBuyMe is currently available in Washington and California"
}
```

#### Example 2: Calculate Savings

**Request:**
```bash
POST /api/savings/calculate
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "price": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "listPrice": 1000000,
  "buyerAgentFee": 30000,
  "plans": {
    "basic": {
      "price": 499,
      "description": "Guided offer + attorney review + eSign"
    },
    "premium": {
      "price": 899,
      "description": "Priority review, live consults, and counter-offer support"
    }
  },
  "formattedSavings": {
    "buyerAgentFee": "$30,000"
  }
}
```

#### Example 3: Get Property Details

**Request:**
```bash
GET /api/properties/prop_12345?state=WA
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "properties": [
    {
      "id": "prop_12345",
      "property_address_display_name": "123 Main St, Seattle, WA",
      "property_address": {
        "property_address": "123 Main St",
        "city": "Seattle",
        "county": "King County",
        "state": "WA"
      },
      "property_price": 1000000,
      "property_price_with_hbm": 980000,
      "property_type": "Single Family",
      "status": "Active",
      "savings": {
        "listPrice": 1000000,
        "hbmPrice": 980000,
        "priceDifference": 20000,
        "buyerAgentFee": 30000,
        "totalSavings": 50000
      },
      "vibe": "Family-friendly neighborhood with great schools",
      "supportsOffers": true,
      "partner_site_property_website": "https://example.com/property/12345"
    }
  ]
}
```

## 📄 OpenAPI Specification

A complete OpenAPI 3.1.0 specification file has been created at:
**`backend/openapi.yaml`**

This file contains:
- All endpoint definitions
- Request/response schemas
- Authentication requirements
- Parameter descriptions
- Example values

## 🚀 Setup Instructions

### Step 1: Deploy Your API

1. Deploy your backend to a hosting service (Render, Railway, Heroku, etc.)
2. Note your production URL (e.g., `https://hbm-api.onrender.com`)

### Step 2: Update OpenAPI Spec

1. Open `backend/openapi.yaml`
2. Replace `https://your-api-domain.com` with your actual production URL
3. Save the file

### Step 3: Create an API Key

1. Use the admin endpoint or script to create a user and API key:
   ```bash
   # Via script
   cd backend
   npm run create-user
   
   # Or via admin endpoint (if configured)
   POST /admin/users/create
   ```

2. Save your API key securely

### Step 4: Add to ChatGPT Custom GPT

1. Go to ChatGPT → Create a GPT → Configure → Actions
2. Click "Import from URL" or paste the OpenAPI spec
3. If using URL, host the `openapi.yaml` file and provide the URL
4. If pasting, copy the contents of `backend/openapi.yaml` and paste it
5. Set the authentication:
   - Type: API Key
   - Auth Type: Bearer Token
   - API Key: Your generated API key
6. Save and test

### Step 5: Test the Connection

In your Custom GPT, try:
- "Search for properties in Washington state"
- "Calculate savings on a $1 million home"
- "Show me properties in Seattle under $2 million"

## 🔧 Local Development

For local testing:

1. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Use `http://localhost:3001` as the base URL in your OpenAPI spec

3. Create a test user and API key:
   ```bash
   npm run create-user
   ```

4. Use the local URL and API key in ChatGPT Custom GPT Actions

## 📝 Notes

- All endpoints require authentication via Bearer token
- Supported states: WA (Washington), CA (California)
- Property search supports pagination (default 20 per page, max 100)
- Savings calculation is based on 3% buyer-agent fee avoidance
- Favorite properties are user-specific and require authentication

## 🐛 Troubleshooting

**401 Unauthorized:**
- Check that your API key is correct
- Ensure the `Authorization: Bearer YOUR_API_KEY` header is included

**404 Not Found:**
- Verify the base URL is correct
- Check that the endpoint path matches exactly (case-sensitive)

**500 Internal Server Error:**
- Check server logs
- Verify database connection
- Ensure HOMEBUYME_API_KEY environment variable is set

## 📚 Additional Resources

- OpenAPI 3.1.0 Specification: `backend/openapi.yaml`
- API Routes: `backend/src/routes/api.ts`
- Tool Definitions: `backend/src/tools/properties.ts`

