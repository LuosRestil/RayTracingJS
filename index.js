const WINDOW_SIZE = 600;
const VIEWPORT_SIZE = 1;
const VIEWPORT_DISTANCE = 1;
const BACKGROUND_COLOR = [255, 255, 255];

// CANVAS SETUP
const canvas = document.querySelector("canvas");
canvas.width = canvas.height = WINDOW_SIZE;
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, WINDOW_SIZE, WINDOW_SIZE);
const pixels = imageData.data;

// SCENE
const spheres = [
  { center: [0, -1, 3], radius: 1, color: [255, 0, 0] },
  { center: [2, 0, 4], radius: 1, color: [0, 0, 255] },
  { center: [-2, 0, 4], radius: 1, color: [0, 255, 0] },
];

const cameraPosition = [0, 0, 0];

// RENDERING
renderScene();

function renderScene() {
  for (let x = -WINDOW_SIZE / 2; x < WINDOW_SIZE / 2; x++) {
    for (let y = -WINDOW_SIZE / 2; y < WINDOW_SIZE / 2; y++) {
      const color = traceRay(x, y, 0, Infinity);
      putPixel(x, y, color);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function traceRay(x, y, minT, maxT) {
  // translate pixel to world coordinates
  const viewportCoords = canvasToViewport(x, y);

  // find closest intersection (if any)
  let closestT = Infinity;
  let closestSphere = null;
  for (let sphere of spheres) {
    // see where ray hits this sphere (if at all)
    const [t1, t2] = intersectRaySphere(
      cameraPosition,
      viewportCoords,
      sphere,
      1,
      Infinity,
    );
    if (t1 < closestT && t1 >= minT && t1 <= maxT) {
      closestT = t1;
      closestSphere = sphere;
    }
    if (t2 < closestT && t2 >= minT && t2 <= maxT) {
      closestT = t2;
      closestSphere = sphere;
    }
  }

  let color = BACKGROUND_COLOR;
  if (closestSphere) {
    color = closestSphere.color;
  }
  return color;
}

function canvasToViewport(x, y) {
  return [x / WINDOW_SIZE, y / WINDOW_SIZE, VIEWPORT_DISTANCE];
}

function conceptualCanvasToTrueCanvas(x, y) {
  x = WINDOW_SIZE / 2 + x;
  y = WINDOW_SIZE / 2 - y;
  return [x, y];
}

function intersectRaySphere(origin, direction, sphere) {
  let t1 = t2 = Infinity;
  
  const CO = subtract(origin, sphere.center);

  const a = dot(direction, direction);
  const b = 2 * dot(CO, direction);
  const c = dot(CO, CO) - sphere.radius * sphere.radius;

  const discriminant = b * b - 4 * a * c;

  if (discriminant >= 0) {
    t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
  }
  
  return [t1, t2];
}

function putPixel(x, y, color) {
  [x, y] = conceptualCanvasToTrueCanvas(x, y);
  let pixelBufferIdx = y * WINDOW_SIZE * 4 + x * 4; // each pixel takes 4 array indices, r,g,b,a
  pixels[pixelBufferIdx++] = color[0];
  pixels[pixelBufferIdx++] = color[1];
  pixels[pixelBufferIdx++] = color[2];
  pixels[pixelBufferIdx] = 255;
}
