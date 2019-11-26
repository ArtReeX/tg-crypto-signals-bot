"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __importStar(require("@tensorflow/tfjs-node"));
const getConfig_1 = __importDefault(require("../getConfig"));
const run = async (samples, epochs = getConfig_1.default().tensorflow.epochs) => {
    try {
        const sizeTrain = Math.ceil(samples.x.length * 0.7);
        const xTrain = tf.tensor3d(samples.x.slice(0, sizeTrain));
        const yTrain = tf.tensor2d(samples.y.slice(0, sizeTrain));
        const xTest = tf.tensor3d(samples.x.slice(sizeTrain, samples.x.length));
        const yTest = tf.tensor2d(samples.y.slice(sizeTrain, samples.y.length));
        const model = tf.sequential({
            layers: [
                tf.layers.lstm({
                    inputShape: [samples.x[0].length, samples.x[0][0].length],
                    units: samples.x[0].length * samples.x[0][0].length,
                    returnSequences: true
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.batchNormalization(),
                tf.layers.lstm({
                    units: samples.x[0].length * samples.x[0][0].length,
                    returnSequences: true
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.batchNormalization(),
                tf.layers.lstm({
                    units: samples.x[0].length * samples.x[0][0].length,
                    returnSequences: false
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.batchNormalization(),
                tf.layers.dense({
                    units: samples.y[0].length,
                    activation: "relu"
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.batchNormalization(),
                tf.layers.dense({
                    units: samples.y[0].length,
                    activation: "softmax"
                })
            ]
        });
        model.compile({
            optimizer: "adam",
            loss: tf.losses.softmaxCrossEntropy,
            metrics: tf.metrics.categoricalCrossentropy
        });
        await model.fit(xTrain, yTrain, {
            epochs,
            shuffle: false,
            batchSize: 64,
            validationData: [xTest, yTest],
            callbacks: {
                onTrainBegin: () => console.info(`Neural network training based on ${sizeTrain} templates has been launched.`),
                onTrainEnd: () => console.info("Neural network training completed.")
            }
        });
        try {
            await model.save("file://./model");
            console.info("Neural network snapshot saved successfully.");
        }
        catch ({ message }) {
            throw new Error(`Failed to save snapshot of neural network: ${message}`);
        }
    }
    catch ({ message }) {
        throw new Error(`Failed to train the neural network: ${message}`);
    }
};
exports.default = { run };
//# sourceMappingURL=train.js.map