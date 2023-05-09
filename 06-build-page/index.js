
const fsp = require('fs').promises;
//const fs = require('fs');
const path = require('path');
const combineCSS = require('../05-merge-styles/index.js');

const destDir = path.resolve(__dirname, 'project-dist');
const sourceAssetsDir = path.resolve(__dirname, 'assets');
const destAssetsDir = path.resolve(destDir, 'assets');

//removing everything in dest folder
async function purgeTheDestinationDirectory(destDir) {
  fsp.mkdir(destDir)
    .catch(error => {
      if (error.code == 'EEXIST') {
        // the folder already exists, do nothing
      } else {
        console.log(error);
      }
    })
    .then(purgeFolder(destDir));
}        


// fs.mkdir(destDir, (error) => {
//   if (error) {
//     if (error.code == 'EEXIST') {
//       // the folder already exists, do nothing
//     } 
//     else console.log(error); 
//   }
// });
// const dir = await fsp.readdir(destDir, { withFileTypes: true });
// for await (let entry of dir) {
//   fsp.unlink(path.resolve(destDir, entry.name))
//     .catch(error => console.log(error));
// }
//}

async function purgeFolder(destDir) {
  console.log('purgeFolder');
  const dir = await fsp.readdir(destDir, { withFileTypes: true });
  for await (let entry of dir) {
    fsp.unlink(path.resolve(destDir, entry.name))
      .catch(error => console.log(error));
  }
}


async function getFiles(dir) {
  const subdirs = await fsp.readdir(dir, {withFileTypes: true });
  const files = await Promise.all(subdirs.map((dirent) => {
    const filePath = path.resolve(dir, dirent.name);
    console.log(filePath);
    return dirent.isDirectory() ? getFiles(filePath): filePath;
  }));
  return files.flat();
}

async function copyAssets(sourceAssetsDir, destAssetsDir) {
  console.log(`source ${sourceAssetsDir}`);
  console.log(`destination ${destAssetsDir}`);
  const subdirs = await fsp.readdir(sourceAssetsDir);

  const createFolders = await Promise.all(subdirs.map((dirent) => {
    let dirPath = path.resolve(destAssetsDir, dirent);
    console.log(dirPath);
    fsp.mkdir(dirPath, {recursive: true})
      .catch(error => console.log(error));
  }));


  // for await (let subdir of subdirs) { // not dirent, cause not {withFileTypes} - JS sucks
  //   let dirPath = path.resolve(destAssetsDir, subdir);
  //   console.log(dirPath);

  //   fsp.mkdir(dirPath, {recursive: true})
  //     .catch(error => console.log(error));
  //}
  console.log(createFolders);
  const files = await getFiles(sourceAssetsDir);
  for await (let file of files) {
    console.log(file);
    const result = await fsp.copyFile(file, path.resolve(destAssetsDir, file.split('assets/')[1]));
    console.log(result);
  }

}

purgeTheDestinationDirectory(destDir)
  .then (copyAssets(sourceAssetsDir, destAssetsDir))
  .then (combineCSS(path.resolve(__dirname, 'styles'), path.resolve(__dirname, 'project-dist', 'style.css')));