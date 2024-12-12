const matrixSize = 8;
const matrixContainer = document.getElementById('matrix-container');
const treeContainer = document.getElementById('tree-container');
const userInputContainer = document.getElementById('user-inputs');
const relationshipOutput = document.getElementById('relationship-output');
let matrix = [];
let rootNode = 1;
let correctAnswers = {};
let isAnswerVisible = false;

// Create the matrix UI
function createMatrix() {
    matrixContainer.innerHTML = '';
    for (let i = 0; i < matrixSize; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';

        const rowLabel = document.createElement('span');
        rowLabel.textContent = i + 1;
        rowLabel.style.fontWeight = 'bold';
        row.appendChild(rowLabel);

        for (let j = 0; j < matrixSize; j++) {
            const cell = document.createElement('input');
            cell.type = 'number';
            cell.min = 0;
            cell.max = 1;
            cell.value = 0;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.readOnly = true;
            row.appendChild(cell);
        }

        matrixContainer.appendChild(row);
    }
}

// Generate random matrix
function generateRandomMatrix() {
    matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0));
    for (let i = 1; i < matrixSize; i++) {
        const parent = Math.floor(Math.random() * i);
        matrix[parent][i] = 1;
    }
    populateMatrix();
    resetCorrectAnswers();
}

function populateMatrix() {
    for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
            const cell = document.querySelector(`input[data-row='${i}'][data-col='${j}']`);
            if (cell) cell.value = matrix[i][j];
        }
    }
}

// Generate tree visualization
function generateTree() {
    treeContainer.innerHTML = '';
    const nodes = {};

    function createNode(id, x, y) {
        const node = document.createElement('div');
        node.className = 'node';
        node.textContent = id;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.zIndex = 2;
        nodes[id] = { element: node, x, y };
        treeContainer.appendChild(node);
        return node;
    }

    function createLine(x1, y1, x2, y2) {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.width = `${Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)}px`;
        line.style.height = '2px';
        line.style.backgroundColor = 'black';
        line.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
        line.style.transformOrigin = '0 0';
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.zIndex = 1;
        treeContainer.appendChild(line);
    }

    const rootX = treeContainer.clientWidth / 2 - 20;
    const rootY = 20;
    createNode(rootNode, rootX, rootY);

    function buildTree(matrix, parentId, x, y, level = 0) {
        const stepX = 120 / (level + 1);
        const stepY = 80;
        const children = [];

        for (let i = 0; i < matrixSize; i++) {
            if (matrix[parentId - 1][i] === 1) {
                children.push(i + 1);
            }
        }

        const totalWidth = (children.length - 1) * stepX;
        let startX = x - totalWidth / 2;

        for (let i = 0; i < children.length; i++) {
            const childX = startX + i * stepX;
            const childY = y + stepY;
            createLine(x + 20, y + 20, childX + 20, childY + 20);
            createNode(children[i], childX, childY);
            buildTree(matrix, children[i], childX, childY, level + 1);
        }
    }

    buildTree(matrix, rootNode, rootX, rootY);
}

// Create input fields for node relationships
function createUserInputs() {
    userInputContainer.innerHTML = '';
    for (let i = 1; i <= matrixSize; i++) {
        const nodeContainer = document.createElement('div');
        nodeContainer.classList.add('node-container');
        nodeContainer.innerHTML = `
            <h4>Node ${i}</h4>
            <input type="text" id="parent${i}" placeholder="Parent">
            <input type="text" id="children${i}" placeholder="Children">
            <input type="text" id="ancestors${i}" placeholder="Ancestors">
            <input type="text" id="descendants${i}" placeholder="Descendants">
            <input type="text" id="level${i}" placeholder="Level">
        `;
        userInputContainer.appendChild(nodeContainer);
    }
}

// Reset correct answers
function resetCorrectAnswers() {
    correctAnswers = {};
    for (let i = 1; i <= matrixSize; i++) {
        correctAnswers[i] = {
            parent: findParent(i),
            children: findChildren(i),
            ancestors: findAncestors(i),
            descendants: findDescendants(i),
            level: findLevel(i)
        };
    }
}

function findParent(nodeId) {
    for (let i = 0; i < matrixSize; i++) {
        if (matrix[i][nodeId - 1] === 1) {
            return `${i + 1}`;
        }
    }
    return '';
}

function findChildren(nodeId) {
    const children = [];
    for (let i = 0; i < matrixSize; i++) {
        if (matrix[nodeId - 1][i] === 1) {
            children.push(i + 1);
        }
    }
    return children.join(',');
}

function findAncestors(nodeId) {
    const ancestors = [];
    let current = nodeId;
    while (true) {
        const parent = findParent(current);
        if (parent) {
            ancestors.push(parent);
            current = parseInt(parent);
        } else {
            break;
        }
    }
    return ancestors.reverse().join(',');
}

function findDescendants(nodeId) {
    const descendants = [];
    function find(node) {
        const children = findChildren(node);
        if (children) {
            const childrenArray = children.split(',').map(Number);
            descendants.push(...childrenArray);
            childrenArray.forEach(find);
        }
    }
    find(nodeId);
    return descendants.join(',');
}

function findLevel(nodeId) {
    let level = 0;
    let current = nodeId;
    while (true) {
        const parent = findParent(current);
        if (parent) {
            level++;
            current = parseInt(parent);
        } else {
            break;
        }
    }
    return level.toString();
}

// Process user input and check correctness
function processUserInput() {
    relationshipOutput.innerHTML = '';
    for (let i = 1; i <= matrixSize; i++) {
        const parent = document.getElementById(`parent${i}`).value || '';
        const children = document.getElementById(`children${i}`).value || '';
        const ancestors = document.getElementById(`ancestors${i}`).value || '';
        const descendants = document.getElementById(`descendants${i}`).value || '';
        const level = document.getElementById(`level${i}`).value || '';

        const isCorrect =
            parent === correctAnswers[i].parent &&
            children === correctAnswers[i].children &&
            ancestors === correctAnswers[i].ancestors &&
            descendants === correctAnswers[i].descendants &&
            level === correctAnswers[i].level;

        relationshipOutput.innerHTML += `
            <h4>Node ${i}:</h4>
            <p>Parent: ${parent} (${parent === correctAnswers[i].parent ? 'Correct' : 'Incorrect'})</p>
            <p>Children: ${children} (${children === correctAnswers[i].children ? 'Correct' : 'Incorrect'})</p>
            <p>Ancestors: ${ancestors} (${ancestors === correctAnswers[i].ancestors ? 'Correct' : 'Incorrect'})</p>
            <p>Descendants: ${descendants} (${descendants === correctAnswers[i].descendants ? 'Correct' : 'Incorrect'})</p>
            <p>Level: ${level} (${level === correctAnswers[i].level ? 'Correct' : 'Incorrect'})</p>
        `;
    }
}

// Show/hide answer popup
function toggleAnswerPopup() {
    if (isAnswerVisible) {
        document.body.removeChild(document.getElementById('popup'));
    } else {
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.classList.add('popup');
        popup.innerHTML = `
            <h3>Correct Answers</h3>
            <pre>${JSON.stringify(correctAnswers, null, 2)}</pre>
            <button onclick="toggleAnswerPopup()">Close</button>
        `;
        document.body.appendChild(popup);
    }
    isAnswerVisible = !isAnswerVisible;
}

// Initialize
createMatrix();
createUserInputs();
generateRandomMatrix();