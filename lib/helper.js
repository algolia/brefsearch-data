import { _, pMap } from 'golgoth';
import { glob, readJson, spinner } from 'firost';
import { getInputDir } from './paths.js';

/**
 * Iterates over each episode directory and applies the provided callback.
 * Includes progress spinner with tick on each iteration.
 */
export async function forEachEpisode(callback, userOptions = {}) {
  const options = {
    concurrency: 10,
    files: null,
    ...userOptions,
  };

  let files = options.files;
  if (_.isEmpty(files)) {
    files = await glob('*/metadata.json', { cwd: getInputDir() });
  }

  const progress = spinner(files.length);

  await pMap(
    files,
    async (filepath) => {
      const episode = await readJson(filepath);

      progress.tick(episode.name);

      try {
        await callback(episode);
      } catch (err) {
        progress.failure(err.message);
        process.exit(1);
      }
    },
    { concurrency: options.concurrency },
  );

  progress.success('Completed');
}
