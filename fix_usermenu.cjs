const fs = require('fs');
let code = fs.readFileSync('src/components/UserMenu.tsx', 'utf8');

const oldMotion = `              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}`;

const newMotion = `              initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}`;

code = code.replace(oldMotion, newMotion);

fs.writeFileSync('src/components/UserMenu.tsx', code);
