FROM node:12.16.1-alpine3.9

WORKDIR /react

COPY client /react
RUN yarn build

WORKDIR /code

COPY server /code
RUN mv /react/build /code/build

CMD yarn start
