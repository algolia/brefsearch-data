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
      attributesForFaceting: ['episode.id', 'episode.easterEgg.takima'],
      distinct: true,
      attributeForDistinct: 'episode.id',
      attributesToSnippet: ['subtitle.content:15'],
      optionalWords: 'takima', // Ignore trigger keyword
      // By default, display chronologically
      customRanking: [
        'desc(episode.easterEgg.takima)', // Display easter eggs first
        'asc(episode.index)',
        'asc(subtitle.index)',
      ],

      replicas: {
        // Alternatively, search by popularity
        popularity: {
          customRanking: [
            'desc(episode.easterEgg.takima)',
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
