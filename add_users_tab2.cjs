const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>`;

const usersTab = `                      </motion.div>
                    ) : (
                      <motion.div
                        key="users_tab"
                        initial={{ opacity: 0, x: 30, scale: 0.95, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -30, scale: 0.95, filter: 'blur(5px)' }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                        className="space-y-4"
                      >
                        {loadingUsers ? (
                          <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                          </div>
                        ) : usersList.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-white/40">
                            <Users className="w-16 h-16 mb-4 text-white/20" />
                            <p className="text-lg">لا يوجد حسابات مستخدمين حالياً</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 flex justify-between items-center">
                              <span className="text-white font-medium text-sm">عدد الحسابات: {usersList.length}</span>
                            </div>
                            {usersList.map((usr) => (
                              <motion.div
                                key={usr.uid}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                                      {usr.uid}
                                    </span>
                                    <span className="text-white/40 text-[10px] font-mono flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(usr.createdAt).toLocaleDateString()}
                                    </span>
                                    {usr.isAdmin && (
                                      <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white/90 text-sm font-medium">{usr.email}</p>
                                </div>
                                
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={async () => {
                                      await localToggleAdmin(usr.email);
                                      setUsersList(prev => prev.map(u => u.email === usr.email ? { ...u, isAdmin: !u.isAdmin } : u));
                                    }}
                                    className="flex-1 sm:flex-none p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Settings2 className="w-4 h-4" />
                                    <span className="text-xs sm:hidden">تغيير رتبة (Admin)</span>
                                  </button>
                                  <button
                                    onClick={async () => {
                                      setDeletingId(usr.uid);
                                      await localDeleteUser(usr.email);
                                      setUsersList(prev => prev.filter(u => u.email !== usr.email));
                                      setDeletingId(null);
                                    }}
                                    disabled={deletingId === usr.uid}
                                    className="flex-1 sm:flex-none p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2"
                                  >
                                    {deletingId === usr.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    <span className="text-xs sm:hidden">حذف</span>
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>`;

code = code.replace(target, usersTab);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
