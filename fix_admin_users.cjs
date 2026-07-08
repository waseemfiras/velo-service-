const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const fetchUsersCode = `
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await localGetAllUsers();
      setUsersList(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'users') {
      fetchUsers();
    }
  }, [isOpen, activeTab]);
`;

code = code.replace("useEffect(() => {", fetchUsersCode + "\n  useEffect(() => {");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
