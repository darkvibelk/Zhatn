import React, { useState, useEffect, useRef } from 'react';
import { User, Phone as PhoneIcon, Video, MoreVertical, Send, Paperclip, Mic, Search, LogOut, ArrowLeft, X, Check, CheckCheck, Clock, Plus, Image as ImageIcon, Trash2, Eraser } from 'lucide-react';
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

/**
 * ZHATN V2 - Main Application
 */
function App() {
  // Global State
  const [user, setUser] = useState(null); // Authenticated User
  const [view, setView] = useState('auth'); // 'auth' | 'app'
  const [appState, setAppState] = useState('chat'); // 'chat' | 'calls' | 'status'

  // Auth State
  const [authStage, setAuthStage] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [country, setCountry] = useState(COUNTRIES[2]); // Default LK
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [profileName, setProfileName] = useState('');

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

  const updateOnlineStatus = async (phone, isOnline) => {
    await supabase.from('profiles').update({
      is_online: isOnline,
      last_seen: new Date().toISOString()
    }).eq('phone', phone);
  };

  // --- 1. AUTHENTICATION LOGIC ---

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
    if (cleanNumber.length !== country.len) {
      alert(`Please enter a valid ${country.len}-digit mobile number.`);
      return;
    }
    setPhoneNumber(cleanNumber);
    alert("TESTING MODE: Your verification code is 1234");
    setAuthStage('otp');
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    // Custom Passwords for "Admin/Special" Accounts
    // 987654321 -> Requires 1301
    // 123456789 -> Requires 1326
    // Everyone else -> Requires 1234

    let requiredOtp = '1234';
    if (phoneNumber === '987654321') requiredOtp = '1301';
    if (phoneNumber === '123456789') requiredOtp = '1326';

    if (enteredOtp === requiredOtp) {
      checkUserExists();
    } else {
      // Security measure: maintain illusion
      alert("Invalid Code (Try 1234)");
    }
  };

  const checkUserExists = async () => {
    const fullPhone = `${country.dial}${phoneNumber}`;
    const { data } = await supabase.from('profiles').select('*').eq('phone', fullPhone).single();
    if (data) {
      loginUser(data);
    } else {
      setAuthStage('profile');
    }
  };

  // -- Avatar Selection & Validation --
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (Math.abs(img.width - img.height) > 10) { // Allow slight 10px error
          alert("Please upload a square (1:1) photo.");
          e.target.value = null; // Clear input
          setUserAvatar(null);
        } else {
          // COMPRESSION: Resize to 300x300 JPEG to save space (LocalStorage limit is ~5MB)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 300;

          canvas.width = maxSize;
          canvas.height = maxSize;

          // Draw image tightly to canvas (resize)
          ctx.drawImage(img, 0, 0, maxSize, maxSize);

          // Compress to JPEG 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setUserAvatar(dataUrl);
        }
      };
    }
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
      is_online: true
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

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      if (user) updateOnlineStatus(user.phone, false);
      localStorage.removeItem('zhatn_user');
      setUser(null);
      setView('auth');
      setAuthStage('phone');
      setPhoneNumber('');
      setOtp(['', '', '', '']);
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
          .select('*')
          .in('phone', Array.from(uniqueIds));

        if (profiles) {
          // SORTING: Database 'in()' query does not preserve order. 
          // Re-sort profiles based on the order they appeared in the 'messages' query (most recent first).
          const sortedIds = Array.from(uniqueIds);
          profiles.sort((a, b) => sortedIds.indexOf(a.phone) - sortedIds.indexOf(b.phone));

          setMyChats(profiles);
          setContacts(profiles); // Default view is my chats
        }
      } else {
        setMyChats([]);
        setContacts([]);
      }
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
      .select('*')
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
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2000000) { alert("File too large (Max 2MB for demo)"); return; }

    const reader = new FileReader();
    reader.onloadend = () => {
      dispatchMessage('image', reader.result); // Send Base64 string
    };
    reader.readAsDataURL(file);
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-y-auto">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-900/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="glass-card w-full max-w-md p-8 rounded-3xl animate-liquid-in relative z-10">
          <div className="text-center mb-10">
            <img src="/zhatn-logo.png" className="w-24 h-24 mx-auto mb-4 rounded-3xl shadow-xl hover:scale-105 transition-transform duration-500" alt="Zhatn Logo" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700 mb-2 drop-shadow-sm">Zhatn.</h1>
          </div>

          {authStage === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-2">Country Code</label>
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <select
                    className="input-pill px-3 appearance-none cursor-pointer text-white bg-[#333]"
                    value={country.code}
                    onChange={(e) => setCountry(COUNTRIES.find(c => c.code === e.target.value))}
                  >
                    {COUNTRIES.map(c => <option key={c.code} value={c.code} className="text-black">{c.flag} {c.dial}</option>)}
                  </select>
                  <input
                    type="tel"
                    className="input-pill font-mono text-lg tracking-wide text-white"
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

          {authStage === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-6 text-center">
              <p className="text-sm text-gray-400 mb-4">
                Code sent to <b className="text-white">{country.dial} {phoneNumber}</b><br />
                <span className="text-red-400 font-bold">(Test Code: 1234)</span>
              </p>
              <div className="flex justify-center gap-3">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-14 h-16 rounded-2xl border border-white/10 bg-white/5 text-center text-white text-2xl font-bold focus:ring-2 ring-red-500/50 outline-none backdrop-blur shadow-sm"
                    value={d}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[i] = e.target.value;
                      setOtp(newOtp);
                      if (e.target.value && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
                    }}
                    id={`otp-${i}`}
                  />
                ))}
              </div>
              <button type="submit" className="btn-liquid w-full py-4 rounded-xl text-lg mt-4 shadow-red-900/40">Verify Identity</button>
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
        <div className="mt-6 text-center space-y-2 relative z-10">
          <p className="text-[10px] text-white/40 font-light tracking-wider">v1.0 — 7 Days Built</p>
          <p className="text-[10px] text-white/40 font-light">
            Deployed by <a href="#" className="font-medium text-white/60 hover:text-red-400 transition-colors">Dark Vibe</a>
          </p>
          <a href="#" className="text-[10px] text-white/30 hover:text-red-400 transition-colors block mt-2">
            Send Suggestions & Feedback
          </a>
        </div>
      </div>
    );
  }

  // --- APP VIEW ---
  if (!user) return <div className="h-screen flex items-center justify-center text-red-500 animate-pulse">Loading Zhatn...</div>;

  return (
    <div className="h-screen w-full flex bg-[#050505] overflow-hidden text-gray-200">

      {/* SIDEBAR */}
      <div className="w-96 glass-panel flex flex-col z-20 border-r border-white/5">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src={user.avatar_url} className="w-10 h-10 rounded-full border border-white/10 shadow-sm" alt="Me" />
            <h3 className="font-semibold text-white tracking-wide">{user.username}</h3>
          </div>
          <div className="flex gap-2 text-gray-400">
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
                {contact.is_online && <div className="absolute -inset-[2px] rounded-full status-ring z-[-1] opacity-70 animate-pulse"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className={cn("font-medium text-sm truncate", activeChat?.phone === contact.phone ? "text-red-400" : "text-gray-300")}>{contact.username || contact.name}</h4>
                  {contact.last_seen && !contact.is_online && <span className="text-[10px] text-gray-600">Last seen {new Date(contact.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  {contact.is_online && <span className="text-[10px] text-green-500/70">Online</span>}
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

      {/* CHAT WINDOW */}
      <div className="flex-1 flex flex-col relative z-10 bg-black/40 backdrop-blur-3xl">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 glass-card !rounded-none !border-x-0 border-b border-white/5 flex items-center justify-between px-6 z-20 bg-[#111]/80">
              <div className="flex items-center gap-3">
                <img src={currentChatUser?.avatar_url || currentChatUser?.avatar} className="w-9 h-9 rounded-full shadow-sm ring-1 ring-white/10" />
                <div>
                  <h4 className="font-bold text-gray-200 text-sm">{currentChatUser?.username || currentChatUser?.name}</h4>
                  {currentChatUser?.is_online ?
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
                      "max-w-[60%] px-5 py-3 relative text-sm leading-relaxed shadow-lg flex flex-col gap-2",
                      isMe ? "bubble-me font-medium" : "bubble-them bg-[#222] text-gray-300"
                    )}>
                      {msg.type === 'text' && msg.content}
                      {msg.type === 'image' && <img src={msg.content} className="max-w-[200px] rounded-lg border border-white/10" alt="Sent image" />}
                      {msg.type === 'audio' && <audio controls src={msg.content} className="max-w-[200px] h-8 mt-1" />}

                      <div className={cn("text-[9px] mt-1 flex justify-end gap-1 opacity-70", isMe ? "text-red-200" : "text-gray-500")}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                          <>
                            {/* Tick Logic: Green (Read) > Double (Online/Delivered) > Single (Offline/Sent) */}
                            {msg.read_status ? (
                              <CheckCheck className="w-3 h-3 text-green-400" />
                            ) : currentChatUser?.is_online ? (
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
      {activeChat && (
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
      )}

      {/* CALL SIMULATION MODAL */}
      {isCalling && (
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
      )}
    </div>
  );
}

// Icon Helper
const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
)

export default App;
