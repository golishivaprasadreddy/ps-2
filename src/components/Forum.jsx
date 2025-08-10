import React, { useEffect, useState } from 'react';
import { getForumPosts, createForumPost, getForumReplies, createForumReply } from '../services/coinService';
import { toast } from 'react-toastify';

const Forum = ({ userId, token }) => {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    getForumPosts(token)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createForumPost(userId, post, token);
      toast.success(res.data.message || 'Forum post created!');
      setPost('');
      // Prepend new post
      setPosts(prev => [{ _id: res.data.post._id, content: res.data.post.content, createdAt: res.data.post.createdAt, author: res.data.post.author, userId: res.data.post.userId }, ...prev]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rewarding forum post');
    }
    setLoading(false);
  };

  const handleReply = async (postId) => {
    if (!replyText[postId]) return;
    const text = replyText[postId];
    setReplyText(prev => ({ ...prev, [postId]: '' }));
    try {
      const res = await createForumReply(postId, userId, text, token);
      // refresh replies for this post
      const repliesRes = await getForumReplies(postId, token);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, replies: repliesRes.data } : p));
    } catch (err) {
      // restore on failure
      setReplyText(prev => ({ ...prev, [postId]: text }));
    }
  };

  const loadReplies = async (postId) => {
    try {
      const res = await getForumReplies(postId, token);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, replies: res.data } : p));
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
      <h2 className="text-3xl font-extrabold text-blue-600 mb-4 text-center">Group Chat</h2>
      <div className="text-sm text-slate-500 mb-4 text-center">Messages appear below. Share your thoughts and help your peers.</div>
      <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-xl p-4 bg-slate-50">
        <ul className="space-y-3">
          {posts.map(p => (
            <li key={p._id} className="flex items-start gap-3">
              <div className="shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {String(p.author || 'A').slice(0,1).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">{p.author} • {new Date(p.createdAt).toLocaleString()}</div>
                <div className="inline-block bg-white border border-slate-200 rounded-2xl px-4 py-2 text-slate-800 whitespace-pre-wrap shadow-sm">
                  {p.content}
                </div>
                <div className="mt-2">
                  <button onClick={() => loadReplies(p._id)} className="text-xs text-blue-600 hover:underline">{p.replies ? 'Refresh replies' : 'View replies'}</button>
                </div>
                {p.replies && (
                  <ul className="mt-3 space-y-2">
                    {p.replies.map(r => (
                      <li key={r._id} className="ml-8">
                        <div className="text-xs text-slate-500 mb-1">{r.author} • {new Date(r.createdAt).toLocaleString()}</div>
                        <div className="inline-block bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2 text-slate-800 whitespace-pre-wrap">
                          {r.content}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 ml-8 flex items-center gap-2">
                  <input
                    className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Write a reply..."
                    value={replyText[p._id] || ''}
                    onChange={e => setReplyText(prev => ({ ...prev, [p._id]: e.target.value }))}
                  />
                  <button onClick={() => handleReply(p._id)} className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">Reply</button>
                </div>
              </div>
            </li>
          ))}
          {posts.length === 0 && (
            <li className="text-sm text-slate-500">No messages yet. Be the first to start the chat!</li>
          )}
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <textarea
          className="border border-slate-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          rows={3}
          placeholder="Type your message..."
          value={post}
          onChange={e => setPost(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Forum;
