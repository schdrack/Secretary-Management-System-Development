import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Clients.css';


export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', contactInfo: '', address: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Fetch all clients on load
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/clients');
      setClients(res.data);
    } catch (err) {
      setError('Failed to fetch clients');
    }
  };

  // Handle form input changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update client
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/clients/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post('http://localhost:3001/api/clients', form);
      }
      setForm({ name: '', contactInfo: '', address: '', notes: '' });
      fetchClients();
    } catch {
      setError('Failed to save client');
    }
  };

  // Edit client - load data to form
  const handleEdit = client => {
    setEditingId(client.clientId);
    setForm({
      name: client.name,
      contactInfo: client.contactInfo,
      address: client.address,
      notes: client.notes
    });
  };

  // Delete client
  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`http://localhost:3001/api/clients/${id}`);
        fetchClients();
      } catch {
        setError('Failed to delete client');
      }
    }
  };

  return (
  <div className="clients-container">
    <h2>Berwa      Housing    |     Clients</h2>

    {error && <p className="error-message">{error}</p>}

    <form className="client-form" onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="contactInfo" placeholder="Contact Info" value={form.contactInfo} onChange={handleChange} required />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
      <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
      <button type="submit">{editingId ? 'Update' : 'Add'}</button>
      {editingId && (
        <button type="button" onClick={() => {
          setEditingId(null);
          setForm({ name: '', contactInfo: '', address: '', notes: '' });
        }}>Cancel</button>
      )}
    </form>

    <table className="client-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Contact Info</th>
          <th>Address</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.length === 0 ? (
          <tr><td colSpan="5">No clients found</td></tr>
        ) : (
          clients.map(client => (
            <tr key={client.clientId}>
              <td>{client.name}</td>
              <td>{client.contactInfo}</td>
              <td>{client.address}</td>
              <td>{client.notes}</td>
              <td>
                <button onClick={() => handleEdit(client)}>Edit</button>
                <button onClick={() => handleDelete(client.clientId)}>Delete</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

}
