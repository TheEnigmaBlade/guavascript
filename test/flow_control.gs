var test = require("./test_util").run,
	fail = require("./test_util").run_fail,
	exec = require("./test_util").run_exec
	failExec = require("./test_util").run_exec_fail

describe("flow control", {{
	describe("statements", {{
		it("should convert", {{
			test("loop{return}", "while(true){return;}")
			test("loop{return x}", "while(true){return x;}")
			test("loop{break}", "while(true){break;}")
			test("loop{continue}", "while(true){continue;}")
			
			test("throw 'test'", "throw'test';")
			test("throw Error('test')", "throw Error('test');")
		}})
		it("should not convert", {{
			fail("loop{return x, y}")
			fail("loop{break x}")
			
			fail("throw")
		}})
		it("should work", {{
			exec("var x = 13\nfor n in 0..1 {break\nx = 0}\nx", 13)
			exec("var x = 13\nfunction a(){return\nx = 0}\na()\nx", 13)
			exec("var x = 0\nfunction a(){return 13}\nx = a()", 13)
			exec("var x = 13\nfor n in 0..1 {continue\nx = 0}\nx", 13)
			
			failExec("throw 'test'")
		}})
	}})
	
	describe("try-catch", {{
		it("should convert", {{
			test("try dangerous() catch e {}", "try{dangerous();}catch(e){}")
			test("try dangerous()\ncatch e {}", "try{dangerous();}catch(e){}")
			test("try dangerous() catch e\n{}", "try{dangerous();}catch(e){}")
		}})
		it("should not convert", {{
			fail("try\ndangerous() catch e {}")
			fail("try dangerous() catch\ne {}")
		}})
		
		it("should convert with anonymous function", {{
			test("try{{dangerous()}} catch e {}", "try{(function(){dangerous();}());}catch(e){}")
		}})
		
		it("should convert alternatives", {{
			test("if dangerous() catch e {}", "try{dangerous();}catch(e){}")
		}})
	}})
}})
