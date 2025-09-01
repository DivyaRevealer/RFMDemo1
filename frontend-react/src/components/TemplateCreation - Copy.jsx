import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Select, message ,Table } from 'antd';
import api from '../api';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function TemplateCreation() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [searchText, setSearchText] = useState("");
  // filtered data before rendering table
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchText.toLowerCase())
    );
  
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    // { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
    // { title: 'Modified At', dataIndex: 'modifiedAt', key: 'modifiedAt' },
    // { title: 'TemplateName', dataIndex: 'templateName', key: 'templateName' },
    { title: 'TemplateType', dataIndex: 'templateType', key: 'templateType' },
    { title: 'TemplateCreateStatus', dataIndex: 'templateCreateStatus', key: 'templateCreateStatus' }
  ];

  const loadTemplates = () => {
    api
      //.get('/getAlltemplates')
      .get("/campaign/templates/getAlltemplates")
      .then(res => {
        console.log("res.data.templates----- ",res)
        const list = (res.data.templates || res.data || []).map(t => ({
          key: t.id || t.name,
          name: t.name,
        //   createdAt: t.created_at || t.createdAt,
        //   modifiedAt: t.modified_at || t.modifiedAt,
        //   templateName: t.template_name || t.templateName || t.name,
          templateType: t.template_type || t.templateType || t.category,
          templateCreateStatus:
           t.Status,
        }));
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
//     form
//       .validateFields()
//       .then(values => {
//         const payload = {
//           name: values.name,
//           language: values.language,
//           category: values.category,
//           components: [
//             { type: 'HEADER', format: 'TEXT', text: values.header || '' },
//             {
//               type: 'BODY',
//               text: values.body,
//               example: { body_text: [[values.example || "sample text"]] }
//             },
//             { type: 'FOOTER', text: values.footer || '' }
//           ]
//         };

//         console.log("payload----------",JSON.stringify(payload))

//         // api
//         //   .post('/templates', payload)
//         //   .then(() => {
//         //     message.success('Template created');
//         //     hideModal();
//         //   })

//         // fetch(`https://cloudapi.wbbox.in/api/v1.0/create-templates/917996666220`, {
//         //     method: "POST",
//         //     headers: {
//         //         "Authorization": `Bearer skI7lyZ0g0qj4dHDvwJ5k`,
//         //         "Content-Type": "application/json"
//         //     },
//         //     body: JSON.stringify(payload)
//         //     })
//         //     .then(res => res.json())
//         //     .then(() => message.success("Template created"))
//         //     .catch(() => message.error("Failed to create template"));      
//          api
//           .post('/campaign/templates', { channel: values.channel, ...payload })
//           .then(() => {
//             message.success('Template created');
//             hideModal();
//           })
//           .catch(() => message.error('Failed to create template'));              
//       })
//       .catch(() => {});
//   };

form
    .validateFields()
    .then(values => {
      // check if body has placeholders like {{1}}
      const bodyHasVars = /\{\{\d+\}\}/.test(values.body);

      const bodyComponent = bodyHasVars
        ? {
            type: "BODY",
            text: values.body,
            example: { body_text: [[values.example || "sample text"]] }
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
        .then(() => {
          message.success("Template created");
          hideModal();
        })
        .catch(() => message.error("Failed to create template"));
    })
    .catch(() => {});
};


  return (
  <div
    style={{
      height: "100vh",
      padding: "20px",
      background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
    }}
  >
    {/* Button row */}
<div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
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
</div>

{/* Table row */}
<Table
  columns={columns.map(col => ({
    ...col,
    width: 50, // 🔹 reduce width per column
    align: "center"
  }))}
  dataSource={templates}
  bordered
  size="middle" // 🔹 smaller row height
  pagination={{ pageSize: 10, showSizeChanger: false }}
  scroll={{ y: 400, x: true }}
  style={{
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  }}
/>


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
            <Option value="es">Spanish</Option>
          </Select>
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select>
            <Option value="MARKETING">Marketing</Option>
            <Option value="UTILITY">Utility</Option>
            <Option value="AUTHENTICATION">Authentication</Option>
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
        <Form.Item
          name="example"
          label="Example Body Text"
          rules={[{ required: true, message: "Please enter example text" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="footer" label="Footer Text">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  </div>
);
}