'use strict';

const intoStream = require('into-stream');

// default chunks are 16.384 kb max

const json = require('./sample.json');
const str = JSON.stringify(json);
const sampleStream = intoStream(str);

const chunks = [];

let jsonOut;

sampleStream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
  console.log('chunk', chunk);
  chunks.push(chunk);
});

sampleStream.on('error', (err) => {
  console.log('error', err);
});

sampleStream.on('end', () => {
  jsonOut = Buffer.concat(chunks).toString();
});
