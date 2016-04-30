var test = require("./test_util").run

describe("objects", {{
	it("should be empty", {{
		test("{}", "{}")
	}})
	it("should have one element", {{
		test("{'key1': 1}", "{'key1':1}")
	}})
	it("should have one element", {{
		test("{'key1': 1,}", "{'key1':1}")
	}})
	it("should have one element", {{
		test("{\n'key1':\n1\n}", "{'key1':1}")
	}})
	it("should have two elements", {{
 		test("{'key1': 1, 'key2': 2}", "{'key1':1,'key2':2}")
	}})
	it("should have two elements", {{
		test("{'key1': 1, 'key2': 2,}", "{'key1':1,'key2':2}")
	}})
	it("should have two elements", {{
	 	test("{\n'key1':\n1,\n'key2':2\n}", "{'key1':1,'key2':2}")
	}})
	it("should have mixed key types", {{
		test("{key1: true, 'key2': true}", "{key1:true,'key2':true}")
	}})
	it("should have mixed element types", {{
		test("{doThing: fun {}, name: 'Thing Doer', things: [1, 2]}", "{doThing:function(){},name:'Thing Doer',things:[1,2]}")
	}})
	it("should have nested objects", {{
		test("{obj1: {obj2: {obj3: {obj4: {'msg': 'hi'}}}}}", "{obj1:{obj2:{obj3:{obj4:{'msg':'hi'}}}}}")
	}})
}})
