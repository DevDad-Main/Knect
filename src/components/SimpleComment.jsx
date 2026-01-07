import { useState } from "react";
import moment from "moment";
import { ThumbsUp, Reply, UserIcon, ChevronDown, ChevronUp } from "lucide-react";
import { updateData } from "./utils";

function Comment({
  comment,
  onReply,
  depth = 0,
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likes, setLikes] = useState(comment.likes || 0);

  /* ---------------- LIKE (optimistic) ---------------- */
  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikes((l) => (isLiked ? l - 1 : l + 1));

    try {
      const data = await updateData(
        `v1/comments/toggle-like/${comment._id}`,
        {}
      );
      if (data) {
        setIsLiked(data.isLiked);
        setLikes(data.likes);
      }
    } catch {
      // optional rollback
    }
  };

  /* ---------------- REPLY ---------------- */
  const handleReplySubmit = () => {
    if (!replyText.trim()) return;

    onReply(comment._id, replyText);

    setReplyText("");
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const hasReplies = comment.replies?.length > 0;

  return (
    <div
      className={`
        flex gap-3 py-4
        ${depth > 0 ? "pl-6 relative" : ""}
      `}
    >
      {/* subtle nesting indicator */}
      {depth > 0 && (
        <span className="absolute left-2 top-0 bottom-0 w-px bg-secondary/40" />
      )}

      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.owner?.profile_photo ? (
          <img
            src={comment.owner.profile_photo}
            alt=""
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-tertiary" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium truncate">
            {comment.owner?.full_name}
          </span>
          <span className="text-tertiary text-xs">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>

        {/* Text */}
        <p className="text-sm leading-relaxed mt-1 break-words">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-6 mt-3 text-xs text-tertiary">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""
              }`}
          >
            <ThumbsUp className="w-4 h-4" />
            {likes > 0 && likes}
          </button>

          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-1"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-4 flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-tertiary" />
              </div>
            </div>

            <div className="flex-1">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="w-full bg-primary border border-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />

              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setShowReplyInput(false)}
                  className="text-xs text-tertiary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className="text-xs text-indigo-600 font-medium disabled:opacity-40"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Replies toggle */}
        {hasReplies && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="mt-3 flex items-center gap-1 text-xs text-indigo-500"
          >
            {showReplies ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide replies
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View {comment.replies.length} replies
              </>
            )}
          </button>
        )}

        {/* Replies */}
        {showReplies &&
          hasReplies &&
          comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
      </div>
    </div>
  );
}

export default Comment;
