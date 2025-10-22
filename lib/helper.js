import { _, pMap } from 'golgoth';
import { absolute, exists, firostError, gitRoot, glob, readJson } from 'firost';

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
 * @param {number} [concurrency=10] - The maximum number of concurrent executions.
 * @returns {Promise<void>} Resolves when all episodes have been processed.
 */
export async function forEachEpisode(callback, concurrency = 10) {
  const episodesGlob = await glob('data/source/episodes/*.json', {
    cwd: gitRoot(),
  });

  await pMap(
    episodesGlob,
    async (filepath) => {
      const episode = await readJson(filepath);
      await callback(episode);
    },
    { concurrency },
  );
}

/**
 * Returns the absolute path to the subtitle file for the given basename.
 * Throws an error if the file does not exist.
 * @param {string} basename - The base name of the subtitle file (without extension).
 * @returns {Promise<string>} The absolute path to the subtitle file.
 * @throws {Error} If the subtitle file does not exist.
 */
export async function getSubtitlePath(basename) {
  const subtitlePath = absolute(
    `<gitRoot>/data/source/subtitles/${basename}.vtt`,
  );
  if (!(await exists(subtitlePath))) {
    throw firostError(
      'GENERATE_NO_SUBTITLES',
      `Subtitle file not found: ${subtitlePath}`,
    );
  }

  return subtitlePath;
}

/**
 * Returns the absolute path to the popularity file for the given basename.
 * Throws an error if the file does not exist.
 * @param {string} basename - The base name of the popularity file (without extension).
 * @returns {Promise<string>} The absolute path to the popularity file.
 * @throws {Error} If the popularity file does not exist.
 */
export async function getPopularityPath(basename) {
  const popularityPath = absolute(
    `<gitRoot>/data/source/popularity/${basename}.json`,
  );
  if (!(await exists(popularityPath))) {
    throw firostError(
      'GENERATE_NO_POPULARITY',
      `Popularity file not found: ${popularityPath}`,
    );
  }

  return popularityPath;
}
