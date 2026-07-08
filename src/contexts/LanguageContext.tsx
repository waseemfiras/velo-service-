import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navbar
  services: { en: 'Our Services', ar: 'خدماتنا' },
  work: { en: 'Our Work', ar: 'أعمالنا' },
  contact: { en: 'Contact Us', ar: 'اتصل بنا' },
  requestService: { en: 'Request Service', ar: 'طلب خدمات' },
  trackRequest: { en: 'Track Request', ar: 'تتبع طلبك' },
  myDashboard: { en: 'My Dashboard', ar: 'لوحة التحكم' },
  languageLabel: { en: 'العربية', ar: 'English' },
  backToHome: { en: 'Back to Home', ar: 'العودة للرئيسية' },
  aiChat: { en: 'AI Chat', ar: 'مساعد الذكاء الاصطناعي' },

  // Hero
  hero_headline_white: { en: 'We engineer high-end', ar: 'نحن نصمم ونطور' },
  hero_headline_gradient: { en: 'websites that scale', ar: 'مواقع ويب متفوقة' },
  hero_subheadline: {
    en: 'Velo Service is a professional website agency. We build bespoke digital products, landing pages, and interactive platforms designed for conversion and speed.',
    ar: 'فيلو سيرفيس هي وكالة تصميم وتطوير مواقع متخصصة. نبتكر منصات رقمية مخصصة، صفحات هبوط، وأنظمة تفاعلية مصممة خصيصاً للسرعة والأداء العالي وزيادة المبيعات.'
  },
  hero_cta_start: { en: 'Start Consultation', ar: 'ابدأ استشارة مجانية' },
  hero_cta_work: { en: 'View Our Work', ar: 'رؤية أعمالنا' },

  // Services
  services_section_title: { en: 'Precision engineered', ar: 'خدمات مصممة' },
  services_section_subtitle: { en: 'digital solutions', ar: 'بدقة متناهية' },
  services_section_desc: {
    en: 'We build professional, bespoke web experiences from scratch, focused purely on performance, conversion, and elegant design.',
    ar: 'نبتكر تجارب ويب احترافية ومخصصة من الصفر، تركز بالكامل على الأداء العالي، زيادة التحويل، والتصميم الراقي.'
  },
  services_back_button: { en: 'Back to list', ar: 'العودة للقائمة' },
  services_start_consultation: { en: 'Start Consultation', ar: 'ابدأ استشارة' },
  services_request_quotation: { en: 'Request Quotation', ar: 'طلب عرض سعر' },
  services_methodology: { en: 'Methodology', ar: 'منهجية العمل' },
  services_techStack: { en: 'Tech Stack', ar: 'التقنيات المستخدمة' },
  services_keyFeatures: { en: 'Key Features', ar: 'الميزات الأساسية' },

  // Projects/Work
  projects_section_title: { en: 'Selected', ar: 'أعمال' },
  projects_section_subtitle: { en: 'digital masterpieces', ar: 'مختارة ونماذج' },
  projects_section_desc: {
    en: 'Explore our portfolio of high-converting landing pages, custom websites, and bespoke platforms.',
    ar: 'استكشف معرض أعمالنا لصفحات الهبوط ذات التحويل العالي، المواقع المخصصة والمنصات المصممة بعناية.'
  },
  projects_filter_all: { en: 'All Projects', ar: 'كل المشاريع' },
  projects_filter_landing: { en: 'Landing Pages', ar: 'صفحات الهبوط' },
  projects_filter_corporate: { en: 'Custom Websites', ar: 'مواقع مخصصة' },
  projects_filter_webapp: { en: 'Web Apps', ar: 'تطبيقات الويب' },

  // Stats
  stats_1_num: { en: '99%', ar: '99%' },
  stats_1_label: { en: 'Client Satisfaction', ar: 'رضا العملاء' },
  stats_2_num: { en: '24h', ar: '24ساعة' },
  stats_2_label: { en: 'Average Response Time', ar: 'متوسط سرعة الرد' },
  stats_3_num: { en: '150+', ar: '+150' },
  stats_3_label: { en: 'Websites Launched', ar: 'موقع تم إطلاقه' },

  // Contact / Footer
  contact_title_white: { en: "Let's build something", ar: 'دعنا نبني شيئاً' },
  contact_title_gradient: { en: 'extraordinary', ar: 'استثنائياً معاً' },
  contact_desc: {
    en: "Have a project in mind? Let's discuss how we can turn your vision into a high-performance website.",
    ar: 'هل لديك مشروع في مخيلتك؟ دعنا نناقش كيف يمكننا تحويل رؤيتك إلى موقع ويب عالي الأداء والأناقة.'
  },
  contact_form_name: { en: 'Full Name', ar: 'الاسم الكامل' },
  contact_form_email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  contact_form_message: { en: 'Tell us about your project', ar: 'أخبرنا عن تفاصيل مشروعك' },
  contact_btn_send: { en: 'Send Message', ar: 'إرسال الرسالة' },
  contact_btn_sending: { en: 'Sending...', ar: 'جاري الإرسال...' },
  contact_success_msg: { en: 'Message sent successfully!', ar: 'تم إرسال رسالتك بنجاح!' },
  contact_error_msg: { en: 'Failed to send message. Please try again.', ar: 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.' },
  contact_address: { en: 'Palestine / Saudi Arabia', ar: 'فلسطين / المملكة العربية السعودية' },
  contact_required_name: { en: 'Full name is required', ar: 'الاسم الكامل مطلوب' },
  contact_required_email: { en: 'Valid email is required', ar: 'بريد إلكتروني صالح مطلوب' },
  contact_required_message: { en: 'Please enter a message', ar: 'يرجى إدخال نص الرسالة' },

  // Request Service Hub General
  hub_title: { en: 'Client Service Hub', ar: 'مركز خدمات العملاء' },
  tab_new: { en: 'New Request', ar: 'طلب خدمة جديدة' },
  tab_track: { en: 'Track Request', ar: 'تتبع طلب' },
  tab_dashboard: { en: 'My Dashboard', ar: 'لوحة التحكم' },

  // Request Service Form
  req_select_category: { en: 'Select Website Service Category', ar: 'اختر فئة خدمة المواقع' },
  req_select_category_desc: {
    en: 'Please choose the specific website category that best fits your requirements.',
    ar: 'يرجى اختيار فئة الخدمة الخاصة بالمواقع الأقرب لمتطلبات مشروعك لبدء بناء عرض السعر.'
  },
  req_details_contact: { en: 'Project & Contact Details', ar: 'تفاصيل المشروع والاتصال' },
  req_details_desc: {
    en: 'Please provide full details about your website project and contact options.',
    ar: 'يرجى تقديم تفاصيل كاملة حول مشروع موقع الويب الخاص بك وخيارات الاتصال.'
  },
  req_selected_service: { en: 'Selected Service:', ar: 'الخدمة المحددة:' },
  req_step_1: { en: '1. Service', ar: '1. الخدمة' },
  req_step_2: { en: '2. Details', ar: '2. التفاصيل' },
  req_step_3: { en: '3. Confirm', ar: '3. التأكيد' },

  // Form Fields
  field_full_name: { en: 'Full Name *', ar: 'الاسم الكامل *' },
  field_full_name_placeholder: { en: 'Enter your name', ar: 'أدخل اسمك الكريم' },
  field_email: { en: 'Email Address *', ar: 'البريد الإلكتروني *' },
  field_company: { en: 'Company / Organization (Optional)', ar: 'الشركة / المؤسسة (اختياري)' },
  field_company_placeholder: { en: 'Your company name', ar: 'اسم شركتك أو عملك' },
  field_project_title: { en: 'Project Title *', ar: 'عنوان المشروع *' },
  field_project_title_placeholder: { en: 'e.g., E-commerce website for clothing', ar: 'مثال: تطبيق متجر إلكتروني للملابس' },
  field_budget: { en: 'Estimated Budget', ar: 'الميزانية التقديرية' },
  field_timeline: { en: 'Preferred Timeline', ar: 'الجدول الزمني المفضل' },
  field_country: { en: 'Country / Residence', ar: 'الدولة / الإقامة' },
  field_country_placeholder: { en: 'e.g., Saudi Arabia, Palestine', ar: 'أدخل دولتك (مثال: فلسطين، السعودية)' },
  field_contact_method: { en: 'Preferred Contact Method', ar: 'طريقة التواصل المفضلة' },
  field_phone: { en: 'Phone / WhatsApp Number *', ar: 'رقم الهاتف / الواتساب *' },
  field_phone_placeholder: { en: 'e.g., +966500000000', ar: 'مثال: +966500000000' },
  field_contact_email: { en: 'Email', ar: 'البريد الإلكتروني' },
  field_contact_whatsapp: { en: 'WhatsApp', ar: 'واتساب (WhatsApp)' },
  field_description: { en: 'Detailed Website Description & Goals *', ar: 'وصف تفصيلي للموقع وأهدافه *' },
  field_description_placeholder: {
    en: 'Describe your vision, required pages, features, target audience...',
    ar: 'اكتب هنا تفاصيل فكرتك، الصفحات المطلوبة، الميزات، والجمهور المستهدف...'
  },
  field_description_min: { en: 'Minimum: 20 characters', ar: 'الحد الأدنى: 20 حرفاً' },
  field_ref_links: { en: 'Reference Links / Inspiration (Optional)', ar: 'روابط مرجعية / إلهام (اختياري)' },
  field_ref_links_placeholder: { en: 'e.g., links to competitors or designs you like', ar: 'مثال: روابط لمواقع منافسة أو تصاميم نالت إعجابك' },
  field_additional_notes: { en: 'Additional Notes (Optional)', ar: 'ملاحظات إضافية (اختياري)' },
  field_additional_notes_placeholder: { en: 'Any special instructions...', ar: 'أي توضيحات أو ملاحظات تريد إطلاع فريق العمل عليها مبكراً...' },
  field_attachment: { en: 'Attach Documents / Wireframes / Assets', ar: 'إرفاق مستندات / لقطات شاشة' },
  field_attachment_drag: { en: 'Drag files here or click to browse', ar: 'اسحب الملف هنا أو انقر للتصفح' },
  field_attachment_limit: {
    en: 'Supported formats: PDF, Word, ZIP, Images (Max: 1.5MB)',
    ar: 'تنسيقات مقبولة: PDF, Word, ZIP, صور (الحد الأقصى: 1.5 ميجا)'
  },
  field_attachment_success: { en: 'Attachment uploaded successfully', ar: 'تم رفع الملف المرفق بنجاح' },

  // Validation Errors
  error_required_fullname: { en: 'Full name is required', ar: 'الاسم الكامل مطلوب' },
  error_invalid_email: { en: 'Valid email is required', ar: 'بريد إلكتروني صالح مطلوب' },
  error_required_phone: { en: 'Phone / WhatsApp number is required', ar: 'رقم الهاتف / الواتساب مطلوب' },
  error_required_project_title: { en: 'Project title is required', ar: 'عنوان المشروع مطلوب' },
  error_required_description: { en: 'Website description is required (min 20 characters)', ar: 'وصف الموقع مطلوب (20 حرف على الأقل)' },
  error_required_service: { en: 'Please select a service first', ar: 'يرجى اختيار الخدمة أولاً' },
  error_validation_toast: { en: 'Please check the required inputs first', ar: 'يرجى التحقق من المدخلات المطلوبة أولاً' },

  // Form Buttons
  btn_next: { en: 'Next', ar: 'التالي' },
  btn_prev: { en: 'Previous / Back', ar: 'السابق / Back' },
  btn_review: { en: 'Review Request', ar: 'مراجعة الطلب / Review' },
  btn_submit_request: { en: 'Confirm & Submit Request', ar: 'تأكيد وإرسال الطلب / Submit' },
  btn_submitting_request: { en: 'Sending your request...', ar: 'جاري إرسال طلبك...' },
  btn_cancel_request: { en: 'Cancel Request', ar: 'إلغاء هذا الطلب' },
  btn_request_cancelled: { en: 'Request Cancelled', ar: 'تم إلغاء الطلب' },

  // Review Screen
  review_title: { en: 'Review Request Data', ar: 'مراجعة بيانات الطلب' },
  review_subtitle: { en: 'Please verify all details below before final submission.', ar: 'يرجى التحقق من صحة كافة البيانات المدونة أدناه قبل التقديم النهائي.' },
  review_selected_service: { en: 'Requested Service', ar: 'الخدمة المطلوبة' },
  review_project_title: { en: 'Project Title', ar: 'عنوان المشروع' },
  review_budget: { en: 'Estimated Budget', ar: 'الميزانية التقديرية' },
  review_timeline: { en: 'Preferred Timeline', ar: 'الجدول الزمني المفضل' },
  review_client_name: { en: 'Applicant', ar: 'صاحب الطلب' },
  review_contact_info: { en: 'Contact Info', ar: 'معلومات الاتصال' },
  review_country: { en: 'Country', ar: 'الدولة' },
  review_unspecified: { en: 'Unspecified', ar: 'غير محددة' },
  review_desc_label: { en: 'Detailed Description', ar: 'الوصف التفصيلي للمشروع' },
  review_contact_method_label: { en: 'Preferred Contact Method', ar: 'طريقة الاتصال المفضلة' },
  review_attachment_label: { en: 'Attached Documents', ar: 'المستندات المرفقة' },
  review_no_attachment: { en: 'No attachments', ar: 'لا توجد مرفقات' },
  review_back_edit: { en: 'Edit Data / Back', ar: 'تعديل البيانات / Back' },

  // Success Screen
  success_title: { en: 'Request Submitted Successfully', ar: 'تم تقديم الطلب بنجاح' },
  success_desc: {
    en: 'Thank you for choosing Velo Service. Your request has been stored and our team will review it and send a custom quotation within 24 hours.',
    ar: 'شكراً لاختيارك Velo Service. لقد تم استلام طلبك بنجاح وحفظه في خوادمنا، وسيقوم فريقنا بمراجعته وإرسال عرض السعر المخصص خلال 24 ساعة.'
  },
  success_ref_id: { en: 'Unified Reference ID', ar: 'رقم المرجع الموحد / Reference ID' },
  success_track_instruction: {
    en: 'You can use this reference ID and your email to track the status of your request on this page.',
    ar: 'يمكنك استخدام رقم المرجع هذا والبريد الإلكتروني المدخل لتتبع حالة الطلب في علامة تبويب تتبع الطلب.'
  },
  success_btn_whatsapp: { en: 'Follow up via WhatsApp', ar: 'متابعة عبر واتساب / WhatsApp' },
  success_btn_home: { en: 'Back to Home', ar: 'العودة للرئيسية / Back' },

  // Track Request Tab
  track_header: { en: 'Track Your Request Status', ar: 'تتبع حالة طلبك' },
  track_desc: {
    en: 'Enter your email address and the Reference ID (VS-XXXX) assigned to your request to monitor live review progress.',
    ar: 'أدخل عنوان البريد الإلكتروني ورقم طلب الخدمة الموحد (VS-XXXX) الممنوح لك عند تقديم الطلب لمتابعة حالة المراجعة الحية.'
  },
  track_field_email: { en: 'Email address entered in request', ar: 'البريد الإلكتروني المدخل في الطلب (Email Address)' },
  track_field_id: { en: 'Reference ID (VS-XXXX)', ar: 'رقم المرجع الموحد للطلب (Request ID)' },
  track_btn_submit: { en: 'Search and Track Request', ar: 'البحث وتتبع الطلب / Track Now' },
  track_error_validation: { en: 'Please enter both your email and request ID to search', ar: 'يرجى إدخال البريد الإلكتروني ورقم الطلب للبحث' },
  track_success_toast: { en: 'Request retrieved successfully!', ar: 'تم العثور على طلبك بنجاح!' },
  track_btn_search_another: { en: 'Search Another Request', ar: 'البحث عن طلب آخر / Search Another' },
  track_results_header: { en: 'Live Review Status', ar: 'حالة المراجعة الحية والتقديرية' },
  track_results_subtitle: { en: 'Live & estimated status notes from engineers.', ar: 'حالة المراجعة الحية والتقديرية' },
  track_progress_title: { en: 'Review & Development Pipeline', ar: 'خط سير مراجعة وتجهيز المشروع' },
  track_progress_completed: { en: 'Completed', ar: 'اكتمل' },
  track_progress_started: { en: 'Started', ar: 'تم البدء' },
  track_field_submission: { en: 'Submission Date', ar: 'تاريخ التقديم' },
  track_field_team: { en: 'Assigned Team', ar: 'الفريق المكلف' },
  track_field_team_pending: { en: 'Pending assignment', ar: 'قيد التخصيص والتعيين' },
  track_field_delivery: { en: 'Expected Delivery', ar: 'موعد التسليم المتوقع' },
  track_field_delivery_pending: { en: 'Determined after quotation approval', ar: 'يحدد بعد تأكيد عرض السعر' },
  track_admin_notes: { en: 'Latest Admin Update', ar: 'التحديث الإداري الأخير (Latest Update Notes)' },
  track_summary_title: { en: 'Request Summary Reference', ar: 'موجز بيانات الطلب المرجعية' },
  track_quotation_title: { en: 'Financial & Technical Proposal (Quotation)', ar: 'ملف عرض السعر المالي والفني (Quotation PDF)' },
  track_quotation_desc: { en: 'The approved quotation is ready for review and download.', ar: 'تم تجهيز ملف العرض المالي والتقني للمشروع للتحميل المباشر.' },
  track_quotation_download: { en: 'Download Proposal', ar: 'تحميل العرض' },
  track_quotation_download_success: { en: 'Quotation downloaded successfully', ar: 'تم تحميل مستند عرض السعر المعتمد بنجاح' },

  // Dashboard Tab
  dash_header: { en: 'My Web Projects', ar: 'مشاريعي والطلبات المفتوحة' },
  dash_subtitle: { en: 'Welcome back. Track active quotations, development status, and engineering feedback.', ar: 'أهلاً بك. استعرض مراجعات العروض والجدول الزمني التقديري للمشاريع الحالية.' },
  dash_btn_new: { en: 'Submit New Request', ar: 'تقديم طلب خدمة جديد' },
  dash_guest_header: { en: 'Client Dashboard Access', ar: 'لوحة تحكم العملاء' },
  dash_guest_desc: {
    en: 'Please enter the email address you used when submitting your requests to see your project dashboard.',
    ar: 'يرجى إدخال بريدك الإلكتروني المستخدم في تقديم طلبات الخدمات لاستعراض ملفك التعريفي وتتبع كافة مشاريعك المفتوحة.'
  },
  dash_email_placeholder: { en: 'Enter your email address', ar: 'أدخل بريدك الإلكتروني (e.g. email@domain.com)' },
  dash_btn_enter: { en: 'Access Dashboard', ar: 'استعراض لوحة التحكم / Enter' },
  dash_list_title: { en: 'Your Requests List', ar: 'قائمة الطلبات المستلمة' },
  dash_no_requests_title: { en: 'No requests found', ar: 'لا توجد طلبات سابقة' },
  dash_no_requests_desc: {
    en: 'We could not find any service requests registered under your email address.',
    ar: 'لم نجد أي طلبات خدمة مسبقة مرتبطة بالبريد الإلكتروني المدخل.'
  },
  dash_change_email: { en: 'Change Email', ar: 'تغيير البريد الإلكتروني' },
  dash_order_now: { en: 'Order Website Now', ar: 'اطلب خدمة الآن' },
  dash_pipeline_title: { en: 'Milestone Progress Tracker', ar: 'خط سير مراحل التقدم والاعتماد' },
  dash_stage1: { en: 'Under Review', ar: 'قيد الدراسة (10%)' },
  dash_stage2: { en: 'Quotation & Setup', ar: 'الاعتماد والعروض (40%)' },
  dash_stage3: { en: 'Active Development', ar: 'بدء التطوير الفني (70%)' },
  dash_stage4: { en: 'Launch & Handoff', ar: 'اكتمال المشروع (100%)' },
  dash_assigned_team_pending: { en: 'Under technical review', ar: 'قيد الدراسة والتخصيص' },
  dash_delivery_pending: { en: 'Determined upon contract signature', ar: 'يحدد عند توقيع العرض' },
  dash_quotation_section: { en: 'Approved Budget Details', ar: 'بيانات وعروض الميزانية المقترحة' },
  dash_budget_requested: { en: 'Requested Budget', ar: 'الميزانية المقترحة بالطلب' },
  dash_budget_approved: { en: 'Approved Budget', ar: 'الميزانية المعتمدة بالعرض' },
  dash_budget_calculating: { en: 'Calculating project scope', ar: 'جاري تسعير البنود' },
  dash_contact_whatsapp: { en: 'Follow up on WhatsApp', ar: 'متابعة الاستفسار عبر واتساب' },
  dash_contact_email: { en: 'Email Engineering Team', ar: 'مراسلة الفنيين عبر الإيميل' },
  dash_logout: { en: 'Logout', ar: 'تسجيل الخروج' },

  // General Status Labels Translated
  status_pending_review: { en: 'Pending Review', ar: 'قيد الانتظار' },
  status_under_review: { en: 'Under Review', ar: 'قيد الدراسة' },
  status_quotation_sent: { en: 'Quotation Sent', ar: 'تم إرسال العرض' },
  status_awaiting_client: { en: 'Awaiting Client Response', ar: 'بانتظار رد العميل' },
  status_awaiting_payment: { en: 'Awaiting Down-payment', ar: 'بانتظار الدفعة الأولى' },
  status_project_confirmed: { en: 'Project Confirmed', ar: 'تم تأكيد المشروع' },
  status_in_progress: { en: 'In Progress', ar: 'قيد التنفيذ' },
  status_revision: { en: 'Under Revision', ar: 'قيد المراجعة والتعديل' },
  status_completed: { en: 'Completed successfully', ar: 'مكتمل بنجاح' },
  status_cancelled: { en: 'Cancelled', ar: 'ملغي' },

  // Chatbot
  chat_welcome: {
    en: 'Hi! I am Velo, your professional website consultation assistant. Ask me anything about websites, our processes, or pricing.',
    ar: 'مرحباً! أنا فيلو، مساعدك الذكي للاستشارات الفنية. اسألني أي شيء عن تصميم وتطوير مواقع الويب، ومنهجية عملنا، أو أسعارنا.'
  },
  chat_placeholder: { en: 'Type your message...', ar: 'اكتب رسالتك هنا...' },
  chat_suggest_pricing: { en: 'How much does a website cost?', ar: 'كم تكلفة تصميم موقع الكتروني؟' },
  chat_suggest_process: { en: 'What is your working workflow?', ar: 'ما هي منهجية العمل المتبعة لديكم؟' },
  chat_suggest_technologies: { en: 'What tech stack do you use?', ar: 'ما هي التقنيات التي تستخدمونها؟' },

  // Performance and custom cursor translations
  setting_perf_title: { en: 'Performance & Optimization', ar: 'خيارات الأداء وتسريع النظام' },
  setting_cursor_label: { en: 'Interactive Custom Cursor', ar: 'مؤشر الماوس المخصص' },
  setting_cursor_desc: { en: 'Renders an elegant spring-animated cursor trace. Turn OFF to instantly remove mouse movement delay/lag.', ar: 'تأثير حركي لمؤشر الماوس. قم بإيقاف تشغيله لإزالة أي بطء أو تأخير (Lag) في حركة الماوس فوراً.' },
  setting_enable: { en: 'Enabled', ar: 'مفعّل' },
  setting_disable: { en: 'Disabled (Recommended for zero lag)', ar: 'معطّل (موصى به لأداء فائق السرعة)' },
  setting_custom_budget_btn: { en: 'Write Custom Budget', ar: 'كتابة ميزانية مخصصة' },
  setting_select_budget_btn: { en: 'Select from List', ar: 'اختيار من القائمة' },
  field_custom_budget_placeholder: { en: 'e.g., $500, 2000 SAR, etc.', ar: 'مثال: $500 أو 2000 ريال، إلخ.' },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('velo_preferred_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('velo_preferred_language', lang);
  };

  const t = (key: string): string => {
    const translation = TRANSLATIONS[key];
    if (!translation) {
      console.warn(`Missing translation key: ${key}`);
      return key;
    }
    return translation[language] || translation['en'] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className={language === 'ar' ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
