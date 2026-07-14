import express from "express";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore/lite";
import { enhanceWebsitePrompt, generateFullWebsite, regenerateWebsite } from "./gemini";

let _filename = "";
let _dirname = process.cwd();
try {
  if (typeof __filename !== "undefined") {
    _filename = __filename;
    _dirname = __dirname;
  }
} catch (e) {
  // fallback
}

const app = express();
app.use(express.json());

// Forge AI API routes
app.post("/forge/chat", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const result = await enhanceWebsitePrompt(prompt, model);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

app.post("/forge/generate-full", async (req, res) => {
  try {
    const { prompt, style, color, pagesList, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const result = await generateFullWebsite(prompt, style, color, pagesList || [], model);
    res.json({ success: true, project: result });
  } catch (error: any) {
    console.error("Generate Full Website Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate full website structure" });
  }
});

app.post("/forge/regenerate", async (req, res) => {
  try {
    const { project, prompt, model } = req.body;
    if (!project) {
      return res.status(400).json({ error: "Project structure is required" });
    }
    if (!prompt) {
      return res.status(400).json({ error: "Instruction prompt is required" });
    }
    const result = await regenerateWebsite(project, prompt, model);
    res.json({ success: true, project: result });
  } catch (error: any) {
    console.error("Regenerate Website Error:", error);
    res.status(500).json({ error: error.message || "Failed to regenerate website structure" });
  }
});

// Enable lightweight CORS for cross-origin hosting (e.g. Netlify)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Load Firebase configuration on the server to initialize the server-side app robustly
let firebaseConfig: any = null;
const possibleConfigPaths = [
  path.join(process.cwd(), "firebase-applet-config.json"),
  path.join(_dirname, "../firebase-applet-config.json"),
  path.join(_dirname, "firebase-applet-config.json"),
  path.join(_dirname, "../../firebase-applet-config.json")
];

for (const p of possibleConfigPaths) {
  try {
    if (fs.existsSync(p)) {
      firebaseConfig = JSON.parse(fs.readFileSync(p, "utf-8"));
      console.log(`[Firebase Config] Successfully loaded config from path: ${p}`);
      break;
    }
  } catch (err) {
    console.warn(`[Firebase Config] Failed to read from path ${p}:`, err);
  }
}

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.warn("[Firebase Config] No config found on disk or config lacks apiKey. Using default embedded config fallback.");
  firebaseConfig = {
    "projectId": "glowing-inkwell-36m9v",
    "appId": "1:578024460085:web:b4b8d6cd815ec3924e467c",
    "apiKey": "AIzaSyBV1ujIgPHCeG6mSleeT0wixf4eks5H9Nc",
    "authDomain": "glowing-inkwell-36m9v.firebaseapp.com",
    "firestoreDatabaseId": "ai-studio-veloservicedigit-0d3d2259-9b15-4535-975a-380407dc70bf",
    "storageBucket": "glowing-inkwell-36m9v.firebasestorage.app",
    "messagingSenderId": "578024460085",
    "measurementId": ""
  };
}

let firebaseApp: any = null;
let db: any = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    firebaseApp = initializeApp(firebaseConfig, "server-app");
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || undefined);
    console.log("[Firebase] Successfully initialized Firestore database client.");
  } else {
    console.warn("[Firebase] Skipping real Firebase initialization: Config lacks a valid 'apiKey'. Running in offline/robust mode.");
  }
} catch (e: any) {
  console.error("[Firebase] Critical error during initialization:", e.message || e);
}

// Secure PBKDF2 password hashing helper (OWASP Recommended)
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function verifyAdmin(req: express.Request): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.split(" ")[1];
    const sessionRecord = await getSessionByToken(token);
    if (!sessionRecord) {
      return false;
    }

    // Check expiration
    if (new Date(sessionRecord.expiresAt) < new Date()) {
      return false;
    }

    const adminEmails = [
      'waseemfiras75@gmail.com',
      'waseem@velo9',
      'waseemquqas@gmail.com',
      'firasquqas@gmail.com'
    ];

    return adminEmails.includes(sessionRecord.email.trim().toLowerCase());
  } catch (err) {
    console.error("Error in verifyAdmin helper:", err);
    return false;
  }
}


