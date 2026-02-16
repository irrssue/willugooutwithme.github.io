const wrapper = document.querySelector(".wrapper");
const question = document.querySelector(".question");
const gif = document.querySelector(".gif");
const yesBtn = document.querySelector(".yes-btn");
const noBtn = document.querySelector(".no-btn");
const placesContainer = document.querySelector(".places-container");
const selectedPlaces = document.querySelector(".selected-places");
const searchBar = document.querySelector(".search-bar");
const placesList = document.querySelector(".places-list");

let selectedPlacesList = [];
let availablePlaces = [];

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

// Search bar functionality
searchBar.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const placeName = searchBar.value.trim();
    if (placeName) {
      addPlaceToList(placeName);
      searchBar.value = "";
    }
  }
});

function addPlaceToList(placeName) {
  // Check if place already exists
  if (availablePlaces.some(place => place.name === placeName)) {
    alert("This place is already in your list!");
    return;
  }

  // Add to beginning of array (descending order)
  availablePlaces.unshift({ name: placeName });

  // Update the display
  updatePlacesList();
}

function updatePlacesList() {
  // Clear the list
  placesList.innerHTML = "";

  if (availablePlaces.length === 0) {
    placesList.innerHTML = '<div class="empty-message">Search for places to add to your itinerary</div>';
    return;
  }

  // Create place items
  availablePlaces.forEach((place) => {
    const placeItem = document.createElement("div");
    placeItem.className = "place-item";
    placeItem.draggable = true;
    placeItem.setAttribute("data-place", place.name);
    placeItem.textContent = place.name;

    // Check if this place is currently used in the itinerary
    if (place.used) {
      placeItem.classList.add("used");
    }

    // Add drag functionality
    placeItem.addEventListener("dragstart", (e) => {
      if (placeItem.classList.contains("used")) {
        e.preventDefault();
        return;
      }
      draggedElement = placeItem;
      isDraggingFromLeft = true;
      placeItem.classList.add("dragging");
    });

    placeItem.addEventListener("dragend", () => {
      placeItem.classList.remove("dragging");
      isDraggingFromLeft = false;
    });

    placesList.appendChild(placeItem);
  });
}

// Drag and Drop functionality
let draggedElement = null;
let isDraggingFromLeft = false;

selectedPlaces.addEventListener("dragover", (e) => {
  e.preventDefault();
});

selectedPlaces.addEventListener("drop", (e) => {
  e.preventDefault();

  // Only add new place if it's being dragged from the left panel
  if (draggedElement && isDraggingFromLeft && !draggedElement.classList.contains("used")) {
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

    // Mark as used in availablePlaces array
    const placeInList = availablePlaces.find(p => p.name === placeName);
    if (placeInList) {
      placeInList.used = true;
    }

    // Update both displays
    updatePlacesList();
    updateSelectedPlaces();
  }

  isDraggingFromLeft = false;
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
    placeDiv.innerHTML = `<span>${place.name}</span>`;

    // Use saved position
    placeDiv.style.top = place.y + "px";
    placeDiv.style.left = place.x + "px";

    let isDragging = false;

    // Make draggable within the right panel
    placeDiv.draggable = true;
    placeDiv.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      isDragging = true;
      isDraggingFromLeft = false; // This is a reposition, not adding a new place
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

      // Reset drag flag after a short delay
      setTimeout(() => {
        isDragging = false;
      }, 100);
    });

    // Click to delete (but not if we're dragging)
    placeDiv.addEventListener("click", () => {
      if (!isDragging) {
        removePlace(index);
      }
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

  // Remove from selected list
  selectedPlacesList.splice(index, 1);

  // Mark the place as available again in availablePlaces array
  const placeInList = availablePlaces.find(p => p.name === placeName);
  if (placeInList) {
    placeInList.used = false;
  }

  // Update both displays
  updatePlacesList();
  updateSelectedPlaces();
}

// Make removePlace available globally
window.removePlace = removePlace;