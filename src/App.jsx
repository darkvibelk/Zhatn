import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  User, Lock, Phone, Camera, Send, MoreVertical,
  Search, Phone as PhoneIcon, Video, Smile, Paperclip,
  Check, ArrowLeft, LogOut, Image as ImageIcon, X, Play
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility Functions ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Dummy Data ---
const dummyContacts = [
  { id: 1, name: "Alice Vane", status: "online", lastMsg: "See you at the club?", time: "2 min", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { id: 2, name: "Marcus 'Neo' Thorne", status: "offline", lastMsg: "The package is secure.", time: "1 hr", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
  { id: 3, name: "Sarah Connor", status: "online", lastMsg: "No fate but what we make.", time: "3 hr", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { id: 4, name: "K. Silverhand", status: "busy", lastMsg: "Wake up, Samurai.", time: "Yesterday", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80" },
  { id: 5, name: "Jinx", status: "offline", lastMsg: "Boom?", time: "Yesterday", avatar: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=150&q=80" },
];

const initialMessages = [
  { id: 1, senderId: 1, text: "Hey! Are you ready for tonight?", time: "20:01", type: 'text' },
  { id: 2, senderId: 'me', text: "Almost. Just finishing up some code.", time: "20:02", type: 'text' },
  { id: 3, senderId: 1, text: "Make sure to bring the drive.", time: "20:03", type: 'text' },
];

// --- Components ---

function Button({ children, className, onClick, variant = 'primary', ...props }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
        variant === 'primary' && "bg-[#D32F2F] hover:bg-[#B71C1C] text-white shadow-lg shadow-red-900/40",
        variant === 'ghost' && "bg-transparent text-[#A0A0A0] hover:text-white hover:bg-[#1E1E1E]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function InputField({ icon: Icon, type = "text", placeholder, value, onChange, className }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn(
      "group relative flex items-center bg-[#2A2A2A] rounded-xl border border-transparent transition-all duration-300",
      isFocused && "border-red-600 shadow-[0_0_15px_-3px_rgba(211,47,47,0.3)]",
      className
    )}>
      {Icon && <Icon className={cn("ml-4 w-5 h-5 transition-colors", isFocused ? "text-red-500" : "text-[#666]")} />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-transparent text-[#F5F5F5] px-4 py-3 outline-none placeholder-[#666]"
      />
    </div>
  );
}

function Avatar({ src, alt, size = "md", className }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-24 h-24"
  };

  return (
    <div className={cn("relative rounded-full overflow-hidden bg-[#2A2A2A] flex-shrink-0", sizeClasses[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#666]">
          <User className={size === 'xl' ? "w-10 h-10" : "w-5 h-5"} />
        </div>
      )}
    </div>
  );
}

// Camera Modal Component
function CameraModal({ isOpen, onClose, onCapture, mode = 'photo' }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: mode === 'video'
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file, 'image');
      onClose();
    }, 'image/jpeg');
  };

  const startRecording = () => {
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      onCapture(file, 'video');
      onClose();
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl max-h-[80vh] bg-[#0F0F0F] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
          <button onClick={onClose} className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
          <button onClick={toggleCamera} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors">
            Flip Camera
          </button>
        </div>

        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6">
          {mode === 'photo' ? (
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-red-600 hover:bg-red-50 transition-all transform hover:scale-105 active:scale-95"
            >
              <Camera className="w-8 h-8 mx-auto text-red-600" />
            </button>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "w-20 h-20 rounded-full border-4 transition-all transform hover:scale-105 active:scale-95",
                isRecording
                  ? "bg-red-600 border-white animate-pulse"
                  : "bg-white border-red-600"
              )}
            >
              {isRecording ? (
                <div className="w-6 h-6 bg-white rounded-sm mx-auto" />
              ) : (
                <div className="w-6 h-6 bg-red-600 rounded-full mx-auto" />
              )}
            </button>
          )}
        </div>

        {isRecording && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-600 rounded-full text-white text-sm font-medium flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            Recording...
          </div>
        )}
      </div>
    </div>
  );
}


// --- Main App Component ---

