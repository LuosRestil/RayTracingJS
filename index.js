const WINDOW_SIZE = 600;

// CANVAS SETUP
const canvas = document.querySelector("canvas");
canvas.width = canvas.height = WINDOW_SIZE;
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, WINDOW_SIZE, WINDOW_SIZE);
const pixels = imageData.data;