const fs = require('fs');
let code = fs.readFileSync('src/components/MaintenanceGuard.tsx', 'utf8');

const imports = `import { VeloLogo } from './VeloLogo';
import { UserMenu } from './UserMenu';`;

code = code.replace("import { VeloLogo } from './VeloLogo';", imports);

const messageState = `  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");`;

code = code.replace("  const [maintenanceMode, setMaintenanceMode] = useState(false);", messageState);

const dataExtract = `            setMaintenanceMode(docSnap.data().maintenance_mode ?? false);
            setMaintenanceMessage(docSnap.data().maintenance_message || "");`;

code = code.replace("            setMaintenanceMode(docSnap.data().maintenance_mode ?? false);", dataExtract);

const oldReturn = `    return (
      <div className="min-h-screen bg-velo-black flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">`;

const newReturn = `    return (
      <div className="min-h-screen bg-velo-black flex flex-col p-6 relative overflow-hidden" dir="rtl">
        <div className="absolute top-6 left-6 z-50">
          <UserMenu />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center relative">`;

code = code.replace(oldReturn, newReturn);

const oldMotion = `        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg w-full text-center space-y-8"
        >`;

const newMotion = `        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative z-10 max-w-lg w-full text-center space-y-8"
        >`;

code = code.replace(oldMotion, newMotion);

const oldP = `          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            عذراً، الموقع يخضع حالياً لبعض التحديثات الفنية وسنعود للعمل في أقرب وقت ممكن. شكراً لتفهمكم.
            <br/><br/>
            <span dir="ltr" className="block">
              Sorry, the site is currently undergoing technical updates and we will be back online as soon as possible. Thank you for your patience.
            </span>
          </p>`;

const newP = `          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            {maintenanceMessage ? maintenanceMessage : (
              <>
                عذراً، الموقع يخضع حالياً لبعض التحديثات الفنية وسنعود للعمل في أقرب وقت ممكن. شكراً لتفهمكم.
                <br/><br/>
                <span dir="ltr" className="block">
                  Sorry, the site is currently undergoing technical updates and we will be back online as soon as possible. Thank you for your patience.
                </span>
              </>
            )}
          </p>`;

code = code.replace(oldP, newP);

// Add the closing div for the new wrapper
const oldEnd = `        </motion.div>
      </div>
    );`;

const newEnd = `        </motion.div>
        </div>
      </div>
    );`;

code = code.replace(oldEnd, newEnd);

fs.writeFileSync('src/components/MaintenanceGuard.tsx', code);
