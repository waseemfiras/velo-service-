# Velo Forge Security Specification & Threat Model

This document outlines the security invariants, threat models, and verification guidelines for the Velo Forge platform.

## 1. Core Data Invariants

Our system enforces strict Attribute-Based Access Control (ABAC) and data integrity models:

1. **Identity Hardening**: A user's profile (`users/{userId}`) can only be created and modified by the user with the exact matching `uid`. Users cannot modify other users' profiles or data.
2. **Project Ownership**: Every project (`projects/{projectId}`) must belong to a specific owner (`userId`). Only the designated owner can read, update, or delete that project.
3. **Owner Lock**: Once a project is created, its `userId` (owner field) and `createdAt` field are completely immutable. They cannot be changed or hijacked.
4. **Clean IDs**: All custom-provided IDs (projects, requests, profiles) must conform to strict alphanumeric patterns (`^[a-zA-Z0-9_\-]+$`) and have bounded lengths to prevent ID-poisoning or Denial-of-Wallet attacks.
5. **System Field Integrity**: Fields such as credits balance (`credits_remaining`), `joinDate`, and `plan` can only be set or modified through trusted administrative operations or systems, never directly by the user on creation or update.
6. **Query Containment**: Collection lists (like listing projects) must enforce owner constraints on the database level, preventing query scraping.

---

## 2. The "Dirty Dozen" Malicious Payloads

These payloads represent 12 attacks designed to break the system's security. Our `firestore.rules` must mathematically reject all of them with `PERMISSION_DENIED`.

### Attack 1: User Profile Hijacking
*   **Target Path**: `/users/victim_user_123`
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Attempt to overwrite or modify another user's profile data.
*   **Payload**:
    ```json
    {
      "name": "Attacker Name",
      "email": "victim@example.com"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (User IDs do not match request.auth.uid).

### Attack 2: Project Owner Spoofing
*   **Target Path**: `/projects/new_project_001`
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Create a project and claim someone else (`victim_user_123`) is the owner.
*   **Payload**:
    ```json
    {
      "id": "new_project_001",
      "name": "Stolen Project",
      "userId": "victim_user_123",
      "createdBy": "victim@example.com",
      "createdDate": "2026-07-12T14:45:00Z",
      "updatedDate": "2026-07-12T14:45:00Z",
      "status": "Draft",
      "progress": 0,
      "pages": [],
      "components": [],
      "settings": {}
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (userId must strictly match request.auth.uid).

### Attack 3: Unearned Credit Injection
*   **Target Path**: `/users/attacker_999`
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Create or update profile to self-allocate 1,000,000 credits.
*   **Payload**:
    ```json
    {
      "id": "attacker_999",
      "name": "Attacker",
      "email": "attacker@example.com",
      "credits_remaining": 1000000,
      "plan": "Enterprise"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Credits and Plan are system-only and immutable by users).

### Attack 4: Project Owner Hijacking
*   **Target Path**: `/projects/existing_project_001`
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Modify the owner (`userId`) of an existing project to claim ownership.
*   **Payload (Update)**:
    ```json
    {
      "userId": "attacker_999"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (userId of a project is immutable after creation).

### Attack 5: ID Poisoning Attack
*   **Target Path**: `/projects/PROJ_$$$_MALICIOUS_STUFF_$$$_VERY_LONG_ID_MORE_THAN_128_CHARS`
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Inject junk-character, extremely long string IDs to cause system crashes or balloon billing.
*   **Payload**:
    ```json
    {
      "name": "Junk ID Project",
      "userId": "attacker_999"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Document ID must match `^[a-zA-Z0-9_\-]+$` and length <= 128).

### Attack 6: Cross-User List scraping
*   **Target Path**: `/projects` (querying without filtering by `userId`)
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Request all projects in the database.
*   **Expected Result**: `PERMISSION_DENIED` (Query must include `where('userId', '==', request.auth.uid)` filter).

### Attack 7: Temporal Manipulation
*   **Target Path**: `/projects/project_123`
*   **Actor**: Authenticated user (`attacker_999` - owner)
*   **Intent**: Backdate project creation time to trick system metrics.
*   **Payload**:
    ```json
    {
      "createdDate": "2010-01-01T00:00:00Z"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (createdDate must be the official `request.time`).

### Attack 8: Cross-User Chat Hijacking
*   **Target Path**: `/user_chats/victim_user_123`
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Read or write another user's assistant chats and session tokens.
*   **Payload**:
    ```json
    {
      "sessions": [],
      "currentSessionId": "malicious"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Paths variables must match request.auth.uid).

### Attack 9: Ghost Field Injection (Shadow Update)
*   **Target Path**: `/projects/project_123`
*   **Actor**: Authenticated user (`attacker_999` - owner)
*   **Intent**: Inject a non-existent configuration key/field into the project schema.
*   **Payload**:
    ```json
    {
      "isVerified": true,
      "isAdminApproved": true,
      "ghostField": "shadow_value"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Strict schema verification allows only whitelisted fields).

### Attack 10: Service Request Field Escalation
*   **Target Path**: `/service_requests/req_123`
*   **Actor**: Anonymous or Authenticated User
*   **Intent**: Forcefully approve own service request or assign to high priority team.
*   **Payload (Update)**:
    ```json
    {
      "status": "Approved",
      "assignedTeam": "Elite Core Developers"
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Only authorized administrators can modify service request tracking fields).

### Attack 11: Self-Assigned Role Escalation
*   **Target Path**: `/users/attacker_999`
*   **Actor**: Authenticated user (`attacker_999`)
*   **Intent**: Self-promote role to "Admin" or "Superuser".
*   **Payload**:
    ```json
    {
      "role": "Admin",
      "isAdmin": true
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Users cannot modify structural privileges/roles).

### Attack 12: Admin Bypass
*   **Target Path**: `/settings/global_config`
*   **Actor**: Non-admin Authenticated user (`attacker_999`)
*   **Intent**: Overwrite maintenance flags or disable AI chats.
*   **Payload**:
    ```json
    {
      "ai_chat_enabled": false,
      "maintenance_mode": true
    }
    ```
*   **Expected Result**: `PERMISSION_DENIED` (Requires verified admin credentials matching official administrators).

---

## 3. Test & Verification Plan

Verification of the rules is executed through:
1. Running static analysis using `eslint-plugin-security-rules`.
2. Making assertions in our code regarding error catches, checking that any unverified/hijacked accesses fall securely back to custom handled errors conforming to `FirestoreErrorInfo`.
