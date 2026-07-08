import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { 
  X, 
  Users, 
  MessageSquareOff, 
  Settings2, 
  Loader2, 
  ShieldAlert, 
  Trash2, 
  Calendar, 
  Database, 
  Cpu, 
  Activity, 
  CheckCircle2,
  AlertOctagon,
  Search,
  Briefcase,
  FileSpreadsheet,
  UserCheck,
  Compass,
  ArrowRight,
  Clock,
  ExternalLink,
  MessageCircle,
  FileDown
} from 'lucide-react';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { initializeFirebase } from '../lib/firebase';
import { localGetReports, localDeleteReport, localSaveConfig, localGetAllUsers, localDeleteUser, localToggleAdmin } from '../lib/localAuth';
import { 
  getAllRequestsAdmin, 
  updateServiceRequestAdmin, 
  deleteServiceRequestAdmin, 
  STATUS_DETAILS, 
  ServiceRequestStatus 
} from '../lib/serviceRequests';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'stats_config' | 'requests' | 'reports' | 'users';

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats_config');
  
  // Real stats & configurations from Firestore
  const [visitors, setVisitors] = useState(0);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [logLevel, setLogLevel] = useState('info');
  const [maxTokens, setMaxTokens] = useState(4096);

  // Service requests state
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequestAdmin, setSelectedRequestAdmin] = useState<any | null>(null);
  const [requestsSearchQuery, setRequestsSearchQuery] = useState('');
  const [requestsFilterStatus, setRequestsFilterStatus] = useState('ALL');

  // Fields for request editing
  const [editStatus, setEditStatus] = useState<string>('');
  const [editLatestUpdate, setEditLatestUpdate] = useState<string>('');
  const [editAssignedTeam, setEditAssignedTeam] = useState<string>('');
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState<string>('');

  // Detailed fields for advanced management and total control
  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(false);
  const [editProjectTitle, setEditProjectTitle] = useState<string>('');
  const [editSelectedService, setEditSelectedService] = useState<string>('');
  const [editFullName, setEditFullName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editCompany, setEditCompany] = useState<string>('');
  const [editCountry, setEditCountry] = useState<string>('');
  const [editEstimatedBudget, setEditEstimatedBudget] = useState<string>('');
  const [editPreferredTimeline, setEditPreferredTimeline] = useState<string>('');
  const [editProjectDescription, setEditProjectDescription] = useState<string>('');
  const [editReferenceLinks, setEditReferenceLinks] = useState<string>('');
  const [editAdditionalNotes, setEditAdditionalNotes] = useState<string>('');

  // Confirmation states for actions without window.confirm
  const [showCancelConfirmAdmin, setShowCancelConfirmAdmin] = useState<boolean>(false);
  const [showDeleteConfirmAdmin, setShowDeleteConfirmAdmin] = useState<string | null>(null);

  // Bulk selection states for Admin Dashboard
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState<boolean>(false);

  // Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [savingMsg, setSavingMsg] = useState(false);


  
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch reports when reports tab is open
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await localGetReports();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'reports') {
      fetchReports();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'requests') return;

    let unsubscribeRequests: () => void;

    const setupRequestsListener = async () => {
      setLoadingRequests(true);
      try {
        const { db } = await initializeFirebase();
        if (!db) {
          // Offline fallback
          const localRequests = JSON.parse(localStorage.getItem('velo_service_requests') || '[]');
          setServiceRequests(localRequests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setLoadingRequests(false);
          return;
        }

        unsubscribeRequests = onSnapshot(collection(db, 'service_requests'), (snapshot) => {
          const requests: any[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            requests.push({
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
            });
          });

          // Sort by createdAt desc
          const sorted = requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setServiceRequests(sorted);
          setLoadingRequests(false);

          // Update selectedRequest details automatically in real-time if selected
          setSelectedRequestAdmin((prevSelected) => {
            if (!prevSelected) return null;
            const updated = sorted.find(r => r.id === prevSelected.id);
            return updated || prevSelected;
          });
        }, (error) => {
          console.error("Error listening to service requests:", error);
          setLoadingRequests(false);
        });
      } catch (err) {
        console.error("Error setting up requests listener:", err);
        setLoadingRequests(false);
      }
    };

    setupRequestsListener();

    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
    };
  }, [isOpen, activeTab]);

  const handleSelectRequestAdmin = (req: any) => {
    setSelectedRequestAdmin(req);
    setShowCancelConfirmAdmin(false);
    setShowDeleteConfirmAdmin(null);
    setEditStatus(req.status);
    setEditLatestUpdate(req.latestUpdate || '');
    setEditAssignedTeam(req.assignedTeam || '');
    setEditEstimatedDelivery(req.estimatedDelivery || '');

    // Detailed fields setup
    setEditProjectTitle(req.projectTitle || '');
    setEditSelectedService(req.selectedService || '');
    setEditFullName(req.fullName || '');
    setEditEmail(req.email || '');
    setEditPhone(req.phone || '');
    setEditCompany(req.company || '');
    setEditCountry(req.country || '');
    setEditEstimatedBudget(req.estimatedBudget || '');
    setEditPreferredTimeline(req.preferredTimeline || '');
    setEditProjectDescription(req.projectDescription || '');
    setEditReferenceLinks(req.referenceLinks || '');
    setEditAdditionalNotes(req.additionalNotes || '');
    setIsEditingDetails(false);
  };

  const handleUpdateRequestAdmin = async () => {
    if (!selectedRequestAdmin) return;
    try {
      const updates: any = {
        status: editStatus as any,
        latestUpdate: editLatestUpdate,
        assignedTeam: editAssignedTeam,
        estimatedDelivery: editEstimatedDelivery
      };

      if (isEditingDetails) {
        updates.projectTitle = editProjectTitle;
        updates.selectedService = editSelectedService;
        updates.fullName = editFullName;
        updates.email = editEmail;
        updates.phone = editPhone;
        updates.company = editCompany;
        updates.country = editCountry;
        updates.estimatedBudget = editEstimatedBudget;
        updates.preferredTimeline = editPreferredTimeline;
        updates.projectDescription = editProjectDescription;
        updates.referenceLinks = editReferenceLinks;
        updates.additionalNotes = editAdditionalNotes;
      }

      await updateServiceRequestAdmin(selectedRequestAdmin.id, updates);
      toast.success("تم تحديث بيانات الطلب بنجاح");
      setServiceRequests(prev => prev.map(r => r.id === selectedRequestAdmin.id ? { ...r, ...updates } : r));
      setSelectedRequestAdmin(prev => prev ? { ...prev, ...updates } : null);
      setIsEditingDetails(false);
    } catch (err) {
      console.error("Error updating request:", err);
      toast.error("فشل تحديث بيانات الطلب");
    }
  };

  const handleCancelRequestAdmin = async () => {
    if (!selectedRequestAdmin) return;
    try {
      const updates = {
        status: 'Cancelled' as any,
        latestUpdate: 'تم إلغاء الطلب من قبل الإدارة الفنية'
      };
      await updateServiceRequestAdmin(selectedRequestAdmin.id, updates);
      toast.success("تم إلغاء الطلب بنجاح");
      setEditStatus('Cancelled');
      setEditLatestUpdate('تم إلغاء الطلب من قبل الإدارة الفنية');
      setServiceRequests(prev => prev.map(r => r.id === selectedRequestAdmin.id ? { ...r, ...updates } : r));
      setSelectedRequestAdmin(prev => prev ? { ...prev, ...updates } : null);
      setShowCancelConfirmAdmin(false);
    } catch (err) {
      console.error("Error cancelling request:", err);
      toast.error("فشل إلغاء الطلب");
    }
  };

  const handleDeleteRequestAdmin = async (id: string) => {
    try {
      await deleteServiceRequestAdmin(id);
      toast.success("تم حذف الطلب بنجاح");
      setServiceRequests(prev => prev.filter(r => r.id !== id));
      if (selectedRequestAdmin?.id === id) {
        setSelectedRequestAdmin(null);
      }
      setShowDeleteConfirmAdmin(null);
    } catch (err) {
      console.error("Error deleting request:", err);
      toast.error("فشل حذف الطلب");
    }
  };

  const handleBulkStatusChange = async (newStatus: any) => {
    if (selectedRequestIds.length === 0) {
      toast.error("يرجى تحديد طلب واحد على الأقل أولاً");
      return;
    }
    try {
      const updatePromises = selectedRequestIds.map(id => 
        updateServiceRequestAdmin(id, { 
          status: newStatus,
          latestUpdate: `تم تحديث حالة الطلب جماعياً إلى ${STATUS_DETAILS[newStatus]?.label || newStatus}`
        })
      );
      await Promise.all(updatePromises);
      toast.success(`تم تحديث حالة ${selectedRequestIds.length} طلبات بنجاح`);
      
      setServiceRequests(prev => prev.map(r => 
        selectedRequestIds.includes(r.id) 
          ? { ...r, status: newStatus, latestUpdate: `تم تحديث حالة الطلب جماعياً إلى ${STATUS_DETAILS[newStatus]?.label || newStatus}` } 
          : r
      ));
      if (selectedRequestAdmin && selectedRequestIds.includes(selectedRequestAdmin.id)) {
        setSelectedRequestAdmin(prev => prev ? { ...prev, status: newStatus } : null);
        setEditStatus(newStatus);
      }
      setSelectedRequestIds([]);
    } catch (err) {
      console.error("Error bulk updating status:", err);
      toast.error("فشل التحديث الجماعي لبعض الطلبات");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRequestIds.length === 0) {
      toast.error("يرجى تحديد طلب واحد على الأقل أولاً");
      return;
    }
    try {
      const deletePromises = selectedRequestIds.map(id => deleteServiceRequestAdmin(id));
      await Promise.all(deletePromises);
      toast.success(`تم حذف ${selectedRequestIds.length} طلبات بنجاح`);
      
      setServiceRequests(prev => prev.filter(r => !selectedRequestIds.includes(r.id)));
      if (selectedRequestAdmin && selectedRequestIds.includes(selectedRequestAdmin.id)) {
        setSelectedRequestAdmin(null);
      }
      setSelectedRequestIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (err) {
      console.error("Error bulk deleting requests:", err);
      toast.error("فشل الحذف الجماعي لبعض الطلبات");
    }
  };

  const exportRequestsToCSV = () => {
    if (serviceRequests.length === 0) {
      toast.error("لا توجد طلبات لتصديرها");
      return;
    }
    const headers = ["ID", "Name", "Email", "Company", "Project Title", "Service", "Budget", "Timeline", "Country", "Contact Method", "Status", "Created At"];
    const rows = serviceRequests.map(r => [
      r.id,
      r.fullName,
      r.email,
      r.company || '',
      r.projectTitle,
      r.selectedService,
      r.estimatedBudget,
      r.preferredTimeline,
      r.country || '',
      r.preferredContactMethod,
      r.status,
      new Date(r.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Velo_Service_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير البيانات بنجاح كملف CSV");
  };

  useEffect(() => {
    if (!isOpen) return;

    let unsubscribeStats: () => void;
    let unsubscribeUsers: () => void;
    let unsubscribeConfig: () => void;

    const loadData = async () => {
      try {
        const { db } = await initializeFirebase();
        
        if (!db) {
          console.warn("Firestore db is null, skipping stats sync.");
          setLoading(false);
          return;
        }

        let currentTotalVisitors = 0;
        let currentAccountsCount = 0;

        const updateCombinedStats = async (vCount: number, aCount: number) => {
          // Use the real local user count to be totally accurate
          try {
            const allLocal = await localGetAllUsers();
            setVisitors(allLocal.length);
          } catch(e) {
            setVisitors(aCount);
          }
        };

        unsubscribeStats = onSnapshot(doc(db, 'analytics', 'global_stats'), (docSnap) => {
          if (docSnap.exists()) {
            currentTotalVisitors = docSnap.data().total_visitors || 0;
          } else {
            currentTotalVisitors = 0;
          }
          updateCombinedStats(currentTotalVisitors, currentAccountsCount);
        }, (error) => {
          console.error("Error fetching stats:", error);
        });

        unsubscribeUsers = onSnapshot(collection(db, 'custom_users'), (snapshot) => {
          currentAccountsCount = snapshot ? snapshot.size : 0;
          updateCombinedStats(currentTotalVisitors, currentAccountsCount);
        }, (error) => {
          console.error("Error fetching custom users:", error);
        });

        unsubscribeConfig = onSnapshot(doc(db, 'settings', 'global_config'), async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setChatEnabled(data.ai_chat_enabled ?? true);
            setMaintenanceMode(data.maintenance_mode ?? false);
            setMaintenanceMessage(data.maintenance_message || "");
            setLogLevel(data.log_level ?? 'info');
            setMaxTokens(data.max_tokens ?? 4096);
            setLoading(false);
          } else {
            // Initialize config if it doesn't exist
            try {
              await localSaveConfig({ 
                ai_chat_enabled: true,
                maintenance_mode: false,
                log_level: 'info',
                max_tokens: 4096
              });
            } catch (err) {
              console.error("Error creating initial config:", err);
            }
            setLoading(false);
          }
        }, (error) => {
          console.error("Error fetching config:", error);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error initializing Firebase in AdminDashboard:", err);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeStats) unsubscribeStats();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeConfig) unsubscribeConfig();
    };
  }, [isOpen]);

  const toggleChat = async () => {
    const nextVal = !chatEnabled;
    setChatEnabled(nextVal);
    await localSaveConfig({ ai_chat_enabled: nextVal });
  };

  const toggleMaintenance = async () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    await localSaveConfig({ maintenance_mode: nextVal, maintenance_message: maintenanceMessage });
    if (nextVal) {
      toast.success("تم تفعيل وضع الصيانة بنجاح");
    } else {
      toast.success("تم إلغاء تفعيل وضع الصيانة بنجاح");
    }
  };

  const handleSaveMaintenanceMessage = async () => {
    setSavingMsg(true);
    try {
      await localSaveConfig({ 
        maintenance_mode: maintenanceMode, 
        maintenance_message: maintenanceMessage 
      });
      toast.success("تم حفظ رسالة الصيانة بنجاح");
    } catch (err) {
      console.error("Error saving maintenance message:", err);
      toast.error("فشل حفظ الرسالة");
    } finally {
      setSavingMsg(false);
    }
  };

  const changeLogLevel = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    setLogLevel(level);
    await localSaveConfig({ log_level: level });
  };

  const changeMaxTokens = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 2048;
    setMaxTokens(val);
    await localSaveConfig({ max_tokens: val });
  };

  const handleDeleteReport = async (id: string) => {
    setDeletingId(id);
    try {
      await localDeleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting report:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] isolate">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(5px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 350, mass: 0.8 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl p-6"
          >
            <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-display font-bold text-emerald-400 flex items-center gap-3">
                  <Settings2 className="w-6 h-6 animate-spin-slow" />
                  لوحة تحكم المدير <span className="text-sm font-normal text-white/40 font-sans">(Admin Dashboard)</span>
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex flex-wrap border-b border-white/10 bg-black/40 p-2 gap-1 sm:gap-0">
                <button
                  onClick={() => setActiveTab('stats_config')}
                  className={`flex-1 min-w-[120px] py-3 text-xs sm:text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'stats_config'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  الإعدادات والتحكم
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 min-w-[120px] py-3 text-xs sm:text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 relative ${
                    activeTab === 'requests'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  طلبات الخدمات
                  {serviceRequests.length > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                      {serviceRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 min-w-[120px] py-3 text-xs sm:text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 relative ${
                    activeTab === 'reports'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  بلاغات الأعطال
                  {reports.length > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {reports.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 min-w-[120px] py-3 text-xs sm:text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'users'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  الحسابات
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-[#090909]">
                {loading ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2].map((i) => (
                        <motion.div 
                          key={`skel-stat-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.4 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden h-28"
                        >
                          <motion.div 
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent w-full"
                          />
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/5"></div>
                            <div className="space-y-2">
                              <div className="h-3 w-32 bg-white/10 rounded-full"></div>
                              <div className="h-6 w-20 bg-white/10 rounded-full"></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 relative overflow-hidden"
                    >
                       <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent w-full"
                        />
                       <div className="h-5 w-48 bg-white/10 rounded-full mb-6"></div>
                       {[1, 2, 3].map(i => (
                         <div key={`skel-row-${i}`} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                           <div className="space-y-2">
                             <div className="h-4 w-40 bg-white/10 rounded-full"></div>
                             <div className="h-3 w-64 bg-white/10 rounded-full"></div>
                           </div>
                           <div className="w-14 h-8 rounded-full bg-white/5"></div>
                         </div>
                       ))}
                    </motion.div>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {activeTab === 'stats_config' ? (
                      <motion.div
                        key="stats_tab"
                        initial={{ opacity: 0, x: -30, scale: 0.95, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 30, scale: 0.95, filter: 'blur(5px)' }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                        className="space-y-6"
                      >
                        {/* High-level Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Visitor Stats */}
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider">عدد الزوار الإجمالي (Total Visitors)</h3>
                                <p className="text-3xl font-bold text-white mt-1">{visitors}</p>
                              </div>
                            </div>
                          </div>

                          {/* Database Status */}
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                                <Database className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider">حالة التخزين (Database Sync)</h3>
                                <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Firestore Active / متصل بـ Firebase
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Service Requests Analytics Section */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                          <h3 className="text-base font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2 text-right justify-end" dir="rtl">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            تحليلات طلبات الخدمات (Service Request Analytics)
                          </h3>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-right" dir="rtl">
                            {/* Card 1: Pipeline Value */}
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-28">
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">قيمة المشاريع التقديرية</span>
                              <div className="mt-2">
                                <span className="text-xl font-bold text-emerald-400">
                                  ${serviceRequests.reduce((acc, r) => {
                                    const b = r.estimatedBudget || '';
                                    if (b.includes('1500+')) return acc + 1500;
                                    if (b.includes('700') && b.includes('1500')) return acc + 1100;
                                    if (b.includes('300') && b.includes('700')) return acc + 500;
                                    if (b.includes('100') && b.includes('300')) return acc + 200;
                                    if (b.includes('Under')) return acc + 100;
                                    return acc;
                                  }, 0).toLocaleString()}
                                </span>
                                <p className="text-[9px] text-white/30 mt-1">حساب تقديري للميزانيات</p>
                              </div>
                            </div>

                            {/* Card 2: Total Projects */}
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-28">
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">إجمالي طلبات الخدمة</span>
                              <div className="mt-2">
                                <span className="text-xl font-bold text-white">{serviceRequests.length} طلب</span>
                                <p className="text-[9px] text-white/30 mt-1">مقدمة من جميع العملاء</p>
                              </div>
                            </div>

                            {/* Card 3: Completion Rate */}
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-28">
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">نسبة إنجاز المشاريع</span>
                              <div className="mt-2">
                                <span className="text-xl font-bold text-violet-400">
                                  {serviceRequests.length > 0 
                                    ? Math.round((serviceRequests.filter(r => r.status === 'Completed').length / serviceRequests.length) * 100) 
                                    : 0}%
                                </span>
                                <p className="text-[9px] text-white/30 mt-1">
                                  {serviceRequests.filter(r => r.status === 'Completed').length} مشروع منجز
                                </p>
                              </div>
                            </div>

                            {/* Card 4: Active Pipeline count */}
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-28">
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">المشاريع النشطة حالياً</span>
                              <div className="mt-2">
                                <span className="text-xl font-bold text-blue-400">
                                  {serviceRequests.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length} مشروع
                                </span>
                                <p className="text-[9px] text-white/30 mt-1">قيد المراجعة أو التطوير</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Config Options */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                          <h3 className="text-base font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-emerald-400" />
                            إعدادات النظام الفنية (Technical Server Config)
                          </h3>

                          {/* AI Chat Status Toggle */}
                          <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                            <div>
                              <h4 className="text-sm font-semibold text-white">تفعيل محادثات الذكاء الاصطناعي (AI Chatbots)</h4>
                              <p className="text-xs text-white/50 mt-1">السماح للمستخدمين بالدردشة مع Velo Assistant و GPT-5.5</p>
                            </div>
                            <button
                              onClick={toggleChat}
                              className={`w-14 h-8 rounded-full p-1 transition-colors ${chatEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                            >
                              <motion.div
                                animate={{ x: chatEnabled ? 24 : 0 }}
                                className="w-6 h-6 bg-white rounded-full shadow-md"
                              />
                            </button>
                          </div>

                          {/* Maintenance Mode Toggle */}
                          <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                            <div>
                              <h4 className="text-sm font-semibold text-white">وضع الصيانة الفنية (Maintenance Mode)</h4>
                              <p className="text-xs text-white/50 mt-1">عرض شاشة الصيانة وإيقاف عمليات النظام مؤقتاً</p>
                            </div>
                            <button
                              onClick={toggleMaintenance}
                              className={`w-14 h-8 rounded-full p-1 transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-white/10'}`}
                            >
                              <motion.div
                                animate={{ x: maintenanceMode ? 24 : 0 }}
                                className="w-6 h-6 bg-white rounded-full shadow-md"
                              />
                            </button>
                          </div>

                          {/* Maintenance Mode Message Input */}
                          <AnimatePresence initial={false}>
                            {maintenanceMode && (
                              <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden space-y-3 p-4 bg-[#141414] border border-white/5 rounded-2xl"
                              >
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-semibold text-white/70 text-right">
                                    رسالة صفحة الصيانة (Maintenance Message)
                                  </label>
                                  <textarea
                                    value={maintenanceMessage}
                                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                                    placeholder="اكتب رسالة الصيانة المخصصة التي ستظهر للزوار باللغتين العربية والإنجليزية..."
                                    rows={3}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-amber-500/30 text-right resize-none font-sans"
                                    dir="rtl"
                                  />
                                </div>
                                <div className="flex justify-start">
                                  <button
                                    onClick={handleSaveMaintenanceMessage}
                                    disabled={savingMsg}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    {savingMsg ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    )}
                                    حفظ الرسالة المخصصة
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Token Slider and Level */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Log Level Selection */}
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-white/50">مستوى سجل الأخطاء (Log Level)</label>
                              <select 
                                value={logLevel} 
                                onChange={changeLogLevel}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500/30"
                              >
                                <option value="info" className="bg-[#111] text-white">تتبع كامل (INFO)</option>
                                <option value="warn" className="bg-[#111] text-white">تحذيرات فقط (WARN)</option>
                                <option value="error" className="bg-[#111] text-white">أخطاء حرجة (ERROR)</option>
                              </select>
                            </div>

                            {/* Max Token input */}
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold text-white/50">الحد الأقصى للرموز (Max Tokens Context)</label>
                              <div className="flex items-center gap-4">
                                <input 
                                  type="range" 
                                  min={1024} 
                                  max={16384} 
                                  step={1024}
                                  value={maxTokens} 
                                  onChange={changeMaxTokens}
                                  className="flex-1 accent-emerald-400"
                                />
                                <span className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/70 font-mono">
                                  {maxTokens}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : activeTab === 'requests' ? (
                      <motion.div
                        key="requests_tab"
                        initial={{ opacity: 0, x: 30, scale: 0.95, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -30, scale: 0.95, filter: 'blur(5px)' }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        {/* Search, Filter & Export */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="البحث بالاسم، الإيميل، أو رقم المعرف (VS)..."
                              value={requestsSearchQuery}
                              onChange={(e) => setRequestsSearchQuery(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-500/40 transition-all text-right"
                              dir="rtl"
                            />
                          </div>

                          <select
                            value={requestsFilterStatus}
                            onChange={(e) => setRequestsFilterStatus(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500/30 text-right font-semibold"
                            dir="rtl"
                          >
                            <option value="ALL" className="bg-[#111]">جميع الحالات</option>
                            {Object.keys(STATUS_DETAILS).map(s => (
                              <option key={s} value={s} className="bg-[#111]">{s}</option>
                            ))}
                          </select>

                          <button
                            onClick={exportRequestsToCSV}
                            className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                            تصدير CSV
                          </button>
                        </div>

                        {loadingRequests ? (
                          <div className="text-center py-10">
                            <Loader2 className="w-8 h-8 text-white/50 animate-spin mx-auto" />
                            <p className="text-xs text-white/40 mt-2">جاري تحميل طلبات الخدمات من السحابة...</p>
                          </div>
                        ) : serviceRequests.length === 0 ? (
                          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                            <Briefcase className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-white">لا توجد طلبات خدمة حالياً</h3>
                            <p className="text-xs text-white/40 mt-1">لم يتم تقديم أي طلب خدمة حتى الآن من قبل الزوار.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            
                            {/* Requests List Column */}
                            <div className="lg:col-span-5 space-y-3">
                              {/* Bulk Action Controls */}
                              {selectedRequestIds.length > 0 && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl space-y-2 text-right" dir="rtl">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-emerald-400 font-bold">{selectedRequestIds.length} طلبات محددة</span>
                                    <button 
                                      onClick={() => setSelectedRequestIds([])}
                                      className="text-white/40 hover:text-white text-[10px] cursor-none"
                                    >
                                      إلغاء التحديد
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    <button
                                      onClick={() => handleBulkStatusChange('Under Review')}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-semibold rounded border border-white/10 transition-all cursor-none"
                                    >
                                      قيد الدراسة
                                    </button>
                                    <button
                                      onClick={() => handleBulkStatusChange('In Progress')}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-semibold rounded border border-white/10 transition-all cursor-none"
                                    >
                                      قيد التنفيذ
                                    </button>
                                    <button
                                      onClick={() => handleBulkStatusChange('Completed')}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-semibold rounded border border-white/10 transition-all cursor-none"
                                    >
                                      مكتمل
                                    </button>
                                    <button
                                      onClick={() => setShowBulkDeleteConfirm(true)}
                                      className="px-2 py-1 bg-red-500/20 hover:bg-red-500/35 text-red-300 text-[10px] font-bold rounded border border-red-500/20 transition-all cursor-none"
                                    >
                                      حذف جماعي
                                    </button>
                                  </div>

                                  {showBulkDeleteConfirm && (
                                    <div className="bg-red-950/20 border border-red-500/25 p-2 rounded-lg text-center space-y-1.5 mt-2">
                                      <p className="text-[9px] text-red-300">هل أنت متأكد من حذف {selectedRequestIds.length} طلبات نهائياً؟</p>
                                      <div className="flex gap-2 justify-center">
                                        <button 
                                          onClick={handleBulkDelete}
                                          className="px-3 py-1 bg-red-500 text-black text-[9px] font-bold rounded cursor-none"
                                        >
                                          نعم، احذف
                                        </button>
                                        <button 
                                          onClick={() => setShowBulkDeleteConfirm(false)}
                                          className="px-3 py-1 bg-white/5 text-white text-[9px] font-semibold rounded border border-white/10 cursor-none"
                                        >
                                          تراجع
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Select All Toggle */}
                              <div className="flex justify-between items-center p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-right" dir="rtl">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">إجراءات مجمعة</span>
                                <button
                                  onClick={() => {
                                    const filtered = serviceRequests.filter(req => {
                                      const sQuery = requestsSearchQuery.trim().toLowerCase();
                                      const matchesSearch = !sQuery || 
                                        req.id.toLowerCase().includes(sQuery) || 
                                        req.fullName.toLowerCase().includes(sQuery) || 
                                        req.email.toLowerCase().includes(sQuery) || 
                                        req.projectTitle.toLowerCase().includes(sQuery);
                                      const matchesStatus = requestsFilterStatus === 'ALL' || req.status === requestsFilterStatus;
                                      return matchesSearch && matchesStatus;
                                    });
                                    const filteredIds = filtered.map(r => r.id);

                                    if (selectedRequestIds.length === filteredIds.length) {
                                      setSelectedRequestIds([]);
                                    } else {
                                      setSelectedRequestIds(filteredIds);
                                    }
                                  }}
                                  className="text-[10px] font-bold text-emerald-400 hover:underline cursor-none"
                                >
                                  {selectedRequestIds.length === serviceRequests.filter(req => {
                                    const sQuery = requestsSearchQuery.trim().toLowerCase();
                                    const matchesSearch = !sQuery || 
                                      req.id.toLowerCase().includes(sQuery) || 
                                      req.fullName.toLowerCase().includes(sQuery) || 
                                      req.email.toLowerCase().includes(sQuery) || 
                                      req.projectTitle.toLowerCase().includes(sQuery);
                                    const matchesStatus = requestsFilterStatus === 'ALL' || req.status === requestsFilterStatus;
                                    return matchesSearch && matchesStatus;
                                  }).length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                                </button>
                              </div>

                              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                {(() => {
                                  const filtered = serviceRequests.filter(req => {
                                    const sQuery = requestsSearchQuery.trim().toLowerCase();
                                    const matchesSearch = !sQuery || 
                                      req.id.toLowerCase().includes(sQuery) || 
                                      req.fullName.toLowerCase().includes(sQuery) || 
                                      req.email.toLowerCase().includes(sQuery) || 
                                      req.projectTitle.toLowerCase().includes(sQuery);
                                      
                                    const matchesStatus = requestsFilterStatus === 'ALL' || req.status === requestsFilterStatus;
                                    
                                    return matchesSearch && matchesStatus;
                                  });

                                  if (filtered.length === 0) {
                                    return (
                                      <div className="text-center py-8 text-white/30 text-xs">
                                        لا توجد نتائج تطابق خيارات التصفية المدخلة
                                      </div>
                                    );
                                  }

                                  return filtered.map(req => {
                                    const stat = STATUS_DETAILS[req.status as any] || { label: req.status, color: 'text-white', bg: 'bg-white/10', border: 'border-white/10' };
                                    const isSelected = selectedRequestAdmin?.id === req.id;
                                    return (
                                      <div key={req.id} className="relative group">
                                        <button
                                          onClick={() => handleSelectRequestAdmin(req)}
                                          className={`w-full text-right p-4 pl-12 rounded-xl border backdrop-blur-md transition-all flex flex-col gap-2 hover:scale-[1.01] cursor-none ${
                                            isSelected 
                                              ? 'bg-white/[0.08] border-white shadow-lg' 
                                              : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                          }`}
                                        >
                                          <div className="flex justify-between items-center w-full">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${stat.bg} ${stat.color} ${stat.border}`}>
                                              {stat.label}
                                            </span>
                                            <span className="text-[10px] font-mono text-white/50">{req.id}</span>
                                          </div>
                                          <div>
                                            <h4 className="text-xs font-bold text-white truncate">{req.projectTitle}</h4>
                                            <p className="text-[10px] text-white/40 mt-0.5 truncate">{req.fullName} ({req.email})</p>
                                          </div>
                                        </button>
                                        
                                        {/* Selection Checkbox */}
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                          <input
                                            type="checkbox"
                                            checked={selectedRequestIds.includes(req.id)}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              if (selectedRequestIds.includes(req.id)) {
                                                setSelectedRequestIds(prev => prev.filter(id => id !== req.id));
                                              } else {
                                                setSelectedRequestIds(prev => [...prev, req.id]);
                                              }
                                            }}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/40 cursor-none"
                                          />
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            {/* Detail / Editing Column */}
                            <div className="lg:col-span-7">
                              {selectedRequestAdmin ? (
                                <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-6 text-right" dir="rtl">
                                  
                                  {/* Request Details Header */}
                                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2">
                                      {showDeleteConfirmAdmin !== selectedRequestAdmin.id ? (
                                        <button
                                          onClick={() => setShowDeleteConfirmAdmin(selectedRequestAdmin.id)}
                                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black rounded-lg transition-colors flex items-center justify-center"
                                          title="حذف الطلب نهائياً"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 rounded-lg p-1">
                                          <span className="text-[10px] text-red-300 font-medium px-1">تأكيد الحذف؟</span>
                                          <button
                                            onClick={() => handleDeleteRequestAdmin(selectedRequestAdmin.id)}
                                            className="text-[10px] px-2 py-0.5 bg-red-500 text-black font-bold rounded hover:bg-red-600 transition-all"
                                          >
                                            نعم
                                          </button>
                                          <button
                                            onClick={() => setShowDeleteConfirmAdmin(null)}
                                            className="text-[10px] px-2 py-0.5 bg-white/10 text-white font-bold rounded hover:bg-white/20 transition-all"
                                          >
                                            لا
                                          </button>
                                        </div>
                                      )}
                                      
                                      <button
                                        onClick={() => setIsEditingDetails(!isEditingDetails)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                                          isEditingDetails 
                                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30' 
                                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                                        }`}
                                      >
                                        {isEditingDetails ? 'إلغاء التعديل الكامل' : 'تعديل كامل البيانات'}
                                      </button>
                                    </div>

                                    <div>
                                      <h3 className="text-sm font-bold text-white">
                                        {isEditingDetails ? 'تعديل بيانات طلب الخدمة' : selectedRequestAdmin.projectTitle}
                                      </h3>
                                      <p className="text-[10px] text-emerald-400 mt-0.5 font-semibold">
                                        {isEditingDetails ? `تعديل الطلب رقم: ${selectedRequestAdmin.id}` : selectedRequestAdmin.selectedService}
                                      </p>
                                    </div>
                                  </div>

                                  {isEditingDetails ? (
                                    /* FULL CONTROL / EDITING MODE FORM */
                                    <div className="space-y-4 text-xs">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Project Title */}
                                        <div className="space-y-1 sm:col-span-2">
                                          <label className="block text-[10px] text-white/40">عنوان المشروع</label>
                                          <input
                                            type="text"
                                            value={editProjectTitle}
                                            onChange={(e) => setEditProjectTitle(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right font-semibold"
                                          />
                                        </div>

                                        {/* Selected Service */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40">نوع الخدمة</label>
                                          <input
                                            type="text"
                                            value={editSelectedService}
                                            onChange={(e) => setEditSelectedService(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                          />
                                        </div>

                                        {/* Full Name */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40 font-semibold">اسم العميل</label>
                                          <input
                                            type="text"
                                            value={editFullName}
                                            onChange={(e) => setEditFullName(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                          />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40 font-mono">البريد الإلكتروني</label>
                                          <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-left font-mono"
                                            dir="ltr"
                                          />
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40">رقم الهاتف / الواتساب</label>
                                          <input
                                            type="text"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-left font-mono"
                                            dir="ltr"
                                          />
                                        </div>

                                        {/* Company */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40">الشركة</label>
                                          <input
                                            type="text"
                                            value={editCompany}
                                            onChange={(e) => setEditCompany(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                          />
                                        </div>

                                        {/* Country */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40">الدولة</label>
                                          <input
                                            type="text"
                                            value={editCountry}
                                            onChange={(e) => setEditCountry(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                          />
                                        </div>

                                        {/* Estimated Budget */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40">الميزانية</label>
                                          <input
                                            type="text"
                                            value={editEstimatedBudget}
                                            onChange={(e) => setEditEstimatedBudget(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                          />
                                        </div>

                                        {/* Preferred Timeline */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] text-white/40">الجدول الزمني</label>
                                          <input
                                            type="text"
                                            value={editPreferredTimeline}
                                            onChange={(e) => setEditPreferredTimeline(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                          />
                                        </div>

                                        {/* Project Description */}
                                        <div className="space-y-1 sm:col-span-2">
                                          <label className="block text-[10px] text-white/40">الوصف التفصيلي للمشروع</label>
                                          <textarea
                                            value={editProjectDescription}
                                            onChange={(e) => setEditProjectDescription(e.target.value)}
                                            rows={3}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right resize-none font-sans"
                                          />
                                        </div>

                                        {/* Reference Links */}
                                        <div className="space-y-1 sm:col-span-2">
                                          <label className="block text-[10px] text-white/40">روابط مرجعية / أمثلة</label>
                                          <textarea
                                            value={editReferenceLinks}
                                            onChange={(e) => setEditReferenceLinks(e.target.value)}
                                            rows={2}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right resize-none font-sans"
                                          />
                                        </div>

                                        {/* Additional Notes */}
                                        <div className="space-y-1 sm:col-span-2">
                                          <label className="block text-[10px] text-white/40">ملاحظات إضافية</label>
                                          <textarea
                                            value={editAdditionalNotes}
                                            onChange={(e) => setEditAdditionalNotes(e.target.value)}
                                            rows={2}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right resize-none font-sans"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* BEAUTIFUL STATIC DETAILS MODE WITH COMPLETE METADATA */
                                    <>
                                      {/* Client Information */}
                                      <div className="space-y-1.5 text-xs font-sans">
                                        <div className="flex justify-between p-2 bg-black/40 rounded-lg">
                                          <span className="font-bold text-white">{selectedRequestAdmin.fullName}</span>
                                          <span className="text-white/40">العميل</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-black/40 rounded-lg">
                                          <span className="font-mono text-white select-all">{selectedRequestAdmin.email}</span>
                                          <span className="text-white/40">البريد الإلكتروني</span>
                                        </div>
                                        {selectedRequestAdmin.company && (
                                          <div className="flex justify-between p-2 bg-black/40 rounded-lg">
                                            <span className="text-white">{selectedRequestAdmin.company}</span>
                                            <span className="text-white/40">الشركة</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between p-2 bg-black/40 rounded-lg">
                                          <span className="text-white">{selectedRequestAdmin.country}</span>
                                          <span className="text-white/40">الدولة</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-black/40 rounded-lg">
                                          <span className="text-white">{selectedRequestAdmin.estimatedBudget}</span>
                                          <span className="text-white/40">الميزانية المقترحة</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-black/40 rounded-lg">
                                          <span className="text-white">{selectedRequestAdmin.preferredTimeline}</span>
                                          <span className="text-white/40">الجدول الزمني</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-black/40 rounded-lg">
                                          <span className="text-white">{selectedRequestAdmin.preferredContactMethod}</span>
                                          <span className="text-white/40">طريقة الاتصال</span>
                                        </div>
                                        {selectedRequestAdmin.phone && (
                                          <div className="flex justify-between p-2 bg-[#092e1b] rounded-lg border border-emerald-500/20">
                                            <span className="font-mono text-emerald-400 select-all font-bold">{selectedRequestAdmin.phone}</span>
                                            <span className="text-emerald-400/80 font-semibold">رقم الهاتف / الواتساب</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Project Description */}
                                      <div className="space-y-1.5">
                                        <p className="text-[10px] text-white/40">الوصف التفصيلي المدخل من العميل</p>
                                        <p className="text-xs text-white/80 bg-black/20 p-3 rounded-lg border border-white/5 whitespace-pre-line leading-relaxed max-h-[150px] overflow-y-auto">
                                          {selectedRequestAdmin.projectDescription}
                                        </p>
                                      </div>

                                      {/* Reference Links */}
                                      {selectedRequestAdmin.referenceLinks && (
                                        <div className="space-y-1.5">
                                          <p className="text-[10px] text-white/40 font-semibold text-emerald-400">روابط مرجعية / أمثلة</p>
                                          <p className="text-xs text-white/80 bg-black/20 p-3 rounded-lg border border-white/5 whitespace-pre-line leading-relaxed max-h-[100px] overflow-y-auto select-all font-mono">
                                            {selectedRequestAdmin.referenceLinks}
                                          </p>
                                        </div>
                                      )}

                                      {/* Additional Notes */}
                                      {selectedRequestAdmin.additionalNotes && (
                                        <div className="space-y-1.5">
                                          <p className="text-[10px] text-white/40">ملاحظات إضافية من العميل</p>
                                          <p className="text-xs text-white/80 bg-black/20 p-3 rounded-lg border border-white/5 whitespace-pre-line leading-relaxed max-h-[100px] overflow-y-auto">
                                            {selectedRequestAdmin.additionalNotes}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* Attachment Viewer */}
                                  {selectedRequestAdmin.attachmentData && selectedRequestAdmin.attachmentName ? (
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="font-semibold text-white/80 truncate max-w-[150px]">{selectedRequestAdmin.attachmentName}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = selectedRequestAdmin.attachmentData;
                                          link.download = selectedRequestAdmin.attachmentName;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          toast.success("بدء تحميل الملف المرفق");
                                        }}
                                        className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-[10px] font-bold text-white rounded-lg transition-all flex items-center gap-1"
                                      >
                                        <FileDown className="w-3 h-3" />
                                        تحميل الملف
                                      </button>
                                    </div>
                                  ) : null}

                                  {/* Admin Editing Options */}
                                  <div className="border-t border-white/5 pt-4 space-y-4">
                                    <h4 className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <Cpu className="w-4 h-4" />
                                        إجراءات إدارة وتحديث الطلب الفنية
                                      </span>
                                      
                                      {/* Quick Cancel Button */}
                                      {selectedRequestAdmin.status !== 'Cancelled' && (
                                        <div className="flex items-center gap-1.5">
                                          {!showCancelConfirmAdmin ? (
                                            <button
                                              onClick={() => setShowCancelConfirmAdmin(true)}
                                              className="text-[10px] px-2 py-1 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/20 rounded-lg text-red-400 transition-all font-bold"
                                            >
                                              إلغاء الطلب (Cancel)
                                            </button>
                                          ) : (
                                            <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 rounded-lg p-1">
                                              <span className="text-[9px] text-red-300 font-medium px-1">متأكد؟</span>
                                              <button
                                                onClick={handleCancelRequestAdmin}
                                                className="text-[9px] px-2 py-0.5 bg-red-500 text-black font-bold rounded hover:bg-red-600 transition-all"
                                              >
                                                نعم
                                              </button>
                                              <button
                                                onClick={() => setShowCancelConfirmAdmin(false)}
                                                className="text-[9px] px-2 py-0.5 bg-white/10 text-white font-bold rounded hover:bg-white/20 transition-all"
                                              >
                                                لا
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Status Select */}
                                      <div className="space-y-1.5">
                                        <label className="block text-[10px] text-white/40">حالة الطلب الحالية</label>
                                        <select
                                          value={editStatus}
                                          onChange={(e) => setEditStatus(e.target.value)}
                                          className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                        >
                                          {Object.keys(STATUS_DETAILS).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Assigned Team */}
                                      <div className="space-y-1.5">
                                        <label className="block text-[10px] text-white/40">تعيين فريق التطوير</label>
                                        <input
                                          type="text"
                                          value={editAssignedTeam}
                                          onChange={(e) => setEditAssignedTeam(e.target.value)}
                                          placeholder="اسم المطور أو رئيس الفريق"
                                          className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                        />
                                      </div>

                                      {/* Estimated Delivery */}
                                      <div className="space-y-1.5">
                                        <label className="block text-[10px] text-white/40">تاريخ التسليم المقدر</label>
                                        <input
                                          type="text"
                                          value={editEstimatedDelivery}
                                          onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                                          placeholder="مثال: 3 أسابيع، أو 15 أغسطس"
                                          className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500/30 text-right"
                                        />
                                      </div>

                                      {/* Update Note */}
                                      <div className="space-y-1.5 sm:col-span-2">
                                        <label className="block text-[10px] text-white/40">إضافة مذكرة تحديث للعميل (تظهر في تتبع العميل)</label>
                                        <textarea
                                          value={editLatestUpdate}
                                          onChange={(e) => setEditLatestUpdate(e.target.value)}
                                          placeholder="اكتب هنا التحديثات الأخيرة (مثال: تم تجهيز عرض السعر الفني وبانتظار الموافقة)"
                                          rows={2}
                                          className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-emerald-500/30 text-right resize-none font-sans"
                                        />
                                      </div>
                                    </div>

                                    <button
                                      onClick={handleUpdateRequestAdmin}
                                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      {isEditingDetails ? 'حفظ البيانات الجديدة وتحديث الطلب' : 'حفظ التعديلات وتنبيه العميل حياً'}
                                    </button>
                                  </div>

                                </div>
                              ) : (
                                <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl text-white/30 text-xs flex flex-col items-center justify-center gap-2">
                                  <Compass className="w-8 h-8 animate-pulse text-white/20" />
                                  اختر طلب خدمة من القائمة الجانبية لاستعراض البيانات وتحديث المراحل
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </motion.div>
                    ) : activeTab === 'reports' ? (
                      <motion.div
                        key="reports_tab"
                        initial={{ opacity: 0, x: 30, scale: 0.95, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -30, scale: 0.95, filter: 'blur(5px)' }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                        className="space-y-4"
                      >
                        {loadingReports ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start gap-4 relative overflow-hidden"
                              >
                                <motion.div 
                                  animate={{ x: ["-100%", "100%"] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent w-full"
                                />
                                <div className="flex-1 space-y-4 w-full">
                                  <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3">
                                    <div className="h-5 w-20 bg-white/5 rounded-full"></div>
                                    <div className="h-4 w-32 bg-white/5 rounded-full"></div>
                                    <div className="h-4 w-40 bg-white/10 rounded-full"></div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="h-3 w-full bg-white/10 rounded-full"></div>
                                    <div className="h-3 w-4/5 bg-white/10 rounded-full sm:float-right"></div>
                                  </div>
                                </div>
                                <div className="self-end sm:self-center h-10 w-10 bg-white/5 rounded-xl shrink-0"></div>
                              </motion.div>
                            ))}
                          </div>
                        ) : reports.length === 0 ? (
                          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-white">لا توجد بلاغات حالياً</h3>
                            <p className="text-xs text-white/40 mt-1">كل شيء يعمل بشكل ممتاز ولا توجد مشاكل معلنة من المستخدمين.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-xs text-white/40 text-right px-2">
                              يتم عرض البلاغات مرتبة من الأحدث إلى الأقدم (Firestore sync)
                            </p>
                            <div className="space-y-3">
                              {reports.map((report) => (
                                <div 
                                  key={report.id} 
                                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col sm:flex-row justify-between items-start gap-4 text-right"
                                >
                                  <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3">
                                      <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
                                        <AlertOctagon className="w-3.5 h-3.5" />
                                        بلاغ خلل
                                      </span>
                                      <span className="text-xs text-white/50 flex items-center gap-1 font-mono">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(report.createdAt).toLocaleString('ar-EG', { hour12: true })}
                                      </span>
                                      <span className="text-sm font-semibold text-emerald-400 font-sans">{report.email}</span>
                                    </div>
                                    <p className="text-sm text-white/80 leading-relaxed font-sans">{report.issue}</p>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteReport(report.id)}
                                    disabled={deletingId === report.id}
                                    className="self-end sm:self-center p-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-black rounded-xl transition-all disabled:opacity-50 group shrink-0"
                                    title="حل البلاغ وحذفه"
                                  >
                                    {deletingId === report.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
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
                            {/* Search Bar */}
                            <div className="relative">
                              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="ابحث بالبريد الإلكتروني أو المعرف (ID)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all text-right"
                                dir="rtl"
                              />
                              {searchQuery && (
                                <button
                                  onClick={() => setSearchQuery('')}
                                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xs bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-2.5 py-1 rounded-xl transition-colors"
                                >
                                  مسح
                                </button>
                              )}
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 flex justify-between items-center text-right" dir="rtl">
                              <span className="text-white font-medium text-sm">
                                عدد الحسابات الكلية: {usersList.length}
                                {searchQuery && ` (المطابقة للبحث: ${
                                  usersList.filter(u => {
                                    const q = searchQuery.toLowerCase().trim();
                                    return (u.email && u.email.toLowerCase().includes(q)) || (u.uid && u.uid.toLowerCase().includes(q));
                                  }).length
                                })`}
                              </span>
                            </div>

                            {(() => {
                              const filtered = usersList.filter(u => {
                                const q = searchQuery.toLowerCase().trim();
                                if (!q) return true;
                                return (u.email && u.email.toLowerCase().includes(q)) || (u.uid && u.uid.toLowerCase().includes(q));
                              });

                              if (filtered.length === 0) {
                                return (
                                  <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl text-white/40">
                                    لا توجد حسابات مطابقة للبحث "{searchQuery}"
                                  </div>
                                );
                              }

                              return filtered.map((usr) => (
                                <motion.div
                                  key={usr.uid}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
                                >
                                  <div className="flex-1 text-right w-full">
                                    <div className="flex flex-row-reverse items-center gap-3 mb-2 justify-start flex-wrap">
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
                                    <p className="text-white/90 text-sm font-medium font-mono text-left sm:text-right">{usr.email}</p>
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
                              ));
                            })()}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
