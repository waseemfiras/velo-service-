import { useEffect } from 'react';
import { doc, getFirestore, setDoc, increment } from 'firebase/firestore';
import { initializeFirebase } from '../lib/firebase';

export function useVisitorTracking() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const hasVisited = sessionStorage.getItem('velo_visitor_tracked_v2');
        if (!hasVisited) {
          const { db } = await initializeFirebase();
          if (db) {
            const statsRef = doc(db, 'analytics', 'global_stats');
            await setDoc(statsRef, {
              total_visitors: increment(1),
              last_visit: new Date()
            }, { merge: true });
          }
          
          sessionStorage.setItem('velo_visitor_tracked_v2', 'true');
        }
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    trackVisitor();
  }, []);
}
