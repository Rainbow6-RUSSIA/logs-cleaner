FROM node:14
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
ADD . /usr/src/app
RUN yarn build
CMD [ "yarn", "start" ]