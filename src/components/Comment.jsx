import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  ChevronDown,
  ChevronUp,
  UserIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import moment from "moment";
import { updateData } from "./utils";

function Comment({ comment, onReply, level = 0 }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes || 0);

  // tiny pop animation flag
  const [pop, setPop] = useState(false);
  useEffect(() => {
    setPop(true);
    const t = setTimeout(() => setPop(false), 150);
    return () => clearTimeout(t);
  }, [isLiked, likes]);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const handleLikeComment = async (commentId) => {
    try {
      const data = await updateData(`v1/comments/toggle-like/${commentId}`, {});
      if (data) {
        setIsLiked(data.isLiked);
        setLikes(data.likes);
        window.dispatchEvent(new Event("refreshNotifications"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislikeComment = async (commentId) => {
    try {
      const data = await updateData(
        `v1/comments/toggle-dislike/${commentId}`,
        {},
      );
      if (data) {
        setIsDisliked(data.isDisliked);
        setDislikes(data.dislikes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const maxNestingLevel = 3;
  const isTooNested = level >= maxNestingLevel;
  const indentSize = level > 0 ? "ml-12 sm:ml-16" : "";

  return (
    <div className={`w-full ${indentSize}`}>
      {/* Thread line for visual connection */}
      {level > 0 && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-secondary -ml-8 sm:-ml-12"></div>
          {/* Thread dot */}
          <div className="absolute left-0 top-2 w-2 h-2 bg-secondary rounded-full -ml-9 sm:-ml-13"></div>
        </div>
      )}

      <div className="flex gap-3 w-full">
        {/* Avatar - consistent size regardless of nesting */}
        <div className="flex-shrink-0">
          {comment.owner?.profile_photo ? (
            <img
              src={comment.owner?.profile_photo}
              alt={comment.owner?.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-tertiary" />
            </div>
          )}
        </div>

        {/* Comment content - fixed width */}
        <div className="flex-1 min-w-0">
          {/* Comment card */}
          <div className="bg-primary rounded-xl border border-secondary p-4 hover:shadow-md transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-semibold text-primary text-base truncate">
                  {comment.owner?.full_name}
                </span>
                <span className="text-tertiary text-sm">•</span>
                <span className="text-tertiary text-sm whitespace-nowrap">
                  {moment(comment.createdAt).fromNow()}
                </span>
              </div>
            </div>

            {/* Comment text */}
            <p className="text-primary text-base leading-relaxed break-words mb-4">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isLiked 
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30" 
                    : "text-tertiary hover:text-primary hover:bg-secondary/50"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="font-medium">{likes || 0}</span>
              </button>

              <button
                onClick={() => handleDislikeComment(comment._id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isDisliked 
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30" 
                    : "text-tertiary hover:text-primary hover:bg-secondary/50"
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="font-medium">{dislikes || 0}</span>
              </button>

              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-secondary/50 transition-all"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-4 bg-primary/50 rounded-xl border border-secondary/50 p-4">
              <div className="flex gap-3 mb-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-tertiary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Replying to ${comment.owner?.full_name}...`}
                    className="w-full bg-primary border border-secondary rounded-lg px-3 py-2.5 text-base text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 ml-11">
                <button
                  onClick={() => setShowReplyInput(false)}
                  className="px-4 py-2 text-sm text-tertiary hover:text-primary transition-colors rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Replies section */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {!isTooNested && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-2 text-sm text-tertiary hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-secondary/50"
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </button>
              )}

              {/* Render replies */}
              {(showReplies || isTooNested) && (
                <div className={`mt-4 space-y-4 ${isTooNested ? 'opacity-75' : ''}`}>
                  {comment.replies.slice(0, isTooNested ? 2 : undefined).map((reply) => (
                    <Comment
                      key={reply._id}
                      comment={reply}
                      onReply={onReply}
                      level={level + 1}
                    />
                  ))}
                  {isTooNested && comment.replies.length > 2 && (
                    <div className="text-center py-3 text-tertiary text-sm bg-primary/50 rounded-lg border border-secondary/30">
                      Reply thread continues...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;
