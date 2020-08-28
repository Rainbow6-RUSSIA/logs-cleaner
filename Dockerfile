FROM node:14
ENV NODE_ENV production
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ /usr/src/app
RUN yarn install
RUN yarn build
ENV PORT 80
EXPOSE 80
CMD [ "yarn", "start" ]