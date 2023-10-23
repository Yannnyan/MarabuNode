import mongoose from "mongoose";
import {dbconfig} from "./env/developement";


export async function mongoConnect(port: number) {
    await mongoose.connect(dbconfig.db + "/" + port.toString());
    console.log("Conected to mongodb");
}


