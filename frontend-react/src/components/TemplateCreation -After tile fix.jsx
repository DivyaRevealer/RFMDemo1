import React, { useEffect, useState } from 'react';
//import { Button, Modal, Form, Input, Select, message ,Table, Radio } from 'antd';
import api from '../api';
import "../css/template.css";


import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Tooltip,
  Drawer,
  Input,
  Row,
  Col,
  Switch,
  message,
  Pagination,
  Select ,
  Form,
  Table,
  Modal,
} from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const { Option } = Select;

export default function TemplateCreation() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [templateType, setTemplateType] = useState("text");
  const [mediaType, setMediaType] = useState("image");
  const [mediaFile, setMediaFile] = useState(null);
  const [gridView, setGridView] = useState(true);
  const [preview, setPreview] = useState(null);
  
  // filtered data before rendering table
  // const filteredTemplates = templates.filter(t =>
  //   t.name.toLowerCase().includes(searchText.toLowerCase())
  //   );

  const filteredTemplates = templates.filter(t =>
  [t.name, t.templateType, t.templateCreateStatus]
    .join(" ")
    .toLowerCase()
    .includes(searchText.toLowerCase())
);
    
  
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    // { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
    // { title: 'Modified At', dataIndex: 'modifiedAt', key: 'modifiedAt' },
    // { title: 'TemplateName', dataIndex: 'templateName', key: 'templateName' },
    { title: 'TemplateType', dataIndex: 'templateType', key: 'templateType' },
    { title: 'TemplateCreateStatus', dataIndex: 'templateCreateStatus', key: 'templateCreateStatus' },
     {
    title: 'Sync Template',
    key: 'action',
    render: (_, record) => (
      <SyncOutlined
        style={{ color: "#7367F0", fontSize: "18px", cursor: "pointer" }}
        onClick={() => syncTemplate1(record.name)}   // ✅ calls syncTemplate with row name
      />
    ),
  },
  ];



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
       list.sort((a, b) => (b.id || 0) - (a.id || 0));

       setTemplates(list);
      })
      .catch(() => message.error('Failed to fetch templates'));
  };

  useEffect(() => {
    loadTemplates();
  }, []);
  const showModal = () => setOpen(true);
  const hideModal = () => {
    setOpen(false);
    form.resetFields();
    setTemplateType("text");
    setMediaType("image");
    setMediaFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setMediaFile(null);
      return;
    }
    const limit = mediaType === "image" ? 4 * 1024 * 1024 : 9 * 1024 * 1024;
    if (file.size > limit) {
      message.error(`File must be smaller than ${mediaType === "image" ? "4" : "9"}MB`);
      e.target.value = null;
      setMediaFile(null);
      return;
    }
    setMediaFile(file);
  };
  const submit = () => {

      form
          // .validateFields()
          // .then(values => {
            // check if body has placeholders like {{1}}
          .validateFields()
          .then(values => {
          if (templateType === "text") {
            const bodyHasVars = /\{\{\d+\}\}/.test(values.body);
            

            const bodyComponent = bodyHasVars
              ? {
                  type: "BODY",
                  text: values.body,
                  example: { body_text: [[values.body || "sample text"]] }
                }
              : {
                  type: "BODY",
                  text: values.body
                };

            const payload = {
              name: values.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"), // enforce correct format
              language: values.language,
              category: values.category,
              components: [
                { type: "HEADER", format: "TEXT", text: values.header || "" },
                bodyComponent,
                { type: "FOOTER", text: values.footer || "" }
              ]
            };

            console.log("payload----------", JSON.stringify(payload));

            // api
            //   .post("/campaign/templates/create-template", { channel: values.channel, ...payload })
            //   .then((res) => {
            //     //message.success("Template created");
            //     // if backend returns sync status:
            //     if (res.data.success==true) {
            //       console.log("Succesfull!!!!!!!!!!");
            //       syncTemplate(values.name)
             api.post("/campaign/templates/create-text-template", payload)
              .then(res => {
                if (res.data.success === true) {
                  syncTemplate(values.name);
                }

                hideModal();
              })
              .catch(() => message.error("Failed to create template"));
        } else {
            if (!mediaFile) {
              message.error("Please upload media file");
              return;
            }
            const formData = new FormData();
            formData.append("name", values.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
            formData.append("language", values.language);
            formData.append("category", values.category);
            formData.append("header", values.header || "");
            formData.append("body", values.body);
            formData.append("footer", values.footer || "");
            formData.append("file", mediaFile);
            const endpoint =
              mediaType === "image"
                ? "/campaign/templates/create-image-template"
                : "/campaign/templates/create-video-template";
            api
              .post(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" }
              })
              .then(res => {
                if (res.data.success === true) {
                  syncTemplate(values.name);
                }
                hideModal();
              })
              .catch(() => message.error("Failed to create template"));
          }
        })
        .catch(() => {});
    };

  const syncTemplate = (templateName) => {
    api
      //.get('/getAlltemplates')
      .post("/campaign/templates/sync-template",{ name: templateName })
      .then(res => {
        console.log("Sync successful----- ", res.data.sync_status.success)
        if(res.data.sync_status.success)
          alert("Template created Successfully")
          loadTemplates()
      })
      .catch(() => message.error('Failed to fetch templates'));
  };

  const syncTemplate1 = (templateName) => {
    api
      //.get('/getAlltemplates')
      .post("/campaign/templates/sync-template",{ name: templateName })
      .then(res => {
        console.log("Sync successful----- ", res.data.sync_status.success)
        if(res.data.sync_status.success)
          alert("Template sync is Successful!!")
          loadTemplates()
      })
      .catch(() => message.error('Failed to fetch templates'));
  };

  const typeColors = { MARKETING: "purple", UTILITY: "blue" };
  const statusColors = { APPROVED: "green", PENDING: "orange", REJECTED: "red" };
  const gradients = [
    "linear-gradient(135deg, #06beb6, #48b1bf)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f7971e, #ffd200)",
    "linear-gradient(135deg, #ff0844, #ffb199)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
  ];
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(15);

