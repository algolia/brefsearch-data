/**
 * Generate media files (thumbnails + previews) and metadata
 * Creates media.json with dimensions/LQIP for each subtitle timestamp
 * Creates symlinks to brefsearch-media repository
 */
import { absolute, exists, spinner, symlink, writeJson } from 'firost';
import { _, pMap } from 'golgoth';
import { dimensions, lqip } from 'imoen';
import {
  forEachEpisode,
  getBasename,
  getSubtitlePath,
} from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';
import { buildImage } from '../../lib/docker.js';
import { extractPreview, extractThumbnail } from '../../lib/ffmpeg.js';

await buildImage();

const computedDir = absolute('<gitRoot>/data/computed/');
const mediaDir = absolute('<gitRoot>/../brefsearch-media/media');

const progress = spinner();
await forEachEpisode(async (episode) => {
  progress.tick(`Processing media for "${episode.name}"`);
  const basename = getBasename(episode);

  // Add symlinks to brefsearch-media
  await createSymlinks(basename);

  // Get all timestamps that need a media
  const subtitlePath = await getSubtitlePath(basename);
  const subtitles = await convertVtt(subtitlePath);
  const timestamps = _.chain(subtitles).map('start').uniq().sortBy().value();

  // Create media.json content
  const media = {};
  await pMap(
    timestamps,
    async (timestamp) => {
      const key = _.padStart(timestamp, 3, '0');

      // extract thumbnail if missing
      const thumbnailPrefixPath = `${basename}/thumbnails/${key}.png`;
      const thumbnailPath = absolute(computedDir, thumbnailPrefixPath);
      if (!(await exists(thumbnailPath))) {
        await extractThumbnail(episode, timestamp, thumbnailPath);
      }

      // Get thumbnail metadata
      const { width, height } = await dimensions(thumbnailPath);
      const lqipValue = await lqip(thumbnailPath);

      // extract preview if missing
      const previewPrefixPath = `${basename}/previews/${key}.mp4`;
      const previewPath = absolute(computedDir, previewPrefixPath);
      if (!(await exists(previewPath))) {
        await extractPreview(episode, timestamp, previewPath);
      }

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

  const mediaJsonPath = absolute(computedDir, basename, 'media.json');
  await writeJson(media, mediaJsonPath);
});

/**
 *
 * @param basename
 */
async function createSymlinks(basename) {
  const computedThumbnails = absolute(computedDir, basename, 'thumbnails');
  const computedPreviews = absolute(computedDir, basename, 'previews');

  const mediaThumbnails = absolute(mediaDir, basename, 'thumbnails');
  const mediaPreviews = absolute(mediaDir, basename, 'previews');

  await symlink(computedThumbnails, mediaThumbnails);
  await symlink(computedPreviews, mediaPreviews);
}

progress.success('Media updated for all episodes');
