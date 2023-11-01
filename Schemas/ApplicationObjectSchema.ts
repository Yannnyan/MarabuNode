import mongoose, { Connection } from "mongoose";

export function CreateApplicationObjectSchema(con: Connection) {
    var ObjSchema = new mongoose.Schema({
        "objectid": String,
        "object": {}
    })
    
    con.model("ApplicationObject", ObjSchema);    
}
