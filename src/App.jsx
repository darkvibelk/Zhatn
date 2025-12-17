import React, { useState, useEffect, useRef } from 'react';
import { User, Phone as PhoneIcon, Video, MoreVertical, Send, Paperclip, Mic, Search, LogOut, ArrowLeft, X, Check, CheckCheck, Clock, Plus, Image as ImageIcon, Trash2, Eraser, BadgeCheck, CheckSquare, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility: Tailwind Class Merge ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Supabase Client ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CONSTANTS ---
const COUNTRIES = [
  { code: 'US', dial: '+1', flag: '🇺🇸', len: 10 },
  { code: 'GB', dial: '+44', flag: '🇬🇧', len: 10 },
  { code: 'LK', dial: '+94', flag: '🇱🇰', len: 9 },
  { code: 'IN', dial: '+91', flag: '🇮🇳', len: 10 },
  { code: 'AE', dial: '+971', flag: '🇦🇪', len: 9 },
  { code: 'AU', dial: '+61', flag: '🇦🇺', len: 9 },
  { code: 'CA', dial: '+1', flag: '🇨🇦', len: 10 },
];

// --- INFO CONTENTS (TERMS, PRIVACY, HELP) ---
const INFO_CONTENTS = {
  terms: {
    title: "Terms of Service",
    content: `
      <p class="mb-4"><strong>Welcome to Zhatn!</strong> By using our app, you agree to these terms.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Responsible Use:</strong> Do not use Zhatn for illegal activities, harassment, or spam.</li>
        <li><strong>Account Security:</strong> You are responsible for keeping your PIN and account secure. We cannot recover lost PINs without your Username.</li>
        <li><strong>Prototype Status:</strong> Zhatn is currently in V1.1 Beta. We are constantly improving security and features.</li>
      </ul>
      <p>Violation of these terms may result in account termination.</p>
    `
  },
  privacy: {
    title: "Privacy Policy",
    content: `
      <p class="mb-4"><strong>Zhatn! - Future of Privacy</strong></p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Data Minimization:</strong> We only store your Phone Number, Username, and Avatar.</li>
        <li><strong>Message Privacy:</strong> Messages are stored securely. We do not sell your personal data to third parties.</li>
        <li><strong>Right to Erasure:</strong> You can delete your account and all associated data at any time from the Settings menu.</li>
      </ul>
      <p>Your privacy is our top priority.</p>
    `
  },
  help: {
    title: "How to Use Zhatn",
    content: `
      <p class="mb-4"><strong>Simple, Fast, Secure.</strong></p>
      <div class="space-y-4">
        <div>
          <h4 class="font-bold text-red-400">1. Getting Started</h4>
          <p>Select your <strong>Country Code</strong> and enter your mobile number. No password required, just a secure OTP.</p>
        </div>
        <div>
          <h4 class="font-bold text-red-400">2. Chatting</h4>
          <p>Tap the <strong>(+)</strong> button to start a chat. You can enter <strong>any 9-digit valid mobile number</strong> directly to message them instantly.</p>
        </div>
        <div>
          <h4 class="font-bold text-red-400">3. Security</h4>
          <p>Set a <strong>4-digit PIN</strong> to lock your app. If you forget it, you'll need your verified Username to reset it.</p>
        </div>
      </div>
    `
  }
};

// --- IMAGE COMPRESSION UTILITY ---
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
    };
  });
};
const isAdmin = (phone) => phone && ADMIN_NUMBERS.some(adminNum => phone.includes(adminNum));

