FROM node:lts-buster as build

# Create app directory
WORKDIR /app

# yarn install
ADD ./package.json /app/package.json
ADD ./packages/api/package.json /app/packages/api/package.json
ADD ./packages/app/package.json /app/packages/app/package.json
ADD ./packages/common/package.json /app/packages/common/package.json
ADD ./yarn.lock /app/yarn.lock
RUN yarn install --frozen-lockfile

# Copy all files
ADD . /app

# yarn typecheck
RUN yarn typecheck:app
# yarn lint
RUN yarn lint
# yarn build
RUN yarn build:app
RUN yarn build:common

# Install and execute node-prune
# RUN apt update && apt install curl -y
# RUN curl -sf https://gobinaries.com/tj/node-prune | sh
# RUN node-prune

# Use production image
FROM node:lts-buster

WORKDIR /app

# Copy node_modules and global package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Copy files for common
COPY --from=build /app/packages/common /app/packages/common

# Copy files for app
COPY --from=build /app/packages/app/node_modules /app/packages/app/node_modules
COPY --from=build /app/packages/app/package.json /app/packages/app/package.json
COPY --from=build /app/packages/app/.nuxt /app/packages/app/.nuxt
COPY --from=build /app/packages/app/.output /app/packages/app/.output

# Copy files for common
COPY --from=build /app/packages/common /app/packages/common

# Copy files for api
COPY --from=build /app/packages/api /app/packages/api

RUN apt-get update && apt-get install poppler-utils -y

ENV HOST 0.0.0.0
EXPOSE 3000
