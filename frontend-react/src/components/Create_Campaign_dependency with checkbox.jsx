import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Card, DatePicker, Row, Col, InputNumber, Select, Button, Typography, Input, Checkbox } from 'antd';
import api from '../api';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function Create_Campaign() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const isEditing = !!campaignId;

  const [options, setOptions] = useState({
    r_scores: [],
    f_scores: [],
    m_scores: [],
    rfm_segments: [],

    branches: [],
    branch_city_map: {},
    branch_state_map: {},
    brands: [],
    sections: [],
    products: [],
    models: [],
    items: []
  });

  const { brands } = options;
  const { sections } = options;
  const { products } = options;
  const { models } = options;
  const { items } = options;

  const { r_scores } = options;
  const { f_scores } = options;
  const { m_scores } = options;
  const { rfm_segments } = options;

  const { branches } = options;
  const { branch_city_map } = options;
  const { branch_state_map } = options;

  useEffect(() => {
    axios.get('http://localhost:8000/campaign/options')
      .then(res => {
        console.log('🗺️ branchCityMap:', res.data.branch_city_map);
        setOptions(res.data)
      })
      .catch(() => message.error('Failed to load filters'));
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    api
      .get(`/campaign/${campaignId}`)
      .then(res => {
        const data = res.data;
        form.setFieldsValue({
          name: data.name,
          campaignPeriod: [dayjs(data.start_date), dayjs(data.end_date)],
          recencyOp: data.recency_op,
          recencyMin: data.recency_min,
          recencyMax: data.recency_max,
          frequencyOp: data.frequency_op,
          frequencyMin: data.frequency_min,
          frequencyMax: data.frequency_max,
          monetaryOp: data.monetary_op,
          monetaryMin: data.monetary_min,
          monetaryMax: data.monetary_max,
          rScore: data.r_score,
          fScore: data.f_score,
          mScore: data.m_score,
          rfmSegment: data.rfm_segments,
          branch: data.branch,
          city: data.city,
          state: data.state,
          birthdayDate: data.birthday_date ? dayjs(data.birthday_date) : null,
          anniversaryDate: data.anniversary_date ? dayjs(data.anniversary_date) : null,
          purchaseType: data.purchase_type,
          purchaseBrand: data.purchase_brand,
          section: data.section,
          product: data.product,
          model: data.model,
          item: data.item,
          valueThreshold: data.value_threshold,
        });
      })
      .catch(() => message.error('Failed to load campaign'));
  }, [campaignId, form]);

  const onFinish = async values => {
    const [startMoment, endMoment] = values.campaignPeriod;
    const payload = {
      name:             values.name,
      start_date:       startMoment.format('YYYY-MM-DD'),
      end_date:         endMoment.format('YYYY-MM-DD'),

      recency_op:       values.recencyOp,
      recency_min:      values.recencyMin,
      ...(values.recencyOp === 'between'
        ? { recency_max: values.recencyMax }
        : { recency_max: values.recencyMin }),

      frequency_op:     values.frequencyOp,
      frequency_min:    values.frequencyMin,
      ...(values.frequencyOp === 'between'
        ? { frequency_max: values.frequencyMax }
        : { frequency_max: values.frequencyMin }),

      monetary_op:      values.monetaryOp,
      monetary_min:     values.monetaryMin,
      ...(values.monetaryOp === 'between'
        ? { monetary_max: values.monetaryMax }
        : { monetary_max: values.monetaryMin }),

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
      purchase_brand:   values.purchaseBrand,
      section:          values.section,
      product:          values.product,

      model:            values.model,
      item:             values.item,
      value_threshold:  values.valueThreshold,
    };

    try {
      if (campaignId) {
        await api.put(`/campaign/${campaignId}`, payload);
        message.success('Campaign updated successfully');
      } else {
        await api.post('/campaign/createCampaign', payload);
        message.success('Campaign saved successfully');
      }
    } catch (err) {
      console.error('🚨 Save failed:', err.response ? err.response.data : err);
      message.error('Failed to save campaign');
    }
  };

  // ----- mutual dependency logic (already in your file) -----
  const watchBranch = Form.useWatch('branch', form) || [];
  const watchCity   = Form.useWatch('city', form)   || [];
  const watchState  = Form.useWatch('state', form)  || [];

  const computeGeoOptions = () => {
    // branches allowed by selected city/state
    const allowedBranches = branches.filter(b => {
      const cities = branch_city_map?.[b] || [];
      const states = branch_state_map?.[b] || [];
      const cityOK  = watchCity.length  ? watchCity.some(c => cities.includes(c)) : true;
      const stateOK = watchState.length ? watchState.some(s => states.includes(s)) : true;
      return cityOK && stateOK;
    });

    // cities allowed by selected branch/state
    const allCitiesFromAllowedBranches = new Set(
      ((watchBranch.length ? watchBranch : allowedBranches).flatMap(b => branch_city_map?.[b] || []))
    );
    const allowedCities = Array.from(allCitiesFromAllowedBranches)
      .filter(c => (watchState.length
        ? allowedBranches.some(b => (branch_city_map?.[b] || []).includes(c) &&
                                    (branch_state_map?.[b] || []).some(s => watchState.includes(s)))
        : true));

    // states allowed by selected branch/city
    const allStatesFromAllowedBranches = new Set(
      ((watchBranch.length ? watchBranch : allowedBranches).flatMap(b => branch_state_map?.[b] || []))
    );
    const allowedStates = Array.from(allStatesFromAllowedBranches)
      .filter(s => (watchCity.length
        ? allowedBranches.some(b => (branch_state_map?.[b] || []).includes(s) &&
                                    (branch_city_map?.[b] || []).some(c => watchCity.includes(c)))
        : true));

    return { allowedBranches, allowedCities, allowedStates };
  };

  useEffect(() => {
    const { allowedBranches, allowedCities, allowedStates } = computeGeoOptions();
    const pruned = {
      branch: watchBranch.filter(b => allowedBranches.includes(b)),
      city:   watchCity.filter(c   => allowedCities.includes(c)),
      state:  watchState.filter(s  => allowedStates.includes(s)),
    };
    if (pruned.branch.length !== watchBranch.length ||
        pruned.city.length   !== watchCity.length   ||
        pruned.state.length  !== watchState.length) {
      form.setFieldsValue(pruned);
    }
  }, [watchBranch, watchCity, watchState, branch_city_map, branch_state_map, branches]);

  // ----- NEW: reusable checkbox multi-select with "Select All" -----
  const MultiCheck = ({ name, label, optionsProvider }) => {
    const allowed = optionsProvider(); // compute on render to stay in sync
    const selected = Form.useWatch(name, form) || [];

    const allChecked = allowed.length > 0 && selected.length === allowed.length;
    const isIndeterminate = selected.length > 0 && selected.length < allowed.length;

    const onToggleAll = e => {
      form.setFieldsValue({ [name]: e.target.checked ? allowed : [] });
    };

    const onChange = vals => {
      form.setFieldsValue({ [name]: vals });
    };

    return (
      <Form.Item label={label} name={name} style={{ marginBottom: 8 }}>
        <>
          <Checkbox
            indeterminate={isIndeterminate}
            checked={allChecked}
            onChange={onToggleAll}
            style={{ marginBottom: 8 }}
          >
            Select All
          </Checkbox>
          <Checkbox.Group
            options={allowed.map(v => ({ label: v, value: v }))}
            value={selected}
            onChange={onChange}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              maxHeight: 180,
              overflowY: 'auto',
              padding: '6px 8px',
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 6
            }}
          />
        </>
      </Form.Item>
    );
  };

  return (
    <div style={{ fontWeight: 'bold', padding: 5, background: '#f0f2f5', minHeight: '50vh' }}>
      <Title level={2}>{isEditing ? 'Update Campaign' : 'Create Campaign'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 960, margin: '0 auto' }}>
        <Card title="Campaign Details" style={{ marginTop: 15 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter campaign name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="campaignPeriod"
                label="Period"
                rules={[{ required: true, message: 'Please select campaign dates' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
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
                        {/* <Select mode="multiple" placeholder="Select score">
                          {[5,4,3,2,1].map(i => (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          ))}
                        </Select> */}
                        <Select mode="multiple" placeholder="Select R score">
                            {r_scores.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
        
                         {/* <Select mode="multiple" placeholder="Select R-Scores">
                          {r_scores.map(n => <Option key={n} value={n}>{n}</Option>)}
                        </Select> */}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="fScore" label="F-Score">
                        {/* <Select mode="multiple" placeholder="Select score">
                          {[5,4,3,2,1].map(i => (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          ))}
                        </Select> */}
                         <Select mode="multiple" placeholder="Select f score">
                            {f_scores.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
                          {/* <Select mode="multiple" placeholder="Select F-Scores">
                            {f_scores.map(n => <Option key={n} value={n}>{n}</Option>)}
                          </Select> */}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="mScore" label="M-Score">
                        {/* <Select mode="multiple" placeholder="Select score">
                          {[5,4,3,2,1].map(i => (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          ))}
                        </Select> */}
                         <Select mode="multiple" placeholder="Select M score">
                            {m_scores.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
                         {/* <Select mode="multiple" placeholder="Select M-Scores">
                            {m_scores.map(n => <Option key={n} value={n}>{n}</Option>)}
                          </Select> */}
                      </Form.Item>
                    </Col>
                  </Row>
        
                  <Title level={5} style={{ marginTop: 24 }}>RFM Segment</Title>
                  <Form.Item name="rfmSegment" rules={[{ required: true, message: 'Select at least one segment' }]}>  
                    {/* <Select mode="multiple" placeholder="Select segments">
                      <Select.Option value="Champions">Champions</Select.Option>
                      <Select.Option value="Potential Loyalists">Potential Loyalists</Select.Option>
                      <Select.Option value="New Customers">New Customers</Select.Option>
                      <Select.Option value="At Risk">At Risk</Select.Option>
                      <Select.Option value="Lost">Lost</Select.Option>
                    </Select> */}
                    <Select mode="multiple" placeholder="Select Segment">
                            {rfm_segments.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
                     {/* <Select mode="multiple" placeholder="Select segments">
                      {rfm_segments.map(seg => <Option key={seg} value={seg}>{seg}</Option>)}
                    </Select> */}
                  </Form.Item>
                </Card>
        

        {/* Geography with multi-select checkboxes + Select All */}
        <Card title="Geography" style={{ marginTop: 5 }}>
          <Row gutter={16}>
            {/* Branch depends on City/State */}
            <Col span={8}>
              <Form.Item noStyle shouldUpdate={(prev, cur) =>
                prev.city !== cur.city || prev.state !== cur.state
              }>
                {() => (
                  <MultiCheck
                    name="branch"
                    label="Branch"
                    optionsProvider={() => computeGeoOptions().allowedBranches}
                  />
                )}
              </Form.Item>
            </Col>

            {/* City depends on Branch/State */}
            <Col span={8}>
              <Form.Item noStyle shouldUpdate={(prev, cur) =>
                prev.branch !== cur.branch || prev.state !== cur.state
              }>
                {() => (
                  <MultiCheck
                    name="city"
                    label="City"
                    optionsProvider={() => computeGeoOptions().allowedCities}
                  />
                )}
              </Form.Item>
            </Col>

            {/* State depends on Branch/City */}
            <Col span={8}>
              <Form.Item noStyle shouldUpdate={(prev, cur) =>
                prev.branch !== cur.branch || prev.city !== cur.city
              }>
                {() => (
                  <MultiCheck
                    name="state"
                    label="State"
                    optionsProvider={() => computeGeoOptions().allowedStates}
                  />
                )}
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
                        {/* <Select mode="multiple" placeholder="Select brand">
                          <Select.Option value="All">All</Select.Option>
                          <Select.Option value="Brand1">Brand1</Select.Option>
                          <Select.Option value="Brand2">Brand2</Select.Option>
                        </Select> */}
                         <Select mode="multiple" placeholder="Select brand">
                            {brands.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
                           {/* {options.brands.map(b => (
                            <Select.Option key={b} value={b}>
                              {b}
                            </Select.Option>
                          ))} */}
        
                         {/* <Select mode="multiple" placeholder="Select purchase brands">
                            {brands.map(b => <Option key={b} value={b}>{b}</Option>)}
                          </Select> */}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="section" label="Section">
                        {/* <Select mode="multiple" placeholder="Select section">
                          <Select.Option value="All">All</Select.Option>
                          <Select.Option value="Section1">Section1</Select.Option>
                          <Select.Option value="Section2">Section2</Select.Option>
                        </Select> */}
        
                        <Select mode="multiple" placeholder="Select Section">
                            {sections.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
        
                         {/* <Select mode="multiple" placeholder="Select sections">
                          {sections.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select> */}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="product" label="Product">
                        {/* <Select mode="multiple" placeholder="Select product">
                          <Select.Option value="All">All</Select.Option>
                          <Select.Option value="Product1">Product1</Select.Option>
                          <Select.Option value="Product2">Product2</Select.Option>
                        </Select> */}
        
                        <Select mode="multiple" placeholder="Select Product">
                            {products.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
        
                        {/* <Select mode="multiple" placeholder="Select products">
                          {products.map(p => <Option key={p} value={p}>{p}</Option>)}
                        </Select> */}
                      </Form.Item>
                    </Col>
                  </Row>
        
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={8}>
                      <Form.Item name="model" label="Model">
                        {/* <Select mode="multiple" placeholder="Select model">
                          <Select.Option value="All">All</Select.Option>
                          <Select.Option value="Model1">Model1</Select.Option>
                          <Select.Option value="Model2">Model2</Select.Option>
                        </Select> */}
                        <Select mode="multiple" placeholder="Select Model">
                            {models.map(b => (
                              <Option key={b} value={b}>
                                {b}
                              </Option>
                            ))}
                          </Select>
                          {/* <Select mode="multiple" placeholder="Select models">
                            {models.map(m => <Option key={m} value={m}>{m}</Option>)}
                          </Select> */}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="item" label="Item">
                        <Select mode="multiple" placeholder="Select item">
                          <Select.Option value="All">All</Select.Option>
                          <Select.Option value="Item1">Item1</Select.Option>
                          <Select.Option value="Item2">Item2</Select.Option>
                        </Select>
                        {/* <Select mode="multiple" placeholder="Select items">
                          {items.map(i => <Option key={i} value={i}>{i}</Option>)}
                        </Select> */}
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

        <Form.Item style={{ textAlign: 'center', marginTop: 5 }}>
          <Button type="primary" htmlType="submit" size="large">
            {isEditing ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
