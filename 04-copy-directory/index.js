
const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, 'files');
const destDir = path.resolve(__dirname, 'files-copy');

//removing everything in dest folder
async function purgeTheDestinationDirectory(destDir) {
  fs.mkdir(destDir, (error) => {
    if (error) {
      if (error.code == 'EEXIST') {
        // the folder already exists, do nothing
      } 
      else console.log(error); 
    }
  });

  const dir = await fsp.readdir(destDir, { withFileTypes: true });
  for await (let entry of dir) {
    fsp.unlink(path.resolve(destDir, entry.name))
      .catch(error => console.log(error))
      .finally(console.log(`removed ${entry.name} easy, no problem`));
  }
}

async function copyFiles(source, dest) {
  const dir = await fsp.readdir(source, { withFileTypes: true });
  for await (let entry of dir) {
    fsp.copyFile(path.resolve(source, entry.name), path.resolve(dest, entry.name));
  }
}

purgeTheDestinationDirectory(destDir)
  .then( copyFiles(sourceDir, destDir) );