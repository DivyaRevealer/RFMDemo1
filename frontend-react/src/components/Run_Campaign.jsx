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
  message   
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

  // useEffect(() => {
  //   //fetch("http://localhost:4001/campaign")
  //   loadTemplates();
  //   fetch("/api/campaign")
  //     .then((res) => res.json())
  //     .then(setCampaigns)
  //     .catch((err) => console.error("Failed to load campaigns", err));
  // }, []);

  useEffect(() => {
    loadTemplates();
    api
      .get('/campaign')
      .then(res => setCampaigns(res.data))
      .catch(() => message.error('Failed to load campaigns'));
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
     const token = localStorage.getItem("token"); // wherever you store it after login
      api
        //.get('/getAlltemplates')
        // .get("/campaign/templates/getAlltemplates")
        .get("/campaign/templates/getAlltemplates", {
          headers: {
            Authorization: `Bearer ${token}`,  // 👈 required
          }})
        .then(res => {
          console.log("res.data.templates----- ",res)
          const list = (res.data.templates || res.data || []).map(t => ({
            key: t.id || t.name,
            id: Number(t.id) || 0,  
            name: t.name,
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
      let basedon_value=campaignDetails?.based_on;
      let campaign_id=campaignDetails?.id;
      console.log("basedon_value----- ",campaignDetails?.based_on)
      console.log("campaign_id----- ",campaign_id)
      if (campaignDetails?.based_on === "upload") {
        const res = await fetch(`/api/campaign/${selectedCampaign}/upload/numbers`);
        const data = await res.json();
        numbers = data.phone_numbers || "";
      }
     
      console.log("selectedTemplate-------- ",selectedTemplate)
      if (channels.includes("WhatsApp")) {
        const templateRes = await fetch(`/api/campaign/templates/${selectedTemplate}/details`);
        const templateData = await templateRes.json();
        console.log("templateData------- ",templateData)

        const templateType = templateData.template_type;       // e.g. "media" or "text"
        const mediaType = templateData.media_type;    // e.g. "image" or "video"
        //let endpoint = "/api/campaign/templates/sendWatsAppText"; // default
        let endpoint = ""; // default
        console.log("templateType--------------",templateType)
        if (templateType === "media") {
          if (mediaType === "image") {
            endpoint = "/api/campaign/templates/sendWatsAppImage";
          } else if (mediaType === "video") {
            endpoint = "/api/campaign/templates/sendWatsAppVideo";
          } 
        }
        else if(templateType === "text"){
          endpoint = "/api/campaign/templates/sendWatsAppText";
          console.log("endpoint------ ",endpoint)
        }

        if (campaignDetails?.based_on === "upload") {
          //await fetch("/api/campaign/templates/sendWatsAppText", {
            const response=await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone_numbers: numbers,
              template_name: selectedTemplate,
              basedon_value:basedon_value,
              campaign_id:campaign_id,
            }),
          });
          const resJson = await response.json();
          console.log("Broadcast API Response:", resJson);
          if(resJson.success)
            alert("Broadcast is successfull!!")
          else
            alert("Broadcast Failed!!")
        }
        else{
          console.log("isnide----- ",campaign_id)
          const response=await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone_numbers: whatsappNumbers,
              template_name: selectedTemplate,
              basedon_value: basedon_value,
              campaign_id:campaign_id,
            }),
          });
          const resJson = await response.json();
          console.log("Broadcast API Response:", resJson);
          if(resJson.success)
            alert("Broadcast is successfull!!")
          else
            alert("Broadcast Failed!!")
      }
      // const resJson = await response.json(); // 👈 catch response here
      // console.log("Broadcast API Response:", resJson);

     
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

  const hasValue = (v) => {
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim() !== "";
  return v !== 0; // prevent accidental 0 showing
};

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
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

          <Row gutter={[16, 16]}>
              {/* Left side: All tiles */}
              <Col xs={24} md={18}>
                <Row gutter={[16, 16]}>

                  {/* 8. Customers Shortlisted */}
                  {hasValue(campaignDetails?.shortlisted_count) && (
                    <Col xs={24} md={8}>
                      {/* <Card style={{ background: "linear-gradient(135deg, #00c6ff, #0072ff)", color: "#fff", height: "180px" }}> */}
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>Customers Shortlisted</Title>
                        <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                          {Number(campaignDetails.shortlisted_count).toLocaleString("en-IN")}
                        </div>
                      </Card>
                    </Col>
                  )}
                  {/* 1. Campaign Info */}
                  {(hasValue(campaignDetails?.name) || (hasValue(campaignDetails?.start_date) && hasValue(campaignDetails?.end_date)) || hasValue(campaignDetails?.based_on)) && (
                    <Col xs={24} md={8}>
                      {/* <Card style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", height: "180px" }}> */}
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>Campaign Info</Title>
                        {hasValue(campaignDetails?.name) && <p style={{ marginBottom: "4px" }}><strong>Name:</strong> {campaignDetails.name}</p>}
                        {hasValue(campaignDetails?.start_date) && hasValue(campaignDetails?.end_date) && (
                          <p style={{ marginBottom: "4px" }}><strong>Period:</strong> {campaignDetails.start_date} → {campaignDetails.end_date}</p>
                        )}
                        {hasValue(campaignDetails?.based_on) && (
                          <p style={{ marginBottom: "0px" }}><strong>Based On:</strong> {campaignDetails.based_on}</p>
                        )}
                      </Card>
                    </Col>
                  )}

                  {/* 2. Location Info */}
                  {(hasValue(campaignDetails?.branch) || hasValue(campaignDetails?.city) || hasValue(campaignDetails?.state)) && (
                    <Col xs={24} md={8}>
                      {/* <Card style={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)", color: "#fff", height: "180px" }}> */}
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>Location Info</Title>
                        {hasValue(campaignDetails?.branch) && <p style={{ marginBottom: "4px" }}><strong>Branch:</strong> {Array.isArray(campaignDetails.branch) ? campaignDetails.branch.join(", ") : campaignDetails.branch}</p>}
                        {hasValue(campaignDetails?.city) && <p style={{ marginBottom: "4px" }}><strong>City:</strong> {Array.isArray(campaignDetails.city) ? campaignDetails.city.join(", ") : campaignDetails.city}</p>}
                        {hasValue(campaignDetails?.state) && <p style={{ marginBottom: "0px" }}><strong>State:</strong> {Array.isArray(campaignDetails.state) ? campaignDetails.state.join(", ") : campaignDetails.state}</p>}
                      </Card>
                    </Col>
                  )}

                  {/* 3. Targeting Criteria */}
                  {(hasValue(campaignDetails?.recency_min) || hasValue(campaignDetails?.frequency_min) || hasValue(campaignDetails?.monetary_min)) && (
                    <Col xs={24} md={8}>
                      {/* <Card style={{ background: "linear-gradient(135deg, #ff512f, #dd2476)", color: "#fff", height: "180px" }}> */}
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>Targeting Criteria</Title>
                        {hasValue(campaignDetails?.recency_min) && <p style={{ marginBottom: "4px" }}><strong>Recency:</strong> {campaignDetails.recency_op} {campaignDetails.recency_min}</p>}
                        {hasValue(campaignDetails?.frequency_min) && <p style={{ marginBottom: "4px" }}><strong>Frequency:</strong> {campaignDetails.frequency_op} {campaignDetails.frequency_min}</p>}
                        {hasValue(campaignDetails?.monetary_min) && <p style={{ marginBottom: "0px" }}><strong>Monetary:</strong> {campaignDetails.monetary_op} {campaignDetails.monetary_min}</p>}
                      </Card>
                    </Col>
                  )}

                  {/* 4. RFM Scores */}
                  {(hasValue(campaignDetails?.r_score) || hasValue(campaignDetails?.f_score) || hasValue(campaignDetails?.m_score)) && (
                    <Col xs={24} md={8}>
                      {/* <Card style={{ background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "#fff", height: "180px" }}> */}
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>RFM Scores</Title>
                        {hasValue(campaignDetails?.r_score) && <p style={{ marginBottom: "4px" }}><strong>R-Score:</strong> {campaignDetails.r_score}</p>}
                        {hasValue(campaignDetails?.f_score) && <p style={{ marginBottom: "4px" }}><strong>F-Score:</strong> {campaignDetails.f_score}</p>}
                        {hasValue(campaignDetails?.m_score) && <p style={{ marginBottom: "0px" }}><strong>M-Score:</strong> {campaignDetails.m_score}</p>}
                      </Card>
                    </Col>
                  )}

                  {/* 5. Purchase & Category */}
                  {(hasValue(campaignDetails?.purchase_type) || hasValue(campaignDetails?.purchase_brand) || hasValue(campaignDetails?.section)) && (
                    <Col xs={24} md={8}>
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>Purchase & Category</Title>
                        {hasValue(campaignDetails?.purchase_type) && <p style={{ marginBottom: "4px" }}><strong>Purchase Type:</strong> {campaignDetails.purchase_type}</p>}
                        {hasValue(campaignDetails?.purchase_brand) && <p style={{ marginBottom: "4px" }}><strong>Brand:</strong> {campaignDetails.purchase_brand.join(", ")}</p>}
                        {hasValue(campaignDetails?.section) && <p style={{ marginBottom: "0px" }}><strong>Section:</strong> {campaignDetails.section.join(", ")}</p>}
                      </Card>
                    </Col>
                  )}

                  {/* 6. Product & Model */}
                  {(hasValue(campaignDetails?.product) || hasValue(campaignDetails?.model) || hasValue(campaignDetails?.item)) && (
                    <Col xs={24} md={8}>
                      {/* <Card style={{ background: "linear-gradient(135deg, #9c27b0, #6a1b9a)", color: "#fff", height: "180px" }}> */}
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>Product & Model</Title>
                        {hasValue(campaignDetails?.product) && <p style={{ marginBottom: "4px" }}><strong>Product:</strong> {campaignDetails.product.join(", ")}</p>}
                        {hasValue(campaignDetails?.model) && <p style={{ marginBottom: "4px" }}><strong>Model:</strong> {campaignDetails.model.join(", ")}</p>}
                        {hasValue(campaignDetails?.item) && <p style={{ marginBottom: "0px" }}><strong>Item:</strong> {campaignDetails.item.join(", ")}</p>}
                      </Card>
                    </Col>
                  )}

                  {/* 7. Value & Birthday */}
                  {(hasValue(campaignDetails?.value_threshold) || hasValue(campaignDetails?.birthday_start) || hasValue(campaignDetails?.birthday_end)) && (
                    <Col xs={24} md={8}>
                      {/* <Card style={{ background: "linear-gradient(135deg, #11998e, #38ef7d)", color: "#fff", height: "180px" }}> */}
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ color: "#fff", margin: 0 }}>Value & Birthday</Title>
                        {hasValue(campaignDetails?.value_threshold) && <p style={{ marginBottom: "4px" }}><strong>Value Threshold:</strong> {campaignDetails.value_threshold}</p>}
                        {(hasValue(campaignDetails?.birthday_start) || hasValue(campaignDetails?.birthday_end)) && (
                          <p style={{ marginBottom: "0px" }}><strong>Birthday Range:</strong> {campaignDetails.birthday_start} → {campaignDetails.birthday_end}</p>
                        )}
                      </Card>
                    </Col>
                  )}

                {showNext && (
                  <Col xs={24} md={8}>
                      
                      <Card style={{ background: "linear-gradient(135deg, #36d1dc, #5b86e5)", color: "#fff", height: "200px" }}>
                        <Title level={5} style={{ marginTop: 0 }}>Template Name</Title>
                        <Select
                      showSearch
                      placeholder="Select an approved template"
                      style={{ width: "100%", marginBottom: "1px" }}
                      value={selectedTemplate}
                      onChange={(value) => setSelectedTemplate(value)}
                      allowClear
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {templates.map(t => (
                        <Option key={t.name} value={t.name}>{t.name}</Option>
                      ))}
                    </Select>

                    <Title level={5} style={{ marginTop: "6px" }}>Choose Broadcasting Mode</Title>
                    <Checkbox.Group value={channels} onChange={setChannels}>
                      <Space direction="horizontal" size={8} style={{ width: "100%" }}>
                        <Checkbox value="WhatsApp">WhatsApp</Checkbox>
                        <Checkbox value="SMS">SMS</Checkbox>
                        <Checkbox value="Email">Email</Checkbox>
                      </Space>
                    </Checkbox.Group>
                   <div 
                    style={{
                      marginTop: 10,
                      display: "flex",
                      justifyContent: "center",
                    
                    }}>
                      <Button type="primary" onClick={startBroadcast} 
                      style={{ backgroundColor: "#36d1dc", borderColor: "#36d1dc" }}  // custom color
                      >Start Broadcasting</Button>
                     
                    </div>
                      </Card>
                    </Col>
                   )}
                </Row>
              </Col>

             
              {/* <Col xs={24} md={6}>
                {showNext && (
                  <Card style={{ minHeight: "200px", maxWidth: "300px"}}>
                    <Title level={5} style={{ marginTop: 0 }}>Template Name</Title>
                    <Select
                      showSearch
                      placeholder="Select an approved template"
                      style={{ width: "100%", marginBottom: "16px" }}
                      value={selectedTemplate}
                      onChange={(value) => setSelectedTemplate(value)}
                      allowClear
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {templates.map(t => (
                        <Option key={t.name} value={t.name}>{t.name}</Option>
                      ))}
                    </Select>

                    <Title level={5} style={{ marginTop: 16 }}>Choose Broadcasting Mode</Title>
                    <Checkbox.Group value={channels} onChange={setChannels}>
                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                        <Checkbox value="WhatsApp">WhatsApp</Checkbox>
                        <Checkbox value="SMS">SMS</Checkbox>
                        <Checkbox value="Email">Email</Checkbox>
                      </Space>
                    </Checkbox.Group>

                    <div 
                    style={{
                      marginTop: 20,
                      display: "flex",
                      justifyContent: "center",
                      gap: "12px",   // spacing between buttons
                    }}>
                      <Button type="primary" onClick={startBroadcast} 
                      style={{ backgroundColor: "#36d1dc", borderColor: "#36d1dc" }}  // custom color
                      >Start Broadcasting</Button>
                      
                    </div>
                  </Card>
                )}
              </Col> */}
            </Row>
          </Space>
          </Card>
    </div>
    
  );
};

export default RunCampaign;
