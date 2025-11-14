import { _, pMap } from 'golgoth';
import { gitRoot, glob, readJson } from 'firost';

/**
 * Returns a slug identifying the episode, with padded index
 *
 * @param {object} data - The input data object.
 * @param {string} data.slug - The slug to include in the basename.
 * @param {number|string} data.index - The index to pad and include in the basename.
 * @returns {string} The formatted basename string.
 */
export function getBasename(data) {
  const { slug, index } = data;
  const paddedIndex = _.padStart(index, 2, '0');
  return `S01E${paddedIndex}_${slug}`;
}

/**
 * Iterates over each episode directory and applies the provided callback.
 *
 * @async
 * @param {function(object): Promise<void>} callback - An async function to execute for each episode object.
 * @param {number} [concurrency=10] - The maximum number of concurrent executions.
 * @returns {Promise<void>} Resolves when all episodes have been processed.
 */
export async function forEachEpisode(callback, concurrency = 10) {
  const episodeDirs = await glob('data/input/*/metadata.json', {
    cwd: gitRoot(),
  });

  await pMap(
    episodeDirs,
    async (filepath) => {
      const episode = await readJson(filepath);
      await callback(episode);
    },
    { concurrency },
  );
}
