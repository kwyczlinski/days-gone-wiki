import { useState } from "react";
import { useUserCtx } from "../../contexts/UserContext";

const API_URL = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;

export const CommentInput = ({ category, itemId, onCommentAdded }) => {
  const userCtx = useUserCtx();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!userCtx.isAuthenticated || !userCtx.user.userId || !userCtx.user.username ) {
    return (
      <div>
        <em>You must be logged in to post a comment.</em>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/comment`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: itemId,
          category,
          content,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to post comment.");
        setSubmitting(false);
        return;
      }
      setContent("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.log(err);
      setError("Error submitting comment.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={2}
        disabled={submitting}
      />
      <div>
        <button
          type="submit"
          disabled={
            !userCtx.isAuthenticated ||
            !userCtx.user.userId ||
            !content.trim() ||
            submitting
          }
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
      {error && (
        <div>{error}</div>
      )}
    </form>
  );
};


