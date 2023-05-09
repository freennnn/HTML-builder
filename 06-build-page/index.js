
const fsp = require('fs').promises;
const fs = require('fs');
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

async function purgeFolder(destDir) {
  // console.log('purgeFolder');
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
    // console.log(filePath);
    return dirent.isDirectory() ? getFiles(filePath): filePath;
  }));
  return files.flat();
}

async function copyAssets(sourceAssetsDir, destAssetsDir) {
  // console.log(`source ${sourceAssetsDir}`);
  // console.log(`destination ${destAssetsDir}`);
  const subdirs = await fsp.readdir(sourceAssetsDir);

  await Promise.all(subdirs.map((dirent) => {
    let dirPath = path.resolve(destAssetsDir, dirent);
    // console.log(dirPath);
    fsp.mkdir(dirPath, {recursive: true})
      .catch(error => console.log(error));
  }));

  const files = await getFiles(sourceAssetsDir);
  for await (let file of files) {
    // console.log(file);
    await fsp.copyFile(file, path.resolve(destAssetsDir, file.split('assets/')[1]));
  }
}

async function populateTemplate() {
  const sourceFiles = [
    path.resolve(__dirname, 'components', 'articles.html'),
    path.resolve(__dirname, 'components', 'footer.html'),
    path.resolve(__dirname, 'components', 'header.html')];

  const parrallel = filenames => {
    return Promise.all(
      filenames.map(fn => fsp.readFile(fn, 'utf-8'))
    );
  };
  parrallel(sourceFiles)
    .then (res => {
      //console.log('all read', res);
      console.log(res.length);
      let sourceTemplate = path.resolve(__dirname, 'template.html');
      let destination = path.resolve(__dirname, 'project-dist', 'index.html');
      fsp.readFile(sourceTemplate, 'utf-8')
        .then((template) =>  {
          //console.log(template);
          let indexHtml = template.replaceAll ('{{header}}', res[2]);
          indexHtml = indexHtml.replaceAll ('{{articles}}', res[0]);
          indexHtml = indexHtml.replaceAll ('{{footer}}', res[1]);
          fsp.writeFile(destination, indexHtml);
          //console.log(indexHtml);
        });
    })
    .catch(error => console.log(error));
}

purgeTheDestinationDirectory(destDir)
  .then (copyAssets(sourceAssetsDir, destAssetsDir))
  .then (combineCSS(path.resolve(__dirname, 'styles'), path.resolve(__dirname, 'project-dist', 'style.css')))
  .then (populateTemplate());