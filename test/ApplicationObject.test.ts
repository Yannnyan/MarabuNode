
import { describe } from "node:test";
import {assert,should, expect} from "chai";
import serialize from "canonicalize"
import { ApplicationObject } from "../Models/ApplicationObject.js"
import { it } from "node:test";
import { MarabuNode } from "../MarabuNode.js";
import { Block } from "../Models/Block.js";

var host = "127.0.0.1"
var port = 18018



describe("Testing ApplicationObject Model", async () => {
    
    it("Test ApplicationObject Transaction parsing and validation", async (t, done) => {
        var node = new MarabuNode(host, port);

        var coinbaseTx: any = {"object":{"height":0,"outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":50000000000}],"type":"transaction"},"type":"object"}
    
        var nextTransaction:any = {"object":{"inputs":[{"outpoint":{"index":0,
        "txid":"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af"},
        "sig":"1d0d7d774042607c69a87ac5f1cdf92bf474c25fafcc089fe667602bfefb0494726c519e92266957429ced875256e6915eb8cea2ea66366e739415efc47a6805"}],
        "outputs":[{"pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":10}],"type":"transaction"},"type":"object"}
    
        assert.doesNotThrow(() => ApplicationObject.Parse(coinbaseTx, node.address), "Parsing legal string not throws");
        var obj: ApplicationObject = ApplicationObject.Parse(coinbaseTx, node.address);
        assert.equal(serialize(coinbaseTx), obj.ToString(), "converting the object back to string must be the same")
    
        assert.doesNotThrow(() => ApplicationObject.Parse(nextTransaction, node.address), "Parsing legal string not throws")
        var nextTx: ApplicationObject = ApplicationObject.Parse(nextTransaction, node.address);
        assert.equal(serialize(nextTransaction), nextTx.ToString(), "converting the object back to string must be the same")
        
        assert.equal(obj.GetID(),"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af","id must match getid functionality to given id")
        var node = new MarabuNode(host,port);
        try{
            await obj.Verify(node.dbConProvider.appObj);
            console.log(await node.dbConProvider.appObj.Save(obj));
        }
        catch(err: any) {
            assert.fail(err.message);
        }
        try {
            await nextTx.Verify(node.dbConProvider.appObj);
        }
        catch (err: any){
            assert.fail(err)
        }
    
        // setImmediate(done);
    })
    it("testing Application object Block Parsing And Validation", async (t,done) => {
        var node = new MarabuNode(host, port);

        var genesisBlock = { "T": "00000002af000000000000000000000000000000000000000000000000000000", "created": 1624219079,
         "miner": "dionyziz", "nonce": "0000000000000000000000000000000000000000000000000000002634878840",
          "note": "The Economist 2021-06-20: Crypto-miners are probably to blame for the graphics-chip shortage",
           "previd": null, "txids": [], "type": "block" };
        
        var genesisId = "00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e";
        var T = "00000002af000000000000000000000000000000000000000000000000000000"
        var parsedGenesisBlock: Block ;
        assert.doesNotThrow(() =>Block.Parse(genesisBlock, node.address))
        parsedGenesisBlock = Block.Parse(genesisBlock, node.address);
        assert.equal(T, parsedGenesisBlock.T, "T values must match");
        assert.equal(genesisId, parsedGenesisBlock.GetID(), "IDS must match");
        assert.doesNotThrow(async () => await parsedGenesisBlock.Verify());

    })
})
