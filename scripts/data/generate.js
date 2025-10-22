/**
 * Reads source data files, merge them, and create the generated files
 **/
import { absolute, gitRoot, glob, readJson, writeJson } from 'firost';
import { pMap } from 'golgoth';
import { getBasename } from '../../lib/helper.js';

const episodesGlob = await glob('data/source/episodes/*.json', {
  cwd: gitRoot(),
});

await pMap(episodesGlob, async (filepath) => {
  const episode = await readJson(filepath);
  const basename = getBasename(episode);
  const outputFilepath = absolute(`<gitRoot>/data/generated/${basename}.json`);
  const data = {
    episode,
  };
  await writeJson(data, outputFilepath);
  // const { slug, index } = k;
});
