import React, { useState, useEffect } from "react";
import api from "../api";  
import {
  // Card, Typography, Select, Space, Modal, Button, Input,
  // Checkbox, Tag, Alert, Progress, message, Row, Col
  Card,
  Typography,
  Select,
  Space,
  Button,
  Input,
  Checkbox,
  Tag,
  Alert,
  Progress,
  Row,
  Col,
} from "antd";


// import { Statistic } from "antd";
// import { UserOutlined } from "@ant-design/icons";
const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const RunCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const [offerText, setOfferText] = useState("");
  const [channels, setChannels] = useState([]);
  // const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappNumbers, setWhatsappNumbers] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | ready | sending | done | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    //fetch("http://localhost:4001/campaign")
    loadTemplates();
    fetch("/api/campaign")
      .then((res) => res.json())
      .then(setCampaigns)
      .catch((err) => console.error("Failed to load campaigns", err));
  }, []);

  const handleSelect = (id) => {
    setSelectedCampaign(id);
    //fetch(`http://localhost:4001/campaign/run/${id}`)
    fetch(`/api/campaign/run/${id}`)
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
          // setCampaignDetails(data);        // keep everything from backend
          // setShowDetails(true);
          // setShowNext(false);
        
        setCampaignDetails(data); // keep everything from backend
        setShowNext(true);
        setShowDetails(data.based_on !== "upload");
        })
      .catch((err) => console.error("Failed to load campaign details", err));
  };

  // const handleContinue = () => {
  //   Modal.confirm({
  //     title: "Do you want to run this campaign?",
  //     onOk: () => setShowNext(true),
  //   });
  // };

  const handleGoBack = () => {
    setShowDetails(false);
    setSelectedCampaign(null);
    setShowNext(false);
    setOfferText("");
    setChannels([]);
    // setWhatsappNumber("");
    setWhatsappNumbers("");
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

  const loadTemplates = () => {
      api
        //.get('/getAlltemplates')
        .get("/campaign/templates/getAlltemplates")
        .then(res => {
          console.log("res.data.templates----- ",res)
          const list = (res.data.templates || res.data || []).map(t => ({
            key: t.id || t.name,
            id: Number(t.id) || 0,  
            name: t.name,
          //   createdAt: t.created_at || t.createdAt,
          //   modifiedAt: t.modified_at || t.modifiedAt,
          //   templateName: t.template_name || t.templateName || t.name,
            templateType: t.template_type || t.templateType || t.category,
            templateCreateStatus:
             t.Status,
          }));
         // setTemplates(list);
         const approved = list.filter(t => t.templateCreateStatus === "APPROVED");
         approved.sort((a, b) => (b.id || 0) - (a.id || 0));
  
         setTemplates(approved);
        })
        .catch(() => message.error('Failed to fetch templates'));
    };

  async function startBroadcast() {
   
    setStatus("sending");
    setProgress(0);


    try {

      let numbers = whatsappNumbers;
      if (campaignDetails?.based_on === "upload") {
        const res = await fetch(`/api/campaign/${selectedCampaign}/upload/numbers`);
        const data = await res.json();
        numbers = data.phone_numbers || "";
      }
      
      if (channels.includes("WhatsApp")) {
        if (campaignDetails?.based_on === "upload") {
          //await fetch("/api/campaign/templates/sendWatsAppText", {
            await fetch("/api/campaign/templates/sendWatsAppImage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone_numbers: numbers,
              template_name: selectedTemplate,
            }),
          });
        }
        else{
          //await fetch("/api/campaign/templates/sendWatsAppText", {
            await fetch("/api/campaign/templates/sendWatsAppImage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone_numbers: whatsappNumbers,
              template_name: selectedTemplate,
            }),
          });
      }
      }
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
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Card title="Run Campaign" style={{ marginTop: 1 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong>Choose Campaign :</Text>
            <div style={{ marginTop: 2 ,paddingLeft:"26px"}}>
              <Select
                placeholder="Select a campaign"
                style={{ width: "39%" }}
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
            
              {showDetails && campaignDetails && (
                <Col xs={24} md={14}>
                  <Card>
                    {/* style={{ background: "#6175b3ff" }} title="Campaign Details"> */}
                    <Title level={5} style={{ background: "#6175b3ff",  borderRadius: "8px 8px 0 0", }}>Campaign Details</Title>
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

                      // label/value alignment
                      const LABEL_W = 200; // wide enough for the longest label
                      const L = (text) => (
                        <span style={{ display: "inline-block", minWidth: LABEL_W, fontWeight: "bold" }}>
                          {text}:
                        </span>
                      );

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
                      const hasBrand = Array.isArray(campaignDetails.purchase_brand) && campaignDetails.purchase_brand.length > 0; // fixed
                      const hasSection  = Array.isArray(campaignDetails.section)  && campaignDetails.section.length  > 0;
                      const hasProduct = Array.isArray(campaignDetails.product) && campaignDetails.product.length > 0;

                      const shortlisted = Number(
                        campaignDetails.shortlisted_count ?? campaignDetails.shortlistedCustomers ?? 0
                      ).toLocaleString("en-IN");

                      return (
                        <>
                          {/* Row 1: Name + Shortlisted */}
                          <Row gutter={12} style={{ marginBottom: 6 }}>
                            <Col span={12}>
                              {L("Name")}
                              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                                {campaignDetails.name || "-"}
                              </span>
                            </Col>
                          </Row>
                          <Row gutter={12} style={{ marginBottom: 6 }}>
                            <Col span={12}>
                              {/* {L("No. of Customers Shortlisted")} */}
                              {/* <span
                                style={{
                                  background: "linear-gradient(90deg, #4caf50, #81c784)",
                                  color: "#fff",
                                  padding: "4px 12px",
                                  borderRadius: "10px",
                                  fontWeight: "bold",
                                  display: "inline-block",
                                }}
                              >
                                {shortlisted}
                              </span> */}

                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px'
                                    }}>
                                      <strong>No. of Customers Shortlisted:</strong>
                                      <div style={{
                                        background: '#3f8600',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        width: '60px',
                                        height: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        fontWeight: 'bold'
                                      }}>
                                        {Number(campaignDetails.shortlisted_count ?? 0).toLocaleString("en-IN")}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>

                                {/* Row 2: Period */}
                                <Row gutter={12} style={{ marginBottom: 10 }}>
                                  <Col span={24}>
                                    {L("Period")}
                                    <span>{fmtRange(campaignDetails.start_date, campaignDetails.end_date)}</span>
                                  </Col>
                                </Row>

                                {/* Row 3: Branch/City/State */}
                                <Row gutter={12} style={{ marginBottom: 6 }}>
                                  <Col span={24}>{L("Branch")}<span>{join(campaignDetails.branch) || "-"}</span></Col>
                                </Row>
                                <Row gutter={12} style={{ marginBottom: 6 }}>
                                  <Col span={24}>{L("City")}<span>{join(campaignDetails.city) || "-"}</span></Col>
                                </Row>
                                <Row gutter={12} style={{ marginBottom: 6 }}>
                                  <Col span={24}>{L("State")}<span>{join(campaignDetails.state) || "-"}</span></Col>
                                </Row>

                                {/* Row 4: RFM Mode */}
                                {isSegmented ? (
                                  <Row gutter={12} style={{ marginBottom: 6 }}>
                                    <Col span={24}>
                                      {L("RFM Mode")}
                                      <span>RFM Segmented</span>
                                      <span style={{ marginLeft: 16, fontWeight: "bold" }}>Segment:</span>{" "}
                                      <span>
                                        {campaignDetails.rfm_segment_label ||
                                          (Array.isArray(campaignDetails.rfm_segments)
                                            ? campaignDetails.rfm_segments[0]
                                            : "-")}
                                      </span>
                                    </Col>
                                  </Row>
                                ) : (
                                  <>
                                    <Row gutter={12} style={{ marginBottom: 6 }}>
                                      <Col span={24}>{L("Recency")}<span>{recencyStr || "-"}</span></Col>
                                    </Row>
                                    <Row gutter={12} style={{ marginBottom: 6 }}>
                                      <Col span={24}>{L("Frequency")}<span>{frequencyStr || "-"}</span></Col>
                                    </Row>
                                    <Row gutter={12} style={{ marginBottom: 6 }}>
                                      <Col span={24}>{L("Monetary")}<span>{monetaryStr || "-"}</span></Col>
                                    </Row>
                                  </>
                                )}

                                {/* Row 5: R/F/M Scores (only if present) */}
                                {(hasR || hasF || hasM) && (
                                  <>
                                    <Row gutter={12} style={{ marginBottom: 6 }}>
                                      <Col span={24}>{L("R-Score")}<span>{hasR ? campaignDetails.r_score : "-"}</span></Col>
                                    </Row>
                                    <Row gutter={12} style={{ marginBottom: 6 }}>
                                      <Col span={24}>{L("F-Score")}<span>{hasF ? campaignDetails.f_score : "-"}</span></Col>
                                    </Row>
                                    <Row gutter={12} style={{ marginBottom: 6 }}>
                                      <Col span={24}>{L("M-Score")}<span>{hasM ? campaignDetails.m_score : "-"}</span></Col>
                                    </Row>
                                  </>
                                )}

                                {/* Row 6: Purchase Type + Brand + Section + Product + Model + Item */}
                                {(hasModel || hasItem || hasSection || hasProduct || hasBrand) && (
                                  <>
                                    <Row gutter={12} style={{ marginBottom: 6 }}>
                                      <Col span={24}>{L("Purchase Type")}<span>{campaignDetails?.purchase_type ?? "-"}</span></Col>
                                    </Row>

                                    {hasBrand && (
                                      <Row gutter={12} style={{ marginBottom: 6 }}>
                                        <Col span={24}>{L("Brand")}<span>{join(campaignDetails?.purchase_brand) || "-"}</span></Col>
                                      </Row>
                                    )}

                                    {hasSection && (
                                      <Row gutter={12} style={{ marginBottom: 6 }}>
                                        <Col span={24}>{L("Section")}<span>{join(campaignDetails?.section) || "-"}</span></Col>
                                      </Row>
                                    )}

                                    {hasProduct && (
                                      <Row gutter={12} style={{ marginBottom: 6 }}>
                                        <Col span={24}>{L("Product")}<span>{join(campaignDetails?.product) || "-"}</span></Col>
                                      </Row>
                                    )}

                                    {hasModel && (
                                      <Row gutter={12} style={{ marginBottom: 6 }}>
                                        <Col span={24}>{L("Model")}<span>{join(campaignDetails?.model) || "-"}</span></Col>
                                      </Row>
                                    )}

                                    {hasItem && (
                                      <Row gutter={12} style={{ marginBottom: 6 }}>
                                        <Col span={24}>{L("Item")}<span>{join(campaignDetails?.item) || "-"}</span></Col>
                                      </Row>
                                    )}
                                  </>
                                )}

                                {/* Row 7: Value Threshold */}
                                <Row gutter={12} style={{ marginBottom: 6 }}>
                                  <Col span={24}>{L("Value Threshold")}<span>{campaignDetails.value_threshold ?? "-"}</span></Col>
                                </Row>

                                {/* Row 8: Birthday Range */}
                                <Row gutter={12} style={{ marginBottom: 6 }}>
                                  <Col span={24}>{L("Birthday Range")}<span>{fmtRange(campaignDetails.birthday_start, campaignDetails.birthday_end)}</span></Col>
                                </Row>
                              </>
                            );
                          })()}

                           <Space>
                                <Button onClick={handleGoBack}>Go Back</Button>
                           </Space>
                              </Card>
                            </Col>
                            )}

             <Col xs={24} md={showDetails ? 10 : 24}>
                {showNext && (
                  <Card>
                  {/* <Title level={5} style={{ background: "#6175b3ff",  borderRadius: "8px 8px 0 0", }}>Offer Details</Title>
                  <TextArea
                    rows={3}
                    placeholder="e.g., ₹500 discount on minimum purchase of ₹50,000"
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                  /> */}
                  <div style={{ width: "40%" }}>
                  <Title level={5} style={{ background: "#6175b3ff",  borderRadius: "8px 8px 0 0", }}>Template Name</Title>
                  <Select
                    showSearch  
                    placeholder="Select an approved template"
                    style={{ width: "100%" }}
                    value={selectedTemplate}
                    onChange={(value) => setSelectedTemplate(value)}
                    allowClear
                    optionFilterProp="children"                 // ✅ enables filtering by option text
                    filterOption={(input, option) =>
                      option?.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {templates.map(t => (
                      <Option key={t.id} value={t.name}>
                        {t.name}
                      </Option>
                    ))}
                  </Select>
                  </div>
                  <div>
                  <Title level={5} style={{ marginTop: 20, marginBottom: 12 }}>Choose Broadcasting Mode</Title>
                  <div className="flex flex-col gap-2 mb-4">
                  <Checkbox.Group value={channels} onChange={setChannels}>
                    <Space direction="vertical" size={8} style={{ width: "100%", }}>
                      {/* WhatsApp row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: "100px"}}>
                          <Checkbox value="WhatsApp">WhatsApp</Checkbox>
                        </div>
                        {channels.includes("WhatsApp") && campaignDetails?.based_on !== "upload" && (
                          <textarea
                            placeholder="Enter WhatsApp numbers separated by commas"
                            value={whatsappNumbers}
                            onChange={(e) => setWhatsappNumbers(e.target.value)}
                            style={{ minWidth: 280 }}
                            size="middle"
                            className="w-full border rounded p-2"
                            rows="3"
                            
                          />
                        
                        )}
                      </div>
                      <br />
                      {/* SMS row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: "100px" }}>
                          <Checkbox value="SMS">SMS</Checkbox>
                        </div>
                        {channels.includes("SMS") && campaignDetails?.based_on !== "upload" && (
                          <textarea
                            placeholder="Enter SMS number"
                            value={smsNumber}
                            onChange={(e) => setSmsNumber(e.target.value)}
                            style={{ minWidth: 280 }}
                            size="middle"
                            className="w-full border rounded p-2"
                            rows="3"
                            
                          />
                        )}
                      </div>
                      <br />
                      {/* Email row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: "100px" }}>
                          <Checkbox value="Email">Email</Checkbox>
                        </div>
                        {channels.includes("Email") && campaignDetails?.based_on !== "upload" && (
                          <textarea
                            placeholder="Enter email address"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            style={{ minWidth: 280 }}
                            size="middle"
                            className="w-full border rounded p-2"
                            rows="3"
                          />
                        )}
                      </div>
                    </Space>
                  </Checkbox.Group>
                  </div>
                  {/* <Title level={5} style={{ marginTop: 20, marginBottom: 8 }}>Promo Code</Title> */}
                  {/* <Space>
                    <Button style={{background: '#519751ff',fontWeight:"bold",fontSize: '17px'}}onClick={generatePromo}>Generate Promo Code</Button>
                    {promoCode && <Tag level={15} color='#128012ff' style={{fontWeight:"bold",fontSize: '22px'}}>{promoCode}</Tag>}
                  </Space> */}

                  <div className="flex gap-3">
                  <Space style={{ marginTop: 20 }}>
                    <Button type="primary" onClick={startBroadcast}>
                      Start Broadcasting
                    </Button>
                     <Button onClick={handleGoBack}>Go Back</Button>
                  </Space>
                  </div>
                  </div>

                  {/* <div style={{ marginTop: 16 }}>
                    {status === "error" && (
                      // <Alert type="error" showIcon message="Enter offer text and select at least one channel." />
                      <Alert
                        type="error"
                        showIcon
                        message="Enter offer text, select channels, and provide WhatsApp number if applicable."
                      />
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
                  </div> */}
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
