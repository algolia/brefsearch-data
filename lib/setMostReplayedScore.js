import { _ } from 'golgoth';

/**
 * Assigns a "most replayed" score (1-5) to each line based on heatmap data.
 *
 * For each line, calculates an average heatmap value for all segments that
 * intersect with the line, then divides all lines into 5 buckets of equal size,
 * assigning a score from 1 (least replayed) to 5 (most replayed).
 *
 * @param {Array<object>} lines - The array of line objects to score.
 * @param {Array<number>} heatmap - The heatmap data representing replay counts.
 * @returns {Array<object>} The array of line objects with added `__heatValue` and score.
 */
export function setMostReplayedScore(lines, heatmap) {
  // First, we calculate a mostReplayedAbsoluteValue for each line.
  const linesWithHeatValue = _.map(lines, (line) => {
    line.__heatValue = getHeatValue(heatmap, line);
    return line;
  });

  // Then, we'll divide all the lines into 5 buckets of equal size, by order of
  // heat
  return setMostReplayedScores(linesWithHeatValue, 5);
}

/**
 * Return a score between 1 and 100 for a given line
 * @param {Array} heatmap Array of heatmap
 * @param {object} line Line object
 * @returns {number} Number between 1 and 100
 */
function getHeatValue(heatmap, line) {
  const { start, stop } = line;
  return (
    _.chain(heatmap)
      .filter((segment) => {
        const hasBeginning = start >= segment.start && start <= segment.end;
        const hasEnding = stop >= segment.start && stop <= segment.end;
        return hasBeginning || hasEnding;
      })
      .map('value')
      .mean()
      .round()
      .value() || 0
  );
}

/**
 * Add a mostReplayedScore key to each line.
 * We split the lines into {bucketCount} buckets of equal size.
 * Lines in the first bucket are the least played, and lines in the last bucket
 * are the most played.
 * @param {string} lines All lines of the episode
 * @param {number} bucketCount The number of bucket to split it into
 * @returns {number} A bucket number. The higher the value, the most replayed
 * the line is
 **/
function setMostReplayedScores(lines, bucketCount) {
  const bucketSize = Math.ceil(lines.length / bucketCount);
  return _.chain(lines)
    .sortBy(['__heatValue', 'index'])
    .reverse()
    .chunk(bucketSize)
    .map((bucketLines, bucketIndex) => {
      const mostReplayedScore = bucketCount - bucketIndex;
      return _.map(bucketLines, (bucketLine) => {
        const { index, start, content } = bucketLine;
        return {
          content,
          start,
          index,
          mostReplayedScore,
        };
      });
    })
    .flatten()
    .sortBy('index')
    .value();
}
