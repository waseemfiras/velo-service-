import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { initializeFirebase } from '../lib/firebase';

type ModelType = "vgpt-1.5" | "vgpt-2.0-lite" | "gemini-3.5-flash";

const LIMITS = {
  "vgpt-1.5": 20,
  "vgpt-2.0-lite": 15,
  "gemini-3.5-flash": 10,
};

export function useChatLimits() {
  const { user } = useAuth();
  const [isChatEnabled, setIsChatEnabled] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    const loadConfig = async () => {
      try {
        const { db } = await initializeFirebase();
        if (db) {
          unsubscribe = onSnapshot(doc(db, 'settings', 'global_config'), (docSnap) => {
            if (docSnap.exists()) {
              setIsChatEnabled(docSnap.data().ai_chat_enabled ?? true);
            }
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadConfig();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
  const getTodayKey = () => {
    const today = new Date();
    return `velo_usage_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
  };

  const getUsage = () => {
    try {
      const stored = localStorage.getItem(getTodayKey());
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return { "vgpt-1.5": 0, "vgpt-2.0-lite": 0, "gemini-3.5-flash": 0 };
  };

  const incrementUsage = (model: ModelType) => {
    if (user) return; // No limits for logged in users
    const usage = getUsage();
    usage[model] = (usage[model] || 0) + 1;
    localStorage.setItem(getTodayKey(), JSON.stringify(usage));
  };

  const canSendMessage = (model: ModelType) => {
    if (!isChatEnabled) return { allowed: false, reason: 'disabled' };
    if (user) return { allowed: true, reason: 'ok' };
    const usage = getUsage();
    const limit = LIMITS[model as keyof typeof LIMITS] || 0;
    if ((usage[model] || 0) >= limit) {
      return { allowed: false, reason: 'limit' };
    }
    return { allowed: true, reason: 'ok' };
  };

  return { incrementUsage, canSendMessage, isChatEnabled };
}
