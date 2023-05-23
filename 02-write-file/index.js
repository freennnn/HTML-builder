const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filePath = path.resolve(__dirname, 'text.txt');
//let output = fs.createWriteStream(filePath);
let rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('Please enter your text:\n');
rl.prompt();
rl.on('line', (line) => {
  if (line === 'exit') {
    isTimeToSayBye();
  } else {
    // {'flags': 'a'} used intentionally to append the file, remove it if you prefer to rewrite file every run
    fs.appendFile(filePath, line + '\n', {'flags': 'a'}, writeCallback); 
  }
});

function writeCallback(error) {
  if (error) {
    console.error(`file write operation failed with ${error}`);
  }
}

const seeYaMessage = 'May the force be with you';
function isTimeToSayBye() {
  // console.log(seeYaMessage);
  process.exit();
}

process.on('SIGINT', function() {
  isTimeToSayBye();
});

process.on('exit', (code) => {
  rl.close();
  console.log(`Arividerchi with ${code}`);
});