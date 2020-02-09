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
const util = require("util");
const fs = require('fs');
let userConfig;
fs.readFile("userconfig.json", (err, data) => {
    if (err)
        console.log(err);
    userConfig = JSON.parse(data);
});
// const userConfig = JSON.parse(fs.readFile('userconfig.json'));
// process the forms passed
const formidable = require("formidable");
// used for music
const neko = require('sound-play');
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// @ts-ignore
const vision_1 = __importDefault(require("@google-cloud/vision"));
const client = new vision_1.default.ImageAnnotatorClient();
// @ts-ignore
const node_webcam_1 = __importDefault(require("node-webcam"));
const possibleOptions = ['Box', 'Packaged goods', 'Boxed packaged goods'];
let currentNumBoxes = 0;
let muted = false;
function getNumBoxes(imageData) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [results] = yield client.objectLocalization({
                    image: { content: imageData }
                });
                const objects = results.localizedObjectAnnotations;
                let numBoxes = 0;
                objects.forEach((object) => {
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
function onArrive(numPackage) {
    console.log(`Packages: ${numPackage}`);
}
function onTaken(numPackage) {
    console.log(`Packages taken: ${numPackage}`);
}
function playSound(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield neko.play(filePath);
        }
        catch (error) {
            throw error;
        }
    });
}
let cams = [];
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
    // setInterval(() => {
    //   if (!muted) {
    //     cams[0].capture("capture", async (err: any, base64: string) => {
    //       if (err) console.log(err);
    //       if (base64) {
    //         // stupid package adds 23 stupid characters at the front
    //         // console.log(await getNumBoxes(base64.substring(23)));
    //         const numPackageDifference = await getPackageDifference(base64.substring(23));
    //         if (numPackageDifference > 0) {
    //           onArrive(numPackageDifference);
    //         } else if (numPackageDifference < 0) {
    //           onTaken(-numPackageDifference);
    //         }
    //       } else {
    //         console.log("alsdkfjasdg undefined");
    //       }
    //     });
    //   }
    // }, 5000);
});
////////express stuff
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
app.get('/*.*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, req.url));
});
app.post('/options', (req, res) => {
    console.log(req.body);
    Object.keys(req.body).forEach((key) => {
        if ((req.body[key] === 'on') || (req.body[key] === 'true') || (Array.isArray(req.body[key]))) {
            userConfig[key] = true;
        }
        else if (req.body[key] === 'false') {
            userConfig[key] = false;
        }
        else {
            userConfig[key] = req.body[key];
        }
    });
    console.log(userConfig);
    playSound(userConfig["soundPath"]);
    ``;
    fs.writeFile("./userconfig.json", JSON.stringify(userConfig), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        ;
    });
});
app.post('/settings', (req, res) => {
    let form = new formidable.IncomingForm;
    form.parse(req);
    form.on('field', (name, field) => {
        if ((field === 'on') || (field === 'true')) {
            userConfig[name] = true;
        }
        else if (field === 'false') {
            userConfig[name] = false;
        }
        else {
            userConfig[name] = field;
        }
        console.log(name, field);
    });
    form.on('file', (name, file) => {
        userConfig[name] = file["path"];
        console.log(name, file);
    });
    form.on('error', (err) => {
        throw err;
    });
    form.on('end', () => {
        res.end();
    });
    res.send('Saved');
});
const port = 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
//# sourceMappingURL=index.js.map