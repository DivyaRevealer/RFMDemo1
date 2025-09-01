import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, message ,Table } from 'antd';
import api from '../api';
import "../css/template.css";
import { SearchOutlined } from '@ant-design/icons';
import { SyncOutlined } from '@ant-design/icons'; 

const { Option } = Select;

export default function TemplateCreation() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [searchText, setSearchText] = useState("");
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
  };

  const submit = () => {

      form
          .validateFields()
          .then(values => {
            // check if body has placeholders like {{1}}
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

            api
              .post("/campaign/templates/create-template", { channel: values.channel, ...payload })
              .then((res) => {
                //message.success("Template created");
                // if backend returns sync status:
                if (res.data.success==true) {
                  console.log("Succesfull!!!!!!!!!!");
                  syncTemplate(values.name)
                  
                }

                hideModal();
              })
              .catch(() => message.error("Failed to create template"));
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



  return (
  <div
    style={{
      //height: "100vh",
      height: "600px",
      width: "1100px",
      padding: "20px", paddingLeft:"200px"
      //background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
    }}
  >
    {/* Button row */}
{/* Top bar with button on left and search on right */}
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, width: "1000px" }}>
  <Button
    type="primary"
    size="middle"
    onClick={showModal}
    style={{
      background: "#7367F0",
      borderColor: "#7367F0",
      fontWeight: "bold",
      borderRadius: "8px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
    }}
  >
    Create Template
  </Button>

  <Input
    placeholder="Search templates..."
    prefix={<SearchOutlined />}
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    style={{
      width: 250,
      borderRadius: "6px",
      border: "1px solid #d9d9d9"
    }}
  />
</div>

<div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16,width: "1000px",}}>
  
{/* Table row */}
<Table
  columns={columns.map(col => ({
    ...col,
    width: 50, // 🔹 reduce width per column
    align: "center",
   
  }))}
//  dataSource={templates}
  dataSource={filteredTemplates}
  bordered
  size="small" // 🔹 smaller row height
  className="custom-table"
  pagination={{ pageSize: 8, showSizeChanger: false }}
  //scroll={{ y: 400, x: true }}
  style={{
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)" ,
    width: "1000px"
  }}
/>
</div>

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