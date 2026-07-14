const fs = require('fs');
let code = fs.readFileSync('src/forge/zip-engine/CodeGenerator.ts', 'utf8');

code = code.replace(
  /appRouterCode \+= `      default:\n        let defPage = pages\[0\]\?\.name\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\) \|\| 'Home';\n        if \(\/^[0-9]\/\.test\(defPage\)\) defPage = 'Page' \+ defPage;\n        if \(!defPage\) defPage = 'GeneratedPage';\n        return <\$\{defPage\} stylePreset=\{stylePreset\} \/>;/g,
  `let defPage = pages[0]?.name.replace(/[^a-zA-Z0-9]/g, '') || 'Home';\n    if (/^[0-9]/.test(defPage)) defPage = 'Page' + defPage;\n    if (!defPage) defPage = 'GeneratedPage';\n    appRouterCode += \`      default:\\n        return <\${defPage} stylePreset={stylePreset} />;\``
);

fs.writeFileSync('src/forge/zip-engine/CodeGenerator.ts', code);
