import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { initializeFirebase } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export interface ServiceRequest {
  id: string; // Unique Request ID (e.g. VS-1048)
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  projectTitle: string;
  selectedService: string;
  estimatedBudget: string;
  preferredTimeline: string;
  country: string;
  projectDescription: string;
  referenceLinks?: string;
  additionalNotes?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentData?: string; // base64 representation of small documents/images
  preferredContactMethod: 'Email' | 'WhatsApp';
  status: ServiceRequestStatus;
  latestUpdate?: string;
  assignedTeam?: string;
  estimatedDelivery?: string;
  createdAt: any;
  updatedAt: any;
}

export type ServiceRequestStatus =
  | 'Pending Review'
  | 'Under Review'
  | 'Quotation Sent'
  | 'Awaiting Client Response'
  | 'Awaiting Payment'
  | 'Project Confirmed'
  | 'In Progress'
  | 'Revision'
  | 'Completed'
  | 'Cancelled';

export const STATUS_DETAILS: Record<ServiceRequestStatus, { label: string; color: string; bg: string; border: string; progress: number }> = {
  'Pending Review': { label: 'قيد الانتظار', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', progress: 10 },
  'Under Review': { label: 'قيد الدراسة', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', progress: 25 },
  'Quotation Sent': { label: 'تم إرسال العرض', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', progress: 40 },
  'Awaiting Client Response': { label: 'بانتظار رد العميل', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', progress: 50 },
  'Awaiting Payment': { label: 'بانتظار الدفعة الأولى', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', progress: 60 },
  'Project Confirmed': { label: 'تم تأكيد المشروع', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', progress: 70 },
  'In Progress': { label: 'قيد التنفيذ', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', progress: 85 },
  'Revision': { label: 'قيد المراجعة والتعديل', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', progress: 90 },
  'Completed': { label: 'مكتمل بنجاح', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', progress: 100 },
  'Cancelled': { label: 'ملغي', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', progress: 0 },
};

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Generate unique ID in the format VS-XXXX (where XXXX is a random 4-digit number)
export function generateRequestId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VS-${num}`;
}

// Create a new project request
export async function createServiceRequest(
  requestInput: Omit<ServiceRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const requestId = generateRequestId();
  const path = `service_requests/${requestId}`;
  
  try {
    const { db } = await initializeFirebase();
    if (!db) {
      // Fallback if Firebase is offline/not initialized, save to localStorage
      const localRequests = JSON.parse(localStorage.getItem('velo_service_requests') || '[]');
      const newRequest = {
        ...requestInput,
        id: requestId,
        status: 'Pending Review' as ServiceRequestStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localRequests.push(newRequest);
      localStorage.setItem('velo_service_requests', JSON.stringify(localRequests));
      return requestId;
    }

    const payload = {
      ...requestInput,
      id: requestId,
      status: 'Pending Review' as ServiceRequestStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Strip undefined properties to prevent Firestore SDK errors
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );

    await setDoc(doc(db, 'service_requests', requestId), cleanedPayload);
    return requestId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Get service request by ID & Email (security matching)
export async function getServiceRequest(requestId: string, email: string): Promise<ServiceRequest | null> {
  const path = `service_requests/${requestId}`;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { db } = await initializeFirebase();
    if (!db) {
      // Offline fallback
      const localRequests = JSON.parse(localStorage.getItem('velo_service_requests') || '[]');
      const found = localRequests.find((r: any) => r.id.toLowerCase() === requestId.toLowerCase() && r.email.toLowerCase() === normalizedEmail);
      return found || null;
    }

    const docSnap = await getDoc(doc(db, 'service_requests', requestId));
    if (docSnap.exists()) {
      const data = docSnap.data() as ServiceRequest;
      if (data.email.trim().toLowerCase() === normalizedEmail) {
        // Parse Timestamps to readable format if they exist
        return {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        };
      }
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

// Get all service requests belonging to a specific email
export async function getUserRequests(email: string): Promise<ServiceRequest[]> {
  const path = 'service_requests';
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { db } = await initializeFirebase();
    if (!db) {
      const localRequests = JSON.parse(localStorage.getItem('velo_service_requests') || '[]');
      return localRequests.filter((r: any) => r.email.toLowerCase() === normalizedEmail);
    }

    const q = query(collection(db, 'service_requests'), where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);
    const requests: ServiceRequest[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as ServiceRequest;
      requests.push({
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      });
    });

    // Sort by createdAt desc
    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Get all service requests for Admin Dashboard
export async function getAllRequestsAdmin(): Promise<ServiceRequest[]> {
  const path = 'service_requests';

  try {
    const { db } = await initializeFirebase();
    if (!db) {
      return JSON.parse(localStorage.getItem('velo_service_requests') || '[]');
    }

    const querySnapshot = await getDocs(collection(db, 'service_requests'));
    const requests: ServiceRequest[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as ServiceRequest;
      requests.push({
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      });
    });

    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Admin function to update service request fields
export async function updateServiceRequestAdmin(
  requestId: string,
  updates: Partial<ServiceRequest>
): Promise<void> {
  const path = `service_requests/${requestId}`;

  try {
    const { db } = await initializeFirebase();
    if (!db) {
      const localRequests = JSON.parse(localStorage.getItem('velo_service_requests') || '[]');
      const index = localRequests.findIndex((r: any) => r.id === requestId);
      if (index !== -1) {
        localRequests[index] = {
          ...localRequests[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('velo_service_requests', JSON.stringify(localRequests));
      }
      return;
    }

    const docRef = doc(db, 'service_requests', requestId);
    // Strip undefined properties to prevent Firestore SDK errors
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(docRef, {
      ...cleanedUpdates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Admin function to delete a request
export async function deleteServiceRequestAdmin(requestId: string): Promise<void> {
  const path = `service_requests/${requestId}`;

  try {
    const { db } = await initializeFirebase();
    if (!db) {
      const localRequests = JSON.parse(localStorage.getItem('velo_service_requests') || '[]');
      const filtered = localRequests.filter((r: any) => r.id !== requestId);
      localStorage.setItem('velo_service_requests', JSON.stringify(filtered));
      return;
    }

    await deleteDoc(doc(db, 'service_requests', requestId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
