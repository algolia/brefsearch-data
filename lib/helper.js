import { _, pMap } from 'golgoth';
import { absolute, exists, firostError, gitRoot, glob, readJson } from 'firost';
import { dimensions, lqip } from 'imoen';

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

/**
 * Returns the absolute path to the subtitle file for the given basename.
 * Throws an error if the file does not exist.
 * @param {string} basename - The episode basename
 * @returns {Promise<string>} The absolute path to the subtitle file.
 * @throws {Error} If the subtitle file does not exist.
 */
export async function getSubtitlePath(basename) {
  const subtitlePath = absolute(
    `<gitRoot>/data/input/${basename}/subtitle.vtt`,
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
 * @param {string} basename - The episode basename
 * @returns {Promise<string>} The absolute path to the popularity file.
 * @throws {Error} If the popularity file does not exist.
 */
export async function getPopularityPath(basename) {
  const popularityPath = absolute(
    `<gitRoot>/data/external/${basename}/popularity.json`,
  );
  if (!(await exists(popularityPath))) {
    throw firostError(
      'GENERATE_NO_POPULARITY',
      `Popularity file not found: ${popularityPath}`,
    );
  }

  return popularityPath;
}

/**
 * Retrieves media data (thumbnail and preview) for a given subtitle of an episode.
 *
 * Checks for the existence of the preview and thumbnail files, and throws an error if either is missing.
 * Also retrieves the dimensions and LQIP (Low-Quality Image Placeholder) data for the thumbnail.
 *
 * @async
 * @param {object} episode - The episode object.
 * @param {object} subtitle - The subtitle object, must have a `start` property.
 * @returns {Promise<object>} An object containing:
 *   - {string} thumbnailPath - Relative path to the thumbnail image.
 *   - {string} previewPath - Relative path to the preview video.
 *   - {number} width - Width of the thumbnail image.
 *   - {number} height - Height of the thumbnail image.
 *   - {any} lqip - LQIP data for the thumbnail image.
 * @throws {Error} If the preview or thumbnail file does not exist.
 */
export async function getMediaData(episode, subtitle) {
  const folderName = getBasename(episode);
  const basename = _.padStart(subtitle.start, 3, '0');

  // Images are in brefsearch-images repo (symlinked or separate)
  // For now, keep backward compatible path for brefsearch-images
  const imagePathPrefix = '<gitRoot>/../brefsearch-images/';

  // Preview
  const previewPath = `previews/${folderName}/${basename}.mp4`;
  const previewFullPath = absolute(imagePathPrefix, previewPath);
  if (!(await exists(previewFullPath))) {
    throw firostError(
      'GENERATE_NO_PREVIEW',
      `Preview file not found: ${previewFullPath}`,
    );
  }

  // Thumbnail
  const thumbnailPath = `thumbnails/${folderName}/${basename}.png`;
  const thumbnailFullPath = absolute(imagePathPrefix, thumbnailPath);
  if (!(await exists(thumbnailFullPath))) {
    throw firostError(
      'GENERATE_NO_THUMBNAIL',
      `Thumbnail file not found: ${thumbnailFullPath}`,
    );
  }
  const { width, height } = await dimensions(thumbnailFullPath);
  const lqipData = await lqip(thumbnailFullPath);

  return {
    thumbnailPath,
    previewPath,
    width,
    height,
    lqip: lqipData,
  };
}
