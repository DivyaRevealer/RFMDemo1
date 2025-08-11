import React, { useState, useEffect } from "react";
import {
  Card, Typography, Select, Space, Modal, Button, Input,
  Checkbox, Tag, Alert, Progress, message, Row, Col
} from "antd";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const RunCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const [offerText, setOfferText] = useState("");
  const [channels, setChannels] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | ready | sending | done | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/campaign")
      .then((res) => res.json())
      .then(setCampaigns)
      .catch((err) => console.error("Failed to load campaigns", err));
  }, []);

  const handleSelect = (id) => {
    setSelectedCampaign(id);
    fetch(`http://localhost:8000/campaign/run/${id}`)
      .then((res) => res.json())
      // .then((data) => {
      //   setCampaignDetails({
      //     rfmSegment: data.rfm_segment_label,
      //     brand: data.brand_label,
      //     valueThreshold: data.value_threshold,
      //     shortlistedCustomers: data.shortlisted_count,
      //   });
      //   setShowDetails(true);
      //   setShowNext(false);
      // })
      .then((data) => {
          setCampaignDetails(data);        // keep everything from backend
          setShowDetails(true);
          setShowNext(false);
        })
      .catch((err) => console.error("Failed to load campaign details", err));
  };

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
    setOfferText("");
    setChannels([]);
    setPromoCode("");
    setStatus("idle");
    setProgress(0);
  };

  function generatePromo() {
    const d = new Date();
    const yymmdd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const rand = Math.random().toString(36).slice(2,6).toUpperCase();
    setPromoCode(`CAM${yymmdd}${rand}`);
    setStatus("ready");
  }

  async function startBroadcast() {
    if (!selectedCampaign) return; // <-- fixed
    if (!offerText.trim() || channels.length === 0) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    setProgress(0);

    try {
      // await api.post(`/campaign/run/${selectedCampaign}/start`, { offerText, channels, promoCode });
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
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
      <Card title="Run Campaign" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong>Choose Campaign (within timeframe):</Text>
            <div style={{ marginTop: 8 }}>
              <Select
                placeholder="Select a campaign"
                style={{ width: "100%" }}
                onChange={handleSelect}
                value={selectedCampaign}
                allowClear
              >
                {campaigns.map((c) => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Two-column layout */}
          <Row gutter={16}>
            <Col xs={24} md={14}>
              {showDetails && campaignDetails && (
                <Card style={{ background: "#fafafa" }} title="Campaign Details">
  {(() => {
    // helpers
    const join = (v) => Array.isArray(v) ? v.join(", ") : (v ?? "-");
    const fmtRange = (a, b) => `${a || "-"} → ${b || "-"}`;
    const combine = (op, min, max) => {
      if (!op) return null;
      const opStr = String(op).toLowerCase();
      if ((opStr === "between" || opStr === "range") && min != null && max != null) {
        return `between ${min} and ${max}`;
      }
      const val = (min ?? max);
      return val != null ? `${op} ${val}` : op;
    };

    // rfm mode
    const isSegmented =
      (Array.isArray(campaignDetails.rfm_segments) && campaignDetails.rfm_segments.length > 0) ||
      (!!campaignDetails.rfm_segment_label && campaignDetails.rfm_segment_label !== "-");

    // combined ops
    const recencyStr   = combine(campaignDetails.recency_op,   campaignDetails.recency_min,   campaignDetails.recency_max);
    const frequencyStr = combine(campaignDetails.frequency_op, campaignDetails.frequency_min, campaignDetails.frequency_max);
    const monetaryStr  = combine(campaignDetails.monetary_op,  campaignDetails.monetary_min,  campaignDetails.monetary_max);

    // presence flags
    const hasR = campaignDetails.r_score != null && String(campaignDetails.r_score) !== "";
    const hasF = campaignDetails.f_score != null && String(campaignDetails.f_score) !== "";
    const hasM = campaignDetails.m_score != null && String(campaignDetails.m_score) !== "";
    const hasModel = Array.isArray(campaignDetails.model) && campaignDetails.model.length > 0;
    const hasItem  = Array.isArray(campaignDetails.item)  && campaignDetails.item.length  > 0;

    return (
      <>
        {/* Row 1: Name + Period */}
        <Row gutter={12} style={{ marginBottom: 6 }}>
          <Col span={12}><strong>Name:</strong> {campaignDetails.name || "-"}</Col>
          <Col span={12}><strong>Period:</strong> {fmtRange(campaignDetails.start_date, campaignDetails.end_date)}</Col>
        </Row>

        {/* Row 2: Branch + City + State */}
        <Row gutter={12} style={{ marginBottom: 6 }}>
          <Col span={12}><strong>Branch:</strong> {join(campaignDetails.branch) || "-"}</Col>
          <Col span={12}><strong>Purchase Type:</strong> {campaignDetails.purchase_type || "-"}</Col>
        </Row>
        <Row gutter={12} style={{ marginBottom: 6 }}>
        
          <Col span={12}><strong>City:</strong> {join(campaignDetails.city) || "-"}</Col>
          <Col span={12}><strong>Brand:</strong> {join(campaignDetails.purchase_brand) || "-"}</Col>
        </Row>
        <Row gutter={12} style={{ marginBottom: 6 }}>
        
          <Col span={12}><strong>State:</strong> {join(campaignDetails.state) || "-"}</Col>
          <Col span={12}><strong>Section:</strong> {join(campaignDetails.section) || "-"}</Col>
        </Row>

        {/* Row 3: RFM Mode */}
        {isSegmented ? (
          <Row gutter={12} style={{ marginBottom: 6 }}>
            <Col span={24}>
              <strong>RFM Mode:</strong> RFM Segmented&nbsp;&nbsp;
              <strong>Segment:</strong>{" "}
              {campaignDetails.rfm_segment_label ||
               (Array.isArray(campaignDetails.rfm_segments) ? campaignDetails.rfm_segments[0] : "-")}
            </Col>
            <Col span={12}><strong>Product:</strong> {join(campaignDetails.product) || "-"}</Col>
          </Row>
        ) : (
           <>
            <Row gutter={12} style={{ marginBottom: 6 }}>
              <Col span={12}><strong>Recency:</strong> {recencyStr || "-"}</Col>
              <Col span={12}><strong>Product:</strong> {join(campaignDetails.product) || "-"}</Col>
            </Row>
            <Row gutter={12} style={{ marginBottom: 6 }}>
            
              <Col span={12}><strong>Frequency:</strong> {frequencyStr || "-"}</Col>
              
            </Row>
            <Row gutter={12} style={{ marginBottom: 6 }}>
            
              <Col span={12}><strong>Monetary:</strong> {monetaryStr || "-"}</Col>
            </Row>
          </>
          
          
          
        )}

        {/* Row 4: R/F/M Scores (only if present) */}
        {(hasR || hasF || hasM) && (
         
           <>
            <Row gutter={12} style={{ marginBottom: 6 }}>
               <Col span={12}><strong>R-Score:</strong> {hasR ? campaignDetails.r_score : "-"}</Col>
              
            </Row>
            <Row gutter={12} style={{ marginBottom: 6 }}>
            
               <Col span={12}><strong>F-Score:</strong> {hasF ? campaignDetails.f_score : "-"}</Col>
              
            </Row>
            <Row gutter={12} style={{ marginBottom: 6 }}>
            
               <Col span={12}><strong>M-Score:</strong> {hasM ? campaignDetails.m_score : "-"}</Col>
            </Row>
          </>
          
        )}

        
        {/* Row 6: Model + Item (only if entered) */}
        {(hasModel || hasItem) && (
          <Row gutter={12} style={{ marginBottom: 6 }}>
            <Col span={12}><strong>Model:</strong> {hasModel ? join(campaignDetails.model) : "-"}</Col>
            <Col span={12}><strong>Item:</strong> {hasItem ? join(campaignDetails.item) : "-"}</Col>
          </Row>
        )}

        {/* Row 7: Value Threshold + Birthday Range */}
        <Row gutter={12} style={{ marginBottom: 6 }}>
          <Col span={12}>
            <strong>Value Threshold:</strong>{" "}
            {campaignDetails.value_threshold ?? "-"}
          </Col>
          <Col span={12}>
            <strong>Birthday Range:</strong>{" "}
            {fmtRange(campaignDetails.birthday_start, campaignDetails.birthday_end)}
          </Col>
        </Row>

        {/* Row 8: No. of Customers */}
        <Row gutter={12} style={{ marginBottom: 10 }}>
          <Col span={24}>
            <strong>No. of Customers Shortlisted:</strong>{" "}
            {Number(campaignDetails.shortlisted_count ?? campaignDetails.shortlistedCustomers ?? 0)
              .toLocaleString("en-IN")}
          </Col>
        </Row>
      </>
    );
  })()}

  <Space>
    <Button type="primary" onClick={handleContinue}>Continue</Button>
    <Button onClick={handleGoBack}>Go Back</Button>
  </Space>
</Card>
              )}
            </Col>

            <Col xs={24} md={10}>
              {showNext && (
                <Card>
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
                    <Button style={{background: '#519751ff',fontWeight:"bold",fontSize: '17px'}}onClick={generatePromo}>Generate Promo Code</Button>
                    {promoCode && <Tag level={15} color='#128012ff' style={{fontWeight:"bold",fontSize: '22px'}}>{promoCode}</Tag>}
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
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  );
};

export default RunCampaign;
