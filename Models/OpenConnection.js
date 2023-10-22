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
const RuntimeLocal_1 = require("../Localization/RuntimeLocal");
class OpenConnection {
    constructor(socket, isClient) {
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
    SendHello() {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Hello"]));
        this.socket.write(JSON.stringify(Hello_json_1.default) + "\n", "utf-8");
    }
    SendError() {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Error"]));
        this.socket.write(JSON.stringify(Error_json_1.default) + "\n", "utf-8");
    }
    SendPeers(peers) {
        this.socket.write(peers + "\n", "utf-8");
    }
    SendGetPeers() {
        this.socket.write(JSON.stringify(GetPeers_json_1.default) + "\n", "utf-8");
    }
}
exports.OpenConnection = OpenConnection;
