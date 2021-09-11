// @ts-ignore decorators
@inline
function fastMod(x: f32, y: f32): f32 {
  return x - y * Mathf.floor(x / y);
}

// 138 bytes
export function saw(x: f32): f32 {
  const hpi: f32 = Mathf.PI / 2.0;
  const norm: f32 = 2.0 / Mathf.PI;
  return norm * abs(Mathf.PI - fastMod(abs(x - hpi), 2.0 * Mathf.PI)) - 1.0;
}