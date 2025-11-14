/**
 * Download video files (MP4) from YouTube for episodes
 * Skips files that already exist
 * Usage: node scripts/setup/download-videos.js [metadata.json files...]
 */
import { absolute, exists } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getTmpDir } from '../../lib/paths.js';
import { buildImage } from '../../lib/docker.js';
import { downloadVideo } from '../../lib/ytdlp.js';

const files = process.argv.slice(2);

await buildImage();

await forEachEpisode(
  async (episode) => {
    const videoPath = absolute(getTmpDir(episode), 'video.mp4');

    if (await exists(videoPath)) {
      return;
    }

    await downloadVideo(episode);
  },
  { files },
);
