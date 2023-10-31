import { injectable } from "tsyringe";
import { Address } from "../Models/Address.js"
import mongoConnect from "../config/mongoose.js"
import { Connection } from "mongoose";


@injectable()
export class DBConnectionManager {
    address: Address;
    connection: Connection;

    constructor(address: Address) {
        this.address = address
        this.connection = mongoConnect(this.address.port)
        console.log("Connected on port: " + this.address.port)

    }

}

