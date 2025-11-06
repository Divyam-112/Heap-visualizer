let heap = [];
let animating = false;
let paused = false;
let highlightedIndices = [];
let animationSteps = [];
let currentStepIndex = 0;
let currentOperation = "";
let animationSpeed = 1000; // Default speed in ms

const inputValue = document.getElementById("inputValue");
const insertBtn = document.getElementById("insertBtn");
const insertRandomBtn = document.getElementById("insertRandomBtn");
const deleteBtn = document.getElementById("deleteBtn");
const clearBtn = document.getElementById("clearBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const fastForwardBtn = document.getElementById("fastForwardBtn");
const animationControls = document.getElementById("animationControls");
const arrayContainer = document.getElementById("arrayContainer");
const treeContainer = document.getElementById("treeContainer");
const operationStatus = document.getElementById("operationStatus");
const stepDescription = document.getElementById("stepDescription");
const pseudocodeContainer = document.getElementById("pseudocodeContainer");

const PSEUDOCODE = {
  insert: [
    { line: "function INSERT(value):", indent: 0, id: "insert-0" },
    { line: "heap.append(value)", indent: 1, id: "insert-1" },
    { line: "index = heap.length - 1", indent: 1, id: "insert-2" },
    { line: "HEAPIFY_UP(index)", indent: 1, id: "insert-3" },
    { line: "", indent: 0, id: "insert-4" },
    { line: "function HEAPIFY_UP(i):", indent: 0, id: "heapup-0" },
    { line: "if i == 0: return", indent: 1, id: "heapup-1" },
    { line: "parent = ⌊(i-1)/2⌋", indent: 1, id: "heapup-2" },
    { line: "if heap[i] < heap[parent]:", indent: 1, id: "heapup-3" },
    { line: "swap(heap[i], heap[parent])", indent: 2, id: "heapup-4" },
    { line: "HEAPIFY_UP(parent)", indent: 2, id: "heapup-5" },
  ],
  delete: [
    { line: "function DELETE_MIN():", indent: 0, id: "delete-0" },
    { line: "min = heap[0]", indent: 1, id: "delete-1" },
    { line: "heap[0] = heap[last]", indent: 1, id: "delete-2" },
    { line: "heap.removeLast()", indent: 1, id: "delete-3" },
    { line: "HEAPIFY_DOWN(0)", indent: 1, id: "delete-4" },
    { line: "return min", indent: 1, id: "delete-5" },
    { line: "", indent: 0, id: "delete-6" },
    { line: "function HEAPIFY_DOWN(i):", indent: 0, id: "heapdown-0" },
    { line: "left = 2*i + 1", indent: 1, id: "heapdown-1" },
    { line: "right = 2*i + 2", indent: 1, id: "heapdown-2" },
    { line: "size = heap.length", indent: 1, id: "heapdown-2b" },
    { line: "smallest = i", indent: 1, id: "heapdown-3" },
    {
      line: "if (left < size) and (heap[left] < heap[smallest]):",
      indent: 1,
      id: "heapdown-4",
    },
    { line: "smallest = left", indent: 2, id: "heapdown-5" },
    {
      line: "if (right < size) and (heap[right] < heap[smallest]):",
      indent: 1,
      id: "heapdown-6",
    },
    { line: "smallest = right", indent: 2, id: "heapdown-7" },
    { line: "if (smallest != i):", indent: 1, id: "heapdown-8" },
    { line: "swap(heap[i], heap[smallest])", indent: 2, id: "heapdown-9" },
    { line: "HEAPIFY_DOWN(smallest)", indent: 2, id: "heapdown-10" },
  ],
};

// Heap helper functions
const parent = (i) => Math.floor((i - 1) / 2);
const leftChild = (i) => 2 * i + 1;
const rightChild = (i) => 2 * i + 2;

const swap = (arr, i, j) => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const recordStep = (arr, highlights, desc, pseudoLine) => {
  return {
    heap: [...arr],
    highlights: [...highlights],
    description: desc,
    pseudoLine: pseudoLine,
  };
};

function heapifyUp(arr, index, steps) {
  if (index === 0) {
    steps.push(
      recordStep(arr, [index], "Reached root, heapify complete", "heapup-1")
    );
    return;
  }

  const parentIdx = parent(index);
  steps.push(
    recordStep(
      arr,
      [index],
      `Calculate parent index: ⌊(${index}-1)/2⌋ = ${parentIdx}`,
      "heapup-2"
    )
  );
  steps.push(
    recordStep(
      arr,
      [index, parentIdx],
      `Compare ${arr[index]} with parent ${arr[parentIdx]}`,
      "heapup-3"
    )
  );

  if (arr[index] < arr[parentIdx]) {
    steps.push(
      recordStep(
        arr,
        [index, parentIdx],
        `${arr[index]} < ${arr[parentIdx]}, swapping...`,
        "heapup-4"
      )
    );
    swap(arr, index, parentIdx);
    steps.push(
      recordStep(
        arr,
        [parentIdx],
        `Swapped! Continue heapifying up`,
        "heapup-5"
      )
    );
    heapifyUp(arr, parentIdx, steps);
  } else {
    steps.push(
      recordStep(
        arr,
        [index],
        `${arr[index]} >= ${arr[parentIdx]}, heap property satisfied`,
        "heapup-3"
      )
    );
  }
}

function heapifyDown(arr, index, steps) {
  const left = leftChild(index);
  const right = rightChild(index);

  steps.push(
    recordStep(
      arr,
      [index],
      `Calculate children: left=${left}, right=${right}`,
      "heapdown-1"
    )
  );
  steps.push(
    recordStep(arr, [index], `Get heap size = ${arr.length}`, "heapdown-2b")
  );

  let smallest = index;
  steps.push(recordStep(arr, [index], `Set smallest = ${index}`, "heapdown-3"));

  if (left < arr.length) {
    steps.push(
      recordStep(
        arr,
        [index, left],
        `Compare with left child: ${arr[index]} vs ${arr[left]}`,
        "heapdown-4"
      )
    );
    if (arr[left] < arr[smallest]) {
      smallest = left;
      steps.push(
        recordStep(
          arr,
          [left],
          `Left child is smaller, smallest = ${left}`,
          "heapdown-5"
        )
      );
    }
  }

  if (right < arr.length) {
    const compareIndices =
      smallest === index ? [index, right] : [smallest, right];
    steps.push(
      recordStep(
        arr,
        compareIndices,
        `Compare with right child: ${arr[smallest]} vs ${arr[right]}`,
        "heapdown-6"
      )
    );
    if (arr[right] < arr[smallest]) {
      smallest = right;
      steps.push(
        recordStep(
          arr,
          [right],
          `Right child is smaller, smallest = ${right}`,
          "heapdown-7"
        )
      );
    }
  }

  steps.push(
    recordStep(
      arr,
      [index, smallest],
      `Check if swap needed: smallest=${smallest}, i=${index}`,
      "heapdown-8"
    )
  );

  if (smallest !== index) {
    steps.push(
      recordStep(
        arr,
        [index, smallest],
        `Swapping ${arr[index]} and ${arr[smallest]}`,
        "heapdown-9"
      )
    );
    swap(arr, index, smallest);
    steps.push(
      recordStep(
        arr,
        [smallest],
        `Continue heapifying down from ${smallest}`,
        "heapdown-10"
      )
    );
    heapifyDown(arr, smallest, steps);
  } else {
    steps.push(
      recordStep(
        arr,
        [index],
        `No swap needed, heap property satisfied`,
        "heapdown-8"
      )
    );
  }
}

function renderPseudocode(operation, activeLine) {
  const code = PSEUDOCODE[operation] || [];
  pseudocodeContainer.innerHTML = code
    .map((item) => {
      const isActive = item.id === activeLine;
      return `<div class="pseudocode-line indent-${item.indent} ${
        isActive ? "active" : ""
      }">${item.line}</div>`;
    })
    .join("");
}

async function playAnimation() {
  paused = false;
  updateAnimationButtons();

  while (currentStepIndex < animationSteps.length && !paused) {
    await showStep(currentStepIndex);
    currentStepIndex++;
    await sleep(animationSpeed);
  }

  if (currentStepIndex >= animationSteps.length) {
    finishAnimation();
  }
}

function pauseAnimation() {
  paused = true;
  updateAnimationButtons();
}

function toggleSpeed() {
  if (animationSpeed === 1000) {
    animationSpeed = 400; // Fast
    fastForwardBtn.innerHTML = "<span>⏩⏩</span><span>2x Speed</span>";
  } else {
    animationSpeed = 1000; // Normal
    fastForwardBtn.innerHTML = "<span>⏩</span><span>1x Speed</span>";
  }
}

async function handleInsertRandom() {
  const randomValue = Math.floor(Math.random() * 100) + 1;
  inputValue.value = randomValue;
  await handleInsert();
}

async function nextStep() {
  if (currentStepIndex < animationSteps.length) {
    await showStep(currentStepIndex);
    currentStepIndex++;

    if (currentStepIndex >= animationSteps.length) {
      finishAnimation();
    }
  }
}

async function showStep(index) {
  const step = animationSteps[index];
  heap = step.heap;
  highlightedIndices = step.highlights;
  stepDescription.textContent = `Step ${index + 1}/${animationSteps.length}: ${
    step.description
  }`;
  renderPseudocode(currentOperation, step.pseudoLine);
  render();
}

function finishAnimation() {
  animating = false;
  paused = false;
  highlightedIndices = [];
  operationStatus.innerHTML = "";
  stepDescription.textContent = "";
  animationControls.classList.remove("active");
  pseudocodeContainer.innerHTML =
    '<div class="pseudocode-line comment">// Waiting for operation...</div>';
  render();
  updateButtons();
}

async function handleInsert() {
  if (animating || !inputValue.value) return;
  const value = parseInt(inputValue.value);
  if (isNaN(value)) return;

  animating = true;
  paused = false;
  currentStepIndex = 0;
  currentOperation = "insert";
  updateButtons();

  operationStatus.innerHTML = `<div class="status-badge"><span class="pulse">▶</span> Inserting ${value}</div>`;
  animationControls.classList.add("active");

  const newHeap = [...heap, value];
  const steps = [];

  steps.push(
    recordStep(
      newHeap,
      [newHeap.length - 1],
      `Insert ${value} at end of array`,
      "insert-1"
    )
  );
  steps.push(
    recordStep(
      newHeap,
      [newHeap.length - 1],
      `Start heapify up from index ${newHeap.length - 1}`,
      "insert-3"
    )
  );
  heapifyUp(newHeap, newHeap.length - 1, steps);
  steps.push(recordStep(newHeap, [], `Insert complete!`, "insert-0"));

  animationSteps = steps;
  heap = newHeap;
  inputValue.value = "";
  updateAnimationButtons();

  // Auto-start animation
  await playAnimation();
}

async function handleDeleteMin() {
  if (animating || heap.length === 0) return;

  animating = true;
  paused = false;
  currentStepIndex = 0;
  currentOperation = "delete";
  updateButtons();

  const minValue = heap[0];
  operationStatus.innerHTML = `<div class="status-badge"><span class="pulse">▶</span> Deleting minimum: ${minValue}</div>`;
  animationControls.classList.add("active");

  const newHeap = [...heap];
  const steps = [];

  steps.push(
    recordStep(newHeap, [0], `Store minimum value: ${minValue}`, "delete-1")
  );

  if (newHeap.length > 1) {
    steps.push(
      recordStep(
        newHeap,
        [0, newHeap.length - 1],
        `Move last element ${newHeap[newHeap.length - 1]} to root`,
        "delete-2"
      )
    );
    newHeap[0] = newHeap[newHeap.length - 1];
  }

  steps.push(recordStep(newHeap, [], `Remove last element`, "delete-3"));
  newHeap.pop();

  if (newHeap.length > 0) {
    steps.push(
      recordStep(newHeap, [0], `Start heapify down from root`, "delete-4")
    );
    heapifyDown(newHeap, 0, steps);
  }

  steps.push(
    recordStep(
      newHeap,
      [],
      `Delete-min complete! Returned ${minValue}`,
      "delete-5"
    )
  );

  animationSteps = steps;
  heap = newHeap;
  updateAnimationButtons();

  // Auto-start animation
  await playAnimation();
}

function handleClear() {
  if (animating) return;
  heap = [];
  highlightedIndices = [];
  operationStatus.innerHTML = "";
  stepDescription.textContent = "";
  animationSteps = [];
  currentStepIndex = 0;
  animationControls.classList.remove("active");
  pseudocodeContainer.innerHTML =
    '<div class="pseudocode-line comment">// Waiting for operation...</div>';
  render();
  updateButtons();
}

function updateButtons() {
  insertBtn.disabled = animating || !inputValue.value;
  insertRandomBtn.disabled = animating;
  deleteBtn.disabled = animating || heap.length === 0;
  clearBtn.disabled = animating;
}

function updateAnimationButtons() {
  const hasSteps = animationSteps.length > 0;
  const hasMoreSteps = currentStepIndex < animationSteps.length;
  const isPlaying = animating && !paused && hasMoreSteps;

  playBtn.disabled = !hasSteps || !hasMoreSteps || isPlaying;
  pauseBtn.disabled = !hasSteps || !isPlaying;
  stepBtn.disabled = !hasSteps || !hasMoreSteps || isPlaying;
}

function renderArray() {
  if (heap.length === 0) {
    arrayContainer.innerHTML = '<div class="empty-state">Heap is empty</div>';
    return;
  }

  arrayContainer.innerHTML = heap
    .map(
      (value, index) => `
                <div class="array-item ${
                  highlightedIndices.includes(index) ? "highlighted" : ""
                }">
                    <div>${value}</div>
                    <div class="index">[${index}]</div>
                </div>
            `
    )
    .join("");
}

function getNodePosition(index, totalLevels) {
  const level = Math.floor(Math.log2(index + 1));
  const levelHeight = 80;
  const y = level * levelHeight + 50;

  const maxWidth = 700;
  const baseWidth = maxWidth / Math.pow(2, level);
  const positionInLevel = index - (Math.pow(2, level) - 1);
  const x =
    (positionInLevel + 0.5) * baseWidth +
    (maxWidth - baseWidth * Math.pow(2, level)) / 2;

  return { x, y };
}

function renderTree() {
  if (heap.length === 0) {
    treeContainer.innerHTML = '<div class="empty-state">Heap is empty</div>';
    return;
  }

  const levels = Math.floor(Math.log2(heap.length)) + 1;
  const height = levels * 80 + 80;

  let svg = `<svg width="700" height="${height}" viewBox="0 0 700 ${height}" style="display: block; margin: 0 auto;">`;

  // Draw edges first
  for (let i = 0; i < heap.length; i++) {
    const pos = getNodePosition(i, levels);
    const left = leftChild(i);
    const right = rightChild(i);

    if (left < heap.length) {
      const leftPos = getNodePosition(left, levels);
      svg += `<line x1="${pos.x}" y1="${pos.y}" x2="${leftPos.x}" y2="${leftPos.y}" stroke="#94a3b8" stroke-width="2"/>`;
    }

    if (right < heap.length) {
      const rightPos = getNodePosition(right, levels);
      svg += `<line x1="${pos.x}" y1="${pos.y}" x2="${rightPos.x}" y2="${rightPos.y}" stroke="#94a3b8" stroke-width="2"/>`;
    }
  }

  // Draw nodes
  for (let i = 0; i < heap.length; i++) {
    const pos = getNodePosition(i, levels);
    const isHighlighted = highlightedIndices.includes(i);
    const fillColor = isHighlighted ? "#fbbf24" : "#3b82f6";
    const strokeColor = isHighlighted ? "#f59e0b" : "#2563eb";
    const textColor = isHighlighted ? "#1f2937" : "white";

    svg += `
                    <circle cx="${pos.x}" cy="${
      pos.y
    }" r="24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="3"/>
                    <text x="${pos.x}" y="${
      pos.y
    }" text-anchor="middle" dy="0.35em" fill="${textColor}" font-size="16" font-weight="bold">${
      heap[i]
    }</text>
                    <text x="${pos.x}" y="${
      pos.y + 38
    }" text-anchor="middle" fill="#94a3b8" font-size="12">[${i}]</text>
                `;
  }

  svg += "</svg>";
  treeContainer.innerHTML = svg;
}

function render() {
  renderArray();
  renderTree();
}

// Event listeners
insertBtn.addEventListener("click", handleInsert);
insertRandomBtn.addEventListener("click", handleInsertRandom);
deleteBtn.addEventListener("click", handleDeleteMin);
clearBtn.addEventListener("click", handleClear);
playBtn.addEventListener("click", playAnimation);
pauseBtn.addEventListener("click", pauseAnimation);
stepBtn.addEventListener("click", nextStep);
fastForwardBtn.addEventListener("click", toggleSpeed);
inputValue.addEventListener("input", updateButtons);
inputValue.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleInsert();
});

// Initial render
render();
updateButtons();
