FROM node:16-alpine

RUN apk add -U wireguard-tools

COPY . /wg-api

WORKDIR /wg-api

RUN npm install

ENTRYPOINT [ "bash", "/wg-api/entrypoint.sh" ]
