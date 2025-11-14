/**
 * Fetch latest view counts from YouTube API and save to computed/
 * Uses YouTube Data API for reliable CI/CD execution
 */
import { absolute, spinner, writeJson } from 'firost';
import { forEachEpisode, getBasename } from '../../lib/helper.js';
import { getViewCount } from '../../lib/youtube.js';

const computedFolder = absolute('<gitRoot>/data/computed');

const progress = spinner();
await forEachEpisode(async function (episode) {
  progress.tick(`Fetching view count for "${episode.name}"`);

  let viewCount;
  try {
    viewCount = await getViewCount(episode.id);
  } catch (err) {
    progress.failure(err.message);
    process.exit(1);
  }

  // Save to file
  const basename = getBasename(episode);
  const outputFilepath = absolute(
    `${computedFolder}/${basename}/viewcount.json`,
  );
  await writeJson({ viewCount }, outputFilepath, { sort: false });
});

progress.success('View counts updated for episode(s)');
