import React from 'react';
import UploadForm from './components/UploadForm';
import RFMTable from './components/RFMTable';
import SegmentChart from './components/SegmentChart';

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>RFM Analysis Tool</h1>
      <UploadForm />
      <SegmentChart />
      <RFMTable />
    </div>
  );
}

export default App;
