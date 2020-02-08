require('dotenv-safe').config();
const vision = require('@google-cloud/vision');
const express = require('express');
const app = express();

// const fs = require('fs');
// const util = require('util');
// const getAll = util.promisify(fs.readdir);
const client = new vision.ImageAnnotatorClient();

app.use(express.json());

let numBoxes = 0;
let imageData = 'sldfjsdklfj';

//get the number of boxes
async function getNumBoxes(imageData) {
  return new Promise(async(resolve, reject) => {
    const request = {
      image: {content: imageData}
    };
    let numBoxes = 0;
  
    try {
      const [results] = await client.objectLocalization(request);
      const [objects] = results.localizedObjectAnnotations;
      for (let key in objects) {
        if (key === 'name' 
            && (objects[key] === 'Box' || objects[key] === 'Packaged goods')) {
          numBoxes++;
        }
      }
  
      resolve(numBoxes);
    } catch (err) {
      reject(err);
    }
  });
}

//get the package difference
async function packageDifference(imageData) {
  try {
    const newNumBoxes = await getNumBoxes(imageData);
    const difference = newNumBoxes - numBoxes;
    numBoxes = newNumBoxes;
    return difference
  } catch (err) {
    console.log(err);
  } 
}

//testing with local files
// async function test() {
//   const dirName = 'boxes/';
//   const files = await getAll(dirName);
//   for (let file of files) {
//     console.log(file + ': ');
//     try {
//       console.log(await getNumBoxes(fs.readFileSync(dirName+file)));
//     } catch (err) {
//       console.log(err.message);
//     }
    
//   }
// }
// test();

const port = 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
