import { ApplicationObjectDB } from "../../DB/ApplicationObject.db.js";
import { Address } from "../../Models/Address.js";
import { Connection } from "mongoose";

export interface IDBConnectionProvider {
    address: Address;
    connection: Connection;
    appObj: ApplicationObjectDB;

}