import { absolute, run } from 'firost';
import { _ } from 'golgoth';

/**
 * Retrieves the heatmap data for a YouTube video using yt-dlp.
 * @async
 * @function getHeatmap
 * @param {string} videoId - The YouTube video ID to get heatmap data for
 * @returns {Promise<Array<object>>} Promise that resolves to an array of heatmap objects with start, end, and value properties, or empty array if no heatmap data is available
 * @throws {Error} Returns empty array instead of throwing for age-restricted videos, bot detection, or other errors
 */
export async function getHeatmap(videoId) {
  const ytDlpWrapper = absolute('<gitRoot>/scripts/docker/yt-dlp');
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
  } catch (err) {
    // Return empty heatmap for age-restricted videos or bot detection
    if (
      _.includes(err.stderr, 'Sign in to confirm your age.') ||
      _.includes(err.stderr, "Sign in to confirm you're not a bot")
    ) {
      return [];
    }
    // For other errors, still return empty array instead of throwing
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
