var test = require("./test_util").run,
	fail = require("./test_util").run_fail
	exec = require("./test_util").run_exec

describe("math", {{
	describe("order of operations", {{
		it("should be in the right order", {{
			exec("1+1", 2)
			exec("1+1+2", 4)
			exec("1+1+2+3", 7)
			exec("1+1+2+3+5", 12)
			
			exec("4*0+5", 5)
			exec("4+5*0", 4)
			exec("4/2+5", 7)
			exec("4+10/5", 6)
		}})
		
		it("should be in the right order with parentheses", {{
			exec("(1+1)", 2)
			exec("(1+1)+2", 4)
			exec("1+(1+2)", 4)
			exec("(1+1)+(2+3)", 7)
			exec("1+((1+2)+3)+5", 12)
			
			exec("(4*0)+5", 5)
			exec("4*(0+5)", 20)
			exec("(4+5)*0", 0)
			exec("4+(5*0)", 4)
		}})
	}})
}})
