/**
 * The AI Ghost Brain (Mocked Version)
 * 
 * In a production environment, this file would connect to MongoDB Atlas Vector Search
 * to retrieve codebase context, and then call the OpenAI API (GPT-4o) to generate
 * the code response.
 * 
 * For now, we are using a mocked response to build out the complex Yjs real-time
 * typing animation architecture safely.
 */

async function getAiResponse(prompt) {
  // Simulate network latency (OpenAI takes time to think)
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('bubble sort')) {
    return `
// Ghost AI: Here is your bubble sort implementation!
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
`;
  }
  
  if (lowerPrompt.includes('hello')) {
    return `\n// Ghost AI: Hello there, human! I am alive inside your editor.\n`;
  }

  // Default response if we don't recognize the prompt
  return `\n// Ghost AI: I heard you ask for "${prompt}", but I am currently in Mock Mode.\n// Try asking me for a "bubble sort"!\n`;
}

module.exports = { getAiResponse };
