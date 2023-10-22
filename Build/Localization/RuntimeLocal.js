"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLog = void 0;
function GetLog(value) {
    return "\x1b[1;32m" + "[Runtime Information] " + "\x1b[1;37m" + value;
}
exports.GetLog = GetLog;
