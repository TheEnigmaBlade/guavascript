var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("loops", {{
	describe("loop (the infinite one)", {{
		it("should be converted", {{
			test("loop{}", "while(true){}")
			test("loop\n{}", "while(true){}")
		}})
		it("should not be converted", {{
			fail("loop")
			fail("loop{")
		}})
	}})
	
	describe("while", {{
		it("should be converted", {{
			test("while true {}", "while(true){}")
			test("while true\n{}", "while(true){}")
			test("while undefined {}", "while(undefined){}")
			test("while randomVariable {}", "while(randomVariable){}")
			test("while var1 or var2 {}", "while(var1||var2){}")
			test("while test() {}", "while(test()){}")
		}})
		it("should not be converted", {{
			fail("while{}")
			fail("while(){}")
			fail("while({}")
			fail("while){}")
			fail("while true")
			fail("while true {")
			fail("while true }")
		}})
	}})
	
	describe("for", {{
		it("should be converted (exclusive)", {{
			var count = 0
			for n in 0..6 {
				test("for n in 0.."+n+" {}", "for(var n=0;n<"+n+";n++){}")
				if n > 5 {
					throw Error("Meta test failed: n > 5 ("+n+")")
				}
				count += 1
			}
			if count != 6 {
				throw Error("Meta test failed: count != 5 ("+count+")")
			}
			
			test("for n in 0..10\n{}", "for(var n=0;n<10;n++){}")
		}})
		it("should be converted (inclusive)", {{
			var count = 0
			for n in 0...5 {
				test("for n in 0..."+n+" {}", "for(var n=0;n<="+n+";n++){}")
				if n > 5 {
					throw Error("Meta test failed: n > 5 ("+n+")")
				}
				count += 1
			}
			if count != 6 {
				throw Error("Meta test failed: count != 5 ("+count+")")
			}
			
			test("for n in 0...10\n{}", "for(var n=0;n<=10;n++){}")
		}})
		it("should be converted with step", {{
			test("for n in 0..10 step 2 {}", "for(var n=0;n<10;n+=2){}")
			test("for n in 0..10 step 13 {}", "for(var n=0;n<10;n+=13){}")
			test("for n in 0..10 step customStep {}", "for(var n=0;n<10;n+=customStep){}")
			test("for n in 10..0 step -1 {}", "for(var n=10;n>0;n--){}")
			test("for n in 10..0 step -2 {}", "for(var n=10;n>0;n-=2){}")
			test("for n in 10..0 step -customStep {}", "for(var n=10;n>0;n-=customStep){}")
			test("for n in 10...0 step -customStep {}", "for(var n=10;n>=0;n-=customStep){}")
			
			test("for n in 0....10 {}", "for(var n=0;n<=0.1;n++){}")				// Valid as inclusive from 0 to 0.1 (0... .10)
			test("for n in 0....10 step 0.01 {}", "for(var n=0;n<=0.1;n+=0.01){}")
			
			test("for n in 0..10 by 2 {}", "for(var n=0;n<10;n+=2){}")
		}})
		it("should be converted with with", {{
			test("for n, v in 0..10 with 13 {}", "for(var n=0;n<10;n++){var v=13;}")
			test("for n, v in 0..10 with a[n*2] {}", "for(var n=0;n<10;n++){var v=a[n*2];}")
			test("for n, v in 0...10 with a[n*2] {}", "for(var n=0;n<=10;n++){var v=a[n*2];}")
			test("for n, v in 0..10 step 2 with a[n*2] {}", "for(var n=0;n<10;n+=2){var v=a[n*2];}")
			test("for n, v in 0...10 step 2 with a[n*2] {}", "for(var n=0;n<=10;n+=2){var v=a[n*2];}")
		}})
		
		it("should not be converted", {{
			fail("for in 0..10 {}")
			fail("for n 0..10 {}")
			fail("for n in {}")
			//fail("for n in 0.10 {}")			// Valid because it's a number; interprets as for-each
			fail("for n in x step 2 {}")
			fail("for n in 0.. {}")
			fail("for n in 0.. step 2 {}")
			fail("for n in ..10 {}")
			fail("for n in ..10 step 2 {}")
			
			fail("for n in 0..10 with n {}")
			fail("for n, v, x in 0..10 with n {}")
			fail("for n, v in 0..10 with {}")
			fail("for n, v in 0..10 {}")
			fail("for n in 0..10 n {}")
			
			fail("for\nn in 0..10 {}")
			fail("for n\nin 0..10 {}")
			fail("for n in\n0..10 {}")
			fail("for n in 0\n..10 {}")
			fail("for n in 0..\n10 {}")
		}})
	}})
	
	describe("for-each", {{
		it("should be converted", {{
			test("for x in a {}", "for(var $$for_00000001$$=0;$$for_00000001$$<a.length;$$for_00000001$$++){var x=a[$$for_00000001$$];}")
			test("for x in a\n{}", "for(var $$for_00000002$$=0;$$for_00000002$$<a.length;$$for_00000002$$++){var x=a[$$for_00000002$$];}")
		}})
	}})
}})
