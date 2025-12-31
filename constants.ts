import { TarotCardData, Language } from './types';

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", 
  "Leo", "Virgo", "Libra", "Scorpio", 
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// UI Translation Dictionary
export const UI_TEXT = {
  en: {
    title: "MysticCore",
    subtitle: "Celestial Alignment",
    intro: "Enter your birth details to generate your star chart and begin the ritual.",
    nameLabel: "Name",
    dateLabel: "Birth Date",
    timeLabel: "Birth Time",
    questionLabel: "Your Question",
    placeholderName: "Seeker",
    placeholderQuestion: "What does the universe hold for me?",
    submitBtn: "BEGIN RITUAL",
    aligning: "Aligning Planets...",
    deckReady: "The Deck is Ready",
    spreadBtn: "Spread the Cards",
    autoBtn: "Crystal Ball (Auto)",
    selectPrompt: "Select {count} cards...",
    communing: "Communing with the Oracle...",
    synthesizing: "Synthesizing Astral and Arcana data",
    natalTitle: "Natal Alignment",
    spreadTitle: "The Spread",
    oracleTitle: "The Oracle Speaks",
    newReading: "New Reading",
    sun: "Sun",
    moon: "Moon",
    asc: "ASC",
    upright: "UPRIGHT",
    reversed: "REVERSED",
    cardPast: "PAST",
    cardPresent: "PRESENT",
    cardFuture: "FUTURE",
    revealBtn: "Reveal Destiny",
    proceedBtn: "Read Interpretation",
    tapToReveal: "Tap cards to reveal..."
  },
  zh: {
    title: "MysticCore",
    subtitle: "星盘连结",
    intro: "输入您的生辰信息以生成星盘，开启神秘仪式。",
    nameLabel: "姓名",
    dateLabel: "出生日期",
    timeLabel: "出生时间",
    questionLabel: "心中所惑",
    placeholderName: "寻道者",
    placeholderQuestion: "宇宙对我有什么启示？",
    submitBtn: "开启仪式",
    aligning: "行星校准中...",
    deckReady: "牌阵已就绪",
    spreadBtn: "展开牌阵",
    autoBtn: "水晶球 (自动)",
    selectPrompt: "请抽取 {count} 张牌...",
    communing: "正在连结神谕...",
    synthesizing: "正在融合星象与塔罗数据",
    natalTitle: "本命星盘",
    spreadTitle: "塔罗牌阵",
    oracleTitle: "神谕降临",
    newReading: "重新占卜",
    sun: "太阳",
    moon: "月亮",
    asc: "上升",
    upright: "正位",
    reversed: "逆位",
    cardPast: "过去",
    cardPresent: "现在",
    cardFuture: "未来",
    revealBtn: "揭示命运",
    proceedBtn: "解读神谕",
    tapToReveal: "点击卡牌以揭示..."
  }
};

// Image Source Helper
// TrustedTarot uses kebab-case names. e.g. "Ace of Wands" -> "ace-of-wands.png"
const getCardImage = (englishName: string) => {
    const filename = englishName.toLowerCase().replace(/ /g, '-');
    return `https://www.trustedtarot.com/img/cards/${filename}.png`;
};

// --- DATA GENERATION FOR 78 CARDS ---

