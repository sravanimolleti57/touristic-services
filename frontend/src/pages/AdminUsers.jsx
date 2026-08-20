import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import SearchAutocomplete from "../components/SearchAutocomplete";
import {
  FaUsers, FaSearch, FaUserShield, FaUser, FaTrashAlt,
  FaCheckCircle, FaUserCheck, FaCalendarAlt, FaEnvelope
} from "react-icons/fa";
import axios from "axios";

export default function AdminUsers() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/users");
      setUsersList(res.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    const ok = window.confirm(`Change role of ${user.name} (${user.email}) to "${newRole}"?`);
    if (!ok) return;

    setActionLoadingId(user._id);
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/users/${user._id}/role`, { role: newRole });
      setUsersList(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      alert(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user role.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.email === "admin@tourism.com") {
      alert("Cannot delete the primary system administrator account.");
      return;
    }

    const ok = window.confirm(`Are you sure you want to permanently delete user account: ${user.name} (${user.email})?`);
    if (!ok) return;

    setActionLoadingId(user._id);
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/users/${user._id}`);
      setUsersList(prev => prev.filter(u => u._id !== user._id));
      alert("User account deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u._id || "").toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" ? true : (u.role || "user").toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const totalAdmins = usersList.filter(u => u.role === "admin").length;
  const totalCustomers = usersList.filter(u => u.role !== "admin").length;

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        color: "#0F172A",
        padding: "100px 36px 60px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>

          {/* Header */}
          <div style={{
            marginBottom: 28, display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#2563EB", fontSize: 13, fontWeight: 800, marginBottom: 6
              }}>
                <FaUsers /> ACCOUNT &amp; PRIVILEGES DIRECTORY
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#0F172A" }}>
                User &amp; Roles Management
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Inspect registered user accounts, manage administrator privileges, and oversee system permissions.
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "10px 18px",
                borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
              }}>
                <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Total Users</span>
                <strong style={{ fontSize: 18, color: "#0F172A", fontWeight: 900 }}>{usersList.length}</strong>
              </div>

              <div style={{
                background: "#FFFFFF", border: "1px solid #BFDBFE", padding: "10px 18px",
                borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
              }}>
                <span style={{ fontSize: 11, color: "#2563EB", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Administrators</span>
                <strong style={{ fontSize: 18, color: "#2563EB", fontWeight: 900 }}>{totalAdmins}</strong>
              </div>

              <div style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "10px 18px",
                borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
              }}>
                <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Customers</span>
                <strong style={{ fontSize: 18, color: "#0F172A", fontWeight: 900 }}>{totalCustomers}</strong>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16,
            padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <div style={{ flex: "1 1 280px", maxWidth: 400 }}>
              <SearchAutocomplete
                value={search}
                onChange={setSearch}
                localData={usersList}
                searchFields={["name", "username", "email", "role", "id", "_id"]}
                placeholder="Search user by name, email, ID..."
                onSelect={(item, title) => {
                  setSearch(title);
                }}
                inputStyle={{
                  padding: "10px 14px 10px 38px",
                  borderRadius: 10,
                  background: "#F8FAFC",
                  borderColor: "#E2E8F0",
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {["all", "admin", "user"].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: roleFilter === r ? "#2563EB" : "#F1F5F9",
                    color: roleFilter === r ? "#FFFFFF" : "#64748B",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize",
                    transition: "all 0.2s"
                  }}
                >
                  {r === "all" ? "All Roles" : r === "admin" ? "Admins" : "Customers"}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20,
            overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>Loading user accounts...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>No users found matching your search.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700 }}>User</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700 }}>User ID</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700 }}>Email Address</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700 }}>Role / Access</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700 }}>Created Date</th>
                      <th style={{ padding: "14px 20px", textAlign: "center", fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isAdmin = u.role === "admin";
                      const isPrimaryAdmin = u.email === "admin@tourism.com";

                      return (
                        <tr key={u._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          {/* Name */}
                          <td style={{ padding: "16px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: isAdmin ? "linear-gradient(135deg, #2563EB, #3B82F6)" : "#F1F5F9",
                                color: isAdmin ? "#FFFFFF" : "#64748B",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800
                              }}>
                                {isAdmin ? <FaUserShield /> : <FaUser />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: "#0F172A" }}>{u.name}</div>
                                {isPrimaryAdmin && (
                                  <span style={{ fontSize: 10, color: "#2563EB", fontWeight: 700 }}>ROOT SYSTEM ADMIN</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* ID */}
                          <td style={{ padding: "16px 20px", fontFamily: "monospace", color: "#64748B" }}>
                            #{String(u._id).slice(-8)}
                          </td>

                          {/* Email */}
                          <td style={{ padding: "16px 20px", color: "#334155", fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <FaEnvelope size={11} color="#94A3B8" /> {u.email}
                            </div>
                          </td>

                          {/* Role Chip */}
                          <td style={{ padding: "16px 20px" }}>
                            <span style={{
                              padding: "4px 12px", borderRadius: 16, fontSize: 11, fontWeight: 800,
                              background: isAdmin ? "#EFF6FF" : "#F1F5F9",
                              color: isAdmin ? "#2563EB" : "#64748B",
                              border: isAdmin ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                              display: "inline-flex", alignItems: "center", gap: 4
                            }}>
                              {isAdmin ? <FaUserShield size={10} /> : <FaUser size={10} />}
                              {isAdmin ? "Administrator" : "Customer"}
                            </span>
                          </td>

                          {/* Created */}
                          <td style={{ padding: "16px 20px", color: "#64748B", fontSize: 12 }}>
                            {String(u.createdAt).slice(0, 10) || "2026-01-01"}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            {!isPrimaryAdmin ? (
                              <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <button
                                  onClick={() => handleToggleRole(u)}
                                  disabled={actionLoadingId === u._id}
                                  style={{
                                    padding: "6px 12px", borderRadius: 8, border: "1px solid #CBD5E1",
                                    background: "#FFFFFF", color: "#334155", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4
                                  }}
                                  title="Toggle User/Admin Role"
                                >
                                  <FaUserCheck size={11} color="#2563EB" />
                                  {isAdmin ? "Demote to User" : "Promote to Admin"}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={actionLoadingId === u._id}
                                  style={{
                                    padding: "6px 10px", borderRadius: 8, border: "1px solid #FCA5A5",
                                    background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer"
                                  }}
                                  title="Delete User"
                                >
                                  <FaTrashAlt size={11} />
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>Protected Account</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
