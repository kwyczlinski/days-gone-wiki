import React, { useState, useMemo, useCallback } from 'react';
import { useUserCtx } from '../../contexts/UserContext';

const API_URL = import.meta.env.VITE_API_URL;

export const Comment = ({ comment_id, username, content, posted, edited, user_id, onCommentEdited }) => {
  const userCtx = useUserCtx();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const canEdit = useMemo(() => userCtx.userId && (userCtx.userId === user_id || userCtx.rank === 'admin'), [userCtx, user_id])
  
  const handleEdit = useCallback(() => {
    setEditContent(content);
    setIsEditing(true);
    setError('');
  }, [])
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditContent(content);
    setError('');
  }, [])
 
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/comment/${comment_id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update comment.");
      } else {
        setIsEditing(false);
        setError('');
        if (onCommentEdited) onCommentEdited();
      }
    } catch (err) {
      setError("Update failed.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginBottom: "1em", padding: "0.5em", border: "1px #ccc solid", borderRadius: 4 }}>
      <div style={{ fontSize: "0.9em", color: "#666" }}>
        <span style={{ fontWeight: "bold" }}>{username}</span>
        <span style={{ marginLeft: 8 }}>
          {new Date(posted).toLocaleString()}
          {edited && <span> (edited)</span>}
        </span>
        {canEdit && !isEditing && (
          <button onClick={handleEdit} style={{ marginLeft: 16, fontSize: "0.8em" }}>
            Edit
          </button>
        )}
      </div>
      {!isEditing ? (
        <div style={{ marginTop: 5 }}>{content}</div>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={3}
            style={{ width: "100%", marginTop: 5 }}
            disabled={submitting}
          />
          <div style={{ marginTop: 4 }}>
            <button
              type="submit"
              disabled={submitting || !editContent.trim()}
              style={{ marginRight: 8 }}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={handleCancel} disabled={submitting}>
              Cancel
            </button>
          </div>
          {error && <div style={{ color: 'red', marginTop: 4 }}>{error}</div>}
        </form>
      )}
    </div>
  );
};