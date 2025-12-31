<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ETBpFQvK8l7x0jjjDmbwTrY-z-AJ9QhA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
Role & Objective:
你是一位拥有全栈开发能力（Next.js + Python/FastAPI）和顶级审美（Awwwards 获奖级）的 UI/UX 设计师。我们要构建一个名为 "MysticCore" 的在线塔罗与占星命理系统。
Core Philosophy:
系统的核心原则是**“数据严谨，解读灵性”**。
严谨性：你绝对不能依靠 LLM 自身的幻觉去计算星盘度数或捏造塔罗牌义。所有解读必须基于传入的结构化 JSON 数据。
神秘感：前端必须极具沉浸感，使用深色模式、粒子效果、视差滚动和平滑的 Framer Motion 动画。
Tech Stack:
Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion (关键动画库), Lucide React (图标)。
Backend: Python FastAPI (用于处理天文计算)。
Libraries: 使用 Python 的 kerykeion 或 swisseph 库进行星盘计算。
Functional Requirements:
Data Structure (The Contract):
你需要构建一个 AnalysisEngine，它接收以下格式的 JSON 输入，然后生成最终的自然语言解读：
code
JSON
// 最终喂给 LLM 进行解读的数据结构
{
"user_info": {"name": "User", "question": "事业发展"},
"tarot_spread": {
"past": {"card_name": "The Tower", "position": "Upright", "meaning_keywords": ["突变", "灾难"]},
"present": {"card_name": "Ace of Wands", "position": "Reversed", "meaning_keywords": ["延迟", "缺乏动力"]},
"future": {"card_name": "The Sun", "position": "Upright", "meaning_keywords": ["成功", "活力"]}
},
"astrology_chart": {
"sun": {"sign": "Scorpio", "house": 10, "deg": 15.4},
"moon": {"sign": "Gemini", "house": 7, "deg": 2.1},
"aspects": ["Sun Trine Mars", "Moon Square Venus"]
}
}
Frontend Features (UI/UX):
视觉风格：深紫色与午夜蓝渐变背景 (bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900)。金色细线边框 (border-yellow-500/30)。
塔罗模块：
支持“洗牌动画”（CSS 3D Transform）。
自选模式：在屏幕上扇形展开78张牌背，用户点击抽取3张。
随机模式：点击水晶球，系统自动抽取。
占星模块：
用户输入生辰后，调用后端 API。
前端使用 SVG 绘制简化版星盘（无需过于复杂，但要准确显示行星落座）。
Backend Logic (FastAPI):
请写一个 Python 接口 /api/calculate_chart：
接收：日期、时间、经纬度。
逻辑：使用 kerykeion 库计算行星位置。
返回：标准化的 JSON 数据（如上所述）。
Task Guidelines:
首先，请给出项目的目录结构。
接着，提供 Python 后端计算核心代码 (main.py)，确保算法准确。
然后，编写 Next.js 核心页面组件，重点展示“抽卡动画”和“星盘结果展示”的代码，体现 Framer Motion 的神秘效果。
最后，写一个 System Prompt，这是系统用来把上述 JSON 转化成命理师口吻的提示词。
