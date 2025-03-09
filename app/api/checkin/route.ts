import { NextRequest, NextResponse } from 'next/server';

// 模拟数据存储
let checkInRecords: any[] = [];

// 获取所有打卡记录
export async function GET() {
  return NextResponse.json({ records: checkInRecords });
}

// 添加新的打卡记录
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.date || !data.time || !data.note) {
      return NextResponse.json(
        { error: '缺少必要的打卡信息' },
        { status: 400 }
      );
    }
    
    // 检查是否已经打卡
    const existingRecord = checkInRecords.find(record => record.date === data.date);
    if (existingRecord) {
      return NextResponse.json(
        { error: '今天已经打卡了' },
        { status: 400 }
      );
    }
    
    const newRecord = {
      id: Date.now().toString(),
      date: data.date,
      time: data.time,
      note: data.note
    };
    
    checkInRecords = [newRecord, ...checkInRecords];
    
    return NextResponse.json({ 
      success: true, 
      message: '打卡成功',
      record: newRecord
    });
  } catch (error) {
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    );
  }
}

// 删除打卡记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少记录ID' },
        { status: 400 }
      );
    }
    
    const initialLength = checkInRecords.length;
    checkInRecords = checkInRecords.filter(record => record.id !== id);
    
    if (checkInRecords.length === initialLength) {
      return NextResponse.json(
        { error: '找不到指定的记录' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '记录已删除'
    });
  } catch (error) {
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    );
  }
} 