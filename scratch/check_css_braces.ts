import fs from 'fs';
import path from 'path';

function checkBraces() {
  const cssPath = path.resolve('/Users/apple/Work/Terminal 8/public website/main-style.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  let openCount = 0;
  let closeCount = 0;
  let lines = css.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Ignore inside comments
    // Simple comment strip
    const cleanLine = line.replace(/\/\*[\s\S]*?\*\//g, '');
    
    for (let char of cleanLine) {
      if (char === '{') openCount++;
      if (char === '}') closeCount++;
    }
  }

  console.log('Open braces { :', openCount);
  console.log('Close braces } :', closeCount);
  if (openCount !== closeCount) {
    console.error('ERROR: Unmatched braces found in CSS file!');
  } else {
    console.log('Braces match perfectly!');
  }
}

checkBraces();
