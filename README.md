# Theory of Computation Solver

A web-based tool for solving Theory of Computation problems, including state machine analysis and CFG to state machine conversion.

## Features

1. **State Machine Image Analysis**
   - Upload images of state machines
   - Automatically identifies states and transitions
   - Determines machine type (DFA/NFA)
   - Describes the language accepted by the machine

2. **CFG to State Machine Converter**
   - Convert Context-Free Grammar expressions to state machines
   - Supports basic operations (concatenation, union)
   - Supports epsilon transitions (ε) and Kleene star operations
   - Visual representation of the resulting machine
   - Interactive drag-and-drop state arrangement
   - Download state machine diagrams as PNG images

## Usage

### State Machine Analysis
1. Upload an image of a state machine using the file input
2. The tool will analyze the image and display:
   - States and transitions
   - Start and accept states
   - Language description
   - Machine type (DFA/NFA)

### CFG to State Machine Conversion
1. Enter a CFG expression in the input field (e.g., `(0+1)(11+01)*`)
2. Click "Build Machine" to generate the state machine
3. The resulting machine will be displayed visually
4. You can interact with the visualization to arrange states

## Supported CFG Syntax
- Use parentheses `()` for grouping
- Use `+` for union/alternative
- Use concatenation by writing symbols next to each other
- Use `*` for Kleene star operation
- Use `ε` for epsilon transitions
- Supported symbols: `0`, `1`, `ε`

Example: `(0+1)(11+01)*` represents strings that start with either 0 or 1, followed by zero or more occurrences of either 11 or 01.

## Technical Details
- Built with vanilla JavaScript for client-side processing
- Uses vis.js for state machine visualization
- Designed to work with GitHub Pages hosting
- No backend dependencies required

## Local Development
1. Clone the repository
2. Open `index.html` in a web browser
3. No build process or server required

## Contributing
Feel free to submit issues and enhancement requests! 