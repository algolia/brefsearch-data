/**
 * Download audio files (MP3) from YouTube for episodes
 * Skips files that already exist
 * Usage: node scripts/setup/download-audio.js [metadata.json files...]
 */
import { absolute, exists } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getTmpDir } from '../../lib/paths.js';
import { buildImage } from '../../lib/docker.js';
import { downloadAudio } from '../../lib/ytdlp.js';

const files = process.argv.slice(2);

await buildImage();

await forEachEpisode(
  async (episode) => {
    const audioPath = absolute(getTmpDir(episode), 'audio.mp3');

    if (await exists(audioPath)) {
      return;
    }

    await downloadAudio(episode);
  },
  { files },
);
