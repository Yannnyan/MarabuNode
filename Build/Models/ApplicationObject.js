"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationObject = void 0;
const Transaction_1 = require("./Transaction");
const Block_1 = require("./Block");
const fast_sha256_1 = __importDefault(require("fast-sha256"));
const canonicalize_1 = __importDefault(require("canonicalize"));
const mongoose_1 = __importDefault(require("mongoose"));
// const BlockModel = mongoose.model("Block");
// const TxModel = mongoose.model("Transaction");
// const CbTxModel = mongoose.model("CoinbaseTransaction"); 
const ObjModel = mongoose_1.default.model("ApplicationObject");
class ApplicationObject {
    constructor(object) {
        this.type = typeof (object);
        this.object = object;
    }
    ParseObject(msg) {
        var keys = Object.keys(msg);
        if (keys.indexOf("object") === -1)
            throw new Error("cannot parse object, it doesnt contain a keys key");
        var obj = msg["object"];
        var objKeys = Object.keys(obj);
        if (objKeys.indexOf("type") === -1) {
            throw new Error("cannot parse object, it doesnt contain a type key");
        }
        if (obj["type"] === "block") {
            var block = Block_1.Block.Parse(obj);
            return new ApplicationObject(block);
        }
        else if (obj["type"] === "transaction") {
            var transaction = Transaction_1.Transaction.Parse(obj);
            return new ApplicationObject(transaction);
        }
        else {
            throw new Error("unrecognized object type");
        }
    }
    ToDict() {
        return {
            "type": "object",
            "object": this.object.ToDict()
        };
    }
    GetID() {
        var enc = new TextEncoder();
        return Buffer.from((0, fast_sha256_1.default)(enc.encode((0, canonicalize_1.default)(this.ToDict())))).toString("hex");
    }
    ToString() {
        return (0, canonicalize_1.default)(this.ToDict());
    }
    Save() {
        return __awaiter(this, void 0, void 0, function* () {
            var obj = this.ToDict();
            yield ObjModel.create({ "object": obj.object, "objectid": this.GetID() });
        });
    }
    static FindById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return ObjModel.findOne({ "objectid": id });
        });
    }
}
exports.ApplicationObject = ApplicationObject;
