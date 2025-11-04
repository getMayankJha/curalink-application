import { useState, useEffect } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { supabase, Forum, ForumPost, ForumReply, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type PostWithDetails = ForumPost & {
  profiles: Profile;
  forum_replies: (ForumReply & { profiles: Profile })[];
};

export default function ForumsView() {
  const { profile } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForums();
  }, []);

  useEffect(() => {
    if (selectedForum) {
      fetchPosts(selectedForum.id);
    }
  }, [selectedForum]);

  const fetchForums = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('forums')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setForums(data);
      setSelectedForum(data[0]);
    }
    setLoading(false);
  };

  const fetchPosts = async (forumId: string) => {
    const { data } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles(*),
        forum_replies(*, profiles(*))
      `)
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data as PostWithDetails[]);
    }
  };

  const createPost = async () => {
    if (!profile || !selectedForum) return;

    await supabase.from('forum_posts').insert({
      forum_id: selectedForum.id,
      user_id: profile.id,
      title: newPostTitle,
      content: newPostContent,
      is_question: true,
    });

    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPost(false);
    fetchPosts(selectedForum.id);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading forums...</p>
      </div>
    );
  }

  if (forums.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No forums available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px]">
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forums</h3>
        <div className="space-y-2">
          {forums.map((forum) => (
            <button
              key={forum.id}
              onClick={() => setSelectedForum(forum)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedForum?.id === forum.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium">{forum.name}</div>
              {forum.description && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {forum.description}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedForum && (
          <>
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedForum.name}
                  </h2>
                  {selectedForum.description && (
                    <p className="text-gray-600 mt-1">
                      {selectedForum.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowNewPost(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask Question
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No posts yet. Be the first to ask a question!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {post.profiles.full_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-700">{post.content}</p>
                        </div>
                      </div>

                      {post.forum_replies && post.forum_replies.length > 0 && (
                        <div className="ml-14 space-y-4 mt-4 border-l-2 border-gray-200 pl-4">
                          {post.forum_replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div className="bg-green-200 w-8 h-8 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-green-800" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {reply.profiles.full_name || 'Researcher'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ask a Question
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="What would you like to know?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Details
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                  placeholder="Provide more details about your question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewPost(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
