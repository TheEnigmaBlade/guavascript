var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("regexp", {{
	it("should create a literal", {{
		test("/a/", "/a/;")
		test("/[a]+/", "/[a]+/;")
		test("/([a]+b)*c/", "/([a]+b)*c/;")
		test("/([a]+b){3,}c/", "/([a]+b){3,}c/;")
	}})
	it("should create a literal with flags", {{
		test("/a/i", "/a/i;")
		test("/b*/gi", "/b*/gi;")
	}})
	it("should work with other expressions", {{
		test("var r = /a/i", "var r=/a/i;")
		test("'abcdab'.search(/ab/g)", "'abcdab'.search(/ab/g);")
		test("/ab/g.find('nothing')", "/ab/g.find('nothing');")
	}})
}})
