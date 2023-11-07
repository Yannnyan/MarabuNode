import { IPendingReqeustProvider } from "../API/Services/IPendingRequestProvider.js";
import { Address } from "../Models/Address.js";
import { MsgStrategy } from "../Strategies/MsgStrategies/MsgStrategy.js";
import { RequestStrategy } from "../Strategies/RequestStrategies/RequestStrategy.js";


export class PendingRequestManager implements IPendingReqeustProvider {
    requests: RequestStrategy<any>[];
    myAddress: Address;
    constructor(myAddress: Address) {
        this.requests = [];
        this.myAddress = myAddress;
    }

    AddRequest(reqeust: RequestStrategy<any>) {
        this.requests.push(reqeust);
    }

    GetMsgStrategy(msgStrategy: MsgStrategy) {
        this.requests.forEach((request) => request.OnMsgStrategy(msgStrategy));        // on msg
        let notFullfilledRequests = this.requests.filter((request) => !request.IsFullfilled()); // not ful
        let fullfilledRequests = this.requests.filter((request) => request.IsFullfilled()); 
        fullfilledRequests.forEach((fullfilledRequest) => fullfilledRequest.OnFullfilled()); // on ful
        this.requests = notFullfilledRequests; 
    }
}

