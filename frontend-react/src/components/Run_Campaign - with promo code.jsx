// export default function Run_Campaign() {
//   return <div>Hello</div>;
// }

import React, { useState, useEffect } from "react";
// import { Card, Select, Button, Modal, Typography, Space  } from "antd";
import { Card, Typography, Select, Space, Modal,Button, Input, Checkbox, Tag, Alert, Progress, message } from "antd";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const RunCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [offerText, setOfferText] = useState("");
  const [channels, setChannels] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | ready | sending | done | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch campaigns within timeframe
    // Replace with API call
    // setCampaigns([
    //   { id: 1, name: "Campaign 1" },
    //   { id: 2, name: "Campaign 2" },
    //   { id: 3, name: "Campaign 3" },
    // ]);
    fetch("http://localhost:8000/campaign")
      .then((res) => res.json())
      .then(setCampaigns)
      .catch((err) => console.error("Failed to load campaigns", err));
  }, []);

  const handleSelect = (id) => {
    setSelectedCampaign(id);
    // Fetch details from backend
    // Dummy data here
    fetch(`http://localhost:8000/campaign/run/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaignDetails({
          rfmSegment: data.rfm_segment_label,
          brand: data.brand_label,
          valueThreshold: data.value_threshold,
          shortlistedCustomers: data.shortlisted_count,
        });
        setShowDetails(true);
        setShowNext(false);
      })
      .catch((err) => console.error("Failed to load campaign details", err));
  };

 // const handleConfirm = (confirm) => {
    // if (confirm) {
    //   Modal.success({
    //     title: "Campaign Started",
    //     content: "Your campaign has been initiated successfully!",
    //   });
    // } else {
    //   setShowDetails(false);
    //   setSelectedCampaign(null);
    // }

  const handleContinue = () => {
    Modal.confirm({
      title: "Do you want to run this campaign?",
      onOk: () => setShowNext(true),
    });
  };

  const handleGoBack = () => {
    setShowDetails(false);
    setSelectedCampaign(null);
    setShowNext(false);
  };

  const onContinue = () => setShowNext(true);
  const onBack = () => setShowNext(false);

  function generatePromo() {
    const d = new Date();
    const yymmdd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const rand = Math.random().toString(36).slice(2,6).toUpperCase();
    const code = `CAM${yymmdd}${rand}`;
    setPromoCode(code);
    setStatus("ready");
  }

  async function startBroadcast() {
    if (!details?.id) return;
    if (!offerText.trim() || channels.length === 0) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    setProgress(0);

    try {
      // TODO: replace with your real API
      // await api.post(`/campaign/run/${details.id}/start`, { offerText, channels, promoCode });

      // mock progress
      const timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            setStatus("done");
            return 100;
          }
          return p + 8;
        });
      }, 300);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }


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
              {/* <Button type="primary" onClick={() => handleConfirm(true)}> */}
               <Button type="primary" onClick={handleContinue}>
                Continue
              </Button>
              {/* <Button onClick={() => handleConfirm(false)}>Go Back</Button> */}
              <Button onClick={() => handleGoBack(false)}>Go Back</Button>
            </Space>
          </Card>
        )}
          {showNext && (
          <Card style={{ marginTop: 8 }}>
              <Title level={5} style={{ marginBottom: 12 }}>Offer Details</Title>
              <TextArea
                rows={3}
                placeholder="e.g., ₹500 discount on minimum purchase of ₹50,000"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
              />

              <Title level={5} style={{ marginTop: 20, marginBottom: 12 }}>Choose Broadcasting Mode</Title>
              <Checkbox.Group
                options={["WhatsApp", "SMS", "Email"]}
                value={channels}
                onChange={setChannels}
              />

              <Title level={5} style={{ marginTop: 20, marginBottom: 8 }}>Promo Code</Title>
              <Space>
                <Button onClick={generatePromo}>Generate Promo Code</Button>
                {promoCode && <Tag color="blue">{promoCode}</Tag>}
              </Space>

              <Space style={{ marginTop: 20 }}>
                <Button type="primary" onClick={startBroadcast} disabled={!promoCode}>
                  Start Broadcasting
                </Button>
              </Space>

              <div style={{ marginTop: 16 }}>
                {status === "error" && (
                  <Alert type="error" showIcon message="Enter offer text and select at least one channel." />
                )}
                {status === "sending" && (
                  <>
                    <Alert type="info" showIcon message="Broadcasting in progress..." />
                    <Progress percent={progress} />
                  </>
                )}
                {status === "done" && (
                  <Alert type="success" showIcon message="Broadcast completed. You can go back to the main menu." />
                )}
              </div>
            </Card>
        )}

          {/* Next section appears after Continue */}
          {/* {showDetails && showNext && (
            <Card style={{ marginTop: 8 }}>
              <Title level={5} style={{ marginBottom: 12 }}>Offer Details</Title>
              <TextArea
                rows={3}
                placeholder="e.g., ₹500 discount on minimum purchase of ₹50,000"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
              />

              <Title level={5} style={{ marginTop: 20, marginBottom: 12 }}>Choose Broadcasting Mode</Title>
              <Checkbox.Group
                options={["WhatsApp", "SMS", "Email"]}
                value={channels}
                onChange={setChannels}
              />

              <Title level={5} style={{ marginTop: 20, marginBottom: 8 }}>Promo Code</Title>
              <Space>
                <Button onClick={generatePromo}>Generate Promo Code</Button>
                {promoCode && <Tag color="blue">{promoCode}</Tag>}
              </Space>

              <Space style={{ marginTop: 20 }}>
                <Button type="primary" onClick={startBroadcast} disabled={!promoCode}>
                  Start Broadcasting
                </Button>
              </Space>

              <div style={{ marginTop: 16 }}>
                {status === "error" && (
                  <Alert type="error" showIcon message="Enter offer text and select at least one channel." />
                )}
                {status === "sending" && (
                  <>
                    <Alert type="info" showIcon message="Broadcasting in progress..." />
                    <Progress percent={progress} />
                  </>
                )}
                {status === "done" && (
                  <Alert type="success" showIcon message="Broadcast completed. You can go back to the main menu." />
                )}
              </div>
            </Card>
          )} */}
      </Space>
    </Card>
  );
};

export default RunCampaign;
