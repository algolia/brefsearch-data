/**
 * Fetch latest view counts from YouTube API and save to computed/
 * Uses YouTube Data API for reliable CI/CD execution
 */
import { spinner, writeJson } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getViewcountPath } from '../../lib/paths.js';
import { getViewCount } from '../../lib/youtube.js';

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

  const outputFilepath = getViewcountPath(episode);
  await writeJson({ viewCount }, outputFilepath, { sort: false });
});

progress.success('View counts updated for episode(s)');
