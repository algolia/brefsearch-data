import { pMap } from 'golgoth';
import { absolute, glob, readJson, spinner } from 'firost';
import { getInputDir } from './paths.js';

/**
 * Iterates over each episode directory and applies the provided callback.
 * Includes progress spinner with tick on each iteration.
 */
export async function forEachEpisode(callback, concurrency = 10) {
  const inputDir = getInputDir();
  const episodeDirs = await glob('*/metadata.json', { cwd: inputDir });

  const progress = spinner(episodeDirs.length);

  await pMap(
    episodeDirs,
    async (filepath) => {
      const fullPath = absolute(inputDir, filepath);
      const episode = await readJson(fullPath);

      progress.tick(`Processing "${episode.name}"`);

      try {
        await callback(episode);
      } catch (err) {
        progress.failure(err.message);
        process.exit(1);
      }
    },
    { concurrency },
  );

  progress.success('Completed');
}
