"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ReputationBadge } from "@/components/creator/ReputationBadge";
import { useComments, usePostComment } from "@/hooks/useLaunch";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/utils";
import type { CommentData } from "@/types";

interface CommentsSectionProps {
  tokenAddress: string;
}

export function CommentsSection({ tokenAddress }: CommentsSectionProps) {
  const { isAuthenticated } = useAuth();
  const { data: commentsData, isLoading } = useComments(tokenAddress);
  const postComment = usePostComment(tokenAddress);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    postComment.mutate(
      { text: newComment },
      { onSuccess: () => setNewComment("") }
    );
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    postComment.mutate(
      { text: replyText, parentCommentId: parentId },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyingTo(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Discussion
        {commentsData?.total ? (
          <span className="ml-2 text-sm font-normal text-zinc-500">
            ({commentsData.total})
          </span>
        ) : null}
      </h3>

      {/* New comment input */}
      {isAuthenticated && (
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this launch..."
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-surface-0 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-wazabi-500 focus:outline-none resize-none"
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                loading={postComment.isPending}
                disabled={!newComment.trim()}
                onClick={handleSubmitComment}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="rounded-lg border border-zinc-800 bg-surface-1 p-4 text-center text-sm text-zinc-400">
          Connect your wallet to join the discussion.
        </div>
      )}

      {/* Comments list */}
      {isLoading && (
        <div className="text-sm text-zinc-400">Loading comments...</div>
      )}

      {commentsData?.data.length === 0 && !isLoading && (
        <div className="text-center text-sm text-zinc-500 py-6">
          No comments yet. Start the conversation.
        </div>
      )}

      <div className="space-y-4">
        {commentsData?.data.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyingTo={replyingTo}
            replyText={replyText}
            onReplyClick={(id) => {
              setReplyingTo(replyingTo === id ? null : id);
              setReplyText("");
            }}
            onReplyTextChange={setReplyText}
            onSubmitReply={handleSubmitReply}
            isSubmitting={postComment.isPending}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  replyingTo,
  replyText,
  onReplyClick,
  onReplyTextChange,
  onSubmitReply,
  isSubmitting,
  isAuthenticated,
  depth = 0,
}: {
  comment: CommentData;
  replyingTo: string | null;
  replyText: string;
  onReplyClick: (id: string) => void;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (parentId: string) => void;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  depth?: number;
}) {
  return (
    <div className={depth > 0 ? "ml-8 border-l border-zinc-800 pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar
          src={comment.avatarUrl}
          alt={comment.displayName || "User"}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200">
              {comment.displayName || "Anonymous"}
            </span>
            <ReputationBadge score={comment.reputationScore} size="sm" />
            <span className="text-xs text-zinc-500">{timeAgo(comment.createdAt)}</span>
            {comment.editedAt && (
              <span className="text-xs text-zinc-600">(edited)</span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">{comment.body}</p>

          {isAuthenticated && depth < 2 && (
            <button
              onClick={() => onReplyClick(comment.id)}
              className="mt-1 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Reply
            </button>
          )}

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-2">
              <textarea
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full rounded-lg border border-zinc-700 bg-surface-0 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-wazabi-500 focus:outline-none resize-none"
              />
              <div className="mt-1 flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => onReplyClick(comment.id)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={isSubmitting}
                  disabled={!replyText.trim()}
                  onClick={() => onSubmitReply(comment.id)}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  onReplyClick={onReplyClick}
                  onReplyTextChange={onReplyTextChange}
                  onSubmitReply={onSubmitReply}
                  isSubmitting={isSubmitting}
                  isAuthenticated={isAuthenticated}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
