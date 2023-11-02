import { IPendingReqeustProvider } from "../API/Services/IPendingRequestProvider.js";
import { MsgStrategy } from "../Strategies/MsgStrategies/MsgStrategy.js";
import { RequestStrategy } from "../Strategies/RequestStrategies/RequestStrategy.js";


export class PendingRequestManager implements IPendingReqeustProvider {
    requests: RequestStrategy[];
    constructor() {
        this.requests = [];
    }

    AddRequest(reqeust: RequestStrategy) {
        this.requests.push(reqeust);
        reqeust.HandleRequest();
    }

    GetMsgStrategy(msgStrategy: MsgStrategy) {
        this.requests.forEach((request) => request.OnMsgStrategy(msgStrategy));        // on msg
        let notFullfilledRequests = this.requests.filter((request) => !request.IsFullfilled()); // not ful
        let fullfilledRequests = this.requests.filter((request) => request.IsFullfilled()); 
        fullfilledRequests.forEach((fullfilledRequest) => fullfilledRequest.OnFullfilled()); // on ful
        this.requests = notFullfilledRequests; 
    }
}

