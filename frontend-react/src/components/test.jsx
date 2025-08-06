import React from 'react';
import { FaBullseye } from 'react-icons/fa';

export default function TestIcon() {
  return (
    <div style={{ background: '#000', padding: 20 }}>
      <FaBullseye size={48} color="#0f0" />
      <p style={{ color: '#fff' }}>If you see a green bullseye, react-icons is working!</p>
    </div>
  );
}