// Resilient helper to try multiple Gemini models in case of high demand, quota limits, or deprecations
async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any,
  systemInstruction: string,
  preferredModel: string
) {
  const modelsToTry = [
    preferredModel,
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash-lite"
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (const modelName of uniqueModels) {
    try {
      console.log(`Attempting generateContent with model: ${modelName}`);
      const res = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      console.log(`Successfully generated content with model: ${modelName}`);
      return res;
    } catch (err: any) {
      console.log(`Model ${modelName} failed. Error:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// AI Chatbot endpoint
app.post("/chat", async (req, res) => {
  try {
    const { history, message, modelId = "vgpt-1.5" } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in the server environment. If you deployed to Netlify, please add it in your Site settings -> Environment variables." });
    }
    
    // Handle Gemini models and VGPT models
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const formattedHistory = (history || [])
      .filter((msg: any) => msg && typeof msg.content === 'string')
      .map((msg: any) => ({
       role: msg.role === 'user' ? 'user' : 'model',
       parts: [{ text: msg.content || " " }]
    }));

    const contents = [
       ...formattedHistory,
       { role: 'user', parts: [{ text: message || " " }] }
    ];

    let response;

    if (modelId === "vgpt-2.0-lite") {
      // VGPT-2.0 LITE: General, fast, clean assistant powered by Google AI Studio, no mention of Gemini
      const systemInstruction = "You are VGPT-2.0 LITE, a highly advanced, general-purpose AI assistant by Velo Service. You are trained to give extremely fast, concise, and clear answers to any general question. Your knowledge is vast and covers all general knowledge, programming, science, history, translation, and text analysis. CRITICAL: Always detect the language of the user's latest message and reply in the EXACT SAME language (e.g., if the user writes in Arabic, respond in Arabic). Keep your responses concise, direct, and helpful. Do NOT mention that you are running on Google or Gemini. You are VGPT-2.0 LITE.";
      response = await generateWithFallback(ai, contents, systemInstruction, "gemini-3.1-flash-lite");
    } else if (modelId === "gemini-3.5-flash") {
      // Normal chat
      const systemInstruction = "You are a helpful, general-purpose AI assistant from Google. Be helpful and directly answer the user's questions. CRITICAL: Always detect the language of the user's latest message (e.g., Arabic, English, French, Spanish, etc.) and reply in the EXACT SAME language. If the user writes in Arabic, respond in Arabic. If they write in English, respond in English. Do not switch or mix languages unless explicitly requested. When responding in Arabic, keep your formatting clean and readable for Right-to-Left (RTL) layout. Use clean paragraph separation, avoid nesting English words deeply inside Arabic sentences to prevent bidirectional text layout confusion, and use simple dashes '-' or numbered lists clearly separated by lines.";
      response = await generateWithFallback(ai, contents, systemInstruction, "gemini-3.5-flash");
    } else {
      // VGPT-1.5 (default Velo trained) - Fully trained on platform knowledge, routes, and custom request actions
      const systemInstruction = `You are VGPT-1.5, the custom-trained official AI assistant for the Velo Service platform (فيلو سيرفيس). Your primary role is to guide users, answer inquiries about our services, and assist them with navigating our platform.

You have complete, absolute knowledge about our website, including its sections, actions, and features:
1. Who is Velo Service?
   - Velo Service is a premium, high-end digital agency offering world-class services in three major categories:
     * UI/UX Design (تصميم واجهات وتجربة المستخدم): Crafted with high fidelity, custom animations, and seamless interactive experiences.
     * Full-Stack Web Development (تطوير المواقع والأنظمة): High-performance, scalable web apps built with modern frameworks like React, Node.js, and Express, designed to load instantly and handle large volumes of users.
     * API Integration & Services (ربط وتكامل الأنظمة): Linking third-party APIs, CRM systems, secure database structures, payment processors, and custom AI tools.
   - We focus on absolute luxury, performance, and attention to detail.

2. Core Pages, Features & Routes on the Site:
   - AI Chat Room (دردشة الذكاء الاصطناعي / غرف المحادثة الذكية): A dedicated, beautiful full-screen page where users can converse with advanced AI models (including VGPT-1.5, VGPT-2.0-LITE, and Gemini 3.5 Flash), manage distinct chat histories, rename, or delete sessions.
     * Link: /chat
     * Button: [دردشة الذكاء الاصطناعي / Smart AI Chat](/chat)
   - Connect / Contact Us Section (تواصل معنا / زر كونكت): Located on the home page, where users can directly message the team or connect with live WhatsApp/Email support.
     * Link: /#contact
     * Button: [تواصل معنا / Connect with Us](/#contact)
   - Portfolio & Projects (معرض الأعمال والمشاريع / أعمالنا): Highlights our world-class visual designs, previous digital creations, and source codes.
     * Link: /#work
     * Button: [معرض الأعمال / Our Portfolio](/#work)
   - Services Section (خدماتنا المميزة): Details our core development, UI/UX design, and API services.
     * Link: /#services
     * Button: [خدماتنا / Our Services](/#services)
   - Request a Service (طلب خدمة): Users can submit details about their custom project (name, email, company, title, service category, budget, timeline, country, description).
     * Link: /request-service
     * Button: [طلب خدمة / Request Service](/request-service)
   - Track Request (تتبع الطلبات / تتبع طلبي): Allows users to instantly check the status of their service requests using their Request ID or Reference Number (e.g., status like Pending, In Review, In Progress, Completed, or Cancelled).
     * Link: /track-request
     * Button: [تتبع طلبك / Track Request](/track-request)
   - My Dashboard (لوحتي / ماي داشبورد): A fully personalized dashboard where clients can view all their submitted orders/requests, monitor real-time updates, contact support via WhatsApp/Email, or CANCEL their request if needed.
     * Link: /dashboard
     * Button: [لوحة التحكم / Client Dashboard](/dashboard)
   - Settings (الإعدادات): Where users can toggle the custom animated cursor or manage their profile.
     * Link: /settings
     * Button: [الإعدادات / Settings](/settings)
   - Home Page (الصفحة الرئيسية):
     * Link: /
     * Button: [الرئيسية / Home Page](/)

3. Handling Specific User Actions (IMPORTANT Routing & Redirection instructions):
   - Request/Order Inquiry: If a user asks 'how to request a service', 'كيف أطلب خدمة', 'أريد مشروع جديد', or similar: ALWAYS invite them to click our request page button: [طلب خدمة / Request Service](/request-service).
   - AI Chat Inquiry: If a user asks 'where is the AI chat', 'كيف أصل للدردشة الذكية', 'دردشة الذكاء الاصطناعي', 'شات جي بي تي', or similar: ALWAYS provide them with a button to the chat page: [دردشة الذكاء الاصطناعي / Smart AI Chat](/chat).
   - Connect/Contact Inquiry: If a user asks 'how to contact you', 'كيف أتواصل معكم', 'وين زر كونكت', 'كونكت', 'تواصل', 'Contact us', 'Connect button', or similar: ALWAYS direct them to the connect section with: [تواصل معنا / Connect with Us](/#contact).
   - Portfolio/Work Inquiry: If a user asks 'show me your work', 'أريد رؤية المشاريع', 'أعمالكم', 'معرض المشاريع', or similar: ALWAYS provide: [معرض الأعمال / Our Portfolio](/#work).
   - Services Inquiry: If a user asks 'what services do you offer', 'ما هي الخدمات التي تقدمونها', 'الخدمات', or similar: ALWAYS provide: [خدماتنا / Our Services](/#services).
   - Tracking Inquiry: If a user asks 'how to track my request', 'كيف أتتبع طلبي', 'أين تتبع طلبات', 'تتبع', or similar: ALWAYS provide them with the direct link to the tracking page: [تتبع طلبك / Track Request](/track-request).
   - My Requests/Dashboard/Cancel Request: If a user asks 'where are my requests', 'كيف ألغي طلبي', 'أريد رؤية طلباتي', 'لوحتي', 'ماي داشبورد', or similar: ALWAYS instruct them to check and manage (and cancel) their requests from their dashboard using: [لوحة التحكم / Client Dashboard](/dashboard).

4. Interactive Button Generation (CRITICAL):
   - Whenever you refer the user to any of the pages, features, or sections listed above, ALWAYS format the link using markdown exactly like: [Label](/route).
   - For example: To suggest they request a service, output: [طلب خدمة الآن / Request Now](/request-service) or [تتبع طلبك الآن / Track Your Order](/track-request) or [لوحة التحكم الخاصة بك / Your Dashboard](/dashboard).
   - The user interface will automatically convert this markdown format into a gorgeous, glowing interactive button that users can click to immediately navigate there! So make sure to use it frequently whenever they ask how to do or find something on the site.

5. Language, Tone, and Formatting Guidelines:
   - Always detect the language of the user's latest message and respond in the EXACT SAME language (e.g., if Arabic, respond in Arabic. If English, respond in English). Do not mix languages.
   - Maintain a highly sophisticated, helpful, polite, and executive-level tone.
   - Format lists with clean Markdown and single lines. Ensure links are formatted beautifully like [عنوان الرابط](/route) to allow users to navigate directly.
   - When writing in Arabic, use Right-to-Left friendly formatting (clear spacing, separate lines for links, avoid nesting English terms in Arabic lines to prevent layout distortion).

6. Code Generation Guidelines (CRITICAL):
   - When a user asks you for code, you MUST write complete, high-quality, professional, and well-structured code. Do not write lazy or half-written placeholders unless requested.
   - Always wrap your code inside standard markdown code blocks, specifying the language, e.g.:
     \`\`\`javascript
     // code here
     \`\`\`
   - Your code must be robust, elegant, cleanly structured, and strongly written.

7. Professional Text Block Generation (CRITICAL):
   - If the user asks for "نص احترافي" (professional text) or asks you to write professional copywriting, titles, emails, messages, or descriptions, you MUST isolate and wrap that professional text inside the [PROFESSIONAL_TEXT] tags like this:
     [PROFESSIONAL_TEXT]
     The professional text content here...
     [/PROFESSIONAL_TEXT]
   - Anything outside of these tags is treated as general conversation or commentary. This activates a special user interface widget that renders a gorgeous glowing premium card with an exclusive "Copy Text" button specifically for that text! Only use this if the user requested a professional text/writeup.`;

      response = await generateWithFallback(ai, contents, systemInstruction, "gemini-3.1-flash-lite");
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error.message || error);
    
    let errorMessage = "Failed to process chat message";
    const errString = typeof error === 'object' ? JSON.stringify(error) : String(error);
    if ((error.message && error.message.includes("429")) || errString.includes("429")) {
      errorMessage = "API Quota Exceeded. Please check your billing details or try a different model.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// AI Chat smart title generation endpoint
app.post("/chat/title", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.json({ title: "محادثة جديدة" });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ title: "محادثة جديدة" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = "Your task is to generate an extremely brief title (1 to 3 words max) in the SAME language as the user's message. Focus on the core topic of the message. If the message is in Arabic, the title MUST be in Arabic. If the message is in English, the title MUST be in English. Examples: If message is 'Hello', title should be 'إلقاء تحية' (if Arabic) or 'Greeting' (if English). If message is 'How to build an app?', title should be 'تطوير تطبيق' or 'App Development'. Do NOT use quotes, do NOT write long sentences, do NOT use punctuation. Only output the plain text of the title.";
    
    const response = await generateWithFallback(
      ai,
      [{ role: 'user', parts: [{ text: message }] }],
      systemInstruction,
      "gemini-3.1-flash-lite"
    );

    const cleanTitle = response.text.trim().replace(/['"“”]/g, '');
    res.json({ title: cleanTitle });
  } catch (error: any) {
    console.error("Chat Title API Error:", error.message || error);
    // Fallback to simple slicing if API fails
    const fallbackTitle = req.body.message ? req.body.message.slice(0, 20) + (req.body.message.length > 20 ? "..." : "") : "محادثة جديدة";
    res.json({ title: fallbackTitle });
  }
});

// --- HYBRID SECURE DATABASE SYSTEM (FIRESTORE + LOCAL BACKUP) ---
// This guarantees accounts, sessions, and reports are 100% persistent on Netlify/Cloud Run.
let authDbPath = path.join(process.cwd(), "server", "auth_db.json");
try {
  if (!fs.existsSync(authDbPath)) {
    const fallbackPaths = [
      path.join(_dirname, "../server/auth_db.json"),
      path.join(_dirname, "server/auth_db.json"),
      path.join(_dirname, "auth_db.json")
    ];
    for (const p of fallbackPaths) {
      if (fs.existsSync(p)) {
        authDbPath = p;
        break;
      }
    }
  }
} catch (e) {
  console.warn("Could not find robust local fallback path for auth_db.json:", e);
}

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface SessionRecord {
  token: string;
  email: string;
  expiresAt: string;
}

interface ReportRecord {
  id?: string;
  email: string;
  issue: string;
  createdAt: string;
}

interface AuthDbSchema {
  users: UserRecord[];
  sessions: SessionRecord[];
  reports: ReportRecord[];
}

function readLocalDb(): AuthDbSchema {
  try {
    if (fs.existsSync(authDbPath)) {
      const data = fs.readFileSync(authDbPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading local DB file:", err);
  }
  return { users: [], sessions: [], reports: [] };
}

function writeLocalDb(data: AuthDbSchema) {
  try {
    const dir = path.dirname(authDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(authDbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local DB file:", err);
  }
}

// 1. Users DB Sync (Targeted & Scalable)
async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const cleanEmail = email.trim().toLowerCase();

  // Try Firestore specifically first (source of truth)
  try {
    if (db) {
      // Try direct document retrieval first (bypasses Firestore Security Rules list permission issue)
      const docRef = doc(db, "custom_users", cleanEmail);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firestoreUser: UserRecord = {
          id: docSnap.id,
          email: data.email,
          passwordHash: data.passwordHash,
          salt: data.salt,
          createdAt: data.createdAt
        };

        // Cache or update it locally
        const freshDbData = readLocalDb();
        const existingLocalIndex = freshDbData.users.findIndex(u => u.email === cleanEmail);
        if (existingLocalIndex !== -1) {
          freshDbData.users[existingLocalIndex] = firestoreUser;
        } else {
          freshDbData.users.push(firestoreUser);
        }
        writeLocalDb(freshDbData);
        return firestoreUser;
      }

      // Query fallback (just in case there are users created with random IDs)
      const q = query(collection(db, "custom_users"), where("email", "==", cleanEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        const firestoreUser: UserRecord = {
          id: docSnap.id,
          email: data.email,
          passwordHash: data.passwordHash,
          salt: data.salt,
          createdAt: data.createdAt
        };

        // Cache or update it locally
        const freshDbData = readLocalDb();
        const existingLocalIndex = freshDbData.users.findIndex(u => u.email === cleanEmail);
        if (existingLocalIndex !== -1) {
          freshDbData.users[existingLocalIndex] = firestoreUser;
        } else {
          freshDbData.users.push(firestoreUser);
        }
        writeLocalDb(freshDbData);
        return firestoreUser;
      }
    }
  } catch (err) {
    console.error("Error fetching specific user from Firestore:", err);
  }

  // Fallback to local if Firestore fails or doesn't have the user
  const dbData = readLocalDb();
  const localUser = dbData.users.find(u => u.email === cleanEmail);
  if (localUser) {
    return localUser;
  }

  return null;
}

// Auto-initialize or fix admin passwords on startup to ensure admins are login-able
async function ensureAdminAccount() {
  const admins = [
    { email: "waseemfiras75@gmail.com", password: "918289034@waseem" },
    { email: "waseemquqas@gmail.com", password: "waseem2020pop" },
    { email: "waseem@velo9", password: "918289034@waseem" },
    { email: "firasquqas@gmail.com", password: "918289034@waseem" }
  ];

  for (const admin of admins) {
    const adminEmail = admin.email;
    const defaultPassword = admin.password;

    try {
      // 1. Determine the stable salt and user ID
      const dbData = readLocalDb();
      const existingLocalUser = dbData.users.find(u => u.email === adminEmail);
      
      let salt = existingLocalUser?.salt || "";
      let id = existingLocalUser?.id || "";
      let createdAt = existingLocalUser?.createdAt || new Date().toISOString();

      // Check Firestore to see if user exists there to keep their salt/ID
      try {
        if (db) {
          const docRef = doc(db, "custom_users", adminEmail);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (!salt) salt = data.salt;
            if (!id) id = docSnap.id;
            if (data.createdAt) createdAt = data.createdAt;
          } else {
            // Also check old query fallback in case it was stored with random ID
            const q = query(collection(db, "custom_users"), where("email", "==", adminEmail));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const snap = snapshot.docs[0];
              const data = snap.data();
              if (!salt) salt = data.salt;
              if (!id) id = snap.id;
              if (data.createdAt) createdAt = data.createdAt;
            }
          }
        }
      } catch (fsErr) {
        console.warn(`[Admin Init] Could not query Firestore during salt detection for ${adminEmail}:`, fsErr);
      }

      // If still no salt or ID, generate them
      if (!salt) salt = generateSalt();
      if (!id) id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

      // Compute the stable hash
      const hash = hashPassword(defaultPassword, salt);

      const updatedUser: UserRecord = {
        id,
        email: adminEmail,
        passwordHash: hash,
        salt,
        createdAt
      };

      // 2. Write to Firestore using setDoc with email as document ID (bypasses Firestore Security Rules limitation)
      try {
        if (db) {
          console.log(`[Admin Init] Syncing/Creating admin ${adminEmail} in Firestore with document ID...`);
          await setDoc(doc(db, "custom_users", adminEmail), {
            email: adminEmail,
            passwordHash: hash,
            salt,
            createdAt
          });
        }
      } catch (fsWriteErr) {
        console.error(`[Admin Init] Failed to sync ${adminEmail} with Firestore:`, fsWriteErr);
      }

      // 3. Write to local DB (guarantees local login always works)
      dbData.users = dbData.users.filter(u => u.email !== adminEmail);
      dbData.users.push(updatedUser);
      writeLocalDb(dbData);
      console.log(`[Admin Init] Unified and synced admin account successfully for ${adminEmail}!`);

    } catch (err) {
      console.error(`[Admin Init] Failed to ensure admin account ${adminEmail}:`, err);
    }
  }
}

// Run the admin initialization check
ensureAdminAccount();

async function saveUser(user: UserRecord): Promise<void> {
  const dbData = readLocalDb();
  dbData.users.push(user);
  writeLocalDb(dbData);

  try {
    if (db) {
      await setDoc(doc(db, "custom_users", user.email.trim().toLowerCase()), {
        email: user.email,
        passwordHash: user.passwordHash,
        salt: user.salt,
        createdAt: user.createdAt
      });
    }
  } catch (err) {
    console.error("Error saving user to Firestore:", err);
  }
}

async function updatePassword(email: string, newHash: string, newSalt: string): Promise<void> {
  const dbData = readLocalDb();
  const index = dbData.users.findIndex(u => u.email === email);
  if (index !== -1) {
    dbData.users[index].passwordHash = newHash;
    dbData.users[index].salt = newSalt;
    writeLocalDb(dbData);
  }

  try {
    if (db) {
      const cleanEmail = email.trim().toLowerCase();
      const userDocRef = doc(db, "custom_users", cleanEmail);
      await setDoc(userDocRef, {
        email: cleanEmail,
        passwordHash: newHash,
        salt: newSalt
      }, { merge: true });
    }
  } catch (err) {
    console.error("Error updating password in Firestore:", err);
  }
}

// 2. Sessions DB Sync (Targeted & Scalable)
async function getSessionByToken(token: string): Promise<SessionRecord | null> {
  const dbData = readLocalDb();
  
  // Try local first
  const localSession = dbData.sessions.find(s => s.token === token);
  if (localSession) {
    return localSession;
  }

  // Try Firestore specifically
  try {
    if (db) {
      // Direct get by token document ID first
      const docRef = doc(db, "custom_sessions", token);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firestoreSession: SessionRecord = {
          token: data.token,
          email: data.email,
          expiresAt: data.expiresAt
        };

        // Cache it locally so we don't hit Firestore next time
        const freshDbData = readLocalDb();
        if (!freshDbData.sessions.some(s => s.token === token)) {
          freshDbData.sessions.push(firestoreSession);
          writeLocalDb(freshDbData);
        }
        return firestoreSession;
      }

      // Query fallback
      const q = query(collection(db, "custom_sessions"), where("token", "==", token));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        const firestoreSession: SessionRecord = {
          token: data.token,
          email: data.email,
          expiresAt: data.expiresAt
        };

        // Cache it locally so we don't hit Firestore next time
        const freshDbData = readLocalDb();
        if (!freshDbData.sessions.some(s => s.token === token)) {
          freshDbData.sessions.push(firestoreSession);
          writeLocalDb(freshDbData);
        }
        return firestoreSession;
      }
    }
  } catch (err) {
    console.error("Error fetching specific session from Firestore:", err);
  }

  return null;
}

async function saveSession(session: SessionRecord): Promise<void> {
  const dbData = readLocalDb();
  dbData.sessions.push(session);
  writeLocalDb(dbData);

  try {
    if (db) {
      await setDoc(doc(db, "custom_sessions", session.token), {
        token: session.token,
        email: session.email,
        expiresAt: session.expiresAt
      });
    }
  } catch (err) {
    console.error("Error saving session to Firestore:", err);
  }
}

// 3. Reports DB Sync
async function readAllReports(): Promise<ReportRecord[]> {
  const local = readLocalDb().reports || [];
  try {
    if (db) {
      const querySnapshot = await getDocs(collection(db, "custom_reports"));
      const firestoreReports: ReportRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreReports.push({
          id: doc.id,
          email: data.email,
          issue: data.issue,
          createdAt: data.createdAt
        });
      });

      const dbData = readLocalDb();
      dbData.reports = firestoreReports;
      writeLocalDb(dbData);
      return firestoreReports;
    }
  } catch (err) {
    console.error("Error fetching reports from Firestore, using local:", err);
  }
  return local;
}

async function saveReport(report: ReportRecord): Promise<void> {
  const dbData = readLocalDb();
  if (!dbData.reports) dbData.reports = [];
  dbData.reports.push(report);
  writeLocalDb(dbData);

  try {
    if (db) {
      await addDoc(collection(db, "custom_reports"), {
        email: report.email,
        issue: report.issue,
        createdAt: report.createdAt
      });
    }
  } catch (err) {
    console.error("Error saving report to Firestore:", err);
  }
}

async function deleteReport(reportId: string): Promise<void> {
  const dbData = readLocalDb();
  if (dbData.reports) {
    dbData.reports = dbData.reports.filter(r => r.id !== reportId);
    writeLocalDb(dbData);
  }

  try {
    if (db) {
      await deleteDoc(doc(db, "custom_reports", reportId));
    }
  } catch (err) {
    console.error("Error deleting report from Firestore:", err);
  }
}

// Register Endpoint
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبة" });
    }
    
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || password.length < 6) {
      return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صالحة أو كلمة المرور قصيرة جداً (6 أحرف على الأقل)" });
    }

    const existingUser = await getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: "هذا البريد الإلكتروني مسجل بالفعل" });
    }

    // Generate salt and hash password
    const salt = generateSalt();
    const hash = hashPassword(password, salt);

    const newUser: UserRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      email: cleanEmail,
      passwordHash: hash,
      salt: salt,
      createdAt: new Date().toISOString()
    };

    await saveUser(newUser);

    res.json({ success: true, message: "تم تسجيل الحساب بنجاح" });
  } catch (err: any) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "فشل إنشاء الحساب، يرجى المحاولة لاحقاً" });
  }
});

