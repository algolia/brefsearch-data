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
      searchableAttributes: [
        'unordered(subtitle.content)',
        'episode.name',
        'episode.easterEgg.keyword', // So we can still find the easter eggs by their keyword
      ],
      attributesForFaceting: ['episode.id', 'episode.easterEgg.takima'],
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
    synonyms: [
      {
        objectID: 'trois-mille',
        type: 'synonym',
        synonyms: ['trois mille', '3000', '3 000'],
      },
      {
        objectID: 'nin-na',
        type: 'synonym',
        synonyms: ['nin', 'na'],
      },
    ],
  },

  // YouTube configuration (if needed for API-based popularity updates)
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
  },
};
