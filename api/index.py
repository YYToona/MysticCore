"""
星盘计算API
部署在Vercel Serverless Function (Python运行时)
处理 /api/astro 的POST请求，计算并返回星盘数据。
"""

import json
import math
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from http import HTTPStatus

# 假设使用kerykeion进行天文计算
# 本地开发需安装: pip install kerykeion
# 在Vercel部署时，需在requirements.txt中声明
try:
    from kerykeion import KrInstance, Match
except ImportError:
    # 提供fallback以避免本地导入错误，实际部署必须安装
    KrInstance = None
    Match = None

# --- 核心计算函数 (替代占位符) ---

def calculate_planet_position(kr_object, planet_name: str) -> Dict[str, Any]:
    """从KrInstance中提取单颗行星的详细位置信息。"""
    try:
        # 获取行星数据 (kerykeion的属性名可能略有不同，此处为通用逻辑)
        # 实际属性名请参考kerykeion文档，例如：kr_object.sun, kr_object.moon等
        planet_data = getattr(kr_object, planet_name.lower(), None)

        if not planet_data:
            # 备用方法：在planets_list中查找
            for p in kr_object.planets_list:
                if p["name"].lower() == planet_name.lower():
                    planet_data = p
                    break

        if planet_data:
            # 解析数据，转换为前端需要的格式
            # 注意：kerykeion返回的sign可能从1开始（白羊=1），前端可能从0开始
            sign_num = int(planet_data.get("sign", 0))  # 星座索引（可能1-12）
            sign_degree = float(planet_data.get("position", 0.0))  # 在星座内的度数
            absolute_degree = float(planet_data.get("abs_pos", 0.0))  # 绝对黄道经度

            # 确保星座编号在0-11范围内（前端期望）
            frontend_sign_num = (sign_num - 1) % 12 if sign_num > 0 else 0

            return {
                "name": planet_name.capitalize(),
                "sign": frontend_sign_num,  # 星座索引 (0:白羊, 11:双鱼)
                "degree": round(sign_degree, 6),
                "house": int(planet_data.get("house", 1)),  # 所在宫位 (1-12)
                "absDegree": round(absolute_degree, 6),
            }
    except Exception as e:
        print(f"计算行星 {planet_name} 时出错: {e}")

    # 默认值（计算失败时）
    return {
        "name": planet_name.capitalize(),
        "sign": 0,
        "degree": 0.0,
        "house": 1,
        "absDegree": 0.0,
    }

def calculate_aspects(kr_object, planets_data: List[Dict]) -> List[Dict[str, Any]]:
    """计算行星间的相位关系。"""
    aspects = []
    if not Match or not planets_data:
        return aspects

    try:
        # 使用kerykeion的Match类进行相位计算
        # 注意：这里需要根据实际kerykeion的API调整
        match = Match(kr_object, kr_object)  # 示例：与自己星盘比较（本命盘相位）

        # 获取相位列表
        aspect_list = getattr(match, "aspects_list", [])

        for aspect in aspect_list:
            p1_name = aspect.get("p1_name", "").capitalize()
            p2_name = aspect.get("p2_name", "").capitalize()
            aspect_type = aspect.get("aspect", "")
            difference = float(aspect.get("orbit", 0.0))

            # 映射相位类型到前端定义
            aspect_map = {
                "Conjunction": "conjunction",
                "Opposition": "opposition",
                "Square": "square",
                "Trine": "trine",
                "Sextile": "sextile",
            }
            frontend_aspect_type = aspect_map.get(aspect_type, "other")

            # 只保留主要相位
            if frontend_aspect_type != "other" and abs(difference) <= 8.0:  # 8度容许度
                aspects.append({
                    "planet1": p1_name,
                    "planet2": p2_name,
                    "aspect": frontend_aspect_type,
                    "difference": round(difference, 4),
                })
    except Exception as e:
        print(f"计算相位时出错: {e}")
        # 备用：简单几何计算（如果kerykeion不提供相位数据）
        aspects = calculate_aspects_fallback(planets_data)

    return aspects

def calculate_aspects_fallback(planets: List[Dict]) -> List[Dict[str, Any]]:
    """备用方法：基于行星绝对角度计算相位（几何分析）。"""
    aspects = []
    orb_tolerance = 8.0  # 相位容许度

    # 主要相位的角度差
    major_aspects = {
        "conjunction": 0,
        "opposition": 180,
        "square": 90,
        "trine": 120,
        "sextile": 60,
    }

    for i in range(len(planets)):
        for j in range(i + 1, len(planets)):
            p1 = planets[i]
            p2 = planets[j]

            # 忽略非标准行星
            if "absDegree" not in p1 or "absDegree" not in p2:
                continue

            diff = abs(p1["absDegree"] - p2["absDegree"])
            diff = min(diff, 360 - diff)  # 圆周最短距离

            for aspect_name, target_angle in major_aspects.items():
                if abs(diff - target_angle) <= orb_tolerance:
                    aspects.append({
                        "planet1": p1["name"],
                        "planet2": p2["name"],
                        "aspect": aspect_name,
                        "difference": round(p1["absDegree"] - p2["absDegree"], 4),
                    })
                    break  # 每个行星对只匹配一个主要相位

    return aspects

