"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
class Address {
    constructor(host, port) {
        this.port = port;
        this.host = host;
    }
    static CreateAddressFromString(address) {
        let tupl = address.split(":");
        return new Address(tupl[0], Number.parseInt(tupl[1]));
    }
    toString() {
        return this.host + ":" + this.port.toString();
    }
}
exports.Address = Address;
