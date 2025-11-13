/**
 * Push episode data to Algolia index
 */
import indexing from 'algolia-indexing';
import { absolute, consoleError, glob, readJson } from 'firost';
import { _, pMap } from 'golgoth';
import config from '../../lib/config.js';

// Validate required environment variables
if (!config.algolia.apiKey) {
  consoleError('Missing ALGOLIA_API_KEY');
  process.exit(1);
}

// Generate all records from output files
const outputDir = absolute('<gitRoot>/data/output');
const outputSources = await glob('*/episode.json', { cwd: outputDir });

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
