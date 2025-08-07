// import React, { useEffect, useState } from 'react';
// import { Table, Button, message } from 'antd';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';

// export default function Campaign_Summary() {
//   const [campaigns, setCampaigns] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     api
//       .get('/campaign')
//       .then(res => setCampaigns(res.data))
//       .catch(() => message.error('Failed to load campaigns'));
//   }, []);

//   const columns = [
//     { title: 'ID', dataIndex: 'id', key: 'id' },
//     { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
//     { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <Button onClick={() => navigate(`/create-campaign?campaignId=${record.id}`)}>Edit</Button>
//       ),
//     },
//   ];

//   return <Table rowKey="id" dataSource={campaigns} columns={columns} />;
// }


import React, { useEffect, useState } from 'react';
import { Table, Button, message, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title } = Typography;

export default function CampaignSummary() {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/campaign')
      .then(res => setCampaigns(res.data))
      .catch(() => message.error('Failed to load campaigns'));
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          onClick={() => navigate(`/create-campaign?campaignId=${record.id}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Card bordered style={{ margin: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
        Campaign Summary
      </Title>
      <Table
        rowKey="id"
        dataSource={campaigns}
        columns={columns}
        bordered
        pagination={{ pageSize: 10 }}
        size="middle"
        onRow={(record, index) => ({
          style: { backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff' }
        })}
      />
    </Card>
  );
}
