'use strict';

const path = require('path');
const grpc = require('grpc');
const intoStream = require('into-stream');
const protoLoader = require('@grpc/proto-loader');

const json = require('./sample.json');
const str = JSON.stringify(json);

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

const chunks = [];
let responseStr, responseJson;

call.on('data', function(req) {
  if (req.chunk && req.chunk.length) {
    chunks.push(req.chunk);
  } else {
    responseStr = Buffer.concat(chunks).toString();
    responseJson = JSON.parse(responseStr);
    console.log('[4] Successfully received json string stream reponse');
    call.end();
  }
});

call.on('end', (err) => { 
  call.end();
});

const sampleStream = intoStream(str);

sampleStream.on('data', (chunk) => {
  call.write({ chunk });
});

sampleStream.on('error', (err) => {
  throw err;
});

sampleStream.on('end', () => {
  call.write({ msg: 'done' });
  console.log('[1] Successfully sent json string stream request');
});

