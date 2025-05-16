import React, { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', email: '', role: '', password: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '' });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers for Add form input changes
  const handleAddChange = e => setAddForm({ ...addForm, [e.target.name]: e.target.value });

  // Add user submit
  const handleAddUser = async () => {
    if (!addForm.username || !addForm.email || !addForm.role || !addForm.password) {
      alert('Please fill all fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error('Failed to add user');
      setAddForm({ username: '', email: '', role: '', password: '' });
      setAddFormVisible(false);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Edit user handlers
  const startEdit = user => {
    setEditUserId(user.userId);
    setEditForm({ username: user.username, email: user.email, role: user.role });
  };
  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const cancelEdit = () => {
    setEditUserId(null);
    setEditForm({ username: '', email: '', role: '' });
  };

  const submitEdit = async () => {
    if (!editForm.username || !editForm.email || !editForm.role) {
      alert('Please fill all fields');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/users/${editUserId}`, {
        method: 'PUT', // You need to implement this on backend
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setEditUserId(null);
      setEditForm({ username: '', email: '', role: '' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete user
  const deleteUser = async id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Users</h2>
      {!addFormVisible && (
        <button style={styles.addButton} onClick={() => setAddFormVisible(true)}>
          + Add User
        </button>
      )}

      {/* Add User Form */}
      {addFormVisible && (
        <div style={styles.form}>
          <input
            name="username"
            placeholder="Username"
            value={addForm.username}
            onChange={handleAddChange}
            style={styles.input}
          />
          <input
            name="email"
            placeholder="Email"
            value={addForm.email}
            onChange={handleAddChange}
            style={styles.input}
            type="email"
          />
          <select
            name="role"
            value={addForm.role}
            onChange={handleAddChange}
            style={styles.input}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="secretary">Secretary</option>
          </select>
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={addForm.password}
            onChange={handleAddChange}
            style={styles.input}
          />
          <button style={styles.saveButton} onClick={handleAddUser}>
            Save
          </button>
          <button style={styles.cancelButton} onClick={() => setAddFormVisible(false)}>
            Cancel
          </button>
        </div>
      )}

      {loading && <p>Loading users...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && !error && users.length === 0 && <p>No users found.</p>}

      {users.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user =>
              editUserId === user.userId ? (
                <tr key={user.userId}>
                  <td style={styles.td}>{user.userId}</td>
                  <td style={styles.td}>
                    <input
                      name="username"
                      value={editForm.username}
                      onChange={handleEditChange}
                      style={styles.smallInput}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      style={styles.smallInput}
                      type="email"
                    />
                  </td>
                  <td style={styles.td}>
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleEditChange}
                      style={styles.smallInput}
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="secretary">Secretary</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.saveButton} onClick={submitEdit}>
                      Save
                    </button>
                    <button style={styles.cancelButton} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={user.userId}>
                  <td style={styles.td}>{user.userId}</td>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.role}</td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.actionButton, ...styles.editButton }}
                      onClick={() => startEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => deleteUser(user.userId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: '20px auto',
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  addButton: {
    padding: '8px 16px',
    marginBottom: 15,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 16,
  },
  form: {
    marginBottom: 15,
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    padding: 8,
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
    minWidth: 140,
  },
  smallInput: {
    padding: 6,
    fontSize: 14,
Radius: 4,
border: '1px solid #ccc',
width: '100%',
},
saveButton: {
backgroundColor: '#2196F3',
color: 'white',
border: 'none',
borderRadius: 4,
padding: '8px 16px',
cursor: 'pointer',
},
cancelButton: {
backgroundColor: '#f44336',
color: 'white',
border: 'none',
borderRadius: 4,
padding: '8px 16px',
cursor: 'pointer',
},
table: {
width: '100%',
borderCollapse: 'collapse',
},
th: {
textAlign: 'left',
padding: 10,
borderBottom: '2px solid #ddd',
backgroundColor: '#f2f2f2',
},
td: {
padding: 10,
borderBottom: '1px solid #ddd',
verticalAlign: 'middle',
},
actionButton: {
marginRight: 8,
padding: '6px 12px',
border: 'none',
borderRadius: 3,
cursor: 'pointer',
fontSize: 14,
},
editButton: {
backgroundColor: '#2196F3',
color: 'white',
},
deleteButton: {
backgroundColor: '#f44336',
color: 'white',
},
error: {
color: 'red',
},
};