// 1. Major Arcana (22 Cards)
const MAJOR_ARCANA: TarotCardData[] = [
  { id: 0, name: { en: "The Fool", zh: "愚者" }, keywords_upright: { en: ["Beginnings", "Innocence", "Spontaneity"], zh: ["开始", "天真", "自发性"] }, keywords_reversed: { en: ["Recklessness", "Risk-taking"], zh: ["鲁莽", "冒险"] }, arcana: "Major" },
  { id: 1, name: { en: "The Magician", zh: "魔术师" }, keywords_upright: { en: ["Manifestation", "Resourcefulness", "Power"], zh: ["显化", "智谋", "力量"] }, keywords_reversed: { en: ["Manipulation", "Poor Planning"], zh: ["操纵", "计划不周"] }, arcana: "Major" },
  { id: 2, name: { en: "The High Priestess", zh: "女祭司" }, keywords_upright: { en: ["Intuition", "Sacred Knowledge", "Divine Feminine"], zh: ["直觉", "神圣知识", "神性阴性"] }, keywords_reversed: { en: ["Secrets", "Disconnected from Intuition"], zh: ["秘密", "直觉断连"] }, arcana: "Major" },
  { id: 3, name: { en: "The Empress", zh: "皇后" }, keywords_upright: { en: ["Femininity", "Beauty", "Nature"], zh: ["女性魅力", "美", "自然"] }, keywords_reversed: { en: ["Creative Block", "Dependence"], zh: ["创作瓶颈", "依赖"] }, arcana: "Major" },
  { id: 4, name: { en: "The Emperor", zh: "皇帝" }, keywords_upright: { en: ["Authority", "Establishment", "Structure"], zh: ["权威", "体制", "结构"] }, keywords_reversed: { en: ["Domination", "Excessive Control"], zh: ["支配", "过度控制"] }, arcana: "Major" },
  { id: 5, name: { en: "The Hierophant", zh: "教皇" }, keywords_upright: { en: ["Spiritual Wisdom", "Religious Beliefs", "Conformity"], zh: ["精神智慧", "信仰", "遵从"] }, keywords_reversed: { en: ["Personal Beliefs", "Freedom", "Challenging Status Quo"], zh: ["个人信仰", "自由", "挑战现状"] }, arcana: "Major" },
  { id: 6, name: { en: "The Lovers", zh: "恋人" }, keywords_upright: { en: ["Love", "Harmony", "Relationships"], zh: ["爱", "和谐", "关系"] }, keywords_reversed: { en: ["Self-Love", "Disharmony", "Imbalance"], zh: ["自爱", "不和谐", "失衡"] }, arcana: "Major" },
  { id: 7, name: { en: "The Chariot", zh: "战车" }, keywords_upright: { en: ["Control", "Willpower", "Success"], zh: ["控制", "意志力", "成功"] }, keywords_reversed: { en: ["Self-Discipline", "Opposition", "Lack of Direction"], zh: ["自律", "对立", "缺乏方向"] }, arcana: "Major" },
  { id: 8, name: { en: "Strength", zh: "力量" }, keywords_upright: { en: ["Strength", "Courage", "Persuasion"], zh: ["力量", "勇气", "说服"] }, keywords_reversed: { en: ["Inner Strength", "Self-Doubt", "Low Energy"], zh: ["内在力量", "自我怀疑", "低能量"] }, arcana: "Major" },
  { id: 9, name: { en: "The Hermit", zh: "隐士" }, keywords_upright: { en: ["Soul-Searching", "Introspection", "Being Alone"], zh: ["灵魂探索", "内省", "独处"] }, keywords_reversed: { en: ["Isolation", "Loneliness", "Withdrawal"], zh: ["隔离", "孤独", "退缩"] }, arcana: "Major" },
  { id: 10, name: { en: "Wheel of Fortune", zh: "命运之轮" }, keywords_upright: { en: ["Good Luck", "Karma", "Life Cycles"], zh: ["好运", "业力", "生命周期"] }, keywords_reversed: { en: ["Bad Luck", "Resistance to Change", "Breaking Cycles"], zh: ["厄运", "抗拒改变", "打破循环"] }, arcana: "Major" },
  { id: 11, name: { en: "Justice", zh: "正义" }, keywords_upright: { en: ["Justice", "Fairness", "Truth"], zh: ["正义", "公平", "真相"] }, keywords_reversed: { en: ["Unfairness", "Lack of Accountability", "Dishonesty"], zh: ["不公", "逃避责任", "不诚实"] }, arcana: "Major" },
  { id: 12, name: { en: "The Hanged Man", zh: "倒吊人" }, keywords_upright: { en: ["Pause", "Surrender", "Letting Go"], zh: ["暂停", "臣服", "放手"] }, keywords_reversed: { en: ["Delays", "Resistance", "Stalling"], zh: ["延迟", "抗拒", "拖延"] }, arcana: "Major" },
  { id: 13, name: { en: "Death", zh: "死神" }, keywords_upright: { en: ["Endings", "Change", "Transformation"], zh: ["结束", "改变", "转化"] }, keywords_reversed: { en: ["Resistance to Change", "Personal Transformation"], zh: ["抗拒改变", "个人转化"] }, arcana: "Major" },
  { id: 14, name: { en: "Temperance", zh: "节制" }, keywords_upright: { en: ["Balance", "Moderation", "Patience"], zh: ["平衡", "适度", "耐心"] }, keywords_reversed: { en: ["Imbalance", "Excess", "Self-Healing"], zh: ["失衡", "过度", "自我疗愈"] }, arcana: "Major" },
  { id: 15, name: { en: "The Devil", zh: "恶魔" }, keywords_upright: { en: ["Shadow Self", "Attachment", "Addiction"], zh: ["阴暗面", "依恋", "成瘾"] }, keywords_reversed: { en: ["Releasing Limiting Beliefs", "Exploring Dark Thoughts"], zh: ["释放限制性信念", "探索黑暗思想"] }, arcana: "Major" },
  { id: 16, name: { en: "The Tower", zh: "高塔" }, keywords_upright: { en: ["Sudden Change", "Upheaval", "Chaos"], zh: ["骤变", "动荡", "混乱"] }, keywords_reversed: { en: ["Personal Transformation", "Fear of Change"], zh: ["个人转化", "恐惧改变"] }, arcana: "Major" },
  { id: 17, name: { en: "The Star", zh: "星星" }, keywords_upright: { en: ["Hope", "Faith", "Purpose"], zh: ["希望", "信念", "目标"] }, keywords_reversed: { en: ["Lack of Faith", "Despair", "Self-Trust"], zh: ["缺乏信念", "绝望", "自我信任"] }, arcana: "Major" },
  { id: 18, name: { en: "The Moon", zh: "月亮" }, keywords_upright: { en: ["Illusion", "Fear", "Anxiety"], zh: ["幻觉", "恐惧", "焦虑"] }, keywords_reversed: { en: ["Release of Fear", "Repressed Emotion"], zh: ["释放恐惧", "压抑的情绪"] }, arcana: "Major" },
  { id: 19, name: { en: "The Sun", zh: "太阳" }, keywords_upright: { en: ["Positivity", "Fun", "Warmth", "Success"], zh: ["积极", "乐趣", "温暖", "成功"] }, keywords_reversed: { en: ["Inner Child", "Feeling Down", "Overly Optimistic"], zh: ["内在小孩", "情绪低落", "过度乐观"] }, arcana: "Major" },
  { id: 20, name: { en: "Judgement", zh: "审判" }, keywords_upright: { en: ["Judgement", "Rebirth", "Inner Calling"], zh: ["审判", "重生", "内在召唤"] }, keywords_reversed: { en: ["Self-Doubt", "Inner Critic", "Ignoring the Call"], zh: ["自我怀疑", "内在批判", "忽视召唤"] }, arcana: "Major" },
  { id: 21, name: { en: "The World", zh: "世界" }, keywords_upright: { en: ["Completion", "Integration", "Accomplishment"], zh: ["完成", "整合", "成就"] }, keywords_reversed: { en: ["Seeking Personal Closure", "Shortcuts", "Delays"], zh: ["寻求个人终结", "捷径", "延迟"] }, arcana: "Major" }
].map(c => ({ ...c, image: getCardImage(c.name.en) } as TarotCardData));

