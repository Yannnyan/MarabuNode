import { MsgStrategy } from "../MsgStrategies/MsgStrategy.js";


export abstract class RequestStrategy<T> {
    
    abstract OnFullfilled(): T;
    /**
     * Must defined when the request is fullfilled
     */
    abstract IsFullfilled(): boolean;
    /**
     * Function that is called upon adding the request to the reqeust manager
     * 
     */
    abstract HandleRequest(): void;
    /**
     * Function that is called upon getting new Message Strategy
     * @param msg Assumes msg is a valid message strategy.
     */
    abstract OnMsgStrategy(msgStrat: MsgStrategy): void;
}



