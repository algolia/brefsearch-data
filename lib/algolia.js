/**
 * Algolia helper functions for indexing and configuration
 */
import algoliasearch from 'algoliasearch';
import indexing from 'algolia-indexing';
import { absolute, consoleSuccess, glob, readJson } from 'firost';
import { _, pMap } from 'golgoth';
import config from './config.js';

// Initialize Algolia client and index once
const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);
const index = client.initIndex(config.algolia.indexName);

/**
 * Index all episode data to Algolia
 */
export async function indexData() {
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
}

/**
 * Configure synonyms in Algolia index
 */
export async function setSynonyms() {
  const synonyms = config.algolia.synonyms || [];

  if (_.isEmpty(synonyms)) {
    return;
  }

  // Save all synonyms at once (replaces existing ones)
  await index.saveSynonyms(synonyms, {
    replaceExistingSynonyms: true,
  });

  consoleSuccess(`Configuring synonyms of ${config.algolia.indexName}`);
}

/**
 * Configure rules in Algolia index
 */
export async function setRules() {
  const rules = config.algolia.rules || [];

  if (_.isEmpty(rules)) {
    return;
  }

  // Save all rules at once (replaces existing ones)
  await index.saveRules(rules, {
    clearExistingRules: true,
  });

  consoleSuccess(`Configuring rules of ${config.algolia.indexName}`);
}
