import React, { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Campaign_Summary() {
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
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => navigate(`/create-campaign?campaignId=${record.id}`)}>Edit</Button>
      ),
    },
  ];

  return <Table rowKey="id" dataSource={campaigns} columns={columns} />;
}