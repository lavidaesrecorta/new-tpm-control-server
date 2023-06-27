import { gFunction, heavisideStep, localField, outputSigma, thauFunction } from "./math_utils";

export interface ConnectedTpm {
    deviceToken: string;
    k: number;
    n: number;
    l: number;
    weights: number[][];
    lastStimulus: number[][];
    lastOutput: number;
    iterState: number;
    iterCount: number;
};

export interface SyncedTpm {
    deviceToken: string;
    k: number;
    n: number;
    l: number;
    weights: number[][];
};

const generateRandomSignedFactor = () => {
    const firstPass = Math.random() - 0.5;
    const output = Math.sign(firstPass) || -1;
    return output;
};
export const generateRandomStimulus = (k: number, n: number) => {
    const stimulus: number[][] = [];
    for (let i = 0; i < k; i++) {
        stimulus[i] = [];
        for (let j = 0; j < n; j++) {
            stimulus[i][j] = generateRandomSignedFactor();
        }
    }

    return stimulus
};
export const generateRandomWeights = (k: number, n: number, l: number) => {
    const weights: number[][] = [];
    for (let i = 0; i < k; i++) {
        weights[i] = Array.from({ length: n }, () => (Math.floor(Math.random() * l)) * generateRandomSignedFactor());
    }

    return weights;
};
export const checkWeights = (
    weightsA: number[][],
    weightsB: number[][],
): boolean => {
    if (!weightsA || !weightsB) return false;
    const rowLenA = weightsA.length;
    const rowLenB = weightsB.length;
    if (!weightsA[0] || !weightsB[0]) return false;
    const colLenA = weightsA[0].length;
    const colLenB = weightsB[0].length;

    if (rowLenA != rowLenB || colLenA != colLenB) {
        console.log('Weights lengths dont match');
        return;
    }
    for (let i = 0; i < rowLenA; i++) {
        for (let j = 0; j < colLenA; j++) {
            const elementA = weightsA[i][j];
            const elementB = weightsB[i][j];
            if (elementA != elementB) return false;
        }
    }

    return true;
};
export const calculateOutput = (n: number, weights: number[][], stimulus: number[][]) => {
    if (weights.length != stimulus.length) throw new Error("Weights and stimulus do not match!!!");
    let neuronSigma = []
    for (let index = 0; index < weights.length; index++) {
        neuronSigma.push(outputSigma(localField(n, weights[index], stimulus[index])))
    }
    const output = thauFunction(neuronSigma)
    return output
}
export const hebbianRule = (output: number, neuronStimulus: number[], neuronWeights: number[], n: number, l: number) => {
    const localSigma = outputSigma(localField(n, neuronWeights, neuronStimulus));
    const newWeights = [...neuronWeights]
    for (let index = 0; index < neuronWeights.length; index++) {
        newWeights[index] = gFunction(neuronWeights[index] + neuronStimulus[index] * output * heavisideStep(localSigma * output) * heavisideStep(output * output), l);
    }
    return newWeights
}