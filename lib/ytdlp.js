import { absolute, gitRoot, mkdirp, run } from 'firost';
import { _ } from 'golgoth';
import { getAudioPath, getTmpDir, getVideoPath } from './paths.js';

const root = gitRoot();
const ytDlpWrapper = absolute(root, 'scripts/docker/yt-dlp');

/**
 * Retrieves the heatmap data for a YouTube video using yt-dlp.
 * @async
 * @function getHeatmap
 * @param {string} videoId - The YouTube video ID to get heatmap data for
 * @returns {Promise<Array<object>>} Promise that resolves to an array of heatmap objects with start, end, and value properties, or empty array if no heatmap data is available
 * @throws {Error} Returns empty array instead of throwing for age-restricted videos, bot detection, or other errors
 */
export async function getHeatmap(videoId) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const downloadCommand = [
    ytDlpWrapper,
    '--remote-components ejs:github',
    '--dump-json',
    videoUrl,
  ].join(' ');

  let result;
  try {
    result = await run(downloadCommand, {
      shell: true,
      stdout: false,
      stderr: false,
    });
  } catch {
    return [];
  }

  const response = JSON.parse(result.stdout);

  // Check if heatmap exists in response
  if (!response.heatmap) {
    return [];
  }

  // Reformat heatmap
  const heatmap = _.map(response.heatmap, (item) => {
    return {
      start: Math.floor(item.start_time),
      end: Math.ceil(item.end_time),
      value: Math.round(item.value * 100),
    };
  });

  return heatmap;
}

/**
 * Downloads audio from a YouTube video using yt-dlp
 * @async
 * @function downloadAudio
 * @param {object} episode - Episode object with id property
 * @returns {Promise<void>}
 */
export async function downloadAudio(episode) {
  const videoUrl = `https://www.youtube.com/watch?v=${episode.id}`;
  const tmpDir = getTmpDir(episode);
  await mkdirp(tmpDir);

  // Convert absolute host path to relative path for Docker container
  // Docker mounts git root as /data, so we need a relative path from root
  const hostOutputPath = getAudioPath(episode);
  const guestOutputPath = hostOutputPath.replace(`${root}/`, '');

  const downloadCommand = [
    ytDlpWrapper,
    '--extract-audio',
    '--audio-format mp3',
    '--remote-components ejs:github',
    '--output',
    guestOutputPath,
    videoUrl,
  ].join(' ');

  await run(downloadCommand, {
    shell: true,
    stdout: false,
    stderr: false,
  });
}

/**
 * Downloads video from a YouTube video using yt-dlp
 * @async
 * @function downloadVideo
 * @param {object} episode - Episode object with id property
 * @returns {Promise<void>}
 */
export async function downloadVideo(episode) {
  const videoUrl = `https://www.youtube.com/watch?v=${episode.id}`;
  const tmpDir = getTmpDir(episode);
  await mkdirp(tmpDir);

  const hostVideoPath = getVideoPath(episode);
  const guestVideoPath = hostVideoPath.replace(`${root}/`, '');

  const downloadCommand = [
    ytDlpWrapper,
    '--format best',
    '--remote-components ejs:github',
    '--output',
    guestVideoPath,
    videoUrl,
  ].join(' ');

  await run(downloadCommand, {
    shell: true,
    stdout: false,
    stderr: false,
  });
}
