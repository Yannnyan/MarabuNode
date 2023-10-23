"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarabuNode_1 = require("./MarabuNode");
const mongoose_1 = require("./config/mongoose");
var port = process.argv.length >= 3 ? Number.parseInt(process.argv[2]) : undefined;
var node = new MarabuNode_1.MarabuNode(port);
(0, mongoose_1.mongoConnect)(node.port).then(function () {
    node.Start();
});
