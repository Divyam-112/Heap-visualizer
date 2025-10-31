document.addEventListener("DOMContentLoaded",()=>{
    let heap = [];
    let animating = false;
    let highlightedIndices = [];

    const inputValue = document.getElementById("inputValue");
    const insertBtn = document.getElementById("insertBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    const clearBtn = document.getElementById("clearBtn");
    const arrayContainer = document.getElementById("arrayContainer");
    const treeContainer = document.getElementById("treeContainer");
    const operationStatus = document.getElementById("operationStatus");
    const stepDescription = document.getElementById("stepDescription");

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

    const recordStep = (arr, highlights, desc) => {
      return {
        heap: [...arr],
        highlights: [...highlights],
        description: desc,
      };
    };

    function heapifyUp(arr, index, steps) {
      if (index === 0) return;

      const parentIdx = parent(index);
      steps.push(
        recordStep(
          arr,
          [index, parentIdx],
          `Comparing ${arr[index]} with parent ${arr[parentIdx]}`
        )
      );

      if (arr[index] < arr[parentIdx]) {
        steps.push(
          recordStep(
            arr,
            [index, parentIdx],
            `Swapping ${arr[index]} and ${arr[parentIdx]}`
          )
        );
        swap(arr, index, parentIdx);
        steps.push(recordStep(arr, [parentIdx], `Moved ${arr[parentIdx]} up`));
        heapifyUp(arr, parentIdx, steps);
      } else {
        steps.push(recordStep(arr, [index], `Heap property satisfied`));
      }
    }

    function heapifyDown(arr, index, steps) {
      const left = leftChild(index);
      const right = rightChild(index);
      let smallest = index;

      if (left < arr.length) {
        steps.push(
          recordStep(
            arr,
            [index, left],
            `Comparing ${arr[index]} with left child ${arr[left]}`
          )
        );
        if (arr[left] < arr[smallest]) {
          smallest = left;
        }
      }

      if (right < arr.length) {
        const compareIndices =
          smallest === index ? [index, right] : [smallest, right];
        steps.push(
          recordStep(
            arr,
            compareIndices,
            `Comparing with right child ${arr[right]}`
          )
        );
        if (arr[right] < arr[smallest]) {
          smallest = right;
        }
      }

      if (smallest !== index) {
        steps.push(
          recordStep(
            arr,
            [index, smallest],
            `Swapping ${arr[index]} and ${arr[smallest]}`
          )
        );
        swap(arr, index, smallest);
        steps.push(recordStep(arr, [smallest], `Moved ${arr[smallest]} down`));
        heapifyDown(arr, smallest, steps);
      } else {
        steps.push(recordStep(arr, [index], `Heap property satisfied`));
      }
    }

    async function animateSteps(steps, finalHeap) {
      for (let i = 0; i < steps.length; i++) {
        heap = steps[i].heap;
        highlightedIndices = steps[i].highlights;
        stepDescription.textContent = steps[i].description;
        render();
        await sleep(800);
      }
      heap = finalHeap;
      highlightedIndices = [];
      stepDescription.textContent = "";
      render();
      animating = false;
      updateButtons();
    }

    async function handleInsert() {
      if (animating || !inputValue.value) return;
      const value = parseInt(inputValue.value);
      if (isNaN(value)) return;

      animating = true;
      updateButtons();

      operationStatus.innerHTML = `<div class="status-badge"><span class="pulse">▶</span> Inserting ${value}</div>`;

      const newHeap = [...heap, value];
      const steps = [];

      steps.push(
        recordStep(
          newHeap,
          [newHeap.length - 1],
          `Inserted ${value} at end of array`
        )
      );
      heapifyUp(newHeap, newHeap.length - 1, steps);
      steps.push(recordStep(newHeap, [], `Insert complete`));

      await animateSteps(steps, newHeap);

      operationStatus.innerHTML = "";
      inputValue.value = "";
    }

    async function handleDeleteMin() {
      if (animating || heap.length === 0) return;

      animating = true;
      updateButtons();

      const minValue = heap[0];
      operationStatus.innerHTML = `<div class="status-badge"><span class="pulse">▶</span> Deleting minimum: ${minValue}</div>`;

      const newHeap = [...heap];
      const steps = [];

      steps.push(
        recordStep(newHeap, [0], `Removing minimum value: ${minValue}`)
      );

      if (newHeap.length > 1) {
        newHeap[0] = newHeap[newHeap.length - 1];
        steps.push(
          recordStep(newHeap, [0], `Moving last element ${newHeap[0]} to root`)
        );
      }

      newHeap.pop();

      if (newHeap.length > 0) {
        steps.push(recordStep(newHeap, [0], `Starting heapify down from root`));
        heapifyDown(newHeap, 0, steps);
      }

      steps.push(recordStep(newHeap, [], `Delete-min complete`));

      await animateSteps(steps, newHeap);

      operationStatus.innerHTML = "";
    }

    function handleClear() {
      if (animating) return;
      heap = [];
      highlightedIndices = [];
      operationStatus.innerHTML = "";
      stepDescription.textContent = "";
      render();
      updateButtons();
    }

    function updateButtons() {
      insertBtn.disabled = animating || !inputValue.value;
      deleteBtn.disabled = animating || heap.length === 0;
      clearBtn.disabled = animating;
    }

    function renderArray() {
      if (heap.length === 0) {
        arrayContainer.innerHTML =
          '<div class="empty-state">Heap is empty</div>';
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
      const levelHeight = 100;
      const y = level * levelHeight + 60;

      const maxWidth = 800;
      const baseWidth = maxWidth / Math.pow(2, level);
      const positionInLevel = index - (Math.pow(2, level) - 1);
      const x =
        (positionInLevel + 0.5) * baseWidth +
        (maxWidth - baseWidth * Math.pow(2, level)) / 2;

      return { x, y };
    }

    function renderTree() {
      if (heap.length === 0) {
        treeContainer.innerHTML =
          '<div class="empty-state">Heap is empty</div>';
        return;
      }

      const levels = Math.floor(Math.log2(heap.length)) + 1;
      const height = levels * 100 + 100;

      let svg = `<svg width="800" height="${height}" viewBox="0 0 800 ${height}" style="display: block; margin: 0 auto;">`;

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
        }" r="28" fill="${fillColor}" stroke="${strokeColor}" stroke-width="3"/>
                    <text x="${pos.x}" y="${
          pos.y
        }" text-anchor="middle" dy="0.35em" fill="${textColor}" font-size="18" font-weight="bold">${
          heap[i]
        }</text>
                    <text x="${pos.x}" y="${
          pos.y + 45
        }" text-anchor="middle" fill="#94a3b8" font-size="13">[${i}]</text>
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
    deleteBtn.addEventListener("click", handleDeleteMin);
    clearBtn.addEventListener("click", handleClear);
    inputValue.addEventListener("input", updateButtons);
    inputValue.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleInsert();
    });

    // Initial render
    render();
    updateButtons();
})