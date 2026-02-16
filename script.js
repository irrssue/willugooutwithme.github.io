const wrapper = document.querySelector(".wrapper");
const question = document.querySelector(".question");
const gif = document.querySelector(".gif");
const yesBtn = document.querySelector(".yes-btn");
const noBtn = document.querySelector(".no-btn");
const placesContainer = document.querySelector(".places-container");
const selectedPlaces = document.querySelector(".selected-places");
const placeItems = document.querySelectorAll(".place-item");

let selectedPlacesList = [];

yesBtn.addEventListener("click", () => {
  question.innerHTML = "yayyyy letsss gooo :3";
  gif.src = "https://media.giphy.com/media/UMon0fuimoAN9ueUNP/giphy.gif";

  // Show places selection after a short delay
  setTimeout(() => {
    wrapper.style.display = "none";
    placesContainer.style.display = "block";
  }, 1500);
});

noBtn.addEventListener("mouseover", () => {
  const noBtnRect = noBtn.getBoundingClientRect();
  const maxX = window.innerWidth - noBtnRect.width;
  const maxY = window.innerHeight - noBtnRect.height;

  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);

  noBtn.style.left = randomX + "px";
  noBtn.style.top = randomY + "px";
});

// Drag and Drop functionality
let draggedElement = null;

placeItems.forEach(item => {
  item.addEventListener("dragstart", (e) => {
    if (item.classList.contains("used")) {
      e.preventDefault();
      return;
    }
    draggedElement = item;
    item.classList.add("dragging");
  });

  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
  });
});

selectedPlaces.addEventListener("dragover", (e) => {
  e.preventDefault();
});

selectedPlaces.addEventListener("drop", (e) => {
  e.preventDefault();

  if (draggedElement && !draggedElement.classList.contains("used")) {
    const placeName = draggedElement.getAttribute("data-place");

    // Get drop position relative to the container
    const rect = selectedPlaces.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // Offset to center the element
    const y = e.clientY - rect.top - 20;

    // Add to selected list with position
    selectedPlacesList.push({
      name: placeName,
      x: Math.max(0, Math.min(x, rect.width - 150)),
      y: Math.max(0, Math.min(y, rect.height - 60))
    });

    // Mark as used
    draggedElement.classList.add("used");

    // Update the display
    updateSelectedPlaces();
  }
});

function updateSelectedPlaces() {
  // Clear the drop zone
  selectedPlaces.innerHTML = "";

  if (selectedPlacesList.length === 0) {
    selectedPlaces.innerHTML = '<div class="drop-zone">Drag places here to plan your day</div>';
    return;
  }

  // Create SVG for arrows
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "arrow-svg");

  // Define arrowhead marker
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", "0 0, 10 3, 0 6");
  polygon.setAttribute("fill", "#333");

  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);
  selectedPlaces.appendChild(svg);

  const placeElements = [];

  // Create elements for each selected place at their saved positions
  selectedPlacesList.forEach((place, index) => {
    const placeDiv = document.createElement("div");
    placeDiv.className = "selected-place";
    placeDiv.setAttribute("data-index", index);
    placeDiv.innerHTML = `
      <span>${place.name}</span>
      <button class="remove-btn" onclick="removePlace(${index})">✕</button>
    `;

    // Use saved position
    placeDiv.style.top = place.y + "px";
    placeDiv.style.left = place.x + "px";

    // Make draggable within the right panel
    placeDiv.draggable = true;
    placeDiv.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      placeDiv.style.opacity = "0.5";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", index);
    });

    placeDiv.addEventListener("dragend", (e) => {
      placeDiv.style.opacity = "1";

      const rect = selectedPlaces.getBoundingClientRect();
      const newX = e.clientX - rect.left - 60;
      const newY = e.clientY - rect.top - 20;

      // Update position
      selectedPlacesList[index].x = Math.max(0, Math.min(newX, rect.width - 150));
      selectedPlacesList[index].y = Math.max(0, Math.min(newY, rect.height - 60));

      updateSelectedPlaces();
    });

    selectedPlaces.appendChild(placeDiv);
    placeElements.push(placeDiv);
  });

  // Draw curved arrows between consecutive places
  setTimeout(() => {
    for (let i = 0; i < placeElements.length - 1; i++) {
      const from = placeElements[i];
      const to = placeElements[i + 1];

      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const containerRect = selectedPlaces.getBoundingClientRect();

      // Calculate relative positions
      const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
      const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
      const x2 = toRect.left - containerRect.left + toRect.width / 2;
      const y2 = toRect.top - containerRect.top + toRect.height / 2;

      // Create curved path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const controlPointX = x1 + (x2 - x1) / 2;
      const controlPointY = y1 + (y2 - y1) / 2 + 40;

      const d = `M ${x1} ${y1} Q ${controlPointX} ${controlPointY} ${x2} ${y2}`;
      path.setAttribute("d", d);
      path.setAttribute("class", "arrow-path");

      svg.appendChild(path);
    }
  }, 50);
}

function removePlace(index) {
  const place = selectedPlacesList[index];
  const placeName = place.name;

  // Remove from list
  selectedPlacesList.splice(index, 1);

  // Mark the item as available again
  placeItems.forEach(item => {
    if (item.getAttribute("data-place") === placeName) {
      item.classList.remove("used");
    }
  });

  // Update display
  updateSelectedPlaces();
}

// Make removePlace available globally
window.removePlace = removePlace;