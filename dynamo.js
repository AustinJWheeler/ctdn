/**
 * drop table
 * init db
 *
 * get countdown
 * get user
 * get countdowns by user
 * get countdowns by ending
 *
 * put user
 * put countdown
 *
 * autoinc
 */

const awsSdk = require('aws-sdk');
const uuidv1 = require('uuid/v1');
const cipher = require("./cipher");


const init = () => {
  awsSdk.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'local',
    endpoint: "http://localhost:8000"
  });
  const dynamodb = new awsSdk.DynamoDB();

  const dropTable = () => new Promise((resolve, reject) =>
    dynamodb.deleteTable(
      {TableName: "ctdn"},
      (err, data) => err ? reject(err) : resolve(data)));

  const createTable = () => new Promise((resolve, reject) =>
    dynamodb.createTable({
        TableName: "ctdn",
        KeySchema: [
          {AttributeName: "pk", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
          {AttributeName: "pk", AttributeType: "S"},
          {AttributeName: "user", AttributeType: "S"},
          {AttributeName: "ending_key", AttributeType: "S"},
          {AttributeName: "ending_min", AttributeType: "N"},
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
        GlobalSecondaryIndexes: [
          {
            IndexName: 'by_user',
            KeySchema: [
              {AttributeName: 'user', KeyType: 'HASH'},
              {AttributeName: 'ending_key', KeyType: 'RANGE'},
            ],
            Projection: {ProjectionType: 'ALL'},
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1,
            },
          },
          {
            IndexName: 'by_ending',
            KeySchema: [
              {AttributeName: "ending_min", KeyType: "HASH"},
              {AttributeName: 'pk', KeyType: 'RANGE'}
            ],
            Projection: {ProjectionType: 'INCLUDE', NonKeyAttributes: ['ending', 'hidden']},
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1,
            },
          },
        ],
      },
      (err, data) => err ? reject(err) : resolve(data)))
    .then(create => new Promise((resolve, reject) =>
      dynamodb.putItem({
          TableName: "ctdn",
          Item: {
            pk: {S: 'autoinc'},
            autoinc: {N: '0'}
          }
        },
        (err, data) => err ? reject(err) : resolve(data)))
      .then(put => create));

  const getCountdown = key => new Promise((resolve, reject) =>
    dynamodb.getItem(
      {TableName: "ctdn", Key: {pk: {S: `c#${key}`}}},
      (err, data) => err ? reject(err) : resolve(data)))
    .then(data => countdownToObject(data.Item));

  const countdownToObject = countdown => ({
    key: countdown.pk.S.substring(2),
    user: countdown.user && countdown.user.S.substring(2),
    ending: parseInt(countdown.ending.N, 10),
    message: countdown.message && countdown.message.S,
    hidden: countdown.hidden.S,
    sequence: countdown.sequence && parseInt(countdown.sequence.N, 10),
    ending_min: parseInt(countdown.ending_min.N, 10),
    ending_key: countdown.ending_key && countdown.ending_key.S,
  });

  const countdownToDB = countdown => ({
    pk: {S: `c#${countdown.key}`},
    sequence: {N: countdown.sequence.toString(10)},
    ending: {N: countdown.ending.toString(10)},
    message: {S: countdown.message},
    hidden: {S: countdown.hidden},
    user: {S: `u#${countdown.user}`},
    ending_min: {N: Math.floor(countdown.ending / (60 * 1000)).toString(10)},
    ending_key: {S: countdown.ending.toString(10).padStart(16, '0') + countdown.key},
  });

  const getUser = id => new Promise((resolve, reject) =>
    dynamodb.getItem(
      {TableName: "ctdn", Key: {pk: {S: `u#${id}`}}},
      (err, data) => err ? reject(err) : resolve({
        googleId: data.Item.googleId.S,
        uuid: data.Item.pk.S.substring(2),
      })));

  const getCountdownsByUser = user => new Promise((resolve, reject) =>
    dynamodb.query(
      {
        TableName: "ctdn",
        ExpressionAttributeNames: {'#u': 'user'},
        KeyConditionExpression: '#u = :u',
        ExpressionAttributeValues: {':u': {S: `u#${user}`}},
        IndexName: 'by_user'
      },
      (err, data) => err ? reject(err) : resolve(data)))
    .then(data => data.Items.map(countdownToObject));

  const getCountdownsByEnding = time => new Promise((resolve, reject) =>
    dynamodb.query(
      {
        TableName: "ctdn",
        KeyConditionExpression: 'ending_min = :v',
        ExpressionAttributeValues: {':v': {N: time.toString(10)}},
        IndexName: 'by_ending'
      },
      (err, data) => err ? reject(err) : resolve(data)))
    .then(data => data.Items.map(countdownToObject));

  const getCountdownsByEndingRange = times => Promise.all(times.map(getCountdownsByEnding))
    .then(l => l.reduce((acc, x) => acc.concat(x)));

  const createUser = user => new Promise((resolve, reject) => {
    const uuid = uuidv1();
    dynamodb.putItem(
      {
        TableName: "ctdn",
        ConditionExpression: 'attribute_not_exists(pk)',
        Item: {
          pk: {S: `u#${uuid}`},
          googleId: {S: user.googleId}
        },
      },
      (err, data) => err ? reject(err) : resolve(uuid));
  });

  const createCountdown = countdown => autoInc().then(sequence => new Promise((resolve, reject) => {
    const key = cipher.encode64(cipher.encrypt(sequence));
    dynamodb.putItem(
      {
        TableName: "ctdn",
        ConditionExpression: 'attribute_not_exists(pk)',
        Item: countdownToDB({...countdown, sequence, key}),
      },
      (err, data) => err ? reject(err) : resolve(key));
  }));

  const autoInc = () => (new Promise((resolve, reject) =>
    dynamodb.updateItem(
      {
        TableName: "ctdn",
        Key: {pk: {S: 'autoinc'}},
        UpdateExpression: "add autoinc :val",
        ExpressionAttributeValues: {":val": {N: '1'}},
        ReturnValues: "UPDATED_OLD"
      },
      (err, data) => err ? reject(err) : resolve(data))))
    .then(data => data.Attributes.autoinc.N);

  return {
    dropTable,
    createTable,
    getCountdown,
    getUser,
    getCountdownsByUser,
    getCountdownsByEnding,
    getCountdownsByEndingRange,
    createUser,
    createCountdown,
  };
};

module.exports = init;

// const db = init();
// db.dropTable()
//   .then(() => db.createTable())
//   .then(() => db.createUser({googleId: '12345'}))
//   .then(l => db.getUser(l)
//     .then(x => db.createCountdown({user: x.uuid, ending: 60000, message: 'mes', hidden: 'hid'}))
//     .then(x => db.getCountdown(x))
//     .then(() => db.getCountdownsByUser(l)))
//   .then(() => db.getCountdownsByEndingRange([0, 1]))
//   .then(x => console.log(x))
//   .catch(x => console.log(x));