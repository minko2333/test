'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  TrophyOutlined, 
  FireOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface CheckInRecord {
  id: string;
  date: string;
  time: string;
  note: string;
}

interface CheckInStatsProps {
  records: CheckInRecord[];
  streak: number;
}

const CheckInStats: React.FC<CheckInStatsProps> = ({ records, streak }) => {
  // 计算本月打卡天数
  const getCurrentMonthCheckIns = () => {
    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();
    
    return records.filter(record => {
      const recordDate = dayjs(record.date);
      return recordDate.month() === currentMonth && recordDate.year() === currentYear;
    }).length;
  };
  
  // 计算本月打卡率
  const getMonthlyCompletionRate = () => {
    const daysInMonth = dayjs().daysInMonth();
    const currentDay = Math.min(dayjs().date(), daysInMonth);
    const monthlyCheckIns = getCurrentMonthCheckIns();
    
    return Math.round((monthlyCheckIns / currentDay) * 100);
  };
  
  // 检查今天是否已打卡
  const isTodayCheckedIn = () => {
    const today = dayjs().format('YYYY-MM-DD');
    return records.some(record => record.date === today);
  };
  
  const monthlyRate = getMonthlyCompletionRate();
  const monthlyCheckIns = getCurrentMonthCheckIns();
  const totalCheckIns = records.length;
  
  return (
    <Card title="打卡统计" bordered={false} className="shadow-sm">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Statistic
            title="连续打卡"
            value={streak}
            suffix="天"
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
        
        <Col xs={12} sm={6}>
          <Statistic
            title="本月打卡"
            value={monthlyCheckIns}
            suffix="天"
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        
        <Col xs={12} sm={6}>
          <Statistic
            title="总打卡次数"
            value={totalCheckIns}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
        
        <Col xs={12} sm={6}>
          <Statistic
            title="今日状态"
            value={isTodayCheckedIn() ? '已打卡' : '未打卡'}
            prefix={<FireOutlined />}
            valueStyle={{ 
              color: isTodayCheckedIn() ? '#52c41a' : '#faad14' 
            }}
          />
        </Col>
      </Row>
      
      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span>本月打卡率</span>
          <span>{monthlyRate}%</span>
        </div>
        <Progress 
          percent={monthlyRate} 
          status={monthlyRate >= 80 ? "success" : monthlyRate >= 50 ? "active" : "exception"} 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      </div>
    </Card>
  );
};

export default CheckInStats; 