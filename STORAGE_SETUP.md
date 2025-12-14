# 📂 Supabase Storage Setup (Required for Images/Videos)

To stop the app from crashing with large videos, we need to turn on **Storage**.

### 1. Create the Bucket
1.  Go to your **[Supabase Dashboard](https://supabase.com/dashboard/project/_/storage/buckets)** -> **Storage**.
2.  Click **"New Bucket"**.
3.  Name it: `chat-media` (Must be exact).
4.  **Public Bucket:** ✅ CHECK THIS (Available to world).
5.  Click **Save**.

### 2. Allow Uploads (Security Policy)
By default, uploads are blocked. Let's open them for this app.

1.  Go to the **"Configuration"** tab (or "Policies") in Storage.
2.  Under `chat-media`, click **"New Policy"**.
3.  Choose **"For full customization"**.
4.  **Name:** `Allow All Uploads`
5.  **Allowed Operations:** Check `INSERT`, `SELECT`, `UPDATE`.
6.  **Target rules:** Write `true` in both boxes (for simplicity).
7.  Click **Review** -> **Save**.

---
**Once you do this, I will update the code to use this new system!**
