FROM alpine:3.22

# Install FFmpeg, pipx (to install yt-dlp) and deno (deno dependency)
RUN apk add --no-cache \
    ffmpeg~=6.1 \
    pipx~=1.7.1 \
    deno~=2.3.1

# Install yt-dlp via pipx
RUN pipx install yt-dlp
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /data

# Use shell as entrypoint for flexibility
ENTRYPOINT ["/bin/sh", "-c"]
