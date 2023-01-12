FROM node:16-alpine
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 learnx

COPY --chown=learnx:nodejs app/cli.js app/cli.js.map ./

ENV NODE_ENV production

USER learnx

CMD ["node", "cli.js", "config.json"]
