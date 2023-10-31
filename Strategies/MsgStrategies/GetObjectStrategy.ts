import { MsgStrategy } from "./MsgStrategy.js";
import { ApplicationObject } from "../../Models/ApplicationObject.js";
import GetObjMsg from '../../Messages/GetObject.json'



export class GetObjectStrategy extends MsgStrategy {
    HandleMessage(): void {
        this.CheckValidMsg(GetObjMsg, this.msg);
        var peer = this.peer;
        ApplicationObject.FindById(this.msg["objectid"]).then(function(obj) {
            peer.SendObject(obj)
        })
    }
    
}
