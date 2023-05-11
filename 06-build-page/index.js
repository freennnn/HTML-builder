
const fsp = require('fs').promises;
//const fs = require('fs');
const path = require('path');
const { combineCSS } = require('../05-merge-styles/index.js');

const destDir = path.resolve(__dirname, 'project-dist');
const sourceAssetsDir = path.resolve(__dirname, 'assets');
const destAssetsDir = path.resolve(destDir, 'assets');

//removing everything in dest folder
async function build(destDir) {
  // purgeTheDestinationDirectory
  await fsp.rm(destDir, {recursive: true})
    .catch(error =>  console.log('project-dist folder does not exist yet - so nothing to remove') );

  await fsp.mkdir(destDir)
    .catch(error => console.log(error));
  
  await copyAssets(sourceAssetsDir, destAssetsDir);

  await combineCSS(path.resolve(__dirname, 'styles'), path.resolve(__dirname, 'project-dist', 'style.css'));

  await populateTemplate();
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
    await fsp.copyFile(file, path.resolve(destAssetsDir, file.split('assets\\')[1]));
  }
}

async function populateTemplate() {
  try {
    let sourceTemplatePath = path.resolve(__dirname, 'template.html');
    let template = await fsp.readFile(sourceTemplatePath, 'utf-8');
    const doubleQuoteTemplates = /[^{\{]+(?=}\})/g; // regex to find all {{section}}
    var matches = template.match(doubleQuoteTemplates);
    let componentsSourceMap = new Map();
    let componetsPathMap = new Map();
  
    matches.forEach(name => componetsPathMap.set(name, path.resolve(__dirname, 'components',`${name}.html`)));
    for (let [key, value] of componetsPathMap) {
      let componentSource = await fsp.readFile(value, 'utf-8');
      componentsSourceMap.set(key, componentSource);
    }

    for (let [key, value] of componentsSourceMap) {
      template = template.replaceAll(`{{${key}}}`, value);
    }

    const destination = path.resolve(__dirname, 'project-dist', 'index.html');
    await fsp.writeFile(destination, template);
  }
  catch (e) {
    console.log(e);
  }
}

build(destDir);