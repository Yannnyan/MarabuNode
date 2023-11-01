import { IDBConnectionProvider } from "../API/Services/IDBConnectionProvider.js";
import { ApplicationObjectDB } from "../DB/ApplicationObject.db.js";
import { Address } from "../Models/Address.js"
import { CreateApplicationObjectSchema } from "../Schemas/ApplicationObjectSchema.js";
import mongoConnect from "../config/mongoose.js"
import { Connection, Model } from "mongoose";


export class DBConnectionManager implements IDBConnectionProvider {
    address: Address;
    connection: Connection;
    appObj: ApplicationObjectDB;


    constructor(address: Address) {
        this.address = address
        this.connection = mongoConnect(this.address.port)
        console.log("Connected on port: " + this.address.port)

        CreateApplicationObjectSchema(this.connection);
        this.appObj = new ApplicationObjectDB(this.connection);
    }

}

