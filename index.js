"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarabuNode_1 = require("./MarabuNode");
var port = process.argv.length >= 3 ? Number.parseInt(process.argv[2]) : undefined;
var node = new MarabuNode_1.MarabuNode(port);
node.Start();
