FROM openjdk:9

RUN mkdir /dynamodb
WORKDIR /dynamodb

RUN wget https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz -q -O - | tar -xz

CMD java -Djava.library.path=./DymoDBLocal_lib -jar DynamoDBLocal.jar
