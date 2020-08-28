FROM node:14
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
ADD . /usr/src/app
RUN yarn build
CMD [ "yarn", "start" ]