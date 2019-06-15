'use strict';

const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

function bidiStream(call) {
  call.on('data', function(data) {
    if (data.message === 'done') {
      console.log('finished request stream');
      call.write({ count: 1 });
      call.write({ count: 2 });
      call.write({ count: 3 });
      call.write({ count: 4 });
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
