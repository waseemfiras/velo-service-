const fs = require('fs');
let code = fs.readFileSync('src/lib/localAuth.ts', 'utf8');

const replacement = `// PUBLIC API ACTIONS
export async function localRegister(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) throw new Error("بيانات غير مكتملة");
  
  const users = getLocalUsers();
  if (users.some(u => u.email === cleanEmail)) {
    throw new Error("البريد الإلكتروني مسجل مسبقاً");
  }
  
  const uid = "user-" + Math.random().toString(36).substr(2, 9);
  const newUser = {
    uid,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveLocalUsers(users);

  try {
    const { db } = await initializeFirebase();
    if (db) {
      await setDoc(doc(db, 'custom_users', uid), {
        email: cleanEmail,
        createdAt: newUser.createdAt,
        isAdmin: false
      });
      // also increment total visitors for backward compatibility or let them equal accounts count
    }
  } catch (e) {
    console.warn("Failed to sync new user to Firebase", e);
  }

  return { success: true, message: "تم تسجيل الحساب بنجاح" };
}

export async function localLogin(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  const users = getLocalUsers();
  const user = users.find(u => u.email === cleanEmail);
  
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  const token = "token_" + Math.random().toString(36).substr(2) + Date.now();
  const sessions = getLocalSessions();
  sessions.push({
    token,
    email: cleanEmail,
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  });
  saveLocalSessions(sessions);

  const isAdmin = ADMIN_ACCOUNTS.some(a => a.email.toLowerCase() === user.email);

  return {
    token,
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.email.split('@')[0],
      photoURL: null,
      isCustom: true,
      isAdmin
    }
  };
}

export async function localGetMe(token: string) {
  const sessions = getLocalSessions();
  const session = sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());
  
  if (!session) {
    throw new Error("جلسة غير صالحة");
  }

  const users = getLocalUsers();
  const user = users.find(u => u.email === session.email);
  
  if (!user) {
    throw new Error("المستخدم غير موجود");
  }
  const isAdmin = ADMIN_ACCOUNTS.some(a => a.email.toLowerCase() === user.email);

  return {
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.email.split('@')[0],
      photoURL: null,
      isCustom: true,
      isAdmin
    }
  };
}

export async function localChangePassword(token: string, oldPass: string, newPass: string) {
  const sessions = getLocalSessions();
  const session = sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());
  
  if (!session) throw new Error("جلسة غير صالحة");

  const users = getLocalUsers();
  const userIndex = users.findIndex(u => u.email === session.email);
  
  if (userIndex === -1 || users[userIndex].passwordHash !== hashPassword(oldPass)) {
    throw new Error("كلمة المرور القديمة غير صحيحة");
  }

  users[userIndex].passwordHash = hashPassword(newPass);
  saveLocalUsers(users);

  return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
}

export async function localAddReport(email: string, issue: string) {
  if (!issue.trim()) throw new Error("محتوى البلاغ مطلوب");
  
  const reports = getLocalReports();
  const newReport = {
    id: "rep-" + Math.random().toString(36).substr(2, 9),
    email,
    issue: issue.trim(),
    createdAt: new Date().toISOString()
  };
  
  reports.push(newReport);
  saveLocalReports(reports);

  try {
    const { db } = await initializeFirebase();
    if (db) {
      await setDoc(doc(db, 'reports', newReport.id), newReport);
    }
  } catch (e) {}

  return { success: true, message: "تم إرسال البلاغ بنجاح" };
}

export async function localGetReports() {
  const reports = getLocalReports();
  return { reports: reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
}

export async function localDeleteReport(id: string) {
  let reports = getLocalReports();
  reports = reports.filter(r => r.id !== id);
  saveLocalReports(reports);

  try {
    const { db } = await initializeFirebase();
    if (db) {
      await deleteDoc(doc(db, 'reports', id));
    }
  } catch (e) {}

  return { success: true };
}

export async function localSaveConfig(config: {
  ai_chat_enabled?: boolean;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  log_level?: string;
  max_tokens?: number;
}) {
  try {
    const { db } = await initializeFirebase();
    if (db) {
      await setDoc(doc(db, 'settings', 'global_config'), config, { merge: true });
      return true;
    }
  } catch (e) {
    console.error("Failed to save config to Firebase", e);
  }
  return false;
}

export async function localGetAllUsers() {
  return getLocalUsers();
}

export async function localDeleteUser(email: string) {
  const cleanEmail = email.toLowerCase();
  let users = getLocalUsers();
  const user = users.find(u => u.email === cleanEmail);
  
  users = users.filter(u => u.email !== cleanEmail);
  saveLocalUsers(users);

  if (user) {
    try {
      const { db } = await initializeFirebase();
      if (db) {
        await deleteDoc(doc(db, 'custom_users', user.uid));
      }
    } catch (e) {}
  }

  return { success: true };
}

export async function localToggleAdmin(email: string) {
  // Can be implemented if needed, but for now we rely on ADMIN_ACCOUNTS or firebase claims.
  return { success: true };
}
`;

const index = code.indexOf('// PUBLIC API ACTIONS');
if (index !== -1) {
  code = code.substring(0, index) + replacement;
  fs.writeFileSync('src/lib/localAuth.ts', code);
  console.log("Updated localAuth.ts successfully");
} else {
  console.log("Could not find // PUBLIC API ACTIONS");
}
