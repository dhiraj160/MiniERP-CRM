FROM node:22

WORKDIR /usr/src/app

# Install dependencies first (for caching)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client & push SQLite schema, then seed
RUN npx prisma generate
RUN npx prisma db push
RUN npx tsx prisma/seed.ts || true

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Start server
CMD ["npm", "start"]
