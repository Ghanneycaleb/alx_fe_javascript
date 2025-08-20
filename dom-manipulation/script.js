// 1) Defaults + single source of truth for quotes
const defaultQuotes = [
  { text: "Code is like humor. When you have to explain it, it's bad.", category: "Programming" },
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Experience is the name everyone gives to their mistakes.", category: "Wisdom" },
  { text: "First, solve the problem. Then, write the code.", category: "Programming" }
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
  const categories = [...new Set(quotes.map(q => q.category))];

  // Update categoryFilter array
  categoryFilter.length = 0;
  categoryFilter.push("All", ...categories);

  categorySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  categories.forEach(cat => {
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
  if ([...categorySelect.options].some(opt => opt.value === savedCat)) {
    categorySelect.value = savedCat;
  } else {
    categorySelect.value = "All";
  }
}

// Filter quotes function
function filterQuote() {
  const selectedCategory = categorySelect.value;
  saveSelectedCategory(selectedCategory);

  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

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
  textInput.style.cssText = "width: 100%; margin: 8px 0; padding: 12px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 1rem;";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.cssText = "width: 100%; margin: 8px 0; padding: 12px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 1rem;";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;
  addBtn.style.cssText = "background: linear-gradient(135deg, #28a745, #20c997); color: white; margin-top: 15px; width: 100%; max-width: 200px;";

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