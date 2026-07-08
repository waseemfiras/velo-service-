const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// replace type AdminTab
code = code.replace("type AdminTab = 'stats_config' | 'reports';", "type AdminTab = 'stats_config' | 'reports' | 'users';");

// add users state
code = code.replace("const [reports, setReports] = useState<any[]>([]);", `const [reports, setReports] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);`);

// import localGetAllUsers, localDeleteUser, localToggleAdmin
code = code.replace("localGetReports, localDeleteReport, localSaveConfig } from '../lib/localAuth';", "localGetReports, localDeleteReport, localSaveConfig, localGetAllUsers, localDeleteUser, localToggleAdmin } from '../lib/localAuth';");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
