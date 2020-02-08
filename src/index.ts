require("dotenv-safe").config();

import express from "express";
const app: express.Application = express();
app.use(express.json());

// @ts-ignore
import vision from "@google-cloud/vision";
const client: any = new vision.ImageAnnotatorClient();

// @ts-ignore
import NodeCam from "node-webcam";

let currentNumBoxes: number = 0;


async function getNumBoxes(imageData: string): Promise<number> {
  return new Promise(async (resolve, reject) => {
    try {
      const [results] = await client.objectLocalization({
        image: { content: imageData }
      });
      const [objects] = results.localizedObjectAnnotations;
      let numBoxes = 0;
      for (let key in objects) {
        if (key === "name") {
          console.log(objects[key]);
          if (objects[key] === "Box" || objects[key] === "Packaged goods") {
            ++numBoxes;
          }
        }
      }
      resolve(numBoxes);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

async function getPackageDifference(imageData: string): Promise<number> {
  return new Promise(async (resolve, reject) => {
    try {
      const newNumBoxes = await getNumBoxes(imageData);
      const difference = newNumBoxes - currentNumBoxes;
      currentNumBoxes = newNumBoxes;
      resolve(difference);
    } catch (err) {
      reject(err);
    }
  });
}

//testing with local files
// async function test() {
//   const dirName = "boxes/";
//   const files = await getAll(dirName);
//   for (let file of files) {
//     console.log(file + ": ");
//     try {
//       console.log(await getNumBoxes(fs.readFileSync(dirName+file)));
//     } catch (err) {
//       console.log(err.message);
//     }
    
//   }
// }
// test();


let cams: Array<any> = [];

NodeCam.create({}).list((availableCams: Array<any>) => {
  availableCams.forEach((element: any) => {
    cams.push(
      NodeCam.create({
        width: 1280,
        height: 720,
        quality: 100,
        delay: 0,
        saveShots: false,
        output: "jpeg",
        device: element,
        callbackReturn: "base64",
        verbose: true
      })
    );
  });  
  console.log(cams);
  setInterval(() => {
    cams[0].capture("capture", async (err: any, base64: string) => {
      if (err) console.log(err);
      if (base64) {
        // stupid package adds 23 stupid characters at the front
        console.log(await getNumBoxes(base64.substring(23)));
      } else {
        console.log("alsdkfjasdg undefined");
      }
    });
  }, 5000);
});


const port: number = 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
