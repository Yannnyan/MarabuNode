import { Connection, Model } from "mongoose";
import { ApplicationObject } from "../Models/ApplicationObject.js";
import "../Schemas/ApplicationObjectSchema.js"
import { Address } from "../Models/Address.js";

export class ApplicationObjectDB{
    connection: Connection;
    myAddress: Address;
    ObjModel: Model<any, unknown, unknown, {}, any, any>;

    constructor(
        connection: Connection,
        myAddress: Address 
        ) {
        this.connection = connection;
        this.myAddress = myAddress;
        this.ObjModel = this.connection.model("ApplicationObject");

    }

    async Save(obj: ApplicationObject) {
        var objdict = obj.ToDict();
        if(!await this.FindById(obj.GetID())) {
            return await this.ObjModel.create({"object": objdict.object, "objectid": obj.GetID()})
        }
        return undefined;

    }
    async FindById(id: String) : Promise<ApplicationObject | null | undefined>{
        var obj = (await this.ObjModel.findOne({"objectid": id}))
        if(!obj)
            return obj;
        return ApplicationObject.Parse(obj._doc, this.myAddress);
    }

}