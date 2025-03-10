const CFGParser = {
    parse(expression) {
        this.pos = 0;
        this.expression = expression;
        this.stateCounter = -1;
        return this.buildMachine(this.parseExpression());
    },

    parseExpression() {
        const terms = [];
        let term = this.parseTerm();
        
        while (term) {
            // Check if we have a sequence of terms (concatenation)
            if (this.pos < this.expression.length && this.expression[this.pos] !== '+' && this.expression[this.pos] !== ')') {
                const sequence = [term];
                while (this.pos < this.expression.length && this.expression[this.pos] !== '+' && this.expression[this.pos] !== ')') {
                    const nextTerm = this.parseTerm();
                    if (nextTerm) {
                        sequence.push(nextTerm);
                    } else {
                        break;
                    }
                }
                if (sequence.length > 1) {
                    term = { type: 'concat', value: sequence };
                }
            }
            
            terms.push(term);
            
            if (this.pos < this.expression.length && this.expression[this.pos] === '+') {
                this.pos++; // Skip '+'
                term = this.parseTerm();
            } else {
                break;
            }
        }
        
        return terms;
    },

    parseTerm() {
        if (this.pos >= this.expression.length) return null;

        let char = this.expression[this.pos];
        let term = null;
        
        if (char === '(') {
            this.pos++; // Skip '('
            const subexpr = this.parseExpression();
            if (this.pos >= this.expression.length || this.expression[this.pos] !== ')') {
                throw new Error('Missing closing parenthesis');
            }
            this.pos++; // Skip ')'
            term = { type: 'group', value: subexpr };
        } else if (char === '0' || char === '1') {
            this.pos++;
            term = { type: 'symbol', value: char };
        } else if (char === 'e' || char === 'ε') {
            this.pos++;
            term = { type: 'empty', value: 'ε' };
        }
        
        // Check for Kleene star after the term
        if (term && this.pos < this.expression.length && this.expression[this.pos] === '*') {
            this.pos++; // Skip '*'
            term = { type: 'kleene', value: term };
        }
        
        return term;
    },

    buildMachine(parsedExpr) {
        this.stateCounter = -1;
        const machine = {
            states: [],
            transitions: []
        };

        // Create start state (always q0)
        const startState = {
            id: ++this.stateCounter,
            label: `q${this.stateCounter}`,
            isStart: true,
            isAccept: false
        };
        machine.states.push(startState);

        let intermediateState = null;

        // Create intermediate states with sequential IDs
        const processGroup = (group, fromState, toState) => {
            if (group.type === 'symbol') {
                // Single symbol transition
                machine.transitions.push({
                    from: fromState.id,
                    to: toState.id,
                    symbol: group.value
                });
            } else if (group.type === 'empty') {
                // Empty string transition
                machine.transitions.push({
                    from: fromState.id,
                    to: toState.id,
                    symbol: 'ε'
                });
            } else if (group.type === 'group') {
                // Process each alternative in the group
                group.value.forEach(term => {
                    processGroup(term, fromState, toState);
                });
            } else if (group.type === 'concat') {
                // Handle concatenation
                let currentState = fromState;
                group.value.forEach((term, index) => {
                    if (index === group.value.length - 1) {
                        processGroup(term, currentState, toState);
                    } else {
                        intermediateState = {
                            id: ++this.stateCounter,
                            label: `q${this.stateCounter}`,
                            isStart: false,
                            isAccept: false
                        };
                        machine.states.push(intermediateState);
                        processGroup(term, currentState, intermediateState);
                        currentState = intermediateState;
                    }
                });
            } else if (group.type === 'kleene') {
                // For Kleene star, add self-loops on the target state for the base expression
                processGroup(group.value, toState, toState);
                
                // Connect fromState to toState with the base expression
                processGroup(group.value, fromState, toState);
            }
        };

        // First process the expression with a temporary target state
        const tempState = {
            id: ++this.stateCounter,
            label: `q${this.stateCounter}`,
            isStart: false,
            isAccept: true
        };

        if (parsedExpr.length > 1) {
            processGroup({ type: 'concat', value: parsedExpr }, startState, tempState);
        } else if (parsedExpr.length === 1) {
            processGroup(parsedExpr[0], startState, tempState);
        }

        // Now create the actual accept state (q2) and update transitions
        const acceptState = {
            id: ++this.stateCounter,
            label: `q${this.stateCounter}`,
            isStart: false,
            isAccept: true
        };

        // Update transitions to point to the new accept state
        machine.transitions.forEach(trans => {
            if (trans.to === tempState.id) {
                trans.to = acceptState.id;
            }
        });

        // Add accept state
        machine.states.push(acceptState);

        return machine;
    }
}; 