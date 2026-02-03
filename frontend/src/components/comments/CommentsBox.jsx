import React, { useEffect, useState, useCallback } from "react";
import { Comment } from "./Comment";
import { toast } from "react-toastify";
import { CommentInput } from "./CommentInput";

const API_URL = import.meta.env.VITE_API_URL;

export const CommentsBox = ({ category, itemId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/comment?category=${category}&itemId=${itemId}`
      );
      if (!res.ok) throw new Error("Not found");
      const result = await res.json();
      setComments(Array.isArray(result) ? result : []);
    } catch (err) {
      console.log(err);
      toast.warning("Failed to load comments");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, itemId]);

  useEffect(() => {
    fetchComments();
  }, [category, itemId]);

  return (
    <div>
      <CommentInput
        category={category}
        itemId={itemId}
        onCommentAdded={fetchComments}
      />
      {isLoading ? (
        <div>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div>No comments yet.</div>
      ) : (
        comments.map((comment) => (
          <Comment
            key={comment.id}
            comment_id={comment.id}
            user_id={comment.user_id}
            username={comment.username}
            content={comment.content}
            posted={comment.posted}
            edited={comment.edited}
            onCommentEdited={fetchComments}
          />
        ))
      )}
    </div>
  );
};
