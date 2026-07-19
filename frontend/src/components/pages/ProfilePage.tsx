import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Calendar, LogOut, Edit2 } from "lucide-react";
import { useMember } from "@/context/AuthContext";
import { MemberProtectedRoute } from "../ui/member-protected-route";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

function ProfilePageContent() {
  const { member, actions } = useMember();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await actions.logout();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-cl-text">
          User Profile
        </h1>
        <p className="mt-2 text-cl-muted text-sm">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-cl-border bg-cl-surface p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="relative">
                <div className="h-28 w-28 rounded-full bg-cl-bg flex items-center justify-center border border-cl-border overflow-hidden">
                  {member?.profile?.photo?.url ? (
                    <Image
                      src={member.profile.photo.url}
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-cl-muted" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-cl-accent rounded-full hover:bg-cl-accent-hover transition-colors cursor-pointer">
                  <Edit2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
              <div className="text-center md:text-left">
                <h2 className="font-heading text-2xl font-semibold text-cl-text">
                  {member?.profile?.nickname ||
                    member?.contact?.firstName ||
                    "User"}
                </h2>
                <p className="mt-1 text-xs text-cl-muted">
                  {member?.profile?.title || "Member"}
                </p>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="flex-1 space-y-6">
              {/* Email */}
              <div className="border-b border-cl-border pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-cl-accent" />
                  <h3 className="text-[10px] font-semibold text-cl-muted uppercase tracking-wider">
                    Email Address
                  </h3>
                </div>
                <p className="text-cl-text text-sm">
                  {member?.loginEmail || "No email provided"}
                </p>
                {member?.loginEmailVerified && (
                  <p className="mt-1 text-xs text-cl-success font-medium font-mono-data">
                    ✓ Email verified
                  </p>
                )}
              </div>

              {/* Member Status */}
              <div className="border-b border-cl-border pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-cl-accent" />
                  <h3 className="text-[10px] font-semibold text-cl-muted uppercase tracking-wider">
                    Account Status
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      member?.status === "APPROVED"
                        ? "bg-cl-success"
                        : "bg-cl-accent"
                    }`}
                  />
                  <p className="text-cl-text text-sm capitalize">
                    {member?.status || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Join Date */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-cl-accent" />
                  <h3 className="text-[10px] font-semibold text-cl-muted uppercase tracking-wider">
                    Member Since
                  </h3>
                </div>
                <p className="text-cl-text text-sm">
                  {member?._createdDate
                    ? new Date(member._createdDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Date not available"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Actions Section */}
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="mb-6 font-heading text-xl font-semibold text-cl-text">
          Account Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings Card */}
          <Card className="border-cl-border bg-cl-surface p-6 sm:p-8 hover:border-cl-accent/30 transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-cl-accent/10 rounded-md">
                <Edit2 className="h-5 w-5 text-cl-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading text-lg font-semibold text-cl-text mb-1">
                  Edit Profile
                </h4>
                <p className="text-xs text-cl-muted mb-5">
                  Update your profile information, avatar, and preferences.
                </p>
                <button className="px-4 py-2 bg-cl-accent text-white text-xs font-semibold rounded-md hover:bg-cl-accent-hover transition-colors cursor-pointer">
                  Edit Settings
                </button>
              </div>
            </div>
          </Card>

          {/* Logout Card */}
          <Card className="border-cl-border bg-cl-surface p-6 sm:p-8 hover:border-cl-error/30 transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-cl-error/10 rounded-md">
                <LogOut className="h-5 w-5 text-cl-error" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading text-lg font-semibold text-cl-text mb-1">
                  Logout
                </h4>
                <p className="text-xs text-cl-muted mb-5">
                  Sign out of your account and end your session.
                </p>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-cl-error text-white text-xs font-semibold rounded-md hover:bg-cl-error/90 transition-colors cursor-pointer"
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
        className="mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-cl-border bg-cl-surface p-6 sm:p-8">
          <h3 className="mb-6 font-heading text-lg font-semibold text-cl-text">
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2.5 border-b border-cl-border">
              <span className="text-xs text-cl-muted">Last Login</span>
              <span className="text-xs text-cl-text font-mono-data">
                {member?.lastLoginDate
                  ? new Date(member.lastLoginDate).toLocaleDateString()
                  : "First login"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-cl-border">
              <span className="text-xs text-cl-muted">Account Created</span>
              <span className="text-xs text-cl-text font-mono-data">
                {member?._createdDate
                  ? new Date(member._createdDate).toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs text-cl-muted">Email Verified</span>
              <span
                className={`text-xs font-semibold ${
                  member?.loginEmailVerified
                    ? "text-cl-success"
                    : "text-cl-muted/65"
                }`}
              >
                {member?.loginEmailVerified ? "✓ Yes" : "✗ No"}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
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
