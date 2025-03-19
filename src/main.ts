import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { db } from "./db";
import { kv } from "./db/schema";
import { eq } from "drizzle-orm";
import { migrate } from "./db/migrate";

// Initialize the app with HTML that includes the KV store interface
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">
          <div class="flex items-center space-x-5">
            <a href="https://vite.dev" target="_blank">
              <img src="${viteLogo}" class="h-12 w-auto" alt="Vite logo" />
            </a>
            <a href="https://www.typescriptlang.org/" target="_blank">
              <img src="${typescriptLogo}" class="h-12 w-auto" alt="TypeScript logo" />
            </a>
            <div class="text-2xl font-semibold text-gray-900">
              <h1>Drizzle KV Store</h1>
            </div>
          </div>
          
          <div class="divide-y divide-gray-200">
            <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <form id="kv-form" class="space-y-4">
                <div class="flex flex-col">
                  <label for="key" class="text-sm font-medium text-gray-700">Key</label>
                  <input id="key-input" type="text" placeholder="Enter key" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div class="flex flex-col">
                  <label for="value" class="text-sm font-medium text-gray-700">Value</label>
                  <input id="value-input" type="text" placeholder="Enter value" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <button type="submit" 
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Save
                </button>
              </form>
            </div>
            
            <div class="py-6">
              <h3 class="text-lg font-medium text-gray-900">Stored Key-Value Pairs</h3>
              <div id="kv-list" class="mt-4 space-y-2">
                <p class="text-sm text-gray-500">Loading data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Function to render the KV pairs
async function renderKVPairs() {
  //! we migrate here because its before the first query
  await migrate(db);
  const kvPairs = await db.select().from(kv);
  const kvListElement = document.getElementById("kv-list")!;

  if (kvPairs.length === 0) {
    kvListElement.innerHTML = `<p class="text-sm text-gray-500">No key-value pairs stored yet.</p>`;
    return;
  }

  kvListElement.innerHTML = kvPairs
    .map(
      (pair) => `
    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <div>
        <span class="font-medium text-indigo-600">${pair.key}:</span>
        <span class="ml-2 text-gray-700">${pair.value}</span>
      </div>
      <button data-key="${pair.key}" class="delete-btn text-red-600 hover:text-red-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  `
    )
    .join("");

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const keyToDelete = (e.currentTarget as HTMLButtonElement).dataset.key;
      if (keyToDelete) {
        await db.delete(kv).where(eq(kv.key, keyToDelete));
        await renderKVPairs();
      }
    });
  });
}

// Handle form submission
document.getElementById("kv-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const keyInput = document.getElementById("key-input") as HTMLInputElement;
  const valueInput = document.getElementById("value-input") as HTMLInputElement;

  const keyValue = keyInput.value.trim();
  const valueValue = valueInput.value.trim();

  if (!keyValue || !valueValue) return;

  try {
    // Upsert - insert or update if key already exists
    await db
      .insert(kv)
      .values({ key: keyValue, value: valueValue })
      .onConflictDoUpdate({
        target: kv.key,
        set: { value: valueValue },
      });

    // Clear inputs and refresh list
    keyInput.value = "";
    valueInput.value = "";
    await renderKVPairs();
  } catch (error) {
    console.error("Error saving key-value pair:", error);
  }
});

// Initial rendering of KV pairs
renderKVPairs().catch(console.error);
