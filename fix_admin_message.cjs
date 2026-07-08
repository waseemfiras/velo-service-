const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const oldState = `  const [maintenanceMode, setMaintenanceMode] = useState(false);`;
const newState = `  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");`;
code = code.replace(oldState, newState);

const dataExtract = `            setMaintenanceMode(data.maintenance_mode ?? false);`;
const newDataExtract = `            setMaintenanceMode(data.maintenance_mode ?? false);
            setMaintenanceMessage(data.maintenance_message || "");`;
code = code.replace(dataExtract, newDataExtract);

const toggleCode = `    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    await localSaveConfig({ maintenance_mode: nextVal });`;
const newToggleCode = `    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    await localSaveConfig({ maintenance_mode: nextVal, maintenance_message: maintenanceMessage });`;
code = code.replace(toggleCode, newToggleCode);

const saveConfig = `                                  value={maxTokens} 
                                  onChange={changeMaxTokens}`;
const newSaveConfig = `                                  value={maxTokens} 
                                  onChange={changeMaxTokens}`;
// Let's add the text area below the toggle
const toggleUI = `                                </motion.div>
                              </button>
                            </div>
                          </div>`;
const newToggleUI = `                                </motion.div>
                              </button>
                            </div>
                            
                            <div className="mt-4">
                              <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 block">رسالة الصيانة (Maintenance Message)</label>
                              <textarea
                                value={maintenanceMessage}
                                onChange={async (e) => {
                                  setMaintenanceMessage(e.target.value);
                                  await localSaveConfig({ maintenance_mode: maintenanceMode, maintenance_message: e.target.value });
                                }}
                                className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors resize-none h-20"
                                placeholder="اتركه فارغاً لاستخدام الرسالة الافتراضية"
                              />
                            </div>
                          </div>`;

code = code.replace(toggleUI, newToggleUI);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
