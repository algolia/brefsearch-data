/**
 * Generate media files (thumbnails + previews) and metadata
 * Creates media.json with dimensions/LQIP for each subtitle timestamp
 * Creates symlinks to brefsearch-media repository
 * Usage: yarn run generate:media [metadata.json files...]
 */
import { exists, symlink, writeJson } from 'firost';
import { _, pMap } from 'golgoth';
import { dimensions, lqip } from 'imoen';
import { forEachEpisode } from '../../lib/helper.js';
import {
  getComputedDir,
  getMediaPath,
  getMediaRepoDir,
  getPreviewPath,
  getPreviewsDir,
  getThumbnailPath,
  getThumbnailsDir,
  getTimestampKey,
} from '../../lib/paths.js';
import { getSubtitles } from '../../lib/subtitle.js';
import { buildImage } from '../../lib/docker.js';
import { extractPreview, extractThumbnail } from '../../lib/ffmpeg.js';

const files = process.argv.slice(2);

await buildImage();

const mediaRepoDir = getMediaRepoDir();

await forEachEpisode(
  async (episode) => {
    // Add symlinks to brefsearch-media
    await createSymlinks(episode);

    // Get all timestamps that need a media
    const subtitles = await getSubtitles(episode);
    const timestamps = _.chain(subtitles).map('start').uniq().sortBy().value();

    // Create media.json content
    const media = {};
    const computedDir = getComputedDir(episode);

    await pMap(
      timestamps,
      async (timestamp) => {
        // extract thumbnail if missing
        const thumbnailPath = getThumbnailPath(episode, timestamp);
        if (!(await exists(thumbnailPath))) {
          await extractThumbnail(episode, timestamp);
        }

        // Get thumbnail metadata
        const { width, height } = await dimensions(thumbnailPath);
        const lqipValue = await lqip(thumbnailPath);

        // extract preview if missing
        const previewPath = getPreviewPath(episode, timestamp);
        if (!(await exists(previewPath))) {
          await extractPreview(episode, timestamp);
        }

        // Derive relative paths from absolute paths
        const thumbnailPrefixPath = thumbnailPath.replace(
          `${computedDir}/`,
          '',
        );
        const previewPrefixPath = previewPath.replace(`${computedDir}/`, '');

        const key = getTimestampKey(timestamp);
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

    await writeJson(media, getMediaPath(episode));
  },
  { files },
);

async function createSymlinks(episode) {
  const mediaThumbnails = `${mediaRepoDir}/${episode.slug}/thumbnails`;
  const mediaPreviews = `${mediaRepoDir}/${episode.slug}/previews`;

  const computedThumbnails = getThumbnailsDir(episode);
  const computedPreviews = getPreviewsDir(episode);

  await symlink(computedThumbnails, mediaThumbnails);
  await symlink(computedPreviews, mediaPreviews);
}
