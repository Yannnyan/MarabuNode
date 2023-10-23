"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenConnection = void 0;
const ErrorLocal_json_1 = __importDefault(require("../Localization/ErrorLocal.json"));
const RuntimeLocal_json_1 = __importDefault(require("../Localization/RuntimeLocal.json"));
const Hello_json_1 = __importDefault(require("../Messages/Hello.json"));
const Error_json_1 = __importDefault(require("../Messages/Error.json"));
const GetPeers_json_1 = __importDefault(require("../Messages/GetPeers.json"));
const IHaveObject_json_1 = __importDefault(require("../Messages/IHaveObject.json"));
const GetObject_json_1 = __importDefault(require("../Messages/GetObject.json"));
const RuntimeLocal_1 = require("../Localization/RuntimeLocal");
const canonicalize_1 = __importDefault(require("canonicalize"));
class OpenConnection {
    constructor(socket, isClient) {
        this.encoding = "utf-8";
        if (socket.remoteAddress === undefined) {
            throw new Error(ErrorLocal_json_1.default["Runtime Peer Construction Address"]);
        }
        if (socket.remotePort === undefined) {
            throw new Error(ErrorLocal_json_1.default["Runtime Peer Construction Port"]);
        }
        this.port = socket.remotePort;
        this.host = socket.remoteAddress;
        this.socket = socket;
        this.isClient = isClient;
        this.isHandshaked = false;
    }
    SendMsg(msg, msgDict) {
        if (msgDict !== undefined)
            this.socket.write((0, canonicalize_1.default)(msgDict) + "\n", this.encoding);
        else if (msg !== undefined)
            this.socket.write(msg + "\n", this.encoding);
        else
            throw new Error("Cannot send nothing, msg and msgDict are undefined");
    }
    SendHello() {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Hello"]));
        this.SendMsg(undefined, Hello_json_1.default);
    }
    SendError() {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Error"]));
        this.SendMsg(undefined, Error_json_1.default);
    }
    SendPeers(peers) {
        this.SendMsg(undefined, peers);
    }
    SendGetPeers() {
        this.SendMsg(undefined, GetPeers_json_1.default);
    }
    SendIHaveObject(objectid) {
        var ihaveobj = IHaveObject_json_1.default;
        ihaveobj.objectid = objectid;
        this.SendMsg(undefined, ihaveobj);
    }
    SendGetObject(objectid) {
        var getobj = GetObject_json_1.default;
        getobj.objectid = objectid;
        this.SendMsg(undefined, getobj);
    }
    SendObject(appObj) {
        this.SendMsg(appObj.ToString());
    }
}
exports.OpenConnection = OpenConnection;
