# SEO Strategist AI

A professional-grade SEO audit and strategy platform powered by Replit Agent and Google Gemini.

## Features

- **Technical SEO Audits**: Full page analysis including Load Time, Meta Tags, Headers, and Keyword Density.
- **AI Keyword Clustering**: Group keywords by semantic intent and difficulty using Gemini AI.
- **Content Briefs**: Generate optimized content outlines.
- **Bot Protection Handling**: Detects blocked crawls and allows manual HTML input.
- **Analytics Dashboard**: key performance indicators.

## Development Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your keys:

   ```bash
   cp .env.example .env
   ```

   - `GEMINI_API_KEY`: Required for AI features.
   - `DATABASE_URL`: Optional (defaults to in-memory).

3. **Run Development Server**

   ```bash
   npm run dev
   ```

   Access at `http://localhost:5000`.

## Production Deployment

1. **Build**

   ```bash
   npm run build
   ```

2. **Start**

   ```bash
   npm start
   ```

## Adding New SEO Rules

To add new technical checks to the auditor:

1. **Update Analyze Function**:
   Edit `server/seo.ts` in the `analyzeUrl` function. Add your logic to the `recommendations` array or `score` calculation.

   ```typescript
   // Example: Check for canonical tag
   const canonical = $('link[rel="canonical"]').attr('href');
   if (!canonical) recommendations.push("Missing Canonical Tag");
   ```

2. **Update Database Schema**:
   If you need to save new metrics, edit `shared/schema.ts` inside the `audits` table definition.

   ```typescript
   export const audits = pgTable("audits", {
     // ...
     canonical: text("canonical"),
   });
   ```

3. **Update Frontend**:
   Edit `client/src/components/SEOScorePanel.tsx` to display the new metric.

## License

Closed Source.
