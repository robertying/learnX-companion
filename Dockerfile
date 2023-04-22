FROM node:20-alpine

RUN addgroup -S -g 1001 learnx && adduser -S -G learnx -u 1001 learnx

RUN apk add --no-cache 'su-exec>=0.2'

RUN mkdir /app && chown learnx:learnx /app
WORKDIR /app

COPY docker-entrypoint.sh ./
COPY app/cli.js app/cli.js.map ./
COPY openssl.cnf ./

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]

ENV NODE_ENV production
ENV OPENSSL_CONF=/app/openssl.cnf
CMD [ "node", "cli.js", "config.json" ]
