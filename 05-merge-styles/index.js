const fs = require('fs');
const path = require('path');

const dirPath = path.resolve(__dirname, 'styles');
const destFilePath = path.resolve(__dirname, 'project-dist', 'bundle.css');

combineCSS(destFilePath)
  .catch(console.log('not all errors are actually errors in our case')); // error if file don't exist - in such case creating file

async function combineCSS(destFilePath) {
  fs.exists(destFilePath, (exists) => {
    if (exists) {
      fs.promises.unlink(path.resolve(destFilePath))
        .then(combineStyles(dirPath));
    } else {
      combineStyles(dirPath);
    }
  }); 

  // if (fs.existsSync(destFilePath)) {
  //   fs.promises.unlink(path.resolve(destFilePath))
  //     .then(combineStyles(dirPath));
  // } else {
  //   combineStyles(dirPath);
  // }
}

function combineStyles() {
  fs.writeFile(destFilePath, '', () => {  //creating result file - no need for async here or stream, but I know you people =)
    console.log('combineStyles');
    step2();
  });
}

async function step2() {
  const dir = await fs.promises.readdir(dirPath, { withFileTypes: true });
  dir.filter(entry => entry.isFile())
    .forEach(entry => {
      const filePath = path.join(dirPath, entry.name);
      const ext = path.extname(filePath);
      if (ext === '.css') {
        // we use Sync variation because we are using shared state - bundle.css file and need write to happen synchronously
        // cause otherwise styles from different files will get mixed. Especially error prone in case of reading/writing 
        // via streams - chunks of one style could be mixed with chunks of another. Leading to completely wrong styles.
        fs.readFile(filePath, 'utf8', (error, text) => {
          fs.appendFile(destFilePath, text, () => { console.log('file appended');});
        });
        
        // we can't use this stream approach cause otherwise different css chunks will be mixed
        //fs.createReadStream(filePath, 'utf-8').pipe(fs.createWriteStream(destFilePath, 'utf-8'));
      }
    });
}
