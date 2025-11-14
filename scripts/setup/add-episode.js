/**
 * Add a new episode to the input directory
 * Usage: node scripts/setup/add-episode.js <videoId> <slug>
 */
import { absolute, firostError, readJsonUrl, writeJson } from 'firost';
import { _ } from 'golgoth';
import config from '../../lib/config.js';
import { getInputDir } from '../../lib/paths.js';

const videoId = process.argv[2];
const slug = process.argv[3];

if (!videoId || !slug) {
  console.log('Usage: node scripts/setup/add-episode.js <videoId> <slug>');
  process.exit(1);
}

// Fetch video details from YouTube API
const apiKey = config.youtube.apiKey;
if (!apiKey) {
  throw new firostError(
    'YOUTUBE_MISSING_KEY',
    'YOUTUBE_API_KEY env variable is required',
  );
}

const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
const response = await readJsonUrl(apiUrl);

if (!response.items || response.items.length === 0) {
  throw new firostError(
    'YOUTUBE_MISSING_VIDEO',
    `Unable to find video ${videoId}`,
  );
}

const video = response.items[0];
const name = video.snippet.title;

// Parse ISO 8601 duration (PT1M48S) to M:SS format
const isoDuration = video.contentDetails.duration;
const match = isoDuration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
const minutes = parseInt(match[1] || 0);
const seconds = parseInt(match[2] || 0);
const duration = `${minutes}:${_.padStart(seconds, 2, '0')}`;

// Create episode directory
const episodeDir = absolute(getInputDir(), slug);

// Create metadata.json
const metadata = {
  name,
  slug,
  index: null,
  id: videoId,
  duration,
};

const metadataPath = absolute(episodeDir, 'metadata.json');
await writeJson(metadata, metadataPath, { sort: false });
