import React, { useState } from 'react';
import './style.css'; // Import your CSS file

function CustomDropzone(props) {
  const { handleFileChange } = props;

  return (
    <div className="custom-dropzone">
      <div className="dropzone-inner">
        <label htmlFor="file-input" className="label">
          <div className="icon">+</div>
          <div className="text">Upload files here</div>
        </label>
      </div>
      <input
        id="file-input"
        type="file"
        accept=".xls,.xlsx,.pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default CustomDropzone;
