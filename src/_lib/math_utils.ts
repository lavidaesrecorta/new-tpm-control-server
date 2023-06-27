export const dotProduct = (a: number[], b: number[]) => {
    if (a.length != b.length) return;
    let dotResult = 0
    for (let index = 0; index < a.length; index++) {
        const elementA = a[index];
        const elementB = b[index];
        dotResult += elementA * elementB;
    }
    return dotResult;
}
export const localField = (n: number, u: number[], v: number[]) => {
    return dotProduct(u, v) / Math.sqrt(n);
}
export const outputSigma = (h: number) => { return h == 0 ? -1 : Math.sign(h) }
export const thauFunction = (x: number[]) => {
    let mul = 1;
    for (let index = 0; index < x.length; index++) {
        const element = x[index];
        mul *= element
    }
    return mul
}
export const heavisideStep = (x: number) => { return x > 0 ? 1 : 0 }
export const gFunction = (x: number, l: number) => { return Math.abs(x) > l ? Math.sign(x) * l : x }