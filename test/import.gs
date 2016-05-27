var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("import", {{
	describe("module", {{
		it("should convert", {{
			test("import 'myModule'", "import'myModule';")
		}})
		it("should not convert", {{
			fail("import rawr")
			fail("import 1")
			fail("import true")
			fail("import a+b")
			fail("import thing[7]")
			fail("import callme()")
		}})
	}})
	describe("namespace", {{
		// In Javascript, this is `import * as X from 'Y';`
		// Also generating with little whitespace is weird.
		it("should convert", {{
			test("import as m from 'myModule'", "import*as m from'myModule';")
		}})
		it("should not convert", {{
			fail("import as 'str' from 'myModule'")
			fail("import as 1 from 'myModule'")
			fail("import as from 'myModule'")
			fail("import as m")
		}})
	}})
	describe("specifiers", {{
		it("should convert", {{
			test("import testFun from 'myModule'", "import testFun from'myModule';")
			test("import testFun, testFun2 from 'myModule'", "import{testFun,testFun2}from'myModule';")
		}})
		it("should not convert", {{
			
		}})
	}})
}})
