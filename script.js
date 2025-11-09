let heap = [];
let animating = false;
let paused = false;
let highlightedIndices = [];
let swappingIndices = [];
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

const recordStep = (
  arr,
  highlights,
  desc,
  pseudoLine,
  swapPair = null,
  preSwap = false
) => {
  return {
    heap: [...arr],
    highlights: [...highlights],
    description: desc,
    pseudoLine: pseudoLine,
    swapPair: swapPair,
    preSwap: preSwap,
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
    // Show pre-swap state with animation
    steps.push(
      recordStep(
        arr,
        [index, parentIdx],
        `${arr[index]} < ${arr[parentIdx]}, swapping...`,
        "heapup-4",
        [index, parentIdx],
        true
      )
    );
    swap(arr, index, parentIdx);
    // Show post-swap state
    steps.push(
      recordStep(
        arr,
        [parentIdx],
        `Swapped! ${arr[parentIdx]} moved up`,
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
    // Show pre-swap state with animation
    steps.push(
      recordStep(
        arr,
        [index, smallest],
        `Swapping ${arr[index]} and ${arr[smallest]}`,
        "heapdown-9",
        [index, smallest],
        true
      )
    );
    swap(arr, index, smallest);
    // Show post-swap state
    steps.push(
      recordStep(
        arr,
        [smallest],
        `Swapped! ${arr[smallest]} moved down`,
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

  // For pre-swap steps, show old array with swap animation
  if (step.preSwap && step.swapPair && step.swapPair.length === 2) {
    // Show the array BEFORE swap with animation
    const prevStep = index > 0 ? animationSteps[index - 1] : step;
    heap = prevStep.heap;
    highlightedIndices = step.highlights;
    swappingIndices = step.swapPair;
    stepDescription.textContent = `Step ${index + 1}/${
      animationSteps.length
    }: ${step.description}`;
    renderPseudocode(currentOperation, step.pseudoLine);
    render();

    // Force a reflow to ensure SVG is rendered before animation starts
    void treeContainer.offsetHeight;

    await sleep(1200); // Wait for swap animation (1.2s)

    // After animation completes, clear swapping indices but keep old heap
    // The visual state already shows the swapped result from animation
    // The heap will be updated in the next step (post-swap step)
    swappingIndices = [];
    highlightedIndices = step.highlights;
    // Don't update heap or re-render - animation already shows final state visually
  } else {
    // Normal step - check if this is a post-swap step that immediately follows a pre-swap step
    const prevStep = index > 0 ? animationSteps[index - 1] : null;
    if (prevStep && prevStep.preSwap) {
      // This is a post-swap step immediately after a pre-swap step
      // The visual state is already correct from the animation, so update heap silently
      heap = step.heap;
      highlightedIndices = step.highlights;
      swappingIndices = [];
      stepDescription.textContent = `Step ${index + 1}/${
        animationSteps.length
      }: ${step.description}`;
      renderPseudocode(currentOperation, step.pseudoLine);
      // Don't re-render - animation already shows final state with correct values
    } else {
      // Normal step
      heap = step.heap;
      highlightedIndices = step.highlights;
      swappingIndices = [];
      stepDescription.textContent = `Step ${index + 1}/${
        animationSteps.length
      }: ${step.description}`;
      renderPseudocode(currentOperation, step.pseudoLine);
      render();
    }
  }
}

function finishAnimation() {
  animating = false;
  paused = false;
  highlightedIndices = [];
  swappingIndices = [];
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
    // Show pre-swap animation - swap root and last element
    const rootValue = newHeap[0];
    const lastValue = newHeap[newHeap.length - 1];
    steps.push(
      recordStep(
        newHeap,
        [0, newHeap.length - 1],
        `Swapping root ${rootValue} with last element ${lastValue}`,
        "delete-2",
        [0, newHeap.length - 1],
        true
      )
    );
    // Actually swap the values
    swap(newHeap, 0, newHeap.length - 1);
    // Show after swap
    steps.push(
      recordStep(
        newHeap,
        [0],
        `Swapped! Last element now has root's value`,
        "delete-2"
      )
    );
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
  swappingIndices = [];
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

  // Calculate positions for swapping animation
  const itemWidth = 60; // width of array-item
  const gap = 8; // gap between items
  const itemSpacing = itemWidth + gap;

  let html = "";

  html += heap
    .map((value, index) => {
      const isHighlighted = highlightedIndices.includes(index);
      const isSwapping = swappingIndices.includes(index);

      let classes = `array-item`;
      if (isHighlighted && !isSwapping) {
        classes += " highlighted";
      }

      // Calculate swap distance if this element is being swapped
      let swapDistance = 0;
      let swapDirection = 1;
      if (isSwapping && swappingIndices.length === 2) {
        const [idx1, idx2] = swappingIndices;
        const distance = (idx2 - idx1) * itemSpacing;
        if (index === idx1) {
          swapDistance = distance;
          swapDirection = 1;
        } else if (index === idx2) {
          swapDistance = -distance;
          swapDirection = -1;
        }
      }

      const style = isSwapping
        ? `--swap-distance: ${swapDistance}px; --swap-direction: ${swapDirection};`
        : "";

      return `
                    <div class="${classes} ${
        isSwapping ? "swapping" : ""
      }" style="${style}" data-index="${index}">
                        <div>${value}</div>
                        <div class="index">[${index}]</div>
                    </div>
                `;
    })
    .join("");

  arrayContainer.innerHTML = html;
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

  // Draw static nodes first (non-swapping)
  for (let i = 0; i < heap.length; i++) {
    if (swappingIndices.includes(i)) continue;

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

  // Draw swapping nodes with animation along the line joining them
  if (swappingIndices.length === 2) {
    const [idx1, idx2] = swappingIndices;
    const pos1 = getNodePosition(idx1, levels);
    const pos2 = getNodePosition(idx2, levels);

    // Get values - use SWAPPED values so they're correct when nodes reach final positions
    // Node moving from idx1 to idx2 should show value that will be at idx2 (which is heap[idx1])
    // Node moving from idx2 to idx1 should show value that will be at idx1 (which is heap[idx2])
    const val1 = heap[idx1]; // This value will be at idx2 after swap
    const val2 = heap[idx2]; // This value will be at idx1 after swap

    // Calculate the line joining the two nodes
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate midpoint and arc height for smooth curve (slight arc for visual appeal)
    const midX = (pos1.x + pos2.x) / 2;
    const midY = (pos1.y + pos2.y) / 2;
    const arcHeight = Math.min(30, distance * 0.25); // Smaller arc for more direct path

    // Calculate perpendicular direction for arc (perpendicular to the line)
    const perpX = distance > 0 ? -dy / distance : 0;
    const perpY = distance > 0 ? dx / distance : 0;

    // Arc midpoint (slightly raised above the line)
    const arcMidX = midX + perpX * arcHeight;
    const arcMidY = midY + perpY * arcHeight;

    // Animation keyframes: nodes move along the line with slight arc
    // Node 1 moving to position 2 along the path
    svg += `
                    <g>
                        <circle cx="${pos1.x}" cy="${
      pos1.y
    }" r="24" fill="#fbbf24" stroke="#f59e0b" stroke-width="3" opacity="1">
                            <animate attributeName="cx" 
                                values="${pos1.x};${
      (pos1.x + arcMidX) / 2
    };${arcMidX};${(arcMidX + pos2.x) / 2};${pos2.x}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            <animate attributeName="cy" 
                                values="${pos1.y};${
      (pos1.y + arcMidY) / 2
    };${arcMidY};${(arcMidY + pos2.y) / 2};${pos2.y}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            <animate attributeName="r" 
                                values="24;26;30;26;24" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze"/>
                        </circle>
                        <text x="${pos1.x}" y="${
      pos1.y
    }" text-anchor="middle" dy="0.35em" fill="#1f2937" font-size="16" font-weight="bold">
                            <animate attributeName="x" 
                                values="${pos1.x};${
      (pos1.x + arcMidX) / 2
    };${arcMidX};${(arcMidX + pos2.x) / 2};${pos2.x}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            <animate attributeName="y" 
                                values="${pos1.y};${
      (pos1.y + arcMidY) / 2
    };${arcMidY};${(arcMidY + pos2.y) / 2};${pos2.y}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            ${val1}
                        </text>
                    </g>
                `;

    // Node 2 moving to position 1 along the path (opposite direction)
    svg += `
                    <g>
                        <circle cx="${pos2.x}" cy="${
      pos2.y
    }" r="24" fill="#fbbf24" stroke="#f59e0b" stroke-width="3" opacity="1">
                            <animate attributeName="cx" 
                                values="${pos2.x};${
      (pos2.x + arcMidX) / 2
    };${arcMidX};${(arcMidX + pos1.x) / 2};${pos1.x}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            <animate attributeName="cy" 
                                values="${pos2.y};${
      (pos2.y + arcMidY) / 2
    };${arcMidY};${(arcMidY + pos1.y) / 2};${pos1.y}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            <animate attributeName="r" 
                                values="24;26;30;26;24" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze"/>
                        </circle>
                        <text x="${pos2.x}" y="${
      pos2.y
    }" text-anchor="middle" dy="0.35em" fill="#1f2937" font-size="16" font-weight="bold">
                            <animate attributeName="x" 
                                values="${pos2.x};${
      (pos2.x + arcMidX) / 2
    };${arcMidX};${(arcMidX + pos1.x) / 2};${pos1.x}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            <animate attributeName="y" 
                                values="${pos2.y};${
      (pos2.y + arcMidY) / 2
    };${arcMidY};${(arcMidY + pos1.y) / 2};${pos1.y}" 
                                keyTimes="0;0.3;0.5;0.7;1" 
                                dur="1.2s" 
                                fill="freeze" 
                                calcMode="spline" 
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"/>
                            ${val2}
                        </text>
                    </g>
                `;

    // Draw index labels at fixed positions (they stay at original positions)
    svg += `<text x="${pos1.x}" y="${
      pos1.y + 38
    }" text-anchor="middle" fill="#94a3b8" font-size="12">[${idx1}]</text>`;
    svg += `<text x="${pos2.x}" y="${
      pos2.y + 38
    }" text-anchor="middle" fill="#94a3b8" font-size="12">[${idx2}]</text>`;
  }

  svg += "</svg>";
  treeContainer.innerHTML = svg;

  // Ensure animations start properly for swapping nodes
  if (swappingIndices.length === 2) {
    // Small delay to ensure SVG is fully rendered
    setTimeout(() => {
      const svgElement = treeContainer.querySelector("svg");
      if (svgElement) {
        const animations = svgElement.querySelectorAll("animate");
        animations.forEach((anim) => {
          try {
            // Try to restart animation
            if (anim.beginElement) {
              anim.beginElement();
            }
          } catch (e) {
            // If beginElement doesn't work, animation should start automatically
          }
        });
      }
    }, 10);
  }
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
