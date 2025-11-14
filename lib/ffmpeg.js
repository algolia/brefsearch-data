import { absolute, run } from 'firost';
import { getPreviewPath, getThumbnailPath, getVideoPath } from './paths.js';

const ffmpegWrapper = absolute('<gitRoot>/scripts/docker/ffmpeg');

/**
 * Extract a thumbnail from a video at a specific timestamp
 */
export async function extractThumbnail(episode, timestamp) {
  const videoPath = getVideoPath(episode);
  const outputPath = getThumbnailPath(episode, timestamp);

  const thumbnailCommand = [
    ffmpegWrapper,
    '-y -loglevel error',
    `-ss "${timestamp}"`,
    `-i "${videoPath}"`,
    '-vframes 1',
    '-q:v 2',
    `"${outputPath}"`,
  ].join(' ');
  await run(thumbnailCommand, { shell: true });
}

/**
 * Extract a preview clip from a video at a specific timestamp
 */
export async function extractPreview(episode, timestamp) {
  const videoPath = getVideoPath(episode);
  const outputPath = getPreviewPath(episode, timestamp);

  const duration = 2;
  const scale = 320;
  const compression = 23;

  const previewCommand = [
    ffmpegWrapper,
    '-y -loglevel error',
    `-ss ${timestamp}`,
    `-t ${duration}`,
    `-i "${videoPath}"`,
    `-vf "scale=${scale}:-1"`,
    '-c:v libx264',
    `-crf ${compression}`,
    '-preset medium',
    '-movflags +faststart',
    `-an "${outputPath}"`,
  ].join(' ');
  await run(previewCommand, { shell: true });
}
