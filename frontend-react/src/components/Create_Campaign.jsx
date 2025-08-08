import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Card, DatePicker, Row, Col, InputNumber, Select, Button, Typography, Input, Checkbox, Radio } from 'antd';
import api from '../api';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select; // ✅ needed for <Option> usage

export default function Create_Campaign() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const isEditing = !!campaignId;

  // ---------- options ----------
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
    items: [],
    brand_hierarchy: []
  });

  


  // ✅ flag so we only hydrate after options exist
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  
const { brands, sections, products, models, items, brand_hierarchy, r_scores, f_scores, m_scores, rfm_segments, branches, branch_city_map, branch_state_map } = options;

  // ---------- helpers ----------
  const parseArr = (v) =>
    typeof v === 'string' ? (v ? JSON.parse(v) : []) : (Array.isArray(v) ? v : []);

  const stripQuotes = (v) =>
    typeof v === 'string' ? v.replace(/^['"]+|['"]+$/g, '') : v;

  const toRange = (s, e) => {
  const clean = (v) => (typeof v === 'string' ? v.replace(/^['"]+|['"]+$/g, '') : v);
  const ds = s ? dayjs(clean(s)) : null;
  const de = e ? dayjs(clean(e)) : null;
  return (ds && ds.isValid() && de && de.isValid()) ? [ds, de] : null;
};

  // ---------- load options ----------
  useEffect(() => {
    axios.get('http://localhost:8000/campaign/options')
      .then(res => {
        setOptions(res.data);
        setOptionsLoaded(true); // ✅ ready
      })
      .catch(() => message.error('Failed to load filters'));
  }, []);

  // ---------- hydrate edit values (wait for options) ----------
  useEffect(() => {
  if (!campaignId /* || !optionsLoaded */) return; // uncomment optionsLoaded if you added the flag

  api.get(`/campaign/${campaignId}`).then(res => {
    const data = res.data;
    console.log("data-------------",data)
    console.log("section---- ",data.section)
   
    form.setFieldsValue({
      name: data.name,
      campaignPeriod: toRange(data.start_date, data.end_date),

      recencyOp: data.recency_op,
      recencyMin: data.recency_min,
      recencyMax: data.recency_max,
      frequencyOp: data.frequency_op,
      frequencyMin: data.frequency_min,
      frequencyMax: data.frequency_max,
      monetaryOp: data.monetary_op,
      monetaryMin: data.monetary_min,
      monetaryMax: data.monetary_max,

      rScore:       parseArr(data.r_score),
      fScore:       parseArr(data.f_score),
      mScore:       parseArr(data.m_score),
      rfmSegment:   parseArr(data.rfm_segments),

      branch: parseArr(data.branch),
      city:   parseArr(data.city),
      state:  parseArr(data.state),

      // ✅ the fix
      // birthdayRange:    toRange(data.birthday_start,    data.birthday_end),
      // anniversaryRange: toRange(data.anniversary_start, data.anniversary_end),
      birthdayRange:    toRange(stripQuotes(data.birthday_start),    stripQuotes(data.birthday_end)),
      anniversaryRange: toRange(stripQuotes(data.anniversary_start), stripQuotes(data.anniversary_end)),
      purchaseType:  stripQuotes(data.purchase_type),
      purchaseBrand: parseArr(data.purchase_brand),
      section:       parseArr(data.section),
      product:       parseArr(data.product),
      model:         parseArr(data.model),
      item:          parseArr(data.item),

      valueThreshold: data.value_threshold,
    });
  }).catch(() => message.error('Failed to load campaign'));
}, [campaignId, form /*, optionsLoaded*/]);

  // ---------- save ----------
  const onFinish = async (values) => {
    const [startMoment, endMoment] = values.campaignPeriod;

    const payload = {
      name:       values.name,
      start_date: startMoment.format('YYYY-MM-DD'),
      end_date:   endMoment.format('YYYY-MM-DD'),

      recency_op:  values.recencyOp,
      recency_min: values.recencyMin,
      ...(values.recencyOp === 'between'
        ? { recency_max: values.recencyMax }
        : { recency_max: values.recencyMin }),

      frequency_op:  values.frequencyOp,
      frequency_min: values.frequencyMin,
      ...(values.frequencyOp === 'between'
        ? { frequency_max: values.frequencyMax }
        : { frequency_max: values.frequencyMin }),

      monetary_op:  values.monetaryOp,
      monetary_min: values.monetaryMin,
      ...(values.monetaryOp === 'between'
        ? { monetary_max: values.monetaryMax }
        : { monetary_max: values.monetaryMin }),

      r_score:      values.rScore,
      f_score:      values.fScore,
      m_score:      values.mScore,
      rfm_segments: values.rfmSegment,

      branch: values.branch,
      city:   values.city,
      state:  values.state,

      birthday_start:     values.birthdayRange?.[0]?.format('YYYY-MM-DD'),
      birthday_end:       values.birthdayRange?.[1]?.format('YYYY-MM-DD'),
      anniversary_start:  values.anniversaryRange?.[0]?.format('YYYY-MM-DD'),
      anniversary_end:    values.anniversaryRange?.[1]?.format('YYYY-MM-DD'),

      purchase_type:  values.purchaseType,
      purchase_brand: values.purchaseBrand,
      section:        values.section,
      product:        values.product,
      model:          values.model,
      item:           values.item,

      value_threshold: values.valueThreshold,
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
      console.error('🚨 Save failed:', err?.response?.data || err);
      message.error('Failed to save campaign');
    }
  };

  // ---------- dependent geography ----------
  const watchBranch = Form.useWatch('branch', form) || [];
  const watchCity   = Form.useWatch('city', form)   || [];
  const watchState  = Form.useWatch('state', form)  || [];

  const watchPurchaseBrand = Form.useWatch('purchaseBrand', form) || [];
  const watchSection = Form.useWatch('section', form) || [];
  const watchProduct = Form.useWatch('product', form) || [];
  const watchModel = Form.useWatch('model', form) || [];
  const watchItem = Form.useWatch('item', form) || [];

  const computeGeoOptions = () => {
    const allowedBranches = branches.filter(b => {
      const cities = branch_city_map?.[b] || [];
      const states = branch_state_map?.[b] || [];
      const cityOK  = watchCity.length  ? watchCity.some(c => cities.includes(c)) : true;
      const stateOK = watchState.length ? watchState.some(s => states.includes(s)) : true;
      return cityOK && stateOK;
    });

    const allCitiesFromAllowedBranches = new Set(
      ((watchBranch.length ? watchBranch : allowedBranches).flatMap(b => branch_city_map?.[b] || []))
    );
    const allowedCities = Array.from(allCitiesFromAllowedBranches)
      .filter(c => (watchState.length
        ? allowedBranches.some(b => (branch_city_map?.[b] || []).includes(c) &&
                                    (branch_state_map?.[b] || []).some(s => watchState.includes(s)))
        : true));

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

  // ✅ don't prune until options are loaded
  useEffect(() => {
    if (!optionsLoaded) return;

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
  }, [watchBranch, watchCity, watchState, branch_city_map, branch_state_map, branches, optionsLoaded]);

  const computeBrandOptions = () => {
    let filtered = brand_hierarchy || [];
    console.log("brand_hierarchy---------------------",brand_hierarchy)
    if (watchPurchaseBrand.length) {
      filtered = filtered.filter(r => watchPurchaseBrand.includes(r.brand));
    }
    if (watchSection.length) {
      filtered = filtered.filter(r => watchSection.includes(r.section));
    }
    if (watchProduct.length) {
      filtered = filtered.filter(r => watchProduct.includes(r.product));
    }
    if (watchModel.length) {
      filtered = filtered.filter(r => watchModel.includes(r.model));
    }
    if (watchItem.length) {
      filtered = filtered.filter(r => watchItem.includes(r.item));
    }

    const allowedBrands = [...new Set(filtered.map(r => r.brand))];
    const allowedSections = [...new Set(filtered.map(r => r.section))];
    const allowedProducts = [...new Set(filtered.map(r => r.product))];
    const allowedModels = [...new Set(filtered.map(r => r.model))];
    const allowedItems = [...new Set(filtered.map(r => r.item))];

    return { allowedBrands, allowedSections, allowedProducts, allowedModels, allowedItems };
  };

  useEffect(() => {
    if (!optionsLoaded || !brand_hierarchy?.length) return; // prevent early pruning before options load
    const { allowedBrands, allowedSections, allowedProducts, allowedModels, allowedItems } = computeBrandOptions();
    const pruned = {
      purchaseBrand: watchPurchaseBrand.filter(b => allowedBrands.includes(b)),
      section: watchSection.filter(s => allowedSections.includes(s)),
      product: watchProduct.filter(p => allowedProducts.includes(p)),
      model: watchModel.filter(m => allowedModels.includes(m)),
      item: watchItem.filter(i => allowedItems.includes(i)),
    };
    if (
      pruned.purchaseBrand.length !== watchPurchaseBrand.length ||
      pruned.section.length      !== watchSection.length      ||
      pruned.product.length      !== watchProduct.length      ||
      pruned.model.length        !== watchModel.length        ||
      pruned.item.length         !== watchItem.length
    ) {
      form.setFieldsValue(pruned);
    }
  }, [watchPurchaseBrand, watchSection, watchProduct, watchModel, watchItem, brand_hierarchy]);
  

  useEffect(() => {
    const { allowedBrands, allowedSections, allowedProducts, allowedModels, allowedItems } = computeBrandOptions();
    const pruned = {
      purchaseBrand: watchPurchaseBrand.filter(b => allowedBrands.includes(b)),
      section: watchSection.filter(s => allowedSections.includes(s)),
      product: watchProduct.filter(p => allowedProducts.includes(p)),
      model: watchModel.filter(m => allowedModels.includes(m)),
      item: watchItem.filter(i => allowedItems.includes(i)),
    };
    if (
      pruned.purchaseBrand.length !== watchPurchaseBrand.length ||
      pruned.section.length      !== watchSection.length      ||
      pruned.product.length      !== watchProduct.length      ||
      pruned.model.length        !== watchModel.length        ||
      pruned.item.length         !== watchItem.length
    ) {
      form.setFieldsValue(pruned);
    }
  }, [watchPurchaseBrand, watchSection, watchProduct, watchModel, watchItem, brand_hierarchy]);

  // ---------- reusable multi-select dropdown with “All” ----------
  const MultiSelectDropdown = ({ name, label, optionsProvider, placeholder }) => {
    const allowed  = optionsProvider();
    const selected = Form.useWatch(name, form) || [];
    const ALL = '__ALL__';

    const handleChange = (vals) => {
      if (vals.includes(ALL) && !selected.includes(ALL)) {
        form.setFieldsValue({ [name]: allowed });
        return;
      }
      form.setFieldsValue({ [name]: vals.filter(v => v !== ALL) });
    };

    const isAllSelected = allowed.length > 0 && selected.length === allowed.length;

    return (
      <Form.Item name={name} label={label} style={{ marginBottom: 8 }}>
        <Select
          mode="multiple"
          allowClear
          showSearch
          placeholder={placeholder}
          value={selected}
          onChange={handleChange}
          maxTagCount="responsive"
          optionLabelProp="label"
          menuItemSelectedIcon={(info) => <Checkbox checked={info?.isSelected} />}
          optionRender={(option) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox checked={selected.includes(option.value)} />
              <span>{option.label}</span>
            </div>
          )}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={[
            { label: isAllSelected ? 'All (selected)' : 'All', value: ALL },
            ...allowed.map(v => ({ label: v, value: v })),
          ]}
        />
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

        {/* Geography */}
        <Card title="Geography" style={{ marginTop: 5 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.city !== cur.city || prev.state !== cur.state}>
                {() => (
                  <MultiSelectDropdown
                    name="branch"
                    label="Branch"
                    placeholder="Select branches"
                    optionsProvider={() => computeGeoOptions().allowedBranches}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.branch !== cur.branch || prev.state !== cur.state}>
                {() => (
                  <MultiSelectDropdown
                    name="city"
                    label="City"
                    placeholder="Select cities"
                    optionsProvider={() => computeGeoOptions().allowedCities}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.branch !== cur.branch || prev.city !== cur.city}>
                {() => (
                  <MultiSelectDropdown
                    name="state"
                    label="State"
                    placeholder="Select states"
                    optionsProvider={() => computeGeoOptions().allowedStates}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* RFM Mode */}
        <Card title="RFM Mode" style={{ marginTop: 5 }}>
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={24}>
              <Form.Item name="rfmMode" initialValue="customized" style={{ marginBottom: 8 }}>
                <Radio.Group>
                  <Radio value="customized">RFM Customized</Radio>
                  <Radio value="segmented">RFM Segmented</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.rfmMode !== cur.rfmMode}>
            {({ getFieldValue }) => {
              const mode = getFieldValue('rfmMode') || 'customized';
              return (
                <>
                  {mode === 'customized' && (
                    <Card style={{ marginTop: 5 }}>
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
                          <Form.Item noStyle dependencies={['recencyOp']}>
                            {({ getFieldValue }) => {
                              const op = getFieldValue('recencyOp');
                              return (
                                <Form.Item label="Recency (Days)" style={{ marginBottom: 0 }} rules={[{ required: true }]}>
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
                          <Form.Item noStyle dependencies={['frequencyOp']}>
                            {({ getFieldValue }) => {
                              const op = getFieldValue('frequencyOp');
                              return (
                                <Form.Item label="Frequency" style={{ marginBottom: 0 }} rules={[{ required: true }]}>
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
                          <Form.Item noStyle dependencies={['monetaryOp']}>
                            {({ getFieldValue }) => {
                              const op = getFieldValue('monetaryOp');
                              return (
                                <Form.Item label="Monetary (₹)" style={{ marginBottom: 0 }} rules={[{ required: true }]}>
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
                            <Select mode="multiple" placeholder="Select R score">
                              {r_scores.map(b => (
                                <Option key={b} value={b}>{b}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="fScore" label="F-Score">
                            <Select mode="multiple" placeholder="Select F score">
                              {f_scores.map(b => (
                                <Option key={b} value={b}>{b}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="mScore" label="M-Score">
                            <Select mode="multiple" placeholder="Select M score">
                              {m_scores.map(b => (
                                <Option key={b} value={b}>{b}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {mode === 'segmented' && (
                    <Card title="RFM Segmented" style={{ marginTop: 5 }}>
                      <Form.Item
                        name="rfmSegment"
                        rules={[{ required: true, message: 'Select at least one segment' }]}
                        preserve={false}
                      >
                        <Select mode="multiple" placeholder="Select Segment">
                          {rfm_segments.map(b => (
                            <Option key={b} value={b}>{b}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Card>
                  )}
                </>
              );
            }}
          </Form.Item>
        </Card>

        {/* Product */}
<Card title="Product" style={{ marginTop: 5 }}>
  <Form.Item
    name="purchaseType"
    label="Purchase Type"
    rules={[{ required: true, message: 'Select purchase type' }]}
  >
    <Radio.Group>
      <Radio value="any">Any Purchase</Radio>
      <Radio value="recent">Recent Purchase</Radio>
    </Radio.Group>
  </Form.Item>

  <Row gutter={16}>
    <Col span={8}>
      <Form.Item noStyle shouldUpdate={(prev, cur) =>
        prev.section !== cur.section ||
        prev.product !== cur.product ||
        prev.model   !== cur.model   ||
        prev.item    !== cur.item
      }>
        {() => (
          <MultiSelectDropdown
            name="purchaseBrand"
            label="Brand"
            placeholder="Select brands"
            optionsProvider={() => computeBrandOptions().allowedBrands}
          />
        )}
      </Form.Item>
    </Col>

    <Col span={8}>
      <Form.Item noStyle shouldUpdate={(prev, cur) =>
        prev.purchaseBrand !== cur.purchaseBrand ||
        prev.product       !== cur.product       ||
        prev.model         !== cur.model         ||
        prev.item          !== cur.item
      }>
        {() => (
          <MultiSelectDropdown
            name="section"
            label="Section"
            placeholder="Select sections"
            optionsProvider={() => computeBrandOptions().allowedSections}
          />
        )}
      </Form.Item>
    </Col>

    <Col span={8}>
      <Form.Item noStyle shouldUpdate={(prev, cur) =>
        prev.purchaseBrand !== cur.purchaseBrand ||
        prev.section       !== cur.section       ||
        prev.model         !== cur.model         ||
        prev.item          !== cur.item
      }>
        {() => (
          <MultiSelectDropdown
            name="product"
            label="Product"
            placeholder="Select products"
            optionsProvider={() => computeBrandOptions().allowedProducts}
          />
        )}
      </Form.Item>
    </Col>
  </Row>

  <Row gutter={16} style={{ marginTop: 16 }}>
    <Col span={8}>
      <Form.Item noStyle shouldUpdate={(prev, cur) =>
        prev.purchaseBrand !== cur.purchaseBrand ||
        prev.section       !== cur.section       ||
        prev.product       !== cur.product       ||
        prev.item          !== cur.item
      }>
        {() => (
          <MultiSelectDropdown
            name="model"
            label="Model"
            placeholder="Select models"
            optionsProvider={() => computeBrandOptions().allowedModels}
          />
        )}
      </Form.Item>
    </Col>

    <Col span={8}>
      <Form.Item noStyle shouldUpdate={(prev, cur) =>
        prev.purchaseBrand !== cur.purchaseBrand ||
        prev.section       !== cur.section       ||
        prev.product       !== cur.product       ||
        prev.model         !== cur.model
      }>
        {() => (
          <MultiSelectDropdown
            name="item"
            label="Item"
            placeholder="Select items"
            optionsProvider={() => computeBrandOptions().allowedItems}
          />
        )}
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

        {/* Occasions */}
        <Card title="Occasions" style={{ marginTop: 5 }} bodyStyle={{ padding: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="birthdayRange" label="Birthday Range" style={{ marginBottom: 8 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="anniversaryRange" label="Anniversary Range" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
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
