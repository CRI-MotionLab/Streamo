// see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
};

function hexToRgba(color, alpha) {
  const [ r, g, b ] = hexToRgb(color);
  return `rgba(${r},${g},${b},${alpha})`;  
}

function normalizeVector(x, y, z) {
  const norm = Math.sqrt(x * x + y * y + z * z);
  if (norm !== 0) {
    x /= norm;
    y /= norm;
    z /= norm;
  }
  return { x, y, z };
}

export {
  hexToRgb,
  hexToRgba,
  normalizeVector,
};
