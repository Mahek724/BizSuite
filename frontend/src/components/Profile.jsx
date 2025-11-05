import React, { useState } from "react";
import "../assets/css/Profile.css"; // ← Updated path to assets folder
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Profile = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@bizsuite.com",
    memberSince: "2025",
    lastLogin: "Nov 3, 2025, 3:00 PM",
    role: "ADMIN",
    avatar: "J",
  });

  const [activityStats] = useState({
    leadsHandled: 45,
    tasksCompleted: 32,
    notesAdded: 28,
  });

  const [notifications, setNotifications] = useState({
    taskAssignment: true,
    leadUpdates: true,
    deadlineReminders: true,
    emailAlerts: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Handle modal close
  const handleClose = () => {
    onClose();
  };

  // Handle outside click
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("profile-modal-overlay")) {
      handleClose();
    }
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, handleClose]);

  // Toggle notification
  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    showToastMessage("Notification preference updated");
  };

  // Show toast
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle profile picture upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      showToastMessage("Profile picture updated successfully");
    }
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      showToastMessage("Profile updated successfully");
    }
  };

  // Handle password change
  const handleChangePassword = () => {
    showToastMessage("Password change link sent to your email");
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      showToastMessage("Logging out...");
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-modal-container">
        {/* Close Button */}
        <button className="profile-close-btn" onClick={handleClose}>
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Modal Header */}
        <div className="profile-header">
          <h2 className="profile-title">My Profile</h2>
          <p className="profile-subtitle">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Modal Body */}
        <div className="profile-body">
          <div className="row g-4">
            {/* Left Sidebar */}
            <div className="col-lg-4">
              <div className="profile-card profile-sidebar">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">{profileData.avatar}</div>
                    <label
                      htmlFor="avatar-upload"
                      className="avatar-upload-btn"
                    >
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

                <div className="profile-info-section">
                  <div className="profile-info-item">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">
                      {profileData.memberSince}
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <span className="info-label">Last Login</span>
                    <span className="info-value">{profileData.lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="col-lg-8">
              {/* Personal Information */}
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
                        setProfileData({
                          ...profileData,
                          fullName: e.target.value,
                        })
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
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="profile-card mb-4">
                <div className="card-header-title">
                  <i className="bi bi-shield-lock"></i>
                  <h4>Security</h4>
                </div>
                <button
                  className="change-password-btn"
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
              </div>

              {/* Activity Summary */}
              <div className="profile-card mb-4">
                <div className="activity-summary">
                  <h4 className="activity-title">Activity Summary</h4>
                  <div className="activity-stats">
                    <div className="stat-card stat-card-1">
                      <div className="stat-number">
                        {activityStats.leadsHandled}
                      </div>
                      <div className="stat-label">Leads Handled</div>
                    </div>
                    <div className="stat-card stat-card-2">
                      <div className="stat-number">
                        {activityStats.tasksCompleted}
                      </div>
                      <div className="stat-label">Tasks Completed</div>
                    </div>
                    <div className="stat-card stat-card-3">
                      <div className="stat-number">
                        {activityStats.notesAdded}
                      </div>
                      <div className="stat-label">Notes Added</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="profile-card mb-4">
                <div className="card-header-title mb-3">
                  <i className="bi bi-bell"></i>
                  <h4>Notification Preferences</h4>
                </div>

                <div className="notification-list">
                  <div className="notification-item">
                    <div>
                      <h5 className="notification-title">Task Assignment</h5>
                      <p className="notification-desc">
                        Get notified when a new task is assigned to you
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.taskAssignment}
                        onChange={() => toggleNotification("taskAssignment")}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div>
                      <h5 className="notification-title">Lead Updates</h5>
                      <p className="notification-desc">
                        Receive alerts for lead stage changes
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.leadUpdates}
                        onChange={() => toggleNotification("leadUpdates")}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div>
                      <h5 className="notification-title">Deadline Reminders</h5>
                      <p className="notification-desc">
                        Get reminders for upcoming task deadlines
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.deadlineReminders}
                        onChange={() => toggleNotification("deadlineReminders")}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div>
                      <h5 className="notification-title">Email Alerts</h5>
                      <p className="notification-desc">
                        Receive email notifications in addition to in-app alerts
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.emailAlerts}
                        onChange={() => toggleNotification("emailAlerts")}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button className="logout-btn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
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