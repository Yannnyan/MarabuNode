export class Address {
    port: number;
    host: string;

    constructor(host:string, port: number) {
        this.port = port;
        this.host = host;
    }
    static CreateAddressFromString(address: string): Address {
        let tupl= address.split(":");
        return new Address(tupl[0], Number.parseInt(tupl[1]));
    }
    toString() {
        return this.host + ":" + this.port.toString();
    }
} 