function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('zhatn_user');
    return saved ? JSON.parse(saved) : null;
  }); // { name, phone, avatar }

  const [view, setView] = useState('login'); // 'login' | 'signup'

  // Auth Form State
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    avatar: null,
    avatarPreview: null
  });

  // Chat State
  const [activeContact, setActiveContact] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Real DB State
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [newMessage, setNewMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' | 'video'
  const [attachedMedia, setAttachedMedia] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: file, avatarPreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.username && formData.phone) {
      const newUser = {
        name: formData.username,
        phone: formData.phone,
        avatar: formData.avatarPreview // Note: Storing base64 string directly for demo
      };

      // Insert into Supabase
      const { error } = await supabase.from('profiles').insert([
        {
          username: newUser.name,
          phone: newUser.phone,
          avatar_url: newUser.avatar,
          status: 'online'
        }
      ]);

      if (error) {
        console.error("Signup error:", error);
        alert("Error creating account: " + error.message);
      } else {
        setUser(newUser);
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const demoUser = {
      name: "Agent-007",
      phone: "007",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    };
    setUser(demoUser);

    // Auto-create demo profile if not exists (fire and forget)
    supabase.from('profiles').insert([
      { username: demoUser.name, phone: demoUser.phone, avatar_url: demoUser.avatar, status: 'online' }
    ]).then(({ error }) => {
      // Ignore duplicate key error (already exists)
    });
  };

  const handleCameraCapture = (file, type) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedMedia({ file, preview: reader.result, type });
    };
    reader.readAsDataURL(file);
  };

  const handleFileAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('image/') ? 'image' :
          file.type.startsWith('video/') ? 'video' : 'file';
        setAttachedMedia({ file, preview: reader.result, type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const msgContent = newMessage.trim();
    if (!msgContent && !attachedMedia) return;

    // Prepare message for DB
    const dbMsg = {
      content: msgContent,
      sender_id: user.phone,
      sender_name: user.name,
      sender_avatar: user.avatar,
      type: attachedMedia ? attachedMedia.type : 'text',
      media_url: attachedMedia ? attachedMedia.preview : null // NOTE: Storing base64 for demo
    };

    // Insert into Supabase
    const { error } = await supabase.from('messages').insert([dbMsg]);

    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } else {
      setNewMessage('');
      setAttachedMedia(null);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Initial Data Fetch & Realtime Subscription ---
  useEffect(() => {
    // 1. Fetch initial data
    const fetchData = async () => {
      // Get users
      const { data: usersData } = await supabase.from('profiles').select('*');
      if (usersData) {
        setContacts(usersData);
      }

      // Get messages (limit last 50 for demo)
      const { data: msgsData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (msgsData) {
        const formatted = msgsData.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          senderAvatar: m.sender_avatar,
          text: m.content,
          type: m.type,
          mediaUrl: m.media_url,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formatted);
      }
    };

    fetchData();

    // 2. Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new;
        const newMsg = {
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          senderAvatar: m.sender_avatar,
          text: m.content,
          type: m.type,
          mediaUrl: m.media_url,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    // 3. Subscribe to new users (profiles)
    const profilesChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        setContacts(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Save user to session on change
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('zhatn_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('zhatn_user');
    }
  }, [user]);

  // -- Render Auth View --
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] relative overflow-hidden font-sans">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md z-10 p-4 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/5">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
                Zhatn.
              </h1>
              <p className="text-[#A0A0A0]">The future of communication.</p>
            </div>

            {view === 'signup' ? (
              <form onSubmit={handleSignup} className="space-y-5">
                {/* Photo Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className={cn(
                      "w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300",
                      formData.avatarPreview
                        ? "border-red-500 shadow-[0_0_20px_rgba(211,47,47,0.3)]"
                        : "border-[#444] group-hover:border-red-500 bg-[#1E1E1E]"
                    )}>
                      {formData.avatarPreview ? (
                        <img src={formData.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center group-hover:text-red-500 transition-colors">
                          <Camera className="w-8 h-8 mx-auto mb-1 text-[#666] group-hover:text-red-500" />
                          <span className="text-xs text-[#666] group-hover:text-red-400">Upload Photo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <InputField
                  icon={User}
                  placeholder="Username"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
                <InputField
                  icon={Phone}
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <InputField
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />

                <Button type="submit" className="w-full mt-4">Create Account</Button>

                <div className="text-center text-sm text-[#888] mt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setView('login')} className="text-red-500 hover:text-red-400 font-medium">Log In</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-sm text-red-200 text-center">
                  For "Real Global Chat": Use <strong>Sign Up</strong> to create a real user profile (available to everyone).
                </div>
                <Button type="button" onClick={() => setView('signup')} className="w-full">Go to Sign Up</Button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-700"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR USE DEMO ACCOUNT</span>
                  <div className="flex-grow border-t border-gray-700"></div>
                </div>

                <Button type="submit" variant="ghost" className="w-full">Access as Agent-007 (Demo)</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Combine contacts for display
  // Combine contacts for display
  const displayContacts = contacts
    .filter((v, i, a) => a.findIndex(t => (t.phone || t.id) === (v.phone || v.id)) === i) // Unique by phone/id
    .filter(c => c.phone !== user?.phone); // Exclude self

  // -- Render Main App Interface --
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] flex overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-80 bg-[#181818] border-r border-[#222] flex flex-col hidden md:flex">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar src={user.avatar} size="md" className="border border-white/10" />
            <div>
              <h3 className="font-semibold text-white">{user.name}</h3>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="p-2 text-[#666] hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#555]" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full bg-[#0F0F0F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#333]"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-4 py-2 text-xs font-bold text-red-500 uppercase tracking-widest opacity-80">
            Global Feed
          </div>
          {displayContacts.map(contact => (
            <div
              key={contact.id || contact.phone}
              onClick={() => {
                setActiveContact(contact);
                setShowMobileChat(true);
              }}
              className={cn(
                "p-3 rounded-lg cursor-pointer flex items-center space-x-3 transition-all duration-200 group",
                ((activeContact?.id || activeContact?.phone) === (contact.id || contact.phone)) ? "bg-gradient-to-r from-red-900/20 to-transparent border-l-4 border-red-600" : "hover:bg-[#222] border-l-4 border-transparent"
              )}
            >
              <div className="relative">
                <Avatar src={contact.avatar || contact.avatar_url} size="md" />
                <span className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#181818]",
                  (contact.status || 'online') === 'online' ? "bg-green-500" :
                    contact.status === 'busy' ? "bg-red-500" : "bg-gray-500"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className={cn("text-sm font-medium truncate", (activeContact?.id || activeContact?.phone) === (contact.id || contact.phone) ? "text-red-500" : "text-gray-200 group-hover:text-white")}>
                    {contact.name || contact.username}
                  </h4>
                  <span className="text-[10px] text-[#555]">{contact.time || 'now'}</span>
                </div>
                <p className="text-xs text-[#666] truncate group-hover:text-[#888]">{contact.lastMsg || 'Joined Zhatn'}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area: Show on Desktop OR Mobile if chat IS open */}
      <main className={cn(
        "flex-1 flex-col bg-[#0F0F0F] relative",
        showMobileChat ? "flex" : "hidden md:flex"
      )}>
        {/* Chat Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] via-[#101010] to-[#141414] pointer-events-none" />

        {!activeContact ? (
          <div className="flex-1 flex items-center justify-center flex-col text-[#444]">
            <div className="w-20 h-20 rounded-full bg-[#1E1E1E] flex items-center justify-center mb-4">
              <User className="w-10 h-10" />
            </div>
            <p>Select an agent to begin secure communication</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-[73px] bg-[#141414]/80 backdrop-blur-md border-b border-[#222] flex items-center justify-between px-6 z-10 sticky top-0">
              <div className="flex items-center space-x-4">
                <div className="md:hidden">
                  <button onClick={() => setShowMobileChat(false)}>
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <Avatar src={activeContact.avatar || activeContact.avatar_url} size="md" />
                <div>
                  <h2 className="font-semibold text-lg">{activeContact.name || activeContact.username}</h2>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {activeContact.status || 'online'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-[#A0A0A0]">
                <button className="hover:text-red-500 transition-colors bg-[#1E1E1E] p-2 rounded-full"><PhoneIcon className="w-5 h-5" /></button>
                <button className="hover:text-red-500 transition-colors bg-[#1E1E1E] p-2 rounded-full"><Video className="w-5 h-5" /></button>
                <button className="hover:text-gray-100 transition-colors bg-[#1E1E1E] p-2 rounded-full"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 z-0">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.phone; // Check against current user's phone/ID
                return (
                  <div
                    key={msg.id}
                    className={cn("flex w-full animate-fade-in", isMe ? "justify-end" : "justify-start")}
                  >
                    {!isMe && (
                      <Avatar src={msg.senderAvatar || activeContact.avatar} size="sm" className="mr-3 self-end mb-1" />
                    )}

                    <div className={cn(
                      "max-w-[70%] px-5 py-3 rounded-2xl relative shadow-lg leading-relaxed",
                      isMe
                        ? "bg-gradient-to-br from-red-700 to-red-900 text-white rounded-br-none"
                        : "bg-[#2E2E2E] text-gray-200 rounded-bl-none"
                    )}>
                      {!isMe && <div className="text-[10px] text-red-400 font-bold mb-1 opacity-80">{msg.senderName}</div>}

                      {/* Media Content */}
                      {msg.type === 'image' && (
                        <img
                          src={msg.mediaUrl}
                          alt="Shared image"
                          className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(msg.mediaUrl, '_blank')}
                        />
                      )}
                      {msg.type === 'video' && (
                        <video
                          src={msg.mediaUrl}
                          controls
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}

                      {/* Text Content */}
                      {msg.text && <p className="text-sm">{msg.text}</p>}

                      <span className={cn(
                        "text-[10px] mt-1 block opacity-70",
                        isMe ? "text-red-200 text-right" : "text-gray-400"
                      )}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-[#0F0F0F] border-t border-[#222] z-10">
              {/* Media Preview */}
              {attachedMedia && (
                <div className="mb-4 relative inline-block">
                  <div className="relative bg-[#1E1E1E] rounded-lg p-2 border border-red-900/30">
                    {attachedMedia.type === 'image' && (
                      <img src={attachedMedia.preview} alt="Preview" className="max-h-32 rounded" />
                    )}
                    {attachedMedia.type === 'video' && (
                      <video src={attachedMedia.preview} className="max-h-32 rounded" controls />
                    )}
                    <button
                      onClick={() => setAttachedMedia(null)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto">
                {/* Camera Button with Dropdown */}
                <div className="relative group">
                  <button
                    type="button"
                    className="text-[#666] hover:text-red-500 transition-colors p-2 hover:bg-[#1E1E1E] rounded-full"
                    onClick={() => {
                      setCameraMode('photo');
                      setIsCameraOpen(true);
                    }}
                  >
                    <Camera className="w-6 h-6" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-[#1E1E1E] rounded-lg shadow-xl border border-[#333] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setCameraMode('photo');
                        setIsCameraOpen(true);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 transition-colors w-full text-left text-sm text-gray-300"
                    >
                      <Camera className="w-4 h-4 text-red-500" />
                      Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraMode('video');
                        setIsCameraOpen(true);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 transition-colors w-full text-left text-sm text-gray-300"
                    >
                      <Video className="w-4 h-4 text-red-500" />
                      Record Video
                    </button>
                  </div>
                </div>

                {/* File Attachment */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileAttachment}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#666] hover:text-[#bbb] transition-colors"
                >
                  <Paperclip className="w-6 h-6" />
                </button>

                <div className="flex-1 bg-[#1E1E1E] rounded-full flex items-center px-4 py-3 border border-transparent focus-within:border-red-900/50 focus-within:bg-[#222] transition-all duration-300">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-gray-200 outline-none placeholder-[#555] ml-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="button" className="text-[#666] hover:text-[#bbb] mx-2">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <button
                  type="submit"
                  className={cn(
                    "p-4 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center transform hover:scale-105 active:scale-95",
                    (newMessage.trim() || attachedMedia)
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-600/30"
                      : "bg-[#1E1E1E] text-[#444] cursor-not-allowed"
                  )}
                  disabled={!newMessage.trim() && !attachedMedia}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>

            {/* Camera Modal */}
            {/* Camera Modal */}
            <CameraModal
              isOpen={isCameraOpen}
              onClose={() => setIsCameraOpen(false)}
              onCapture={handleCameraCapture}
              mode={cameraMode}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
