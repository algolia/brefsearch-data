#!/usr/bin/env node
/**
 * Push episode data to Algolia index
 * Reads output/{episode}/episode.json and transforms into Algolia records
 */
import indexing from 'algolia-indexing';
import { absolute, glob, readJson } from 'firost';
import { _, pMap } from 'golgoth';
import config from '../../lib/config.js';

// Validate required environment variables
if (!config.algolia.appId || !config.algolia.apiKey) {
  console.error('Missing required environment variables:');
  if (!config.algolia.appId) console.error('  - ALGOLIA_APP_ID');
  if (!config.algolia.apiKey) console.error('  - ALGOLIA_API_KEY');
  console.error('\nDefine them in .envrc or CI environment. See README.');
  process.exit(1);
}

// Generate all records from output files
const outputSources = await glob('./data/output/*/episode.json', {
  cwd: absolute('<gitRoot>'),
});

const records = [];
await pMap(outputSources, async (filepath) => {
  const data = await readJson(filepath);
  const { episode, subtitles } = data;
  const episodeRecords = _.map(subtitles, (subtitle) => {
    // Move .media key to the root
    const media = subtitle.media;
    delete subtitle.media;

    return {
      episode,
      subtitle,
      media,
    };
  });
  records.push(...episodeRecords);
});

const credentials = {
  appId: config.algolia.appId,
  indexName: config.algolia.indexName,
  apiKey: config.algolia.apiKey,
};
const settings = config.algolia.settings;

indexing.verbose();
indexing.config({
  batchMaxSize: 100,
});

await indexing.fullAtomic(credentials, records, settings);
