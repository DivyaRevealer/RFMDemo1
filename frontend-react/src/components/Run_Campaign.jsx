// export default function Run_Campaign() {
//   return <div>Hello</div>;
// }

import React, { useState, useEffect } from "react";
import { Card, Select, Button, Modal, Typography, Space } from "antd";

const { Option } = Select;
const { Title, Text } = Typography;

const RunCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Fetch campaigns within timeframe
    // Replace with API call
    setCampaigns([
      { id: 1, name: "Campaign 1" },
      { id: 2, name: "Campaign 2" },
      { id: 3, name: "Campaign 3" },
    ]);
  }, []);

  const handleSelect = (id) => {
    setSelectedCampaign(id);
    // Fetch details from backend
    // Dummy data here
    setCampaignDetails({
      rfmSegment: "Loyal Customers",
      brand: "Samsung",
      valueThreshold: "₹ 75,000",
      shortlistedCustomers: 25000,
    });
    setShowDetails(true);
  };

  const handleConfirm = (confirm) => {
    if (confirm) {
      Modal.success({
        title: "Campaign Started",
        content: "Your campaign has been initiated successfully!",
      });
    } else {
      setShowDetails(false);
      setSelectedCampaign(null);
    }
  };

  return (
    <Card title="Run Campaign" style={{ maxWidth: 600, margin: "auto" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text strong>Choose Campaign (within timeframe):</Text>
        <Select
          placeholder="Select a campaign"
          style={{ width: "100%" }}
          onChange={handleSelect}
          value={selectedCampaign}
        >
          {campaigns.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.name}
            </Option>
          ))}
        </Select>

        {showDetails && campaignDetails && (
          <Card
            style={{ marginTop: 20, background: "#fafafa" }}
            title="Campaign Details"
          >
            <p>
              <strong>RFM Segment:</strong> {campaignDetails.rfmSegment}
            </p>
            <p>
              <strong>Brand:</strong> {campaignDetails.brand}
            </p>
            <p>
              <strong>Value Threshold:</strong> {campaignDetails.valueThreshold}
            </p>
            <p>
              <strong>No. of Customers Shortlisted:</strong>{" "}
              {campaignDetails.shortlistedCustomers.toLocaleString()}
            </p>
            <Space>
              <Button type="primary" onClick={() => handleConfirm(true)}>
                Continue
              </Button>
              <Button onClick={() => handleConfirm(false)}>Go Back</Button>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default RunCampaign;
