import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut, Edit2 } from 'lucide-react';
import { useMember } from '../../../integrations';
import { MemberProtectedRoute } from '../ui/member-protected-route';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';

function ProfilePageContent() {
  const { member, actions } = useMember();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await actions.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="ml-0 px-8 py-16 md:ml-64">
        <div className="mx-auto max-w-[120rem]">
          {/* Page Header */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-5xl font-bold text-white">
              User Profile
            </h1>
            <p className="mt-4 font-paragraph text-lg text-foreground/70">
              Manage your account settings and preferences
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/10 bg-white/5 p-12 backdrop-blur-lg">
              <div className="flex flex-col md:flex-row gap-12">
                {/* Profile Avatar Section */}
                <div className="flex flex-col items-center md:items-start gap-6">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-neon-teal to-secondary flex items-center justify-center border-4 border-white/10">
                      {member?.profile?.photo?.url ? (
                        <Image src={member.profile.photo.url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-black" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-3 bg-neon-teal rounded-full hover:bg-neon-teal/90 transition-colors cursor-pointer">
                      <Edit2 className="h-4 w-4 text-black" />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="font-heading text-3xl font-bold text-white">
                      {member?.profile?.nickname || member?.contact?.firstName || 'User'}
                    </h2>
                    <p className="mt-2 font-paragraph text-sm text-foreground/60">
                      {member?.profile?.title || 'Member'}
                    </p>
                  </div>
                </div>

                {/* Profile Details Section */}
                <div className="flex-1 space-y-8">
                  {/* Email */}
                  <div className="border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="h-5 w-5 text-neon-teal" />
                      <h3 className="font-paragraph text-sm font-medium text-foreground/60 uppercase tracking-wider">
                        Email Address
                      </h3>
                    </div>
                    <p className="font-paragraph text-lg text-white">
                      {member?.loginEmail || 'No email provided'}
                    </p>
                    {member?.loginEmailVerified && (
                      <p className="mt-2 font-paragraph text-xs text-neon-teal">
                        ✓ Email verified
                      </p>
                    )}
                  </div>

                  {/* Member Status */}
                  <div className="border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="h-5 w-5 text-secondary" />
                      <h3 className="font-paragraph text-sm font-medium text-foreground/60 uppercase tracking-wider">
                        Account Status
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        member?.status === 'APPROVED' ? 'bg-neon-teal' : 'bg-secondary'
                      }`} />
                      <p className="font-paragraph text-lg text-white capitalize">
                        {member?.status || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <h3 className="font-paragraph text-sm font-medium text-foreground/60 uppercase tracking-wider">
                        Member Since
                      </h3>
                    </div>
                    <p className="font-paragraph text-lg text-white">
                      {member?._createdDate
                        ? new Date(member._createdDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Date not available'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-8 font-heading text-2xl font-bold text-white">
              Account Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Settings Card */}
              <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg hover:border-secondary/30 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Edit2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading text-xl font-bold text-white mb-2">
                      Edit Profile
                    </h4>
                    <p className="font-paragraph text-sm text-foreground/70 mb-6">
                      Update your profile information, avatar, and preferences.
                    </p>
                    <button className="px-4 py-2 bg-secondary text-black font-paragraph text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer">
                      Edit Settings
                    </button>
                  </div>
                </div>
              </Card>

              {/* Logout Card */}
              <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg hover:border-destructive/30 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <LogOut className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading text-xl font-bold text-white mb-2">
                      Logout
                    </h4>
                    <p className="font-paragraph text-sm text-foreground/70 mb-6">
                      Sign out of your account and end your session.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-destructive text-white font-paragraph text-sm font-medium rounded-lg hover:bg-destructive/90 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h3 className="mb-6 font-heading text-xl font-bold text-white">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="font-paragraph text-sm text-foreground/60">
                    Last Login
                  </span>
                  <span className="font-paragraph text-sm text-white">
                    {member?.lastLoginDate
                      ? new Date(member.lastLoginDate).toLocaleDateString()
                      : 'First login'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="font-paragraph text-sm text-foreground/60">
                    Account Created
                  </span>
                  <span className="font-paragraph text-sm text-white">
                    {member?._createdDate
                      ? new Date(member._createdDate).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-paragraph text-sm text-foreground/60">
                    Email Verified
                  </span>
                  <span className={`font-paragraph text-sm ${
                    member?.loginEmailVerified ? 'text-neon-teal' : 'text-foreground/60'
                  }`}>
                    {member?.loginEmailVerified ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <MemberProtectedRoute messageToSignIn="Sign in to access your profile">
      <ProfilePageContent />
     </MemberProtectedRoute> 
  );
}
