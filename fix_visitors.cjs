const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const oldUpdateStats = `        const updateCombinedStats = (vCount: number, aCount: number) => {
          // Ensure visitor count is strictly the number of created accounts
          setVisitors(aCount);
        };`;

const newUpdateStats = `        const updateCombinedStats = async (vCount: number, aCount: number) => {
          // Use the real local user count to be totally accurate
          try {
            const allLocal = await localGetAllUsers();
            setVisitors(allLocal.length);
          } catch(e) {
            setVisitors(aCount);
          }
        };`;

code = code.replace(oldUpdateStats, newUpdateStats);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
