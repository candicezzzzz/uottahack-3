require("dotenv-safe").config();

// @ts-ignore
import NodeCam from "node-webcam";

const WEBCAM_OPTIONS = {
  width: 1280,
  height: 720,
  quality: 100,
  delay: 0,
  saveShots: true,
  output: "bmp",
  device: false,
  callbackReturn: "base64",
  verbose: true
};

const Webcam = NodeCam.create(WEBCAM_OPTIONS);

Webcam.list((list: any) => {
  console.log(list);
});