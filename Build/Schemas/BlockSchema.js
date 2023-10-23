"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
var BlockSchema = new mongoose_1.default.Schema({
    "type": String,
    "txids": [String],
    "nonce": String,
    "previd": String,
    "created": Number,
    "T": String,
    "miner": String,
    "note": String
});
mongoose_1.default.model("Block", BlockSchema);
