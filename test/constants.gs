var test = require("./test_util").run,
	fail = require("./test_util").run_fail

describe("constants", {{
	describe("declaration", {{
		// Numbers
		it("should be a number", {{
			test("1", "1;")
			test("2.0", "2;")
			test("2.2", "2.2;")
			test("0xCAFE", "51966;")
			test("0o123", "83;")
			test("0b101010", "42;")
			
			test("1_000_000", "1000000;")
			test("1_000_000.01", "1000000.01;")
		}})
		it("should be an invalid number", {{
			fail("7z")
			fail("2.0.1")
			// Hex
			for v in 71...90 {
				fail("0x"+String.fromCharCode(v))
			}
			// Octal
			for v in 8...9 {
				fail("0o"+v)
			}
			for v in 65...90 {
				fail("0o"+String.fromCharCode(v))
			}
			// Binary
			for v, val in 2...9 with "0b"+v {
				fail(val)
			}
			for v in 65...90 {
				fail("0b"+String.fromCharCode(v))
			}
			
			fail("1_000__000")
			fail("100_.01")
			fail("0.000_000_1")
		}})
		
		// Strings
		it("should be a string", {{
			test("''", "'';")
			test("\"\"", "'';")
			test("'test'", "'test';")
			test("\"test\"", "'test';")
			for esc in ["\\\\", "\\n", "\\r", "\\t", "\\0", "\\'", "\\\\\""] {
				test("'test"+esc+"test'", "'test"+esc+"test';")
			}
		}})
		it("should not be a string", {{
			fail("'test")
			fail("\"test")
			fail("'test\"")
			fail("\"test'")
		}})
		
		// Booleans
		it("should be a boolean", {{
			test("true", "true;")
			test("false", "false;")
		}})
		
		// Other
		it("should at least be recognized", {{
			test("this", "this")
			test("null", "null;")
			test("undefined", "undefined;")
		}})
	}})
}})
