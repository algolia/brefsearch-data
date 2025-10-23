/**
 * Fetch from YouTube API the latest popularity metrics for our videos and save
 * them in ./data/source/popularity (this folder is not tracked by git).
 **/
import { absolute, mkdirp, run, spinner, writeJson } from 'firost';
import { _ } from 'golgoth';
import { forEachEpisode, getBasename } from '../../lib/helper.js';

const popularityFolder = absolute('<gitRoot>/data/source/popularity');
await mkdirp(popularityFolder);

const progress = spinner();
await forEachEpisode(async function (episode) {
  progress.tick(`Fetching popularity for "${episode.name}"`);

  // Get raw data from API
  const videoUrl = `https://www.youtube.com/watch?v=${episode.id}`;
  const downloadCommand = [
    'yt-dlp',
    '--cookies-from-browser firefox',
    '--dump-json',
    videoUrl,
  ].join(' ');
  const { stdout } = await run(downloadCommand, { shell: true, stdout: false });

  const response = JSON.parse(stdout);

  // Reformat heatmap
  const heatmap = _.map(response.heatmap, (item) => {
    return {
      start: Math.floor(item.start_time),
      end: Math.ceil(item.end_time),
      value: Math.round(item.value * 100),
    };
  });
  const viewCount = response.view_count;

  const basename = getBasename(episode);
  const outputFilepath = absolute(popularityFolder, `${basename}.json`);
  const data = {
    viewCount,
    heatmap,
  };
  await writeJson(data, outputFilepath, { sort: false });
});
progress.success('Popularity updated for all episodes');
