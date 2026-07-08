const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const oldMotion = `        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-[72px] z-30 bg-velo-black/95 backdrop-blur-2xl border-t border-white/10 flex flex-col p-6 gap-6 md:hidden overflow-y-auto"
          >`;

const newMotion = `        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%", filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: "100%", filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-50 bg-velo-black/95 backdrop-blur-2xl flex flex-col p-6 pt-24 gap-6 md:hidden overflow-y-auto"
          >
            {/* Close button inside modal to replace the top right one */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white bg-white/10 rounded-full transition-colors z-50"
              aria-label="Close Mobile Menu"
            >
              <CloseIcon className="w-6 h-6" />
            </button>`;

code = code.replace(oldMotion, newMotion);

fs.writeFileSync('src/components/Navbar.tsx', code);
