import { absolute, exists, firostError, gitRoot, mkdirp, run } from 'firost';
import {
  getPreviewPath,
  getPreviewsDir,
  getThumbnailPath,
  getThumbnailsDir,
  getVideoPath,
} from './paths.js';

const root = gitRoot();
const ffmpegWrapper = absolute(root, 'scripts/docker/ffmpeg');

/**
 * Extract a thumbnail from a video at a specific timestamp
 */
export async function extractThumbnail(episode, timestamp) {
  await ensureVideoExists(episode);

  const hostVideoPath = getVideoPath(episode);
  const hostThumbnailPath = getThumbnailPath(episode, timestamp);

  // Create thumbnails directory
  await mkdirp(getThumbnailsDir(episode));

  const guestVideoPath = hostVideoPath.replace(`${root}/`, '');
  const guestOutputPath = hostThumbnailPath.replace(`${root}/`, '');

  const thumbnailCommand = [
    ffmpegWrapper,
    '-y -loglevel error',
    `-ss "${timestamp}"`,
    `-i "${guestVideoPath}"`,
    '-vframes 1',
    '-q:v 2',
    `"${guestOutputPath}"`,
  ].join(' ');
  await run(thumbnailCommand, { shell: true });
}

/**
 * Extract a preview clip from a video at a specific timestamp
 */
export async function extractPreview(episode, timestamp) {
  await ensureVideoExists(episode);

  const hostVideoPath = getVideoPath(episode);
  const hostPreviewPath = getPreviewPath(episode, timestamp);

  // Create previews directory
  await mkdirp(getPreviewsDir(episode));

  const guestVideoPath = hostVideoPath.replace(`${root}/`, '');
  const guestOutputPath = hostPreviewPath.replace(`${root}/`, '');

  const duration = 2;
  const scale = 320;
  const compression = 23;

  const previewCommand = [
    ffmpegWrapper,
    '-y -loglevel error',
    `-ss ${timestamp}`,
    `-t ${duration}`,
    `-i "${guestVideoPath}"`,
    `-vf "scale=${scale}:-1"`,
    '-c:v libx264',
    `-crf ${compression}`,
    '-preset medium',
    '-movflags +faststart',
    `-an "${guestOutputPath}"`,
  ].join(' ');
  await run(previewCommand, { shell: true });
}

/**
 * Verify that source video exists, throw error if not
 */
async function ensureVideoExists(episode) {
  const videoPath = getVideoPath(episode);
  if (!(await exists(videoPath))) {
    throw firostError(
      'FFMPEG_MISSING_VIDEO',
      `Source video file not found: ${videoPath}\nRun 'yarn setup:download-videos' first.`,
    );
  }
}
