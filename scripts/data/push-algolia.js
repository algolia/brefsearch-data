import indexing from 'algolia-indexing';
import { absolute, glob, readJson } from 'firost';
import { _, pMap } from 'golgoth';
import config from '../../lib/config.js';

// Generate all records from generated files
const generatedSources = await glob('./data/generated/*.json', {
  cwd: absolute('<gitRoot>'),
});
const records = [];
await pMap(generatedSources, async (filepath) => {
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
  appId: config.appId,
  indexName: config.indexName,
  apiKey: config.adminApiKey,
};
const settings = config.settings;

indexing.verbose();
indexing.config({
  batchMaxSize: 100,
});

await indexing.fullAtomic(credentials, records, settings);
