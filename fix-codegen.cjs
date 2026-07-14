const fs = require('fs');
let code = fs.readFileSync('src/forge/zip-engine/CodeGenerator.ts', 'utf8');

code = code.replace(/const pageNameSafe = p\.name\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\);/g, 
  `let pageNameSafe = p.name.replace(/[^a-zA-Z0-9]/g, '');\n      if (/^[0-9]/.test(pageNameSafe)) pageNameSafe = 'Page' + pageNameSafe;\n      if (!pageNameSafe) pageNameSafe = 'GeneratedPage';`);

code = code.replace(/const pageNameSafe = page\.name\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\);/g, 
  `let pageNameSafe = page.name.replace(/[^a-zA-Z0-9]/g, '');\n      if (/^[0-9]/.test(pageNameSafe)) pageNameSafe = 'Page' + pageNameSafe;\n      if (!pageNameSafe) pageNameSafe = 'GeneratedPage';`);

code = code.replace(/return <\$\{pages\[0\]\?\.name\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\) \|\| 'Home'\} stylePreset=\{stylePreset\} \/>;/g, 
  `let defPage = pages[0]?.name.replace(/[^a-zA-Z0-9]/g, '') || 'Home';\n        if (/^[0-9]/.test(defPage)) defPage = 'Page' + defPage;\n        if (!defPage) defPage = 'GeneratedPage';\n        return <\${defPage} stylePreset={stylePreset} />;`);

fs.writeFileSync('src/forge/zip-engine/CodeGenerator.ts', code);
