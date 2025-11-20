/**
 * Fetch existing synonyms from Algolia index
 */
import algoliasearch from 'algoliasearch';
import { consoleError } from 'firost';
import config from '../../lib/config.js';

// Validate required environment variables
if (!config.algolia.apiKey) {
  consoleError('Missing ALGOLIA_ADMIN_API_KEY');
  process.exit(1);
}

const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);
const index = client.initIndex(config.algolia.indexName);

try {
  // Search for all synonyms
  const result = await index.searchSynonyms('', { hitsPerPage: 1000 });

  console.log(JSON.stringify(result.hits, null, 2));
} catch (error) {
  consoleError('Error fetching synonyms:', error);
  process.exit(1);
}
