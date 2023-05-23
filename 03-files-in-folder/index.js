const fs = require('fs');
const path = require('path');

const dirPath = path.resolve(__dirname, 'secret-folder');

fs.promises.readdir(dirPath, {withFileTypes: true})
  .then(entries => {
    entries.filter(entry => entry.isFile())
      .forEach(entry => {
        const filePath = path.join(dirPath, entry.name);
        const ext = path.extname(filePath);
        fs.stat(filePath, (error, stats) => {
          if (error) {
            console.error(error);
          }
          else {
            console.log(`${entry.name.split('.')[0]} - ${ext.split('.')[1]} - ${parseFloat(stats.size/1024).toFixed(2)}kb`);
          }
        });
      });
  })
  .catch(console.error);
