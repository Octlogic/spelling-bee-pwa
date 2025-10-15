// File processing utility for word list uploads
class FileProcessor {
    constructor() {
        this.supportedFormats = ['.pdf', '.md', '.txt', '.json'];
    }

    async processFile(file) {
        const extension = this.getFileExtension(file.name);
        
        switch (extension) {
            case '.txt':
                return await this.processTxtFile(file);
            case '.md':
                return await this.processMarkdownFile(file);
            case '.json':
                return await this.processJsonFile(file);
            case '.pdf':
                return await this.processPdfFile(file);
            default:
                throw new Error(`Unsupported file format: ${extension}`);
        }
    }

    getFileExtension(filename) {
        return filename.toLowerCase().substring(filename.lastIndexOf('.'));
    }

    async processTxtFile(file) {
        const text = await this.readFileAsText(file);
        return this.parseTextContent(text);
    }

    async processMarkdownFile(file) {
        const text = await this.readFileAsText(file);
        return this.parseMarkdownContent(text);
    }

    async processJsonFile(file) {
        const text = await this.readFileAsText(file);
        try {
            const data = JSON.parse(text);
            return this.normalizeJsonData(data);
        } catch (error) {
            throw new Error('Invalid JSON format');
        }
    }

    async processPdfFile(file) {
        // For PDF processing, we'll need a PDF library
        // For now, we'll show an error with instructions
        throw new Error('PDF processing requires additional setup. Please convert your PDF to TXT or MD format for now.');
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    parseTextContent(text) {
        const words = [];
        const lines = text.split('\n');
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // Try different formats:
            // Format 1: "word - definition"
            // Format 2: "word: definition"  
            // Format 3: "word (grade) - definition"
            // Format 4: just "word"
            
            const patterns = [
                /^(.+?)\s*\((\d+)\)\s*[-:]\s*(.+)$/, // word (grade) - definition
                /^(.+?)\s*[-:]\s*(.+)$/, // word - definition
                /^([a-zA-Z]+)$/ // just word
            ];
            
            let match;
            for (let pattern of patterns) {
                match = line.match(pattern);
                if (match) break;
            }
            
            if (match) {
                if (match.length === 4) {
                    // word (grade) - definition
                    words.push({
                        word: match[1].trim(),
                        definition: match[3].trim(),
                        grade: parseInt(match[2]) || this.inferGrade(match[1].trim())
                    });
                } else if (match.length === 3) {
                    // word - definition
                    words.push({
                        word: match[1].trim(),
                        definition: match[2].trim(),
                        grade: this.inferGrade(match[1].trim())
                    });
                } else if (match.length === 2) {
                    // just word
                    words.push({
                        word: match[1].trim(),
                        definition: `Definition for ${match[1].trim()}`,
                        grade: this.inferGrade(match[1].trim())
                    });
                }
            }
        }
        
        return words;
    }

    parseMarkdownContent(text) {
        const words = [];
        const lines = text.split('\n');
        
        let currentGrade = null;
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // Check for grade headers: ## Grade 6, # 6th Grade, etc.
            const gradeHeader = line.match(/^#+\s*(?:Grade\s*)?(\d+)(?:th|st|nd|rd)?\s*Grade?/i);
            if (gradeHeader) {
                currentGrade = parseInt(gradeHeader[1]);
                continue;
            }
            
            // Check for list items or word entries
            const patterns = [
                /^[-*]\s*(.+?)\s*[-:]\s*(.+)$/, // - word - definition
                /^[-*]\s*(.+)$/, // - word
                /^\d+\.\s*(.+?)\s*[-:]\s*(.+)$/, // 1. word - definition
                /^\d+\.\s*(.+)$/, // 1. word
                /^(.+?)\s*[-:]\s*(.+)$/ // word - definition
            ];
            
            let match;
            for (let pattern of patterns) {
                match = line.match(pattern);
                if (match) break;
            }
            
            if (match) {
                const word = match[1].trim();
                const definition = match[2] ? match[2].trim() : `Definition for ${word}`;
                const grade = currentGrade || this.inferGrade(word);
                
                words.push({ word, definition, grade });
            }
        }
        
        return words;
    }

    normalizeJsonData(data) {
        if (Array.isArray(data)) {
            return data.map(item => this.normalizeWordItem(item));
        } else if (data.words && Array.isArray(data.words)) {
            return data.words.map(item => this.normalizeWordItem(item));
        } else {
            throw new Error('JSON must contain an array of words or an object with a "words" array');
        }
    }

    normalizeWordItem(item) {
        if (typeof item === 'string') {
            return {
                word: item,
                definition: `Definition for ${item}`,
                grade: this.inferGrade(item)
            };
        } else if (typeof item === 'object') {
            return {
                word: item.word || item.spelling || item.text,
                definition: item.definition || item.meaning || item.desc || `Definition for ${item.word}`,
                grade: item.grade || item.level || this.inferGrade(item.word)
            };
        }
        throw new Error('Invalid word item format');
    }

    inferGrade(word) {
        // Simple heuristic based on word length and complexity
        if (!word) return 6;
        
        const length = word.length;
        if (length <= 6) return 6;
        if (length <= 9) return 7;
        return 8;
    }

    validateWords(words) {
        const validWords = [];
        const errors = [];
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            if (!word.word || typeof word.word !== 'string') {
                errors.push(`Row ${i + 1}: Missing or invalid word`);
                continue;
            }
            
            if (!word.definition || typeof word.definition !== 'string') {
                word.definition = `Definition for ${word.word}`;
            }
            
            if (!word.grade || typeof word.grade !== 'number' || word.grade < 1 || word.grade > 12) {
                word.grade = this.inferGrade(word.word);
            }
            
            // Clean up the word
            word.word = word.word.trim().toLowerCase();
            word.definition = word.definition.trim();
            
            // Check for duplicates
            if (validWords.find(w => w.word === word.word)) {
                errors.push(`Row ${i + 1}: Duplicate word "${word.word}"`);
                continue;
            }
            
            validWords.push(word);
        }
        
        return { validWords, errors };
    }
}

// Make it available globally
window.FileProcessor = FileProcessor;