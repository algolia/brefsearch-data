import { pMap } from 'golgoth';
import { absolute, glob, readJson } from 'firost';
import { getInputDir } from './paths.js';

/**
 * Iterates over each episode directory and applies the provided callback.
 */
export async function forEachEpisode(callback, concurrency = 10) {
  const inputDir = getInputDir();
  const episodeDirs = await glob('*/metadata.json', { cwd: inputDir });

  await pMap(
    episodeDirs,
    async (filepath) => {
      const fullPath = absolute(inputDir, filepath);
      const episode = await readJson(fullPath);
      await callback(episode);
    },
    { concurrency },
  );
}
