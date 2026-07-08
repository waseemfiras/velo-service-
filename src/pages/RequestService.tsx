import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Code2, 
  Monitor, 
  PenTool, 
  LayoutGrid, 
  Award, 
  ShoppingBag, 
  RefreshCw, 
  Sparkles, 
  Server,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  X,
  MessageCircle,
  HelpCircle,
  Clock,
  Briefcase,
  DollarSign,
  Calendar,
  Globe,
  Compass,
  Lock,
  Loader2,
  Search,
  User,
  AlertCircle,
  Mail,
  CreditCard,
  Download,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  createServiceRequest, 
  getServiceRequest, 
  getUserRequests, 
  updateServiceRequestAdmin,
  ServiceRequest, 
  STATUS_DETAILS 
} from '../lib/serviceRequests';

// Available website-only services (12 professional categories)
const AVAILABLE_SERVICES_I18N = [
  { 
    id: 'web-design', 
    titleEn: 'Website Design', 
    titleAr: 'تصميم مواقع الويب', 
    descEn: 'Visual wireframes, typography, and interactive modern Figma layouts.', 
    descAr: 'رسومات تخطيطية، خطوط متناسقة، وتصاميم واجهات تفاعلية حديثة في فيجما.', 
    icon: PenTool, 
    color: 'from-fuchsia-500/20 to-violet-500/20', 
    glow: 'rgba(217, 70, 239, 0.15)' 
  },
  { 
    id: 'web-dev', 
    titleEn: 'Website Development', 
    titleAr: 'تطوير وبرمجة المواقع', 
    descEn: 'High-performance website development using React, Next.js, and Vite.', 
    descAr: 'برمجة وتطوير مواقع الويب متفوقة الأداء وسريعة التحميل باستخدام React و Next.js.', 
    icon: Code2, 
    color: 'from-cyan-500/20 to-blue-500/20', 
    glow: 'rgba(6, 182, 212, 0.15)' 
  },
  { 
    id: 'web-redesign', 
    titleEn: 'Website Redesign', 
    titleAr: 'إعادة تصميم المواقع', 
    descEn: 'Modernize your obsolete website design and speed up user interactions.', 
    descAr: 'تحديث مظهر موقعك الحالي وترقية لغات برمجته لتسريعه وزيادة كفاءته.', 
    icon: RefreshCw, 
    color: 'from-blue-500/20 to-teal-500/20', 
    glow: 'rgba(59, 130, 246, 0.15)' 
  },
  { 
    id: 'landing-design', 
    titleEn: 'Landing Page Design', 
    titleAr: 'تصميم صفحات الهبوط', 
    descEn: 'High-converting Figma landing page layouts optimized to turn visitors into leads.', 
    descAr: 'تصاميم واجهات صفحات الهبوط في فيجما مصممة خصيصاً لجذب الانتباه وزيادة التحويل.', 
    icon: PenTool, 
    color: 'from-purple-500/20 to-pink-500/20', 
    glow: 'rgba(168, 85, 247, 0.15)' 
  },
  { 
    id: 'landing-dev', 
    titleEn: 'Landing Page Development', 
    titleAr: 'برمجة صفحات الهبوط', 
    descEn: 'Single-page responsive development with smooth Framer Motion entry effects.', 
    descAr: 'تطوير صفحة هبوط واحدة مستجيبة مع تأثيرات دخول حركية سلسة وجذابة.', 
    icon: Monitor, 
    color: 'from-rose-500/20 to-red-500/20', 
    glow: 'rgba(244, 63, 94, 0.15)' 
  },
  { 
    id: 'business-site', 
    titleEn: 'Business Website', 
    titleAr: 'موقع شركات وأعمال', 
    descEn: 'Professional web identity with custom contact forms and service layouts.', 
    descAr: 'هوية ويب احترافية للشركات والناشئين مع نماذج اتصال متطورة وخرائط.', 
    icon: Globe, 
    color: 'from-indigo-500/20 to-violet-500/20', 
    glow: 'rgba(99, 102, 241, 0.15)' 
  },
  { 
    id: 'portfolio-site', 
    titleEn: 'Portfolio Website', 
    titleAr: 'موقع أعمال شخصي', 
    descEn: 'Bespoke creative showcase for developers, designers, and agencies.', 
    descAr: 'معرض أعمال شخصي وتفاعلي متقن ومثالي لعرض المهارات والمشاريع السابقة.', 
    icon: Award, 
    color: 'from-amber-500/20 to-orange-500/20', 
    glow: 'rgba(245, 158, 11, 0.15)' 
  },
  { 
    id: 'corporate-site', 
    titleEn: 'Corporate Website', 
    titleAr: 'موقع مؤسسات كبرى', 
    descEn: 'Comprehensive corporate portals with secure user roles and custom architecture.', 
    descAr: 'مواقع ويب ضخمة ومصممة خصيصاً للهيئات والشركات الكبرى بأعلى حماية.', 
    icon: Server, 
    color: 'from-emerald-500/20 to-teal-500/20', 
    glow: 'rgba(16, 185, 129, 0.15)' 
  },
  { 
    id: 'custom-web', 
    titleEn: 'Custom Website', 
    titleAr: 'موقع ويب مخصص', 
    descEn: 'Bespoke complex website tailored step-by-step from structural blueprint to final launch.', 
    descAr: 'موقع ويب مخصص وفريد تماماً ومطور خصيصاً من الصفر لتلبية أدق الاحتياجات.', 
    icon: Sparkles, 
    color: 'from-fuchsia-500/20 to-violet-500/20', 
    glow: 'rgba(217, 70, 239, 0.15)' 
  },
  { 
    id: 'web-maintenance', 
    titleEn: 'Website Maintenance', 
    titleAr: 'صيانة وإشراف المواقع', 
    descEn: 'Ongoing technical maintenance, core security patches, and database backups.', 
    descAr: 'متابعة تقنية دورية، تثبيت التحديثات الأمنية، وجدولة النسخ الاحتياطي للموقع.', 
    icon: Clock, 
    color: 'from-neutral-500/20 to-neutral-700/20', 
    glow: 'rgba(255, 255, 255, 0.1)' 
  },
  { 
    id: 'performance-opt', 
    titleEn: 'Performance Optimization', 
    titleAr: 'تسريع وتحسين أداء المواقع', 
    descEn: 'Boost loading times, optimize media assets, and secure high Lighthouse scoring.', 
    descAr: 'تسريع تحميل الصفحات لسرعة البرق لضمان تجربة مثالية وعلامة 100% على مؤشرات جوجل.', 
    icon: Compass, 
    color: 'from-teal-500/20 to-cyan-500/20', 
    glow: 'rgba(20, 184, 166, 0.15)' 
  },
  { 
    id: 'ui-ux-web', 
    titleEn: 'UI/UX for Websites', 
    titleAr: 'تجربة واجهات المواقع', 
    descEn: 'Bespoke design audit and optimization of user journey for maximum clarity.', 
    descAr: 'دراسة وتدقيق تجربة الاستخدام وتعديل مسارات تصفح الموقع لرفع المبيعات.', 
    icon: Briefcase, 
    color: 'from-rose-500/20 to-pink-500/20', 
    glow: 'rgba(244, 63, 94, 0.15)' 
  }
];

const BUDGET_OPTIONS = [
  'Under $100',
  '$100 – $300',
  '$300 – $700',
  '$700 – $1500',
  '$1500+',
  "Let's Discuss"
];

const TIMELINE_OPTIONS = [
  'ASAP',
  'Within 1 Week',
  'Within 2 Weeks',
  'Within 1 Month',
  'Flexible'
];

