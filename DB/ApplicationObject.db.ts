import { Connection, Model } from "mongoose";
import { ApplicationObject } from "../Models/ApplicationObject.js";
import { DBConnectionManager } from "../Services/DBConnectionManagerService.js";
import "../Schemas/ApplicationObjectSchema.js"

export class ApplicationObjectDB{
    connection: Connection;
    ObjModel: Model<any, unknown, unknown, {}, any, any>;

    constructor(
        connection: Connection
        ) {
        this.connection = connection;
        this.ObjModel = this.connection.model("ApplicationObject");
    }

    async Save(obj: ApplicationObject) {
        var objdict = obj.ToDict();
        if(!await this.FindById(obj.GetID())) {
            return await this.ObjModel.create({"object": objdict.object, "objectid": obj.GetID()})
        }
        return undefined;

    }
    async FindById(id: String) {
        var obj = (await this.ObjModel.findOne({"objectid": id}))
        if(!obj)
            return obj;
        return ApplicationObject.Parse(obj._doc);
    }

}