// 测试脚本：模拟完整的占卜流程
// 用于验证 Gemini API 集成

import { getInterpretation } from './services/geminiService.js';
import { AnalysisPayload } from './types.js';

// 模拟测试数据
const testPayload: AnalysisPayload = {
  language: 'zh',
  user_info: {
    name: '测试用户',
    question: '我接下来的事业发展会如何？'
  },
  tarot_spread: {
    past: {
      card_name: '愚者',
      position: 'Upright',
      meaning_keywords: ['开始', '天真', '自发性']
    },
    present: {
      card_name: '星星',
      position: 'Upright',
      meaning_keywords: ['希望', '信念', '目标']
    },
    future: {
      card_name: '世界',
      position: 'Upright',
      meaning_keywords: ['完成', '整合', '成就']
    }
  },
  astrology_chart: {
    sun: { sign: 'Leo', house: 10, deg: 28 },
    moon: { sign: 'Cancer', house: 4, deg: 15 },
    rising: { sign: 'Scorpio', house: 1, deg: 22 },
    aspects: ['Sun Trine Moon', 'Venus Square Mars']
  }
};

// 执行测试
async function runTest() {
  console.log('🔮 MysticCore 占卜测试启动\n');
  console.log('用户:', testPayload.user_info.name);
  console.log('问题:', testPayload.user_info.question);
  console.log('\n塔罗牌阵:');
  console.log(`  过去: ${testPayload.tarot_spread.past.card_name} (${testPayload.tarot_spread.past.position})`);
  console.log(`  现在: ${testPayload.tarot_spread.present.card_name} (${testPayload.tarot_spread.present.position})`);
  console.log(`  未来: ${testPayload.tarot_spread.future.card_name} (${testPayload.tarot_spread.future.position})`);
  console.log('\n星盘数据:');
  console.log(`  太阳: ${testPayload.astrology_chart.sun.deg}° ${testPayload.astrology_chart.sun.sign}`);
  console.log(`  月亮: ${testPayload.astrology_chart.moon.deg}° ${testPayload.astrology_chart.moon.sign}`);
  console.log(`  上升: ${testPayload.astrology_chart.rising.deg}° ${testPayload.astrology_chart.rising.sign}`);
  console.log('\n' + '═'.repeat(50));
  console.log('正在连接神谕...\n');

  try {
    const result = await getInterpretation(testPayload);
    console.log('神谕降临:\n');
    console.log(result);
    console.log('\n' + '═'.repeat(50));
    console.log('✅ 测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 检查环境变量
if (!process.env.VITE_API_KEY) {
  console.error('⚠️  错误: 未找到 VITE_API_KEY 环境变量');
  console.error('请先设置环境变量:');
  console.error('  Windows PowerShell: $env:VITE_API_KEY="your_api_key"');
  console.error('  Windows CMD: set VITE_API_KEY=your_api_key');
  console.error('  Linux/Mac: export VITE_API_KEY="your_api_key"');
  process.exit(1);
}

runTest();
