const fs = require('fs');
const path = require('path');

// process.cwd() => Absolute path of the current working directory.
// path.join(process.cwd(), '01-read-file/text.txt')
//const filePath = path.resolve('01-read-file/text.txt');
const filePath = path.join(__dirname, 'text.txt');

printFile(filePath);
printFile2(filePath, onTextRead2);
printFile3(filePath, onAllTextRead3);
printFile4(filePath);

// async, most advanced with pipe (handles `backpressure` automatically)
function printFile(filePath, encoding='utf8') {
  fs.createReadStream(filePath, encoding).pipe(process.stdout);
}

// async, but the whole file
function printFile2(filePath, callback) {
  fs.readFile(filePath, 'utf8', (error, text) => {
    if (error) {
      console.error(error);
      callback(null);
      return;
    }
    callback(text);
  });
}

function onTextRead2(text) {
  console.log(text);
}

// stream with events (`flowing` mode, not `paused` one
function printFile3(filePath, callback) {
  let input = fs.createReadStream(filePath, 'utf-8');

  input.on('data', (chunk) => {
    console.log(chunk);
  });
  input.on('end', () => {
    callback(null);
  });
  input.on('error', err => {
    callback(err);
    process.exit();
  });
}

function onAllTextRead3(err) {
  if (!err) {
    //console.log('File was printed successfully');
  }
}

// stream - asynchronous iteration
async function printFile4(filePath) {
  let input = fs.createReadStream(filePath, 'utf-8');

  // currently the file is small and the first chunk will contain the whole content. But for future
  // we'll read and print content separating it by `new line`
  let incompleteLine = '';
  for await (let chunk of input) {
    let lines = (incompleteLine + chunk).split('\n');
    incompleteLine = lines.pop();
    for (let line of lines) {
      console.log(line);
    }
  }
  console.log(incompleteLine);
}
