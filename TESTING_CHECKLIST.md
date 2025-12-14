# 🧪 Zhatn App - Testing Checklist

## ✅ VERIFICATION STEPS

### 1. Authentication Flow
- [ ] Open http://localhost:5174
- [ ] See the Login page with "Zhatn." title
- [ ] Click "Sign Up" button
- [ ] See the circular profile photo upload area
- [ ] Click the upload area and select a photo
- [ ] Verify photo preview appears in circular frame
- [ ] Fill in Username (e.g., "John Doe")
- [ ] Fill in Phone Number (e.g., "+1234567890")
- [ ] Fill in Password (e.g., "password123")
- [ ] Click "Create Account" button
- [ ] Verify you're taken to the chat interface

### 2. Chat Interface
- [ ] See your profile avatar and name in the sidebar
- [ ] See 5 dummy contacts listed
- [ ] See "Alice Vane" selected by default
- [ ] See chat messages displayed
- [ ] Click on different contacts (Marcus, Sarah, etc.)
- [ ] Verify contact switches (name changes in header)

### 3. Text Messaging
- [ ] Type a message in the input field
- [ ] See the Send button turn RED when text is entered
- [ ] Click Send or press Enter
- [ ] Verify message appears in chat on the right side (red bubble)
- [ ] Verify timestamp is shown
- [ ] Send another message to test scrolling

### 4. Photo Capture (MAIN FEATURE)
- [ ] Click the **Camera icon** (left of paperclip)
- [ ] See dropdown menu appear on hover
- [ ] Click "Take Photo"
- [ ] **IMPORTANT:** Allow camera permissions when prompted
- [ ] See full-screen camera modal open
- [ ] See live video feed from your camera
- [ ] Click "Flip Camera" button (test front/back if on mobile)
- [ ] Click the white capture button
- [ ] Verify camera modal closes
- [ ] See photo preview above the input field
- [ ] (Optional) Type a caption
- [ ] Click Send button
- [ ] Verify photo appears in chat bubble
- [ ] Click on photo to open in new tab

### 5. Video Recording (MAIN FEATURE)
- [ ] Click the **Camera icon** again
- [ ] Click "Record Video"
- [ ] **IMPORTANT:** Allow camera AND microphone permissions
- [ ] See camera modal open
- [ ] Click the red record button
- [ ] See "Recording..." indicator with pulsing dot
- [ ] Speak something to test audio
- [ ] Click the button again to stop recording
- [ ] Verify camera modal closes
- [ ] See video preview above input field
- [ ] (Optional) Type a caption
- [ ] Click Send button
- [ ] Verify video appears in chat bubble
- [ ] Click play button on video to test playback

### 6. File Upload
- [ ] Click the **Paperclip icon**
- [ ] Select an image file from your computer
- [ ] Verify image preview appears above input
- [ ] Click the X button to remove it
- [ ] Click Paperclip again
- [ ] Select a video file
- [ ] Verify video preview appears
- [ ] Add a caption
- [ ] Click Send
- [ ] Verify video appears in chat

### 7. Media Preview & Removal
- [ ] Attach any media (photo/video)
- [ ] See preview above input field
- [ ] Click the **X button** on the preview
- [ ] Verify media is removed
- [ ] Verify Send button becomes gray/disabled

### 8. UI/UX Elements
- [ ] Hover over input field - see red glow border
- [ ] Hover over contacts - see hover effect
- [ ] Check online status indicators (green/red/gray dots)
- [ ] Test logout button (top right in sidebar)
- [ ] Verify you return to login screen

### 9. Responsive Design (Optional)
- [ ] Resize browser window to mobile size
- [ ] Verify sidebar hides on small screens
- [ ] Verify chat area takes full width
- [ ] Test on actual mobile device if available

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Camera Not Working?
**Issue:** "Camera not accessible" or black screen
**Solution:** 
- Make sure you clicked "Allow" on permission prompt
- Check browser settings: Settings → Privacy → Camera
- Try a different browser (Chrome recommended)
- Ensure no other app is using the camera

### Video Not Recording?
**Issue:** Recording doesn't start
**Solution:**
- Allow both camera AND microphone permissions
- Check microphone isn't muted
- Try Chrome/Edge (best support)

### Photo/Video Not Sending?
**Issue:** Media doesn't appear in chat
**Solution:**
- Check browser console for errors (F12)
- Ensure media was captured/selected properly
- Try a smaller file size

### Build Issues?
**Issue:** App won't start
**Solution:**
```bash
# Stop the server (Ctrl+C)
# Reinstall dependencies
npm install
# Restart
npm run dev
```

---

## 📊 TESTING RESULTS

After testing, fill this out:

| Feature | Working? | Notes |
|---------|----------|-------|
| Login/Signup | ⬜ Yes ⬜ No | |
| Profile Photo Upload | ⬜ Yes ⬜ No | |
| Text Messages | ⬜ Yes ⬜ No | |
| Photo Capture | ⬜ Yes ⬜ No | |
| Video Recording | ⬜ Yes ⬜ No | |
| File Upload | ⬜ Yes ⬜ No | |
| Media Preview | ⬜ Yes ⬜ No | |
| Camera Switching | ⬜ Yes ⬜ No | |
| UI/Animations | ⬜ Yes ⬜ No | |

---

## 🎯 VERIFICATION COMPLETE?

If all features work:
✅ **Your app is ready to deploy!**

If some features don't work:
- Note which ones in the table above
- Check the "Common Issues" section
- Test in a different browser
- Check browser console for errors (F12)

---

**Happy Testing! 🚀**
