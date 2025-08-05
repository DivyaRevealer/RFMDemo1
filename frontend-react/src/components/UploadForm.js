import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:8000/upload", formData);
    setMessage(res.data.message + " Rows: " + res.data.rows);
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleUpload} />
      <p>{message}</p>
    </div>
  );
};

export default UploadForm;
