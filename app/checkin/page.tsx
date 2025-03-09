'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Form, 
  Input, 
  List, 
  Typography, 
  Divider, 
  message, 
  Calendar, 
  Badge,
  Row,
  Col,
  Statistic,
  Spin
} from 'antd';
import { 
  CheckCircleOutlined, 
  CalendarOutlined,
  TrophyOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import CheckInStats from '../components/CheckInStats';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface CheckInRecord {
  id: string;
  date: string;
  time: string;
  note: string;
}

export default function CheckInPage() {
  const [form] = Form.useForm();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // 从API加载打卡记录
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checkin');
      const data = await response.json();
      
      if (data.records) {
        setRecords(data.records);
        calculateStreak(data.records);
      }
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      message.error('获取打卡记录失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRecords();
  }, []);

  // 计算连续打卡天数
  const calculateStreak = (recs: CheckInRecord[]) => {
    if (recs.length === 0) {
      setStreak(0);
      return;
    }

    // 按日期排序
    const sortedRecords = [...recs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = dayjs().format('YYYY-MM-DD');
    const lastCheckIn = sortedRecords[0].date;
    
    // 如果最后一次打卡不是今天，重置连续天数
    if (lastCheckIn !== today) {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      if (lastCheckIn !== yesterday) {
        setStreak(0);
        return;
      }
    }

    // 计算连续天数
    let currentStreak = 1;
    let currentDate = dayjs(sortedRecords[0].date);

    for (let i = 1; i < sortedRecords.length; i++) {
      const prevDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
      if (sortedRecords[i].date === prevDate) {
        currentStreak++;
        currentDate = dayjs(prevDate);
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  // 提交打卡
  const onFinish = async (values: any) => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const currentTime = dayjs().format('HH:mm:ss');
      
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          time: currentTime,
          note: values.note || '完成今日打卡',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success('打卡成功！');
        form.resetFields();
        fetchRecords(); // 重新获取记录
      } else {
        message.error(data.error || '打卡失败');
      }
    } catch (error) {
      console.error('打卡请求失败:', error);
      message.error('打卡请求失败');
    }
  };
  
  // 删除打卡记录
  const deleteRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/checkin?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success('记录已删除');
        fetchRecords(); // 重新获取记录
      } else {
        message.error(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除请求失败:', error);
      message.error('删除请求失败');
    }
  };

  // 获取日历单元格数据
  const getCalendarData = (value: dayjs.Dayjs) => {
    const dateString = value.format('YYYY-MM-DD');
    const hasRecord = records.some(record => record.date === dateString);
    
    return hasRecord ? 
      <Badge status="success" text="已打卡" /> : 
      value.isSame(dayjs(), 'day') ? 
        <Badge status="processing" text="今日待打卡" /> : 
        null;
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center">
          <CalendarOutlined className="text-2xl mr-2" />
          <Title level={3} style={{ margin: 0 }}>每日打卡系统</Title>
        </div>
      </Header>
      
      <Content className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <CheckInStats records={records} streak={streak} />
            </Col>
            
            <Col xs={24} md={8}>
              <Card title="今日打卡" bordered={false} className="shadow-sm">
                <Form
                  form={form}
                  name="checkInForm"
                  onFinish={onFinish}
                  layout="vertical"
                >
                  <Form.Item
                    name="note"
                    label="打卡备注"
                    rules={[{ required: true, message: '请输入打卡备注' }]}
                  >
                    <Input.TextArea 
                      placeholder="今天的心情或完成的事项..." 
                      rows={4}
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<CheckCircleOutlined />}
                      block
                    >
                      立即打卡
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            
            <Col xs={24} md={16}>
              <Card title="打卡日历" bordered={false} className="shadow-sm mb-4">
                <Calendar 
                  fullscreen={false} 
                  dateCellRender={getCalendarData}
                />
              </Card>
              
              <Card title="打卡记录" bordered={false} className="shadow-sm">
                <List
                  dataSource={records}
                  renderItem={(record) => (
                    <List.Item
                      actions={[
                        <Button 
                          key="delete" 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => deleteRecord(record.id)}
                        >
                          删除
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                        title={`${record.date} ${record.time}`}
                        description={record.note}
                      />
                    </List.Item>
                  )}
                  pagination={{
                    pageSize: 5,
                    simple: true,
                  }}
                  locale={{ emptyText: '暂无打卡记录' }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Content>
      
      <Footer className="text-center">
        每日打卡系统 ©{new Date().getFullYear()} Created with Next.js and Ant Design
      </Footer>
    </Layout>
  );
} 