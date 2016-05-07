var test = require("./test_util").run,
	fail = require("./test_util").run_fail,
	exec = require("./test_util").run_exec

describe("operations", {{
	describe("simple", {{
		it("should be converted", {{
			test("x + 2", "x+2;")
			test("x - 2", "x-2;")
			test("x * 2", "x*2;")
			test("x / 2", "x/2;")
			test("x /# 2", "Math.floor(x/2);")
			test("x % 2", "x%2;")
		}})
		it("should work", {{
			exec("6 + 2", 8)
			exec("6 - 2", 4)
			exec("6 * 2", 12)
			exec("6 / 2", 3)
			exec("6 / 4", 1.5)
			exec("6 /# 4", 1)
			exec("6 % 2", 0)
			exec("6 % 4", 2)
		}})
	}})
	
	describe("bitwise", {{
		it("should be converted", {{
			test("x & y", "x&y;")
			test("x | y", "x|y;")
			test("x ^ y", "x^y;")
		}})
	}})
	
	describe("logic", {{
		it("should be converted", {{
			test("x and y", "x&&y;")
			test("x or y", "x||y;")
			test("not x", "!x;")
		}})
	}})
	
	describe("comparisons", {{
		it("should be converted", {{
			test("4 == 2", "4===2;")
			test("4 != 2", "4!==2;")
			test("4 > 2", "4>2;")
			test("4 >= 2", "4>=2;")
			test("4 < 2", "4<2;")
			test("4 <= 2", "4<=2;")
		}})
	}})
	
	describe("shortcuts", {{
		it("should be converted", {{
			test("x += 2", "x+=2;")
			test("x -= 2", "x-=2;")
			test("x *= 2", "x*=2;")
			test("x /= 2", "x/=2;")
		}})
	}})
	
	describe("other", {{
		it("should be converted", {{
			test("x in a", "x in a;")
			test("x instanceof Array", "x instanceof Array;")
			test("typeof x", "typeof x;")
			test("delete x", "delete x;")
			test("del x", "delete x;")
		}})
		it("should not be converted", {{
			fail("random x")
			fail("typeo x")
			fail("dele x")
			
			fail("x in")
			fail("in a")
			fail("x instanceof")
			fail("instanceof Array")
			fail("delete")
			fail("typeof")
		}})
	}})
	
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
