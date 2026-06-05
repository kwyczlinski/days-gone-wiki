import { useEffect } from "react";
import { Comment } from "./Comment";
import { CommentInput } from "./CommentInput";
import { useComments } from "../../hooks/useComments";

export const CommentsBox = ({ category, itemId }) => {
  const { comments, isLoading, reload } = useComments(category, itemId);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div>
      <CommentInput
        category={category}
        itemId={itemId}
        onCommentAdded={reload}
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
            onCommentEdited={reload}
          />
        ))
      )}
    </div>
  );
};