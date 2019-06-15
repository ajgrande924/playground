'use strict';

const path = require('path');
const grpc = require('grpc');
const intoStream = require('into-stream');
const protoLoader = require('@grpc/proto-loader');

function bidiStream(call) {
  const chunks = [];
  let str, sampleStream;
  
  call.on('data', function(req) {
    if (req.chunk && req.chunk.length) {
      chunks.push(req.chunk);
    } else {
      str = Buffer.concat(chunks).toString();

      console.log('[2] Successfully received json string stream request');
      
      sampleStream = intoStream(str);

      sampleStream.on('data', (chunk) => {
        call.write({ chunk });
      });

      sampleStream.on('error', (err) => {
        throw err;
      });

      sampleStream.on('end', () => {
        call.write({ msg: 'done' });
        console.log('[3] Successfully sent json string stream reponse');
      });
    }
  });
  
  call.on('end', function() {
    call.end();
  });
}

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

const server = new grpc.Server();
server.addService(Proto.TestService.service, { bidiStream: bidiStream });
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
