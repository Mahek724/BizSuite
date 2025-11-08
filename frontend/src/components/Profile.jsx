import React, { useState, useEffect } from "react";
import "../assets/css/Profile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const API_BASE = "http://localhost:5000/api/profile";

const Profile = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [activityStats, setActivityStats] = useState({
    leadsHandled: 0,
    tasksCompleted: 0,
    notesAdded: 0,
  });
  const [notifications, setNotifications] = useState({
    taskAssignment: false,
    leadUpdates: false,
    deadlineReminders: false,
    emailAlerts: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const token = localStorage.getItem("token");

  // change-password form state
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");

  // date formatting helpers
  const formatYear = (isoOrDate) => {
    if (!isoOrDate) return "";
    const d = new Date(isoOrDate);
    if (isNaN(d)) return "";
    return d.getFullYear();
  };

  const formatDateTime = (isoOrDate) => {
    if (!isoOrDate) return "";
    const d = new Date(isoOrDate);
    if (isNaN(d)) return "";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Fetch profile data
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await res.json();
        if (user) {
          const derived = {
            ...user,
            memberSince:
              user.memberSince ||
              (user.createdAt ? formatYear(user.createdAt) : formatYear(user.created_at)),
            lastLogin:
              user.lastLogin ||
              user.last_login ||
              user.lastLoggedAt ||
              user.updatedAt ||
              null,
          };
          setProfileData(derived);
          if (user.notifications) {
  setNotifications(user.notifications);
}

        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }

      try {
        const res2 = await fetch(`${API_BASE}/activity-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stats = await res2.json();
        if (stats) setActivityStats(stats);
      } catch (err) {
        console.error("Error fetching activity stats:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  // ✅ Toast utility
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // ✅ Profile Update
  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        await fetch(`${API_BASE}/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: profileData.fullName,
            email: profileData.email,
          }),
        });
        showToastMessage("Profile updated successfully");
      } catch {
        showToastMessage("Error updating profile");
      }
    }
    setIsEditing(!isEditing);
  };

  // ✅ Avatar Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await fetch(`${API_BASE}/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      showToastMessage("Profile picture updated successfully");
      // refetch profile to get new avatar URL
      const res = await fetch(`${API_BASE}`, { headers: { Authorization: `Bearer ${token}` } });
      const user = await res.json();
      if (user) setProfileData((prev) => ({ ...prev, ...user }));
    } catch (err) {
      console.error("Avatar upload failed:", err);
      showToastMessage("Error uploading avatar");
    }
  };

  // ✅ Notifications Toggle
  const toggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await fetch(`${API_BASE}/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      showToastMessage("Notification preferences updated");
    } catch {
      showToastMessage("Failed to update notifications");
    }
  };

  // show inline change password form instead of prompt
  const openChangePasswordForm = () => {
    setChangeError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangeForm(true);
  };

  const cancelChangePassword = () => {
    setShowChangeForm(false);
    setChangeError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmitChangePassword = async (e) => {
    e?.preventDefault?.();
    setChangeError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangeError("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("New password must be at least 6 characters.");
      return;
    }

    setChangeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || "Failed to change password";
        setChangeError(msg);
      } else {
        showToastMessage(data.message || "Password updated");
        setShowChangeForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setChangeError("An error occurred. Please try again.");
    } finally {
      setChangeLoading(false);
    }
  };

 const handleLogout = () => {
    showToastMessage("Logging out...");
    setTimeout(() => {
      logout(true); // ✅ calls AuthContext logout with toast delay
    }, 800);
  };

  if (!isOpen || !profileData) return null;

  return (
    <div
      className="profile-modal-overlay"
      onClick={(e) => e.target.classList.contains("profile-modal-overlay") && onClose()}
    >
      <div className="profile-modal-container">
        <button className="profile-close-btn" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="profile-header">
          <h2 className="profile-title">My Profile</h2>
          <p className="profile-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="profile-body">
          <div className="row g-4">
            {/* LEFT SIDEBAR */}
            <div className="col-lg-4">
              <div className="profile-card profile-sidebar">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-wrapper">
                    {profileData.avatar ? (
                      <img
                        src={`${API_BASE.replace("/api/profile", "")}${profileData.avatar}`}
                        alt="avatar"
                        className="profile-avatar-img"
                      />
                    ) : (
                      <div className="profile-avatar">
                        {profileData.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}

                    <label htmlFor="avatar-upload" className="avatar-upload-btn" title="Upload avatar">
                      <i className="bi bi-upload"></i>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <h3 className="profile-name">{profileData.fullName}</h3>
                  <p className="profile-email">{profileData.email}</p>
                  <span className="profile-badge">{profileData.role}</span>
                </div>

                {/* Member Since / Last Login - styled like screenshot */}
                <div className="profile-info-section profile-info-membership">
                  <div className="profile-info-item membership-row">
                    <div className="info-label">Member Since</div>
                    <div className="info-value">
                      {profileData.memberSince || formatYear(profileData.createdAt)}
                    </div>
                  </div>

                  <div className="profile-info-item membership-row">
                    <div className="info-label">Last Login</div>
                    <div className="info-value">
                      {profileData.lastLogin
                        ? formatDateTime(profileData.lastLogin)
                        : profileData.last_login
                        ? formatDateTime(profileData.last_login)
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="col-lg-8">
              {/* Personal Info */}
              <div className="profile-card mb-4">
                <div className="card-header-flex">
                  <div className="card-header-title">
                    <i className="bi bi-person-circle"></i>
                    <h4>Personal Information</h4>
                  </div>
                  <button className="edit-btn" onClick={handleEditToggle}>
                    {isEditing ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="profile-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.fullName}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-envelope"></i> Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileData.email}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="profile-card mb-4">
                <div className="card-header-title">
                  <i className="bi bi-shield-lock"></i>
                  <h4>Security</h4>
                </div>

                {/* Change Password form inline (shows when showChangeForm === true) */}
                {!showChangeForm ? (
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">Change your account password</p>
                    <div className="d-flex justify-content-end">
                      <button className="change-password-btn" onClick={openChangePasswordForm}>
                        Change Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="change-password-form" onSubmit={handleSubmitChangePassword}>
                    <div className="form-row">
                      <label className="form-label">Current Password</label>
                      <div className="input-with-icon">
                        <input
                          type={showCurrent ? "text" : "password"}
                          className="form-control"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="eye-btn"
                          onClick={() => setShowCurrent((s) => !s)}
                          aria-label={showCurrent ? "Hide current password" : "Show current password"}
                        >
                          <i className={`bi ${showCurrent ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-row">
                      <label className="form-label">New Password</label>
                      <div className="input-with-icon">
                        <input
                          type={showNew ? "text" : "password"}
                          className="form-control"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="eye-btn"
                          onClick={() => setShowNew((s) => !s)}
                          aria-label={showNew ? "Hide new password" : "Show new password"}
                        >
                          <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-row">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-with-icon">
                        <input
                          type={showConfirm ? "text" : "password"}
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="eye-btn"
                          onClick={() => setShowConfirm((s) => !s)}
                          aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                        >
                          <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    {changeError && <div className="text-danger small mb-2">{changeError}</div>}

                    <div className="d-flex gap-2 justify-content-end mt-3">
                      <button
                        type="submit"
                        className="btn-update-password"
                        disabled={changeLoading}
                      >
                        {changeLoading ? "Updating..." : "Update Password"}
                      </button>
                      <button type="button" className="btn-cancel" onClick={cancelChangePassword}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Activity Summary */}
              <div className="activity-summary">
                <h4 className="activity-title">Activity Summary</h4>
                <div className="activity-stats">
                  <div className="stat-card">
                    <div className="stat-number">{activityStats.leadsHandled}</div>
                    <div className="stat-label">Leads Handled</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{activityStats.tasksCompleted}</div>
                    <div className="stat-label">Tasks Completed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{activityStats.notesAdded}</div>
                    <div className="stat-label">Notes Added</div>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="profile-card mb-4">
                <div className="card-header-title mb-3">
                  <i className="bi bi-bell"></i>
                  <h4>Notification Preferences</h4>
                </div>

                {Object.keys(notifications).map((key) => (
                  <div key={key} className="notification-item">
                    <div>
                      <h5 className="notification-title">{key.replace(/([A-Z])/g, " $1")}</h5>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications[key]}
                        onChange={() => toggleNotification(key)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <button className="logout-btn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>

        {showToast && (
          <div className="toast-notification">
            <i className="bi bi-check-circle-fill"></i>
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;