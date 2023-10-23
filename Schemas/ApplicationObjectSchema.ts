import mongoose from "mongoose";

var ObjSchema = new mongoose.Schema({
    "objectid": String,
    "object": {}
})

mongoose.model("ApplicationObject", ObjSchema);