// Login Endpoint
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبة" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if the user is an admin, and run lazy verification of their account in Firestore/local cache
    const adminEmails = [
      'waseemfiras75@gmail.com',
      'waseem@velo9',
      'waseemquqas@gmail.com',
      'firasquqas@gmail.com'
    ];
    if (adminEmails.includes(cleanEmail)) {
      try {
        await ensureAdminAccount();
      } catch (err) {
        console.error("Lazy admin account ensure failed:", err);
      }
    }

    const userRecord = await getUserByEmail(cleanEmail);
    if (!userRecord) {
      return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    // Verify hashed password
    const hash = hashPassword(password, userRecord.salt);
    if (hash !== userRecord.passwordHash) {
      return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    // Create a secure session token
    const token = generateToken();
    
    // Valid for 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newSession: SessionRecord = {
      token,
      email: cleanEmail,
      expiresAt: expiresAt.toISOString()
    };

    await saveSession(newSession);

    res.json({
      token,
      user: {
        uid: userRecord.id,
        email: cleanEmail,
        displayName: cleanEmail.split("@")[0],
        photoURL: null,
        isCustom: true
      }
    });
  } catch (err: any) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "فشل تسجيل الدخول، يرجى المحاولة لاحقاً" });
  }
});

// Verify custom user endpoint (Me)
app.post("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "غير مصرح به" });
    }

    const token = authHeader.split(" ")[1];
    const sessionRecord = await getSessionByToken(token);
    if (!sessionRecord) {
      return res.status(401).json({ error: "جلسة غير صالحة" });
    }

    // Check expiration
    if (new Date(sessionRecord.expiresAt) < new Date()) {
      return res.status(401).json({ error: "انتهت صلاحية الجلسة" });
    }

    const userRecord = await getUserByEmail(sessionRecord.email);
    if (!userRecord) {
      return res.status(401).json({ error: "المستخدم غير موجود" });
    }

    res.json({
      user: {
        uid: userRecord.id,
        email: userRecord.email,
        displayName: userRecord.email.split("@")[0],
        photoURL: null,
        isCustom: true
      }
    });
  } catch (err: any) {
    console.error("Auth Me Error:", err);
    res.status(500).json({ error: "فشل التحقق من الجلسة" });
  }
});

