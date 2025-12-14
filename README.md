# Zhatn - Cybernoir Chat App 🚀

**Built with React, Supabase, and TailwindCSS.**
*Live Deployment Triggered* 🔴

A stunning, feature-rich chat application with a **Cyber-Noir** aesthetic. Built with React, Tailwind CSS, and modern web technologies.

![Zhatn Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.18-38bdf8)

## ✨ Features

### 🔐 Authentication
- **Login & Sign Up** - Seamless authentication flow
- **1x1 Profile Picture** - Circular profile photo with live preview
- **User Details** - Username, phone number, and password management

### 💬 Chat Interface
- **Real-time Messaging** - Send and receive text messages
- **Contact List** - Beautiful sidebar with 5 dummy contacts
- **Online Status** - Live status indicators (online, offline, busy)
- **Message History** - Persistent chat history per contact

### 📸 Media Features
- **Live Camera Access** - Take photos directly from your camera
- **Video Recording** - Record and send video messages
- **Front/Back Camera** - Switch between cameras on mobile devices
- **Photo Upload** - Attach images from your device
- **Video Upload** - Share video files
- **Media Preview** - Preview images/videos before sending
- **In-Chat Media Display** - View images and play videos within chat bubbles

### 🎨 Design
- **Cyber-Noir Aesthetic** - Dark theme with crimson red accents
- **Glowing Effects** - Red glow on focus states
- **Smooth Animations** - Polished transitions and micro-interactions
- **Responsive Design** - Works on desktop and mobile
- **Premium UI** - High-contrast, sleek interface

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Zhatn
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Follow the prompts** - Vercel will automatically detect your Vite project

**Or use Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects settings
4. Click "Deploy"

### Deploy to Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build and deploy**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**Or use Netlify Dashboard:**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder
3. Or connect your GitHub repository

### Deploy to GitHub Pages

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Add to package.json scripts:**
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. **Update vite.config.js:**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/Zhatn/' // Replace with your repo name
})
```

4. **Deploy**
```bash
npm run deploy
```

## 🎯 Usage Guide

### Authentication
1. **Sign Up**: Click "Sign Up" → Upload profile photo → Enter details → Create Account
2. **Login**: Use demo credentials or your registered account

### Sending Messages
1. **Text**: Type in the input field and press Enter or click Send
2. **Photos**: Click Camera icon → "Take Photo" → Capture → Send
3. **Videos**: Click Camera icon → "Record Video" → Record → Stop → Send
4. **Attachments**: Click Paperclip icon → Select file → Send

### Camera Features
- **Flip Camera**: Switch between front/back cameras
- **Photo Mode**: Single tap to capture
- **Video Mode**: Tap to start recording, tap again to stop
- **Preview**: Review media before sending

## 🛠️ Tech Stack

- **React 19.2** - UI framework
- **Vite 7.2** - Build tool
- **Tailwind CSS 4.1** - Styling
- **Lucide React** - Icons
- **MediaDevices API** - Camera access
- **MediaRecorder API** - Video recording

## 📱 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (iOS 14.3+)
- ⚠️ Camera features require HTTPS in production

## 🔒 Permissions

The app requires the following permissions:
- **Camera** - For taking photos and recording videos
- **Microphone** - For video recording with audio

## 🎨 Color Palette

- **Deep Onyx**: `#0F0F0F` - Background
- **Matte Charcoal**: `#1E1E1E` - Cards/Panels
- **Gunmetal**: `#2A2A2A` - Input fields
- **Crimson Red**: `#D32F2F` - Primary accent
- **White**: `#F5F5F5` - Primary text
- **Gray**: `#A0A0A0` - Secondary text

## 📝 Future Enhancements

- [ ] Real backend integration
- [ ] WebRTC for live video calls
- [ ] End-to-end encryption
- [ ] Group chats
- [ ] Message reactions
- [ ] File sharing (documents, PDFs)
- [ ] Voice messages
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Push notifications

## 🐛 Known Issues

- Camera access requires HTTPS in production
- Video format may vary by browser (WebM/MP4)
- Mobile camera flip may not work on all devices

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Built with ❤️ by Mohamed Zuhail

---

**⭐ Star this repo if you found it helpful!**
