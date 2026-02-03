# callmath.js
callmathJS is a javascript library for mathematics.

## CallMath.js v0.4.3
A lightweight, human-friendly mathematical utility library for JavaScript.
CallMath.js is designed to simplify complex mathematical operations and provide a more intuitive syntax for common calculations, unit conversions, and geometric formulas.
## Quick Start
Include CallMath.js in your project via CDN:

`<script src="https://raw.githubusercontent.com/MagmaMines/callmath.js/refs/heads/main/Library/callmath0.4.3.js"></script>`


 ## How to Use
CallMath operates through a global callmath object. You can perform calculations, conversions, or access constants instantly.
1. Simple Calculations
Instead of using eval(), use the safe calculation engine:
const result = callmath.calculate("25 + 5 * 2");
console.log(result); // Output: 35

2. Unit Conversions
Quickly convert between different units without remembering formulas:
// Length
callmath.convert(100, "cm", "m"); // Returns 1

// Temperature
callmath.convert(0, "c", "f"); // Returns 32

3. High-Precision Constants
Access constants beyond just Pi:
console.log(callmath.pi);  // 3.14159...
console.log(callmath.phi); // 1.618 (The Golden Ratio)
console.log(callmath.e);   // 2.718...

### ✨ Key Features
 * String Expression Parsing: Directly calculate math from text strings while respecting the order of operations (PEMDAS).
 * Geometric Functions: Built-in methods for calculating the Area, Volume, and Perimeter of shapes (Circles, Triangles, Rectangles).
 * Prime & Factorial Support: Native functions like callmath.isPrime(n) and callmath.factorial(n) that aren't available in standard JS.
 * Statistical Tools: Easily find the mean, median, and mode of an array of numbers.
 * Physics Shortcuts: Includes simple methods for calculating Speed, Distance, and Time.
 What Makes CallMath Different?

| Feature | Standard Math Object (Math.) | CallMath.js |
|---|---|---|
| Syntax | Verbose (Math.PI) | Concise (callmath.pi) |
| Logic | Individual functions only | Can evaluate whole strings |
| Units | No built-in conversion | Integrated Unit Converter |
| Advanced | No prime/factorial support | Built-in prime/factorial checks |
| Ease of Use | Hard for beginners | Designed for human readability |


## API Documentation (CallMathJS)

callmath.calculate(string)
Evaluates a mathematical string safely. 

Supports +, -, *, /, and ().

callmath.isPrime(number)
Returns true or false if the provided number is a prime number.

callmath.factorial(number)
Returns the factorial of the given number.
callmath.random(min, max)
Generates a random integer between the two values provided.

callmath.area("shape", ...dimensions)
Calculates the area.
Example: callmath.area("circle", 5)
 ### License
This library is open-source and maintained by MagmaMines. Feel free to use it in your personal or commercial projects.
> Powered by CallMathJs — Making Math Simple again.
