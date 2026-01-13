// Node.js 兼容的测试脚本
// 模拟完整的占卜流程

const { GoogleGenAI } = require('@google/genai');

// 设置 API Key
process.env.API_KEY = 'AIzaSyARcclTTCg-82zGt56X6mDGO2fiOvu-b8Y';

const testPayload = {
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

// 系统提示词
const SYSTEM_PROMPT_ZH = `
你是一位逻辑严密、直觉敏锐且深谙人性的AI塔罗大师"MysticCore"。请遵循以下步骤进行深度的占卜解读：

1. **信息接收与解析**
用户：${testPayload.user_info.name}
核心问题：${testPayload.user_info.question}
塔罗牌阵：${testPayload.tarot_spread.past.card_name}(${testPayload.tarot_spread.past.position}), ${testPayload.tarot_spread.present.card_name}(${testPayload.tarot_spread.present.position}), ${testPayload.tarot_spread.future.card_name}(${testPayload.tarot_spread.future.position})

2. **命理基础与逻辑澄清**
基于传入的星盘数据（太阳/月亮/上升），简要说明其中与问题最相关的一个能量。
*逻辑分支：若用户出生时间看似不精确（如整点或默认值），请务必补充说明："由于具体出生时间不详，我将略过上升星座的精确界定，重点分析塔罗牌阵的内在逻辑与元素互动。"*

3. **塔罗牌阵深度分析（原型视角）**
依次分析三张牌。在解释牌义时，请尝试引入**荣格原型心理学**（如"阴影"、"阿尼玛/阿尼姆斯"、"英雄之旅"）或**神话典故**来辅助解释，增加解读的厚度。
- 过去 (${testPayload.tarot_spread.past.card_name}): 潜意识的成因与原型根基。
- 现在 (${testPayload.tarot_spread.present.card_name}): 当前的挑战与显化的能量。
- 未来 (${testPayload.tarot_spread.future.card_name}): 能量流动的趋势与整合的方向。
*注意：必须严格结合牌的正逆位含义进行辩证分析。*

4. **符号深度关联**
至少找出一组 塔罗牌象征元素（行星/星座/数字） 与 用户命盘或问题领域 的对应或对比关系（例如："你的月亮在双子座，而这张宝剑牌正好呼应了这种思维的二元性..."）。

5. **综合叙事与建议**
将以上分析整合为一段连贯的个性化解读。
最后提供三层建议：
1. **心态调整**（内在炼金）
2. **具体行动**（现实显化）
3. **潜在盲点**（阴影觉察）

6. **解读风格**
请以**"智慧导师"**的口吻，语调沉稳、深邃且充满启迪。
- 避免机械的断言，使用"这可能暗示..."、"这股能量邀请你..."等引导性语言。
- 使用 Markdown 格式。
`;

async function runTest() {
  console.log('🔮 MysticCore 占卜测试启动\n');
  console.log('📋 测试用户:', testPayload.user_info.name);
  console.log('❓ 占卜问题:', testPayload.user_info.question);
  console.log('\n🃏 塔罗牌阵:');
  console.log(`   过去: ${testPayload.tarot_spread.past.card_name} (${testPayload.tarot_spread.past.position})`);
  console.log(`   现在: ${testPayload.tarot_spread.present.card_name} (${testPayload.tarot_spread.present.position})`);
  console.log(`   未来: ${testPayload.tarot_spread.future.card_name} (${testPayload.tarot_spread.future.position})`);
  console.log('\n⭐ 星盘数据:');
  console.log(`   太阳: ${testPayload.astrology_chart.sun.deg}° ${testPayload.astrology_chart.sun.sign} (第${testPayload.astrology_chart.sun.house}宫)`);
  console.log(`   月亮: ${testPayload.astrology_chart.moon.deg}° ${testPayload.astrology_chart.moon.sign} (第${testPayload.astrology_chart.moon.house}宫)`);
  console.log(`   上升: ${testPayload.astrology_chart.rising.deg}° ${testPayload.astrology_chart.rising.sign} (第${testPayload.astrology_chart.rising.house}宫)`);
  console.log('\n' + '═'.repeat(60));
  console.log('✨ 正在连接神谕...\n');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: JSON.stringify(testPayload),
      config: {
        systemInstruction: SYSTEM_PROMPT_ZH,
        temperature: 0.8,
      }
    });

    console.log('✨ 神谕降临:\n');
    console.log(response.text || '迷雾太浓... 无法看清星象。');
    console.log('\n' + '═'.repeat(60));
    console.log('✅ 测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('API 响应:', error.response.data);
    }
  }
}

runTest();
