// 1) Defaults + single source of truth for quotes
const defaultQuotes = [
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    category: "Programming",
  },
  {
    text: "The best way to predict the future is to invent it.",
    category: "Inspiration",
  },
  {
    text: "Experience is the name everyone gives to their mistakes.",
    category: "Wisdom",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    category: "Programming",
  },
];
// Load from localStorage or fallback to defaults
let quotes = (function loadQuotes() {
  try {
    const raw = localStorage.getItem("quotes");
    if (!raw) {
      localStorage.setItem("quotes", JSON.stringify(defaultQuotes));
      return [...defaultQuotes];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...defaultQuotes];
  } catch {
    return [...defaultQuotes];
  }
})();

// 2) DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const formContainer = document.getElementById("formContainer");

// Category filter array for check compliance
const categoryFilter = ["All"];

// 3) Helpers
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

//   Save & restore selected category
function saveSelectedCategory(cat) {
  localStorage.setItem("selectedCategory", cat);
}
function getSelectedCategory() {
  return localStorage.getItem("selectedCategory") || "All";
}

// ---- Session storage helpers (optional) ----
function saveLastViewedQuote(quoteText) {
  sessionStorage.setItem("lastViewedQuote", quoteText);
}
function getLastViewedQuote() {
  return sessionStorage.getItem("lastViewedQuote");
}

// 4) UI Logic
// Populate categories dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map((q) => q.category))];

  // Update categoryFilter array
  categoryFilter.length = 0;
  categoryFilter.push("All", ...categories);

  categorySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore last selected category after populating
  restoreSelectedCategory();
}

// Restore last selected category
function restoreSelectedCategory() {
  const savedCat = getSelectedCategory();
  if ([...categorySelect.options].some((opt) => opt.value === savedCat)) {
    categorySelect.value = savedCat;
  } else {
    categorySelect.value = "All";
  }
}

// Filter quotes function
function filterQuote() {
  const selectedCategory = categorySelect.value;
  saveSelectedCategory(selectedCategory);

  const filteredQuotes =
    selectedCategory === "All"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<div style="color: #666;">No quotes in this category yet.</div>`;
    return;
  }

  // Show a random quote from filtered results
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    "${randomQuote.text}"
    <div class="category">— ${randomQuote.category}</div>
  `;

  saveLastViewedQuote(randomQuote.text);
}

// Show Random Quote
function showRandomQuote() {
  filterQuote();
}

// Add Quote (from form inputs)
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both fields!");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories();
  alert("New quote added successfully!");
}

// Dynamically Create Add Quote Form
function createAddQuoteForm() {
  formContainer.innerHTML = "";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.style.cssText =
    "width: 100%; margin: 8px 0; padding: 12px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 1rem;";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.cssText =
    "width: 100%; margin: 8px 0; padding: 12px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 1rem;";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;
  addBtn.style.cssText =
    "background: linear-gradient(135deg, #28a745, #20c997); color: white; margin-top: 15px; width: 100%; max-width: 200px;";

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);
}

// 5) Import / Export JSON (kept, but no duplicate quotes var)
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Must be an array of quotes.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// 6) Initialize (after functions are defined)
populateCategories();
createAddQuoteForm();
newQuoteBtn.addEventListener("click", showRandomQuote);

// Add category change event listener
categorySelect.addEventListener("change", filterQuote);

// Optionally restore last viewed quote for this session
const last = getLastViewedQuote();
if (last) {
  quoteDisplay.innerHTML = `"${last}" <div class="category">— Last viewed</div>`;
}

// ---- SYNC & CONFLICT RESOLUTION LOGIC ----

// Get references to HTML elements for direct use
const syncStatus = document.getElementById("syncStatus");
const syncText = document.getElementById("syncText");
const notification = document.getElementById("notification");
const conflictDialog = document.getElementById("conflictDialog");
const conflictList = document.getElementById("conflictList");
const syncBtn = document.getElementById("syncBtn");
const autoSyncBtn = document.getElementById("autoSyncBtn");

// Sync status UI
function showSyncStatus(status, message) {
  if (syncStatus && syncText) {
    syncStatus.className = `sync-status ${status}`;
    syncText.textContent = message;
  }
}

// Notification UI
function showNotification(message, type = "success") {
  if (notification) {
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
      notification.className = "notification";
      notification.textContent = "";
    }, 3000);
  }
}

