#!/usr/bin/env node
/**
 * Generate PNG thumbnails from downloaded videos at subtitle timestamps
 * Extracts one frame per subtitle line using FFmpeg via Docker
 */
import { absolute, exists, mkdirp, run, spinner } from 'firost';
import { _, pMap } from 'golgoth';
import { forEachEpisode, getBasename, getSubtitlePath } from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';

const gitRoot = absolute('<gitRoot>');
const ffmpegWrapper = absolute(gitRoot, 'scripts/docker/ffmpeg');

const progress = spinner();
const concurrency = 4;

await forEachEpisode(async function (episode) {
  const basename = getBasename(episode);
  const videoPath = absolute(gitRoot, `data/tmp/${basename}/video.mp4`);

  // Check if video exists
  if (!(await exists(videoPath))) {
    progress.info(`Skipping ${basename}: video not found at ${videoPath}`);
    return;
  }

  progress.tick(`Thumbnails: ${episode.name}`);

  // Get subtitles
  const subtitlePath = await getSubtitlePath(basename);
  const subtitles = await convertVtt(subtitlePath);
  const subtitleCount = subtitles.length;

  await pMap(
    subtitles,
    async (subtitle, subtitleIndex) => {
      const timestamp = subtitle.start;
      const paddedIndex = _.padStart(timestamp, 3, '0');
      const thumbnailPath = absolute(
        gitRoot,
        `../brefsearch-images/thumbnails/${basename}/${paddedIndex}.png`,
      );

      if (await exists(thumbnailPath)) {
        return;
      }

      await mkdirp(absolute(gitRoot, `../brefsearch-images/thumbnails/${basename}`));

      progress.tick(
        `Thumbnails: ${episode.name} [${subtitleIndex}/${subtitleCount}]`,
      );

      // Extract thumbnail using Docker wrapper
      const extractCommand = [
        ffmpegWrapper,
        '-y -loglevel error',
        `-ss "${timestamp}"`,
        `-i "${videoPath}"`,
        '-vframes 1',
        '-q:v 2',
        `"${thumbnailPath}"`,
      ].join(' ');
      await run(extractCommand, { shell: true });
    },
    { concurrency },
  );
}, concurrency);

progress.success('All thumbnails generated');