export function RequestService() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language, dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  // Integrated active tab: 'new' | 'track' | 'dashboard'
  const [activeTab, setActiveTab] = useState<'new' | 'track' | 'dashboard'>('new');

  // Synchronize Tab with Search Query
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'track' || tab === 'dashboard') {
      setActiveTab(tab);
    } else {
      setActiveTab('new');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'new' | 'track' | 'dashboard') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  };

  // ==========================================
  // STATE & LOGIC: NEW REQUEST SUBMISSION
  // ==========================================
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);
  const [requestId, setRequestId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [selectedService, setSelectedService] = useState<string>('');
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState(BUDGET_OPTIONS[0]);
  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [customBudget, setCustomBudget] = useState('');
  const [preferredTimeline, setPreferredTimeline] = useState(TIMELINE_OPTIONS[0]);
  const [country, setCountry] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Email' | 'WhatsApp'>('Email');
  const [phone, setPhone] = useState('');

  // Attachment
  const [attachment, setAttachment] = useState<{ name: string; type: string; data: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync logged in user details if available
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.displayName || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  // Pre-fill service category if supplied in URL params
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && activeTab === 'new') {
      // Find matching service in available lists
      const matched = AVAILABLE_SERVICES_I18N.find(
        s => s.titleEn.toLowerCase() === serviceParam.toLowerCase() || s.titleAr === serviceParam
      );
      if (matched) {
        setSelectedService(matched.titleEn);
        setStep(2); // Instantly skip to details screen for pre-filled service! Very premium
      }
    }
  }, [searchParams, activeTab]);

  const processFile = (file: File) => {
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'الحد الأقصى للمرفقات هو 1.5 ميجابايت للتخزين السحابي السريع.' : 'Max attachment size is 1.5MB for fast loading.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        data: reader.result as string
      });
      toast.success(t('field_attachment_success'));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = t('error_required_fullname');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = t('error_invalid_email');
    if (preferredContactMethod === 'WhatsApp' && !phone.trim()) {
      newErrors.phone = t('error_required_phone');
    }
    if (!projectTitle.trim()) newErrors.projectTitle = t('error_required_project_title');
    if (!projectDescription.trim() || projectDescription.length < 20) {
      newErrors.projectDescription = t('error_required_description');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewRequestSubmit = async () => {
    if (!validateForm()) {
      toast.error(t('error_validation_toast'));
      return;
    }
    setIsSubmitting(true);
    try {
      const finalBudget = isCustomBudget ? (customBudget.trim() || BUDGET_OPTIONS[0]) : estimatedBudget;
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        projectTitle: projectTitle.trim(),
        selectedService,
        estimatedBudget: finalBudget,
        preferredTimeline,
        country: country.trim() || 'Not Specified',
        projectDescription: projectDescription.trim(),
        referenceLinks: referenceLinks.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
        attachmentName: attachment?.name,
        attachmentType: attachment?.type,
        attachmentData: attachment?.data,
        preferredContactMethod
      };

      const generatedId = await createServiceRequest(payload);
      setRequestId(generatedId);
      toast.success(language === 'ar' ? 'تم تقديم طلبك بنجاح وحفظه!' : 'Your request has been successfully submitted and saved!');
      setStep('success');

      // Cache email in guest storage for quick dashboard access later
      localStorage.setItem('velo_dashboard_guest_email', email.trim());
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(language === 'ar' ? 'فشل إرسال الطلب. يرجى مراجعة الاتصال وإعادة المحاولة.' : 'Failed to submit request. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppSubmitLink = () => {
    const finalBudget = isCustomBudget ? (customBudget.trim() || BUDGET_OPTIONS[0]) : estimatedBudget;
    const text = encodeURIComponent(
      language === 'ar' 
        ? `مرحباً فريق Velo Service،\nلقد قمت بتقديم طلب تصميم موقع بنجاح.\n\nرقم المرجع: ${requestId}\nالاسم الكامل: ${fullName}\nالخدمة: ${selectedService}\nالميزانية المقترحة: ${finalBudget}\n\nيرجى مراجعة طلبي لتجهيز عرض السعر الفني والمالي المخصص لي. شكراً لكم.`
        : `Hello Velo Service,\nI have successfully submitted a new website request.\n\nReference ID: ${requestId}\nFull Name: ${fullName}\nService: ${selectedService}\nEstimated Budget: ${finalBudget}\n\nPlease review my request and provide a tailored technical quotation. Thank you.`
    );
    return `https://wa.me/970594292646?text=${text}`;
  };

  // ==========================================
  // STATE & LOGIC: TRACK REQUEST
  // ==========================================
  const [trackEmail, setTrackEmail] = useState('');
  const [trackId, setTrackId] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackedRequest, setTrackedRequest] = useState<ServiceRequest | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackEmail.trim() || !trackId.trim()) {
      toast.error(t('track_error_validation'));
      return;
    }

    setTrackLoading(true);
    setTrackedRequest(null);
    try {
      const res = await getServiceRequest(trackId.trim(), trackEmail.trim());
      if (res) {
        setTrackedRequest(res);
        toast.success(t('track_success_toast'));
      } else {
        toast.error(t('track_error_not_found'));
      }
    } catch (error) {
      console.error('Error tracking request:', error);
      toast.error(t('track_error_not_found'));
    } finally {
      setTrackLoading(false);
    }
  };

  // ==========================================
  // STATE & LOGIC: CLIENT DASHBOARD
  // ==========================================
  const [dashEmailInput, setDashEmailInput] = useState('');
  const [dashActiveEmail, setDashActiveEmail] = useState('');
  const [dashRequests, setDashRequests] = useState<ServiceRequest[]>([]);
  const [dashSelectedRequest, setDashSelectedRequest] = useState<ServiceRequest | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // States for client-side editing of service requests on dashboard
  const [isEditingDashRequest, setIsEditingDashRequest] = useState(false);
  const [editDashProjectTitle, setEditDashProjectTitle] = useState('');
  const [editDashSelectedService, setEditDashSelectedService] = useState('');
  const [editDashCompany, setEditDashCompany] = useState('');
  const [editDashPhone, setEditDashPhone] = useState('');
  const [editDashPreferredContactMethod, setEditDashPreferredContactMethod] = useState<'Email' | 'WhatsApp'>('Email');
  const [editDashEstimatedBudget, setEditDashEstimatedBudget] = useState('');
  const [editDashPreferredTimeline, setEditDashPreferredTimeline] = useState('');
  const [editDashProjectDescription, setEditDashProjectDescription] = useState('');
  const [editDashReferenceLinks, setEditDashReferenceLinks] = useState('');
  const [editDashAdditionalNotes, setEditDashAdditionalNotes] = useState('');
  const [editDashCountry, setEditDashCountry] = useState('');
  const [isSavingDashEdit, setIsSavingDashEdit] = useState(false);

  const startEditingDashRequest = () => {
    if (!dashSelectedRequest) return;
    setEditDashProjectTitle(dashSelectedRequest.projectTitle || '');
    setEditDashSelectedService(dashSelectedRequest.selectedService || '');
    setEditDashCompany(dashSelectedRequest.company || '');
    setEditDashPhone(dashSelectedRequest.phone || '');
    setEditDashPreferredContactMethod(dashSelectedRequest.preferredContactMethod || 'Email');
    setEditDashEstimatedBudget(dashSelectedRequest.estimatedBudget || '');
    setEditDashPreferredTimeline(dashSelectedRequest.preferredTimeline || '');
    setEditDashProjectDescription(dashSelectedRequest.projectDescription || '');
    setEditDashReferenceLinks(dashSelectedRequest.referenceLinks || '');
    setEditDashAdditionalNotes(dashSelectedRequest.additionalNotes || '');
    setEditDashCountry(dashSelectedRequest.country || '');
    setIsEditingDashRequest(true);
  };

  const handleSaveDashRequestEdit = async () => {
    if (!dashSelectedRequest) return;
    if (!editDashProjectTitle.trim()) {
      toast.error(language === 'ar' ? 'عنوان المشروع مطلوب' : 'Project title is required');
      return;
    }
    if (!editDashProjectDescription.trim()) {
      toast.error(language === 'ar' ? 'وصف المشروع مطلوب' : 'Project description is required');
      return;
    }

    setIsSavingDashEdit(true);
    try {
      const updates = {
        projectTitle: editDashProjectTitle,
        selectedService: editDashSelectedService,
        company: editDashCompany,
        phone: editDashPhone,
        preferredContactMethod: editDashPreferredContactMethod,
        estimatedBudget: editDashEstimatedBudget,
        preferredTimeline: editDashPreferredTimeline,
        projectDescription: editDashProjectDescription,
        referenceLinks: editDashReferenceLinks,
        additionalNotes: editDashAdditionalNotes,
        country: editDashCountry,
      };

      await updateServiceRequestAdmin(dashSelectedRequest.id, updates);
      toast.success(language === 'ar' ? 'تم تحديث بيانات الطلب بنجاح.' : 'Request details updated successfully.');

      // Update local states
      setDashRequests(prev => prev.map(r => r.id === dashSelectedRequest.id ? { ...r, ...updates } : r));
      setDashSelectedRequest(prev => prev ? { ...prev, ...updates } : null);
      setIsEditingDashRequest(false);
    } catch (err) {
      console.error('Error saving dashboard request updates:', err);
      toast.error(language === 'ar' ? 'فشل تعديل الطلب. يرجى المحاولة لاحقاً.' : 'Failed to update request details. Please try again.');
    } finally {
      setIsSavingDashEdit(false);
    }
  };

  // Sync dashboard active email from cached guest credentials or logged in user
  useEffect(() => {
    if (user?.email) {
      setDashActiveEmail(user.email);
    } else {
      const cached = localStorage.getItem('velo_dashboard_guest_email');
      if (cached) {
        setDashActiveEmail(cached);
        setDashEmailInput(cached);
      }
    }
  }, [user]);

  // Load dashboard requests list when active email changes
  useEffect(() => {
    if (!dashActiveEmail) return;

    const fetchDashRequests = async () => {
      setDashLoading(true);
      setDashError(null);
      try {
        const data = await getUserRequests(dashActiveEmail);
        setDashRequests(data);
        if (data.length > 0) {
          setDashSelectedRequest(data[0]);
        } else {
          setDashSelectedRequest(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard requests:', err);
        setDashError(language === 'ar' ? 'حدث خطأ أثناء تحميل طلباتك. يرجى المحاولة لاحقاً.' : 'An error occurred while loading your requests. Please retry.');
      } finally {
        setDashLoading(false);
      }
    };

    fetchDashRequests();
  }, [dashActiveEmail, language]);

  const handleDashLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashEmailInput.trim() || !/\S+@\S+\.\S+/.test(dashEmailInput)) {
      toast.error(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }
    localStorage.setItem('velo_dashboard_guest_email', dashEmailInput.trim());
    setDashActiveEmail(dashEmailInput.trim());
    toast.success(language === 'ar' ? 'تم تحميل لوحة التحكم الخاصة بك بنجاح!' : 'Your dashboard loaded successfully!');
  };

  const handleDashLogout = () => {
    localStorage.removeItem('velo_dashboard_guest_email');
    setDashActiveEmail('');
    setDashEmailInput('');
    setDashRequests([]);
    setDashSelectedRequest(null);
    toast.success(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await updateServiceRequestAdmin(id, { status: 'Cancelled' });
      toast.success(language === 'ar' ? 'تم إلغاء الطلب بنجاح.' : 'Request cancelled successfully.');
      
      // Update local states to dynamically show cancelled status
      setDashRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' as any } : r));
      setDashSelectedRequest(prev => prev && prev.id === id ? { ...prev, status: 'Cancelled' as any } : prev);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Error cancelling request:', err);
      toast.error(language === 'ar' ? 'فشل إلغاء الطلب. يرجى المحاولة لاحقاً.' : 'Failed to cancel request. Please try again.');
    }
  };

  const getWhatsAppDashLink = (req: ServiceRequest) => {
    const text = encodeURIComponent(
      language === 'ar'
        ? `مرحباً Velo Service،\nأود الاستفسار عن حالة طلبي:\n\nرقم الطلب: ${req.id}\nاسم المشروع: ${req.projectTitle}\nالحالة الحالية: ${req.status}`
        : `Hello Velo Service,\nI would like to inquire about my request status:\n\nRequest ID: ${req.id}\nProject Title: ${req.projectTitle}\nCurrent Status: ${req.status}`
    );
    return `https://wa.me/970594292646?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-velo-black text-white py-24 px-6 relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic ambient glass blur orbs */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />

      <div className="max-w-6xl mx-auto w-full relative z-10 flex-grow flex flex-col justify-start">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Link to="/" className={`inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group ${dir === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="text-xs sm:text-sm font-sans">{t('backToHome')}</span>
            <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
          </Link>

          {/* Quick email display for dashboard */}
          {activeTab === 'dashboard' && dashActiveEmail && (
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-4 py-1.5 rounded-2xl text-xs">
              <span className="text-white/45 font-mono">{dashActiveEmail}</span>
              <span className="text-white/10">|</span>
              <button onClick={handleDashLogout} className="text-red-400 hover:text-red-300 font-semibold cursor-none">
                {t('dash_logout')}
              </button>
            </div>
          )}
        </div>

        {/* Master Portal Heading */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight">
            VELO <span className="text-white/40">{t('hub_title')}</span>
          </h1>
          <p className="text-white/50 text-xs sm:text-sm font-light max-w-xl mx-auto">
            {language === 'ar' 
              ? 'بوابة مخصصة ومبسطة لطلب خدمات تصميم المواقع المتقدمة، تتبع تقدم المراجعات، ومراجعة عروض الميزانيات المعتمدة.' 
              : 'Our comprehensive gateway to request premium website designs, track engineering reviews, and monitor active budgets.'}
          </p>
        </div>

        {/* Segmented Control Switcher */}
        <div className="flex items-center justify-center p-1 bg-white/[0.02] border border-white/10 rounded-full max-w-lg mx-auto mb-12">
          <button
            id="tab-btn-new"
            onClick={() => handleTabChange('new')}
            className={`flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-none ${
              activeTab === 'new' 
                ? 'bg-white text-velo-black shadow-lg font-bold' 
                : 'text-white/50 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            {t('tab_new')}
          </button>
          <button
            id="tab-btn-track"
            onClick={() => handleTabChange('track')}
            className={`flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-none ${
              activeTab === 'track' 
                ? 'bg-white text-velo-black shadow-lg font-bold' 
                : 'text-white/50 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            {t('tab_track')}
          </button>
          <button
            id="tab-btn-dashboard"
            onClick={() => handleTabChange('dashboard')}
            className={`flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-none ${
              activeTab === 'dashboard' 
                ? 'bg-white text-velo-black shadow-lg font-bold' 
                : 'text-white/50 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            {t('tab_dashboard')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: NEW REQUEST FORM */}
          {activeTab === 'new' && (
            <motion.div
              key="tab-new"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto w-full"
            >
              {/* Form step progress indicators */}
              {step !== 'success' && (
                <div className="flex items-center justify-center gap-3 mb-10 font-mono text-[10px] sm:text-xs text-white/40">
                  <span className={`px-3 py-1 rounded-full border transition-all ${step === 1 ? 'border-white text-white bg-white/5 font-bold' : 'border-white/5'}`}>{t('req_step_1')}</span>
                  <span className="opacity-30">/</span>
                  <span className={`px-3 py-1 rounded-full border transition-all ${step === 2 ? 'border-white text-white bg-white/5 font-bold' : 'border-white/5'}`}>{t('req_step_2')}</span>
                  <span className="opacity-30">/</span>
                  <span className={`px-3 py-1 rounded-full border transition-all ${step === 3 ? 'border-white text-white bg-white/5 font-bold' : 'border-white/5'}`}>{t('req_step_3')}</span>
                </div>
              )}

              {/* STEP 1: SERVICE CATEGORY SELECTION */}
              {step === 1 && (
                <motion.div
                  key="form-step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-1.5">
                    <h2 className="font-display font-bold text-2xl sm:text-3xl">{t('req_select_category')}</h2>
                    <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">{t('req_select_category_desc')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AVAILABLE_SERVICES_I18N.map((srv) => {
                      const isSelected = selectedService === srv.titleEn;
                      const title = language === 'ar' ? srv.titleAr : srv.titleEn;
                      const desc = language === 'ar' ? srv.descAr : srv.descEn;

                      return (
                        <button
                          key={srv.id}
                          onClick={() => {
                            setSelectedService(srv.titleEn);
                            setStep(2); // Automatically skip to details page
                          }}
                          className={`relative text-right p-6 rounded-3xl border backdrop-blur-xl transition-all cursor-none overflow-hidden hover:scale-[1.02] flex flex-col justify-between min-h-[170px] ${
                            isSelected 
                              ? 'bg-white/[0.05] border-white shadow-2xl' 
                              : 'bg-white/[0.01] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${srv.color} opacity-10 blur-[40px] pointer-events-none`} />
                          
                          <div className="flex justify-between items-start w-full">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <srv.icon className={`w-5 h-5 text-white ${isSelected ? 'text-emerald-400' : 'opacity-75'}`} />
                            </div>
                            <span className="text-[9px] font-mono tracking-widest text-white/20 uppercase">{srv.id}</span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-display font-bold text-base text-white">{title}</h3>
                            <p className="text-[11px] text-white/45 font-light leading-relaxed truncate">{desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: FILL REQUEST DETAILS */}
              {step === 2 && (
                <motion.div
                  key="form-step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-1.5">
                    <h2 className="font-display font-bold text-2xl sm:text-3xl">{t('req_details_contact')}</h2>
                    <p className="text-xs sm:text-sm text-white/50 font-light">{t('req_details_desc')}</p>
                  </div>

                  {/* Form Container */}
                  <div className="bg-[#0c0c0d]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    
                    {/* Selected Service Alert Indicator */}
                    <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-xs">
                      <span className="text-white/40">{t('req_selected_service')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">
                          {language === 'ar' 
                            ? AVAILABLE_SERVICES_I18N.find(s => s.titleEn === selectedService)?.titleAr || selectedService
                            : selectedService
                          }
                        </span>
                        <button 
                          onClick={() => setStep(1)} 
                          className="text-white/30 hover:text-white underline cursor-none ml-2"
                        >
                          {language === 'ar' ? 'تغيير' : 'Change'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label className="text-xs font-semibold text-white/70">{t('field_full_name')}</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('field_full_name_placeholder')}
                          className={`w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        />
                        {errors.fullName && <p className="text-[10px] text-red-400 font-bold">{errors.fullName}</p>}
                      </div>

                      {/* Email Address */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label className="text-xs font-semibold text-white/70">{t('field_email')}</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. yourname@domain.com"
                          className={`w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        />
                        {errors.email && <p className="text-[10px] text-red-400 font-bold">{errors.email}</p>}
                      </div>

                      {/* Project Title */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label className="text-xs font-semibold text-white/70">{t('field_project_title')}</label>
                        <input
                          type="text"
                          required
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder={t('field_project_title_placeholder')}
                          className={`w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        />
                        {errors.projectTitle && <p className="text-[10px] text-red-400 font-bold">{errors.projectTitle}</p>}
                      </div>

                      {/* Company */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label className="text-xs font-semibold text-white/70">{t('field_company')}</label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder={t('field_company_placeholder')}
                          className={`w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        />
                      </div>

                      {/* Budget */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-white/70">{t('field_budget')}</label>
                          <button
                            type="button"
                            onClick={() => setIsCustomBudget(!isCustomBudget)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors underline focus:outline-none"
                          >
                            {isCustomBudget ? t('setting_select_budget_btn') : t('setting_custom_budget_btn')}
                          </button>
                        </div>
                        {isCustomBudget ? (
                          <input
                            type="text"
                            value={customBudget}
                            onChange={(e) => setCustomBudget(e.target.value)}
                            placeholder={t('field_custom_budget_placeholder')}
                            className={`w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                          />
                        ) : (
                          <select
                            value={estimatedBudget}
                            onChange={(e) => setEstimatedBudget(e.target.value)}
                            className={`w-full bg-[#070708] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
                          >
                            {BUDGET_OPTIONS.map(opt => (
                              <option key={opt} value={opt} className="bg-[#0c0c0d]">{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Preferred Timeline */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label className="text-xs font-semibold text-white/70">{t('field_timeline')}</label>
                        <select
                          value={preferredTimeline}
                          onChange={(e) => setPreferredTimeline(e.target.value)}
                          className={`w-full bg-[#070708] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        >
                          {TIMELINE_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-[#0c0c0d]">{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Country */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label className="text-xs font-semibold text-white/70">{t('field_country')}</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder={t('field_country_placeholder')}
                          className={`w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        />
                      </div>

                      {/* Preferred Contact Method */}
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <label className="text-xs font-semibold text-white/70">{t('field_contact_method')}</label>
                        <div className="flex gap-4 p-1 bg-black/30 border border-white/5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setPreferredContactMethod('Email')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-none ${
                              preferredContactMethod === 'Email' ? 'bg-white text-velo-black font-bold' : 'text-white/50'
                            }`}
                          >
                            {t('field_contact_email')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreferredContactMethod('WhatsApp')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-none ${
                              preferredContactMethod === 'WhatsApp' ? 'bg-emerald-500 text-black font-bold' : 'text-white/50'
                            }`}
                          >
                            {t('field_contact_whatsapp')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Animated Phone / WhatsApp input field */}
                    <AnimatePresence initial={false}>
                      {preferredContactMethod === 'WhatsApp' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`overflow-hidden space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        >
                          <label className="text-xs font-semibold text-white/70">
                            {t('field_phone')}
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t('field_phone_placeholder')}
                            className={`w-full bg-black/40 border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                          />
                          {errors.phone && <p className="text-[10px] text-red-400 font-bold">{errors.phone}</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Detailed Project Description */}
                    <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/30">{t('field_description_min')}</span>
                        <label className="text-xs font-semibold text-white/70">{t('field_description')}</label>
                      </div>
                      <textarea
                        required
                        rows={5}
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder={t('field_description_placeholder')}
                        className={`w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-white/30 transition-all resize-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                      {errors.projectDescription && <p className="text-[10px] text-red-400 font-bold">{errors.projectDescription}</p>}
                    </div>

                    {/* Reference links */}
                    <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <label className="text-xs font-semibold text-white/70">{t('field_ref_links')}</label>
                      <input
                        type="text"
                        value={referenceLinks}
                        onChange={(e) => setReferenceLinks(e.target.value)}
                        placeholder={t('field_ref_links_placeholder')}
                        className={`w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all font-sans ${language === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    {/* Additional Notes */}
                    <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <label className="text-xs font-semibold text-white/70">{t('field_additional_notes')}</label>
                      <textarea
                        rows={2}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder={t('field_additional_notes_placeholder')}
                        className={`w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-white/30 transition-all resize-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    {/* Drag and Drop File Attachment */}
                    <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <label className="text-xs font-semibold text-white/70">{t('field_attachment')}</label>
                      
                      {!attachment ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center gap-2 ${
                            isDragging 
                              ? 'border-emerald-400 bg-emerald-500/5' 
                              : 'border-white/10 hover:border-white/20 bg-black/20 hover:bg-black/40'
                          }`}
                          onClick={() => document.getElementById('attachment-file-input')?.click()}
                        >
                          <input
                            id="attachment-file-input"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                            onChange={handleFileChange}
                          />
                          <Upload className="w-8 h-8 text-white/40 mb-1" />
                          <p className="text-xs font-semibold">{t('field_attachment_drag')}</p>
                          <p className="text-[10px] text-white/30">{t('field_attachment_limit')}</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                          <button
                            onClick={() => setAttachment(null)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-red-400 transition-colors cursor-none"
                            aria-label="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs font-semibold text-white max-w-[200px] truncate">{attachment.name}</p>
                              <p className="text-[9px] text-emerald-400 font-mono">{(attachment.data.length * 0.75 / 1024 / 1024).toFixed(2)} MB • {attachment.type.split('/')[1]?.toUpperCase()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                              <FileText className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl transition-all cursor-none"
                      >
                        {t('btn_prev')}
                      </button>
                      <button
                        id="form-btn-next-review"
                        onClick={() => {
                          if (validateForm()) {
                            setStep(3);
                          } else {
                            toast.error(t('error_validation_toast'));
                          }
                        }}
                        className="px-8 py-3 bg-white text-velo-black font-bold text-xs rounded-xl hover:bg-neutral-200 transition-colors cursor-none"
                      >
                        {t('btn_review')}
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* STEP 3: FINAL REVIEW */}
              {step === 3 && (
                <motion.div
                  key="form-step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-1.5">
                    <h2 className="font-display font-bold text-2xl sm:text-3xl">{t('review_title')}</h2>
                    <p className="text-xs sm:text-sm text-white/50 font-light">{t('review_subtitle')}</p>
                  </div>

                  {/* Review Dashboard Display */}
                  <div className={`bg-[#0c0c0d]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 uppercase">{t('review_selected_service')}</span>
                        <h4 className="text-lg font-bold text-emerald-400">
                          {language === 'ar' 
                            ? AVAILABLE_SERVICES_I18N.find(s => s.titleEn === selectedService)?.titleAr || selectedService
                            : selectedService
                          }
                        </h4>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 uppercase">{t('review_project_title')}</span>
                        <h4 className="text-lg font-bold text-white">{projectTitle}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 uppercase">{t('review_client_name')}</span>
                        <p className="text-sm font-semibold text-white">{fullName}</p>
                        <p className="text-xs text-white/50 font-mono">{email}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 uppercase">{t('review_contact_info')}</span>
                        <p className="text-sm font-semibold text-white">
                          {company ? `${company} / ` : ''}{country || t('review_unspecified')}
                        </p>
                        <p className="text-xs text-white/50">{t('review_contact_method_label')}: <span className="text-emerald-400 font-bold">{preferredContactMethod}</span></p>
                        {phone && <p className="text-xs text-white/50">{t('field_phone')}: <span className="text-white font-mono">{phone}</span></p>}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 uppercase">{t('review_budget')}</span>
                        <p className="text-sm font-semibold text-emerald-400 font-sans">
                          {isCustomBudget ? (customBudget.trim() || BUDGET_OPTIONS[0]) : estimatedBudget}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 uppercase">{t('review_timeline')}</span>
                        <p className="text-sm font-semibold text-white font-sans">{preferredTimeline}</p>
                      </div>
                    </div>

                    {/* Description review */}
                    <div className="space-y-1.5 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-white/40 uppercase">{t('review_desc_label')}</span>
                      <p className="text-xs text-white/80 leading-relaxed font-light whitespace-pre-wrap max-h-48 overflow-y-auto bg-black/20 p-4 rounded-xl border border-white/5">
                        {projectDescription}
                      </p>
                    </div>

                    {/* Optional Attachments */}
                    <div className="space-y-1 pt-4">
                      <span className="text-[10px] text-white/40 uppercase">{t('review_attachment_label')}</span>
                      {attachment ? (
                        <div className={`flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl`}>
                          <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                            <p className="text-xs font-semibold text-white max-w-[200px] truncate">{attachment.name}</p>
                            <p className="text-[9px] text-emerald-400 font-mono">{(attachment.data.length * 0.75 / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <FileText className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-white/30 font-light">{t('review_no_attachment')}</p>
                      )}
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-3 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl transition-all cursor-none"
                      >
                        {t('review_back_edit')}
                      </button>
                      
                      <button
                        id="form-btn-submit-final"
                        disabled={isSubmitting}
                        onClick={handleNewRequestSubmit}
                        className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-none disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('btn_submitting_request')}
                          </>
                        ) : (
                          <>
                            {t('btn_submit_request')}
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* SUCCESS STATE */}
              {step === 'success' && (
                <motion.div
                  key="form-step-success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-10 py-12"
                >
                  <div className="space-y-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
                      <CheckCircle2 className="w-10 h-10 animate-pulse" />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="font-display font-bold text-3xl sm:text-4xl text-emerald-400 tracking-tight text-center">
                        {t('success_title')}
                      </h2>
                      <p className="text-white/60 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed text-center">
                        {t('success_desc')}
                      </p>
                    </div>
                  </div>

                  {/* Reference ID Box */}
                  <div className="bg-white/[0.02] border border-white/15 rounded-3xl p-6 max-w-md mx-auto space-y-3 shadow-xl relative overflow-hidden text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">{t('success_ref_id')}</p>
                    <p className="text-4xl font-display font-black tracking-widest text-white">{requestId}</p>
                    <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-white/30 font-mono">
                      <span>Velo Service Project ID</span>
                      <span>SECURE & SIGNED</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/40 font-sans max-w-sm mx-auto leading-relaxed text-center">
                    {t('success_track_instruction')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto pt-6 border-t border-white/5">
                    <a
                      href={getWhatsAppSubmitLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all cursor-none text-xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      {t('success_btn_whatsapp')}
                    </a>
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelectedService('');
                        setProjectTitle('');
                        setProjectDescription('');
                        setAttachment(null);
                        setStep(1);
                        handleTabChange('new');
                      }}
                      className="flex-1 py-4 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-2xl transition-all flex items-center justify-center cursor-none text-xs"
                    >
                      {language === 'ar' ? 'تقديم طلب آخر' : 'Submit Another'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 2: TRACK SERVICE REQUEST */}
          {activeTab === 'track' && (
            <motion.div
              key="tab-track"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto w-full"
            >
              {!trackedRequest ? (
                /* Tracking Search Form */
                <form onSubmit={handleTrackSubmit} className="bg-[#0c0c0d]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-right">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/70">
                      <Search className="w-5 h-5" />
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl">{t('track_header')}</h2>
                    <p className="text-xs text-white/50 leading-relaxed font-light">{t('track_desc')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-right font-sans">
                      <label className="text-xs font-semibold text-white/70">{t('track_field_email')}</label>
                      <input
                        type="email"
                        required
                        value={trackEmail}
                        onChange={(e) => setTrackEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all font-sans text-center"
                      />
                    </div>

                    <div className="space-y-1.5 text-right font-sans">
                      <label className="text-xs font-semibold text-white/70">{t('track_field_id')}</label>
                      <input
                        type="text"
                        required
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        placeholder="e.g. VS-1048"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all font-sans text-center tracking-widest uppercase"
                      />
                    </div>
                  </div>

                  <button
                    id="track-btn-submit"
                    type="submit"
                    disabled={trackLoading}
                    className="w-full py-4 bg-white text-velo-black font-bold rounded-xl hover:bg-neutral-200 transition-colors cursor-none text-xs flex items-center justify-center gap-2"
                  >
                    {trackLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-velo-black" />
                        {language === 'ar' ? 'جاري البحث وتدقيق السجلات...' : 'Searching logs...'}
                      </>
                    ) : (
                      t('track_btn_submit')
                    )}
                  </button>
                </form>
              ) : (
                /* Tracking Results View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0c0c0d]/95 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl text-right"
                >
                  {/* Results Header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-5">
                    <button
                      onClick={() => setTrackedRequest(null)}
                      className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-[10px] font-semibold rounded-lg cursor-none"
                    >
                      {t('track_btn_search_another')}
                    </button>
                    <div>
                      <p className="text-[10px] text-white/40 font-mono">STATUS FOR {trackedRequest.id}</p>
                      <h3 className="font-display font-bold text-lg text-white">{t('track_results_header')}</h3>
                    </div>
                  </div>

                  {/* Status details card */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_DETAILS[trackedRequest.status]?.bg} ${STATUS_DETAILS[trackedRequest.status]?.color} ${STATUS_DETAILS[trackedRequest.status]?.border}`}>
                        {language === 'ar' ? STATUS_DETAILS[trackedRequest.status]?.label : trackedRequest.status}
                      </span>
                      <h4 className="text-base font-bold text-white">{trackedRequest.projectTitle}</h4>
                    </div>

                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${STATUS_DETAILS[trackedRequest.status]?.progress || 10}%` }}
                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-1000"
                      />
                    </div>
                  </div>

                  {/* Information bento list */}
                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                      <p className="text-[10px] text-white/40 flex items-center justify-end gap-1 font-sans">
                        <Calendar className="w-3 h-3" />
                        {t('track_field_submission')}
                      </p>
                      <p className="text-xs font-semibold text-white">
                        {new Date(trackedRequest.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                      <p className="text-[10px] text-white/40 flex items-center justify-end gap-1 font-sans">
                        <Clock className="w-3 h-3" />
                        {t('track_field_delivery')}
                      </p>
                      <p className="text-xs font-semibold text-emerald-400">
                        {trackedRequest.estimatedDelivery || t('track_field_delivery_pending')}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1 col-span-2">
                      <p className="text-[10px] text-white/40 flex items-center justify-end gap-1 font-sans">
                        <User className="w-3 h-3" />
                        {t('track_field_team')}
                      </p>
                      <p className="text-xs font-semibold text-white">
                        {trackedRequest.assignedTeam || t('track_field_team_pending')}
                      </p>
                    </div>
                  </div>

                  {/* Admin notes */}
                  <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2 text-right">
                    <h5 className="text-xs font-bold text-white flex items-center gap-2 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t('track_admin_notes')}
                    </h5>
                    <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                      {trackedRequest.latestUpdate || t('track_default_notes')}
                    </p>
                  </div>

                  {/* Financial quotation download if available */}
                  {trackedRequest.status !== 'Pending Review' && trackedRequest.status !== 'Under Review' && (
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase">proposal ready</span>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          {t('track_quotation_title')}
                        </h5>
                      </div>
                      <p className="text-xs text-white/50">{t('track_quotation_desc')}</p>
                      <button
                        onClick={() => {
                          toast.success(t('track_quotation_download_success'));
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-none"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('track_quotation_download')}
                      </button>
                    </div>
                  )}

                  {/* Communication links */}
                  <div className="flex gap-4 border-t border-white/5 pt-5">
                    <a
                      href={getWhatsAppDashLink(trackedRequest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all cursor-none"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      {t('dash_contact_whatsapp')}
                    </a>
                    <a
                      href={`mailto:support@veloservice.com?subject=Inquiry about Service Request ${trackedRequest.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 hover:bg-white/5 text-white text-xs font-semibold rounded-xl transition-all cursor-none"
                    >
                      <Mail className="w-4 h-4" />
                      {language === 'ar' ? 'مراسلتنا إلكترونياً' : 'Mail Support'}
                    </a>
                  </div>

                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 3: CLIENT DASHBOARD LOGINS & CONTENT */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto w-full"
            >
              {/* AUTH DETECTOR LOADER */}
              {authLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
                  <p className="text-white/45 text-xs font-light">{language === 'ar' ? 'جاري التحقق من الهوية والتحميل...' : 'Checking identities...'}</p>
                </div>
              ) : !dashActiveEmail ? (
                /* EMAIL ACCESSIBILITY LOCK (If guest not logged in) */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md mx-auto w-full text-center space-y-6"
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/70">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl">{t('dash_guest_header')}</h2>
                    <p className="text-xs text-white/55 leading-relaxed font-light">{t('dash_guest_desc')}</p>
                  </div>

                  <form onSubmit={handleDashLogin} className="bg-white/[0.01] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl space-y-4 shadow-xl text-right font-sans">
                    <input
                      type="email"
                      required
                      value={dashEmailInput}
                      onChange={(e) => setDashEmailInput(e.target.value)}
                      placeholder={t('dash_email_placeholder')}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-white/30 transition-all font-sans text-center"
                    />
                    <button
                      id="dash-btn-submit"
                      type="submit"
                      className="w-full py-3.5 bg-white text-velo-black font-bold rounded-xl hover:bg-neutral-200 transition-colors cursor-none text-xs"
                    >
                      {t('dash_btn_enter')}
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* ACTIVE DASHBOARD MODULE */
                <div className="space-y-8">
                  {/* Sub Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-5 border-b border-white/5 text-right">
                    <div className="space-y-1 w-full text-right">
                      <h2 className="font-display font-bold text-2xl sm:text-3xl">{t('dash_header')}</h2>
                      <p className="text-white/50 text-xs sm:text-sm font-light">{t('dash_subtitle')}</p>
                    </div>
                  </div>

                  {dashLoading ? (
                    /* Skeleton loaders */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-4 space-y-4">
                        <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                      </div>
                      <div className="lg:col-span-8 h-80 bg-white/5 rounded-3xl animate-pulse" />
                    </div>
                  ) : dashError ? (
                    <div className="p-8 bg-red-500/5 border border-red-500/15 rounded-3xl text-center space-y-3">
                      <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                      <p className="text-xs font-semibold">{dashError}</p>
                      <button
                        onClick={() => setDashActiveEmail(dashActiveEmail)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition-all cursor-none"
                      >
                        {language === 'ar' ? 'إعادة تحميل' : 'Reload'}
                      </button>
                    </div>
                  ) : dashRequests.length === 0 ? (
                    /* Empty Dashboard State */
                    <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-10 text-center max-w-md mx-auto space-y-5 shadow-xl text-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold">{t('dash_no_requests_title')}</h3>
                        <p className="text-xs text-white/50 font-light leading-relaxed">{t('dash_no_requests_desc')}</p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleDashLogout}
                          className="px-5 py-2 border border-white/10 hover:bg-white/5 text-[11px] font-semibold rounded-full cursor-none"
                        >
                          {t('dash_change_email')}
                        </button>
                        <button
                          onClick={() => handleTabChange('new')}
                          className="px-5 py-2 bg-emerald-500 text-black font-semibold rounded-full text-[11px] cursor-none"
                        >
                          {t('dash_order_now')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Live Requests Dashboard Grid Layout */
                    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${dir === 'rtl' ? '' : 'text-left'}`}>
                      
                      {/* Left Side: Requests list index */}
                      <div className="lg:col-span-4 space-y-4 lg:order-2">
                        <h3 className="text-[10px] font-bold uppercase text-white/40 tracking-wider text-right">{t('dash_list_title')} ({dashRequests.length})</h3>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                          {dashRequests.map((req) => {
                            const stat = STATUS_DETAILS[req.status];
                            const isSelected = dashSelectedRequest?.id === req.id;
                            const statusLabel = language === 'ar' ? stat?.label : req.status;

                            return (
                              <button
                                key={req.id}
                                onClick={() => {
                                  setDashSelectedRequest(req);
                                  setShowCancelConfirm(false);
                                  setIsEditingDashRequest(false);
                                }}
                                className={`w-full text-right p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-none flex flex-col gap-3 ${
                                  isSelected 
                                    ? 'bg-white/[0.05] border-white shadow-xl text-white' 
                                    : 'bg-white/[0.01] border-white/5 hover:border-white/12'
                                }`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${stat?.bg} ${stat?.color} ${stat?.border}`}>
                                    {statusLabel}
                                  </span>
                                  <span className="text-[10px] font-mono tracking-wider text-white/45">{req.id}</span>
                                </div>

                                <div>
                                  <h4 className="text-xs font-bold truncate text-right w-full">{req.projectTitle}</h4>
                                  <p className="text-[10px] text-white/40 font-light mt-0.5 text-right">{req.selectedService}</p>
                                </div>

                                <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[9px] text-white/30 font-mono">
                                  <span>{new Date(req.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                                  <span>Timeline: {req.preferredTimeline}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Side: Active details overview */}
                      <div className="lg:col-span-8 lg:order-1 text-right">
                        <AnimatePresence mode="wait">
                          {dashSelectedRequest && (
                            <motion.div
                              key={dashSelectedRequest.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="bg-[#0c0c0d]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-right"
                            >
                              {/* Request heading */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                                <div className="space-y-1 text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_DETAILS[dashSelectedRequest.status]?.bg} ${STATUS_DETAILS[dashSelectedRequest.status]?.color} ${STATUS_DETAILS[dashSelectedRequest.status]?.border}`}>
                                      {language === 'ar' ? STATUS_DETAILS[dashSelectedRequest.status]?.label : dashSelectedRequest.status}
                                    </span>
                                    <h3 className="text-lg sm:text-xl font-bold text-white text-right">{dashSelectedRequest.projectTitle}</h3>
                                  </div>
                                  <p className="text-[11px] text-white/45 font-light text-right">{t('review_selected_service')}: {dashSelectedRequest.selectedService}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl text-center">
                                  <p className="text-[8px] uppercase text-white/40">Reference ID</p>
                                  <p className="text-sm font-display font-black tracking-widest text-white">{dashSelectedRequest.id}</p>
                                </div>
                              </div>

                              {/* Progress Tracker */}
                              <div className="space-y-3 text-right">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('dash_pipeline_title')}</h4>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${STATUS_DETAILS[dashSelectedRequest.status]?.progress || 10}%` }}
                                    className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-1000"
                                  />
                                </div>
                                <div className="flex justify-between text-[8px] sm:text-[9px] text-white/30 font-sans">
                                  <span>{t('dash_stage4')}</span>
                                  <span>{t('dash_stage3')}</span>
                                  <span>{t('dash_stage2')}</span>
                                  <span>{t('dash_stage1')}</span>
                                </div>
                              </div>

                              {isEditingDashRequest ? (
                                <div className="space-y-5 text-right font-sans" dir="rtl">
                                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                      <Edit2 className="w-4 h-4" />
                                      {language === 'ar' ? 'تعديل تفاصيل الطلب' : 'Edit Request Details'}
                                    </h4>
                                    <span className="text-xs font-mono text-white/40">{dashSelectedRequest.id}</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Project Title */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'عنوان المشروع' : 'Project Title'}</label>
                                      <input
                                        type="text"
                                        value={editDashProjectTitle}
                                        onChange={(e) => setEditDashProjectTitle(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 text-right font-sans"
                                      />
                                    </div>

                                    {/* Selected Service */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'نوع الخدمة' : 'Service Type'}</label>
                                      <select
                                        value={editDashSelectedService}
                                        onChange={(e) => setEditDashSelectedService(e.target.value)}
                                        className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 text-right font-sans"
                                      >
                                        {AVAILABLE_SERVICES_I18N.map(s => (
                                          <option key={s.id} value={language === 'ar' ? s.titleAr : s.titleEn} className="bg-neutral-950 text-white">
                                            {language === 'ar' ? s.titleAr : s.titleEn}
                                          </option>
                                        ))}
                                        {!AVAILABLE_SERVICES_I18N.some(s => (language === 'ar' ? s.titleAr : s.titleEn) === editDashSelectedService) && (
                                          <option value={editDashSelectedService} className="bg-neutral-950 text-white">{editDashSelectedService}</option>
                                        )}
                                      </select>
                                    </div>

                                    {/* Budget */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'الميزانية المقدرة' : 'Estimated Budget'}</label>
                                      <select
                                        value={editDashEstimatedBudget}
                                        onChange={(e) => setEditDashEstimatedBudget(e.target.value)}
                                        className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 text-right font-sans"
                                      >
                                        {BUDGET_OPTIONS.map(b => (
                                          <option key={b} value={b} className="bg-neutral-950 text-white">{b}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'الجدول الزمني المفضل' : 'Preferred Timeline'}</label>
                                      <select
                                        value={editDashPreferredTimeline}
                                        onChange={(e) => setEditDashPreferredTimeline(e.target.value)}
                                        className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 text-right font-sans"
                                      >
                                        {TIMELINE_OPTIONS.map(tOption => (
                                          <option key={tOption} value={tOption} className="bg-neutral-950 text-white">{tOption}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Company */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'اسم الشركة (اختياري)' : 'Company Name (Optional)'}</label>
                                      <input
                                        type="text"
                                        value={editDashCompany}
                                        onChange={(e) => setEditDashCompany(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 text-right font-sans"
                                      />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                                      <input
                                        type="text"
                                        value={editDashPhone}
                                        onChange={(e) => setEditDashPhone(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 font-mono text-left"
                                        dir="ltr"
                                      />
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'الدولة' : 'Country'}</label>
                                      <input
                                        type="text"
                                        value={editDashCountry}
                                        onChange={(e) => setEditDashCountry(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 text-right font-sans"
                                      />
                                    </div>

                                    {/* Preferred Contact Method */}
                                    <div className="space-y-1 text-right">
                                      <label className="block text-[11px] text-white/50">{language === 'ar' ? 'طريقة التواصل المفضلة' : 'Preferred Contact Method'}</label>
                                      <div className="flex gap-2">
                                        {(['Email', 'WhatsApp'] as const).map(method => (
                                          <button
                                            key={method}
                                            type="button"
                                            onClick={() => setEditDashPreferredContactMethod(method)}
                                            className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all border cursor-none ${
                                              editDashPreferredContactMethod === method
                                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                                            }`}
                                          >
                                            {method === 'Email' ? (language === 'ar' ? 'البريد الإلكتروني' : 'Email') : (language === 'ar' ? 'واتساب' : 'WhatsApp')}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Project Description */}
                                  <div className="space-y-1 text-right">
                                    <label className="block text-[11px] text-white/50">{language === 'ar' ? 'وصف تفاصيل المشروع' : 'Project Description'}</label>
                                    <textarea
                                      value={editDashProjectDescription}
                                      onChange={(e) => setEditDashProjectDescription(e.target.value)}
                                      rows={4}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500/40 font-sans resize-none text-right"
                                    />
                                  </div>

                                  {/* Reference Links */}
                                  <div className="space-y-1 text-right">
                                    <label className="block text-[11px] text-white/50">{language === 'ar' ? 'روابط مرجعية / أمثلة ملهمة' : 'Reference Links / Inspiration'}</label>
                                    <input
                                      type="text"
                                      value={editDashReferenceLinks}
                                      onChange={(e) => setEditDashReferenceLinks(e.target.value)}
                                      placeholder="https://example.com"
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 text-left font-mono"
                                      dir="ltr"
                                    />
                                  </div>

                                  {/* Additional Notes */}
                                  <div className="space-y-1 text-right">
                                    <label className="block text-[11px] text-white/50">{language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}</label>
                                    <textarea
                                      value={editDashAdditionalNotes}
                                      onChange={(e) => setEditDashAdditionalNotes(e.target.value)}
                                      rows={2}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500/40 font-sans resize-none text-right"
                                    />
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-3 pt-3 border-t border-white/5">
                                    <button
                                      onClick={handleSaveDashRequestEdit}
                                      disabled={isSavingDashEdit}
                                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-bold rounded-xl transition-all cursor-none flex items-center justify-center gap-1.5"
                                    >
                                      {isSavingDashEdit ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                      )}
                                      {language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                                    </button>
                                    <button
                                      onClick={() => setIsEditingDashRequest(false)}
                                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-all cursor-none flex items-center justify-center gap-1.5 border border-white/10"
                                    >
                                      <X className="w-4 h-4" />
                                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Bento box items */}
                                  <div className="grid grid-cols-2 gap-4 text-right font-sans">
                                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                                      <p className="text-[9px] text-white/30 flex items-center justify-end gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {t('track_field_submission')}
                                      </p>
                                      <p className="text-xs font-semibold text-white">
                                        {new Date(dashSelectedRequest.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                      </p>
                                    </div>
                                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                                      <p className="text-[9px] text-white/30 flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" />
                                        {t('track_field_delivery')}
                                      </p>
                                      <p className="text-xs font-semibold text-emerald-400">
                                        {dashSelectedRequest.estimatedDelivery || t('dash_delivery_pending')}
                                      </p>
                                    </div>
                                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl col-span-2">
                                      <p className="text-[9px] text-white/30 flex items-center justify-end gap-1">
                                        <User className="w-3 h-3" />
                                        {t('track_field_team')}
                                      </p>
                                      <p className="text-xs font-semibold text-white">
                                        {dashSelectedRequest.assignedTeam || t('dash_assigned_team_pending')}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Submitted Details & Project Description (NEW HIGH-POLISHED FEATURE) */}
                                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3 text-right font-sans">
                                    <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                      {language === 'ar' ? 'تفاصيل الطلب المقدمة' : 'Submitted Request Details'}
                                    </h5>
                                    
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <span className="text-white/40 block text-[10px] mb-0.5">{language === 'ar' ? 'وصف المشروع:' : 'Project Description:'}</span>
                                        <p className="text-white/80 font-light leading-relaxed whitespace-pre-line text-right">{dashSelectedRequest.projectDescription}</p>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-[11px]">
                                        {dashSelectedRequest.company && (
                                          <div>
                                            <span className="text-white/40 block text-[9px]">{language === 'ar' ? 'الشركة:' : 'Company:'}</span>
                                            <span className="text-white/70 font-medium">{dashSelectedRequest.company}</span>
                                          </div>
                                        )}
                                        {dashSelectedRequest.phone && (
                                          <div>
                                            <span className="text-white/40 block text-[9px]">{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</span>
                                            <span className="text-white/70 font-medium font-mono" dir="ltr">{dashSelectedRequest.phone}</span>
                                          </div>
                                        )}
                                        {dashSelectedRequest.country && (
                                          <div>
                                            <span className="text-white/40 block text-[9px]">{language === 'ar' ? 'الدولة:' : 'Country:'}</span>
                                            <span className="text-white/70 font-medium">{dashSelectedRequest.country}</span>
                                          </div>
                                        )}
                                        <div>
                                          <span className="text-white/40 block text-[9px]">{language === 'ar' ? 'طريقة التواصل:' : 'Contact Method:'}</span>
                                          <span className="text-white/70 font-medium">{dashSelectedRequest.preferredContactMethod}</span>
                                        </div>
                                      </div>

                                      {(dashSelectedRequest.referenceLinks || dashSelectedRequest.additionalNotes) && (
                                        <div className="pt-2 border-t border-white/5 space-y-2 text-[11px]">
                                          {dashSelectedRequest.referenceLinks && (
                                            <div>
                                              <span className="text-white/40 block text-[9px]">{language === 'ar' ? 'روابط مرجعية:' : 'Reference Links:'}</span>
                                              <a href={dashSelectedRequest.referenceLinks} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline break-all block text-left" dir="ltr">
                                                {dashSelectedRequest.referenceLinks}
                                              </a>
                                            </div>
                                          )}
                                          {dashSelectedRequest.additionalNotes && (
                                            <div>
                                              <span className="text-white/40 block text-[9px]">{language === 'ar' ? 'ملاحظات إضافية:' : 'Additional Notes:'}</span>
                                              <p className="text-white/60 font-light text-right">{dashSelectedRequest.additionalNotes}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Administrative notes */}
                                  <div className="p-4 bg-white/[0.02] border border-white/8 rounded-2xl space-y-1.5 text-right">
                                    <h5 className="text-[10px] font-bold text-white flex items-center gap-1.5 justify-end">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      {t('track_admin_notes')}
                                    </h5>
                                    <p className="text-xs text-white/70 font-light leading-relaxed">
                                      {dashSelectedRequest.latestUpdate || t('track_default_notes')}
                                    </p>
                                  </div>

                                  {/* Approved budget section */}
                                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3 text-right">
                                    <h5 className="text-[9px] font-bold text-white/35 uppercase flex items-center justify-end gap-1.5">
                                      <CreditCard className="w-3.5 h-3.5" />
                                      {t('dash_quotation_section')}
                                    </h5>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5 text-[11px] font-mono">
                                        <span className="font-bold text-white">{dashSelectedRequest.estimatedBudget}</span>
                                        <span className="text-white/40">{t('dash_budget_requested')}</span>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5 text-[11px] font-mono">
                                        <span className="font-bold text-emerald-400">
                                          {dashSelectedRequest.status !== 'Pending Review' && dashSelectedRequest.status !== 'Under Review' 
                                            ? dashSelectedRequest.estimatedBudget 
                                            : t('dash_budget_calculating')}
                                        </span>
                                        <span className="text-white/40">{t('dash_budget_approved')}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Core action buttons */}
                                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-3 border-t border-white/5">
                                    <a
                                      href={getWhatsAppDashLink(dashSelectedRequest)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all cursor-none"
                                    >
                                      <MessageCircle className="w-4 h-4 fill-current" />
                                      {t('dash_contact_whatsapp')}
                                    </a>
                                    <a
                                      href={`mailto:support@veloservice.com?subject=Inquiry about Service Request ${dashSelectedRequest.id}`}
                                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 border border-white/10 hover:bg-white/5 text-white text-xs font-semibold rounded-xl transition-all cursor-none"
                                    >
                                      <Mail className="w-4 h-4" />
                                      {t('dash_contact_email')}
                                    </a>

                                    {/* Edit Request Button (NEW) */}
                                    {dashSelectedRequest.status !== 'Completed' && dashSelectedRequest.status !== 'Cancelled' && (
                                      <button
                                        onClick={startEditingDashRequest}
                                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 text-xs font-bold rounded-xl transition-all cursor-none"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        {language === 'ar' ? 'تعديل بيانات الطلب' : 'Edit Request'}
                                      </button>
                                    )}

                                    {dashSelectedRequest.status !== 'Cancelled' && dashSelectedRequest.status !== 'Completed' && (
                                      <>
                                        {!showCancelConfirm ? (
                                          <button
                                            onClick={() => setShowCancelConfirm(true)}
                                            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition-all cursor-none"
                                          >
                                            <X className="w-4 h-4" />
                                            {t('btn_cancel_request')}
                                          </button>
                                        ) : (
                                          <div className="w-full bg-red-950/20 border border-red-500/30 rounded-xl p-3 flex flex-col gap-2">
                                            <p className="text-[10px] text-red-300 text-center font-sans">
                                              {language === 'ar' 
                                                ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.' 
                                                : 'Are you sure you want to cancel this request? This action cannot be undone.'}
                                            </p>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => handleCancelRequest(dashSelectedRequest.id)}
                                                className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-black text-[10px] font-bold rounded-lg transition-all cursor-none"
                                              >
                                                {language === 'ar' ? 'نعم، إلغاء الطلب' : 'Yes, Cancel'}
                                              </button>
                                              <button
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="flex-1 py-1.5 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold rounded-lg transition-all cursor-none"
                                              >
                                                {language === 'ar' ? 'تراجع' : 'No, Keep'}
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </>
                              )}

                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Unified footer */}
      <div className="max-w-6xl mx-auto w-full pt-16 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/30 relative z-10 mt-16 text-center">
        <p>© {new Date().getFullYear()} Velo Service. All rights reserved.</p>
        <div className="flex gap-4 mt-2 sm:mt-0 font-sans justify-center">
          <button onClick={() => handleTabChange('new')} className="hover:text-white cursor-none">{t('tab_new')}</button>
          <span>•</span>
          <button onClick={() => handleTabChange('track')} className="hover:text-white cursor-none">{t('tab_track')}</button>
          <span>•</span>
          <button onClick={() => handleTabChange('dashboard')} className="hover:text-white cursor-none">{t('tab_dashboard')}</button>
        </div>
      </div>
    </div>
  );
}
