# brefsearch-data

Data processing scripts for the [brefsearch](https://github.com/pixelastic/brefsearch) project.

This repository contains all the scripts and tools needed to extract subtitles from YouTube videos, generate thumbnails and animated previews, and push the data to Algolia for search indexing.

## Record Structure

Structure of a single Algolia record (one record per subtitle line):

```json
{
  "episode": {
    "basename": "S01E65_brefJaiUnNouveauPote",
    "duration": "2:06",
    "id": "ZbGrzgcO68A",
    "index": 65,
    "name": "Bref. J'ai un nouveau pote.",
    "slug": "brefJaiUnNouveauPote",
    "viewCount": 9350261
  },
  "subtitle": {
    "content": "— Tu sais donc pas que c'est pas bien d'être raciste ?\n— Nom de Zeus, Marty !",
    "index": 13,
    "mostReplayedScore": 3,
    "start": 35
  },
  "media": {
    "height": 720,
    "lqip": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAA[…]XOfz/2JXQfoi2/FXAAAAAElFTkSuQmCC",
    "previewPath": "S01E65_brefJaiUnNouveauPote/previews/035.mp4",
    "thumbnailPath": "S01E65_brefJaiUnNouveauPote/thumbnails/035.png",
    "width": 1280
  }
}
```

## Data Structure

The data directory is organized in 4 layers following the data processing flow:

```
data/
├── input/                          # Manual source of truth
│   └── {episode}/                  # One directory per episode
│       ├── metadata.json           # Episode info (name, slug, YouTube ID, duration)
│       └── subtitle.vtt            # WebVTT subtitle file with dialogue timestamps
│
├── computed/                       # Computed data from external sources
│   └── {episode}/
│       ├── viewcount.json          # View count from YouTube Data API
│       ├── heatmap.json            # Most replayed heatmap from yt-dlp
│       ├── media.json              # Media metadata (dimensions, LQIP, paths)
│       ├── thumbnails/             # Symlink → ../brefsearch-media/media/{episode}/thumbnails/
│       └── previews/               # Symlink → ../brefsearch-media/media/{episode}/previews/
│
├── output/                         # Generated artifacts
│   └── {episode}/
│       └── episode.json            # Complete episode data, including subtitles and media
│
└── tmp/                            # Temporary working files (not committed)
    └── {episode}/
        └── video.mp4               # Downloaded YouTube video for processing
```

**Episode naming convention:** `S01E{padded_index}_{slug}` (e.g., `S01E01_brefJaiDragueCetteFille`)



## Data Pipeline

### Prerequisites

- **Node.js** >= 22.16.0
- **Docker** (for yt-dlp and FFmpeg tools)
- **Yarn 4.6.0** (via Corepack)

### Setup (one-time)

```bash
# Download YouTube videos to tmp/ for FFmpeg processing
yarn setup:download-videos
```

### Local Development (after editing subtitles or adding episodes)

```bash
# Update computed data
yarn update:media            # Generate thumbnails/previews + media.json
yarn update:viewcount        # Fetch view counts from YouTube API
yarn update:heatmap          # Fetch heatmaps from yt-dlp (optional, manual only)

# Generate final output
yarn generate:episodes       # Merge input + computed → output

# Deploy to production
yarn deploy:algolia          # Push records to Algolia index
yarn deploy:media            # Sync media assets to CDN
```

**Processing specific episodes:**

All scripts that process episodes accept optional metadata.json file paths. If provided, only those episodes will be processed. If no files are specified, all episodes are processed.

```bash
# Process a single episode
yarn update:viewcount data/input/S01E01_brefJaiDragueCetteFille/metadata.json
yarn update:heatmap data/input/S01E01_brefJaiDragueCetteFille/metadata.json
yarn update:media data/input/S01E01_brefJaiDragueCetteFille/metadata.json
yarn generate:episodes data/input/S01E01_brefJaiDragueCetteFille/metadata.json

# Process multiple episodes
yarn update:viewcount data/input/S01E1*/metadata.json
```

### Environment Variables

Different scripts require different credentials:

- **`yarn update:viewcount`**: `YOUTUBE_API_KEY` (required - uses YouTube Data API)
- **`yarn update:heatmap`**: No credentials required (uses yt-dlp via Docker)
- **`yarn deploy:algolia`**: `ALGOLIA_ADMIN_API_KEY` (required - pushes to Algolia index)
- **`yarn deploy:media`**: SSH access configured for rsync

### GitHub Actions (Automated Weekly Updates)

This repository includes a GitHub Actions workflow that automatically:
1. Fetches fresh view counts from YouTube Data API
2. Regenerates episode JSON files
3. Commits changes with timestamp
4. Deploys to Algolia

**Note:** The CI workflow only updates view counts. Heatmaps must be updated manually using `yarn update:heatmap` (requires yt-dlp which may be blocked by YouTube's bot detection in CI environments).

**Setup:**
1. Configure repository secrets in GitHub Settings → Secrets and variables → Actions:
   - `ALGOLIA_ADMIN_API_KEY` (required)
   - `YOUTUBE_API_KEY` (required)

2. The workflow runs automatically every Monday at 3:00 AM UTC

3. You can also trigger it manually:
   - Go to Actions tab → Weekly Data Update → Run workflow

**Workflow file:** `.github/workflows/weekly-update.yml`

### Data Update Strategy

**View Counts vs Heatmaps:**
- **View counts** are fetched via YouTube Data API and updated automatically by CI weekly
- **Heatmaps** (most replayed sections) are fetched via yt-dlp and must be updated manually
  - yt-dlp may be blocked by YouTube's bot detection in CI environments
  - Heatmaps are optional - if missing or empty, episodes still work (just without mostReplayedScore)
  - Run `yarn update:heatmap` locally when you want to refresh heatmap data

### Scripts Overview

**Note:** All scripts using yt-dlp or FFmpeg run through Docker wrappers automatically (no local installation required).

# Initial data dump

Before getting the repo in that state, I had to do a bit of manual processing. Below is a generic documentation of the process. I do not have scripts for you to redo the same thing automatically as it was a lot of manual one-off scripting.

I first "manually" downloaded the YouTube videos and audio files using `yt-dlp`:

```bash
# Download videos (for thumbnails/previews)
cd ./tmp/mp4 && yt-dlp "PLlFikkv2B2ffwYiFQJmcao3RKtw1DFMz5"

# Download audio only (for subtitle generation)
cd ./tmp/mp3 && yt-dlp --extract-audio "PLlFikkv2B2ffwYiFQJmcao3RKtw1DFMz5"
```

I named my files with the pattern Files are expected be named like: `S01E75_brefJaiToutCasse.mp3`

I uploaded my `.mp3` files to [HappyScribe](https://www.happyscribe.com) to generate `.vtt` subtitle files. I saved them in `data/source/subtitles/`. I proofread them all by watching the episodes with VLC and the subtitles.

## Related Repositories

- [brefsearch](https://github.com/pixelastic/brefsearch) - Frontend website (Next.js)
- [brefsearch-media](https://github.com/pixelastic/brefsearch-media) - Media assets repository (thumbnails + previews)

## License

MIT
