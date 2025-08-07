import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Card, DatePicker, Row, Col, InputNumber, Select, Button, Typography, Input, Checkbox } from 'antd';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function Create_Campaign() {
  const [form] = Form.useForm();
  // const [options, setOptions] = useState({
  //   segments: [],
  //   branches: [],
  //   cities: [],
  //   states: [],
  //   sections: [],
  //   products: [],
  // });

   const [opts, setOpts] = useState({
    r_scores: [], f_scores: [], m_scores: [], rfm_segments: [],
    branches: [], branch_city_map: {}, branch_state_map: {},
    sections: [], products: [], models: [], items: []
  });

  useEffect(() => {
    axios.get('http://localhost:8000/campaign/options')
      .then(res => setOpts(res.data))
      .catch(() => message.error('Failed to load filters'));
  }, []);


  const {
    r_scores, f_scores, m_scores, rfm_segments,
    branches, branch_city_map, branch_state_map,
    sections, products, models, items
  } = opts;

  // helper for cascading city/state
  const selectedBranches = Form.useFormInstance().getFieldValue('branch') || [];
  const cityOptions = Array.from(
    new Set(selectedBranches.flatMap(b => branch_city_map[b] || []))
  );
  const stateOptions = Array.from(
    new Set(selectedBranches.flatMap(b => branch_state_map[b] || []))
  );



  // const onFinish = (values) => {
  //   console.log('Campaign configuration:', values);
  //   // TODO: submit to API
  // };
const onFinish = async values => {
  const [startMoment, endMoment] = values.campaignPeriod;
  const payload = {
    start_date:       startMoment.format('YYYY-MM-DD'),
    end_date:         endMoment.format('YYYY-MM-DD'),

    recency_op:       values.recencyOp,
    recency_min:      values.recencyMin,
    recency_max:      values.recencyMax,

    frequency_op:     values.frequencyOp,
    frequency_min:    values.frequencyMin,
    frequency_max:    values.frequencyMax,

    monetary_op:      values.monetaryOp,
    monetary_min:     values.monetaryMin,
    monetary_max:     values.monetaryMax,

    r_score:          values.rScore,
    f_score:          values.fScore,
    m_score:          values.mScore,
    rfm_segments:     values.rfmSegment,

    branch:           values.branch,
    city:             values.city,
    state:            values.state,

    birthday_date:    values.birthdayDate?.format('YYYY-MM-DD'),
    anniversary_date: values.anniversaryDate?.format('YYYY-MM-DD'),

    purchase_type:    values.purchaseType,
    purchase_branch:  values.purchaseBranch,
    section:          values.section,
    product:          values.product,

    model:            values.model,
    item:             values.item,
    value_threshold:  values.valueThreshold,
  };

  try {
    await axios.post('http://localhost:8000/campaign', payload);
    message.success('Campaign saved successfully');
    form.resetFields();
  } catch (err) {
    console.error(err);
    message.error('Failed to save campaign');
  }
};

  return (
    <div style={{ fontWeight: 'bold', padding: 5, background: '#f0f2f5', minHeight: '50vh' }}>
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
          <Row gutter={16}>
              {/* Recency */}
              <Col span={8}>
                <Form.Item name="recencyOp" label="Recency Operator" rules={[{ required: true }]}>
                  <Select placeholder="Operator">
                    <Select.Option value="=">=</Select.Option>
                    <Select.Option value=">=">≥</Select.Option>
                    <Select.Option value="<=">≤</Select.Option>
                    <Select.Option value="between">Between</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  noStyle
                  dependencies={['recencyOp']}
                >
                  {({ getFieldValue }) => {
                    const op = getFieldValue('recencyOp');
                    return (
                      <Form.Item
                        label="Recency (Days)"
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'Enter recency' }]}
                      >
                        {op === 'between' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Form.Item name="recencyMin" noStyle>
                              <InputNumber style={{ flex: 1 }} placeholder="Min" />
                            </Form.Item>
                            <Form.Item name="recencyMax" noStyle>
                              <InputNumber style={{ flex: 1 }} placeholder="Max" />
                            </Form.Item>
                          </div>
                        ) : (
                          <Form.Item name="recencyMin" noStyle>
                            <InputNumber style={{ width: '100%' }} placeholder="Value" />
                          </Form.Item>
                        )}
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>

              {/* Frequency */}
              <Col span={8}>
                <Form.Item name="frequencyOp" label="Frequency Operator" rules={[{ required: true }]}>
                  <Select placeholder="Operator">
                    <Select.Option value="=">=</Select.Option>
                    <Select.Option value=">=">≥</Select.Option>
                    <Select.Option value="<=">≤</Select.Option>
                    <Select.Option value="between">Between</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  noStyle
                  dependencies={['frequencyOp']}
                >
                  {({ getFieldValue }) => {
                    const op = getFieldValue('frequencyOp');
                    return (
                      <Form.Item
                        label="Frequency"
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'Enter frequency' }]}
                      >
                        {op === 'between' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Form.Item name="frequencyMin" noStyle>
                              <InputNumber style={{ flex: 1 }} placeholder="Min" />
                            </Form.Item>
                            <Form.Item name="frequencyMax" noStyle>
                              <InputNumber style={{ flex: 1 }} placeholder="Max" />
                            </Form.Item>
                          </div>
                        ) : (
                          <Form.Item name="frequencyMin" noStyle>
                            <InputNumber style={{ width: '100%' }} placeholder="Value" />
                          </Form.Item>
                        )}
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>

              {/* Monetary */}
              <Col span={8}>
                <Form.Item name="monetaryOp" label="Monetary Operator" rules={[{ required: true }]}>
                  <Select placeholder="Operator">
                    <Select.Option value="=">=</Select.Option>
                    <Select.Option value=">=">≥</Select.Option>
                    <Select.Option value="<=">≤</Select.Option>
                    <Select.Option value="between">Between</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  noStyle
                  dependencies={['monetaryOp']}
                >
                  {({ getFieldValue }) => {
                    const op = getFieldValue('monetaryOp');
                    return (
                      <Form.Item
                        label="Monetary (₹)"
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'Enter amount' }]}
                      >
                        {op === 'between' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Form.Item name="monetaryMin" noStyle>
                              <InputNumber style={{ flex: 1 }} placeholder="Min" formatter={v => `₹ ${v}`} />
                            </Form.Item>
                            <Form.Item name="monetaryMax" noStyle>
                              <InputNumber style={{ flex: 1 }} placeholder="Max" formatter={v => `₹ ${v}`} />
                            </Form.Item>
                          </div>
                        ) : (
                          <Form.Item name="monetaryMin" noStyle>
                            <InputNumber style={{ width: '100%' }} placeholder="Value" formatter={v => `₹ ${v}`} />
                          </Form.Item>
                        )}
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="rScore" label="R-Score">
                <Select mode="multiple" placeholder="Select score">
                  {[5,4,3,2,1].map(i => (
                    <Select.Option key={i} value={i}>{i}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fScore" label="F-Score">
                <Select mode="multiple" placeholder="Select score">
                  {[5,4,3,2,1].map(i => (
                    <Select.Option key={i} value={i}>{i}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mScore" label="M-Score">
                <Select mode="multiple" placeholder="Select score">
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
                <Select mode="multiple" placeholder="Select branch">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Branch A">Branch A</Select.Option>
                  <Select.Option value="Branch B">Branch B</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Select mode="multiple" placeholder="Select city">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="City1">City1</Select.Option>
                  <Select.Option value="City2">City2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Select mode="multiple" placeholder="Select state">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="State1">State1</Select.Option>
                  <Select.Option value="State2">State2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Occasions */}
        <Card title="Occasions" style={{ marginTop: 5 }} bodyStyle={{ padding: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="birthdayDate"
                label="Birthday Date"
                style={{ marginBottom: 8 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="anniversaryDate"
                label="Anniversary Date"
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
            <Select mode="multiple" placeholder="Any Purchase or Recent Purchase">
              <Select.Option value="any">Any Purchase</Select.Option>
              <Select.Option value="recent">Recent Purchase</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="purchaseBrand" label="Brand">
                <Select mode="multiple" placeholder="Select brand">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Brand1">Brand1</Select.Option>
                  <Select.Option value="Brand2">Brand2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="section" label="Section">
                <Select mode="multiple" placeholder="Select section">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Section1">Section1</Select.Option>
                  <Select.Option value="Section2">Section2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product" label="Product">
                <Select mode="multiple" placeholder="Select product">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Product1">Product1</Select.Option>
                  <Select.Option value="Product2">Product2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="model" label="Model">
                <Select mode="multiple" placeholder="Select model">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Model1">Model1</Select.Option>
                  <Select.Option value="Model2">Model2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="item" label="Item">
                <Select mode="multiple" placeholder="Select item">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Item1">Item1</Select.Option>
                  <Select.Option value="Item2">Item2</Select.Option>
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
