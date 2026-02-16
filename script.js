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

    let isDragging = false;

    // Add drag functionality
    placeItem.addEventListener("dragstart", (e) => {
      if (placeItem.classList.contains("used")) {
        e.preventDefault();
        return;
      }
      isDragging = true;
      draggedElement = placeItem;
      isDraggingFromLeft = true;
      placeItem.classList.add("dragging");
    });

    placeItem.addEventListener("dragend", () => {
      placeItem.classList.remove("dragging");
      isDraggingFromLeft = false;

      // Reset drag flag after a short delay
      setTimeout(() => {
        isDragging = false;
      }, 100);
    });

    // Click to delete from available places
    placeItem.addEventListener("click", () => {
      if (!isDragging) {
        deletePlaceFromList(place.name);
      }
    });

    placesList.appendChild(placeItem);
  });
}

function deletePlaceFromList(placeName) {
  // Remove from available places
  availablePlaces = availablePlaces.filter(p => p.name !== placeName);

  // Update display
  updatePlacesList();
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

    // Add to selected list with position and default time
    selectedPlacesList.push({
      name: placeName,
      x: Math.max(0, Math.min(x, rect.width - 150)),
      y: Math.max(0, Math.min(y, rect.height - 60)),
      time: { hour: "08", minute: "00" }
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
    // Create wrapper to hold both place and time
    const wrapper = document.createElement("div");
    wrapper.className = "place-time-wrapper";
    wrapper.style.position = "absolute";
    wrapper.style.top = place.y + "px";
    wrapper.style.left = place.x + "px";

    // Create place div
    const placeDiv = document.createElement("div");
    placeDiv.className = "selected-place";
    placeDiv.setAttribute("data-index", index);
    placeDiv.innerHTML = `<span>${place.name}</span>`;

    // Create time div
    const timeDiv = document.createElement("div");
    timeDiv.className = "time-container";
    timeDiv.innerHTML = `
      <span class="time-hour">${place.time.hour}</span>
      <span class="time-separator">:</span>
      <span class="time-minute">${place.time.minute}</span>
    `;

    // Handle time editing with drag
    const hourSpan = timeDiv.querySelector(".time-hour");
    const minuteSpan = timeDiv.querySelector(".time-minute");

    // iOS-style drag to change time
    function setupTimeDrag(element, type) {
      let startY = 0;
      let currentValue = 0;
      let isDraggingTime = false;

      element.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        e.preventDefault();
        isDraggingTime = true;
        startY = e.clientY;
        currentValue = parseInt(type === "hour" ? place.time.hour : place.time.minute);
        element.classList.add("time-dragging");
        wrapper.draggable = false; // Disable wrapper drag while adjusting time
      });

      let lastValue = currentValue;

      document.addEventListener("mousemove", (e) => {
        if (!isDraggingTime) return;

        const deltaY = startY - e.clientY;
        const steps = Math.floor(deltaY / 10); // Every 10px of drag = 1 unit change

        let newValue = currentValue + steps;

        if (type === "hour") {
          newValue = (newValue + 24) % 24; // Wrap around 0-23
          if (newValue !== lastValue) {
            element.classList.add("flip-animation");
            setTimeout(() => element.classList.remove("flip-animation"), 200);
            lastValue = newValue;
          }
          place.time.hour = newValue.toString().padStart(2, "0");
          element.textContent = place.time.hour;
        } else {
          newValue = (newValue + 60) % 60; // Wrap around 0-59
          if (newValue !== lastValue) {
            element.classList.add("flip-animation");
            setTimeout(() => element.classList.remove("flip-animation"), 200);
            lastValue = newValue;
          }
          place.time.minute = newValue.toString().padStart(2, "0");
          element.textContent = place.time.minute;
        }
      });

      document.addEventListener("mouseup", () => {
        if (isDraggingTime) {
          isDraggingTime = false;
          element.classList.remove("time-dragging");
          wrapper.draggable = true; // Re-enable wrapper drag
        }
      });
    }

    setupTimeDrag(hourSpan, "hour");
    setupTimeDrag(minuteSpan, "minute");

    // Prevent deletion when clicking on time
    timeDiv.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    wrapper.appendChild(placeDiv);
    wrapper.appendChild(timeDiv);

    let isDragging = false;

    // Make wrapper draggable
    wrapper.draggable = true;
    wrapper.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      isDragging = true;
      isDraggingFromLeft = false;
      wrapper.style.opacity = "0.5";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", index);
    });

    wrapper.addEventListener("dragend", (e) => {
      wrapper.style.opacity = "1";

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

    selectedPlaces.appendChild(wrapper);
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

// Download ICS file
const downloadBtn = document.querySelector(".continue-btn");
downloadBtn.addEventListener("click", () => {
  if (selectedPlacesList.length === 0) {
    alert("Add some places to your itinerary first!");
    return;
  }

  const today = new Date();
  const dateStr = today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DatePlanner//EN\r\n";

  // Sort places by time before generating events
  const sorted = [...selectedPlacesList].sort((a, b) => {
    const timeA = parseInt(a.time.hour) * 60 + parseInt(a.time.minute);
    const timeB = parseInt(b.time.hour) * 60 + parseInt(b.time.minute);
    return timeA - timeB;
  });

  sorted.forEach((place, i) => {
    const startTime = dateStr + "T" + place.time.hour + place.time.minute + "00";

    // End time: next place's time, or 1 hour after start
    let endTime;
    if (i < sorted.length - 1) {
      endTime = dateStr + "T" + sorted[i + 1].time.hour + sorted[i + 1].time.minute + "00";
    } else {
      const endHour = (parseInt(place.time.hour) + 1) % 24;
      endTime = dateStr + "T" + endHour.toString().padStart(2, "0") + place.time.minute + "00";
    }

    icsContent += "BEGIN:VEVENT\r\n";
    icsContent += "DTSTART:" + startTime + "\r\n";
    icsContent += "DTEND:" + endTime + "\r\n";
    icsContent += "SUMMARY:" + place.name + "\r\n";
    icsContent += "END:VEVENT\r\n";
  });

  icsContent += "END:VCALENDAR\r\n";

  // Download the file
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "date-itinerary.ics";
  link.click();
  URL.revokeObjectURL(link.href);
});