"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Check } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    // Realtime Listener
    const channel = supabase.channel(`notifications:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
      (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    // Click outside to close
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userId]);

  async function fetchNotifications() {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-300 hover:text-white transition">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-fade-in z-50">
          <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
            <span className="font-bold text-sm text-white">Notifications</span>
            {unreadCount > 0 && <button onClick={() => notifications.forEach(n => markRead(n.id))} className="text-xs text-primary hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-8">No new notifications</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${!n.is_read ? 'bg-primary/5' : ''}`}>
                  <Link href={n.link || '#'} className="block">
                    <p className="text-sm font-bold text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    <p className="text-[10px] text-slate-500 mt-2 text-right">{new Date(n.created_at).toLocaleDateString()}</p>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
