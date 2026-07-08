const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

const oldMotion = `            initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}`;

const newMotion = `            initial={{ opacity: 0, y: 60, scale: 0.8, filter: "blur(15px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 60, scale: 0.8, filter: "blur(15px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25, bounce: 0.5 }}`;

code = code.replace(oldMotion, newMotion);

fs.writeFileSync('src/components/Chatbot.tsx', code);
