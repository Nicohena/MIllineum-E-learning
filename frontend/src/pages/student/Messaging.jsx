import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, User, MoreVertical, 
  Phone, Video, Info, Plus, 
  CheckCheck, Check, Clock,
  MessageSquare, Loader2, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import messageService from '../../services/messageService';

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [convs, availableContacts] = await Promise.all([
          messageService.getConversations(),
          messageService.getContacts()
        ]);
        setConversations(convs);
        setContacts(availableContacts);
      } catch (error) {
        console.error("Messaging init error:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    let interval;
    if (activeContact) {
      const fetchMessages = async () => {
        try {
          const data = await messageService.getMessages(activeContact.id || activeContact.contact_id);
          setMessages(data);
        } catch (error) {
          console.error("Message fetch error:", error);
        }
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // Poll every 3s
    }
    return () => clearInterval(interval);
  }, [activeContact]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const cid = activeContact.id || activeContact.contact_id;
    try {
      await messageService.sendMessage(cid, newMessage);
      setNewMessage('');
      const data = await messageService.getMessages(cid);
      setMessages(data);
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold">Securely connecting to chat...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto h-[calc(100vh-140px)] animate-in fade-in duration-500">
      
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl h-full flex overflow-hidden">
        
        {/* Sidebar - Conversations */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-50 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
              <button 
                onClick={() => setShowContacts(!showContacts)}
                className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {showContacts ? (
              <>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Available Contacts</p>
                {contacts.map(contact => (
                  <ContactItem 
                    key={contact.id} 
                    user={contact} 
                    onClick={() => { setActiveContact(contact); setShowContacts(false); }} 
                  />
                ))}
              </>
            ) : (
              conversations.map(conv => (
                <ConversationItem 
                  key={conv.contact_id} 
                  conv={conv} 
                  isActive={activeContact?.contact_id === conv.contact_id}
                  onClick={() => setActiveContact(conv)} 
                />
              ))
            )}
            {!showContacts && conversations.length === 0 && (
              <div className="text-center py-10 opacity-40">
                <MessageSquare className="mx-auto mb-2" size={32} />
                <p className="text-xs font-bold">No active chats</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="bg-white p-4 md:px-8 md:py-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveContact(null)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                      {activeContact.contact_name?.charAt(0) || activeContact.name?.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">{activeContact.contact_name || activeContact.name}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Online Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <IconButton icon={Phone} />
                  <IconButton icon={Video} />
                  <IconButton icon={MoreVertical} />
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
                {messages.map((msg, idx) => (
                  <MessageBubble 
                    key={msg.id} 
                    msg={msg} 
                    isMe={msg.sender_id === user.id} 
                    isGroup={activeContact.is_group}
                  />
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 md:p-8 bg-white border-t border-slate-50">
                <form onSubmit={handleSend} className="flex items-center gap-4 bg-slate-50 rounded-3xl p-2 pr-3">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..." 
                    className="flex-1 bg-transparent border-none py-3 px-4 text-sm font-bold placeholder:text-slate-400 focus:ring-0"
                  />
                  <button 
                    type="submit"
                    className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-100"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-indigo-600 mb-4 animate-bounce duration-[3s]">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Millennium Messenger</h2>
              <p className="text-slate-400 font-medium max-w-sm">
                Select a contact from the left or start a new conversation to begin chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IconButton = ({ icon: Icon }) => (
  <button className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
    <Icon size={18} />
  </button>
);

const ConversationItem = ({ conv, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${isActive ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${conv.is_group ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
      {conv.is_group ? <Users size={20} /> : conv.contact_name?.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-0.5">
        <h4 className={`font-black text-sm truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{conv.contact_name}</h4>
      </div>
      <p className="text-xs text-slate-400 font-medium truncate">
        {conv.is_group ? 'Class Group Chat' : 'Private Message'}
      </p>
    </div>
  </div>
);

const ContactItem = ({ user, onClick }) => (
  <div 
    onClick={onClick}
    className="p-4 rounded-2xl cursor-pointer flex items-center gap-4 hover:bg-indigo-50 transition-all group"
  >
    <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">
      {user.name?.charAt(0)}
    </div>
    <div className="min-w-0">
      <h4 className="font-black text-sm text-slate-800 truncate">{user.name}</h4>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.role}</p>
    </div>
  </div>
);

const MessageBubble = ({ msg, isMe, isGroup }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
    <div className={`max-w-[80%] md:max-w-[70%] space-y-1`}>
      {isGroup && !isMe && (
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-2 mb-1">
          {msg.sender_name} <span className="text-slate-300">• {msg.sender_role}</span>
        </p>
      )}
      <div className={`
        p-4 md:px-6 md:py-4 rounded-[1.8rem] text-sm font-medium leading-relaxed
        ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm rounded-tl-none border border-slate-50'}
      `}>
        {msg.content}
      </div>
      <div className={`flex items-center gap-2 text-[10px] font-bold text-slate-300 ${isMe ? 'justify-end pr-2' : 'pl-2'}`}>
        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {isMe && !isGroup && (msg.is_read ? <CheckCheck size={12} className="text-indigo-400" /> : <Check size={12} />)}
      </div>
    </div>
  </div>
);

export default Messaging;