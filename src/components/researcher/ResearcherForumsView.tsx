import { useState, useEffect } from 'react';
import { Plus, Send, User } from 'lucide-react';
import { supabase, Forum, ForumPost, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type PostWithProfile = ForumPost & {
  profiles: Profile;
};

export default function ResearcherForumsView() {
  const { profile } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [showNewForum, setShowNewForum] = useState(false);
  const [newForumName, setNewForumName] = useState('');
  const [newForumDesc, setNewForumDesc] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchForums();
  }, []);

  useEffect(() => {
    if (selectedForum) {
      fetchPosts(selectedForum.id);
    }
  }, [selectedForum]);

  const fetchForums = async () => {
    const { data } = await supabase
      .from('forums')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setForums(data);
      setSelectedForum(data[0]);
    }
  };

  const fetchPosts = async (forumId: string) => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles(*)')
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data as PostWithProfile[]);
    }
  };

  const createForum = async () => {
    if (!profile) return;

    await supabase.from('forums').insert({
      name: newForumName,
      description: newForumDesc,
      created_by: profile.id,
    });

    setNewForumName('');
    setNewForumDesc('');
    setShowNewForum(false);
    fetchForums();
  };

  const replyToPost = async (postId: string) => {
    if (!profile || !replyContent[postId]?.trim()) return;

    await supabase.from('forum_replies').insert({
      post_id: postId,
      user_id: profile.id,
      content: replyContent[postId],
    });

    setReplyContent({ ...replyContent, [postId]: '' });
    if (selectedForum) fetchPosts(selectedForum.id);
  };

  return (
    <div className="flex h-[600px]">
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Forums</h3>
          <button
            onClick={() => setShowNewForum(true)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {forums.map((forum) => (
            <button
              key={forum.id}
              onClick={() => setSelectedForum(forum)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedForum?.id === forum.id
                  ? 'bg-green-100 text-green-900'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium">{forum.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedForum && (
          <>
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedForum.name}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-6">
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

                    <div className="ml-14 mt-4">
                      <textarea
                        value={replyContent[post.id] || ''}
                        onChange={(e) =>
                          setReplyContent({
                            ...replyContent,
                            [post.id]: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Write your reply..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                      />
                      <button
                        onClick={() => replyToPost(post.id)}
                        disabled={!replyContent[post.id]?.trim()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showNewForum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Create New Forum
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newForumName}
                onChange={(e) => setNewForumName(e.target.value)}
                placeholder="Forum name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <textarea
                value={newForumDesc}
                onChange={(e) => setNewForumDesc(e.target.value)}
                rows={3}
                placeholder="Forum description"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewForum(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createForum}
                disabled={!newForumName.trim()}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
