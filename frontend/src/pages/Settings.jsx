import React, { useState } from "react";
import "../assets/css/Settings.css";

const Settings = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@bizsuite.com",
      avatar: "J",
      role: "admin",
      status: "active",
      leads: 12,
      tasks: 8,
      clients: 15,
      joinDate: "Jan 15, 2025",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@bizsuite.com",
      avatar: "J",
      role: "staff",
      status: "active",
      leads: 8,
      tasks: 5,
      clients: 10,
      joinDate: "Feb 10, 2025",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@bizsuite.com",
      avatar: "M",
      role: "staff",
      status: "inactive",
      leads: 0,
      tasks: 0,
      clients: 0,
      joinDate: "Jan 20, 2025",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.williams@bizsuite.com",
      avatar: "S",
      role: "staff",
      status: "active",
      leads: 6,
      tasks: 4,
      clients: 8,
      joinDate: "Mar 1, 2025",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "staff",
    password: "",
  });

  const [editingUser, setEditingUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    status: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  function getInitials(name = "") {
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Export users
  const handleExport = () => {
    showToast("Exporting user data...");
    // TODO: implement actual export (CSV/Excel) if required
  };

  // Open Add User Modal
  const openAddUserModal = () => {
    setShowAddUserModal(true);
  };

  // Close Add User Modal
  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUser({ name: "", email: "", role: "staff", password: "" });
    setShowPassword(false);
  };

  // Add New User
  const addNewUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    const user = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.name.charAt(0).toUpperCase(),
      role: newUser.role,
      status: "active",
      leads: 0,
      tasks: 0,
      clients: 0,
      joinDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setUsers((prev) => [...prev, user]);
    closeAddUserModal();
    showToast("User added successfully!");
  };

  // View User
  const viewUser = (id) => {
    const u = users.find((x) => x.id === id);
    if (u) {
      setSelectedUser(u);
      setShowViewUserModal(true);
    }
  };

  // Close View User Modal
  const closeViewUserModal = () => {
    setShowViewUserModal(false);
    setSelectedUser(null);
  };

  // Edit User
  const editUser = (id) => {
    const u = users.find((x) => x.id === id);
    if (u) {
      setEditingUser({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
      });
      setShowEditUserModal(true);
    }
  };

  // Close Edit User Modal
  const closeEditUserModal = () => {
    setShowEditUserModal(false);
    setEditingUser({ id: "", name: "", email: "", role: "", status: "" });
  };

  // Save User Edit
  const saveUserEdit = () => {
    if (!editingUser.name || !editingUser.email) {
      showToast("Please fill in all fields", "error");
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
          avatar: editingUser.name.charAt(0).toUpperCase(),
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    closeEditUserModal();
    showToast("User updated successfully!");
  };

  // Delete User
  const deleteUser = (id) => {
    const u = users.find((x) => x.id === id);
    if (
      u &&
      window.confirm(`Are you sure you want to delete ${u.name}?`)
    ) {
      setUsers((prev) => prev.filter((x) => x.id !== id));
      showToast(`${u.name} has been deleted`, "error");
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-title">
          <h2>User Management</h2>
          <p>Manage team members and their roles</p>
        </div>
        <div className="header-actions-right">
          <button className="btn-export" onClick={handleExport}>
            <i className="fas fa-download" /> Export
          </button>
          <button className="btn-add-user" onClick={openAddUserModal}>
            <i className="fas fa-plus" /> Add User
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container-filter">
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div className="filter-dropdown">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="user-table-container">
        <div className="table-header-row">
          <div className="th-cell">USER</div>
          <div className="th-cell">ROLE</div>
          <div className="th-cell">STATUS</div>
          <div className="th-cell">WORK SUMMARY</div>
          <div className="th-cell">JOIN DATE</div>
          <div className="th-cell">ACTIONS</div>
        </div>

        <div className="user-table-body">
          {filteredUsers.length === 0 ? (
            <div className="no-users">No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="user-row">
                <div className="user-cell">
                  <div className="user-avatar-small">{user.avatar}</div>
                  <div className="user-details-cell">
                    <div className="user-name-cell">{user.name}</div>
                    <div className="user-email-cell">{user.email}</div>
                  </div>
                </div>
                <div>
                  <span className={`role-badge-cell ${user.role}`}>
                    {user.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className={`status-badge-cell ${user.status}`}>
                    {user.status
                      ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="work-summary-cell">
                  <div className="work-item-cell">
                    Leads: <strong>{user.leads}</strong>
                  </div>
                  <div className="work-item-cell">
                    Tasks: <strong>{user.tasks}</strong>
                  </div>
                  <div className="work-item-cell">
                    Clients: <strong>{user.clients}</strong>
                  </div>
                </div>
                <div>{user.joinDate}</div>
                <div className="actions-cell">
                  <button
                    className="action-btn-cell"
                    onClick={() => viewUser(user.id)}
                    aria-label={`View ${user.name}`}
                  >
                    <i className="fas fa-eye" />
                  </button>
                  <button
                    className="action-btn-cell"
                    onClick={() => editUser(user.id)}
                    aria-label={`Edit ${user.name}`}
                  >
                    <i className="fas fa-pencil-alt" />
                  </button>
                  <button
                    className="action-btn-cell delete"
                    onClick={() => deleteUser(user.id)}
                    aria-label={`Delete ${user.name}`}
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div
          className="modal show"
          onClick={(e) =>
            e.target.classList && e.target.classList.contains("modal") && closeAddUserModal()
          }
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="close-btn" onClick={closeAddUserModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group-modal">
                <label>
                  <i className="fas fa-user" /> Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group-modal">
                <label>
                  <i className="fas fa-envelope" /> Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group-modal">
                <label>
                  <i className="fas fa-user-circle" /> Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group-modal">
                <label>
                  <i className="fas fa-lock" /> Password
                </label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary-modal" onClick={addNewUser}>
                Add User
              </button>
              <button className="btn-secondary-modal" onClick={closeAddUserModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Profile Modal */}
      {showViewUserModal && selectedUser && (
        <div
          className="modal show"
          onClick={(e) =>
            e.target.classList && e.target.classList.contains("modal") && closeViewUserModal()
          }
        >
          <div className="modal-content profile-modal">
            <div className="modal-header-simple">
              <h3>User Profile</h3>
              <button className="close-btn" onClick={closeViewUserModal}>
                &times;
              </button>
            </div>
            <div className="modal-body-profile">
              <div className="profile-avatar-large">{selectedUser.avatar}</div>
              <h2>{selectedUser.name}</h2>
              <p className="profile-email">{selectedUser.email}</p>

              <div className="profile-details">
                <div className="profile-detail-item">
                  <i className="fas fa-user-circle" />
                  <span className="detail-label">Role</span>
                  <span className="detail-value">
                    {selectedUser.role
                      ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <i className="fas fa-circle" />
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    {selectedUser.status
                      ? selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">Join Date</span>
                  <span className="detail-value">{selectedUser.joinDate}</span>
                </div>
              </div>

              <div className="work-summary-card">
                <h4>
                  <i className="fas fa-chart-line" /> Work Summary
                </h4>
                <div className="work-stats">
                  <div className="work-stat-item">
                    <div className="stat-number">{selectedUser.leads}</div>
                    <div className="stat-label">Leads</div>
                  </div>
                  <div className="work-stat-item">
                    <div className="stat-number">{selectedUser.tasks}</div>
                    <div className="stat-label">Tasks</div>
                  </div>
                  <div className="work-stat-item">
                    <div className="stat-number">{selectedUser.clients}</div>
                    <div className="stat-label">Clients</div>
                  </div>
                </div>
              </div>

              <div className="profile-contact">
                <i className="fas fa-envelope" />
                <span>{selectedUser.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div
          className="modal show"
          onClick={(e) =>
            e.target.classList && e.target.classList.contains("modal") && closeEditUserModal()
          }
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={closeEditUserModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group-modal">
                <label>
                  <i className="fas fa-user" /> Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group-modal">
                <label>
                  <i className="fas fa-envelope" /> Email Address
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group-modal">
                <label>
                  <i className="fas fa-user-circle" /> Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group-modal">
                <label>Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary-modal" onClick={saveUserEdit}>
                Save Changes
              </button>
              <button className="btn-secondary-modal" onClick={closeEditUserModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type} show`}>
          <i
            className={`fas ${
              toast.type === "error" ? "fa-exclamation-circle" : "fa-check-circle"
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;