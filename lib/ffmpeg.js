import { absolute, run } from 'firost';
import { getBasename } from './helper.js';

const ffmpegWrapper = absolute('<gitRoot>/scripts/docker/ffmpeg');
const tmpDir = absolute('<gitRoot>/data/tmp');

/**
 *
 * @param episode
 * @param timestamp
 * @param outputPath
 */
export async function extractThumbnail(episode, timestamp, outputPath) {
  const basename = getBasename(episode);
  const videoPath = absolute(tmpDir, basename, 'video.mp4');
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
 *
 * @param episode
 * @param timestamp
 * @param outputPath
 */
export async function extractPreview(episode, timestamp, outputPath) {
  const basename = getBasename(episode);
  const videoPath = absolute(tmpDir, basename, 'video.mp4');

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
