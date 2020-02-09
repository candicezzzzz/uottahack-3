require("dotenv-safe").config();

import express from "express";
import path from "path";
import bodyParser from "body-parser";

import * as admin from "firebase-admin";
admin.initializeApp({
  credential: admin.credential.cert("./uOttoFirebaseKey.json")
});

// import util from "util";
import fs from "fs";

let userConfig: any;
fs.readFile("userconfig.json", (err: any, data: any) => {
  if (err) console.log(err);
  userConfig = JSON.parse(data);
});

// const userConfig = JSON.parse(fs.readFile('userconfig.json'));

// process the forms passed
const formidable: any = require("formidable");

// used for music
// const neko = require('sound-play');

const app: express.Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// @ts-ignore
import vision from "@google-cloud/vision";
const client: any = new vision.ImageAnnotatorClient();

// @ts-ignore
import NodeCam from "node-webcam";

const possibleOptions: Array<String> = [
  "Box",
  "Packaged goods",
  "Boxed packaged goods",
  "Shipping box"
];
let currentNumBoxes: number = 0;

function sendNotification(title: string, body: string) {
  admin.messaging().send({
    notification: {
      title: title,
      body: body
    },
    token: process.env.KEVINS_PHONE_TOKEN_LOL_TEST!
  }).then((response: any) => {
    console.log(response);
  }).catch(console.log);
}

async function getNumBoxes(imageData: string): Promise<number> {
  return new Promise(async (resolve, reject) => {
    try {
      const [results] = await client.objectLocalization({
        image: { content: imageData }
      });
      const objects: Array<any> = results.localizedObjectAnnotations;
      let numBoxes = 0;
      objects.forEach(object => {
        console.log(object.name);
        if (possibleOptions.indexOf(object.name) != -1) {
          ++numBoxes;
        }
      });
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

function onArrive(numPackage: number) {
  if (userConfig.notification) {
    sendNotification("Package Arrived", userConfig.notifArrive);
  }
  console.log(`Packages: ${numPackage}`);
}

function onTaken(numPackage: number) {
  let date: string = new Date()
    .toLocaleString()
    .replace(/\//g, "_")
    .replace(/ /g, "")
    .replace(/:/g, "-");
  cams[0].capture(
    ".\\dist\\pictures_taken\\person_" + date + ".jpg",
    async (err: any, base64: string) => {
      if (err) console.log(err);
      else console.log("picture captured");
    }
  );
  if (userConfig.notification) {
    sendNotification("Package Taken", userConfig.notifStolen);
  }
  console.log(`Packages taken: ${numPackage}`);
}

// async function playSound(filePath: string) {
//   try {
//     await neko.play(filePath);
//   } catch(error) {
//     throw error;
//   }
// }

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

  // update every 5sec
  setInterval(() => {
    if (!userConfig.mute) {
      cams[1].capture("capture", async (err: any, base64: string) => {
        if (err) console.log(err);
        if (base64) {
          // stupid package adds 23 stupid characters at the front

          const numPackageDifference = await getPackageDifference(
            base64.substring(23)
          );
          if (numPackageDifference > 0) {
            onArrive(numPackageDifference);
          } else if (numPackageDifference < 0) {
            onTaken(-numPackageDifference);
          }
        } else {
          console.log("alsdkfjasdg undefined");
        }
      });
    }
  }, 5000);
});

////////express stuff

app.get("/", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/config', (req: any, res: any) => {
  res.send(userConfig);
});

app.get('/*.*', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, req.url));
});

app.post("/options", (req: any, res: any) => {
  console.log(req.body);
  Object.keys(req.body).forEach(key => {
    userConfig[key] = req.body[key];
  });

  if (userConfig.mute && userConfig.muteDuration > 0) {
    setTimeout(() => {
      userConfig.mute = false;
    }, userConfig.muteDuration * 1000);
  }

  console.log(userConfig);

  fs.writeFile("./userconfig.json", 
               JSON.stringify(userConfig, undefined, 2), 
               (err: any) => {
    if (err) console.log(err);
  });
  res.send({ message: "success" });
});

app.get("/images", (req:any, res:any) => {
  let imagesHtml:string = "<!DOCTYPE html><html><head><meta charset='utc-8'><link rel='stylesheet' type='text/css' href='css/images.css'><script src='js/index.js'></script></head><nav class='nav header'><div><nav class='navbar-right'><ul class='nav-options'><li class='nav-option'><a href='index.html'>Home</a></li><li class='nav-option'><a href='about.html'>About</a></li><li class='nav-option'><a href='settings.html'>Settings</a></li><li class='nav-option'><a href='/images'>Images</a></li></ul></nav></div></nav><body><script>function deleteImg(control, imageId) {fs.unlinkSync(document.getElementById(imageId).src);}</script><div>";
  fs.readdir("./dist/pictures_taken", (err:any, files:string[]) => {
    if (err) console.log(err);
    if (files.length == 0) {
      imagesHtml += "<h1>empty folder</h1>";
    } else {
      for(let i = 0; i < files.length; i++) {
        let file:string = files[i];
        let fileId:string = "imgbutton"+i;
        let imgId:string = "img"+i;
        file = file.substring(file.lastIndexOf("/"));
        imagesHtml += "<img src=pictures_taken/" + file + " id=imgId>";
        imagesHtml += "<div class='center margin-up'><form action='' method='post'><button name='delete' value='"+file+"'>Delete</button></form></div>";
      }
    }
    imagesHtml += "</body></html>";
    res.send(imagesHtml);
  });
});

app.post("/images", (req: any, res: any) => {
  fs.unlink(".\\dist\\pictures_taken\\"+req.body["delete"], console.log);
  res.send("<html><body><a href='images'>Deleted</a></body></html>");
});
  
app.post('/music', (req: any, res: any) => {
  let form: any  = new formidable.IncomingForm;
  form.parse(req);


  form.on("file", (name: any, file: any) => {
    userConfig[name] = file["path"];
    console.log(name, file);
  });

  form.on("error", (err: any) => {
    throw err;
  });
  res.send({message: 'success'});
});

const port: number = 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
