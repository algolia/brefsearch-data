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
  return `${paddedIndex}_${slug}`;
}

/**
 * Iterates over each episode JSON file and applies the provided callback.
 *
 * @async
 * @param {function(object): Promise<void>} callback - An async function to execute for each episode object.
 * @returns {Promise<void>} Resolves when all episodes have been processed.
 */
export async function forEachEpisode(callback) {
  const episodesGlob = await glob('data/source/episodes/*.json', {
    cwd: gitRoot(),
  });

  await pMap(
    episodesGlob,
    async (filepath) => {
      const episode = await readJson(filepath);
      await callback(episode);
    },
    { concurrency: 1 },
  );
}
