/**
 * Generate media files (thumbnails + previews) and metadata
 * Creates media.json with dimensions/LQIP for each subtitle timestamp
 * Creates symlinks to brefsearch-media repository
 */
import { exists, spinner, symlink, writeJson } from 'firost';
import { _, pMap } from 'golgoth';
import { dimensions, lqip } from 'imoen';
import { forEachEpisode, getBasename } from '../../lib/helper.js';
import {
  getMediaPath,
  getMediaRepoDir,
  getPreviewPath,
  getPreviewsDir,
  getSubtitlePath,
  getThumbnailPath,
  getThumbnailsDir,
} from '../../lib/paths.js';
import { convertVtt } from '../../lib/convertVtt.js';
import { buildImage } from '../../lib/docker.js';
import { extractPreview, extractThumbnail } from '../../lib/ffmpeg.js';

await buildImage();

const mediaRepoDir = getMediaRepoDir();

const progress = spinner();
await forEachEpisode(async (episode) => {
  progress.tick(`Processing media for "${episode.name}"`);
  const basename = getBasename(episode);

  // Add symlinks to brefsearch-media
  await createSymlinks(episode);

  // Get all timestamps that need a media
  const subtitlePath = getSubtitlePath(episode);
  const subtitles = await convertVtt(subtitlePath);
  const timestamps = _.chain(subtitles).map('start').uniq().sortBy().value();

  // Create media.json content
  const media = {};
  await pMap(
    timestamps,
    async (timestamp) => {
      const key = _.padStart(timestamp, 3, '0');

      // extract thumbnail if missing
      const thumbnailPath = getThumbnailPath(episode, timestamp);
      if (!(await exists(thumbnailPath))) {
        await extractThumbnail(episode, timestamp, thumbnailPath);
      }

      // Get thumbnail metadata
      const { width, height } = await dimensions(thumbnailPath);
      const lqipValue = await lqip(thumbnailPath);

      // extract preview if missing
      const previewPath = getPreviewPath(episode, timestamp);
      if (!(await exists(previewPath))) {
        await extractPreview(episode, timestamp, previewPath);
      }

      const thumbnailPrefixPath = `${basename}/thumbnails/${key}.png`;
      const previewPrefixPath = `${basename}/previews/${key}.mp4`;

      const value = {
        thumbnailPath: thumbnailPrefixPath,
        previewPath: previewPrefixPath,
        width,
        height,
        lqip: lqipValue,
      };
      media[key] = value;
    },
    { concurrency: 10 },
  );

  const mediaJsonPath = getMediaPath(episode);
  await writeJson(media, mediaJsonPath);
});

/**
 * Create symlinks between computed/ and brefsearch-media repo
 * @param episode
 */
async function createSymlinks(episode) {
  const basename = getBasename(episode);
  const computedThumbnails = getThumbnailsDir(episode);
  const computedPreviews = getPreviewsDir(episode);

  const mediaThumbnails = `${mediaRepoDir}/${basename}/thumbnails`;
  const mediaPreviews = `${mediaRepoDir}/${basename}/previews`;

  await symlink(computedThumbnails, mediaThumbnails);
  await symlink(computedPreviews, mediaPreviews);
}

progress.success('Media updated for all episodes');
