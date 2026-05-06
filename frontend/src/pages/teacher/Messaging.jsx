import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, User, Users, MoreVertical, 
  Phone, Video, Plus, 
  CheckCheck, Check,
  MessageSquare, Loader2, ChevronLeft,
  GraduationCap, Smile, Paperclip, Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import messageService from '../../services/messageService';

const TeacherMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

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
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [activeContact]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || sendingMsg) return;

    const cid = activeContact.id || activeContact.contact_id;
    setSendingMsg(true);
    try {
      await messageService.sendMessage(cid, newMessage);
      setNewMessage('');
      const data = await messageService.getMessages(cid);
      setMessages(data);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSendingMsg(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    (c.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <MessageSquare className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-white animate-bounce" />
        </div>
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-semibold text-sm tracking-wide">Connecting to chat...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)]">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 h-full flex overflow-hidden">
        
        {/* Sidebar - Conversations */}
        <div className={`w-full md:w-80 lg:w-[360px] border-r border-slate-100 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-50">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Messages</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button 
                onClick={() => { setShowContacts(!showContacts); setSearchTerm(''); }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  showContacts 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 rotate-45' 
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={showContacts ? "Search contacts..." : "Search conversations..."} 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Conversations / Contacts List */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {showContacts ? (
              <>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] px-3 py-2">
                  {filteredContacts.length} Available Contact{filteredContacts.length !== 1 ? 's' : ''}
                </p>
                {filteredContacts.map(contact => (
                  <ContactItem 
                    key={contact.id} 
                    user={contact} 
                    onClick={() => { setActiveContact(contact); setShowContacts(false); setSearchTerm(''); }} 
                  />
                ))}
                {filteredContacts.length === 0 && (
                  <div className="text-center py-12 opacity-40">
                    <User className="mx-auto mb-2" size={28} />
                    <p className="text-xs font-medium">No contacts found</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {filteredConversations.map(conv => (
                  <ConversationItem 
                    key={conv.contact_id} 
                    conv={conv} 
                    isActive={activeContact?.contact_id === conv.contact_id || activeContact?.id === conv.contact_id}
                    onClick={() => { setActiveContact(conv); setSearchTerm(''); }} 
                  />
                ))}
                {filteredConversations.length === 0 && (
                  <div className="text-center py-12 opacity-40">
                    <MessageSquare className="mx-auto mb-3" size={28} />
                    <p className="text-xs font-semibold">No conversations yet</p>
                    <p className="text-[10px] text-slate-400 mt-1">Start one by clicking +</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gradient-to-b from-slate-50/50 to-white ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveContact(null)} className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                      activeContact.is_group 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    }`}>
                      {activeContact.is_group 
                        ? <Users size={18} /> 
                        : (activeContact.contact_name?.charAt(0) || activeContact.name?.charAt(0) || '?')
                      }
                    </div>
                    {!activeContact.is_group && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {activeContact.contact_name || activeContact.name}
                    </h3>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5 text-emerald-500">
                      {activeContact.is_group ? `Class Group` : activeContact.contact_role || activeContact.role || 'Online'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn icon={Phone} />
                  <IconBtn icon={Video} />
                  <IconBtn icon={MoreVertical} />
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-16 opacity-40">
                    <MessageSquare className="mx-auto mb-3" size={32} />
                    <p className="text-sm font-semibold">No messages yet</p>
                    <p className="text-xs mt-1">Send the first message to start the conversation</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    msg={msg} 
                    isMe={msg.sender_id == user.id} 
                    isGroup={activeContact.is_group}
                  />
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-5 py-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-1 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 focus-within:bg-white transition-all">
                    <input 
                      ref={inputRef}
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..." 
                      className="flex-1 bg-transparent border-none py-2.5 text-sm placeholder:text-slate-300 focus:ring-0 focus:outline-none"
                    />
                    <button type="button" className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                      <Smile size={18} />
                    </button>
                    <button type="button" className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                      <Paperclip size={18} />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || sendingMsg}
                    className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <MessageSquare size={36} className="text-indigo-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <GraduationCap size={16} className="text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Teacher Messaging</h2>
              <p className="text-slate-400 font-medium text-sm max-w-xs leading-relaxed">
                Select a conversation or start a new chat with your students and class groups.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Sub Components ── */

const IconBtn = ({ icon: Icon }) => (
  <button className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 flex items-center justify-center transition-colors">
    <Icon size={16} />
  </button>
);

const ConversationItem = ({ conv, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 mb-0.5 ${
      isActive 
        ? 'bg-indigo-50 border border-indigo-100' 
        : 'hover:bg-slate-50 border border-transparent'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
      conv.is_group 
        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500'
    }`}>
      {conv.is_group ? <Users size={16} /> : conv.contact_name?.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className={`font-semibold text-sm truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
        {conv.contact_name}
      </h4>
      <p className="text-[11px] text-slate-400 truncate mt-0.5">
        {conv.is_group ? 'Class Group Chat' : (conv.contact_role || 'Private Message')}
      </p>
    </div>
  </div>
);

const ContactItem = ({ user, onClick }) => (
  <div 
    onClick={onClick}
    className="p-3 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-indigo-50 transition-all duration-200 group mb-0.5 border border-transparent hover:border-indigo-100"
  >
    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0 transition-colors">
      {user.name?.charAt(0)}
    </div>
    <div className="min-w-0">
      <h4 className="font-semibold text-sm text-slate-800 truncate">{user.name}</h4>
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{user.role}</p>
    </div>
  </div>
);

const MessageBubble = ({ msg, isMe, isGroup }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
    <div className="max-w-[75%] space-y-1">
      {isGroup && !isMe && (
        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider ml-1 mb-1">
          {msg.sender_name} <span className="text-slate-300">• {msg.sender_role}</span>
        </p>
      )}
      <div className={`
        px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isMe 
          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-md shadow-sm shadow-indigo-100' 
          : 'bg-white text-slate-700 rounded-bl-md border border-slate-100 shadow-sm'
        }
      `}>
        {msg.content}
      </div>
      <div className={`flex items-center gap-1.5 text-[10px] font-medium text-slate-300 ${isMe ? 'justify-end pr-1' : 'pl-1'}`}>
        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {isMe && !isGroup && (msg.is_read ? <CheckCheck size={11} className="text-indigo-400" /> : <Check size={11} />)}
      </div>
    </div>
  </div>
);

export default TeacherMessaging;
