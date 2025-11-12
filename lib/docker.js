import { absolute, run, spinner } from 'firost';

const imageName = 'brefsearch-tools';

/**
 * Build the Docker image with spinner feedback
 * @returns {Promise<void>}
 */
export async function buildImage() {
  const gitRoot = absolute('<gitRoot>');
  const progress = spinner();

  try {
    progress.tick('Building Docker image...');
    await run(`docker build -t ${imageName} ${gitRoot}`, {
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
