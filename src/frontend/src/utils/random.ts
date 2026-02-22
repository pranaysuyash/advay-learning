const UINT32_MAX = 4294967295;

export function randomFloat01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / UINT32_MAX;
  } catch {
    return Math.random();
  }
}

export function randomBetween(min: number, max: number): number {
  return min + randomFloat01() * (max - min);
}
