# brefsearch-data

Data processing scripts for the [brefsearch](https://github.com/pixelastic/brefsearch) project.

This repository contains all the scripts and tools needed to extract subtitles
from YouTube videos, generate thumbnails and animated previews, and push the
data to Algolia for search indexing.

## Installation

```bash
yarn install
```

## Data Pipeline

### 1. Download Videos and Audio

This is a manual process, no scripts are provided. I "manually" downloaded the YouTube videos and audio files using `yt-dlp`:

```bash
# Download videos (for thumbnails/previews)
cd ./tmp/mp4 && yt-dlp "PLlFikkv2B2ffwYiFQJmcao3RKtw1DFMz5"

# Download audio only (for subtitle generation)
cd ./tmp/mp3 && yt-dlp --extract-audio "PLlFikkv2B2ffwYiFQJmcao3RKtw1DFMz5"
```

Files should be named like: `S01E75_brefJaiToutCasse.mp3`

### 2. Generate Subtitles

Upload `.mp3` files to HappyScribe or use Whisper to generate `.vtt` subtitle files. Save them in `data/vtts/`.

### 3. Process Subtitles

Extract and clean subtitle lines from `.vtt` files:

```bash
yarn update-lines
```

This reads `.vtt` files and updates the `lines` array in `data/episodes/*.json` files.

### 4. Update Video Metadata

Fetch YouTube video statistics and heatmaps:

```bash
yarn update-counts
```

This creates files in `data/counts/` with view counts, likes, and engagement heatmaps.

### 5. Generate Thumbnails

Extract static screenshots at subtitle timestamps:

```bash
yarn update-thumbnails
```

Images are saved in the sibling `brefsearch-images/thumbnails/` directory.

### 6. Generate Animated Previews

Create 2-second looping video clips:

```bash
yarn update-animated
```

Videos are saved in the sibling `brefsearch-images/animated/` directory.

### 7. Build Final Records

Combine all data into Algolia-ready JSON records:

```bash
yarn update-records
```

This creates one JSON file per subtitle line in `data/records/`.

### 8. Deploy Media Assets

Upload thumbnails and animated previews to your server:

```bash
yarn deploy-assets
```

**Note:** This requires your own server credentials configured in the deployment script.

### 9. Push to Algolia

Upload records to Algolia and configure the index:

Create a `.envrc` file (or set environment variables) with your Algolia credentials:

```bash
export ALGOLIA_ADMIN_API_KEY="your_admin_api_key"
```

The Algolia app configuration is in `lib/config.js`:
- App ID: `O3F8QXYK6R`
- Index Name: `brefsearch`

```bash
yarn deploy-algolia
```

This uses atomic indexing to only update changed records.

## Full Pipeline

To run all steps sequentially:

```bash
yarn update-and-deploy
```

## Related Repositories

- [brefsearch](https://github.com/pixelastic/brefsearch) - Frontend website (Next.js)
- [brefsearch-images](https://github.com/pixelastic/brefsearch-images) - Media assets repository

## License

MIT
