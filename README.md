# ctdn.io

[production site here](https://ctdn.io)

### Installing

To run locally you will need to add the file `config/dev.js`. Read keys.js to see how this file is used.

Run this to start the server
```
npm run debug
```

Run this to start the create react app server
```
npm --prefix client start
```

To create the dynamodb table, run this command
```
aws dynamo db create-table \
--table-name ctdn \
--attribute-definitions '[
  {
    "AttributeName": "pk",
    "AttributeType": "S"
  },
  {
    "AttributeName": "user",
    "AttributeType": "S"
  },
  {
    "AttributeName": "ending_key",
    "AttributeType": "S"
  },
  {
    "AttributeName": "ending_min",
    "AttributeType": "N"
  },
  {
    "AttributeName": "googleId",
    "AttributeType": "S"
  }
]' \
--key-schema '[
  {
    "AttributeName": "pk",
    "KeyType": "HASH"
  }
]' \
--provisioned-throughput '{
  "ReadCapacityUnits": 1,
  "WriteCapacityUnits": 1
}' \
--global-secondary-indexes '[
  {
    "IndexName": "by_user",
    "KeySchema": [
      {
        "AttributeName": "user",
        "KeyType": "HASH"
      },
      {
        "AttributeName": "ending_key",
        "KeyType": "RANGE"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    },
    "ProvisionedThroughput": {
      "ReadCapacityUnits": 1,
      "WriteCapacityUnits": 1
    }
  },
  {
    "IndexName": "by_google",
    "KeySchema": [
      {
        "AttributeName": "googleId",
        "KeyType": "HASH"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    },
    "ProvisionedThroughput": {
      "ReadCapacityUnits": 1,
      "WriteCapacityUnits": 1
    }
  },
  {
    "IndexName": "by_ending",
    "KeySchema": [
      {
        "AttributeName": "ending_min",
        "KeyType": "HASH"
      },
      {
        "AttributeName": "pk",
        "KeyType": "RANGE"
      }
    ],
    "Projection": {
      "ProjectionType": "INCLUDE",
      "NonKeyAttributes": [
        "ending",
        "hidden"
      ]
    },
    "ProvisionedThroughput": {
      "ReadCapacityUnits": 1,
      "WriteCapacityUnits": 1
    }
  }
]'
```

Run this command to populate the table
```
aws dynamodb put-item \
--table-name ctdn \
--item '{
  "pk": {"S": "autoinc"},
  "autoinc": {"N": "0"}
}' \
```