FROM alpine:3.22

# Accept build arguments for user/group IDs
ARG USER_ID=1000
ARG GROUP_ID=1000

# Install FFmpeg, pipx (to install yt-dlp) and deno (deno dependency)
RUN apk add --no-cache \
    ffmpeg~=6.1 \
    pipx~=1.7.1 \
    deno~=2.3.1

# Create user with same UID/GID as host user
RUN addgroup -g ${GROUP_ID} appuser && \
    adduser -D -u ${USER_ID} -G appuser appuser

# Switch to app user
USER appuser

# Install yt-dlp
RUN pipx install yt-dlp
ENV PATH="/home/appuser/.local/bin:${PATH}"

WORKDIR /data

# Use shell as entrypoint for flexibility
ENTRYPOINT ["/bin/sh", "-c"]
