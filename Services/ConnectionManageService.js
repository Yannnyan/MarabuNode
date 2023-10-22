"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ConnectionManager = void 0;
const OpenConnection_1 = require("../Models/OpenConnection");
const net = __importStar(require("net"));
const RuntimeLocal_1 = require("../Localization/RuntimeLocal");
const RuntimeLocal_json_1 = __importDefault(require("../Localization/RuntimeLocal.json"));
class ConnectionManager {
    constructor(peerManager, messageManager, host, port) {
        this.peerManager = peerManager;
        this.messageManager = messageManager;
        this.host = host;
        this.port = port;
    }
    CheckIsMe(address) {
        return this.host === address.host && this.port === address.port;
    }
    ConnectToAddress(address) {
        // assumes the address is not one that is connected
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Connect"]) + " " + address.toString());
        var socket = new net.Socket();
        socket.connect({ host: address.host, port: address.port }, () => {
            var peer = new OpenConnection_1.OpenConnection(socket, true);
            socket.on("data", (data) => {
                try {
                    this.messageManager.GetMessage(data, peer);
                }
                catch (error) {
                    console.log(error);
                    peer.SendError();
                }
            });
            peer.SendHello();
            // peer.SendGetPeers();
        });
    }
    ListenToConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            var node = this;
            const server = net.createServer((socket) => {
                var peer = new OpenConnection_1.OpenConnection(socket, false);
                socket.on("data", (data) => {
                    try {
                        node.messageManager.GetMessage(data, peer);
                    }
                    catch (error) {
                        console.log(error);
                        peer.SendError();
                    }
                });
            });
            server.listen(this.port, this.host);
            console.log(RuntimeLocal_json_1.default["Started Listening"] + " " + this.host + ":" + this.port);
        });
    }
    AddPeersFromAddresses(addresses) {
        for (let address of addresses) {
            this.ConnectToAddress(address);
        }
    }
}
exports.ConnectionManager = ConnectionManager;
