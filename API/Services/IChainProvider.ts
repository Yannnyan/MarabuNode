import { Block } from "../../Models/Block.js";

export interface IChainProvider {
    UpdateTip(blockid: string): Promise<void>;
    GetLongestChainTip(): Block | undefined;
    GetLongestChainHeight(): number;
    setup(): Promise<void>;

}

