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
exports.MarabuNode = void 0;
// import { StringDecoder } from "string_decoder";
const PeerManageService_1 = require("./Services/PeerManageService");
const Address_1 = require("./Models/Address");
const RuntimeLocal_json_1 = __importDefault(require("./Localization/RuntimeLocal.json"));
const RuntimeLocal_1 = require("./Localization/RuntimeLocal");
const TestHardCodedIPs_json_1 = __importDefault(require("./Discovery/TestHardCodedIPs.json"));
const ConnectionManageService_1 = require("./Services/ConnectionManageService");
const MessageManageService_1 = require("./Services/MessageManageService");
class MarabuNode {
    constructor(port, host) {
        this.port = port || 18018;
        this.host = host || '127.0.0.1';
        this.peerManager = new PeerManageService_1.PeerManager(new Address_1.Address(this.host, this.port));
        this.messageManager = new MessageManageService_1.MessageManager(this.peerManager);
        this.connectionManager = new ConnectionManageService_1.ConnectionManager(this.peerManager, this.messageManager, this.host, this.port);
        this.messageManager.SetConnectionManager(this.connectionManager);
    }
    BootstrapDiscovery() {
        // connect to the hard coded ips
        for (let s of TestHardCodedIPs_json_1.default.ips) {
            let address = Address_1.Address.CreateAddressFromString(s);
            console.log(address);
            if (address.host === this.host && address.port === this.port) {
                continue;
            }
            if (this.peerManager.FindPeer(address.host, address.port) === undefined) {
                console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Discovery"]) + " " + address.toString());
                this.connectionManager.ConnectToAddress(address);
            }
        }
    }
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connectionManager.ListenToConnections();
            this.BootstrapDiscovery();
        });
    }
}
exports.MarabuNode = MarabuNode;
