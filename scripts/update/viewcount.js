/**
 * Fetch latest view counts from YouTube API and save to computed/
 * Uses YouTube Data API for reliable CI/CD execution
 */
import { writeJson } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getViewcountPath } from '../../lib/paths.js';
import { getViewCount } from '../../lib/youtube.js';

await forEachEpisode(async function (episode) {
  const viewCount = await getViewCount(episode.id);
  const outputFilepath = getViewcountPath(episode);
  await writeJson({ viewCount }, outputFilepath);
});
