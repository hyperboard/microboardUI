FROM oven/bun:1 AS base

FROM base AS install

COPY package.json bun.lock ./

RUN bun install --ignore-scripts

COPY . .

RUN bun run build:app

EXPOSE 8000

ENTRYPOINT ["bun", "run", "start"]