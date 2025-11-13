/**
 * Centralized configuration for brefsearch-data
 * Each script validates only its own required environment variables
 */
export default {
  // Algolia configuration
  algolia: {
    appId: process.env.ALGOLIA_APP_ID || 'O3F8QXYK6R',
    indexName: process.env.ALGOLIA_INDEX_NAME || 'brefsearch',
    apiKey: process.env.ALGOLIA_ADMIN_API_KEY,
    settings: {
      searchableAttributes: ['unordered(subtitle.content)', 'episode.name'],
      attributesForFaceting: ['episode.id'],
      distinct: true,
      attributeForDistinct: 'episode.id',
      attributesToSnippet: ['subtitle.content:15'],
      // By default, display chronologically
      customRanking: ['asc(episode.index)', 'asc(subtitle.index)'],
      replicas: {
        // Alternatively, search by popularity
        popularity: {
          customRanking: [
            'desc(episode.viewCount)',
            'desc(subtitle.mostReplayedScore)',
            'desc(subtitle.index)',
          ],
        },
      },
    },
  },

  // YouTube configuration (if needed for API-based popularity updates)
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
  },
};
