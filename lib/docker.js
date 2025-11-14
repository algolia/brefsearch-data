import { gitRoot, run, spinner } from 'firost';

const imageName = 'brefsearch-tools';

/**
 * Build the Docker image with spinner feedback
 * @returns {Promise<void>}
 */
export async function buildImage() {
  const progress = spinner();

  try {
    progress.tick('Building Docker image...');

    // Get current user and group IDs
    const userId = process.getuid();
    const groupId = process.getgid();

    const buildCommand = [
      'docker build',
      `--build-arg USER_ID=${userId}`,
      `--build-arg GROUP_ID=${groupId}`,
      `-t ${imageName}`,
      gitRoot(),
    ].join(' ');

    await run(buildCommand, {
      shell: true,
      stdout: false,
      stderr: false,
    });
    progress.success('Docker image ready');
  } catch (error) {
    progress.error('Docker build failed');
    console.error('\nBuild error:');
    console.error(error.stderr || error.message);
    throw error;
  }
}
