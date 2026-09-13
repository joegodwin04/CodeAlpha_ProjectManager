import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { Send, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * TaskComments
 * Renders a threaded comment list for a task and posts new comments.
 * Receives real-time `commentAdded` / `commentDeleted` events from the
 * project Socket.IO room (already joined by the parent page).
 *
 * Props:
 *  taskId   – UUID of the task whose comments are shown
 *  currentUser – user object from AuthContext { id, name, ... }
 */
const TaskComments = ({ taskId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // ── Fetch comments on mount / taskId change ───────────────────────────────
  useEffect(() => {
    if (!taskId) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/comments/task/${taskId}`);
        setComments(data);
      } catch (err) {
        console.error('[TaskComments] Failed to load comments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [taskId]);

  // ── Real-time comment events ──────────────────────────────────────────────
  useEffect(() => {
    if (!taskId) return;
    const socket = getSocket();

    const onCommentAdded = ({ comment, taskId: tid }) => {
      if (tid !== taskId) return;
      setComments((prev) => {
        // Deduplicate in case current user already optimistically added it
        if (prev.some((c) => c.id === comment.id)) return prev;
        // Replace matching optimistic temp comment if socket arrives before HTTP resolve
        const tempIdx = prev.findIndex(
          (c) => c.id?.startsWith('temp-') && c.content === comment.content && c.author?.id === comment.author?.id
        );
        if (tempIdx !== -1) {
          const next = [...prev];
          next[tempIdx] = comment;
          return next;
        }
        return [...prev, comment];
      });
    };

    const onCommentDeleted = ({ commentId, taskId: tid }) => {
      if (tid !== taskId) return;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    };

    socket.on('commentAdded', onCommentAdded);
    socket.on('commentDeleted', onCommentDeleted);

    return () => {
      socket.off('commentAdded', onCommentAdded);
      socket.off('commentDeleted', onCommentDeleted);
    };
  }, [taskId]);

  // ── Auto-scroll to bottom on new comment ─────────────────────────────────
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  // ── Submit new comment ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    // Guard: currentUser must be available (it is passed from ProjectDetails
    // after the user is authenticated, but defend against edge cases).
    if (!currentUser?.id) {
      setError('You must be signed in to post a comment.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Optimistic UI: add a temp comment immediately
    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      author: { id: currentUser.id, name: currentUser.name, username: currentUser.username },
    };
    setComments((prev) => [...prev, tempComment]);
    setContent('');

    try {
      const { data } = await api.post(`/comments/task/${taskId}`, { content: trimmed });
      // Replace temp comment with real one from server (or clean up temp if socket event already added it)
      setComments((prev) => {
        if (prev.some((c) => c.id === data.id)) {
          return prev.filter((c) => c.id !== tempId);
        }
        return prev.map((c) => (c.id === tempId ? data : c));
      });
    } catch (err) {
      console.error('[TaskComments] Failed to post comment', err);
      setError('Failed to post comment. Please try again.');
      // Roll back optimistic add
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setContent(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete comment ────────────────────────────────────────────────────────
  const handleDelete = async (commentId) => {
    // Optimistic remove
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (err) {
      console.error('[TaskComments] Failed to delete comment', err);
      // Re-fetch to restore state
      const { data } = await api.get(`/comments/task/${taskId}`);
      setComments(data);
    }
  };

  // ── Avatar helper ─────────────────────────────────────────────────────────
  const avatar = (name) => (
    <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] font-bold text-white ring-1 ring-white/20">
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Comments</span>
        {comments.length > 0 && (
          <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment list */}
      <div className="max-h-64 overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-4">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => {
            const isOwn = comment.author?.id === currentUser?.id;
            const isTemp = comment.id?.startsWith('temp-');
            return (
              <div key={comment.id} className={`flex gap-2.5 ${isTemp ? 'opacity-60' : ''}`}>
                {avatar(comment.author?.name)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {comment.author?.name || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300 break-words leading-relaxed">
                    {comment.content}
                  </p>
                </div>
                {isOwn && !isTemp && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="flex-shrink-0 rounded p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete comment"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}

      {/* Post form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
        {avatar(currentUser?.name)}
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.09] bg-[#121526] px-3 py-2 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            maxLength={2000}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex-shrink-0 rounded p-1 text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors"
            aria-label="Post comment"
          >
            {submitting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Send className="h-3.5 w-3.5" />
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;
