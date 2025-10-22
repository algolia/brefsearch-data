export default {
  appId: process.env.ALGOLIA_APP_ID || 'O3F8QXYK6R',
  indexName: process.env.ALGOLIA_INDEX_NAME || 'brefsearch',
  adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
  settings: {
    searchableAttributes: ['unordered(subtitle.content)', 'episode.name'],
    attributesForFaceting: ['episode.id'],
    distinct: true,
    attributeForDistinct: 'episode.id',
    attributesToSnippet: ['subtitle.content:15'],
    // Bu default, display chronologically
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
};
