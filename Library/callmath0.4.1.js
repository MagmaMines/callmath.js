// callmath.js v0.4.1 - See yourself guys
const callmath = (function () {

  let scope = {
    lastResult: 0,
    degMode: true
  };

  // ===============================
  // ✅ Unit Table (Basic)
  // ===============================
  const units = {
    // Length
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,

    // Time
    s: 1,
    min: 60,
    h: 3600,

    // fast km/h 
    "km/h": 1000 / 3600,
    "m/s": 1
  };

  // ===============================
  //  Convert Units (better)
  // ===============================
  function convert(value, from, to) {
    if (!(from in units) || !(to in units))
      throw new Error("Unknown unit");

    let base = value * units[from];
    return base / units[to];
  }

  // ===============================
  //  Extra Math Helpers (algebra)
  // ===============================
  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
  }

  function lcm(a, b) {
    return (a * b) / gcd(a, b);
  }

  function toRad(x) {
    return scope.degMode ? x * Math.PI / 180 : x;
  }

  function toDeg(x) {
    return scope.degMode ? x * 180 / Math.PI : x;
  }

  // ===============================
  // ✅ Preprocess Expression
  // ===============================
  function preprocess(expr) {

    let s = expr.toLowerCase()

      // Remove question noise
      .replace(/\?/g, "")
      .replace(/=$/, "")
      .replace(/what is|calculate|solve|answer/gi, "")

      // Replace symbols
      .replace(/×/g, "*")
      .replace(/÷/g, "/")

      // Remove spaces
      .replace(/\s+/g, "");

    return s;
  }

  // ===============================
  //  Unit Expression Parser CmtoM simple 
  // ===============================
  function parseUnits(expr) {

    // Example: "10cm to m"
    let match = expr.match(/^([\d.]+)([a-z/]+)to([a-z/]+)$/);

    if (match) {
      let value = parseFloat(match[1]);
      let from = match[2];
      let to = match[3];

      let result = convert(value, from, to);
      return { value: result.toString(), error: false };
    }

    return null;
  }

  // ===============================
  //  Safe Evaluation 
  // ===============================
  function safeEval(expr) {
    try {

      // Block unsafe characters
      if (/[\[\]{};<>]/.test(expr))
        throw new Error("Unsafe input blocked");

      // Unit conversion check first
      let unitResult = parseUnits(expr);
      if (unitResult) return unitResult;

      // Math context
      const ctx = {

        // Basic math
        pi: Math.PI,
        e: Math.E,
        abs: Math.abs,
        sqrt: Math.sqrt,
        pow: Math.pow,

        // Trig
        sin: x => Math.sin(toRad(x)),
        cos: x => Math.cos(toRad(x)),
        tan: x => Math.tan(toRad(x)),
        asin: x => toDeg(Math.asin(x)),
        acos: x => toDeg(Math.acos(x)),
        atan: x => toDeg(Math.atan(x)),

        // Extras
        gcd,
        lcm,
        square: x => x * x,
        cube: x => x * x * x,

        // Modes
        deg: () => (scope.degMode = true, "Degrees Mode"),
        rad: () => (scope.degMode = false, "Radians Mode"),

        prev: scope.lastResult
      };

      // Evaluate expression
      const fn = new Function("ctx", "with(ctx){return " + expr + "}");
      let result = fn(ctx);

      if (typeof result === "number") {
        scope.lastResult = result;
        return {
          value: Number(result.toFixed(10)).toString(),
          error: false
        };
      }

      return { value: String(result), error: false };

    } catch (e) {
      return { value: "Error: " + e.message, error: true };
    }
  }

  // ===============================
  // ✅ Main Evaluate API
  // ===============================
  function evaluate(expression) {

    if (!expression.trim())
      return { value: "Enter expression", error: false };

    let prepared = preprocess(expression);
    return safeEval(prepared);
  }

  // ===============================
  // ✅ Public API
  // ===============================
  evaluate.version = "0.4.1-units";
  evaluate.clear = () => (scope.lastResult = 0);

  return evaluate;

})();

if (typeof window !== "undefined")
  window.callmath = callmath;
