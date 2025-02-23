export function gaussianRandom(mean: number, stdDev: number) {
    let u = 1 - Math.random();
    let v = 1 - Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return Math.round(mean + z * stdDev);
}

export function clamp(num: number, lower: number, upper: number) {
    return Math.min(Math.max(num, lower), upper);
}