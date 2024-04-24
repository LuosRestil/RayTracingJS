function add(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function subtract(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function scale(vec, factor) {
  return [vec[0] * factor, vec[1] * factor, vec[2] * factor];
}

function dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function mag(vec) {
  return Math.sqrt(dot(vec, vec));
}

function normalize(vec) {
  return scale(vec, 1 / mag(vec));
}