# 🚀 How to Publish Zhatn

Your app is built and ready! Choose one of the methods below to publish it.

## Option A: Deploy to Netlify (Recommended - Drag & Drop)
This is the easiest method. No Git required.

1.  **Build your project** (I already ran this for you!)
    - Ensure the `dist` folder exists in your project.
2.  Go to [Netlify Drop](https://app.netlify.com/drop).
3.  **Drag and drop** the `dist` folder into the browser window.
4.  **Important:** Once deployed, go to **Site Settings** > **Environment Variables**.
5.  Add your Supabase keys (copy them from your `.env` file):
    - Key: `VITE_SUPABASE_URL`
    - Value: `https://tncnrvzblghynimxuqyl.supabase.co`
    - Key: `VITE_SUPABASE_ANON_KEY`
    - Value: `(Your long key starting with eyJ...)`

## Option B: Deploy to Vercel (Best for Updates)
Requires a GitHub account.

1.  **Create a GitHub Repository** and push your code.
2.  Go to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
3.  Import your Zhatn repository.
4.  **Environment Variables:**
    - Expand the "Environment Variables" section.
    - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5.  Click **Deploy**.

## 🛑 Critical Note
Since this is a Single Page App (SPA), I have already created `vercel.json` and `netlify.toml` configuration files to ensure routing works correctly (so refreshing the page doesn't give a 404 error).
