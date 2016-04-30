var test = require("./test_util").run

describe("arrays", {{
	it("should be empty", {{
		test("[]", "[]")
	}})
	it("should have one element", {{
		test("[1]", "[1]")
	}})
	it("should have one element", {{
		test("[1,]", "[1]")
	}})
	it("should have one element", {{
		test("[\n1\n]", "[1]")
	}})
	it("should have two elements", {{
 		test("[1, 2]", "[1,2]")
	}})
	it("should have two elements", {{
		test("[1, 2,]", "[1,2]")
	}})
	it("should have two elements", {{
	 	test("[\n1,\n2\n]", "[1,2]")
	}})
	it("should have mixed type elements", {{
		test("[1, 'string', 0xfacade, fun a{}]", "[1,'string',16435934,function a(){}]")
	}})
	it("should have nested arrays", {{
		test("[[[[[['hi']]]]]]", "[[[[[['hi']]]]]]")
	}})
}})
