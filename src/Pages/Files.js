import React, { useEffect, useState } from 'react';
import './Files.css';

function Files() {
  const [fileList, setFileList] = useState([]);

  // Charger et valider les fichiers depuis le localStorage
  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem("fileList")) || [];
    const validFiles = storedFiles.filter(file => localStorage.getItem(file) !== null);
    setFileList(validFiles);
  }, []);

  // Télécharger un fichier
  const downloadCSV = (fileName) => {
    const csvContent = localStorage.getItem(fileName);
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Supprimer un fichier
  const deleteFile = (fileName) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      localStorage.removeItem(fileName);

      const currentList = JSON.parse(localStorage.getItem("fileList")) || [];
      const updatedFileList = currentList.filter((file) => file !== fileName);

      localStorage.setItem("fileList", JSON.stringify(updatedFileList));
      setFileList(updatedFileList);
    }
  };

  return (
    <div className="files-container">
      <h1 className="files-title">📁 Stored Files</h1>
      {fileList.length === 0 ? (
        <p className="empty-message">No files found.</p>
      ) : (
        <ul className="file-list">
          {fileList.map((file, index) => (
            <li key={index} className="file-item">
              <span className="file-name">{file}</span>
              <div className="button-row">
                <button className="btn download-btn" onClick={() => downloadCSV(file)}>Download</button>
                <button className="btn delete-btn" onClick={() => deleteFile(file)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Files;
