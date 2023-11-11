import { MsgStrategy } from "./MsgStrategy.js";
import { ApplicationObject } from "../../Models/ApplicationObject.js";
import GetObjMsg from '../../Messages/GetObject.json' assert { type: "json" };
import { container } from "../../Services/NodeContainerService.js";



export class GetObjectStrategy extends MsgStrategy {
    HandleMessage(): void {
        this.CheckValidMsg(GetObjMsg, this.msg);
        var peer = this.peer;
        let idname = Object.keys(this.msg).find((key) => key.endsWith("id"));
        container[this.address.toString()].DBConProvider.appObj.FindById(this.msg[idname || "objectid"]).then(function(obj) {
            if(!obj)
                throw new Error("couldn't find object");
            peer.SendObject(obj)
        })
    }
    
}