// BADGE RENDERER
// BADGE RENDERER V2
const renderBadge = (user) => {
  if (!user) return null;

  // 1. Determine Tick Color
  let tick = user.tick_color;
  // Fallback for hardcoded admins if DB is empty
  if ((!tick || tick === 'none') && isAdmin(user.phone)) tick = 'red';

  // 2. Determine Role Badge
  let badge = user.role_badge;
  if ((!badge || badge === 'none') && isAdmin(user.phone)) badge = 'admin';

  return (
    <div className="flex items-center gap-1">
      {/* RENDER TICK */}
      {tick === 'red' && <BadgeCheck className="w-3.5 h-3.5 text-red-500 fill-red-500/10" />}
      {tick === 'blue' && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />}
      {tick === 'yellow' && <BadgeCheck className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/10" />}
      {tick === 'gray' && <BadgeCheck className="w-3.5 h-3.5 text-gray-400 fill-gray-500/10" />}
      {tick === 'purple' && <BadgeCheck className="w-3.5 h-3.5 text-purple-500 fill-purple-500/10" />}

      {/* RENDER BADGE LOGO */}
      {badge === 'admin' && (
        <img src="/zhatn-badge.png" className="w-5 h-5 shadow-sm" alt="Admin" title="Zhatn Admin" />
      )}
      {badge === 'developer' && (
        <img src="/zhatn-badge.png" className="w-5 h-5 shadow-sm" alt="Developer" title="Zhatn Developer" />
      )}
      {badge === 'contributor' && (
        <div className="bg-purple-600/20 border border-purple-500/50 rounded-full w-4 h-4 flex items-center justify-center">
          <img src="/logo.png" className="w-2.5 h-2.5" alt="Contributor" />
        </div>
      )}
    </div>
  );
};

// --- REUSABLE INFO MODAL ---
const InfoModal = ({ title, content, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in p-6">
    <div className="glass-card w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[80vh] flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-2 h-8 bg-red-600 rounded-full inline-block"></span>
        {title}
      </h3>

      <div className="text-gray-300 text-sm leading-relaxed overflow-y-auto pr-2 custom-scrollbar" dangerouslySetInnerHTML={{ __html: content }} />

      <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl font-bold mt-8">
        Understood
      </button>
    </div>
  </div>
);

// ZHATN V2 - Main Application
function App() {
  const [activeInfoModal, setActiveInfoModal] = useState(null); // 'terms', 'privacy', 'help' or null

  // Global State
  const [user, setUser] = useState(null); // Authenticated User
  const [view, setView] = useState('auth'); // 'auth' | 'app'
  const [appState, setAppState] = useState('chat'); // 'chat' | 'calls' | 'status'

  // Auth State
  const [authStage, setAuthStage] = useState('welcome'); // 'welcome' | 'phone' | 'otp' | 'pin_setup' | 'pin_entry' | 'profile'
  const [country, setCountry] = useState(COUNTRIES[2]); // Default LK
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState(null); // Dynamic OTP
  const [pin, setPin] = useState(['', '', '', '']); // Security PIN
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [verificationUsername, setVerificationUsername] = useState(''); // New: For PIN Reset Security
  const [profileName, setProfileName] = useState('');

  // Notification System
  const [notification, setNotification] = useState(null); // { type, message, title }

  const showNotification = (title, message, type = 'info') => {
    setNotification({ title, message, type });
    if (type !== 'otp') {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  /* Profile Editing State */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);

  // Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Chat State
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCalling, setIsCalling] = useState(false); // Simulated Call UI

  // Media State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Data State
  const [contacts, setContacts] = useState([]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- 0. PERSISTENCE & INIT ---
  const [gender, setGender] = useState(null); // 'male' or 'female'
  const [userAvatar, setUserAvatar] = useState(null); // Preview URL or File Data
  const avatarInputRef = useRef(null);

  // --- 5. LONG PRESS LOGIC (Delete) ---
  const [contextMenuContact, setContextMenuContact] = useState(null);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false); // Track if we just triggered options

  const startPress = (contact) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true; // Mark that we triggered it
      setContextMenuContact(contact.phone);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const cancelPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    if (!contextMenuContact) return;

    const closeMenu = () => setContextMenuContact(null);

    // Delay wrapping to ensure we don't catch the immediate 'click' from the release
    const timer = setTimeout(() => {
      window.addEventListener('click', closeMenu);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', closeMenu);
    };
  }, [contextMenuContact]);

  useEffect(() => {
    // Check Local Storage on Load
    const savedUser = localStorage.getItem('zhatn_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.phone) {
          setUser(parsedUser);
          setView('app');
          fetchMyChats(parsedUser);
          updateOnlineStatus(parsedUser.phone, true);
        } else {
          // Invalid data found, clear it
          localStorage.removeItem('zhatn_user');
        }
      } catch (e) {
        console.error("Auth Restore Error", e);
        localStorage.removeItem('zhatn_user');
      }
    }
  }, []); // Run ONCE on mount

  // --- 0.5 CLEANUP ---
  useEffect(() => {
    const handleUnload = () => {
      // Note: We can't access 'user' reliably here if it's stale, but we try.
      // Better approach for real apps is 'navigator.sendBeacon' or presence/heartbeat.
      const savedUser = localStorage.getItem('zhatn_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        updateOnlineStatus(u.phone, false);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);





  // --- HEARTBEAT & AUTO-LOCK ---
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!user) return;

    // 1. Activity Listener
    const handleActivity = () => {
      lastActivity.current = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // 2. Heartbeat (Every 30s) - Keep "Online" status fresh if active
    const heartbeatInterval = setInterval(() => {
      const now = Date.now();
      // Only send heartbeat if active recently (e.g., last 1 min)
      if (now - lastActivity.current < 60000) {
        updateOnlineStatus(user.phone, true);
      }
    }, 30000);

    // 3. Auto-Lock / Idle Check (Every 10s)
    const idleCheckInterval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity.current;

      // AUTO-LOCK after 2 Minutes (120,000 ms)
      if (inactiveTime > 120000 && view === 'app') {
        // Lock the App
        updateOnlineStatus(user.phone, false); // Mark offline
        setView('auth');
        setAuthStage('pin_entry');
        setPhoneNumber(user.phone.replace(country.dial, '')); // Pre-fill phone for easier re-login
        showNotification("Security", "Session locked due to inactivity.", "error");
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(heartbeatInterval);
      clearInterval(idleCheckInterval);
    };
  }, [user, view]); // Re-run if user logs in/out or view changes

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
    if (cleanNumber.length !== country.len) {
      showNotification("Invalid Number", `Please enter a valid ${country.len}-digit mobile number.`, 'error');
      return;
    }
    setPhoneNumber(cleanNumber);

    // Generate Random 4-digit Code
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomCode);

    // Show "Simulated SMS" Notification
    showNotification("MESSAGES • Now", `Zhatn! verification code: ${randomCode}`, 'otp');
    setAuthStage('otp');
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp === generatedOtp) {
      setNotification(null); // Clear OTP notification
      if (isResettingPin) {
        setAuthStage('pin_setup');
        setIsResettingPin(false);
      } else {
        checkUserExists();
      }
    } else {
      showNotification("Error", "Invalid verification code. Please try again.", 'error');
      setOtp(['', '', '', '']);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    const enteredPin = pin.join('');

    if (authStage === 'pin_setup') {
      // Setting up new PIN
      const fullPhone = `${country.dial}${phoneNumber}`;
      // Ideally update this during registration, but we can hold it in state and send with profile
      setAuthStage('profile');
    } else if (authStage === 'pin_entry') {
      // Verifying existing PIN
      const fullPhone = `${country.dial}${phoneNumber}`;
      const { data } = await supabase.from('profiles').select('secret_pin').eq('phone', fullPhone).single();

      if (data && data.secret_pin === enteredPin) {
        // Re-fetch full user data to login
        const { data: userData } = await supabase.from('profiles').select('*').eq('phone', fullPhone).single();
        loginUser(userData);
      } else {
        showNotification("Access Denied", "Incorrect Security PIN.", 'error');
        setPin(['', '', '', '']);
      }
    }
  };

  // --- SECURE PIN RESET LOGIC ---
  const handleVerifyUsername = async (e) => {
    e.preventDefault();
    if (!verificationUsername.trim()) {
      showNotification("Required", "Please enter your username.", 'error');
      return;
    }

    const fullPhone = `${country.dial}${phoneNumber}`;

    // 1. Verify Name matches Phone
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('phone', fullPhone)
        .single();

      if (error || !data) {
        showNotification("Error", "User not found.", 'error');
        return;
      }

      // Case-insensitive check
      if (data.username.toLowerCase().trim() === verificationUsername.toLowerCase().trim()) {
        // Success! Send OTP
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(randomCode);
        setIsResettingPin(true);
        setAuthStage('otp');
        showNotification("Security Verified", `Reset code: ${randomCode}`, 'otp');
        setVerificationUsername(''); // Clear security field
      } else {
        showNotification("Access Denied", "Username does not match our records.", 'error');
      }
    } catch (err) {
      console.error("Verification Error:", err);
      showNotification("Error", "Verification failed.", 'error');
    }
  };

  const checkUserExists = async () => {
    const fullPhone = `${country.dial}${phoneNumber}`;
    const { data } = await supabase.from('profiles').select('*').eq('phone', fullPhone).single();
    if (data) {
      // User exists, ask for PIN
      if (data.secret_pin) {
        setAuthStage('pin_entry');
      } else {
        // Legacy user without PIN -> Force setup or login directly? 
        // For security, let's treat them as needing setup, but that might fail login.
        // Let's assume schema update ran and they have default '1234' or NULL.
        // If NULL, we must force setup or default.
        // DECISION: If no PIN set, go to PIN Setup to secure the account.
        setAuthStage('pin_setup');
      }
    } else {
      setAuthStage('pin_setup'); // New users set PIN first
    }
  };




  // --- AUTOMATED WELCOME MESSAGES ---
  const sendWelcomeMessages = async (receiverPhone) => {
    const timestamp = new Date().toISOString();

    // 1. Ensure Sender Profiles Exist (Idempotent-ish)
    // We assume these 'Special' profiles are created/ensured by the login logic of the developer 
    // or we can just send the message. Supabase foreign keys might fail if sender doesn't exist?
    // For prototype, we assume we can insert messages even if sender_id not in profiles if constraint isn't strict,
    // OR we just assume they exist. To be safe, let's just insert the messages.

    const messages = [
      {
        sender_id: '123456789', // Zhatn!
        sender_name: 'Zhatn!',
        receiver_id: receiverPhone,
        content: "Welcome to 🔴 Zhatn! 🙌 Thank you for joining. Your feedback helps us improve every day. \n\nv1.1",
        type: 'text',
        read_status: false,
        created_at: timestamp
      },
      {
        sender_id: '987654321', // Dark Vibe
        sender_name: 'Dark Vibe',
        receiver_id: receiverPhone,
        content: "Do you who develop this!\nSimply *3idiots#\nhttps://darkvibelk.pages.dev/",
        type: 'text',
        read_status: false,
        created_at: new Date(Date.now() + 1000).toISOString() // +1 second
      }
    ];

    // Use supabase directly, don't await to block UI
    const { error } = await supabase.from('messages').insert(messages);
    if (error) console.error("Welcome Msg Error:", error);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!profileName || !gender) {
      alert("Please enter a name and select a gender.");
      return;
    }

    const fullPhone = `${country.dial}${phoneNumber}`;

    // Determine Avatar
    let finalAvatar = userAvatar;

    if (!finalAvatar) {
      // If no photo uploaded, use default based on gender
      if (gender === 'male') finalAvatar = 'https://cdn-icons-png.flaticon.com/512/3233/3233508.png'; // Sample Male Icon
      if (gender === 'female') finalAvatar = 'https://cdn-icons-png.flaticon.com/512/3233/3233515.png'; // Sample Female Icon
    }

    const newUser = {
      username: profileName,
      phone: fullPhone,
      gender: gender,
      avatar_url: finalAvatar,
      status: 'online',
      is_online: true,
      secret_pin: pin.join('')
    };

    // Use upsert to handle potential race conditions or re-registrations
    const { data, error } = await supabase
      .from('profiles')
      .upsert([newUser], { onConflict: 'phone' })
      .select()
      .single();

    if (error) {
      // Ignore "duplicate key" error effectively by trying login if upsert failed weirdly, 
      // but upsert should handle it. If real error, show it.
      console.error("Registration Error:", error);
      alert("Error registering: " + error.message);
    } else {
      // Send Welcome Messages (Async)
      sendWelcomeMessages(newUser.phone);

      // Use returned data to ensure we have the DB version (though newUser is fine)
      loginUser(data || newUser);
    }
  };

  const loginUser = async (userData) => {
    // Session Management: Generate unique ID for this device login
    const sessionId = Date.now().toString() + Math.random().toString(36).substring(2);

    // Update DB with new session (AND enforce special profiles if needed)
    const updates = {
      session_id: sessionId,
      is_online: true,
      last_seen: new Date().toISOString()
    };

    // SPECIAL ACCOUNTS: Enforce specific identities
    if (userData.phone === '123456789') {
      updates.username = 'Zhatn';
      updates.avatar_url = '/zhatn-logo.png';
      userData.username = 'Zhatn';
      userData.avatar_url = '/zhatn-logo.png';
    }
    if (userData.phone === '987654321') {
      updates.username = 'Dark Vibe';
      updates.avatar_url = '/darkvibe-logo.jpg';
      userData.username = 'Dark Vibe';
      userData.avatar_url = '/darkvibe-logo.jpg';
    }

    await supabase.from('profiles').update(updates).eq('phone', userData.phone);

    const userWithSession = { ...userData, session_id: sessionId };

    setUser(userWithSession);
    localStorage.setItem('zhatn_user', JSON.stringify(userWithSession)); // Persist
    setView('app');
    fetchMyChats(userWithSession);
  };

  // --- ONLINE STATUS UPDATER ---
  const updateOnlineStatus = async (phone, isOnline) => {
    // We only update if we have a valid phone
    if (!phone) return;

    try {
      await supabase.from('profiles').update({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      }).eq('phone', phone);
    } catch (err) {
      console.error("Status Update Failed:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showNotification("Error", "Name cannot be empty.", 'error');
      return;
    }

    try {
      // 1. Update in Supabase
      const updates = {
        username: editName,
        avatar_url: editAvatar
      };

      const { error } = await supabase.from('profiles').update(updates).eq('phone', user.phone);

      if (error) throw error;

      // 2. Update Local State
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('zhatn_user', JSON.stringify(updatedUser)); // Persist

      // 3. Close & Notify
      setIsEditingProfile(false);
      showNotification("Success", "Profile updated successfully.", 'success');

    } catch (err) {
      console.error("Update Error:", err);
      showNotification("Error", "Failed to update profile.", 'error');
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      if (user) updateOnlineStatus(user.phone, false);
      localStorage.removeItem('zhatn_user');
      setUser(null);
      setView('auth');
      setAuthStage('phone');
      setPhoneNumber('');
      setOtp(['', '', '', '']);
      setPin(['', '', '', '']);
      setActiveChat(null);
    }
  };

  // --- 2. DATA LAYER ---

  const [myChats, setMyChats] = useState([]); // Users with chat history

  // 1. Fetch people I've actually talked to
  const fetchMyChats = async (currentUser) => {
    const myPhone = currentUser?.phone || user?.phone;
    if (!myPhone) return;

    // Get all messages involving me
    const { data: msgs } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${myPhone},receiver_id.eq.${myPhone}`)
      .order('created_at', { ascending: false });

    if (msgs) {
      // Extract unique IDs that are NOT me
      const uniqueIds = new Set();
      msgs.forEach(m => {
        if (m.sender_id !== myPhone) uniqueIds.add(m.sender_id);
        if (m.receiver_id !== myPhone) uniqueIds.add(m.receiver_id);
      });

      if (uniqueIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*, tick_color, role_badge')
          .in('phone', Array.from(uniqueIds));

        // PINNED CHATS: Robust Fetch using LIKE/OR logic (Contains check)
        const { data: admins } = await supabase
          .from('profiles')
          .select('*, tick_color, role_badge')
          .or(`phone.ilike.%${ADMIN_NUMBERS[0]}%,phone.ilike.%${ADMIN_NUMBERS[1]}%`);

        let finalContacts = profiles || [];

        if (admins) {
          // Filter out admins from history to avoid duplicates (using loose check)
          finalContacts = finalContacts.filter(p => !admins.some(a => a.phone === p.phone));
          // Prepend admins
          finalContacts = [...admins, ...finalContacts];
        }

        setMyChats(finalContacts);
        setContacts(finalContacts);
      }
    } else {
      // Even if no history, show Admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('*, tick_color, role_badge')
        .or(`phone.ilike.%${ADMIN_NUMBERS[0]}%,phone.ilike.%${ADMIN_NUMBERS[1]}%`);

      if (admins) {
        setMyChats(admins);
        setContacts(admins);
      } else {
        setMyChats([]);
        setContacts([]);
      }
    }
  }



  // --- BROADCAST LOGIC ---
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    // Check Permission (Hardcoded OR badge_type)
    const hasPermission = isAdmin(user.phone) || user.badge_type === 'admin';
    if (!hasPermission) {
      alert("Unauthorized");
      return;
    }

    if (!confirm("⚠️ SEND TO ALL USERS?\nThis will message every registered user.")) return;

    try {
      const { data: allUsers } = await supabase.from('profiles').select('phone').neq('phone', user.phone);

      if (allUsers && allUsers.length > 0) {
        const timestamp = new Date().toISOString();
        const msgs = allUsers.map(u => ({
          sender_id: user.phone,
          sender_name: user.username,
          receiver_id: u.phone,
          content: broadcastMessage,
          type: 'text',
          read_status: false,
          created_at: timestamp
        }));

        // Batch insert
        const { error } = await supabase.from('messages').insert(msgs);
        if (error) throw error;

        alert(`✅ Broadcast sent to ${allUsers.length} users.`);
        setBroadcastMessage("");
        setIsBroadcasting(false);
      }
    } catch (err) {
      console.error("Broadcast Error:", err);
      alert("Failed to broadcast.");
    }
  };

  // 2. Search for new people globally
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setContacts(myChats); // Restore chat list
      return;
    }

    // PRIVACY: If searching by number, require at least 9 digits to query the GLOBAL database.
    // This prevents "fishing" for random users by typing short prefixes (e.g. "77").
    // Existing chats (myChats) will still be filtered by the UI, so you can find YOUR friends with short numbers.
    const cleanTerm = term.replace(/\D/g, '');
    const isNumericSearch = /^\d+$/.test(cleanTerm) && cleanTerm.length > 0;

    if (isNumericSearch && cleanTerm.length < 9) {
      setContacts(myChats); // Only match against local history
      return;
    }

    // Search by Phone (or Username)
    const { data } = await supabase
      .from('profiles')
      .select('*, tick_color, role_badge')
      .neq('phone', user.phone) // Don't find self
      .ilike('phone', `%${term}%`)
      .limit(5);

    if (data) setContacts(data);
  };

  // --- REALTIME SUBSCRIPTIONS ---

  // 1. Global Subscription (Sidebar & Status)
  useEffect(() => {
    if (!user) return;

    // Listen for ANY new message involving me (to refresh sidebar)
    const globalMsgChannel = supabase.channel('global_chat_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new;
        // If I am the receiver or sender, refresh my chat list
        if (m.receiver_id === user.phone || m.sender_id === user.phone) {
          fetchMyChats(user);
        }
      })
      .subscribe();

    // Listen for Status Updates & Force Logout
    const statusChannel = supabase.channel('global_presence')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {

        // 1. Force Logout Logic
        if (payload.new.phone === user.phone) {
          // If the session ID on the server changed, and it doesn't match MY local session ID...
          if (payload.new.session_id && payload.new.session_id !== user.session_id) {
            alert("⚠️ Security Alert\n\nYou have been signed out because your account was accessed from another device.");
            localStorage.removeItem('zhatn_user');
            window.location.reload(); // Force hard reset
            return;
          }
        }

        // 2. Normal Contact Updates
        setContacts(prev => prev.map(c => c.phone === payload.new.phone ? payload.new : c));
        setMyChats(prev => prev.map(c => c.phone === payload.new.phone ? payload.new : c));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalMsgChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [user]);

  // 2. Active Chat Subscription (Messages View)
  useEffect(() => {
    if (!user || !activeChat) return;

    const myId = user.phone;
    const theirId = activeChat.phone;

    // Load History & Mark as Read
    const fetchMsgs = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${myId},receiver_id.eq.${theirId}),and(sender_id.eq.${theirId},receiver_id.eq.${myId})`)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        // Mark incoming unread messages as read
        const unreadIds = data.filter(m => m.receiver_id === myId && !m.read_status).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ read_status: true }).in('id', unreadIds);
        }
      }
    };
    fetchMsgs();

    // Listen for messages in THIS conversation
    const chatChannel = supabase.channel(`chat:${theirId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const m = payload.new;
        if ((m.sender_id === myId && m.receiver_id === theirId) || (m.sender_id === theirId && m.receiver_id === myId)) {
          // Prevent duplicates (in case we added it optimistically or received double event)
          setMessages(prev => {
            if (prev.some(existing => existing.id === m.id)) return prev;
            return [...prev, m];
          });

          // Mark as Read if I'm the receiver
          if (m.receiver_id === myId) {
            await supabase.from('messages').update({ read_status: true }).eq('id', m.id);
          }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        // Listen for "READ" status updates
        setMessages(prev => prev.map(msg => msg.id === payload.new.id ? payload.new : msg));
      })
      .subscribe();

    return () => supabase.removeChannel(chatChannel);
  }, [activeChat, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. ACTIONS (Text, Image, Voice) ---

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    await dispatchMessage('text', inputText);
    setInputText('');
  };

  const dispatchMessage = async (type, content) => {
    try {
      const msg = {
        content: content,
        sender_id: user.phone,
        sender_name: user.username || 'Unknown',
        receiver_id: activeChat.phone,
        type: type,
        read_status: false, // Re-enabled: User should have run the SQL schema update by now
        created_at: new Date().toISOString()
      };

      // Insert and SELECT the row to get the generated ID
      const { data, error } = await supabase.from('messages').insert([msg]).select().single();

      if (error) {
        console.error("Message Send Error:", error);
        alert("Error sending message: " + error.message);
        return;
      }

      if (data) {
        // Immediate UI Update (avoid waiting for Realtime round-trip)
        setMessages(prev => {
          if (prev.some(existing => existing.id === data.id)) return prev;
          return [...prev, data];
        });

        // If this was a new contact (searched), force sidebar refresh so they appear in history
        if (!myChats.some(c => c.phone === activeChat.phone)) {
          fetchMyChats(user);
        }
      }
    } catch (err) {
      console.error("Dispatch Error:", err);
      alert("Something went wrong sending the message.");
    }
  };

  // -- Image Handling (Base64 for prototype) --
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Helper: Send Message
    const sendImg = (content) => {
      dispatchMessage('image', content);
    };

    if (file.type.startsWith('image/')) {
      // Auto-Compress to 1024px (Chat size), 70% Quality
      const compressed = await compressImage(file, 1024, 0.7);
      sendImg(compressed);
    } else {
      // Video/File (No compression for now)
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatchMessage(file.type.startsWith('video/') ? 'video' : 'file', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // -- Avatar Selection & Validation --
  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Error", "Image too large (Max 5MB)", 'error');
        return;
      }

      // Auto-Compress to 300px (Avatar size), 70% Quality
      const compressed = await compressImage(file, 300, 0.7);
      setUserAvatar(compressed);
      // Note: Data URL string is set. Ensure handleRegistration handles string or converts to blob.
    }
  };


  // -- Voice Handling --
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            dispatchMessage('audio', reader.result); // Base64 Audio
          };
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied. Please allow microphone access to send voice messages.");
      }
    }
  };

  // --- 4. CHAT MANAGEMENT (Delete/Clear) ---

  const deleteConversation = async (targetPhone) => {
    const myId = user.phone;
    // Delete ALL messages between these two users
    const { error } = await supabase
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${targetPhone}),and(sender_id.eq.${targetPhone},receiver_id.eq.${myId})`);

    if (error) {
      alert("Error deleting chat: " + error.message);
    } else {
      return true;
    }
  };

  const handleDeleteChat = async (e, contact) => {
    e.stopPropagation(); // Prevent opening the chat
    if (confirm(`Delete chat with ${contact.username}? Use this to remove them from your list.`)) {
      const success = await deleteConversation(contact.phone);
      if (success) {
        setMessages([]); // Clear local view if active
        if (activeChat?.phone === contact.phone) setActiveChat(null);

        // CRITICAL: Update BOTH lists to prevent "ghost" items or UI desync
        setMyChats(prev => prev.filter(c => c.phone !== contact.phone));
        setContacts(prev => prev.filter(c => c.phone !== contact.phone));
      }
    }
  };

  const handleClearChat = async () => {
    if (!activeChat) return;
    if (confirm(`Clear all messages with ${activeChat.username}? The chat will stay open.`)) {
      const success = await deleteConversation(activeChat.phone);
      if (success) {
        setMessages([]); // Clears the view, but keeps activeChat set
        // Note: If you refresh context now, they might disappear from sidebar until you send a new message.
        // To fix this "permanently", we'd need a 'conversations' table.
        // For now, this mimics "Clear" by emptying the view.
      }
    }
  };

  // --- UI HELPERS ---
  // Safety check: Ensure contacts is always an array to prevent "map of undefined" crashes
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  const filteredContacts = safeContacts.filter(c =>
    (c.username || c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  // Get latest status of active chat user
  const currentChatUser = activeChat ? (contacts.find(c => c.phone === activeChat.phone) || activeChat) : null;
  const [showMenu, setShowMenu] = useState(false); // For 3-dot menu

  // --- RENDER ---
  if (view === 'auth') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto overflow-x-hidden">
        {/* NOTIFICATION BANNER */}
        {notification && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in slide-in-from-top-2">
            <div className={cn(
              "glass-card p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl",
              notification.type === 'error' ? "border-red-500/50 bg-red-950/80" : "border-white/10 bg-[#111]/90"
            )}>
              <div className={cn("p-2 rounded-full", notification.type === 'error' ? "bg-red-500/20" : "bg-white/5")}>
                {notification.type === 'error' ? <X className="w-5 h-5 text-red-500" /> : <div className="w-5 h-5 text-white flex items-center justify-center font-bold">💬</div>}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{notification.title}</h4>
                <p className="text-sm font-medium text-white">{notification.message}</p>
              </div>
              {notification.type === 'otp' && (
                <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
              )}
            </div>
          </div>
        )}
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-900/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="glass-card w-full max-w-md p-8 rounded-3xl animate-liquid-in relative z-10">
          <div className="text-center mb-10">
            <img src="/zhatn-logo.png" className="w-24 h-24 mx-auto mb-4 rounded-3xl shadow-xl hover:scale-105 transition-transform duration-500" alt="Zhatn Logo" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700 mb-2 drop-shadow-sm">Zhatn!</h1>
          </div>

          {authStage === 'welcome' && (
            <div className="text-center space-y-6 animate-in fade-in duration-500">

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-wide">Welcome to Zhatn!</h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The future of secure, private messaging.
                </p>
                <div className="flex justify-center gap-4 text-xs text-gray-500 py-2">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-red-500" /> Private</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-red-500" /> Secure</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-red-500" /> Fast</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setAuthStage('phone')}
                  className="btn-liquid w-full py-4 rounded-xl text-lg shadow-lg shadow-red-900/40 group"
                >
                  Agree & Continue
                </button>
                <p className="text-[10px] text-gray-600 mt-4">
                  By tapping "Agree & Continue", you accept the <button onClick={() => setActiveInfoModal('terms')} className="text-red-400 hover:underline hover:text-red-300 transition-colors">Terms of Service</button> and <button onClick={() => setActiveInfoModal('privacy')} className="text-red-400 hover:underline hover:text-red-300 transition-colors">Privacy Policy</button>.
                  <br />
                  <button onClick={() => setActiveInfoModal('help')} className="text-gray-500 mt-2 hover:text-gray-300 flex items-center justify-center gap-1 mx-auto w-fit border-b border-transparent hover:border-gray-500 transition-all">
                    How does it work?
                  </button>
                </p>
              </div>
            </div>
          )}

          {authStage === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-2">Country Code</label>
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <select
                    className="input-pill px-3 appearance-none cursor-pointer text-white bg-[#333] w-full"
                    value={country.code}
                    onChange={(e) => setCountry(COUNTRIES.find(c => c.code === e.target.value))}
                  >
                    {COUNTRIES.map(c => <option key={c.code} value={c.code} className="text-black">{c.flag} {c.dial}</option>)}
                  </select>
                  <input
                    type="tel"
                    className="input-pill font-mono text-lg tracking-wide text-white w-full"
                    placeholder="Mobile Number"
                    maxLength={country.len}
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= country.len) setPhoneNumber(val);
                    }}
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-gray-500 ml-2">Don't enter leading "0". Required: {country.len} digits.</p>
              </div>
              <button type="submit" className="btn-liquid w-full py-4 rounded-xl text-lg shadow-lg shadow-red-900/40">Send Code</button>
            </form>
          )}

          {authStage === 'verification_username' && (
            <form onSubmit={handleVerifyUsername} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <User className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Security Check</h2>
                <p className="text-gray-400 text-sm">
                  To reset your PIN, please enter your <b>Username</b> (e.g. {activeChat?.username || "Dark Vibe"}).
                </p>
              </div>

              <input
                type="text"
                className="input-pill text-center text-lg tracking-wide w-full"
                placeholder="Ex: Dark Vibe"
                value={verificationUsername}
                onChange={(e) => setVerificationUsername(e.target.value)}
                autoFocus
              />

              <button type="submit" className="btn-primary w-full py-3 rounded-xl font-bold">
                Verify Identity
              </button>

              <button
                type="button"
                onClick={() => setAuthStage('pin_entry')}
                className="w-full text-sm text-gray-500 hover:text-white transition-colors"
                style={{ marginBottom: '1rem' }}
              >
                Cancel
              </button>

              <div className="border-t border-white/10 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => window.open(`https://wa.me/${ADMIN_NUMBERS[0]}?text=I%20have%20trouble%20resetting%20my%20PIN.%20My%20phone%20number%20is%20${phoneNumber}`, '_blank')}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all border border-green-500/20"
                >
                  <MessageCircle className="w-4 h-4" /> Contact Support via WhatsApp
                </button>
              </div>
            </form>
          )}

          {authStage === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Verification</h2>
                <p className="text-gray-400 text-sm">
                  Enter the dynamic verification code sent to your device notification.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 rounded-xl bg-white/5 border border-white/10 text-center text-2xl font-bold focus:border-red-500 focus:bg-red-500/10 focus:outline-none transition-all placeholder-gray-700"
                    placeholder="•"
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (!val && !digit) return; // Allow backspace

                      const newOtp = [...otp];
                      newOtp[i] = val.substring(val.length - 1);
                      setOtp(newOtp);

                      if (val && i < 3) document.getElementById(`otp-${i + 1}`).focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) {
                        document.getElementById(`otp-${i - 1}`).focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                Verify Code <Check className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setAuthStage('phone')}
                className="w-full text-sm text-gray-500 hover:text-white transition-colors"
              >
                Change Number
              </button>
            </form>
          )}

          {(authStage === 'pin_setup' || authStage === 'pin_entry') && (
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <div className="w-8 h-8 text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {authStage === 'pin_setup' ? 'Create Security PIN' : 'Enter Security PIN'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {authStage === 'pin_setup'
                    ? 'Set a 4-digit PIN to secure your account.'
                    : 'Enter your 4-digit PIN to access your chats.'}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="password"
                    maxLength={1}
                    className="w-12 h-14 rounded-xl bg-white/5 border border-white/10 text-center text-2xl font-bold focus:border-red-500 focus:bg-red-500/10 focus:outline-none transition-all placeholder-gray-700"
                    placeholder="•"
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newPin = [...pin];
                      newPin[i] = val.substring(val.length - 1);
                      setPin(newPin);
                      if (val && i < 3) document.getElementById(`pin-${i + 1}`).focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !pin[i] && i > 0) {
                        document.getElementById(`pin-${i - 1}`).focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {authStage === 'pin_setup' ? 'Set PIN & Continue' : 'Unlock Zhatn!'} <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>

              {authStage === 'pin_entry' && (
                <button
                  type="button"
                  onClick={() => {
                    setVerificationUsername('');
                    setAuthStage('verification_username');
                  }}
                  className="text-xs text-gray-400 hover:text-white mt-4 underline decoration-white/20 hover:decoration-white transition-all w-full text-center block"
                >
                  Forgot PIN?
                </button>
              )}
            </form>
          )}

          {authStage === 'profile' && (
            <form onSubmit={handleRegister} className="space-y-6 text-center">

              {/* Avatar Upload */}
              <div onClick={() => avatarInputRef.current?.click()} className="w-32 h-32 mx-auto relative cursor-pointer group">
                <div className={cn("w-full h-full rounded-full overflow-hidden border-2 shadow-lg flex items-center justify-center transition-all bg-black/40", userAvatar ? "border-red-500" : "border-red-500/30 group-hover:border-red-500")}>
                  {userAvatar ? (
                    <img src={userAvatar} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-red-500/50 group-hover:text-red-500 transition-colors" />
                  )}
                </div>
                {/* Plus Badge */}
                <div className="absolute bottom-1 right-1 bg-red-600 rounded-full p-1.5 shadow-md border border-black">
                  <div className="w-3 h-3 bg-white mask-plus" /> {/* CSS Plus or Icon */}
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
              </div>
              <p className="text-[10px] text-gray-500">Tap to upload square photo (1:1)</p>


              <input
                type="text"
                className="input-pill w-full text-center text-lg text-white"
                placeholder="Your Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />

              {/* Gender Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button type="button"
                  onClick={() => setGender('male')}
                  className={cn("p-3 rounded-xl border transition-all flex items-center justify-center gap-2", gender === 'male' ? "bg-red-900/40 border-red-500 text-white" : "border-white/10 text-gray-500 hover:bg-white/5")}
                >
                  <span className="text-lg">👨</span> Male
                </button>
                <button type="button"
                  onClick={() => setGender('female')}
                  className={cn("p-3 rounded-xl border transition-all flex items-center justify-center gap-2", gender === 'female' ? "bg-red-900/40 border-red-500 text-white" : "border-white/10 text-gray-500 hover:bg-white/5")}
                >
                  <span className="text-lg">👩</span> Female
                </button>
              </div>

              <button type="submit" disabled={!profileName || !gender} className="btn-liquid w-full py-4 rounded-xl text-lg shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed">
                Start Messaging
              </button>
            </form>
          )}

        </div>

        {/* FOOTER (External) */}
        {/* FOOTER (External) */}
        <div className="mt-6 text-center space-y-2 relative z-10">
          <p className="text-[10px] text-white/50 font-medium tracking-widest uppercase mb-2">Zhatn! - Future of Privacy</p>
          <p className="text-[10px] text-white/40 font-light tracking-wider">v1.1</p>
          <p className="text-[10px] text-white/40 font-light">
            Deployed by <a href="https://darkvibelk.pages.dev/" target="_blank" rel="noopener noreferrer" className="font-medium text-white/60 hover:text-red-400 transition-colors">Dark Vibe</a>
          </p>
          <a href="https://darkvibelk.pages.dev/contact?service=zhatn" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/30 hover:text-red-400 transition-colors block mt-2">
            Send Suggestions & Feedback
          </a>
        </div>
        {/* BROADCAST MODAL */}
        {isBroadcasting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
            <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)] relative">
              <button onClick={() => setIsBroadcasting(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <BadgeCheck className="w-6 h-6 text-red-500" /> Admin Broadcast
              </h3>
              <p className="text-sm text-gray-400 mb-6">Send a message to ALL users.</p>

              <form onSubmit={handleBroadcast}>
                <textarea
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white resize-none focus:border-red-500 transition-colors outline-none"
                  placeholder="Type your announcement..."
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                ></textarea>
                <button type="submit" className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all">
                  SEND BROADCAST
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- APP VIEW ---
  if (!user) return <div className="h-screen flex items-center justify-center text-red-500 animate-pulse">Loading Zhatn!...</div>;

  return (
    <div className="h-screen w-full flex bg-[#050505] overflow-hidden text-gray-200">

      {/* SIDEBAR */}
      <div className={cn("glass-panel flex flex-col z-20 border-r border-white/5 transition-all duration-300", activeChat ? "hidden md:flex w-full md:w-96" : "flex w-full md:w-96")}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
            setEditName(user.username);
            setEditAvatar(user.avatar_url);
            setIsEditingProfile(true);
          }}>
            <div className="relative">
              <img src={user.avatar_url} className="w-10 h-10 rounded-full border border-white/10 shadow-sm transition-transform group-hover:scale-105" alt="Me" />
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-3 h-3 text-white">✎</div>
              </div>
            </div>

            <h3 className="font-semibold text-white tracking-wide group-hover:text-red-400 transition-colors flex items-center gap-1">
              {user.username}
              {renderBadge(user)}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {(isAdmin(user.phone) || user.badge_type === 'admin') && (
              <button onClick={() => setIsBroadcasting(true)} className="p-2 hover:bg-white/10 hover:text-red-500 rounded-full transition-colors" title="Broadcast">
                <Send className="w-5 h-5" />
              </button>
            )}
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 hover:text-red-500 rounded-full transition-colors" title="Logout"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>



        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats (phone/username)..."
              className="input-pill w-full pl-10 py-2.5 text-sm bg-[#1a1a1a] border-white/5 text-gray-300 placeholder-gray-600 focus:bg-[#222]"
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2">











          {filteredContacts.map(contact => (
            <div
              key={contact.id || contact.phone}
              onClick={(e) => {
                if (isLongPress.current) {
                  isLongPress.current = false;
                  e.stopPropagation();
                  return;
                }
                setActiveChat(contact);
              }}

              // Long Press Events
              onMouseDown={() => startPress(contact)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={() => startPress(contact)}
              onTouchEnd={cancelPress}

              className={cn(
                "p-3 rounded-2xl mb-1 flex items-center gap-3 cursor-pointer transition-all border border-transparent group relative select-none",
                activeChat?.phone === contact.phone
                  ? "bg-gradient-to-r from-red-900/20 to-transparent border-l-2 border-red-500"
                  : "hover:bg-white/5",
                contextMenuContact === contact.phone && "bg-red-900/10 border-red-500/30"
              )}
            >
              <div className="relative">
                <img
                  src={contact.avatar_url || contact.avatar}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/3233/3233508.png'; }}
                  className="w-12 h-12 rounded-full bg-gray-800 object-cover ring-2 ring-black"
                />
                {/* Ring Logic: Check if actually online (Heartbeat < 60s ago) */}
                {contact.is_online && (new Date().getTime() - new Date(contact.last_seen || 0).getTime() < 60000) && <div className="absolute -inset-[2px] rounded-full status-ring z-[-1] opacity-70 animate-pulse"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className={cn("font-medium text-sm truncate flex items-center gap-1", activeChat?.phone === contact.phone ? "text-red-400" : "text-gray-300")}>
                    {contact.username || contact.name}
                    {renderBadge(contact)}
                  </h4>
                  {(!contact.is_online || (new Date().getTime() - new Date(contact.last_seen || 0).getTime() >= 60000)) && <span className="text-[10px] text-gray-600">Last seen {new Date(contact.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  {/* Visual Logic: Check if actually online (Heartbeat < 60s ago) */}
                  {contact.is_online && (new Date().getTime() - new Date(contact.last_seen || 0).getTime() < 60000) && <span className="text-[10px] text-green-500/70">Online</span>}
                </div>
                <p className="text-xs text-gray-500 truncate group-hover:text-gray-400">Tap to chat with {contact.username}</p>
              </div>

              {/* DELETE ICON (Long Press Only) */}
              {contextMenuContact === contact.phone && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-end pr-4 animate-in fade-in duration-200 z-10"
                  onClick={(e) => e.stopPropagation()} // Prevent closing immediately
                >
                  <span className="text-xs text-gray-300 mr-3 font-medium">Delete Chat?</span>
                  <button
                    onClick={(e) => {
                      setContextMenuContact(null); // Close menu first
                      handleDeleteChat(e, contact);
                    }}
                    className="p-2 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-500 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setContextMenuContact(null); }}
                    className="ml-2 p-2 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={cn("flex-col relative z-10 bg-black/40 backdrop-blur-3xl transition-all duration-300", activeChat ? "flex flex-1" : "hidden md:flex flex-1")}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 glass-card !rounded-none !border-x-0 border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-20 bg-[#111]/80">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img src={currentChatUser?.avatar_url || currentChatUser?.avatar} className="w-9 h-9 rounded-full shadow-sm ring-1 ring-white/10" />
                <div>
                  <h4 className="font-bold text-gray-200 text-sm flex items-center gap-1">
                    {currentChatUser?.username || currentChatUser?.name}
                    {renderBadge(currentChatUser)}
                  </h4>
                  {currentChatUser?.is_online && (new Date().getTime() - new Date(currentChatUser?.last_seen || 0).getTime() < 60000) ?
                    <span className="text-xs text-green-500 font-medium tracking-wider">ONLINE</span> :
                    <span className="text-xs text-gray-600">Last seen {new Date(currentChatUser?.last_seen || Date.now()).toLocaleTimeString()}</span>
                  }
                </div>
              </div>
              <div className="flex gap-4 text-gray-500 items-center">
                <Video onClick={() => setIsCalling(true)} className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />
                <PhoneIcon onClick={() => setIsCalling(true)} className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />

                {/* 3-DOT MENU */}
                <div className="relative">
                  <MoreVertical onClick={() => setShowMenu(!showMenu)} className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                  {showMenu && (
                    <div className="absolute right-0 top-8 w-40 glass-panel bg-black/90 border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col z-50">
                      <button
                        onClick={() => { handleClearChat(); setShowMenu(false); }}
                        className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Eraser className="w-4 h-4" /> Clear Chat
                      </button>
                      <button
                        onClick={(e) => { handleDeleteChat(e, activeChat); setShowMenu(false); }}
                        className="px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-3" onClick={() => setShowMenu(false)}>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-30">
                  <p>No messages yet.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user.phone;
                return (
                  <div key={i} className={cn("flex w-full animate-liquid-in", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-5 py-4 relative text-sm leading-relaxed shadow-lg flex flex-col gap-1 break-words",
                      isMe
                        ? "bubble-me font-medium"
                        : (isAdmin(msg.sender_id)
                          ? "bg-red-900/40 border border-red-500/50 text-white rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                          : "bubble-them bg-[#222] text-gray-300")
                    )}>
                      {msg.type === 'text' && (
                        <p className="whitespace-pre-wrap">
                          {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
                            part.match(/https?:\/\/[^\s]+/) ? (
                              <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all relative z-10">{part}</a>
                            ) : part
                          )}
                        </p>
                      )}

                      {msg.type === 'image' && <img src={msg.content} className="max-w-[200px] rounded-lg border border-white/10" alt="Sent image" />}
                      {msg.type === 'image' && <img src={msg.content} className="max-w-[200px] rounded-lg border border-white/10" alt="Sent image" />}
                      {msg.type === 'audio' && (
                        <audio
                          controls
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                          src={msg.content}
                          className="max-w-[200px] h-8 mt-1"
                        />
                      )}

                      <div className={cn("text-[9px] mt-2 flex justify-end gap-1 opacity-70", isMe ? "text-red-200" : "text-gray-400")}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                          <>
                            {msg.read_status ? (
                              <CheckCheck className="w-3 h-3 text-green-400" />
                            ) : (currentChatUser?.is_online && (new Date().getTime() - new Date(currentChatUser?.last_seen || 0).getTime() < 60000)) ? (
                              <CheckCheck className="w-3 h-3 text-white/50" />
                            ) : (
                              <Check className="w-3 h-3 text-white/50" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 pb-6 bg-gradient-to-t from-black to-transparent">
              <form onSubmit={sendMessage} className="glass-card rounded-full p-2 pl-4 flex items-center gap-2 shadow-2xl border border-white/10 bg-[#1a1a1a]">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-gray-300 transition-colors"><ImageIcon className="w-5 h-5" /></button>

                <input
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-600 text-sm"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                {inputText ? (
                  <button type="submit" className="p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full hover:shadow-lg hover:shadow-red-900/50 transition-all shadow-md">
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                ) : (
                  <button type="button" onClick={toggleRecording} className={cn("p-3 transition-colors rounded-full", isRecording ? "bg-red-600 text-white animate-pulse" : "text-gray-500 hover:text-gray-300")}>
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner border border-white/5">
              <div className="text-6xl grayscale opacity-50">🔴</div>
            </div>
            <p className="text-lg font-medium tracking-wide">Select a secure channel</p>
          </div>
        )}
      </div>

      {/* DETAILS PANEL */}
      {
        activeChat && (
          <div className="w-72 glass-panel border-l border-white/5 hidden xl:flex flex-col items-center p-8 pt-12 bg-black/20">
            <img src={activeChat.avatar_url || activeChat.avatar} className="w-24 h-24 rounded-full shadow-2xl mb-4 ring-4 ring-white/5" />
            <h2 className="text-xl font-bold text-gray-200">{activeChat.username || activeChat.name}</h2>
            <p className="text-sm text-gray-500 mb-8 font-mono">{activeChat.phone}</p>
            <div className="w-full space-y-2">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Details</h3>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-400">
                Status: <span className="text-white">{activeChat.status || 'Available'}</span>
              </div>
            </div>
          </div>
        )
      }

      {/* CALL SIMULATION MODAL */}
      {
        isCalling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="glass-card p-10 rounded-3xl flex flex-col items-center animate-liquid-in border border-red-500/30 shadow-[0_0_100px_rgba(220,38,38,0.3)]">
              <img src={activeChat.avatar_url} className="w-32 h-32 rounded-full mb-6 ring-4 ring-red-500/50 shadow-[0_0_50px_rgba(255,0,0,0.4)] animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">Calling {activeChat.username}...</h2>
              <p className="text-red-400 mb-8 tracking-widest uppercase text-xs font-bold">Secure Line Encryption Active</p>
              <div className="flex gap-6">
                <button onClick={() => setIsCalling(false)} className="p-6 bg-red-600 rounded-full hover:bg-red-700 transition-all hover:scale-110 shadow-lg shadow-red-900/50">
                  <PhoneIcon className="w-8 h-8 rotate-[135deg] text-white" />
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* EDIT PROFILE MODAL */}
      {
        isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl relative">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-6 text-center">Edit Profile</h3>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar Edit */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    onClick={() => document.getElementById('edit-avatar-input').click()}
                    className="w-28 h-28 rounded-full border-2 border-red-500/50 p-1 cursor-pointer hover:border-red-500 transition-colors relative group"
                  >
                    <img src={editAvatar} className="w-full h-full rounded-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Tap to change photo</p>
                  <input
                    id="edit-avatar-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          // Simple resize logic could be reused here if extracted, 
                          // for now valid base64 is fine for low volume
                          setEditAvatar(ev.target.result);
                        }
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-2">Display Name</label>
                    <input
                      type="text"
                      className="input-pill w-full text-white px-4 py-3"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>

                  <div className="space-y-1 opacity-60">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-2">Phone Number</label>
                    <input
                      type="text"
                      className="input-pill w-full text-gray-400 px-4 py-3 cursor-not-allowed border-dashed border-white/10"
                      value={user.phone}
                      disabled
                    />
                    <p className="text-[10px] text-gray-600 ml-2">Phone number cannot be changed.</p>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-lg shadow-red-900/40 hover:bg-red-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {/* INFO MODAL */}
      {
        activeInfoModal && (
          <InfoModal
            title={INFO_CONTENTS[activeInfoModal].title}
            content={INFO_CONTENTS[activeInfoModal].content}
            onClose={() => setActiveInfoModal(null)}
          />
        )
      }
    </div >
  );
}

// Icon Helper
const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
)

export default App;
