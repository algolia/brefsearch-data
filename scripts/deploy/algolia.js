/**
 * Push episode data and configuration to Algolia index
 */
import { consoleError } from 'firost';
import config from '../../lib/config.js';
import { indexData, setSynonyms } from '../../lib/algolia.js';

// Validate required environment variables
if (!config.algolia.apiKey) {
  consoleError('Missing ALGOLIA_API_KEY');
  process.exit(1);
}

await indexData();
await setSynonyms();
