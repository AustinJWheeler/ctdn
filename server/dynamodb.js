const awsSdk = require('aws-sdk');
const uuidv1 = require('uuid/v1');
const cipher = require("./cipher");
const keys = require('./config/keys');

const init = () => {
  awsSdk.config.update(keys.aws);
  const dynamodb = new awsSdk.DynamoDB();

  const dropTable = () => new Promise((resolve, reject) =>
    dynamodb.deleteTable(
      {TableName: keys.dynamoTableName},
      (err, data) => err ? reject(err) : resolve(data)));

  const createTable = () => new Promise((resolve, reject) =>
    dynamodb.createTable({
        TableName: keys.dynamoTableName,
        KeySchema: [
          {AttributeName: "pk", KeyType: "HASH"},
        ],
        AttributeDefinitions: [
          {AttributeName: "pk", AttributeType: "S"},
          {AttributeName: "user", AttributeType: "S"},
          {AttributeName: "ending_key", AttributeType: "S"},
          {AttributeName: "ending_min", AttributeType: "N"},
          {AttributeName: "googleId", AttributeType: "S"},
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
            IndexName: 'by_google',
            KeySchema: [
              {AttributeName: 'googleId', KeyType: 'HASH'},
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
          TableName: keys.dynamoTableName,
          Item: {
            pk: {S: 'autoinc'},
            autoinc: {N: '0'}
          }
        },
        (err, data) => err ? reject(err) : resolve(data)))
      .then(put => create));

  const getCountdown = key => new Promise((resolve, reject) =>
    dynamodb.getItem(
      {TableName: keys.dynamoTableName, Key: {pk: {S: `c#${key}`}}},
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
      {TableName: keys.dynamoTableName, Key: {pk: {S: `u#${id}`}}},
      (err, data) => err ? reject(err) : resolve({
        googleId: data.Item.googleId.S,
        uuid: data.Item.pk.S.substring(2),
      })));

  const getCountdownsByUser = user => new Promise((resolve, reject) =>
    dynamodb.query(
      {
        TableName: keys.dynamoTableName,
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
        TableName: keys.dynamoTableName,
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
        TableName: keys.dynamoTableName,
        ConditionExpression: 'attribute_not_exists(pk)',
        Item: {
          pk: {S: `u#${uuid}`},
          googleId: {S: user.googleId},
          googleInfo: {
            M: {
              name: {S: user.googleInfo.name},
              given_name: {S: user.googleInfo.given_name},
              family_name: {S: user.googleInfo.family_name},
              picture: {S: user.googleInfo.picture},
              email: {S: user.googleInfo.email},
              email_verified: {S: user.googleInfo.email_verified.toString()},
              locale: {S: user.googleInfo.locale},
            }
          }
        },
      },
      (err, data) => err ? reject(err) : resolve(uuid));
  });

  const createCountdown = countdown => autoInc().then(sequence => new Promise((resolve, reject) => {
    const key = cipher.encode64(cipher.encrypt(sequence));
    dynamodb.putItem(
      {
        TableName: keys.dynamoTableName,
        ConditionExpression: 'attribute_not_exists(pk)',
        Item: countdownToDB({...countdown, sequence, key}),
      },
      (err, data) => err ? reject(err) : resolve(key));
  }));

  const autoInc = () => (new Promise((resolve, reject) =>
    dynamodb.updateItem(
      {
        TableName: keys.dynamoTableName,
        Key: {pk: {S: 'autoinc'}},
        UpdateExpression: "add autoinc :val",
        ExpressionAttributeValues: {":val": {N: '1'}},
        ReturnValues: "UPDATED_OLD"
      },
      (err, data) => err ? reject(err) : resolve(data))))
    .then(data => data.Attributes.autoinc.N);

  const getUserByGoogleId = googleId => (new Promise((resolve, reject) =>
    dynamodb.query(
      {
        TableName: keys.dynamoTableName,
        KeyConditionExpression: 'googleId = :g',
        ExpressionAttributeValues: {':g': {S: googleId}},
        IndexName: 'by_google'
      },
      (err, data) => err ? reject(err) : resolve(data))))
    .then(x => x.Items.length && {
      googleId: x.Items[0].googleId.S,
      uuid: x.Items[0].pk.S.substring(2),
    });

  return {
    dropTable,
    createTable,
    getCountdown,
    getUser,
    getCountdownsByUser,
    getCountdownsByEnding,
    getCountdownsByEndingRange,
    getUserByGoogleId,
    createUser,
    createCountdown,
  };
};

module.exports = init;

// const db = init();
// new Promise(resolve => resolve())
//   .then(create => new Promise((resolve, reject) =>
//     dyn.putItem({
//         TableName: "ctdn",
//         Item: {
//           pk: {S: 'autoinc'},
//           autoinc: {N: '0'}
//         }
//       },
//       (err, data) => err ? reject(err) : resolve(data))))
//   // .then(db.dropTable)
//   // .then(db.createTable)
//   // .then(() => db.createUser({googleId: '12345'}))
//   // .then(l => db.getUser(l)
//   //   .then(x => db.createCountdown({user: x.uuid, ending: 60000, message: 'mes', hidden: 'hid'}))
//   //   .then(db.getCountdown)
//   //   .then(() => db.getCountdownsByUser(l)))
//   // .then(() => db.getCountdownsByEndingRange([0, 1]))
//   // .then(() => db.getUserByGoogleId('12345'))
//   .then(console.log)
//   .catch(console.log);