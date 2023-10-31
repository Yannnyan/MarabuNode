import { Address } from "../../Models/Address.js";
import { Connection } from "mongoose";

export interface IDBConnectionProvider {
    address: Address;
    connection: Connection;

}