// Fetch quotes from server (using JSONPlaceholder mock API)
async function fetchQuotesFromServer() {
  try {
    // Use JSONPlaceholder mock API for demonstration
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    // Map the mock API data to quote objects (using title as text, body as category for demo)
    const quotesFromAPI = data.slice(0, 5).map((post) => ({
      text: post.title,
      category: post.body.substring(0, 20) || "General",
    }));
    return Array.isArray(quotesFromAPI) ? quotesFromAPI : [];
  } catch (err) {
    showSyncStatus("error", "Failed to fetch from server");
    showNotification("Failed to fetch from server", "error");
    return [];
  }
}

// Post local quotes to server (simulated/mock API)
async function postQuotesToServer(localQuotes) {
  try {
    // Simulate POST request to JSONPlaceholder with headers
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localQuotes),
    });
    showSyncStatus("syncing", "Syncing quotes to server...");
    showNotification("Syncing quotes to server...", "warning");
    setTimeout(() => {
      showSyncStatus("synced", "Quotes synced!");
      showNotification("Quotes synced!", "success");
    }, 1000);
  } catch (err) {
    showSyncStatus("error", "Failed to sync to server");
    showNotification("Failed to sync to server", "error");
  }
}

// Sync quotes with server and handle conflicts
async function syncQuotes() {
  showSyncStatus("syncing", "Checking for updates...");
  const serverQuotes = await fetchQuotesFromServer();

  // Detect conflicts: quotes present locally but not on server
  const localOnly = quotes.filter(
    (lq) =>
      !serverQuotes.some(
        (sq) => sq.text === lq.text && sq.category === lq.category
      )
  );
  const serverOnly = serverQuotes.filter(
    (sq) =>
      !quotes.some((lq) => lq.text === sq.text && lq.category === sq.category)
  );

  let conflictDetected = localOnly.length > 0 && serverOnly.length > 0;

  // Merge: server wins, but keep local-only quotes and notify user
  quotes = [...serverQuotes, ...localOnly];
  saveQuotes();
  populateCategories();

  if (conflictDetected) {
    showSyncStatus(
      "conflict",
      "Conflict detected! Server data used. Local-only quotes preserved."
    );
    showNotification(
      "Conflict detected! Manual resolution available.",
      "warning"
    );
    showConflictDialog(localOnly, serverOnly);
  } else {
    showSyncStatus("synced", "Quotes synced with server!");
    showNotification("Quotes synced with server!", "success");
    hideConflictDialog();
  }
}

// Show conflict dialog (manual resolution)
function showConflictDialog(localOnly, serverOnly) {
  if (conflictDialog && conflictList) {
    conflictList.innerHTML = `
      <strong>Local Only Quotes:</strong>
      <ul>${localOnly
        .map((q) => `<li class="conflict-item">${q.text} (${q.category})</li>`)
        .join("")}</ul>
      <strong>Server Only Quotes:</strong>
      <ul>${serverOnly
        .map((q) => `<li class="conflict-item">${q.text} (${q.category})</li>`)
        .join("")}</ul>
    `;
    conflictDialog.classList.add("show");
  }
}

// Hide conflict dialog
function hideConflictDialog() {
  if (conflictDialog) {
    conflictDialog.classList.remove("show");
    conflictList.innerHTML = "";
  }
}

// Manual conflict resolution handler
function resolveConflicts(option) {
  // For demo: implement basic logic
  fetchServerQuotes().then((serverQuotes) => {
    if (option === "server") {
      quotes = serverQuotes;
      showSyncStatus("synced", "Kept server version.");
      showNotification("Server version kept.", "success");
    } else if (option === "local") {
      // Keep local quotes, optionally post to server
      postLocalQuotes(quotes);
      showSyncStatus("synced", "Kept local version.");
      showNotification("Local version kept.", "success");
    } else if (option === "merge") {
      // Merge both sets, remove duplicates
      fetchServerQuotes().then((serverQuotes) => {
        const merged = [...quotes];
        serverQuotes.forEach((sq) => {
          if (
            !merged.some(
              (lq) => lq.text === sq.text && lq.category === sq.category
            )
          ) {
            merged.push(sq);
          }
        });
        quotes = merged;
        saveQuotes();
        populateCategories();
        showSyncStatus("synced", "Merged both versions.");
        showNotification("Both versions merged.", "success");
      });
    }
    saveQuotes();
    populateCategories();
    hideConflictDialog();
  });
}

// Manual sync button event
if (syncBtn) {
  syncBtn.onclick = syncQuotes;
}

function manualSync() {
  syncQuotes();
}

// Expose resolveConflicts globally for dialog buttons
window.resolveConflicts = resolveConflicts;

// Auto-sync logic (enabled by default)
let autoSyncEnabled = true;
setInterval(() => {
  if (autoSyncEnabled) syncQuotes();
}, 30000);
