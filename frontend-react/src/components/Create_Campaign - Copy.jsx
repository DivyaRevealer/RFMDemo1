//import React from 'react';
import React, { useEffect, useState } from 'react';
import { Form, Card, DatePicker, Row, Col, InputNumber, Select, Button, Typography, Input, Checkbox  } from 'antd';

const { Title } = Typography;
const { RangePicker } = DatePicker;
//const { RangePicker, DatePicker: SingleDatePicker } = DatePicker;

export default function Create_Campaign() {
  const [form] = Form.useForm();
   const [options, setOptions] = useState({
    segments: [],
    branches: [],
    cities: [],
    states: [],
    sections: [],
    products: [],
  });

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await axios.get('http://localhost:8000/campaign/options');
        setOptions(res.data);
      } catch (err) {
        console.error('Failed to load campaign options', err);
      }
    }
    fetchOptions();
  }, []);

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
        <Card title="RFM Parameters" style={{ marginTop: 5 }}>
          {/* <Title level={5} style={{ marginTop: 5 }}>RFM Parameters</Title> */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="recencyRange"
                label="Recency (Days)"
                rules={[{ required: true }]}
              >

                <Select placeholder="Operator" style={{ width: '45%', marginRight: '10%' }} >
                  <Select.Option value="=">=</Select.Option>
                  <Select.Option value=">=">≥</Select.Option>
                  <Select.Option value="<=">≤</Select.Option>
                  <Select.Option value="between">Between</Select.Option>
                </Select>
                 <InputNumber placeholder="Max" style={{ width: '45%' }} />
                {/* <InputNumber placeholder="Min" style={{ width: '45%', marginRight: '10%' }} /> */}
                {/* <InputNumber placeholder="Max" style={{ width: '45%' }} /> */}
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
               {/* {options.segments.map((seg) => (
                <Select.Option key={seg} value={seg}>{seg}</Select.Option>
              ))} */}
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
                   {/* {options.branches.map((b) => (
                    <Select.Option key={b} value={b}>{b}</Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Select placeholder="Select city">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="City1">City1</Select.Option>
                  <Select.Option value="City2">City2</Select.Option>
                  {/* {options.cities.map((c) => (
                    <Select.Option key={c} value={c}>{c}</Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Select placeholder="Select state">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="State1">State1</Select.Option>
                  <Select.Option value="State2">State2</Select.Option>
                   {/* {options.states.map((s) => (
                    <Select.Option key={s} value={s}>{s}</Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

          {/* Occasions */}
        <Card title="Occasions" style={{ marginTop: 5 }} bodyStyle={{ padding: 12 }}>
          {/* <Form.Item
            name="occasions"
            label="Occasion Type"
            rules={[{ required: true, message: 'Select at least one occasion' }]}
            style={{ marginBottom: 8 }}
          >
            <Checkbox.Group
              options={[
                { label: 'Birthday', value: 'birthday' },
                { label: 'Anniversary', value: 'anniversary' }
              ]}
            />
          </Form.Item> */}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="birthdayDate"
                label="Birthday Date"
                rules={[{ required: ({ getFieldValue }) => getFieldValue('occasions')?.includes('birthday'), message: 'Select a birthday date' }]}
                style={{ marginBottom: 8 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="anniversaryDate"
                label="Anniversary Date"
                rules={[{ required: ({ getFieldValue }) => getFieldValue('occasions')?.includes('anniversary'), message: 'Select an anniversary date' }]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker style={{ width: '100%' }} />
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
                  <Select.Option value="Branch1">Branch1</Select.Option>
                  <Select.Option value="Branch2">Branch2</Select.Option>
                  {/* {options.branches.map((b) => (
                    <Select.Option key={b} value={b}>{b}</Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="section" label="Section">
                <Select placeholder="Select section">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Section1">Section1</Select.Option>
                  <Select.Option value="Section2">Section2</Select.Option>
                  {/* {options.sections.map((s) => (
                    <Select.Option key={s} value={s}>{s}</Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product" label="Product">
                <Select placeholder="Select product">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Product1">Product1</Select.Option>
                  <Select.Option value="Product2">Product2</Select.Option>
                  {/* {options.products.map((p) => (
                    <Select.Option key={p} value={p}>{p}</Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="model" label="Model">
                <Select placeholder="Select product">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Model1">Model1</Select.Option>
                  <Select.Option value="Model2">Model2</Select.Option>
                  {/* {options.products.map((p) => (
                    <Select.Option key={p} value={p}>{p}</Select.Option>
                  ))} */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="item" label="Item">
                <Select placeholder="Select product">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Item1">Item1</Select.Option>
                  <Select.Option value="Item2">Item2</Select.Option>
                  {/* {options.products.map((p) => (
                    <Select.Option key={p} value={p}>{p}</Select.Option>
                  ))} */}
                </Select>
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
