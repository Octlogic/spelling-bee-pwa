<<<<<<< HEAD
# 🐝 Spelling Bee Challenge - iPad PWA

A fun, educational Progressive Web App designed for kids to practice spelling on iPad tablets. Features pronunciation, hints, and offline functionality.

## ✨ Features

- **🎯 15-Question Sessions**: Each spelling session has exactly 15 randomly selected words
- **📚 Grade Level Selection**: Choose 6th, 7th, 8th grade, or All Grades for targeted practice
- **📁 Custom Word Lists**: Upload your own word lists via PDF, Markdown, Text, or JSON files
- **🎲 Smart Word Selection**: Grade-specific words get priority, with some mixing from adjacent grades
- **🔊 Audio Pronunciation**: Words are spoken aloud using Web Speech API (iPad compatible)
- **💡 Hint System**: Kids can view word definitions when they need help
- **📱 iPad Optimized**: Touch-friendly interface designed specifically for tablet use
- **🌐 Offline Ready**: Works without internet connection after initial load
- **🏠 Add to Home Screen**: Can be installed as a PWA on iPad home screen
- **🎨 Kid-Friendly Design**: Bright colors, large buttons, and encouraging feedback
- **♿ Accessible**: VoiceOver compatible with proper ARIA labels
- **📊 Progress Tracking**: Scores are saved locally with grade level tracking

## 🎯 Target Age Group

Designed for kids in grades 3-8 (ages 8-14), with 100+ carefully curated spelling words and kid-friendly definitions.

## 📂 Project Structure

```
spelling-bee-pwa/
├── index.html              # Main application HTML
├── styles.css              # iPad-optimized CSS styles
├── script.js               # Core application logic
├── words.json              # Database of 100+ words with definitions
├── manifest.json           # PWA configuration
├── service-worker.js       # Offline functionality
├── generate-icons.html     # Tool to create bee icons
├── icons/                  # PWA icons directory
│   ├── icon-192.png       # 192x192 app icon
│   └── icon-512.png       # 512x512 app icon
└── README.md              # This file
```

## 🚀 Setup & Installation

### Prerequisites
- Web server (Python, Node.js, or any HTTP server)
- Modern web browser (Chrome, Safari, Firefox, Edge)
- For development: Node.js and npm (optional)

### Quick Start

1. **Clone or download** this repository to your local machine

2. **Generate Icons** (Required):
   ```bash
   # Open generate-icons.html in a browser
   # Download the generated 192x192 and 512x512 PNG files
   # Save them in the icons/ directory
   ```

3. **Start a local server**:

   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   Using Node.js:
   ```bash
   npx serve .
   # or
   npx http-server .
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

4. **Open in browser**: Navigate to `http://localhost:8000`

5. **Test on iPad**: Connect your iPad to the same network and visit your computer's IP address with the port (e.g., `http://192.168.1.100:8000`)

## 📱 iPad Installation

1. Open Safari on iPad and navigate to the app URL
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Customize the name if desired
5. Tap "Add" - the app will appear on the home screen
6. Launch from home screen for full-screen experience

## 🎮 How to Use

### For Kids:
1. **Choose Grade**: Select your grade level (6th, 7th, 8th, or All Grades)
2. **Upload Words** (Optional): Ask a teacher/parent to upload custom word lists
3. **Start**: Tap "Start Spelling Bee" to begin a session
4. **Listen**: Tap the 🔊 button to hear the word pronounced
5. **Type**: Enter your spelling in the text field
6. **Get Help**: Tap "💡 Need a Hint?" to see the word's meaning
7. **Submit**: Tap "Submit Answer" to check your spelling
8. **Continue**: Move through all 15 questions to see your final score

### For Teachers/Parents:
- Each session randomly selects 15 words from the 100+ word database
- Scores are automatically saved to track progress over time
- The app works offline once initially loaded
- Words range from simple to challenging, appropriate for grades 3-8

## 🔧 Customization

### Adding New Words
Edit `words.json` to add or modify spelling words:

```json
{
  "word": "example",
  "definition": "A simple, kid-friendly definition"
}
```

### Changing Session Length
In `script.js`, modify the number on line 224:
```javascript
this.currentWords = shuffled.slice(0, 15); // Change 15 to desired number
```

### Updating Colors/Styles
Modify `styles.css` to change:
- Color scheme (CSS custom properties at the top)
- Font sizes and spacing
- Animation speeds
- Button styles

## 🌐 Deployment

### GitHub Pages (Free)
1. Push code to GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Visit `https://username.github.io/repository-name`

### Netlify (Free)
1. Create account at netlify.com
2. Drag and drop the project folder
3. Get instant HTTPS URL

### Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts for deployment

### Traditional Web Hosting
Upload all files to your web server's public directory via FTP/SFTP.

## 🔍 Testing & Validation

### PWA Testing
- Use Chrome DevTools Lighthouse audit
- Test "Add to Home Screen" functionality
- Verify offline functionality (disable network in DevTools)
- Test on actual iPad device

### Accessibility Testing
- Use VoiceOver on iPad to test screen reader compatibility
- Check color contrast ratios
- Verify keyboard navigation
- Test with high contrast mode

### Cross-Browser Testing
- Safari (primary target for iPad)
- Chrome on desktop
- Firefox
- Edge

## 🐛 Troubleshooting

### Common Issues:

**Audio Not Working on iPad:**
- Ensure user has interacted with page before audio plays
- Check iPad volume and mute switch
- Some school networks block Web Speech API

**PWA Not Installing:**
- Ensure HTTPS connection (required for PWA features)
- Check manifest.json syntax
- Verify all icon files exist

**Words Not Loading:**
- Check browser console for errors
- Verify words.json is valid JSON
- Ensure proper MIME type for JSON files

**Offline Mode Not Working:**
- Check service worker registration in browser DevTools
- Verify all files are properly cached
- Clear browser cache and reload

## 📚 Technical Details

### Technologies Used:
- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern layouts with Flexbox/Grid, CSS animations
- **Vanilla JavaScript**: No frameworks for lightweight performance
- **Web Speech API**: Native browser text-to-speech
- **Service Workers**: Offline functionality and caching
- **Web App Manifest**: PWA installation and theming
- **Local Storage**: Score persistence and word caching

### Browser Support:
- Safari on iOS 12+ (primary target)
- Chrome 67+
- Firefox 63+
- Edge 79+

### Performance:
- Lightweight: ~50KB total size
- Fast loading: All assets cached after first visit
- Smooth animations: 60fps on iPad hardware
- Touch-optimized: 44px minimum touch targets

## 📄 License

MIT License - feel free to modify and distribute for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on iPad
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Test on different devices/browsers
4. Create an issue on GitHub if problems persist

---

**Made with ❤️ for young spellers everywhere! 🐝📚**
=======
# spelling-bee-pwa

>>>>>>> 9655b135d7de0ccc046584a68fc5c27a5a638069
