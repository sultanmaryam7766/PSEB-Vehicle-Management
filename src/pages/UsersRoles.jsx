import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UsersRoles.css";
import NotificationBell from "../components/NotificationBell";
function UsersRoles() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const token = localStorage.getItem("token");
const userName =
  user?.name ||
  "User";

const userInitials =
  userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "Operator",
  });

  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (role !== "Administrator") {
      if (role === "Operator") {
        navigate("/operator-dashboard");
      } else if (role === "Viewer") {
        navigate("/viewer-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [navigate, role, user]);

  const loadUsers = useCallback(async () => {
    if (role !== "Administrator") {
      return;
    }

    setLoadingUsers(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to load users");
        return;
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("Load users error:", err);
      setError("Unable to connect to server");
    } finally {
      setLoadingUsers(false);
    }
  }, [navigate, role, token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Vehicle History", path: "/vehicle-history" },
    { name: "Drivers", path: "/drivers" },
    { name: "Trips", path: "/trips" },
    { name: "Fuel", path: "/fuel" },
    { name: "Maintenance", path: "/maintenance" },
    { name: "Documents", path: "/documents" },
    { name: "Incidents", path: "/incidents" },
    { name: "Expenses", path: "/expenses" },
    { name: "Reports", path: "/reports" },
    { name: "Users & Roles", path: "/users-roles" },
    { name: "Audit Log", path: "/audit-log" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAddUser = () => {
    navigate("/add-user");
  };

  const getPermissionText = (userRole) => {
    if (userRole === "Administrator") {
      return "Full Access";
    }

    if (userRole === "Operator") {
      return "Operational Access";
    }

    if (userRole === "Viewer") {
      return "Read Only";
    }

    return "--";
  };

  /* EDIT USER */

  const handleEditUser = (account) => {
    setError("");
    setSuccess("");
    setResettingUser(null);
    setNewPassword("");

    setEditingUser(account);

    setEditForm({
      name: account.name,
      email: account.email,
      department: account.department || "",
      role: account.role,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUser) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update user");
        return;
      }

      setSuccess("User updated successfully");
      setEditingUser(null);

      await loadUsers();
    } catch (err) {
      console.error("Update user error:", err);
      setError("Unable to connect to server");
    }
  };

  /* ACTIVE / INACTIVE */

  const handleStatusChange = async (account) => {
    if (account.id === user.id) {
      setError("You cannot deactivate your own account.");
      return;
    }

    const newStatus =
      account.status === "Active"
        ? "Inactive"
        : "Active";

    const confirmed = window.confirm(
      `Change ${account.name} to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setResettingUser(null);
    setNewPassword("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${account.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to update user status"
        );
        return;
      }

      setSuccess(data.message);

      await loadUsers();
    } catch (err) {
      console.error("Status update error:", err);
      setError("Unable to connect to server");
    }
  };

  /* RESET PASSWORD */

  const handleResetPasswordClick = (account) => {
    if (account.id === user.id) {
      setError(
        "Use the Change Password option for your own account."
      );
      return;
    }

    setError("");
    setSuccess("");
    setEditingUser(null);
    setNewPassword("");
    setResettingUser(account);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resettingUser) {
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${resettingUser.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to reset password"
        );
        return;
      }

      setSuccess("Password changed successfully");
      setResettingUser(null);
      setNewPassword("");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Unable to connect to server");
    }
  };

  if (!user || role !== "Administrator") {
    return null;
  }

  return (
    <div className="usersroles-page">
      <aside className="usersroles-sidebar">
       <div className="usersroles-welcome">

  <div className="usersroles-profile-avatar">
    {userInitials}
  </div>

  <div className="usersroles-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>
        <div className="usersroles-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                item.name === "Users & Roles"
                  ? "usersroles-menu-btn active"
                  : "usersroles-menu-btn"
              }
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <button
          className="usersroles-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="usersroles-content">
        <div className="usersroles-header">
          <h1>Users & Roles</h1>
        </div>

        <div className="usersroles-section-title">
          User Access Control
        </div>

        <div className="usersroles-actions">
          <button
            className="add-user-btn"
            onClick={handleAddUser}
          >
            + ADD USER
          </button>
        </div>

        {error && (
          <div className="usersroles-error">
            {error}
          </div>
        )}

        {success && (
          <div className="usersroles-success">
            {success}
          </div>
        )}

        <div className="usersroles-table-wrapper">
          <table className="usersroles-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Permission</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loadingUsers ? (
                <tr className="usersroles-empty-row">
                  <td colSpan="6">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr className="usersroles-empty-row">
                  <td colSpan="6">
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <div className="usersroles-user-cell">
                        <strong>
                          {account.name}
                        </strong>

                        <span>
                          {account.email}
                        </span>
                      </div>
                    </td>

                    <td>{account.role}</td>

                    <td>
                      {account.department || "--"}
                    </td>

                    <td>
                      {getPermissionText(account.role)}
                    </td>

                    <td>
                      <span
                        className={
                          account.status === "Active"
                            ? "user-status active"
                            : "user-status inactive"
                        }
                      >
                        {account.status}
                      </span>
                    </td>

                    <td>
                      <div className="usersroles-row-actions">
                        <button
                          className="user-edit-btn"
                          onClick={() =>
                            handleEditUser(account)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="user-status-btn"
                          disabled={account.id === user.id}
                          onClick={() =>
                            handleStatusChange(account)
                          }
                        >
                          {account.status === "Active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          className="user-reset-btn"
                          disabled={account.id === user.id}
                          onClick={() =>
                            handleResetPasswordClick(account)
                          }
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <div className="usersroles-edit-box">
            <h3>Edit User</h3>

            <form onSubmit={handleUpdateUser}>
              <div className="usersroles-edit-grid">
                <div>
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div>
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div>
                  <label>Department</label>

                  <input
                    type="text"
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                  />
                </div>

                <div>
                  <label>Role</label>

                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                  >
                    <option value="Administrator">
                      Administrator
                    </option>

                    <option value="Operator">
                      Operator
                    </option>

                    <option value="Viewer">
                      Viewer
                    </option>
                  </select>
                </div>
              </div>

              <div className="usersroles-edit-actions">
                <button
                  type="submit"
                  className="save-user-btn"
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={() =>
                    setEditingUser(null)
                  }
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {resettingUser && (
          <div className="usersroles-edit-box">
            <h3>
              Reset Password - {resettingUser.name}
            </h3>

            <form onSubmit={handleResetPassword}>
              <div className="usersroles-edit-grid">
                <div>
                  <label>New Password</label>

                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="usersroles-edit-actions">
                <button
                  type="submit"
                  className="save-user-btn"
                >
                  SAVE PASSWORD
                </button>

                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={() => {
                    setResettingUser(null);
                    setNewPassword("");
                  }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default UsersRoles;