FROM node:12.16.1-alpine3.9

WORKDIR /react

COPY client/package.json /react/
COPY client/package-lock.json /react/
RUN npm install
COPY client /react
RUN npm run build

WORKDIR /code

COPY server/package.json /code/
COPY server/yarn.lock /code/
RUN yarn
COPY server /code
RUN mv /react/build /code/build

EXPOSE 5000
CMD node ./app.js