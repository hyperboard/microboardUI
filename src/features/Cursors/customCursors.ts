import pencil from "./pencil.svg";
import stickerPurple from "./sticker/sticker-purple.svg";
import stickerPink from "./sticker/sticker-pink.svg";
import stickerSkyBlue from "./sticker/sticker-sky-blue.svg";
import stickerBlue from "./sticker/sticker-blue.svg";
import stickerGreen from "./sticker/sticker-green.svg";
import stickerLightGreen from "./sticker/sticker-light-green.svg";
import stickerOrange from "./sticker/sticker-orange.svg";
import stickerYellow from "./sticker/sticker-yellow.svg";
import stickerLightGray from "./sticker/sticker-light-gray.svg";
import stickerGray from "./sticker/sticker-gray.svg";
import eraser from "./eraser.svg";
import comment from "./comment.svg";
import { conf } from "microboard-temp";

const { cursorsMap } = conf;

function svgToBase64(svg) {
  // node
  if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
    return Buffer.from(svg).toString("base64");
  }
  // browser
  return btoa(svg);
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;base64,${svgToBase64(svg)}`;
}

cursorsMap["eraser"] = `url(${svgToDataUri(eraser)}) -10 10, auto`;
cursorsMap["pen"] = `url(${svgToDataUri(pencil)}) 1 24, auto`;
cursorsMap["comment"] = `url(${svgToDataUri(comment)}) 1 24, auto`;
cursorsMap["sticker-purple"] =
  `url(${svgToDataUri(stickerPurple)}) 12 12, auto`;
cursorsMap["sticker-pink"] = `url(${svgToDataUri(stickerPink)}) 12 12, auto`;
cursorsMap["sticker-sky-blue"] =
  `url(${svgToDataUri(stickerSkyBlue)}) 12 12, auto`;
cursorsMap["sticker-blue"] = `url(${svgToDataUri(stickerBlue)}) 12 12, auto`;
cursorsMap["sticker-green"] = `url(${svgToDataUri(stickerGreen)}) 12 12, auto`;
cursorsMap["sticker-light-green"] =
  `url(${svgToDataUri(stickerLightGreen)}) 12 12, auto`;
cursorsMap["sticker-orange"] =
  `url(${svgToDataUri(stickerOrange)}) 12 12, auto`;
cursorsMap["sticker-yellow"] =
  `url(${svgToDataUri(stickerYellow)}) 12 12, auto`;
cursorsMap["sticker-light-gray"] =
  `url(${svgToDataUri(stickerLightGray)}) 12 12, auto`;
cursorsMap["sticker-gray"] = `url(${svgToDataUri(stickerGray)}) 12 12, auto`;

export default {};
