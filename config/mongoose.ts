import mongoose from "mongoose";
import {dbconfig} from "./env/developement.js";
import "../Schemas/ApplicationObjectSchema.js"

export default function mongoConnect(port: number) {
    mongoose.connect(dbconfig.db + port.toString());
    
    console.log("Conected to mongodb");
    return mongoose
}


