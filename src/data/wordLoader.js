// Word loader utility to fetch words from CSV
export async function loadWordsFromCSV() {
  try {
    const response = await fetch('/src/data/spelling_bee_words.csv');
    const csvText = await response.text();
    
    // Parse CSV (assuming simple format: word,grade,definition)
    const lines = csvText.split('\n');
    const words = [];
    
    // Skip header row if present
    const startIndex = lines[0].toLowerCase().includes('word') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [word, grade, definition] = line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
        if (word) {
          words.push({
            word: word.toLowerCase(),
            grade: parseInt(grade) || 1,
            definition: definition || ''
          });
        }
      }
    }
    
    return words;
  } catch (error) {
    console.error('Error loading words from CSV:', error);
    // Fallback to default words
    return getDefaultWords();
  }
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