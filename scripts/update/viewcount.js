/**
 * Fetch latest view counts from YouTube API and save to computed/
 * Uses YouTube Data API for reliable CI/CD execution
 * Usage: yarn run update:viewcount [metadata.json files...]
 */
import { writeJson } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getViewcountPath } from '../../lib/paths.js';
import { getViewCount } from '../../lib/youtube.js';

const files = process.argv.slice(2);

await forEachEpisode(
  async function (episode) {
    const viewCount = await getViewCount(episode.id);
    const outputFilepath = getViewcountPath(episode);
    await writeJson({ viewCount }, outputFilepath);
  },
  { files },
);
