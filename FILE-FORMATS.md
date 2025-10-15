# Supported File Formats for Word Lists

The Spelling Bee app supports multiple file formats for uploading your own word lists. Here are examples of each supported format:

## 📄 Text File (.txt)

### Simple Format - Just Words:
```
elephant
butterfly 
rainbow
telephone
adventure
```

### Word with Definition:
```
elephant - A large gray animal with big ears and a long trunk
butterfly - A colorful insect with large wings
rainbow - Beautiful colored bands in the sky after rain
telephone - A device used to talk to people far away
adventure - An exciting journey or experience
```

### Word with Grade and Definition:
```
elephant (6) - A large gray animal with big ears and a long trunk
butterfly (6) - A colorful insect with large wings
geography (7) - The study of places, countries, and maps
microscope (7) - A tool that makes tiny things look bigger
absolutely (8) - Completely or totally
```

## 📝 Markdown File (.md)

### Organized by Grade Levels:
```markdown
# Spelling Bee Word List

## Grade 6
- elephant - A large gray animal with big ears and a long trunk
- butterfly - A colorful insect with large wings
- rainbow - Beautiful colored bands in the sky after rain
- telephone - A device used to talk to people far away

## Grade 7
- geography - The study of places, countries, and maps
- microscope - A tool that makes tiny things look bigger
- dictionary - A book that tells you what words mean
- photograph - A picture taken with a camera

## Grade 8
- absolutely - Completely or totally
- extremely - To a very great degree
- immediately - Right away or at once
- definitely - Certainly or without doubt
```

### Numbered List Format:
```markdown
# 6th Grade Words

1. elephant - A large gray animal with big ears and a long trunk
2. butterfly - A colorful insect with large wings
3. rainbow - Beautiful colored bands in the sky after rain

# 7th Grade Words

1. geography - The study of places, countries, and maps
2. microscope - A tool that makes tiny things look bigger
```

## 📊 JSON File (.json)

### Simple Array Format:
```json
[
  "elephant",
  "butterfly",
  "rainbow",
  "telephone"
]
```

### Full Object Format:
```json
[
  {
    "word": "elephant",
    "definition": "A large gray animal with big ears and a long trunk",
    "grade": 6
  },
  {
    "word": "butterfly", 
    "definition": "A colorful insect with large wings",
    "grade": 6
  },
  {
    "word": "geography",
    "definition": "The study of places, countries, and maps", 
    "grade": 7
  }
]
```

### Wrapped in Object:
```json
{
  "words": [
    {
      "word": "elephant",
      "definition": "A large gray animal with big ears and a long trunk",
      "grade": 6
    }
  ]
}
```

## 📋 Alternative JSON Field Names

The app recognizes these alternative field names:

- **Word**: `word`, `spelling`, `text`
- **Definition**: `definition`, `meaning`, `desc`
- **Grade**: `grade`, `level`

Example:
```json
[
  {
    "spelling": "elephant",
    "meaning": "A large gray animal with big ears and a long trunk",
    "level": 6
  }
]
```

## 📑 PDF Files (.pdf)

PDF processing is currently not supported directly. To use PDF files:

1. **Copy text from PDF** and paste into a .txt or .md file
2. **Use PDF to Text conversion** tools online
3. **Save as text** from your PDF reader

## 🎯 Tips for Best Results

1. **Be consistent** with formatting within your file
2. **Use clear definitions** that kids can understand  
3. **Specify grade levels** when possible for better targeting
4. **Keep one word per line** for text files
5. **Use UTF-8 encoding** to avoid character issues

## 🔧 Automatic Processing

The app will automatically:
- Remove duplicate words
- Assign grade levels based on word complexity if not specified
- Generate basic definitions for words without them
- Show validation errors and warnings
- Cache uploaded words for offline use

## 🚨 Common Issues

**No words found**: Check that your format matches the examples above  
**Grade not recognized**: Use numbers 1-12 for grade levels  
**Definition missing**: The app will create basic definitions automatically  
**File won't upload**: Ensure file extension is .txt, .md, or .json

## 📈 Grade Level Guidelines

- **Grade 6**: 3-8 letter words, common vocabulary
- **Grade 7**: 6-10 letter words, more complex concepts  
- **Grade 8**: 8+ letter words, advanced vocabulary

The app uses word length and complexity to automatically assign grades when not specified.