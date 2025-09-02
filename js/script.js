let defaultCategories = {
  Quality: [{ key: "High Quality", value: "high quality, 8k, cinematic, realistic" }],
  Styles: [{ key: "Photorealistic", value: "photorealistic, realistic, sharp focus" }],
  Time: [{ key: "Morning", value: "morning, soft light" }],
  Lighting: [{ key: "Cinematic", value: "dramatic lighting, high contrast" }],
  Negative: [{ key: "Low Quality", value: "low quality, blurry, bad anatomy" }],
  Custom: [],
};
let categories = JSON.parse(localStorage.getItem("sdCategories") || "null") || defaultCategories;
let editContext = null; // {category, index}
function saveCategories() {
  localStorage.setItem("sdCategories", JSON.stringify(categories));
}

function getTokens(ta) {
  return ta.value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}
function setTokens(ta, tokens) {
  ta.value = tokens.join(", ");
}
function toLowercase(id) {
  let ta = document.getElementById(id);
  setTokens(
    ta,
    getTokens(ta).map((t) => t.toLowerCase())
  );
}
function dedupe(id) {
  let ta = document.getElementById(id);
  setTokens(ta, [...new Set(getTokens(ta).map((t) => t.toLowerCase()))]);
}
function formatPrompt(id) {
  dedupe(id);
}

/* ========== TREE BUILD ========== */
function buildTree(filter = "") {
  const container = document.getElementById("treeView");
  container.innerHTML = "";
  const promptBox = document.getElementById("promptBox");
  let promptTokens = getTokens(promptBox);

  for (let category in categories) {
    let catDiv = document.createElement("div");
    catDiv.className = "tree-category";
    catDiv.innerHTML = `<span>${category}</span>
      <div class="category-controls">
        <button title="Rename" class="btn btn-outline-secondary" onclick="renameCategory('${category}')"><i class="fa fa-pen"></i></button>
        <button title="Delete" class="btn btn-outline-danger" onclick="deleteCategory('${category}')"><i class="fa fa-trash"></i></button>
      </div>`;
    container.appendChild(catDiv);

    let itemDiv = document.createElement("div");
    itemDiv.className = "snippet-list";
    itemDiv.style.display = "block";

    categories[category].forEach((snippet, idx) => {
      if (snippet.key.toLowerCase().includes(filter.toLowerCase())) {
        let item = document.createElement("div");
        item.className = "tree-item";
        item.draggable = true;
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        let snippetTokens = snippet.value.split(",").map((t) => t.trim());
        checkbox.checked = snippetTokens.every((t) => promptTokens.includes(t));
        checkbox.addEventListener("change", () => {
          let tokens = getTokens(promptBox);
          if (checkbox.checked) {
            snippetTokens.forEach((t) => {
              if (!tokens.includes(t)) tokens.push(t);
            });
          } else tokens = tokens.filter((t) => !snippetTokens.includes(t));
          setTokens(promptBox, tokens);
          buildTree(document.getElementById("searchBox").value);
        });
        let label = document.createElement("span");
        label.innerText = snippet.key;
        let btnEdit = document.createElement("button");
        btnEdit.className = "btn btn-sm btn-outline-secondary ms-1";
        btnEdit.title = "Edit";
        btnEdit.innerHTML = '<i class="fa fa-pen"></i>';
        btnEdit.onclick = () => {
          editContext = { category, index: idx };
          document.getElementById("editKey").value = snippet.key;
          document.getElementById("editValue").value = snippet.value;
          new bootstrap.Modal(document.getElementById("editModal")).show();
        };
        let btnDel = document.createElement("button");
        btnDel.className = "btn btn-sm btn-outline-danger ms-1";
        btnDel.title = "Delete";
        btnDel.innerHTML = '<i class="fa fa-trash"></i>';
        btnDel.onclick = () => {
          if (confirm("Delete snippet?")) {
            categories[category].splice(idx, 1);
            saveCategories();
            buildTree();
          }
        };
        item.appendChild(checkbox);
        item.appendChild(label);
        item.appendChild(btnEdit);
        item.appendChild(btnDel);

        // Drag and drop
        item.addEventListener("dragstart", (e) => {
          item.classList.add("dragging");
          e.dataTransfer.setData("text/plain", category + ":" + idx);
        });
        item.addEventListener("dragend", (e) => {
          item.classList.remove("dragging");
          buildTree(document.getElementById("searchBox").value);
        });
        itemDiv.appendChild(item);
      }
    });

    // Drag and drop listeners
    itemDiv.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    itemDiv.addEventListener("drop", (e) => {
      e.preventDefault();
      let data = e.dataTransfer.getData("text/plain").split(":");
      let srcCat = data[0];
      let srcIdx = parseInt(data[1]);
      let moved = categories[srcCat].splice(srcIdx, 1)[0];
      categories[category].push(moved);
      saveCategories();
      buildTree(document.getElementById("searchBox").value);
    });

    container.appendChild(itemDiv);
  }
}

