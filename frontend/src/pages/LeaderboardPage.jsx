import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, Medal, Award, Search, RefreshCw, ChevronUp, ChevronDown, 
  TrendingUp, Calendar, Users, Target, ExternalLink, Filter, X
} from 'lucide-react';
import { format } from 'date-fns';

export default function LeaderboardPage() {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterMinBadges, setFilterMinBadges] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
      setFilteredParticipants(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Search and filter logic
  useEffect(() => {
    let filtered = [...participants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Badge filter
    if (filterMinBadges > 0) {
      filtered = filtered.filter(p => (p.total_badges || 0) >= filterMinBadges);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'full_name' || sortField === 'email') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredParticipants(filtered);
  }, [searchTerm, filterMinBadges, sortField, sortDirection, participants]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' };
    if (rank === 3) return { icon: Award, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { icon: null, color: 'text-gray-600', bg: 'bg-white', border: 'border-gray-200' };
  };

  const getBadgeLevel = (count) => {
    if (count >= 15) return { label: 'Expert', color: 'bg-purple-100 text-purple-700 border-purple-300' };
    if (count >= 10) return { label: 'Advanced', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    if (count >= 5) return { label: 'Intermediate', color: 'bg-green-100 text-green-700 border-green-300' };
    if (count >= 1) return { label: 'Beginner', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { label: 'New', color: 'bg-gray-100 text-gray-600 border-gray-300' };
  };

  const stats = {
    total: participants.length,
    totalBadges: participants.reduce((sum, p) => sum + (p.total_badges || 0), 0),
    active: participants.filter(p => (p.total_badges || 0) > 0).length,
    avgBadges: participants.length > 0 
      ? (participants.reduce((sum, p) => sum + (p.total_badges || 0), 0) / participants.length).toFixed(1)
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-blue-600" />
                Leaderboard
              </h1>
              <p className="text-gray-600 mt-1">Cloud Study Jam 2025 Rankings</p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(lastUpdated, 'MMM dd, HH:mm')}
                </div>
              )}
              <button
                onClick={fetchLeaderboard}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Badges</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBadges}</p>
                </div>
                <Award className="w-10 h-10 text-green-500 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Learners</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Avg. Badges</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgBadges}</p>
                </div>
                <Target className="w-10 h-10 text-orange-500 opacity-80" />
              </div>
            </div>
          </div> */}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
                showFilters || filterMinBadges > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {filterMinBadges > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">1</span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Min. Badges:</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filterMinBadges}
                  onChange={(e) => setFilterMinBadges(Number(e.target.value))}
                  className="flex-1 max-w-xs"
                />
                <span className="text-sm font-medium text-gray-900 min-w-[3rem]">{filterMinBadges}+</span>
                {filterMinBadges > 0 && (
                  <button
                    onClick={() => setFilterMinBadges(0)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(searchTerm || filterMinBadges > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
              Showing {filteredParticipants.length} of {participants.length} participants
            </div>
          )}
        </div>

        {/* Top 3 Highlight */}
        {participants.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {participants.slice(0, 3).map((participant, idx) => {
              const rankBadge = getRankBadge(participant.rank);
              const RankIcon = rankBadge.icon;
              // const badgeLevel = getBadgeLevel(participant.total_badges || 0);

              return (
                <div
                  key={participant.id}
                  className={`bg-white rounded-xl border-2 p-6 ${rankBadge.border} hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${rankBadge.bg} ${rankBadge.border} border`}>
                      <RankIcon className={`w-7 h-7 ${rankBadge.color}`} />
                    </div>
                    {/* <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${badgeLevel.color}`}>
                      {badgeLevel.label}
                    </div> */}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{participant.full_name}</h3>
                  <p className="text-sm text-gray-600 mb-4 truncate">{participant.email}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{participant.total_badges || 0}</p>
                      <p className="text-xs text-gray-600">Badges Earned</p>
                    </div>
                    <a
                      href={participant.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('rank')}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                    >
                      Rank
                      {sortField === 'rank' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('full_name')}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                    >
                      Participant
                      {sortField === 'full_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleSort('total_badges')}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 mx-auto"
                    >
                      Badges
                      {sortField === 'total_badges' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParticipants.map((participant) => {
                  const rankBadge = getRankBadge(participant.rank);
                  const RankIcon = rankBadge.icon;
                  const badgeLevel = getBadgeLevel(participant.total_badges || 0);
                  const maxBadges = Math.max(...participants.map(p => p.total_badges || 0));
                  const progress = maxBadges > 0 ? ((participant.total_badges || 0) / maxBadges) * 100 : 0;

                  return (
                    <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {RankIcon ? (
                            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${rankBadge.bg} ${rankBadge.border} border`}>
                              <RankIcon className={`w-5 h-5 ${rankBadge.color}`} />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 border border-gray-200">
                              <span className="text-sm font-bold text-gray-700">#{participant.rank}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{participant.full_name}</div>
                          <div className="text-sm text-gray-600">{participant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-gray-900">{participant.total_badges || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${badgeLevel.color}`}>
                            {badgeLevel.label}
                          </span>
                          <div className="mt-2 w-32 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={participant.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredParticipants.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