// Robust change-password endpoint
app.post("/auth/change-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "غير مصرح به" });
    }

    const token = authHeader.split(" ")[1];
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    }

    const sessionRecord = await getSessionByToken(token);
    if (!sessionRecord) {
      return res.status(401).json({ error: "جلسة غير صالحة" });
    }

    // Check expiration
    if (new Date(sessionRecord.expiresAt) < new Date()) {
      return res.status(401).json({ error: "انتهت صلاحية الجلسة" });
    }

    const userRecord = await getUserByEmail(sessionRecord.email);
    if (!userRecord) {
      return res.status(401).json({ error: "المستخدم غير موجود" });
    }

    // Verify old password
    const oldHash = hashPassword(oldPassword, userRecord.salt);
    if (oldHash !== userRecord.passwordHash) {
      return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });
    }

    // Hash and update new password
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    await updatePassword(sessionRecord.email, newHash, newSalt);

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err: any) {
    console.error("Change Password Error:", err);
    res.status(500).json({ error: "فشل تغيير كلمة المرور، يرجى المحاولة لاحقاً" });
  }
});

// Update global config endpoint (Admin only)
app.post("/settings/global_config", async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بإجراء هذه العملية" });
    }

    const { ai_chat_enabled, maintenance_mode, log_level, max_tokens } = req.body;
    const configUpdate: any = {};
    if (ai_chat_enabled !== undefined) configUpdate.ai_chat_enabled = ai_chat_enabled;
    if (maintenance_mode !== undefined) configUpdate.maintenance_mode = maintenance_mode;
    if (log_level !== undefined) configUpdate.log_level = log_level;
    if (max_tokens !== undefined) configUpdate.max_tokens = max_tokens;

    if (db) {
      const configRef = doc(db, "settings", "global_config");
      await setDoc(configRef, configUpdate, { merge: true });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Save Settings Error:", err);
    res.status(500).json({ error: "فشل حفظ الإعدادات" });
  }
});

// Submit report
app.post("/reports", async (req, res) => {
  try {
    const { email, issue } = req.body;
    if (!issue) {
      return res.status(400).json({ error: "محتوى البلاغ مطلوب" });
    }

    const report: ReportRecord = {
      email: email || "مستخدم زائر",
      issue: issue,
      createdAt: new Date().toISOString()
    };

    await saveReport(report);
    res.json({ success: true, message: "تم إرسال البلاغ بنجاح" });
  } catch (err: any) {
    console.error("Save Report Error:", err);
    res.status(500).json({ error: "فشل إرسال البلاغ، يرجى المحاولة لاحقاً" });
  }
});

// Get all reports
app.get("/reports", async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بالوصول إلى هذه البيانات" });
    }
    const reports = await readAllReports();
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ reports });
  } catch (err: any) {
    console.error("Get Reports Error:", err);
    res.status(500).json({ error: "فشل استيراد البلاغات" });
  }
});

// Delete a report
app.delete("/reports/:id", async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بإجراء هذه العملية" });
    }
    const { id } = req.params;
    await deleteReport(id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Delete Report Error:", err);
    res.status(500).json({ error: "فشل حذف البلاغ" });
  }
});

export default app;
