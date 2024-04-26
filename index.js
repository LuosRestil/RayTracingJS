const WINDOW_SIZE = 600;
const VIEWPORT_SIZE = 1;
const VIEWPORT_DISTANCE = 1;
const BACKGROUND_COLOR = [255, 255, 255];
const MAX_REFLECTIONS = 3;

// CANVAS SETUP
const canvas = document.querySelector("canvas");
canvas.width = canvas.height = WINDOW_SIZE;
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, WINDOW_SIZE, WINDOW_SIZE);
const pixels = imageData.data;

// SCENE
const spheres = [
  {
    center: [0, -1, 3],
    radius: 1,
    color: [255, 0, 0],
    specular: 500,
    reflectiveness: 0.2,
  },
  {
    center: [2, 0, 4],
    radius: 1,
    color: [0, 0, 255],
    specular: 500,
    reflectiveness: 0.3,
  },
  {
    center: [-2, 0, 4],
    radius: 1,
    color: [0, 255, 0],
    specular: 10,
    reflectiveness: 0.4,
  },
  {
    center: [0, -5001, 0],
    radius: 5000,
    color: [255, 255, 0],
    specular: 1000,
    reflectiveness: 0.5,
  },
];

const lights = [
  { type: "ambient", intensity: 0.2 },
  { type: "point", intensity: 0.6, position: [2, 1, 0] },
  { type: "directional", intensity: 0.2, direction: [1, 4, 4] },
];

const cameraPosition = [0, 0, -3];

// RENDERING
renderScene();

function renderScene() {
  for (let x = -WINDOW_SIZE / 2; x < WINDOW_SIZE / 2; x++) {
    for (let y = -WINDOW_SIZE / 2; y < WINDOW_SIZE / 2; y++) {
      const viewportCoords = canvasToViewport(x, y);
      const color = traceRay(
        cameraPosition,
        viewportCoords,
        0,
        Infinity,
        MAX_REFLECTIONS
      );
      putPixel(x, y, color);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function canvasToViewport(x, y) {
  return [x / WINDOW_SIZE, y / WINDOW_SIZE, VIEWPORT_DISTANCE];
}

function conceptualCanvasToTrueCanvas(x, y) {
  x = WINDOW_SIZE / 2 + x;
  y = WINDOW_SIZE / 2 - y;
  return [x, y];
}

function putPixel(x, y, color) {
  [x, y] = conceptualCanvasToTrueCanvas(x, y);
  let pixelBufferIdx = y * WINDOW_SIZE * 4 + x * 4; // each pixel takes 4 array indices, r,g,b,a
  pixels[pixelBufferIdx++] = color[0];
  pixels[pixelBufferIdx++] = color[1];
  pixels[pixelBufferIdx++] = color[2];
  pixels[pixelBufferIdx] = 255;
}

// RAY TRACING

function traceRay(origin, direction, minT, maxT, recursionDepth) {
  let [closestT, closestSphere] = getNearestIntersection(
    origin,
    direction,
    minT,
    maxT
  );

  if (!closestSphere) return BACKGROUND_COLOR;

  const intersectionPoint = add(origin, scale(direction, closestT));
  const normal = normalize(subtract(intersectionPoint, closestSphere.center));
  const toViewport = scale(direction, -1);
  const intensity = calculateLighting(
    intersectionPoint,
    normal,
    toViewport,
    closestSphere.specular
  );
  const localColor = scale(closestSphere.color, intensity);

  // no reflections
  if (recursionDepth <= 0 || closestSphere.reflectiveness <= 0)
    return localColor;

  // reflections
  const reflection = reflectRay(toViewport, normal);
  const reflectedColor = traceRay(intersectionPoint, reflection, 0.001, Infinity, recursionDepth - 1);
  return add(
    scale(localColor, (1 - closestSphere.reflectiveness)), 
    scale(reflectedColor, closestSphere.reflectiveness)
  );
}

function intersectRaySphere(origin, direction, sphere) {
  let t1 = (t2 = Infinity);

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

function getNearestIntersection(origin, direction, minT, maxT) {
  // find closest intersection (if any)
  let closestT = Infinity;
  let closestSphere = null;
  for (let sphere of spheres) {
    // see where ray hits this sphere (if at all)
    const [t1, t2] = intersectRaySphere(origin, direction, sphere, 1, Infinity);
    if (t1 < closestT && t1 >= minT && t1 <= maxT) {
      closestT = t1;
      closestSphere = sphere;
    }
    if (t2 < closestT && t2 >= minT && t2 <= maxT) {
      closestT = t2;
      closestSphere = sphere;
    }
  }
  return [closestT, closestSphere];
}

function calculateLighting(point, normal, viewport, specular) {
  let intensity = 0;
  for (const light of lights) {
    if (light.type === "ambient") {
      intensity += light.intensity;
    } else {
      let directionToLight;
      if (light.type === "point") {
        directionToLight = subtract(light.position, point);
      } else {
        directionToLight = light.direction;
      }

      // send ray in light direction, see if it hits something. if so, no light for you
      let [_, closestSphere] = getNearestIntersection(
        point,
        directionToLight,
        0.001,
        1
      );
      if (closestSphere) continue;

      // diffuse reflection
      const normalDotDirectionToLight = dot(normal, directionToLight);
      if (normalDotDirectionToLight > 0) {
        intensity +=
          light.intensity *
          (normalDotDirectionToLight / (mag(normal) * mag(directionToLight)));
      }

      if (specular !== -1) {
        const reflection = reflectRay(directionToLight, normal);
        const reflectionDotViewport = dot(reflection, viewport);
        if (reflectionDotViewport > 0) {
          intensity +=
            light.intensity *
            Math.pow(
              reflectionDotViewport / (mag(reflection) * mag(viewport)),
              specular
            );
        }
      }
    }
  }
  return intensity;
}

function reflectRay(ray, normal) {
  return subtract(scale(normal, 2 * dot(normal, ray)), ray);
}
