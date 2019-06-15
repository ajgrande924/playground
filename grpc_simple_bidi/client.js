'use strict';

const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.resolve(__dirname, 'test.proto');

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

const Proto = grpc.loadPackageDefinition(packageDefinition).Test;

const client = new Proto.TestService('localhost:50051', grpc.credentials.createInsecure());

const call = client.bidiStream();

call.on('data', function(data) {
  console.log('count', data);
  if (data.count === 4) {
    console.log('finished response stream');
    call.end();
  }
});

call.on('end', (err) => { 
  call.end(); 
});

call.write({ error: true });
call.write({ error: true });
call.write({ error: true });
call.write({ message: 'done' });

