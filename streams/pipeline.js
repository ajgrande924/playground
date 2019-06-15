const fs = require('fs');
const util = require('util');
const stream = require('stream');
const JSONStream = require('JSONStream');

(async () => {
  const pipeline = util.promisify(stream.pipeline)

  const reader      = (file) => fs.createReadStream(file);
  const writer      = (file) => fs.createWriteStream(file);
  const parser      = JSONStream.parse();
  const stringifier = JSONStream.stringify('', '\n', '', 2);
  
  try {
    await pipeline(
      reader('sample.json'),
      parser,
      stringifier,
      writer('sample_out.json')
    );
  } catch(e) {
    throw e;
  }

})();