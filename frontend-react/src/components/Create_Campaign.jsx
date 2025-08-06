import React from 'react';
import { Form, Card, DatePicker, Row, Col, InputNumber, Select, Button, Typography, Input } from 'antd';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function Create_Campaign() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Campaign configuration:', values);
    // TODO: submit to API
  };

  return (
    <div style={{ fontWeight:'bold',padding: 5, background: '#f0f2f5', minHeight: '50vh' }}>
      <Title level={2}>Create Campaign</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Campaign Period */}
        <Card title="Campaign Period" style={{ marginTop: 15 }}>
          <Form.Item
            name="campaignPeriod"
            label="Period"
            rules={[{ required: true, message: 'Please select campaign dates' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        {/* Customer Selection */}
        <Card title="Customer Selection" style={{ marginTop: 5 }}>
          <Title level={5} style={{ marginTop: 5 }}>RFM Parameters</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="recencyRange"
                label="Recency (Days)"
                rules={[{ required: true }]}
              >
                <InputNumber placeholder="Min" style={{ width: '45%', marginRight: '10%' }} />
                <InputNumber placeholder="Max" style={{ width: '45%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="frequencyRange"
                label="Frequency"
                rules={[{ required: true }]}
              >
                <InputNumber placeholder="Min" style={{ width: '45%', marginRight: '10%' }} />
                <InputNumber placeholder="Max" style={{ width: '45%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="monetaryRange"
                label="Monetary"
                rules={[{ required: true }]}
              >
                <InputNumber
                  placeholder="Min"
                  style={{ width: '45%', marginRight: '10%' }}
                  formatter={value => `₹ ${value}`}
                />
                <InputNumber
                  placeholder="Max"
                  style={{ width: '45%' }}
                  formatter={value => `₹ ${value}`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="rScore" label="R-Score">
                <Select placeholder="Select score">
                  {[5,4,3,2,1].map(i => (
                    <Select.Option key={i} value={i}>{i}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fScore" label="F-Score">
                <Select placeholder="Select score">
                  {[5,4,3,2,1].map(i => (
                    <Select.Option key={i} value={i}>{i}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mScore" label="M-Score">
                <Select placeholder="Select score">
                  {[5,4,3,2,1].map(i => (
                    <Select.Option key={i} value={i}>{i}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 24 }}>RFM Segment</Title>
          <Form.Item name="rfmSegment" rules={[{ required: true, message: 'Select at least one segment' }]}>  
            <Select mode="multiple" placeholder="Select segments">
              <Select.Option value="Champions">Champions</Select.Option>
              <Select.Option value="Potential Loyalists">Potential Loyalists</Select.Option>
              <Select.Option value="New Customers">New Customers</Select.Option>
              <Select.Option value="At Risk">At Risk</Select.Option>
              <Select.Option value="Lost">Lost</Select.Option>
            </Select>
          </Form.Item>
        </Card>

        {/* Geography */}
        <Card title="Geography" style={{ marginTop: 5 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="branch" label="Branch">
                <Select placeholder="Select branch">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Branch A">Branch A</Select.Option>
                  <Select.Option value="Branch B">Branch B</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Select placeholder="Select city">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="City X">City X</Select.Option>
                  <Select.Option value="City Y">City Y</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Select placeholder="Select state">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="State 1">State 1</Select.Option>
                  <Select.Option value="State 2">State 2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Purchase */}
        <Card title="Purchase" style={{ marginTop: 5 }}>
          <Form.Item
            name="purchaseType"
            label="Purchase Type"
            rules={[{ required: true, message: 'Select purchase type' }]}
          >
            <Select placeholder="Any Purchase or Recent Purchase">
              <Select.Option value="any">Any Purchase</Select.Option>
              <Select.Option value="recent">Recent Purchase</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="purchaseBranch" label="Branch">
                <Select placeholder="Select branch">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Branch A">Branch A</Select.Option>
                  <Select.Option value="Branch B">Branch B</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="section" label="Section">
                <Select placeholder="Select section">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Section 1">Section 1</Select.Option>
                  <Select.Option value="Section 2">Section 2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product" label="Product">
                <Select placeholder="Select product">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Product X">Product X</Select.Option>
                  <Select.Option value="Product Y">Product Y</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="model" label="Model">
                <Input placeholder="Enter model" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="item" label="Item">
                <Input placeholder="Enter item" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="valueThreshold" label="Value Threshold">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`}
                  min={0}
                  placeholder="e.g. ≥ 50000"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Submit button */}
        <Form.Item style={{ textAlign: 'center', marginTop: 5 }}>
          <Button type="primary" htmlType="submit" size="large">
            Create Campaign
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
