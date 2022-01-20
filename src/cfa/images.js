/*jshint esversion: 8 */

const { app } = require('electron');

const fs = require('fs');
const path = require('path');

export const images = {};

const imagesDir = path.join(app.getPath('userData'), 'images');

images.setup = () => {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
}

images.erase = (imagepath) => {
  fs.rmSync(imagepath);
}
images.eraseAll = () => {
  fs.readdirSync(imagesDir).forEach((f) => {
    fs.rmSync(path.join(imagesDir, f));
  })
}

images.save = (filename, data) => {
  const base64Filename = filename + '.base64';
  let imageBase64Path = path.join(imagesDir, base64Filename);
  fs.writeFileSync(imageBase64Path, data);
  return imageBase64Path;
}

images.load = (imagepath) => {
  // const base64Filename = imagename + '.base64';
  // let imageBase64Path = path.join(imagesDir, base64Filename);
  let imageBase64 = fs.readFileSync(imagepath);
  return imageBase64;
}
