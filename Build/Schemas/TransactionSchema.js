"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
var tx = new mongoose_1.default.Schema({
    "type": String,
    inputs: [{ "txid": String, "index": Number }, { "sig": String }],
    outputs: [{ "pubkey": String, "value": Number }]
});
mongoose_1.default.model("Transaction", tx);