// Pagination slice
  const start = (currentPage - 1) * pageSize;
  const pagedTemplates = filteredTemplates.slice(start, start + pageSize);

  return (
//   <div
//     style={{
//       //height: "100vh",
//       height: "600px",
//       width: "1100px",
//       padding: "20px", paddingLeft:"200px"
//       //background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
//     }}
//   >
//     {/* Button row */}
// {/* Top bar with button on left and search on right */}
// <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, width: "1000px" }}>
//   <Button
//     type="primary"
//     size="middle"
//     onClick={showModal}
//     style={{
//       background: "#7367F0",
//       borderColor: "#7367F0",
//       fontWeight: "bold",
//       borderRadius: "8px",
//       boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
//     }}
//   >
//     Create Template
//   </Button>

//   <Input
//     placeholder="Search templates..."
//     prefix={<SearchOutlined />}
//     value={searchText}
//     onChange={(e) => setSearchText(e.target.value)}
//     style={{
//       width: 250,
//       borderRadius: "6px",
//       border: "1px solid #d9d9d9"
//     }}
//   />
// </div>

// <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16,width: "1000px",}}>
  
// {/* Table row */}
// <Table
//   columns={columns.map(col => ({
//     ...col,
//     width: 50, // 🔹 reduce width per column
//     align: "center",
   
//   }))}
// //  dataSource={templates}
//   dataSource={filteredTemplates}
//   bordered
//   size="small" // 🔹 smaller row height
//   className="custom-table"
//   pagination={{ pageSize: 8, showSizeChanger: false }}
//   //scroll={{ y: 400, x: true }}
//   style={{
//     borderRadius: "8px",
//     overflow: "hidden",
//     boxShadow: "0 2px 10px rgba(0,0,0,0.1)" ,
//     width: "1000px"
//   }}
// />
// </div>

//     <Modal
//       open={open}
//       title="Create Template"
//       onCancel={hideModal}
//       onOk={submit}
//       okText="Submit"
//       bodyStyle={{ background: "#f9f9f9" }}
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         initialValues={{ language: "en", category: "MARKETING" }}
//       >
//         <Form.Item
//           name="name"
//           label="Name"
//           rules={[{ required: true, message: "Please enter name" }]}
//         >
//           <Input />
//         </Form.Item>
//         <Form.Item name="language" label="Language" rules={[{ required: true }]}>
//           <Select>
//             <Option value="en">English</Option>
//             {/* <Option value="es">Spanish</Option> */}
//           </Select>
//         </Form.Item>
//         <Form.Item name="category" label="Category" rules={[{ required: true }]}>
//           <Select>
//             <Option value="MARKETING">Marketing</Option>
//             <Option value="UTILITY">Utility</Option>
           
//           </Select>
//         </Form.Item>
//         <Form.Item
//           name="templateType"
//           label="Template Type"
//           rules={[{ required: true, message: "Please select template type" }]}
//         >
//           <Select
//             value={templateType}
//             onChange={(val) => setTemplateType(val)}   // ✅ update state
//             placeholder="Select template type"
//           >
//             <Option value="text">Text</Option>
//             <Option value="media">Media</Option>
//           </Select>
//         </Form.Item>

//         {/* If user selects Media → show Radio + Upload */}
//         {templateType === "media" && (
//           <Form.Item label="Media Options" required>
//             <Radio.Group
//               onChange={(e) => setMediaType(e.target.value)}
//               value={mediaType}
//               style={{ marginBottom: 8 }}
//             >
//               <Radio value="image">Image</Radio>
//               <Radio value="video">Video</Radio>
//             </Radio.Group>

//             {mediaType === "image" && (
//               <div>
//                 <input type="file" accept="image/*" onChange={handleFileChange} />
//                 <div style={{ fontSize: "12px" }}>Upload image less than 4MB</div>
//               </div>
//             )}

//             {mediaType === "video" && (
//               <div>
//                 <input type="file" accept="video/*" onChange={handleFileChange} />
//                 <div style={{ fontSize: "12px" }}>Upload video less than 9MB</div>
//               </div>
//             )}
//           </Form.Item>
//         )}
//         <Form.Item name="header" label="Header Text">
//           <Input />
//         </Form.Item>
//         <Form.Item
//           name="body"
//           label="Body Text"
//           rules={[{ required: true, message: "Please enter body text" }]}
//         >
//           <Input />
//         </Form.Item>
//         {/* <Form.Item
//           name="example"
//           label="Example Body Text"
//           rules={[{ required: true, message: "Please enter example text" }]}
//         >
//           <Input />
//         </Form.Item> */}
//         <Form.Item name="footer" label="Footer Text">
//           <Input />
//         </Form.Item>
//       </Form>
//     </Modal>
//   </div>
   
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>
            📑 Templates Manager
          </Title>
          <Switch
            checkedChildren={<AppstoreOutlined />}
            unCheckedChildren={<UnorderedListOutlined />}
            checked={gridView}
            onChange={() => setGridView(!gridView)}
          />
        </Space>
        <Space>
          <Search
            placeholder="Search templates..."
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            Create Template
          </Button>
        </Space>
      </Row>

      {/* Grid View */}
      {/* {gridView ? (
        <Row gutter={[16, 16]}>
          {pagedTemplates.map((t, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={t.id}>
              <Card
                hoverable
                style={{
                  height: 150,
                  background: gradients[i % gradients.length],
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                }}
                actions={[
                  <Tooltip title="Sync Template" key="sync">
                    <SyncOutlined style={{ color: "#fff" }} />
                  </Tooltip>,
                  <Tooltip title="Preview" key="preview">
                    <EyeOutlined
                      style={{ color: "#fff" }}
                      onClick={() => setPreview(t)}
                    />
                  </Tooltip>,
                ]}
              >
                <b style={{ fontSize: "16px", textAlign: "center" }}>{t.name}</b>
                <div style={{ marginTop: 8 }}>
                  <Tag color={typeColors[t.templateType] || "default"}>
                    {t.templateType}
                  </Tag>
                  <Tag color={statusColors[t.templateCreateStatus] || "default"}>
                    {t.templateCreateStatus}
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )*/} 
      {/* Grid (Tile) View */}
      {gridView ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)", // ✅ 5 per row
              gap: "16px",
            }}
          >
            {pagedTemplates.map((t, i) => (
              <Card
                key={t.id}
                hoverable
                style={{
                  height: 120,
                  background: gradients[i % gradients.length],
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                  padding: "12px",
                }}
                bodyStyle={{ padding: 0, width: "100%" }}
              >
                {/* Title */}
                <div style={{ textAlign: "center" }}>
                  {/* <b style={{ fontSize: "16px" }}>{t.name}</b> */}
                  <b style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#fff",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                  }}>
                    {t.name}
                  </b>
                </div>

                {/* Tags */}
                <div style={{ marginTop: 8, textAlign: "center" }}>
                  <Tag color={typeColors[t.templateType] || "default"}>
                    {t.templateType}
                  </Tag>
                  <Tag color={statusColors[t.templateCreateStatus] || "default"}>
                    {t.templateCreateStatus}
                  </Tag>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    marginTop: "12px",
                  }}
                >
                  <Tooltip title="Sync Template">
                    <SyncOutlined
                      style={{ fontSize: "20px", color: "#fff", cursor: "pointer" }}
                      onClick={() => syncTemplate1(t.name)}
                    />
                  </Tooltip>
                  <Tooltip title="Preview">
                    <EyeOutlined
                      style={{ fontSize: "20px", color: "#fff", cursor: "pointer" }}
                      onClick={() => setPreview(t)}
                    />
                  </Tooltip>
                </div>
              </Card>
            ))}
          </div>
)
      : ( 
        // List view
         <Table
    columns={columns}
    dataSource={filteredTemplates.slice(start, start + pageSize)}
    rowKey="id"
    bordered
    size="middle"
    pagination={false}
    className="custom-table"
  />

      )}

      {/* Pagination */}
      <Row justify="center" style={{ marginTop: 20 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredTemplates.length}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          showSizeChanger
          pageSizeOptions={["15", "30"]}
        />
      </Row>

      {/* Drawer Preview */}
      <Drawer
        title={`Preview: ${preview?.name}`}
        placement="right"
        onClose={() => setPreview(null)}
        open={!!preview}
        width={400}
      >
        {preview && (
          <div
            style={{
              height: 150,
              background: gradients[0],
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "12px",
              marginBottom: "16px",
            }}
          >
            <b style={{ fontSize: "16px" }}>{preview.name}</b>
            <div style={{ marginTop: 8 }}>
              <Tag color={typeColors[preview.templateType] || "default"}>
                {preview.templateType}
              </Tag>
              <Tag color={statusColors[preview.templateCreateStatus] || "default"}>
                {preview.templateCreateStatus}
              </Tag>
            </div>
          </div>
        )}
      </Drawer>

     <Modal
      open={open}
      title="Create Template"
      onCancel={hideModal}
      onOk={submit}
      okText="Submit"
      bodyStyle={{ background: "#f9f9f9" }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ language: "en", category: "MARKETING" }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="language" label="Language" rules={[{ required: true }]}>
          <Select>
            <Option value="en">English</Option>
            {/* <Option value="es">Spanish</Option> */}
          </Select>
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select>
            <Option value="MARKETING">Marketing</Option>
            <Option value="UTILITY">Utility</Option>
           
          </Select>
        </Form.Item>
        <Form.Item
          name="templateType"
          label="Template Type"
          rules={[{ required: true, message: "Please select template type" }]}
        >
          <Select
            value={templateType}
            onChange={(val) => setTemplateType(val)}   // ✅ update state
            placeholder="Select template type"
          >
            <Option value="text">Text</Option>
            <Option value="media">Media</Option>
          </Select>
        </Form.Item>

        {/* If user selects Media → show Radio + Upload */}
        {templateType === "media" && (
          <Form.Item label="Media Options" required>
            <Radio.Group
              onChange={(e) => setMediaType(e.target.value)}
              value={mediaType}
              style={{ marginBottom: 8 }}
            >
              <Radio value="image">Image</Radio>
              <Radio value="video">Video</Radio>
            </Radio.Group>

            {mediaType === "image" && (
              <div>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div style={{ fontSize: "12px" }}>Upload image less than 4MB</div>
              </div>
            )}

            {mediaType === "video" && (
              <div>
                <input type="file" accept="video/*" onChange={handleFileChange} />
                <div style={{ fontSize: "12px" }}>Upload video less than 9MB</div>
              </div>
            )}
          </Form.Item>
        )}
        <Form.Item name="header" label="Header Text">
          <Input />
        </Form.Item>
        <Form.Item
          name="body"
          label="Body Text"
          rules={[{ required: true, message: "Please enter body text" }]}
        >
          <Input />
        </Form.Item>
        {/* <Form.Item
          name="example"
          label="Example Body Text"
          rules={[{ required: true, message: "Please enter example text" }]}
        >
          <Input />
        </Form.Item> */}
        <Form.Item name="footer" label="Footer Text">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
    </div>

);
}