// 2. Minor Arcana Generator
const SUITS = [
    { en: "Wands", zh: "权杖", key: "Wands" },
    { en: "Cups", zh: "圣杯", key: "Cups" },
    { en: "Swords", zh: "宝剑", key: "Swords" },
    { en: "Pentacles", zh: "星币", key: "Pentacles" }
] as const;

const RANKS = [
    { val: 1, en: "Ace", zh: "一" },
    { val: 2, en: "Two", zh: "二" },
    { val: 3, en: "Three", zh: "三" },
    { val: 4, en: "Four", zh: "四" },
    { val: 5, en: "Five", zh: "五" },
    { val: 6, en: "Six", zh: "六" },
    { val: 7, en: "Seven", zh: "七" },
    { val: 8, en: "Eight", zh: "八" },
    { val: 9, en: "Nine", zh: "九" },
    { val: 10, en: "Ten", zh: "十" },
    { val: 11, en: "Page", zh: "侍从" },
    { val: 12, en: "Knight", zh: "骑士" },
    { val: 13, en: "Queen", zh: "皇后" },
    { val: 14, en: "King", zh: "国王" },
];

const generateMinorArcana = (): TarotCardData[] => {
    let cards: TarotCardData[] = [];
    let idCounter = 22; // Start after Major Arcana
    
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            const nameEn = `${rank.en} of ${suit.en}`;
            cards.push({
                id: idCounter++,
                name: {
                    en: nameEn,
                    zh: `${suit.zh}${rank.zh}`
                },
                image: getCardImage(nameEn),
                arcana: 'Minor',
                suit: suit.key,
                keywords_upright: { 
                    en: [`${suit.en} Energy`, "Action", "Focus"], 
                    zh: [`${suit.zh}能量`, "行动", "专注"] 
                },
                keywords_reversed: { 
                    en: ["Blocked Energy", "Delays", "Imbalance"], 
                    zh: ["能量受阻", "延迟", "失衡"] 
                }
            });
        });
    });
    return cards;
};

// Combine decks
export const TAROT_DECK: TarotCardData[] = [...MAJOR_ARCANA, ...generateMinorArcana()];

// The visual deck is the full deck
export const FULL_DECK_VISUAL = TAROT_DECK;
