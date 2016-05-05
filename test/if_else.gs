var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("if else", {{
	describe("if", {{
		it("should be converted", {{
			test("if test {}", "if(test){}")
			test("if test {doThing()}", "if(test){doThing();}")
			test("if test\n{}", "if(test){}")
			test("if(test){}", "if(test){}")
			
			test("if(test){}\nif(test2){}", "if(test){}if(test2){}")
		}})
		it("should not be converted", {{
			fail("if test")
			fail("if {}")
			fail("if test {")
			fail("if test }")
			fail("if\ntest {}")
		}})
	}})
	
	describe("else if", {{
		it("should be converted", {{
			test("if test {}\nelse if test2 {}", "if(test){}else if(test2){}")
			test("if test {}\nelse if test2 {doThing()}", "if(test){}else if(test2){doThing();}")
			test("if test {}\nelse if test2\n{}", "if(test){}else if(test2){}")
		}})
		it("should not be converted", {{
			fail("else if test {}")
			fail("if test {} else if test2 {}")
			fail("if test {}\nelse if test2")
			fail("if test {}\nelse if {}")
			fail("if test {}\nelse if test2 {")
			fail("if test {}\nelse if test2 }")
			fail("if test {}\nelse if\ntest2 {}")
			
			fail("if test { else if test2 {} }")
		}})
	}})
	
	describe("else", {{
		it("should be converted", {{
			test("if test {}\nelse {}", "if(test){}else{}")
			test("if test {}\nelse\n{}", "if(test){}else{}")
			test("if test {do1()}\nelse {do2()}", "if(test){do1();}else{do2();}")
		}})
		it("should not be converted", {{
			fail("else{}")
			fail("else")
			fail("else{")
			fail("else}")
			fail("if test {} else {}")
			fail("if test {}\nelse {}\nelse {}")
			
			fail("if test { else {} }")
		}})
	}})
	
	describe("ternary", {{
		it("should be converted", {{
			test("test ? yes : no", "(test?yes:no)")
			test("test ? yes :\nno", "(test?yes:no)")
			test("test ?\nyes : no", "(test?yes:no)")
		}})
		it("should not be converted", {{
			fail("test ? yes :")
			fail("test ? : no")
			fail("? yes : no")
			fail("test ? yes no")
			fail("test yes : no")
			fail("test\n? yes : no")
		}})
	}})
}})
