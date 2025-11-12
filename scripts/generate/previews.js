#!/usr/bin/env node
/**
 * Generate short MP4 preview clips from downloaded videos
 * Creates 2-second clips for each subtitle line using FFmpeg via Docker
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
  const episodeName = episode.name;
  const videoPath = absolute(gitRoot, `data/tmp/${basename}/video.mp4`);

  // Check if video exists
  if (!(await exists(videoPath))) {
    progress.info(`Skipping ${basename}: video not found at ${videoPath}`);
    return;
  }

  progress.tick(`Previews: ${episodeName}`);

  // Get subtitles
  const subtitlePath = await getSubtitlePath(basename);
  const subtitles = await convertVtt(subtitlePath);
  const subtitleCount = subtitles.length;

  await pMap(
    subtitles,
    async (subtitle, subtitleIndex) => {
      const timestamp = subtitle.start;
      const paddedIndex = _.padStart(timestamp, 3, '0');
      const duration = 2;
      const scale = 320;
      const compression = 23; // Low score means high quality

      const previewPath = absolute(
        gitRoot,
        `../brefsearch-images/previews/${basename}/${paddedIndex}.mp4`,
      );

      if (await exists(previewPath)) {
        return;
      }

      await mkdirp(absolute(gitRoot, `../brefsearch-images/previews/${basename}`));

      progress.tick(
        `Previews: ${episodeName} (line ${subtitleIndex}/${subtitleCount})`,
      );

      const command = [
        ffmpegWrapper,
        '-y -loglevel error',
        `-ss ${subtitle.start}`,
        `-t ${duration}`,
        `-i "${videoPath}"`,
        `-vf "scale=${scale}:-1"`,
        '-c:v libx264',
        `-crf ${compression}`,
        '-preset medium',
        '-movflags +faststart',
        `-an "${previewPath}"`,
      ].join(' ');

      await run(command, { shell: true });
    },
    { concurrency },
  );
}, concurrency);

progress.success('All preview clips generated');
