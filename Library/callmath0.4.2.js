// callmath.js v0.4.2 – Natural Units & Friendly Calculations

const callmath = (function () {

  let scope = {
    lastResult: 0,
    degMode: true
  };

  // ===============================
  //  Unit Table
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

    // Speed
    "m/s": 1,
    "km/h": 1000 / 3600
  };

  // ===============================
  //  Convert Helper
  // ===============================
  function convert(value, from, to) {
    if (!(from in units)) throw new Error("Unknown unit: " + from);
    if (!(to in units)) throw new Error("Unknown unit: " + to);

    let base = value * units[from];
    return base / units[to];
  }

  // ===============================
  //  Preprocess Expression
  // ===============================
  function preprocess(expr) {
    return expr
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/\?/g, "")
      .replace(/whatis|calculate|solve|answer/gi, "")
      .replace(/×/g, "*")
      .replace(/÷/g, "/");
  }

  // ===============================
  //  Parse Unit Conversion
  // Supports:
  // 86m=cm
  // 86m in cm
  // 10km/h=m/s
  // ===============================
  function parseConversion(expr) {

    // Pattern: number + unit + (=|in|to) + unit
    let match = expr.match(
      /^([\d.]+)([a-z/]+)(=|in|to)([a-z/]+)$/
    );

    if (!match) return null;

    let value = parseFloat(match[1]);
    let from = match[2];
    let to = match[4];

    let result = convert(value, from, to);

    return {
      value: result.toString(),
      unit: to,
      error: false
    };
  }

  // ===============================
  //  Parse Simple Unit Addition
  // Example: 5cm+2m
  // ===============================
  function parseUnitAddition(expr) {

    let match = expr.match(
      /^([\d.]+)([a-z]+)\+([\d.]+)([a-z]+)$/
    );

    if (!match) return null;

    let v1 = parseFloat(match[1]);
    let u1 = match[2];

    let v2 = parseFloat(match[3]);
    let u2 = match[4];

    if (!(u1 in units) || !(u2 in units))
      throw new Error("Unknown unit in addition");

    // Convert both into meters base (conversion)
    let totalBase =
      v1 * units[u1] +
      v2 * units[u2];

    return {
      value: totalBase + " m",
      error: false
    };
  }

  // ===============================
  //  Safe Eval Core (Fbi of callmathjs)
  // ===============================
  function safeEval(expr) {
    try {

      // Block unsafe chars (bad guys)
      if (/[\[\]{};<>]/.test(expr))
        throw new Error("Unsafe expression blocked");

      // 1. Conversion
      let conversion = parseConversion(expr);
      if (conversion) {
        return {
          value: conversion.value + " " + conversion.unit,
          error: false
        };
      }

      // 2. Unit Addition (+)
      let addUnits = parseUnitAddition(expr);
      if (addUnits) return addUnits;

      // 3. Normal Math Context
      const ctx = {
        pi: Math.PI,
        e: Math.E,
        abs: Math.abs,
        sqrt: Math.sqrt,
        pow: Math.pow,

        sin: x => Math.sin(scope.degMode ? x * Math.PI / 180 : x),
        cos: x => Math.cos(scope.degMode ? x * Math.PI / 180 : x),
        tan: x => Math.tan(scope.degMode ? x * Math.PI / 180 : x),

        prev: scope.lastResult,

        deg: () => (scope.degMode = true, "Degrees Mode"),
        rad: () => (scope.degMode = false, "Radians Mode")
      };

      // Evaluate
      const fn = new Function(
        "ctx",
        "with(ctx){return " + expr + "}"
      );

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
      return {
        value: "Error: " + e.message,
        error: true
      };
    }
  }

  // ===============================
  // Main API
  // ===============================
  function evaluate(expression) {
    if (!expression.trim())
      return { value: "Enter expression", error: false };

    let prepared = preprocess(expression);
    return safeEval(prepared);
  }

  // ===============================
  //  Public API/METADATA
  // ===============================
  evaluate.version = "0.4.2-natural-units";
  evaluate.units = () => Object.keys(units);

  return evaluate;

})();

if (typeof window !== "undefined")
  window.callmath = callmath;
