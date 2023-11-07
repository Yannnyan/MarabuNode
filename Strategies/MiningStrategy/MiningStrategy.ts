import { Address } from "../../Models/Address.js";
import { Block } from "../../Models/Block.js";
import { BlockTemplate } from "../../Models/BlockTemplate.js";


export abstract class MiningStrategy {
    myAddress: Address;
    blockTemplate: BlockTemplate;
    
    constructor(myAddress: Address, blockTemplate: BlockTemplate) {
        this.myAddress = myAddress;
        this.blockTemplate = blockTemplate;

    }
    abstract Mine(): Promise<Block>;


}






