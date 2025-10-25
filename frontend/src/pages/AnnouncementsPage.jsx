import { useState, useEffect } from 'react';
import { AlertCircle, Info, Calendar, CheckCircle, Bell, Clock, User, ChevronDown, ChevronUp, Loader2, RefreshCw, Filter, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

export default function AnnouncementsPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch announcements from Supabase
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to match component structure
      const transformedData = (data || []).map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        details: item.details,
        date: new Date(item.created_at),
        author: item.author || 'GDG APSIT Team',
      }));

      setAnnouncements(transformedData);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data if no announcements in database
  const mockAnnouncements = [
    // {
    //   id: 1,
    //   type: 'important',
    //   title: '🚀 Study Jam 2025 Kickoff!',
    //   message: 'Welcome to Google Cloud Study Jam 2025! Get ready to embark on an exciting learning journey. Complete your first lab this week to get started on the leaderboard!',
    //   details: 'This year we have over 200 participants and 15+ learning tracks. Join our community Discord for real-time support and networking. Remember, consistency is key - try to complete at least one lab per week!',
    //   date: new Date('2025-01-15'),
    //   author: 'GDG APSIT Team',
    // },
    // {
    //   id: 2,
    //   type: 'deadline',
    //   title: '⏰ Week 3 Milestone Approaching',
    //   message: 'Don\'t forget! The Week 3 milestone deadline is coming up. Complete at least 3 skill badges to stay on track for amazing prizes!',
    //   details: 'Participants who complete the milestone will receive: ✨ Exclusive GDG APSIT badge, 🎁 Priority access to workshops, 🏆 Bonus leaderboard points. Need help? Check our resources channel or attend the Sunday help session.',
    //   date: new Date('2025-01-22'),
    //   author: 'Program Coordinators',
    // },
    // {
    //   id: 3,
    //   type: 'success',
    //   title: '🎉 100+ Badges Milestone Achieved!',
    //   message: 'Amazing work everyone! Our community has collectively earned over 100 skill badges! Special shoutout to our top 10 learners!',
    //   details: 'This incredible achievement shows the dedication of our Study Jam community. Top performers will be featured in our monthly newsletter. Keep up the excellent work! 💪 Next milestone: 200 badges!',
    //   date: new Date('2025-01-20'),
    //   author: 'Community Managers',
    // },
    // {
    //   id: 4,
    //   type: 'info',
    //   title: '📚 New Learning Resources Added',
    //   message: 'Check out our newly added study materials and video tutorials for Cloud Architecture and Data Engineering tracks!',
    //   details: 'Resources include: 🎥 Video walkthroughs for complex labs, 📝 Cheat sheets for common GCP services, 💡 Best practices guides, 🔗 External learning links. Access them in the #resources channel on Discord.',
    //   date: new Date('2025-01-18'),
    //   author: 'Learning Team',
    // },
  ];

  // Use real data if available, otherwise use mock data
  const displayAnnouncements = announcements.length > 0 ? announcements : mockAnnouncements;
  
  const getTypeConfig = (type) => {
    switch (type) {
      case 'important':
        return {
          icon: AlertCircle,
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-600',
          hoverColor: 'hover:bg-red-100',
        };
      case 'info':
        return {
          icon: Info,
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-600',
          hoverColor: 'hover:bg-blue-100',
        };
      case 'deadline':
        return {
          icon: Clock,
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-600',
          hoverColor: 'hover:bg-orange-100',
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          badgeColor: 'bg-green-600',
          hoverColor: 'hover:bg-green-100',
        };
      default:
        return {
          icon: Info,
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          badgeColor: 'bg-gray-600',
          hoverColor: 'hover:bg-gray-100',
        };
    }
  };

  const filteredAnnouncements = filter === 'all'
    ? displayAnnouncements
    : displayAnnouncements.filter(a => a.type === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Announcements
                </h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with the latest news
                </p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchAnnouncements}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading announcements...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading announcements</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Filters and Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Filters */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filter by type</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'important', 'deadline', 'info'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filter === type
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'all' && '📋 All'}
                        {type === 'important' && '🚨 Important'}
                        {type === 'deadline' && '⏰ Deadlines'}
                        {type === 'info' && '💡 Info'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => {
                const config = getTypeConfig(announcement.type);
                const Icon = config.icon;
                const isExpanded = expandedId === announcement.id;

                return (
                  <div
                    key={announcement.id}
                    className={`bg-white rounded-lg border-2 ${config.borderColor} overflow-hidden transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${config.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`${config.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                                  {announcement.type}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {announcement.title}
                              </h3>
                            </div>
                          </div>

                          {/* Message */}
                          <p className="text-gray-700 text-base mb-4 leading-relaxed">
                            {announcement.message}
                          </p>

                          {/* Expandable Details */}
                          {announcement.details && isExpanded && (
                            <div className={`${config.bgColor} rounded-lg p-4 mb-4 border ${config.borderColor}`}>
                              <p className="text-gray-700 leading-relaxed">
                                {announcement.details}
                              </p>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(announcement.date, 'MMM dd, yyyy')}
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {announcement.author}
                              </div>
                            </div>

                            {announcement.details && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                                className={`flex items-center gap-2 text-sm font-medium ${config.iconColor} ${config.hoverColor} px-3 py-1.5 rounded-lg transition-colors`}
                              >
                                {isExpanded ? (
                                  <>
                                    Show Less <ChevronUp className="w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    Read More <ChevronDown className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredAnnouncements.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-600 mb-4">Try selecting a different filter to see more announcements</p>
                <button
                  onClick={() => setFilter('all')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show All Announcements
                </button>
              </div>
            )}

            {/* Footer Stats */}
            {filteredAnnouncements.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredAnnouncements.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{displayAnnouncements.length}</span> announcements
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
