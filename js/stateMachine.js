class StateMachine {
    constructor(states, transitions, startState, acceptStates) {
        this.states = states;
        this.transitions = transitions;
        this.startState = startState;
        this.acceptStates = acceptStates;
        this.currentState = startState;
    }

    static fromJSON(json) {
        return new StateMachine(
            json.states,
            json.transitions,
            json.states.find(s => s.isStart),
            json.states.filter(s => s.isAccept)
        );
    }

    reset() {
        this.currentState = this.startState;
    }

    processInput(input) {
        this.reset();
        const path = [];

        for (const symbol of input) {
            const transition = this.transitions.find(t => 
                t.from === this.currentState.id && 
                t.symbol === symbol
            );

            if (!transition) {
                return {
                    accepted: false,
                    path,
                    error: `No transition found from state ${this.currentState.label} with symbol ${symbol}`
                };
            }

            path.push({
                from: this.currentState.label,
                symbol,
                to: this.states.find(s => s.id === transition.to).label
            });

            this.currentState = this.states.find(s => s.id === transition.to);
        }

        return {
            accepted: this.acceptStates.some(s => s.id === this.currentState.id),
            path
        };
    }

    getLanguageDescription() {
        // This is a simplified language description
        // In a full implementation, we would analyze the machine structure
        // to determine the exact language it accepts
        return {
            type: this.isDFA() ? 'DFA' : 'NFA',
            alphabet: this.getAlphabet(),
            description: 'Accepts strings matching the given pattern'
        };
    }

    isDFA() {
        // Check if the machine is deterministic
        const stateSymbols = new Map();
        
        for (const transition of this.transitions) {
            const key = `${transition.from}-${transition.symbol}`;
            if (stateSymbols.has(key)) {
                return false;
            }
            stateSymbols.set(key, true);
        }
        
        return true;
    }

    getAlphabet() {
        const symbols = new Set();
        this.transitions.forEach(t => symbols.add(t.symbol));
        return Array.from(symbols).sort();
    }
} 