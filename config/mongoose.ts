import mongoose from "mongoose";
import {dbconfig} from "./env/developement.js";

export default function mongoConnect(port: number) {
    var con = mongoose.createConnection(dbconfig.db + port.toString());
    
    console.log("Conected to mongodb on port " + port.toString());
    return con
}





