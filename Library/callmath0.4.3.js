// callmath.js v0.4.3 – Human Friendly, Scientific & Error Highlighting
// "The bridge between human thought and machine calculation"

const callmath = (function () {

  // ===============================
  //  1. Memory & State
  // ===============================
  let scope = {
    lastResult: 0,
    degMode: true,
    vars: {} // Algebra storage (x=10)
  };

  // ===============================
  //  2. Extended Unit Table
  // ===============================
  const units = {
    // Length (Base: Meter)
    mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048,

    // Time (Base: Second)
    s: 1, min: 60, h: 3600,

    // Speed (Base: m/s)
    "m/s": 1, 
    "km/h": 0.277777778, 
    "km/hr": 0.277777778, // Human alias
    "mph": 0.44704 
  };

  // ===============================
  //  3. The "Humanizer" (Preprocessor)
  //  Translates symbols to JS Math
  // ===============================
  function preprocess(expr) {
    let clean = expr.trim().toLowerCase();

    // 1. Basic Symbols
    clean = clean
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/–/g, "-") // En-dash to minus
      .replace(/π/g, "pi")
      .replace(/√/g, "sqrt")
      .replace(/\^/g, "**") // Power
      .replace(/°/g, "") // Strip degree symbol (handled by logic)
      .replace(/square/g, "sq") // Alias
      .replace(/%/g, "/100"); // Percent

    // 2. Implicit Multiplication (The "Algebra" logic)
    // Converts "2pi" -> "2*pi", "2(5)" -> "2*(5)", "x y" -> "x*y"
    clean = clean.replace(/(\d|\))(\s*)([a-z(]|pi|sqrt|sq|sin|cos|tan|log|ln)/g, "$1*$3");

    // 3. Remove spaces used for cosmetics, but keep structural ones
    clean = clean.replace(/\s+/g, "");

    return clean;
  }

  // ===============================
  //  4. Syntax Forensics (Error Highlighter)
  //  Returns the exact index of the error
  // ===============================
  function detectSyntaxErrors(expr) {
    // Check 1: Parentheses Balance
    let open = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') open++;
      if (expr[i] === ')') open--;
      if (open < 0) return { error: true, index: i, reason: "Unexpected closing parenthesis ')'" };
    }
    if (open > 0) return { error: true, index: expr.length, reason: "Missing closing parenthesis ')'" };

    // Check 2: Dangling Operators
    if (/[\+\-\*\/]$/.test(expr)) {
      return { error: true, index: expr.length - 1, reason: "Expression cannot end with an operator" };
    }

    // Check 3: Double Operators (e.g., ++, //, *+)
    // We allow ** (power) and *- (negative number), but not others
    const badOps = expr.match(/[\+\*\/]{2,}/);
    if (badOps && badOps[0] !== "**") {
        return { error: true, index: badOps.index, reason: "Invalid double operator '" + badOps[0] + "'" };
    }
    
    return { error: false };
  }

  // ===============================
  //  5. Safe Evaluation Core
  // ===============================
  function safeEval(rawExpr) {
    let expr = preprocess(rawExpr);

    try {
      // --- A. Security Gate ---
      if (/[\[\]{};:<>]/.test(expr)) throw new Error("Illegal characters detected");

      // --- B. Assignment (Algebra) ---
      // Pattern: x = 10
      if (expr.includes("=")) {
        const parts = expr.split("=");
        if (parts.length === 2) {
            let varName = parts[0].trim();
            let valExpr = parts[1].trim();
            
            // Validate var name (must be letters)
            if (!/^[a-z]+$/.test(varName)) throw new Error("Invalid variable name");
            
            // Recursively eval the value
            let valRes = executeMath(valExpr); 
            if (valRes.error) return valRes;

            scope.vars[varName] = parseFloat(valRes.value);
            return { value: `${varName} set to ${valRes.value}`, error: false };
        }
      }

      // --- C. Unit Conversion (Standard) ---
      // Pattern: 10km in m
      let convMatch = rawExpr.toLowerCase().replace(/\s/g,"").match(/^([\d.]+)([a-z\/]+)(in|to|=)([a-z\/]+)$/);
      if (convMatch) {
        let val = parseFloat(convMatch[1]);
        let from = convMatch[2];
        let to = convMatch[4];

        if (units[from] && units[to]) {
           let res = (val * units[from]) / units[to];
           return { value: Number(res.toFixed(6)) + " " + to, error: false };
        }
      }

      // --- D. Syntax Check ---
      let syntaxCheck = detectSyntaxErrors(expr);
      if (syntaxCheck.error) {
        return { 
          value: "Syntax Error", 
          error: true, 
          highlightIndex: syntaxCheck.index, // The "Red" Number
          reason: syntaxCheck.reason 
        };
      }

      // --- E. Math Execution ---
      return executeMath(expr);

    } catch (e) {
      return { value: "Error", error: true, reason: e.message };
    }
  }

  function executeMath(expr) {
    try {
      // Build Context with Math functions + User Variables
      const ctx = {
        pi: Math.PI, e: Math.E,
        abs: Math.abs, sqrt: Math.sqrt, 
        pow: Math.pow,
        
        // Human Aliases
        sq: (n) => n * n,
        
        // Scientific
        sin: x => Math.sin(scope.degMode ? x * Math.PI / 180 : x),
        cos: x => Math.cos(scope.degMode ? x * Math.PI / 180 : x),
        tan: x => Math.tan(scope.degMode ? x * Math.PI / 180 : x),
        ln: Math.log,
        log: Math.log10,

        // Algebra Variables (spread user vars into context)
        ...scope.vars
      };

      // Create function with "with" block for clean syntax
      // Note: "with" is deprecated in strict mode, but essential for this specific sandboxing pattern
      const fn = new Function("ctx", "with(ctx){ return " + expr + " }");
      
      let result = fn(ctx);

      if (typeof result === "number") {
        if (isNaN(result)) throw new Error("Result is NaN (Not a Number)");
        if (!isFinite(result)) throw new Error("Result is Infinite");
        
        scope.lastResult = result;
        // Float precision cleanup (prevent 0.000000004 errors)
        let niceNum = Number(result.toPrecision(12)); 
        return { value: niceNum.toString(), error: false };
      }
      
      return { value: String(result), error: false };

    } catch (e) {
      // If JS evaluation fails (runtime error)
      return { value: "Calc Error", error: true, reason: "Math computation failed" };
    }
  }

  // ===============================
  //  Public API
  // ===============================
  function evaluate(expression) {
    if (!expression) return { value: "", error: false };
    return safeEval(expression);
  }

  // Expose internals for UI builders
  evaluate.version = "0.4.3-human-friendly";
  evaluate.units = () => Object.keys(units);
  evaluate.getVars = () => scope.vars;
  evaluate.clearVars = () => { scope.vars = {}; };

  return evaluate;

})();

// Browser Support
if (typeof window !== "undefined") window.callmath = callmath;
