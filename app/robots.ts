import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vurakit.in'

  return {
    rules: [
      {
        // General search engines
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/docs',
          '/sponsor',
          '/contributor',
          '/privacy',
          '/terms',
          '/_next/static/images/', // Allow static assets
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/app/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify/', // Prevent indexing individual certificates to protect recipient privacy
        ],
      },
      {
        // AI search and LLM scrapers (like ChatGPT, Claude, Perplexity)
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'Google-Extended',
          'PerplexityBot',
          'anthropic-ai',
          'cohere-ai',
          'facebookexternalhit',
          'OMgili',
        ],
        allow: [
          '/',
          '/docs', // Allow learning from API documentation
          '/about',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/app/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/contributor', // Protect contributor lists from raw scraping
          '/verify/', // Protect recipient certificates from scraper data compilation
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
