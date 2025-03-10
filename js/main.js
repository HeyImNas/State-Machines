document.addEventListener('DOMContentLoaded', () => {
    // State Machine Image Analysis
    const stateInput = document.getElementById('state-machine-input');
    const preview = document.getElementById('state-machine-preview');
    const stateResults = document.getElementById('state-machine-results');

    stateInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Clear previous results
            stateResults.innerHTML = '';
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="State Machine">`;
                // Here we would typically send the image to a backend for processing
                // Since we're using GitHub Pages, we'll implement client-side processing
                analyzeStateMachine(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // CFG to State Machine
    const cfgInput = document.getElementById('cfg-input');
    const buildButton = document.getElementById('build-machine');
    const cfgResults = document.getElementById('cfg-results');
    const container = document.getElementById('machine-canvas');
    const epsilonButton = document.getElementById('epsilon-btn');
    const downloadButton = document.getElementById('download-btn');
    let network = null;

    // Function to download the state machine as an image
    function downloadStateMachine() {
        if (!network) return;

        // Get canvas from vis.js network
        const canvas = network.canvas.frame.canvas;
        
        // Create a temporary canvas with white background
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set size to match the network canvas
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Draw white background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the network canvas content
        tempCtx.drawImage(canvas, 0, 0);
        
        // Convert to PNG and download
        const link = document.createElement('a');
        link.download = 'state-machine.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }

    // Add click event listener for the download button
    downloadButton.addEventListener('click', downloadStateMachine);

    // Show download button when machine is built
    function showDownloadButton() {
        downloadButton.style.display = 'block';
    }

    // Handle epsilon button click
    epsilonButton.addEventListener('click', function() {
        const cursorPos = cfgInput.selectionStart;
        const currentValue = cfgInput.value;
        const newValue = currentValue.slice(0, cursorPos) + 'ε' + currentValue.slice(cursorPos);
        cfgInput.value = newValue;
        cfgInput.setSelectionRange(cursorPos + 1, cursorPos + 1);
        cfgInput.focus();
    });

    // Handle build button click
    buildButton.addEventListener('click', function() {
        const expression = cfgInput.value.trim();
        if (!expression) return;

        try {
            // Destroy previous network instance if it exists
            if (network) {
                network.destroy();
            }
            
            const machine = CFGParser.parse(expression);
            network = drawStateMachine(machine, container);
            cfgResults.innerHTML = `<p>Successfully built state machine for: ${expression}</p>`;
            showDownloadButton();
        } catch (error) {
            cfgResults.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    // Handle Enter key in input
    cfgInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            buildButton.click();
        }
    });
});

function analyzeStateMachine(imageData) {
    // For now, we'll just show a placeholder message
    // In a full implementation, this would use image processing libraries
    const stateResults = document.getElementById('state-machine-results');
    stateResults.innerHTML = `
        <p>Image analysis would identify:</p>
        <ul>
            <li>States and transitions</li>
            <li>Start and accept states</li>
            <li>Language description</li>
            <li>Machine type (DFA/NFA)</li>
        </ul>
    `;
}

function drawStateMachine(machine, container) {
    // Create a new network visualization
    const nodes = new vis.DataSet(machine.states.map(state => ({
        id: state.id,
        label: state.label,
        shape: state.isAccept ? 'dot' : 'circle',
        size: 30,
        color: {
            background: state.isStart ? '#97c2fc' : '#ffffff',
            border: '#2B7CE9'
        }
    })));

    // Create edges with proper spacing for parallel transitions
    const edges = new vis.DataSet();
    
    // First, identify parallel edges
    const parallelEdges = new Map();
    machine.transitions.forEach(trans => {
        const key = `${trans.from}-${trans.to}`;
        if (!parallelEdges.has(key)) {
            parallelEdges.set(key, []);
        }
        parallelEdges.get(key).push(trans);
    });

    // Then create the edges with appropriate spacing
    parallelEdges.forEach((transitions, key) => {
        const [fromId, toId] = key.split('-').map(Number);
        
        if (transitions.length === 1) {
            // Single transition - straight line
            edges.add({
                from: fromId,
                to: toId,
                label: transitions[0].symbol,
                arrows: 'to',
                smooth: {
                    enabled: true,
                    type: 'curvedCW',
                    roundness: 0.2
                }
            });
        } else {
            // Multiple transitions - curved lines with different heights
            transitions.forEach((trans, index) => {
                const offset = (index - (transitions.length - 1) / 2) * 0.5;
                edges.add({
                    from: trans.from,
                    to: trans.to,
                    label: trans.symbol,
                    arrows: 'to',
                    smooth: {
                        enabled: true,
                        type: index % 2 === 0 ? 'curvedCW' : 'curvedCCW',
                        roundness: 0.35 + Math.abs(offset)
                    }
                });
            });
        }
    });

    const data = {
        nodes: nodes,
        edges: edges
    };

    const options = {
        layout: {
            hierarchical: {
                enabled: true,
                direction: 'LR',
                sortMethod: 'directed',
                nodeSpacing: 200,
                levelSeparation: 200
            }
        },
        physics: {
            enabled: false,  // Disable physics for more stable layout
            hierarchicalRepulsion: {
                nodeDistance: 150
            }
        },
        nodes: {
            font: {
                size: 20
            },
            borderWidth: 2,
            size: 30,
            fixed: false
        },
        edges: {
            font: {
                size: 16,
                align: 'horizontal',
                background: {
                    enabled: true,
                    color: 'white',
                    size: 5
                }
            },
            width: 2,
            selectionWidth: 2,
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 1
                }
            }
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true
        }
    };

    return new vis.Network(container, data, options);
} 