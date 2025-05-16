import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './Reports.css';

export default function Reports() {
  const [totalClients, setTotalClients] = useState(0);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/clients');
      setClients(res.data);
      setTotalClients(res.data.length);
    } catch {
      setError('Failed to fetch report data');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Client Report', 14, 22);

    doc.setFontSize(12);
    doc.text(`Total Clients: ${totalClients}`, 14, 30);

    const tableColumn = ["Name", "Contact Info", "Address", "Notes"];
    const tableRows = [];

    clients.forEach(client => {
      const clientData = [
        client.name,
        client.contactInfo,
        client.address,
        client.notes || ''
      ];
      tableRows.push(clientData);
    });

    // Use autoTable plugin correctly
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] }, // bootstrap primary blue
    });

    doc.save('client_report.pdf');
  };

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clients);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'client_report.xlsx');
  };

  return (
    <div className="reports-container">
      <h2>Reports</h2>

      {error && <p className="error-message">{error}</p>}

      <p className="reports-summary">Total Clients: {totalClients}</p>

      <div className="reports-buttons">
        <button onClick={generatePDF}>Export as PDF</button>
        <button onClick={generateExcel}>Export as Excel</button>
      </div>
    </div>
  );
}
