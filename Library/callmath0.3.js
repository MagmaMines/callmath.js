// callmath.js v0.3 – friendly math engine – Open Source by MagmaMinesTeam (2026)
// Features: %, trig (degrees default), hyp, variables, text-to-speech, better errors

const callmath = (function() {
  let scope = {
    e: Math.E,
    phi: (1 + Math.sqrt(5)) / 2,
    lastResult: 0,
    degMode: true   // default degrees
  };

  function preprocess(expr) {
    let s = expr
      .replace(/\s+/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e(?![a-z])/gi, 'Math.E')     // e but not variable e
      .replace(/√</g, 'Math.sqrt(')
      .replace(/√(\d)/g, 'Math.sqrt($1')
      .replace(/hyp\(/g, 'hypotenuse(')
      .replace(/dist\(/g, 'distance(');

    // Percentage: 200+15% → 200 + 200*0.15
    s = s.replace(/([+\-*/^]+)(\d+(?:\.\d+)?)%/g, (m, op, num) => `${op}(prev * ${num}/100)`);

    // Standalone % → /100
    s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

    // small<big → <
    s = s.replace(/([a-z]+)<([a-z]+)/gi, '$1<$2');

    // Auto close obvious sqrt
    s = s.replace(/Math\.sqrt\((\d+(?:\.\d+)?)(?![^(]*\))/g, 'Math.sqrt($1)');

    return s;
  }

  // Helpers
  function factorial(n) {
    if (n < 0) throw new Error("Negative factorial");
    if (n > 170) throw new Error("Too large");
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function hypotenuse(a, b) { return Math.hypot(a, b); }
  function distance(x1,y1,x2,y2) { return Math.hypot(x2-x1, y2-y1); }

  function toRad(x) { return scope.degMode ? x * Math.PI / 180 : x; }
  function toDeg(x) { return scope.degMode ? x * 180 / Math.PI : x; }

  function safeEval(expr) {
    try {
      const mathCtx = {
        ...Math,
        sin:   x => Math.sin(toRad(x)),
        cos:   x => Math.cos(toRad(x)),
        tan:   x => Math.tan(toRad(x)),
        asin:  x => toDeg(Math.asin(x)),
        acos:  x => toDeg(Math.acos(x)),
        atan:  x => toDeg(Math.atan(x)),
        log:   Math.log10,
        ln:    Math.log,
        exp:   Math.exp,
        pow:   Math.pow,
        abs:   Math.abs,
        fact:  factorial,
        hypotenuse, hyp: hypotenuse,
        distance, dist: distance,
        prev:  scope.lastResult || 0,
        setdeg: () => { scope.degMode = true; return "Degrees mode"; },
        setrad: () => { scope.degMode = false; return "Radians mode"; }
      };

      let code = expr;
      // Variable assignment: x=3.14   or   a = 5+2
      if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=/.test(expr)) {
        const [varPart, exprPart] = expr.split(/=(.+)/);
        const varName = varPart.trim();
        code = `scope["${varName}"] = ${exprPart.trim()}`;
      }

      const fn = new Function('Math', 'scope', 'return ' + code);
      const result = fn.call(null, mathCtx, scope);

      scope.lastResult = (typeof result === 'number') ? result : scope.lastResult;

      if (typeof result === 'number') {
        if (Number.isNaN(result)) return {value: "NaN – not a number", error: true};
        if (!Number.isFinite(result)) return {value: "∞ or -∞", error: true};
        const str = Number(result.toFixed(10)).toString().replace(/\.?0+$/, '');
        return {value: str, error: false};
      }

      return {value: String(result), error: false};
    } catch (e) {
      let msg = e.message || "Invalid expression";
      if (msg.includes("division by zero") || /0\s*[\/÷]\s*0/.test(expr)) {
        msg = "Not Defined (0÷0)";
      } else if (msg.includes("Unexpected") || msg.includes("Syntax")) {
        msg = "Syntax / number error – check operators, parentheses, digits";
      } else if (msg.includes("factorial")) {
        msg = "Factorial error: " + msg;
      }
      return {value: msg, error: true};
    }
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }

  function evaluate(expression, options = {}) {
    if (!expression?.trim()) {
      return {value: "Enter expression (sin45, 120+20%, a=5, hyp(3,4))", error: false};
    }

    const prepared = preprocess(expression);
    const res = safeEval(prepared);

    // Text-to-speech if enabled
    if (options.speak !== false && !res.error) {
      let speakText = res.value;
      if (/^\d/.test(speakText)) speakText = `Result is ${speakText}`;
      speak(speakText);
    }

    return res;
  }

  evaluate.version = "0.3-magma-mines-team-2026";
  evaluate.clear = () => { scope = {e: Math.E, phi: (1+Math.sqrt(5))/2, lastResult:0, degMode:true}; return {value:"Memory cleared", error:false}; };
  evaluate.silent = (expr) => evaluate(expr, {speak:false});
  evaluate.scope = () => ({...scope});

  return evaluate;
})();

if (typeof window !== 'undefined') window.callmath = callmath;
