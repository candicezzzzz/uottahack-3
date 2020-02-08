// Imports the Google Cloud client libraries
require('dotenv-safe').config();
const vision = require('@google-cloud/vision');
// const fs = require('fs');
// const util = require('util');

// const getAll = util.promisify(fs.readdir);
const client = new vision.ImageAnnotatorClient();



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


// Creates a client
// async function test(file) {

//   const dirName = 'boxes/';
//   const fileNames = await getAll(dirName);

//   for (let filename of fileNames) {
//     console.log(filename + ': ');
//     const request = {
//       image: {content: filename},
//     };
    
//     const [result] = await client.objectLocalization(request);
//     const objects = result.localizedObjectAnnotations;
//     objects.forEach(object => {
//       console.log(`Name: ${object.name}`);
//       console.log(`Confidence: ${object.score}`);
//       const vertices = object.boundingPoly.normalizedVertices;
//       vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
//       console.log();
//     });
//   }
  
// }

// test();