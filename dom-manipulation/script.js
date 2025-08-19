// Initial Quotes Database
let quotes = [
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Experience is the name everyone gives to their mistakes.", category: "Wisdom" },
  { text: "First, solve the problem. Then, write the code.", category: "Programming" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const formContainer = document.getElementById("formContainer");

//Populate categories dynamically
function populateCategories() {
  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear existing
  categorySelect.innerHTML = "";

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  // Add category options
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show Random Quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "All" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "⚠️ No quotes in this category yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    "${randomQuote.text}" 
    <div class="category">— ${randomQuote.category}</div>
  `;
}

//Add Quote Function
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both fields!");
    return;
  }

  // Push new quote into array
  quotes.push({ text: newText, category: newCategory });

  // Reset inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Refresh categories
  populateCategories();

  alert("New quote added successfully!");
}

// Dynamically Create Add Quote Form
function createAddQuoteForm() {
  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);
}

//Initialize
populateCategories();
createAddQuoteForm();
newQuoteBtn.addEventListener("click", showRandomQuote);
