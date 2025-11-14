import { firostError, readJsonUrl } from 'firost';
import { _ } from 'golgoth';
import config from './config.js';

/**
 * Fetch view count from YouTube Data API
 * @param {string} videoId
 * @returns {Promise<number>}
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
