### callmath.js 
> v0.4.3 | The Human-Friendly Calculation Engine

<img width="2000" height="2000" alt="CallMathJS" src="https://github.com/user-attachments/assets/86387161-9624-4dbd-9b34-64b12980a14f" />

callmath.js is a lightweight JavaScript library designed to parse and evaluate mathematical expressions the way humans actually type them. It bridges the gap between raw JavaScript Math and user-friendly input, supporting scientific notation, natural unit conversions, algebra variables, and precise syntax error highlighting.
## Features
 * Human Syntax: Understands implicit multiplication (2pi, 5(10), x y), percentages, and aliases.
 * Scientific Suite: Native support for sin, cos, tan, log, ln, sqrt (√), and powers (^).
 * Smart Units: Converts natural units instantly (e.g., 10km in m, 100km/hr to m/s).
 * Algebra Memory: Define variables (x = 10) and use them in subsequent calculations.
 * Syntax Forensics: Returns exactly where (index) and why an error occurred, enabling "Red Highlight" UI features.
## Installation
Simply include the script in your project:
<script src="callmath.js"></script>

Or copy the source directly into your utility file.

## ⚡ Quick Start
// Basic Math
callmath("2 + 2"); 
// -> { value: "4", error: false }

// Human Syntax (Implicit Multiplication)
callmath("2pi"); 
// -> { value: "6.2831853072", error: false }

// Scientific
callmath("sin(30°) + √16"); 
// -> { value: "4.5", error: false }

// Unit Conversion
callmath("120 km/hr in m/s"); 
// -> { value: "33.333333 m/s", error: false }

📖 API Reference
callmath(expression)
Evaluates the given string expression.
Returns: An object containing the result or error details.
Success Response
{
  "value": "42",
  "error": false
}

Error Response (with Highlighting)
{
  "value": "Syntax Error",
  "error": true,
  "reason": "Invalid double operator '++'",
  "highlightIndex": 5
}

🛠 Advanced Usage
1. Error Highlighting (The "Red" Highlight)
Use the highlightIndex to show users exactly where they made a mistake.
const input = "50 * / 2";
const result = callmath(input);

if (result.error && result.highlightIndex !== undefined) {
    // Logic to underline the character at result.highlightIndex
    console.log(`Error at char ${result.highlightIndex}: ${result.reason}`);
}

2. Algebra & Variables
You can store values and reference them later.
callmath("radius = 5");      // -> "radius set to 5"
callmath("area = pi * radius^2"); // -> "area set to 78.539..."
callmath("area / 2");        // -> "39.269..."

3. Scientific Notation & Aliases
   
| Input | Interpreted As |
|---|---|
| √ | sqrt() |
| ^ | pow() |
| ° | Converts Deg to Rad |
| SQ(4) | 4 * 4 |
| 10% | / 100 |
| 5x | 5 * x |

## 📏 Supported Units
Length: mm, cm, m, km, inch, ft
Time: s, min, h
Speed: m/s, km/h, km/hr, mph
To get a list of all units programmatically:
console.log(callmath.units());

## 📝 Changelog (v0.4.3)
 * Added: Syntax Error Highlighting (returns highlightIndex).
 * Added: Full scientific symbol support (π, √, °).
 * Added: Algebra variable support (x=10).
 * Improved: Regex for implicit multiplication is now more robust.
 * Fixed: km/hr alias added for human friendliness.
📄 License
MIT License. Free to use for personal and commercial projects.
