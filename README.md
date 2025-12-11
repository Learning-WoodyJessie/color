# HBM: Multi-Domain MCP Application

A **powerful MCP App** built with the **[OpenAI Apps SDK](https://developers.openai.com/apps-sdk)**, ready to deploy on **[Render](https://render.com)**.  

This application provides multiple integrated tools for:
- 🎨 **Color Management** - Color palettes, conversions, and favorites
- 🎬 **Movie Discovery** - Watchlists, ratings, and AI recommendations
- 🏠 **Properties** *(Coming Soon)* - Real estate and property management
- 🐉 **Custom Features** *(Coming Soon)* - Your custom domain tools

Built with TypeScript, React, PostgreSQL, and featuring multi-provider LLM support.

[![OpenAI Apps SDK](https://img.shields.io/badge/OpenAI-Apps%20SDK-412991?logo=openai)](https://developers.openai.com/apps-sdk)
[![Render](https://img.shields.io/badge/Deploy-Render-9333ea?logo=render)](https://render.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/docs/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql)](https://www.postgresql.org/docs/17/)

---

## 🚀 Quick Start

This is a foundation MCP application that you can extend with your own domain-specific tools.

### Current Features

#### 🎨 Color Tools (6 Tools)
- `get_color_info` - Get detailed info about any color with visual widget
- `generate_palette` - Create color palettes (complementary, analogous, triadic, etc.)
- `random_colors` - Generate random colors
- `convert_color` - Convert between HEX, RGB, HSL
- `save_favorite_color` - Save colors to favorites
- `get_favorites` - View your favorite colors

#### 🎬 Movie Tools (12 Tools)
- `search_movies`, `discover_movies` - Find movies by title, genre, director, actor
- `get_movie_details` - Full movie details with interactive poster widget
- `add_to_watchlist`, `remove_from_watchlist`, `get_watchlist` - Manage watchlist
- `mark_as_watched`, `get_watched_movies` - Track watch history
- `set_preferences`, `get_preferences` - Manage preferences
- `get_recommendations` - AI-powered movie suggestions (requires LLM API key)

### Interactive Widgets
- **Color Display Widget** - Beautiful color swatches with copy-to-clipboard
- **Movie Poster Widget** - Full movie details with actions
- **Movie List Widget** - Grid view for multiple movies
- **Preferences Widget** - Visual preference editor

---

## 📦 Project Structure

```
HBM/
├── backend/
│   ├── src/
│   │   ├── tools/          # MCP tools (colors, movies, properties - coming soon)
│   │   ├── utils/          # Utilities (color-helpers, config, etc.)
│   │   ├── db/             # Database schema and client
│   │   ├── server/         # MCP handlers and tool registry
│   │   └── index.ts        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── widgets/        # React widgets (color, movie, properties - coming soon)
│   └── package.json
└── render.yaml             # Render deployment blueprint
```

---

## 🛠️ Adding New Features

This project is designed to be extended. To add new domain tools:

### 1. Create a New Tool

Create `/backend/src/tools/your-tool.ts`:

```typescript
import { z } from 'zod';

export const YourToolSchema = z.object({
  param: z.string(),
});

export async function yourTool(input: unknown, userId?: number) {
  const validated = YourToolSchema.parse(input);
  
  return {
    content: [{ type: 'text' as const, text: 'Result' }],
    structuredContent: { success: true, data: 'your data' },
    _meta: {
      'openai/outputTemplate': 'ui://widget/your-widget',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
    },
    isError: false,
  };
}

export const yourToolDefinition = {
  name: 'your_tool',
  description: 'What your tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' },
    },
    required: ['param'],
  },
  _meta: {
    'openai/outputTemplate': 'ui://widget/your-widget',
    'openai/widgetAccessible': true,
    'openai/resultCanProduceWidget': true,
  },
};
```

### 2. Register the Tool

Add to `/backend/src/server/tool-registry.ts`:

```typescript
import { yourTool, yourToolDefinition } from '../tools/your-tool.js';

// In getToolDefinitions():
const tools = [
  // ... existing tools
  yourToolDefinition,
];

// In callTool():
case 'your_tool':
  return await yourTool(args, userId);
```

### 3. Create a Widget (Optional)

Create `/frontend/src/widgets/your-widget.tsx` following the pattern in `color.tsx` or `poster.tsx`.

### 4. Update Constants

Add to `/backend/src/config/constants.ts`:

```typescript
export const WIDGET_CONFIG = {
  // ... existing widgets
  yourWidget: {
    uri: 'ui://widget/your-widget',
    name: 'Your Widget',
    description: 'Description',
    mimeType: 'text/html+skybridge',
    rootElementId: 'your-widget-root',
    componentFilename: 'your-widget-component.js',
    widgetDescription: 'Widget description',
  },
};

export const TOOL_NAMES = {
  // ... existing tools
  YOUR_TOOL: 'your_tool',
};
```

---

## 🚀 Deployment to Render

### Prerequisites

Get your API keys:
- **TMDB API Key** (optional - only for movie features): https://www.themoviedb.org/settings/api
- **OpenAI API Key** (optional - only for AI recommendations): https://platform.openai.com/api-keys

### Deploy Steps

1. **Push to GitHub** (already done!)
2. **Go to Render**: https://dashboard.render.com/
3. **New Blueprint**: Connect your `Learning-WoodyJessie/HBM` repository
4. **Add Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI key (optional)
   - `TMDB_API_KEY`: Your TMDB key (optional)
   - `ADMIN_API_KEY`: Any random string for auth
5. **Deploy**: Click "Apply"

Render will automatically provision:
- ✅ PostgreSQL database
- ✅ Valkey cache
- ✅ Backend MCP server
- ✅ Frontend widgets
- ✅ HTTPS domains

### Connect to ChatGPT

After deployment:
1. Get your MCP URL from Render logs
2. In ChatGPT: Settings → Apps and connectors → Create
3. Paste your MCP URL
4. Set Authentication to "No Auth"
5. Enable in a chat and start using!

---

## 🎯 Roadmap

### Planned Features

- 🏠 **Properties Module** - Real estate management tools
- 🐉 **Custom GOT Features** - Your custom domain tools
- 📊 **Analytics Dashboard** - Usage tracking and insights
- 🔐 **Enhanced Auth** - OAuth 2.0 support
- 📱 **Mobile Widgets** - Responsive widget designs

---

## 🛠️ Development

### Local Setup

```bash
# Backend
cd backend
npm install
cp env.example .env
# Edit .env with your API keys
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Variables

See `backend/env.example` for all available configuration options.

---

## 📚 Resources

- [OpenAI Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Render Documentation](https://render.com/docs)
- [TMDB API Docs](https://developers.themoviedb.org/)
- [Original Color App Repo](https://github.com/Learning-WoodyJessie/color)

---

## 📝 License

MIT License - See LICENSE file for details.

This is an extension of the movie-context-provider demo, customized for multi-domain MCP applications.

---

## 🤝 Contributing

This is your personal project foundation. Feel free to:
- Add new domain-specific tools
- Create custom widgets
- Extend the database schema
- Share your learnings!

---

**Questions?** Open an issue or refer to the detailed comments in the codebase!
