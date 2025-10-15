// Word loader utility to fetch words from CSV
// CSV format: Number,Word,Part of Speech,Definition,Alternate Spelling
export async function loadWordsFromCSV() {
  try {
    const response = await fetch('/src/data/spelling_bee_words.csv');
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    const words = [];
    
    // Skip header row if present
    const startIndex = lines[0].toLowerCase().includes('word') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Handle CSV parsing with potential commas in quoted fields
        // Format: Number,Word,Part of Speech,Definition,Alternate Spelling
        const matches = line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g);
        if (matches && matches.length >= 4) {
          const number = matches[0]?.replace(/^"|"$/g, '').trim(); // Skip the number column
          const word = matches[1]?.replace(/^"|"$/g, '').trim();
          const partOfSpeech = matches[2]?.replace(/^"|"$/g, '').trim();
          const definition = matches[3]?.replace(/^"|"$/g, '').trim();
          const alternateSpelling = matches.length > 4 ? matches[4]?.replace(/^"|"$/g, '').trim() : '';
          
          // Only include actual words (not numbers or empty)
          if (word && isValidWord(word)) {
            // Assign grade based on word length and complexity
            const grade = estimateGrade(word);
            
            words.push({
              word: word.toLowerCase(),
              grade: grade,
              definition: definition || 'A word to spell',
              partOfSpeech: partOfSpeech || '',
              alternateSpelling: alternateSpelling || ''
            });
          }
        }
      }
    }
    
    console.log(`Loaded ${words.length} valid words from CSV`);
    return words;
  } catch (error) {
    console.error('Error loading words from CSV:', error);
    // Fallback to default words
    return getDefaultWords();
  }
}

// Check if the input is a valid word (not a number)
function isValidWord(word) {
  // Remove any extra whitespace and quotes
  const cleanWord = word.trim().replace(/^"|"$/g, '');
  
  // Check if it's empty
  if (!cleanWord) return false;
  
  // Check if it's purely numeric (including decimals)
  if (/^\d+(\.\d+)?$/.test(cleanWord)) return false;
  
  // Check if it starts with a number
  if (/^\d/.test(cleanWord)) return false;
  
  // Check if it contains only letters, hyphens, apostrophes (valid word characters)
  if (!/^[a-zA-Z][a-zA-Z'\-\s]*$/.test(cleanWord)) return false;
  
  // Must be at least 2 characters long
  if (cleanWord.length < 2) return false;
  
  return true;
}

// Estimate grade level based on word characteristics
function estimateGrade(word) {
  const length = word.length;
  
  // Very simple words (2-3 letters)
  if (length <= 3) return 1;
  
  // Simple words (4-5 letters)
  if (length <= 5) return 2;
  
  // Medium words (6-7 letters)
  if (length <= 7) return 3;
  
  // Longer words (8-9 letters)
  if (length <= 9) return 4;
  
  // Complex words (10+ letters)
  return 5;
}

function getDefaultWords() {
  return [
    { word: 'cat', grade: 1, definition: 'A small furry animal' },
    { word: 'dog', grade: 1, definition: 'A loyal pet animal' },
    { word: 'house', grade: 2, definition: 'A place where people live' },
    { word: 'school', grade: 2, definition: 'A place for learning' },
    { word: 'computer', grade: 3, definition: 'An electronic device for processing data' }
  ];
}