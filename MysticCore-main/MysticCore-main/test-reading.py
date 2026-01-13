#!/usr/bin/env python3
"""
MysticCore 占卜测试脚本
模拟完整的占卜流程
"""

import json
import os
from typing import Dict, Any
import google.generativeai as genai

# 设置 API Key
os.environ['API_KEY'] = 'AIzaSyARcclTTCg-82zGt56X6mDGO2fiOvu-b8Y'

# 测试数据
test_payload = {
    "language": "zh",
    "user_info": {
        "name": "测试用户",
        "question": "我接下来的事业发展会如何？"
    },
    "tarot_spread": {
        "past": {
            "card_name": "愚者",
            "position": "Upright",
            "meaning_keywords": ["开始", "天真", "自发性"]
        },
        "present": {
            "card_name": "星星",
            "position": "Upright",
            "meaning_keywords": ["希望", "信念", "目标"]
        },
        "future": {
            "card_name": "世界",
            "position": "Upright",
            "meaning_keywords": ["完成", "整合", "成就"]
        }
    },
    "astrology_chart": {
        "sun": {"sign": "Leo", "house": 10, "deg": 28},
        "moon": {"sign": "Cancer", "house": 4, "deg": 15},
        "rising": {"sign": "Scorpio", "house": 1, "deg": 22},
        "aspects": ["Sun Trine Moon", "Venus Square Mars"]
    }
}

# 系统提示词
SYSTEM_PROMPT_ZH = f"""
你是一位逻辑严密、直觉敏锐且深谙人性的AI塔罗大师"MysticCore"。请遵循以下步骤进行深度的占卜解读：

1. **信息接收与解析**
用户：{test_payload['user_info']['name']}
核心问题：{test_payload['user_info']['question']}
塔罗牌阵：{test_payload['tarot_spread']['past']['card_name']}({test_payload['tarot_spread']['past']['position']}), {test_payload['tarot_spread']['present']['card_name']}({test_payload['tarot_spread']['present']['position']}), {test_payload['tarot_spread']['future']['card_name']}({test_payload['tarot_spread']['future']['position']})

2. **命理基础与逻辑澄清**
基于传入的星盘数据（太阳/月亮/上升），简要说明其中与问题最相关的一个能量。
*逻辑分支：若用户出生时间看似不精确（如整点或默认值），请务必补充说明："由于具体出生时间不详，我将略过上升星座的精确界定，重点分析塔罗牌阵的内在逻辑与元素互动。"*

3. **塔罗牌阵深度分析（原型视角）**
依次分析三张牌。在解释牌义时，请尝试引入**荣格原型心理学**（如"阴影"、"阿尼玛/阿尼姆斯"、"英雄之旅"）或**神话典故**来辅助解释，增加解读的厚度。
- 过去 ({test_payload['tarot_spread']['past']['card_name']}): 潜意识的成因与原型根基。
- 现在 ({test_payload['tarot_spread']['present']['card_name']}): 当前的挑战与显化的能量。
- 未来 ({test_payload['tarot_spread']['future']['card_name']}): 能量流动的趋势与整合的方向。
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
"""

def run_test():
    print('🔮 MysticCore 占卜测试启动\n')
    print(f'📋 测试用户: {test_payload["user_info"]["name"]}')
    print(f'❓ 占卜问题: {test_payload["user_info"]["question"]}')
    print('\n🃏 塔罗牌阵:')
    print(f'   过去: {test_payload["tarot_spread"]["past"]["card_name"]} ({test_payload["tarot_spread"]["past"]["position"]})')
    print(f'   现在: {test_payload["tarot_spread"]["present"]["card_name"]} ({test_payload["tarot_spread"]["present"]["position"]})')
    print(f'   未来: {test_payload["tarot_spread"]["future"]["card_name"]} ({test_payload["tarot_spread"]["future"]["position"]})')
    print('\n⭐ 星盘数据:')
    print(f'   太阳: {test_payload["astrology_chart"]["sun"]["deg"]}° {test_payload["astrology_chart"]["sun"]["sign"]} (第{test_payload["astrology_chart"]["sun"]["house"]}宫)')
    print(f'   月亮: {test_payload["astrology_chart"]["moon"]["deg"]}° {test_payload["astrology_chart"]["moon"]["sign"]} (第{test_payload["astrology_chart"]["moon"]["house"]}宫)')
    print(f'   上升: {test_payload["astrology_chart"]["rising"]["deg"]}° {test_payload["astrology_chart"]["rising"]["sign"]} (第{test_payload["astrology_chart"]["rising"]["house"]}宫)')
    print('\n' + '═' * 60)
    print('✨ 正在连接神谕...\n')

    try:
        # 配置 Gemini
        genai.configure(api_key=os.environ['API_KEY'])
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash-exp',
            system_instruction=SYSTEM_PROMPT_ZH,
            generation_config={
                'temperature': 0.8,
            }
        )
        
        # 调用 API
        response = model.generate_content(json.dumps(test_payload))
        
        print('✨ 神谕降临:\n')
        print(response.text)
        print('\n' + '═' * 60)
        print('✅ 测试完成')
        
    except Exception as error:
        print(f'❌ 测试失败: {str(error)}')

if __name__ == '__main__':
    run_test()
