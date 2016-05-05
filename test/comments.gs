var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("comments", {{
	describe("single-line", {{
		it("should be ignored", {{
			test("// This is a comment!", "")
			test("// This is a comment!\ndoThing()", "doThing();")
			test("// This is a comment!\ndoThing()\n// This is another comment!", "doThing();")
			test("// This is a comment! doThing()", "")
			test("doThing()// This is a comment!", "doThing();")
		}})
	}})
	
	describe("multi-line", {{
		it("should be ignored", {{
			test("/* level 1 */", "")
			test("/* level 1 /* level 2 */ */", "")
			
			test("/* level 1 */doThing()", "doThing();")
			test("doThing()/* level 1 */", "doThing();")
			//test("/* level 1 */doThing()/* level 1 */", "doThing();")
			test("/* level 1 /* level 2 */ */", "")
		}})
		
		it("should cause an error", {{
			fail("/* level 1 /* level 2 */")
		}})
	}})
}})
