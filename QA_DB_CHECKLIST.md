# 🧪 Zhatn QA Guide - Real Database & Launch Prep

This guide is designed to verify the "Real-Time" capabilities before we publish Supabase to production.

## 🚀 Pre-Requisites
- Open two **different browser windows** (e.g., Chrome & Edge, or Chrome & Incognito).
- Ensure your internet connection is active (database is in the cloud).

## 1. Authentication & Persistence Check
### Test Steps:
1.  **Tab A:** Open the app.
2.  Select **"Sign Up"**.
3.  Create a User: 
    - Name: `Neo`
    - Phone: `101`
    - Photo: Upload any small image.
4.  **Verify:** You are logged in and see a sidebar.
5.  **Refresh the Page.**
6.  **Verify:** You remain logged in as `Neo` (Session persistence).

## 2. Multi-User & Real-Time Presence
### Test Steps:
1.  **Tab B (Incognito):** Open the app.
2.  Select **"Access as Agent-007 (Demo)"** (or sign up as `Trinity` / `102`).
3.  **Verify (In Tab B):** You see `Neo` in the "Global Feed" sidebar.
4.  **Verify (In Tab A):** You see `Agent-007` (or `Trinity`) appear in the sidebar immediately.

## 3. Real-Time Messaging Delay
### Test Steps:
1.  **Tab A:** Click on `Agent-007` (or User B) in the sidebar.
2.  Type "Wake up, Neo..." and press **Send**.
3.  **Verify (Tab B):** The text appears **instantly** (sub-1 second delay).
4.  **Tab B:** Reply "I'm awake."
5.  **Verify (Tab A):** The reply appears instantly.

## 4. Media Synchronization
### Test Steps:
1.  **Tab A:** Click the **Camera Icon** -> "Take Photo".
2.  Capture a photo and **Send**.
3.  **Verify (Tab B):** The image appears in the chat stream.
4.  Click the image in Tab B to ensure it opens in full view.

## 5. Offline/Refresh Sync
### Test Steps:
1.  **Close Tab B.**
2.  **Tab A:** Send a message "Are you still there?".
3.  **Re-open Tab B** (or open a new tab) and log in again as User B.
4.  **Verify:** The message "Are you still there?" retrieves from the database and is visible.

## 6. Error Handling (Negative Testing)
### Test Steps:
1.  Try to send an empty message (Send button should be disabled).
2.  Try to sign up with an empty phone number (Should show validation logic/no action).

---

## ✅ QA Sign-Off
If all steps pass, the application is **Database-Ready** and safe to publish!

| Feature | Status |
| :--- | :--- |
| Real-Time Auth | ⬜ Pass / ⬜ Fail |
| Global Sidebar Sync | ⬜ Pass / ⬜ Fail |
| Instant Messaging | ⬜ Pass / ⬜ Fail |
| Image Sync | ⬜ Pass / ⬜ Fail |
| History Persistence | ⬜ Pass / ⬜ Fail |
