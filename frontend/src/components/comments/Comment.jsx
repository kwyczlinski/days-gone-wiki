import React, { useState, useMemo, useCallback } from "react";
import { useUserCtx } from "../../contexts/UserContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export const Comment = ({
  comment_id,
  username,
  content,
  posted,
  edited,
  user_id,
  onCommentEdited,
}) => {
  const userCtx = useUserCtx();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canEdit = useMemo(
    () =>
      userCtx.userId &&
      (userCtx.userId === user_id || userCtx.rank === "admin"),
    [userCtx, user_id]
  );

  const handleEdit = useCallback(() => {
    setEditContent(content);
    setIsEditing(true);
    setError("");
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditContent(content);
    setError("");
  }, []);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/comment/${comment_id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error("Failed to delete comment.");
      }
      toast.success("Deleted comment");
      onCommentEdited();
    } catch (err) {
      toast.error("Error deleting comment.");
    } finally {
      setIsDeleting(false);
    }
  }, []);

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
        setError("");
        toast.success("Comment edited.");
        onCommentEdited();
      }
    } catch (err) {
      setError("Update failed.");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div>
        <span>{username}</span>
        <span>
          {new Date(posted).toLocaleString()}
          {edited && <span> (edited)</span>}
        </span>
        {canEdit && !isEditing && <button onClick={handleEdit}>Edit</button>}
        {canEdit && (
          <button onClick={handleDelete} disabled={isDeleting}>
            Delete
          </button>
        )}
      </div>
      {!isEditing ? (
        <div>{content}</div>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            disabled={submitting}
          />
          <div>
            <button type="submit" disabled={submitting || !editContent.trim()}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={handleCancel} disabled={submitting}>
              Cancel
            </button>
          </div>
          {error && <div>{error}</div>}
        </form>
      )}
    </div>
  );
};
