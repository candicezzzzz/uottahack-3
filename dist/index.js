"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv-safe").config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
// import * as admin from "firebase-admin";
// admin.initializeApp({
//   credential: admin.credential.cert("./uOttoFirebaseKey.json")
// });
// import util from "util";
const fs_1 = __importDefault(require("fs"));
// const fin = util.promisify(fs.readFile);
// const fout = util.promisify(fs.writeFile);
let userConfig;
fs_1.default.readFile("userconfig.json", (err, data) => {
    if (err)
        console.log(err);
    userConfig = JSON.parse(data);
});
// const userConfig = JSON.parse(fs.readFile('userconfig.json'));
// process the forms passed
const formidable = require("formidable");
// used for music (mplayer must be a system environment variable)
const neko = require("play-sound")({ player: "mplayer" });
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// @ts-ignore
const vision_1 = __importDefault(require("@google-cloud/vision"));
const client = new vision_1.default.ImageAnnotatorClient();
// @ts-ignore
const node_webcam_1 = __importDefault(require("node-webcam"));
const possibleOptions = [
    "Box",
    "Packaged goods",
    "Boxed packaged goods",
    "Shipping box"
];
let currentNumBoxes = 0;
// function sendNotification(title: string, body: string) {
//   admin.messaging().send({
//     notification: {
//       title: title,
//       body: body
//     },
//     token: process.env.KEVINS_PHONE_TOKEN_LOL_TEST!
//   }).then((response: any) => {
//     console.log(response);
//   }).catch(console.log);
// }
function getNumBoxes(imageData) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [results] = yield client.objectLocalization({
                    image: { content: imageData }
                });
                const objects = results.localizedObjectAnnotations;
                let numBoxes = 0;
                objects.forEach(object => {
                    console.log(object.name);
                    if (possibleOptions.indexOf(object.name) != -1) {
                        ++numBoxes;
                    }
                });
                resolve(numBoxes);
            }
            catch (err) {
                console.log(err);
                reject(err);
            }
        }));
    });
}
function getPackageDifference(imageData) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newNumBoxes = yield getNumBoxes(imageData);
                const difference = newNumBoxes - currentNumBoxes;
                currentNumBoxes = newNumBoxes;
                resolve(difference);
            }
            catch (err) {
                reject(err);
            }
        }));
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
function playSound(filePath) {
    neko.play(filePath, (err) => {
        if (err)
            console.log(`${err}`);
    });
}
let cams = [];
function onArrive(numPackage) {
    // if (userConfig.notification) {
    //   sendNotification("Package Arrived", userConfig.notifArrive);
    // }
    console.log(`Packages: ${numPackage}`);
    if (userConfig["soundfx"] && userConfig["goodSoundPath"] != "") {
        playSound(userConfig["goodSoundPath"]);
    }
}
function onTaken(numPackage) {
    let date = new Date()
        .toLocaleString()
        .replace(/\//g, "_")
        .replace(/ /g, "")
        .replace(/:/g, "-");
    if (userConfig["takePicture"]) {
        cams[0].capture(".\\dist\\pictures_taken\\person_" + date + ".jpg", (err, base64) => __awaiter(this, void 0, void 0, function* () {
            if (err)
                console.log(err);
            else
                console.log("picture captured");
        }));
    }
    if (userConfig["soundfx"] && userConfig["badSoundPath"] != "") {
        playSound(userConfig["badSoundPath"]);
    }
    // if (userConfig.notification) {
    //   sendNotification("Package Taken", userConfig.notifStolen);
    // }
    console.log(`Packages taken: ${numPackage}`);
}
node_webcam_1.default.create({}).list((availableCams) => {
    availableCams.forEach((element) => {
        cams.push(node_webcam_1.default.create({
            width: 1280,
            height: 720,
            quality: 100,
            delay: 0,
            saveShots: false,
            output: "jpeg",
            device: element,
            callbackReturn: "base64",
            verbose: true
        }));
    });
    console.log(cams);
    // update every 5sec
    setInterval(() => {
        if (!userConfig.mute) {
            cams[1].capture("capture", (err, base64) => __awaiter(void 0, void 0, void 0, function* () {
                if (err)
                    console.log(err);
                if (base64) {
                    // stupid package adds 23 stupid characters at the front
                    const numPackageDifference = yield getPackageDifference(base64.substring(23));
                    if (numPackageDifference > 0) {
                        onArrive(numPackageDifference);
                    }
                    else if (numPackageDifference < 0) {
                        onTaken(-numPackageDifference);
                    }
                }
                else {
                    console.log("alsdkfjasdg undefined");
                }
            }));
        }
    }, 5000);
});
////////express stuff
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
app.get('/config', (req, res) => {
    res.send(userConfig);
});
app.get('/*.*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, req.url));
});
app.post("/resetConfig", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //dont mind this endless callback chain
    fs_1.default.readFile('userConfigDefault.json', (err, data) => {
        if (err)
            console.log(err);
        userConfig = JSON.parse(data);
        fs_1.default.writeFile('userConfig.json', JSON.stringify(userConfig, undefined, 2), (err) => {
            if (err)
                console.log(err);
            res.send({ message: 'success' });
        });
    });
}));
app.post("/options", (req, res) => {
    console.log(req.body);
    Object.keys(req.body).forEach(key => {
        userConfig[key] = req.body[key];
    });
    if (userConfig.mute && userConfig.muteDuration > 0) {
        currentNumBoxes = 0;
        setTimeout(() => {
            userConfig.mute = false;
        }, userConfig.muteDuration * 1000);
    }
    console.log(userConfig);
    fs_1.default.writeFile("./userconfig.json", JSON.stringify(userConfig, undefined, 2), (err) => {
        if (err)
            console.log(err);
    });
    res.send({ message: "success" });
});
app.get("/images", (req, res) => {
    let imagesHtml = "<!DOCTYPE html><html><head><meta charset='utc-8'><link rel='stylesheet' type='text/css' href='css/images.css'><script src='js/index.js'></script></head><nav class='nav header'><div><nav class='navbar-right'><ul class='nav-options'><li class='nav-option'><a href='index.html'>Home</a></li><li class='nav-option'><a href='about.html'>About</a></li><li class='nav-option'><a href='settings.html'>Settings</a></li><li class='nav-option'><a href='/images'>Images</a></li></ul></nav></div></nav><body><script>function deleteImg(control, imageId) {fs.unlinkSync(document.getElementById(imageId).src);}</script><div>";
    fs_1.default.readdir("./dist/pictures_taken", (err, files) => {
        if (err)
            console.log(err);
        if (files.length == 0) {
            imagesHtml += "<h1>empty folder</h1>";
        }
        else {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let fileId = "imgbutton" + i;
                let imgId = "img" + i;
                file = file.substring(file.lastIndexOf("/"));
                imagesHtml += "<div class='photo-container'><div class='center'><img class='bordered' src=pictures_taken/" + file + " id=imgId></div>";
                imagesHtml += "<div class='center margin-up'><form action='' method='post'><button name='delete' value='" + file + "'>Delete</button></form></div></div>";
            }
        }
        imagesHtml += "</body></html>";
        res.send(imagesHtml);
    });
});
app.post("/images", (req, res) => {
    fs_1.default.unlink(".\\dist\\pictures_taken\\" + req.body["delete"], console.log);
    res.send("<html><body><h3>Successfully deleted.</h3><a href='images'>go back</a></body></html>");
});
app.post('/music', (req, res) => {
    let form = new formidable.IncomingForm;
    form.parse(req);
    form.on("file", (name, file) => {
        userConfig[name] = file["path"];
        console.log(name, file);
    });
    form.on("error", (err) => {
        throw err;
    });
    res.send({ message: 'success' });
});
const port = 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
//# sourceMappingURL=index.js.map