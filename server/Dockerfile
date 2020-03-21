FROM node:12.16.1-alpine3.9

WORKDIR /code

RUN npm install -g nodemon@2.0.2

COPY package.json /code/
COPY yarn.lock /code/
RUN yarn
RUN mv /code/node_modules /node_modules

COPY . /code
