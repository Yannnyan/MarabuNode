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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MessageManageService_1 = require("../Services/MessageManageService");
const PeerManageService_1 = require("../Services/PeerManageService");
const ConnectionManageService_1 = require("../Services/ConnectionManageService");
const Hello_json_1 = __importDefault(require("../Messages/Hello.json"));
const GetPeers_json_1 = __importDefault(require("../Messages/GetPeers.json"));
const OpenConnection_1 = require("../Models/OpenConnection");
const net = __importStar(require("net"));
var peerManager = new PeerManageService_1.PeerManager();
var messageManager = new MessageManageService_1.MessageManager(peerManager);
var connectionManager = new ConnectionManageService_1.ConnectionManager(peerManager, messageManager, "localhost", 18019);
messageManager.SetConnectionManager(connectionManager);
// describe("testing message manager", () => {
//     test("", () => {
var socket = new net.Socket();
socket.connect({ port: 18018, host: "localhost" }, function () {
    var peer = new OpenConnection_1.OpenConnection(socket, true);
    var msgs = [JSON.stringify(Hello_json_1.default), JSON.stringify(GetPeers_json_1.default)];
    var parsed = messageManager.ParseMessage(msgs, peer);
    if (parsed === undefined) {
        return;
    }
    console.log(parsed);
    for (let strat of parsed) {
        strat.HandleMessage();
    }
});
socket.on("data", function (data) {
    console.log("Recieving Data: " + data.toString("utf-8"));
});
//     })
// })
