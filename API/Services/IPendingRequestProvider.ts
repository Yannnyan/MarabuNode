import { MsgStrategy } from "../../Strategies/MsgStrategies/MsgStrategy.js";
import { RequestStrategy } from "../../Strategies/RequestStrategies/RequestStrategy.js";

export interface IPendingReqeustProvider {
    /**
     * Adds the reqeust strategy and handles the on Addition function
     * @param reqeust Request Strategy of choice
     */
    AddRequest(reqeust: RequestStrategy): void ;
    /**
     * CAlls the onMsgTrategy function and checks if fullfilled afterwards, calls on fullfilled when fullfilled.
     * @param msgStrategy Msg strategy recieved from the msg Manager
     */
    GetMsgStrategy(msgStrategy: MsgStrategy): void ;

}

