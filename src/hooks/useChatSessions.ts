import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initializeFirebase } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type ModelType = "vgpt-1.5" | "vgpt-2.0-lite" | "gemini-3.5-flash";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  selectedModel: ModelType;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

async function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const { auth } = await initializeFirebase();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useChatSessions() {
  const { user, loading: authLoading } = useAuth();
  
  const defaultSession: ChatSession = {
    id: "default",
    title: "New Conversation",
    messages: [
      {
        id: "1",
        role: "assistant",
        content: "Hello! I am the Velo Service AI assistant. How can I help you today?",
      },
    ],
    selectedModel: "vgpt-1.5" as ModelType
  };

  const [sessions, setSessions] = useState<ChatSession[]>([defaultSession]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("default");
  const [isLoading, setIsLoading] = useState(true);

  // Load from firestore or localStorage
  useEffect(() => {
    let mounted = true;
    if (authLoading) return;
    
    if (!user) {
      if (mounted) {
        const local = localStorage.getItem("velo_local_chats");
        if (local) {
          try {
            const data = JSON.parse(local);
            if (data.sessions && data.sessions.length > 0) {
              setSessions(data.sessions);
              setCurrentSessionId(data.currentSessionId || data.sessions[0].id);
            } else {
              setSessions([defaultSession]);
              setCurrentSessionId("default");
            }
          } catch (e) {
            setSessions([defaultSession]);
            setCurrentSessionId("default");
          }
        } else {
          setSessions([defaultSession]);
          setCurrentSessionId("default");
        }
        setIsLoading(false);
      }
      return;
    }

    const loadSessions = async () => {
      try {
        const { db } = await initializeFirebase();
        if (db && user.uid) {
          const docRef = doc(db, "user_chats", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && mounted) {
            const data = docSnap.data();
            if (data.sessions && data.sessions.length > 0) {
              setSessions(data.sessions);
              setCurrentSessionId(data.currentSessionId || data.sessions[0].id);
            } else {
              setSessions([defaultSession]);
              setCurrentSessionId("default");
            }
          } else if (mounted) {
            // Check if there are local chats we can migrate or use
            const local = localStorage.getItem("velo_local_chats");
            if (local) {
              try {
                const data = JSON.parse(local);
                if (data.sessions && data.sessions.length > 0) {
                  setSessions(data.sessions);
                  setCurrentSessionId(data.currentSessionId || data.sessions[0].id);
                  setIsLoading(false);
                  return;
                }
              } catch (e) {}
            }
            setSessions([defaultSession]);
            setCurrentSessionId("default");
          }
        }
      } catch (e) {
        console.error("Error loading chats", e);
        // Fallback to local storage on error
        const local = localStorage.getItem("velo_local_chats");
        if (local && mounted) {
          try {
            const data = JSON.parse(local);
            if (data.sessions && data.sessions.length > 0) {
              setSessions(data.sessions);
              setCurrentSessionId(data.currentSessionId || data.sessions[0].id);
            }
          } catch (err) {}
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    loadSessions();
    return () => { mounted = false; };
  }, [user, authLoading]);

  // Save to firestore or localStorage
  useEffect(() => {
    if (authLoading || isLoading) return;

    const saveSessions = async () => {
      // Always save to localStorage as a robust immediate fallback
      try {
        localStorage.setItem("velo_local_chats", JSON.stringify({
          sessions,
          currentSessionId
        }));
      } catch (err) {
        console.warn("Failed to save chats to localStorage:", err);
      }

      if (!user) return; // Do not attempt cloud save if guest

      try {
        const { db } = await initializeFirebase();
        if (db && user.uid) {
          const docRef = doc(db, "user_chats", user.uid);
          await setDoc(docRef, {
            sessions,
            currentSessionId
          }, { merge: true });
        }
      } catch (e) {
        console.error("Error saving chats to Firestore", e);
        // We do not throw to prevent app crashing, since localStorage already persisted it successfully!
      }
    };

    saveSessions();
  }, [sessions, currentSessionId, user, authLoading, isLoading]);

  return {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    isLoading
  };
}
