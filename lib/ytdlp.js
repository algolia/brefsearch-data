import { absolute, run } from 'firost';
import { _ } from 'golgoth';

/**
 * Fetch popularity data (view count and heatmap) for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{viewCount: number, heatmap: Array}>} Popularity data
 */
export async function getPopularity(videoId) {
  const ytDlpWrapper = absolute('<gitRoot>/scripts/docker/yt-dlp');
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const downloadCommand = [
    ytDlpWrapper,
    '--remote-components ejs:github',
    '--dump-json',
    videoUrl,
  ].join(' ');

  const { stdout } = await run(downloadCommand, {
    shell: true,
    stdout: false,
  });
  const response = JSON.parse(stdout);

  // Reformat heatmap
  const heatmap = _.map(response.heatmap, (item) => {
    return {
      start: Math.floor(item.start_time),
      end: Math.ceil(item.end_time),
      value: Math.round(item.value * 100),
    };
  });

  return {
    viewCount: response.view_count,
    heatmap,
  };
}
