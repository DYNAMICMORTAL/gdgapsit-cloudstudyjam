import { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Loader2, Mail, Users, Calendar, Type, AlignLeft, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminAnnouncementsPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [participantCount, setParticipantCount] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'info',
    title: '',
    message: '',
    details: '',
    sendEmail: true,
    testMode: true, // Start in test mode
  });

  // Fetch participant count
  useEffect(() => {
    fetchParticipantCount();
  }, []);

  const fetchParticipantCount = async () => {
    try {
      const { count, error } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setParticipantCount(count || 0);
    } catch (error) {
      console.error('Error fetching participant count:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate form
      if (!formData.title.trim() || !formData.message.trim()) {
        throw new Error('Title and message are required');
      }

      // Create announcement in Supabase
      const { data: announcement, error: insertError } = await supabase
        .from('announcements')
        .insert([
          {
            type: formData.type,
            title: formData.title,
            message: formData.message,
            details: formData.details || null,
            author: 'GDG APSIT Admin',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setMessage({
        type: 'success',
        text: `✅ Announcement created successfully! (ID: ${announcement.id})`,
      });

      // Send emails if enabled
      if (formData.sendEmail) {
        setSending(true);
        await sendEmails(announcement);
      }

      // Reset form
      setFormData({
        type: 'info',
        title: '',
        message: '',
        details: '',
        sendEmail: true,
        testMode: true,
      });

    } catch (error) {
      console.error('Error creating announcement:', error);
      setMessage({
        type: 'error',
        text: `❌ Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
      setSending(false);
    }
  };

  const sendEmails = async (announcement) => {
    try {
      // Get recipients based on test mode
      let recipients = [];
      
      if (formData.testMode) {
        // Test mode: only send to test email
        recipients = [{ email: 'aminvasudev6@gmail.com', full_name: 'Test User' }];
      } else {
        // Production mode: fetch all participant emails
        const { data, error } = await supabase
          .from('participants')
          .select('email, full_name')
          .not('email', 'is', null);
        
        if (error) throw error;
        recipients = data || [];
      }

      // Call the edge function to send emails
      const { data, error } = await supabase.functions.invoke('send-announcement-emails', {
        body: {
          announcement: {
            id: announcement.id,
            type: announcement.type,
            title: announcement.title,
            message: announcement.message,
            details: announcement.details,
          },
          recipients,
          testMode: formData.testMode,
        },
      });

      if (error) throw error;

      setMessage((prev) => ({
        ...prev,
        text: prev.text + ` 📧 Emails sent to ${recipients.length} recipient(s)`,
      }));

    } catch (error) {
      console.error('Error sending emails:', error);
      setMessage((prev) => ({
        ...prev,
        text: prev.text + ` ⚠️ Email sending failed: ${error.message}`,
      }));
    }
  };

  const typeOptions = [
    { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-800', icon: '📚' },
    { value: 'important', label: 'Important', color: 'bg-red-100 text-red-800', icon: '🚀' },
    { value: 'deadline', label: 'Deadline', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
    { value: 'success', label: 'Success', color: 'bg-green-100 text-green-800', icon: '🎉' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Send className="w-8 h-8 text-blue-600" />
                Create Announcement
              </h1>
              <p className="text-gray-600 mt-2">
                Send announcements to all Study Jam participants
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">{participantCount}</span>
              </div>
              <p className="text-sm text-gray-500">Total Participants</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <p
              className={
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Announcement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Announcement Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: option.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 🚀 Study Jam Week 4 Begins!"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" />
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write the main announcement message here..."
              rows={4}
              required
            />
          </div>

          {/* Details (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" />
              Additional Details (Optional)
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add more details, links, or instructions..."
              rows={3}
            />
          </div>

          {/* Email Options */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, sendEmail: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Send email notifications
                </span>
              </label>
            </div>

            {formData.sendEmail && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.testMode}
                    onChange={(e) =>
                      setFormData({ ...formData, testMode: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-yellow-900">
                      Test Mode (Recommended)
                    </span>
                    <p className="text-sm text-yellow-700 mt-1">
                      {formData.testMode
                        ? '📧 Email will be sent only to mihiramin.cloud@gmail.com for testing'
                        : `⚠️ WARNING: Email will be sent to ALL ${participantCount} participants!`}
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || sending}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {sending ? 'Sending Emails...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publish Announcement
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Announcement will be saved to Supabase database</li>
                  <li>It will appear on the public Announcements page instantly</li>
                  <li>If email is enabled, participants will receive email notifications</li>
                  <li>Use Test Mode first to verify email content</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
