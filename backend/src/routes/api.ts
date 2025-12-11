/**
 * REST API Routes for ChatGPT Custom GPT Actions
 * These endpoints wrap the existing MCP tools for use with OpenAPI spec
 */

import express from 'express';
import { authenticateApiKey } from '../middleware/auth.js';
import {
  searchProperties,
  calculatePropertySavings,
  getPropertyDetails,
  saveFavoriteProperty,
  getFavoriteProperties,
} from '../tools/properties.js';

// Note: Widget metadata is included in responses, but ChatGPT Custom GPT Actions
// may not support MCP-style widgets. Widgets work fully with MCP protocol.

const router = express.Router();

/**
 * Search properties by state
 * GET /api/properties/search
 */
router.get('/properties/search', authenticateApiKey, async (req, res) => {
  try {
    const { state, city, minPrice, maxPrice, page, perPage } = req.query;
    
    const input = {
      state: state as string,
      city: city as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : 20,
    };

    const result = await searchProperties(input, req.userId);
    
    if (result.isError) {
      return res.status(400).json(result.structuredContent);
    }

    // Include widget metadata if available (may not work with Custom GPT Actions)
    const response: any = result.structuredContent;
    if (result._meta) {
      response._meta = result._meta;
    }

    res.json(response);
  } catch (error) {
    console.error('Error in /api/properties/search:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Calculate savings for a home purchase
 * POST /api/savings/calculate
 */
router.post('/savings/calculate', authenticateApiKey, async (req, res) => {
  try {
    const { price } = req.body;
    
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price. Must be a positive number.',
      });
    }

    const result = await calculatePropertySavings({ price }, req.userId);
    
    if (result.isError) {
      return res.status(400).json(result.structuredContent);
    }

    res.json(result.structuredContent);
  } catch (error) {
    console.error('Error in /api/savings/calculate:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get property details by ID
 * GET /api/properties/:propertyId
 */
router.get('/properties/:propertyId', authenticateApiKey, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { state } = req.query;

    if (!state || typeof state !== 'string' || state.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'State parameter is required (2-letter code, e.g., WA, CA)',
      });
    }

    const result = await getPropertyDetails(
      { propertyId, state },
      req.userId
    );

    if (result.isError) {
      return res.status(404).json(result.structuredContent);
    }

    // Include widget metadata if available (may not work with Custom GPT Actions)
    const response: any = result.structuredContent;
    if (result._meta) {
      response._meta = result._meta;
    }

    res.json(response);
  } catch (error) {
    console.error('Error in /api/properties/:propertyId:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Save a property to favorites
 * POST /api/favorites
 */
router.post('/favorites', authenticateApiKey, async (req, res) => {
  try {
    const { propertyId, state, notes } = req.body;

    if (!propertyId || !state) {
      return res.status(400).json({
        success: false,
        error: 'propertyId and state are required',
      });
    }

    const result = await saveFavoriteProperty(
      { propertyId, state, notes },
      req.userId
    );

    if (result.isError) {
      return res.status(400).json(result.structuredContent);
    }

    res.json(result.structuredContent);
  } catch (error) {
    console.error('Error in /api/favorites:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get user's favorite properties
 * GET /api/favorites
 */
router.get('/favorites', authenticateApiKey, async (req, res) => {
  try {
    const result = await getFavoriteProperties({}, req.userId);

    if (result.isError) {
      return res.status(400).json(result.structuredContent);
    }

    // Include widget metadata if available (may not work with Custom GPT Actions)
    const response: any = result.structuredContent;
    if (result._meta) {
      response._meta = result._meta;
    }

    res.json(response);
  } catch (error) {
    console.error('Error in /api/favorites:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

