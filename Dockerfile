FROM alpine:3.22

# Install Node.js,and pipx
RUN apk add --no-cache \
    nodejs~=18.18.0 \
    npm~=11.3.0 \
    pipx~=1.7.1

# Install yt-dlp via pipx
RUN pipx install yt-dlp && \
    pipx ensurepath

# Add pipx binaries to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Enable Corepack for Yarn 4
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Copy the rest of the application
COPY . .

# Default command
CMD ["node", "./scripts/data/update-popularity.js"]
