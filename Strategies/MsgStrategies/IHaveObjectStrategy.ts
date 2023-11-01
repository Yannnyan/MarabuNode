import { GetLog } from "../../Localization/RuntimeLocal.js";
import { ApplicationObject } from "../../Models/ApplicationObject.js";
import { MsgStrategy } from "./MsgStrategy.js";
import RuntimeLocal from '../../Localization/RuntimeLocal.json' assert { type: "json" };
import { container } from "../../Services/NodeContainerService.js";


export class IHaveObjectStrategy extends MsgStrategy {
    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node IHaveObject'] + this.msg["objectid"]))
        var objectid = this.msg["objectid"]
        var strat = this;
        container[this.address.toString()].DBConProvider.appObj.FindById(objectid).then(function(obj) {
            console.log(obj)
            if(obj !== undefined) {
                return;
            }
            else
                strat.peer.SendGetObject(objectid);
        })
    }

}