function renameCategory(oldName) {
  let newName = prompt("Rename category:", oldName);
  if (newName && !categories[newName]) {
    categories[newName] = categories[oldName];
    delete categories[oldName];
    saveCategories();
    buildTree();
  } else alert("Invalid or duplicate name.");
}
function deleteCategory(name) {
  if (confirm("Delete category?")) {
    delete categories[name];
    saveCategories();
    buildTree();
  }
}
function addCategory() {
  let name = document.getElementById("newCategoryName").value.trim();
  if (name && !categories[name]) {
    categories[name] = [];
    saveCategories();
    buildTree();
  }
}
function saveEdit() {
  if (editContext) {
    let { category, index } = editContext;
    categories[category][index] = { key: document.getElementById("editKey").value, value: document.getElementById("editValue").value };
    saveCategories();
    buildTree();
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
  }
}

function exportCategories() {
  let blob = new Blob([JSON.stringify(categories)], { type: "application/json" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "categories.json";
  a.click();
  URL.revokeObjectURL(url);
}
function importCategories(e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (ev) {
    categories = JSON.parse(ev.target.result);
    saveCategories();
    buildTree();
  };
  reader.readAsText(file);
}

document.getElementById("searchBox").addEventListener("input", (e) => buildTree(e.target.value));

/* ==== SLOT MANAGEMENT ==== */
function loadSlots() {
  const slotsDiv = document.getElementById("slots");
  slotsDiv.innerHTML = "";
  let saved = JSON.parse(localStorage.getItem("sdSlots") || "[]");

  saved.forEach((slot, idx) => {
    let btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-info slot-btn";
    btn.innerText = slot.name || `Slot ${idx + 1}`;
    btn.title = `Click to load: ${slot.name || `Slot ${idx + 1}`}`;

    btn.onclick = () => {
      document.getElementById("promptBox").value = slot.prompt;
      document.getElementById("negPromptBox").value = slot.negative;
      buildTree(document.getElementById("searchBox").value);
    };

    // Optional: right-click to delete a slot
    btn.oncontextmenu = (e) => {
      e.preventDefault();
      if (confirm(`Delete saved prompt "${slot.name || `Slot ${idx + 1}`}"?`)) {
        saved.splice(idx, 1);
        localStorage.setItem("sdSlots", JSON.stringify(saved));
        loadSlots();
      }
    };

    slotsDiv.appendChild(btn);
  });
}

function saveCurrent() {
  const prompt = document.getElementById("promptBox").value;
  const negative = document.getElementById("negPromptBox").value;

  if (!prompt && !negative) {
    alert("Cannot save empty prompt.");
    return;
  }

  const name = promptUserForSlotName();
  if (!name) return;

  let saved = JSON.parse(localStorage.getItem("sdSlots") || "[]");
  saved.push({ name, prompt, negative });
  localStorage.setItem("sdSlots", JSON.stringify(saved));
  loadSlots();
}

// Helper function to prompt for a slot name
function promptUserForSlotName() {
  let name = prompt("Enter a name for this prompt:");
  if (name) return name.trim();
  return null;
}

function clearSlots() {
  if (confirm("Are you sure you want to delete all saved prompts?")) {
    localStorage.removeItem("sdSlots");
    loadSlots();
  }
}

function exportPrompts() {
  let saved = localStorage.getItem("sdSlots") || "[]";
  let blob = new Blob([saved], { type: "application/json" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "prompts.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importPrompts(e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      if (Array.isArray(imported)) {
        localStorage.setItem("sdSlots", JSON.stringify(imported));
        loadSlots();
      } else {
        alert("Invalid JSON file.");
      }
    } catch (err) {
      alert("Error parsing JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

/* ==== PNG DROP ==== */
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});
function handleFile(file) {
  if (file.type !== "image/png") {
    alert("Please drop a PNG");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const bytes = new Uint8Array(e.target.result);
    let textChunks = [];
    let i = 8;
    while (i < bytes.length) {
      let length = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
      let type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
      let data = bytes.slice(i + 8, i + 8 + length);
      if (["tEXt", "iTXt", "zTXt"].includes(type)) {
        let chunkText = new TextDecoder().decode(data);
        if (chunkText.includes("parameters") || chunkText.includes("prompt")) textChunks.push(chunkText);
      }
      i += 12 + length;
    }
    document.getElementById("imagePromptBox").value = textChunks.join("\n---\n") || "No prompt metadata found.";
  };
  reader.readAsArrayBuffer(file);
}
function addSelectionToSnippets() {
  let ta = document.getElementById("imagePromptBox");
  let sel = ta.value.substring(ta.selectionStart, ta.selectionEnd).trim();
  if (sel.length > 0) {
    categories["Custom"].push({ key: sel, value: sel });
    saveCategories();
    buildTree();
  } else alert("Select text first.");
}

function initDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  const saved = localStorage.getItem("bsTheme");

  // Set initial theme
  if (saved) {
    document.body.setAttribute("data-bs-theme", saved);
    toggle.checked = saved === "dark";
  } else {
    // Default to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.setAttribute("data-bs-theme", prefersDark ? "dark" : "light");
    toggle.checked = prefersDark;
  }

  // Listen for toggle
  toggle.addEventListener("change", () => {
    const theme = toggle.checked ? "dark" : "light";
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem("bsTheme", theme);
  });
}

/* ==== INIT ==== */
initDarkMode();
buildTree();
loadSlots();