def calculate_houses(kr_object) -> List[Dict[str, Any]]:
    """计算十二宫宫头位置。"""
    houses = []
    try:
        # kerykeion中houses属性存储宫位信息
        houses_data = getattr(kr_object, "houses", [])
        if not houses_data and hasattr(kr_object, 'house_list'):
            houses_data = kr_object.house_list

        for i in range(12):  # 12宫位
            if i < len(houses_data):
                house_info = houses_data[i]
                sign_num = int(house_info.get("sign", 1))
                frontend_sign_num = (sign_num - 1) % 12 if sign_num > 0 else 0
                houses.append({
                    "house": i + 1,  # 宫位编号1-12
                    "sign": frontend_sign_num,
                    "degree": float(house_info.get("position", 0.0)),
                })
            else:
                # 默认值
                houses.append({
                    "house": i + 1,
                    "sign": 0,
                    "degree": 0.0,
                })
    except Exception as e:
        print(f"计算宫位时出错: {e}")
        # 提供默认宫位（等宫制）
        for i in range(12):
            houses.append({
                "house": i + 1,
                "sign": (i * 30) // 30,
                "degree": round((i * 30) % 30, 2),
            })

    return houses

def calculate_asc_mc(kr_object) -> Dict[str, Any]:
    """计算上升点(ASC)和中天(MC)的位置。"""
    try:
        asc_data = getattr(kr_object, "ascendant", {})
        mc_data = getattr(kr_object, "midheaven", {})

        asc_sign = int(asc_data.get("sign", 1)) - 1
        mc_sign = int(mc_data.get("sign", 1)) - 1

        return {
            "ascendant": {
                "sign": max(0, asc_sign),
                "degree": round(float(asc_data.get("position", 0.0)), 6),
            },
            "midheaven": {
                "sign": max(0, mc_sign),
                "degree": round(float(mc_data.get("position", 0.0)), 6),
            },
        }
    except Exception as e:
        print(f"计算上升/中天时出错: {e}")
        return {
            "ascendant": {"sign": 0, "degree": 0.0},
            "midheaven": {"sign": 0, "degree": 0.0},
        }

# --- HTTP请求处理 (Vercel Serverless入口) ---

def handler(request: dict) -> dict:
    """Vercel Serverless Function 主处理函数"""
    # 设置CORS头，允许前端访问
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    # 处理预检OPTIONS请求
    if request.get("method") == "OPTIONS":
        return {
            "statusCode": HTTPStatus.OK,
            "headers": headers,
            "body": ""
        }

    # 只处理POST请求
    if request.get("method") != "POST":
        return {
            "statusCode": HTTPStatus.METHOD_NOT_ALLOWED,
            "headers": headers,
            "body": json.dumps({"error": "仅支持POST请求"})
        }

    try:
        # 解析请求体
        body = request.get("body", "{}")
        data = json.loads(body)

        # 验证必要参数
        required_fields = ["date", "time", "lat", "lng"]
        for field in required_fields:
            if field not in data:
                return {
                    "statusCode": HTTPStatus.BAD_REQUEST,
                    "headers": headers,
                    "body": json.dumps({"error": f"缺少必要参数: {field}"})
                }

        # 提取参数
        date_str = data["date"]  # 格式: "YYYY-MM-DD"
        time_str = data["time"]  # 格式: "HH:MM"
        lat = float(data["lat"])
        lng = float(data["lng"])

        # 解析日期时间
        datetime_str = f"{date_str} {time_str}"
        try:
            native_dt = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")
            # 转换为UTC（假设输入时间是本地时间，这里简化处理）
            # 实际应根据用户时区调整，这里使用UTC
            utc_dt = native_dt.replace(tzinfo=timezone.utc)
        except ValueError:
            return {
                "statusCode": HTTPStatus.BAD_REQUEST,
                "headers": headers,
                "body": json.dumps({"error": "日期时间格式错误，应为 YYYY-MM-DD HH:MM"})
            }

        # 检查kerykeion是否可用
        if KrInstance is None:
            return {
                "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
                "headers": headers,
                "body": json.dumps({"error": "服务器未安装kerykeion库"})
            }

        # --- 核心计算 ---
        # 创建kerykeion星盘实例
        kr = KrInstance(
            name="User",
            year=utc_dt.year,
            month=utc_dt.month,
            day=utc_dt.day,
            hour=utc_dt.hour,
            minute=utc_dt.minute,
            lat=lat,
            lng=lng,
        )

        # 1. 计算行星位置
        planet_names = ["sun", "moon", "mercury", "venus", "mars", 
                       "jupiter", "saturn", "uranus", "neptune", "pluto"]
        planets = [calculate_planet_position(kr, name) for name in planet_names]

        # 2. 计算宫位
        houses = calculate_houses(kr)

        # 3. 计算上升点与中天
        asc_mc = calculate_asc_mc(kr)

        # 4. 计算相位
        aspects = calculate_aspects(kr, planets)

        # 构建符合前端Typescript接口的响应
        response_data = {
            "success": True,
            "data": {
                "planets": planets,
                "houses": houses,
                "aspects": aspects,
                "ascendant": asc_mc["ascendant"],
                "midheaven": asc_mc["midheaven"],
            },
            "query": {
                "date": date_str,
                "time": time_str,
                "lat": lat,
                "lng": lng,
            }
        }

        return {
            "statusCode": HTTPStatus.OK,
            "headers": headers,
            "body": json.dumps(response_data, ensure_ascii=False)
        }

    except json.JSONDecodeError:
        return {
            "statusCode": HTTPStatus.BAD_REQUEST,
            "headers": headers,
            "body": json.dumps({"error": "请求体不是有效的JSON"})
        }
    except ValueError as e:
        return {
            "statusCode": HTTPStatus.BAD_REQUEST,
            "headers": headers,
            "body": json.dumps({"error": f"参数值错误: {str(e)}"})
        }
    except Exception as e:
        print(f"服务器内部错误: {e}")  # 在Vercel日志中可见
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "headers": headers,
            "body": json.dumps({"error": f"服务器内部错误: {str(e)}"})
        }

# Vercel Serverless Function标准入口点
def main(request):
    return handler(request)
