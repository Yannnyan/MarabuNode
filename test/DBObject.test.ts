import {assert,should, expect} from "chai";
import { it } from "node:test";
import { describe} from "node:test";

import { ApplicationObjectDB } from "../DB/ApplicationObject.db.js";

import { MarabuNode } from "../MarabuNode.js";



describe("Testing database functionality", () => {
    it("test object save and find", async () => {
        var node = new MarabuNode("127.0.0.1",18018);
        var genesis = await node.dbConProvider.appObj.FindGenesis();
        assert.exists(genesis)
        console.log(genesis)
        var obj = await node.dbConProvider.appObj.FindById(genesis?.GetID() || "");
        assert.exists(obj);
        // console.log(obj)
    })
})

