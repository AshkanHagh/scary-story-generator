const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fs = require("fs").promises;
const path = require("path");

module.exports = async function generateImageFrame({
  frameIndex,
  imagePath,
  outputDir,
}) {
  const canvasWidth = 1920;
  const canvasHeight = 1080;
  const zoomStep = 0.0003;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const image = await loadImage(imagePath);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const zoom = 1 + zoomStep * frameIndex;
  const imgAspect = image.width / image.height;
  const canvasAspect = canvasWidth / canvasHeight;
  let drawWidth, drawHeight;

  if (imgAspect > canvasAspect) {
    drawWidth = canvasWidth * zoom;
    drawHeight = drawWidth / imgAspect;
  } else {
    drawHeight = canvasHeight * zoom;
    drawWidth = drawHeight * imgAspect;
  }

  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  const framePath = path.join(
    outputDir,
    `frame_${String(frameIndex).padStart(4, "0")}.jpeg`,
  );

  const buffer = await canvas.encode("jpeg", 80);
  await fs.writeFile(framePath, buffer);

  return { success: true, frameIndex };
};
