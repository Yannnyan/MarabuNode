import { Address } from '../Models/Address.js';
import RuntimeLocal from './RuntimeLocal.json' assert { type: "json" };


export class MyLogger {
    address:Address
    constructor(address: Address) {
        this.address = address;
    }
    GetLog(value: string) {
        return "\x1b[1;32m" + "[Runtime Information " + this.address.toString() +  "] " + "\x1b[1;37m" + value;
    }

    Log(value: string) {
        console.log(this.GetLog(value));
    }
    
}


