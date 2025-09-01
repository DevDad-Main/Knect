import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import moment from "moment";

function Comment({ comment, onReply, level = 0 }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyInput(false);
    setShowReplies(true);
  };

  return (
    <div className={`flex ${level > 0 ? "ml-4" : ""} gap-2`}>
      {/* Content */}
      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
        {/* Header: Avatar + Username + Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={comment.owner?.profile_picture}
              alt={comment.owner?.full_name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-100 flex-shrink-0"
            />
            <p className="text-sm font-semibold text-gray-800">
              {comment.owner?.full_name}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            {moment(comment.createdAt).fromNow()}
          </p>
        </div>

        {/* Comment text */}
        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
          <button className="flex items-center gap-1 hover:text-indigo-600">
            <ThumbsUp className="w-4 h-4" />
            <span>{comment.likes || 0}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-rose-600">
            <ThumbsDown className="w-4 h-4" />
            <span>{comment.dislikes || 0}</span>
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-1 hover:text-green-600"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border rounded-full px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleReply}
              className="text-white bg-indigo-600 px-3 py-1 rounded-full text-sm hover:bg-indigo-700"
            >
              Post
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" /> Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" /> Show{" "}
                  {comment.replies.length} replies
                </>
              )}
            </button>

            {showReplies && (
              <div className="mt-2 space-y-2">
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    onReply={onReply}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;
