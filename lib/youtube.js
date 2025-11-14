import { firostError, readJsonUrl } from 'firost';
import { _ } from 'golgoth';
import config from './config.js';

/**
 * Retrieves the view count for a YouTube video using the YouTube Data API v3.
 *
 * @async
 * @function getViewCount
 * @param {string} videoId - The YouTube video ID to get the view count for
 * @returns {Promise<number>} The view count as an integer
 * @throws {firostError} Throws 'YOUTUBE_MISSING_KEY' error if YouTube API key is not configured
 * @throws {firostError} Throws 'YOUTUBE_MISSING_VIDEO' error if the video cannot be found
 */
export async function getViewCount(videoId) {
  const apiKey = config.youtube.apiKey;
  if (!apiKey) {
    throw new firostError(
      'YOUTUBE_MISSING_KEY',
      'YOUTUBE_API_KEY env variable is required',
    );
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;

  const response = await readJsonUrl(apiUrl);
  const items = response.items;

  if (!items) {
    throw new firostError(
      'YOUTUBE_MISSING_VIDEO',
      `Unable to find video ${videoId}`,
    );
  }

  const statistics = response.items[0].statistics;

  return _.parseInt(statistics.viewCount);
}
