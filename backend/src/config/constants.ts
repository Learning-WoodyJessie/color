/**
 * Application Constants
 * Centralized configuration for server metadata, endpoints, and widget URIs
 */

import { z } from 'zod';

// ============================================================================
// Environment Schema (Zod validation)
// ============================================================================

export const EnvSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // External APIs
  HOMEBUYME_API_KEY: z.string().optional(), // Optional - Homebuyme property API key
  
  // Widgets (optional for local dev)
  MOVIE_POSTER_WIDGET_URL: z.string().optional(),
  
  // Authentication (optional for local dev, required in production)
  ADMIN_API_KEY: z.string().optional(),
});
// Note: LLM API keys are optional - if not provided, the recommendations tool will be disabled

export type Env = z.infer<typeof EnvSchema>;

/**
 * Validate and parse environment variables
 * Throws if validation fails
 */
export function validateEnv(): Env {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

// ============================================================================
// Server Metadata
// ============================================================================

export const SERVER_INFO = {
  name: 'hbm-property-server',
  version: '1.0.0',
  description: 'MCP server for Homebuyme property discovery and management',
} as const;

export const PROTOCOL_VERSION = '2024-11-05' as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const ENDPOINTS = {
  health: '/health',
  root: '/',
  mcp: '/mcp/messages',
} as const;

// ============================================================================
// Widget Configuration
// ============================================================================

export const WIDGET_CONFIG = {
  property: {
    uri: 'ui://widget/property-display',
    name: 'Property Display Widget',
    description: 'Interactive Homebuyme property listing widget',
    mimeType: 'text/html+skybridge',
    rootElementId: 'property-widget-root',
    componentFilename: 'property-component.js',
    widgetDescription:
      'Displays Homebuyme property listings with images, pricing, savings calculations, and neighborhood information.',
  },
} as const;

// ============================================================================
// Transport Configuration
// ============================================================================

export const TRANSPORT_CONFIG = {
  sessionIdGenerator: undefined,
  enableJsonResponse: true,
} as const;

// ============================================================================
// Tool Names (for type safety in switch statements)
// ============================================================================

export const TOOL_NAMES = {
  // Property tools only
  SEARCH_PROPERTIES: 'search_properties',
  CALCULATE_SAVINGS: 'calculate_savings',
  GET_PROPERTY_DETAILS: 'get_property_details',
  SAVE_FAVORITE_PROPERTY: 'save_favorite_property',
  GET_FAVORITE_PROPERTIES: 'get_favorite_properties',
} as const;

// Type-safe tool names
export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];

// ============================================================================
// OpenAI Widget Metadata
// ============================================================================

export const OPENAI_WIDGET_META = {
  widgetAccessible: true,
  resultCanProduceWidget: true,
} as const;

// ============================================================================
// TMDB Genre ID Mapping
// ============================================================================

export const GENRE_MAP: Record<string, string> = {
  'action': '28',
  'adventure': '12',
  'animation': '16',
  'comedy': '35',
  'crime': '80',
  'documentary': '99',
  'drama': '18',
  'family': '10751',
  'fantasy': '14',
  'history': '36',
  'horror': '27',
  'music': '10402',
  'mystery': '9648',
  'romance': '10749',
  'science fiction': '878',
  'sci-fi': '878',
  'thriller': '53',
  'war': '10752',
  'western': '37',
} as const;

