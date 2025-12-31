from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from datetime import datetime
from typing import List, Optional
import sys

# --- 1. 初始化 FastAPI 应用并配置 CORS ---
app = FastAPI(
    title="星盘计算API",
    description="基于 kerykeion 的精确星盘计算服务",
    version="1.0.0"
)

# 配置CORS，允许前端跨域请求（生产环境应替换为具体的前端域名）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 临时设为所有，上线前务必修改
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- 2. 使用 Pydantic 定义请求/响应模型 ---
class ChartRequest(BaseModel):
    """计算星盘的请求参数模型"""
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    lat: float
    lng: float

    @validator('date')
    def validate_date_format(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('日期格式必须为 YYYY-MM-DD')
        return v

    @validator('time')
    def validate_time_format(cls, v):
        try:
            datetime.strptime(v, '%H:%M')
        except ValueError:
            raise ValueError('时间格式必须为 HH:MM')
        return v

class PlanetPosition(BaseModel):
    """行星位置模型"""
    name: str
    sign: int  # 星座索引，0-11
    degree: float
    house: int
    absDegree: float

class HousePosition(BaseModel):
    """宫位模型"""
    house: int  # 1-12
    sign: int
    degree: float

class ChartResponse(BaseModel):
    """星盘计算响应模型"""
    success: bool = True
    data: dict
    query: Optional[dict] = None

# --- 3. 核心计算函数（与框架解耦，便于测试） ---
# 星座名称到索引的映射
SIGN_LIST = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]

def sign_name_to_index(sign_name: str) -> int:
    """将星座英文名称转换为前端使用的索引 (0-11)"""
    try:
        return SIGN_LIST.index(sign_name)
    except ValueError:
        return 0  # 默认为白羊座

def calculate_chart_data(date_str: str, time_str: str, lat: float, lng: float) -> dict:
    """
    核心计算函数：根据时间地点计算星盘数据。
    此函数不依赖FastAPI，纯业务逻辑，便于单独测试。
    """
    # 检查并导入 kerykeion
    try:
        from kerykeion import KrInstance
    except ImportError as e:
        raise RuntimeError(f"天文计算库 kerykeion 未安装: {e}。请确保 requirements.txt 中包含 kerykeion。")

    # 解析时间
    dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")

    # 创建星盘实例
    kr = KrInstance(
        name="Chart",
        year=dt.year,
        month=dt.month,
        day=dt.day,
        hour=dt.hour,
        minute=dt.minute,
        lat=lat,
        lng=lng,
    )

    # 计算行星位置
    planet_names = ['sun', 'moon', 'mercury', 'venus', 'mars',
                    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
    planets = []
    for name in planet_names:
        planet_obj = getattr(kr, name, None)
        if planet_obj:
            planets.append(PlanetPosition(
                name=name.capitalize(),
                sign=sign_name_to_index(planet_obj.sign),
                degree=round(planet_obj.position, 6),
                house=getattr(planet_obj, 'house', 1),
                absDegree=round(planet_obj.abs_pos, 6)
            ))

    # 计算宫位
    houses = []
    for i, house_obj in enumerate(kr.houses):
        houses.append(HousePosition(
            house=i + 1,
            sign=sign_name_to_index(house_obj.sign),
            degree=round(house_obj.position, 6)
        ))

    # 计算上升点与中天
    ascendant = {
        "sign": sign_name_to_index(kr.ascendant.sign),
        "degree": round(kr.ascendant.position, 6)
    }
    midheaven = {
        "sign": sign_name_to_index(kr.midheaven.sign),
        "degree": round(kr.midheaven.position, 6)
    }

    # 返回结构化的数据字典
    return {
        "planets": [p.dict() for p in planets],
        "houses": [h.dict() for h in houses],
        "ascendant": ascendant,
        "midheaven": midheaven,
        "aspects": []  # 相位计算可作为后续扩展
    }

# --- 4. 定义 API 路由 ---
@app.post("/api/calculate_chart",
          response_model=ChartResponse,
          status_code=status.HTTP_200_OK,
          summary="计算星盘",
          description="根据提供的出生日期、时间和地点计算详细的星盘信息，包括行星位置、宫位等。")
async def calculate_chart(request: ChartRequest):
    """
    星盘计算接口。
    """
    try:
        # 调用核心计算函数
        chart_data = calculate_chart_data(
            date_str=request.date,
            time_str=request.time,
            lat=request.lat,
            lng=request.lng
        )

        # 构建响应
        return ChartResponse(
            data=chart_data,
            query=request.dict()
        )

    except ValueError as e:
        # 处理参数格式错误等已知问题
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"参数错误: {str(e)}"
        )
    except RuntimeError as e:
        # 处理库未安装等运行时错误
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"服务器配置错误: {str(e)}"
        )
    except Exception as e:
        # 捕获其他所有未预见的异常
        print(f"[SERVER ERROR] {datetime.now()}: {str(e)}", file=sys.stderr)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="星盘计算过程中发生内部错误，请稍后重试。"
        )

# --- 5. 健康检查端点（可选但推荐）---
@app.get("/api/health")
async def health_check():
    """服务健康检查端点"""
    return {"status": "healthy", "service": "astro-chart-api"}
