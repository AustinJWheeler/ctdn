FROM node:12.16.1-alpine3.9

WORKDIR /code

COPY package.json /code/
#COPY yarn.lock /code/
#COPY package-lock.json /code/
RUN yarn add --exact react-scripts@3.4.0
RUN yarn

COPY . /code