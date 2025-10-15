// Spelling Bee App - Main JavaScript
class SpellingBeeApp {
    constructor() {
        // App state
        this.words = [];
        this.currentWords = [];
        this.currentWordIndex = 0;
        this.score = 0;
        this.sessionWords = [];
        this.isPlaying = false;
        this.selectedGrade = 'all';
        this.uploadedWords = [];
        this.fileProcessor = new FileProcessor();
        
        // DOM elements
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            quiz: document.getElementById('quiz-screen'),
            results: document.getElementById('results-screen')
        };
        
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            playWordBtn: document.getElementById('play-word-btn'),
            spellingInput: document.getElementById('spelling-input'),
            submitBtn: document.getElementById('submit-btn'),
            hintBtn: document.getElementById('hint-btn'),
            feedback: document.getElementById('feedback'),
            questionCounter: document.getElementById('question-counter'),
            scoreDisplay: document.getElementById('score-display'),
            finalScore: document.getElementById('final-score'),
            encouragementMessage: document.getElementById('encouragement-message'),
            playAgainBtn: document.getElementById('play-again-btn'),
            homeBtn: document.getElementById('home-btn'),
            hintModal: document.getElementById('hint-modal'),
            hintText: document.getElementById('hint-text'),
            closeHintBtn: document.getElementById('close-hint-btn'),
            closeBtnX: document.querySelector('.close-btn'),
            loading: document.getElementById('loading'),
            gradeButtons: document.querySelectorAll('.grade-btn'),
            uploadBtn: document.getElementById('upload-btn'),
            fileInput: document.getElementById('word-file-input'),
            uploadStatus: document.getElementById('upload-status')
        };
        
        // Speech synthesis
        this.speechSynth = window.speechSynthesis;
        this.voice = null;
        this.isSpeaking = false;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoading();
            await this.loadWords();
            this.loadUploadedWords();
            this.initSpeechSynthesis();
            this.setupEventListeners();
            this.hideLoading();
            
            // Register service worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(() => console.log('Service Worker registered'))
                    .catch(err => console.log('Service Worker registration failed:', err));
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hideLoading();
            alert('Failed to load the spelling bee app. Please refresh the page.');
        }
    }
    
    async loadWords() {
        try {
            // Try to load from localStorage first
            const cachedWords = localStorage.getItem('spellingBeeWords');
            if (cachedWords) {
                this.words = JSON.parse(cachedWords);
                return;
            }
            
            // Load from CSV file
            const response = await fetch('./src/data/spelling_bee_words.csv');
            if (!response.ok) {
                throw new Error('Failed to fetch CSV file');
            }
            
            const csvText = await response.text();
            this.words = this.parseCSV(csvText);
            
            // Cache for offline use
            localStorage.setItem('spellingBeeWords', JSON.stringify(this.words));
            
        } catch (error) {
            console.error('Error loading words:', error);
            // Fallback word list in case of error
            this.words = [
                {"word": "cat", "definition": "A furry pet animal that meows", "grade": 1},
                {"word": "dog", "definition": "A furry pet animal that barks", "grade": 1},
                {"word": "sun", "definition": "The bright star that lights up the day", "grade": 2},
                {"word": "moon", "definition": "The bright object we see in the night sky", "grade": 2},
                {"word": "tree", "definition": "A tall plant with leaves and branches", "grade": 2}
            ];
        }
    }
    
    parseCSV(csvText) {
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
                    if (word && this.isValidWord(word)) {
                        // Assign grade based on word length and complexity
                        const grade = this.estimateGrade(word);
                        
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
    }
    
    // Check if the input is a valid word (not a number)
    isValidWord(word) {
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
    estimateGrade(word) {
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
    
    initSpeechSynthesis() {
        if (this.speechSynth) {
            // Wait for voices to load
            this.speechSynth.addEventListener('voiceschanged', () => {
                this.setOptimalVoice();
            });
            
            // Set voice immediately if already loaded
            this.setOptimalVoice();
        }
    }
    
    setOptimalVoice() {
        const voices = this.speechSynth.getVoices();
        
        // Prefer English voices, especially kid-friendly ones
        const preferredVoices = [
            'Samantha',     // iOS
            'Karen',        // macOS
            'Hazel',        // macOS
            'Moira',        // macOS
            'Microsoft Zira Desktop - English (United States)',  // Windows
            'Google US English Female', // Android Chrome
            'English United States'
        ];
        
        for (const preferredName of preferredVoices) {
            const voice = voices.find(v => 
                v.name.includes(preferredName) || 
                v.name === preferredName
            );
            if (voice && voice.lang.startsWith('en')) {
                this.voice = voice;
                return;
            }
        }
        
        // Fallback to any English voice
        this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
    
    setupEventListeners() {
        // Screen navigation
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.playAgainBtn.addEventListener('click', () => this.startGame());
        this.elements.homeBtn.addEventListener('click', () => this.showWelcome());
        
        // Quiz interactions
        this.elements.playWordBtn.addEventListener('click', () => this.pronounceCurrentWord());
        this.elements.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.elements.hintBtn.addEventListener('click', () => this.showHint());
        
        // Input handling
        this.elements.spellingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // Hint modal
        this.elements.closeHintBtn.addEventListener('click', () => this.hideHint());
        this.elements.closeBtnX.addEventListener('click', () => this.hideHint());
        this.elements.hintModal.addEventListener('click', (e) => {
            if (e.target === this.elements.hintModal) {
                this.hideHint();
            }
        });
        
        // Grade selection
        this.elements.gradeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectGrade(e.target.dataset.grade));
        });
        
        // File upload
        this.elements.uploadBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });
        
        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        // Prevent form submission and enable auto-focus
        this.elements.spellingInput.addEventListener('focus', () => {
            // Scroll input into view on mobile
            setTimeout(() => {
                this.elements.spellingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    }
    
    showLoading() {
        this.elements.loading.classList.add('active');
    }
    
    hideLoading() {
        this.elements.loading.classList.remove('active');
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show requested screen
        this.screens[screenName].classList.add('active');
    }
    
    showWelcome() {
        this.showScreen('welcome');
        this.resetGame();
    }
    
    resetGame() {
        this.currentWords = [];
        this.currentWordIndex = 0;
        this.score = 0;
        this.sessionWords = [];
        this.isPlaying = false;
        this.elements.spellingInput.value = '';
        this.clearFeedback();
    }
    
    startGame() {
        this.resetGame();
        this.selectRandomWords();
        this.isPlaying = true;
        this.showScreen('quiz');
        this.nextWord();
    }
    
    selectGrade(grade) {
        this.selectedGrade = grade;
        
        // Update UI
        this.elements.gradeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.grade === grade);
        });
        
        console.log(`Selected grade: ${grade}`);
    }
    
    selectRandomWords() {
        let availableWords = [...this.words];
        
        // Add uploaded words if any
        if (this.uploadedWords.length > 0) {
            availableWords = [...availableWords, ...this.uploadedWords];
        }
        
        // Filter by selected grade if not "all"
        if (this.selectedGrade !== 'all') {
            const targetGrade = parseInt(this.selectedGrade);
            
            // Get words from selected grade (60% priority)
            const gradeWords = availableWords.filter(w => w.grade === targetGrade);
            // Get words from adjacent grades (40% mixed)
            const adjacentWords = availableWords.filter(w => 
                Math.abs(w.grade - targetGrade) === 1
            );
            
            // Create weighted selection
            const weightedWords = [
                ...gradeWords,
                ...gradeWords, // Double the grade-specific words for higher probability
                ...adjacentWords
            ];
            
            availableWords = weightedWords.length >= 15 ? weightedWords : availableWords;
        }
        
        // Shuffle and select 15 words
        const shuffled = availableWords.sort(() => 0.5 - Math.random());
        this.currentWords = shuffled.slice(0, 15);
        this.sessionWords = [...this.currentWords]; // Keep copy for results
        
        console.log(`Selected ${this.currentWords.length} words for grade ${this.selectedGrade}`);
    }
    
    nextWord() {
        if (this.currentWordIndex >= this.currentWords.length) {
            this.showResults();
            return;
        }
        
        this.updateUI();
        this.clearFeedback();
        this.elements.spellingInput.value = '';
        this.elements.spellingInput.focus();
        
        // Auto-pronounce the word after a short delay
        setTimeout(() => {
            this.pronounceCurrentWord();
        }, 500);
    }
    
    updateUI() {
        const current = this.currentWordIndex + 1;
        const total = this.currentWords.length;
        
        this.elements.questionCounter.textContent = `Question ${current} of ${total}`;
        this.elements.scoreDisplay.textContent = `Score: ${this.score}`;
    }
    
    getCurrentWord() {
        return this.currentWords[this.currentWordIndex];
    }
    
    async pronounceCurrentWord() {
        if (!this.speechSynth || this.isSpeaking) return;
        
        const currentWord = this.getCurrentWord();
        if (!currentWord) return;
        
        try {
            await this.speak(currentWord.word);
        } catch (error) {
            console.error('Speech synthesis failed:', error);
            // Visual fallback - briefly show the word
            this.elements.playWordBtn.textContent = `📢 "${currentWord.word}"`;
            setTimeout(() => {
                this.elements.playWordBtn.textContent = '🔊 Listen to the Word';
            }, 2000);
        }
    }
    
    speak(text) {
        return new Promise((resolve, reject) => {
            if (!this.speechSynth) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }
            
            // Cancel any ongoing speech
            this.speechSynth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8; // Slightly slower for clarity
            utterance.pitch = 1.1; // Slightly higher pitch for kids
            utterance.volume = 1.0;
            
            if (this.voice) {
                utterance.voice = this.voice;
            }
            
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.elements.playWordBtn.disabled = true;
                this.elements.playWordBtn.style.opacity = '0.7';
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                this.elements.playWordBtn.disabled = false;
                this.elements.playWordBtn.style.opacity = '1';
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                this.elements.playWordBtn.disabled = false;
                this.elements.playWordBtn.style.opacity = '1';
                reject(event.error);
            };
            
            this.speechSynth.speak(utterance);
        });
    }
    
    submitAnswer() {
        if (!this.isPlaying) return;
        
        const userAnswer = this.elements.spellingInput.value.trim();
        if (!userAnswer) {
            this.showFeedback('Please enter your spelling!', 'neutral');
            return;
        }
        
        const currentWord = this.getCurrentWord();
        const isCorrect = userAnswer.toLowerCase() === currentWord.word.toLowerCase();
        
        if (isCorrect) {
            this.score++;
            this.showFeedback(`✅ Correct! Great job!`, 'correct');
            this.playSuccessSound();
        } else {
            this.showFeedback(`❌ The correct spelling is "${currentWord.word}"`, 'incorrect');
            this.playErrorSound();
        }
        
        this.updateUI();
        
        // Move to next word after delay
        setTimeout(() => {
            this.currentWordIndex++;
            this.nextWord();
        }, 2500);
    }
    
    showFeedback(message, type) {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = `feedback ${type}`;
        this.elements.feedback.style.display = 'flex';
    }
    
    clearFeedback() {
        this.elements.feedback.textContent = '';
        this.elements.feedback.className = 'feedback';
        this.elements.feedback.style.display = 'none';
    }
    
    playSuccessSound() {
        // Create audio context for success sound
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
                
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (error) {
                console.log('Audio context not available:', error);
            }
        }
    }
    
    playErrorSound() {
        // Create audio context for error sound
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                oscillator.frequency.setValueAtTime(250, audioCtx.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (error) {
                console.log('Audio context not available:', error);
            }
        }
    }
    
    showHint() {
        const currentWord = this.getCurrentWord();
        if (!currentWord) return;
        
        this.elements.hintText.textContent = currentWord.definition;
        this.elements.hintModal.classList.add('active');
    }
    
    hideHint() {
        this.elements.hintModal.classList.remove('active');
    }
    
    showResults() {
        this.isPlaying = false;
        
        // Update final score
        this.elements.finalScore.textContent = this.score;
        
        // Show encouragement message
        const percentage = Math.round((this.score / this.currentWords.length) * 100);
        let message = '';
        
        if (percentage >= 90) {
            message = "🌟 Outstanding! You're a spelling superstar! 🌟";
        } else if (percentage >= 75) {
            message = "🎉 Excellent work! You're getting really good at this! 🎉";
        } else if (percentage >= 60) {
            message = "👍 Good job! Keep practicing and you'll improve! 👍";
        } else if (percentage >= 40) {
            message = "💪 Nice try! Practice makes perfect! 💪";
        } else {
            message = "🌈 Great effort! Every mistake helps you learn! 🌈";
        }
        
        this.elements.encouragementMessage.textContent = message;
        
        // Save score to localStorage for tracking
        this.saveScore();
        
        this.showScreen('results');
    }
    
    async handleFileUpload(file) {
        try {
            this.showUploadStatus('Processing file...', 'processing');
            
            const words = await this.fileProcessor.processFile(file);
            const validation = this.fileProcessor.validateWords(words);
            
            if (validation.errors.length > 0) {
                console.warn('Validation errors:', validation.errors);
            }
            
            if (validation.validWords.length === 0) {
                throw new Error('No valid words found in file');
            }
            
            // Store uploaded words
            this.uploadedWords = validation.validWords;
            
            // Cache uploaded words
            localStorage.setItem('uploadedWords', JSON.stringify(this.uploadedWords));
            
            this.showUploadStatus(
                `✅ Successfully loaded ${validation.validWords.length} words` +
                (validation.errors.length > 0 ? ` (${validation.errors.length} errors)` : ''),
                'success'
            );
            
            console.log(`Loaded ${validation.validWords.length} words from ${file.name}`);
            
        } catch (error) {
            console.error('File upload error:', error);
            this.showUploadStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    showUploadStatus(message, type) {
        this.elements.uploadStatus.textContent = message;
        this.elements.uploadStatus.className = `upload-status ${type}`;
        
        // Clear status after 5 seconds for non-success messages
        if (type !== 'success') {
            setTimeout(() => {
                this.elements.uploadStatus.textContent = '';
                this.elements.uploadStatus.className = 'upload-status';
            }, 5000);
        }
    }
    
    loadUploadedWords() {
        try {
            const cached = localStorage.getItem('uploadedWords');
            if (cached) {
                this.uploadedWords = JSON.parse(cached);
                if (this.uploadedWords.length > 0) {
                    this.showUploadStatus(`📁 ${this.uploadedWords.length} uploaded words available`, 'success');
                }
            }
        } catch (error) {
            console.error('Failed to load uploaded words:', error);
        }
    }
    
    saveScore() {
        try {
            const scores = JSON.parse(localStorage.getItem('spellingBeeScores') || '[]');
            const newScore = {
                score: this.score,
                total: this.currentWords.length,
                percentage: Math.round((this.score / this.currentWords.length) * 100),
                date: new Date().toISOString(),
                sessionWords: this.sessionWords.map(w => w.word),
                grade: this.selectedGrade
            };
            
            scores.push(newScore);
            
            // Keep only last 20 scores
            if (scores.length > 20) {
                scores.splice(0, scores.length - 20);
            }
            
            localStorage.setItem('spellingBeeScores', JSON.stringify(scores));
        } catch (error) {
            console.error('Failed to save score:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all resources are loaded
    setTimeout(() => {
        window.spellingBeeApp = new SpellingBeeApp();
    }, 100);
});

// Handle visibility change for iOS Safari
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.speechSynthesis) {
        // Resume speech synthesis when page becomes visible
        window.speechSynthesis.resume();
    }
});

// Prevent zoom on double tap (iOS Safari)
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle iOS keyboard behavior
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Scroll to input when keyboard appears
    document.addEventListener('focusin', (e) => {
        if (e.target.tagName === 'INPUT') {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
    
    // Handle viewport changes on iOS
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
        document.addEventListener('focusin', () => {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        });
        
        document.addEventListener('focusout', () => {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        });
    }
}