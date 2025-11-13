/**
 * Fetch latest popularity metrics from YouTube and save to computed/
 * Uses yt-dlp for normal videos, YouTube API for age-restricted videos
 */
import { absolute, spinner, writeJson } from 'firost';
import { forEachEpisode, getBasename } from '../../lib/helper.js';
import { buildImage } from '../../lib/docker.js';
import { getPopularity as getPopularityFromYtDlp } from '../../lib/ytdlp.js';
import { getPopularity as getPopularityFromAPI } from '../../lib/youtube.js';

await buildImage();

const computedFolder = absolute('<gitRoot>/data/computed');

const progress = spinner();
await forEachEpisode(async function (episode) {
  progress.tick(`Fetching popularity for "${episode.name}"`);

  let data;
  try {
    // Choose method based on age restriction
    data = episode.isAgeRestricted
      ? await getPopularityFromAPI(episode.id)
      : await getPopularityFromYtDlp(episode.id);
  } catch (err) {
    progress.failure(err.message);
    process.exit(1);
  }

  // Save to file
  const basename = getBasename(episode);
  const outputFilepath = absolute(
    `${computedFolder}/${basename}/popularity.json`,
  );
  await writeJson(data, outputFilepath, { sort: false });
});

progress.success('Popularity updated for episode(s)');
