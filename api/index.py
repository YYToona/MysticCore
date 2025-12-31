import json
from datetime import datetime
from http import HTTPStatus

try:
    from kerykeion import KrInstance
    KERYKEION_AVAILABLE = True
except ImportError:
    KERYKEION_AVAILABLE = False

def app(request):
    """Vercel Serverless Function 主处理函数 (使用标准入口点名称)"""
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",  # 生产环境应替换为前端域名
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    # 处理预检请求
    if request.get("method") == "OPTIONS":
        return {"statusCode": HTTPStatus.OK, "headers": headers, "body": ""}

    # 只处理POST请求
    if request.get("method") != "POST":
        return {
            "statusCode": HTTPStatus.METHOD_NOT_ALLOWED,
            "headers": headers,
            "body": json.dumps({"error": "仅支持POST请求"})
        }

    try:
        # 1. 解析请求（增强健壮性）
        body = request.get("body")
        if not body:
            return {
                "statusCode": HTTPStatus.BAD_REQUEST,
                "headers": headers,
                "body": json.dumps({"error": "请求体为空"})
            }
        data = json.loads(body)
        
        date_str = data.get("date", "").strip()
        time_str = data.get("time", "").strip()
        lat = data.get("lat")
        lng = data.get("lng")

        # 验证必要参数
        if not date_str or not time_str or lat is None or lng is None:
            return {
                "statusCode": HTTPStatus.BAD_REQUEST,
                "headers": headers,
                "body": json.dumps({"error": "缺少必要参数: date, time, lat, lng"})
            }

        lat = float(lat)
        lng = float(lng)

        # 2. 检查库是否安装
        if not KERYKEION_AVAILABLE:
            raise RuntimeError("服务器未安装kerykeion库，请检查requirements.txt")

        # 3. 解析时间 (假设输入为本地时间，此处简化为使用本地时间计算)
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")

        # 4. === 核心计算：创建星盘实例 ===
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

        # 5. === 构建响应数据 (修正数据结构) ===
        # 5.1 计算所有主要行星
        planet_names = ['sun', 'moon', 'mercury', 'venus', 'mars', 
                       'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
        planets = []
        for name in planet_names:
            planet_obj = getattr(kr, name, None)
            if planet_obj:
                # 修正：直接访问对象属性。sign是星座名称字符串，需要映射为索引。
                sign_name = planet_obj.sign
                sign_list = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
                try:
                    sign_index = sign_list.index(sign_name)
                except ValueError:
                    sign_index = 0
                
                planets.append({
                    "name": name.capitalize(),
                    "sign": sign_index,  # 前端期望的索引 (0:白羊)
                    "degree": round(planet_obj.position, 6),
                    "house": getattr(planet_obj, 'house', 1),
                    "absDegree": round(planet_obj.abs_pos, 6)  # 新增：绝对黄道经度
                })

        # 5.2 计算宫位
        houses = []
        # 修正：kr.houses 是对象列表，包含 sign 和 position 等属性
        for i, house_obj in enumerate(kr.houses):
            sign_name = house_obj.sign
            sign_list = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            try:
                sign_index = sign_list.index(sign_name)
            except ValueError:
                sign_index = 0
            houses.append({
                "house": i + 1,
                "sign": sign_index,
                "degree": round(house_obj.position, 6)
            })

        # 5.3 计算上升点与中天
        asc_sign_name = kr.ascendant.sign
        mc_sign_name = kr.midheaven.sign
        sign_list = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        asc_sign_index = sign_list.index(asc_sign_name) if asc_sign_name in sign_list else 0
        mc_sign_index = sign_list.index(mc_sign_name) if mc_sign_name in sign_list else 0

        ascendant = {
            "sign": asc_sign_index,
            "degree": round(kr.ascendant.position, 6)
        }
        midheaven = {
            "sign": mc_sign_index,
            "degree": round(kr.midheaven.position, 6)
        }

        # 5.4 (示例) 计算相位 - 这里需要更复杂的逻辑，先返回空数组
        aspects = []

        response_data = {
            "success": True,
            "data": {
                "planets": planets,
                "houses": houses,
                "ascendant": ascendant,
                "midheaven": midheaven,
                "aspects": aspects  # 相位计算需额外实现
            },
            "query": {  # 新增：返回查询参数便于调试
                "date": date_str,
                "time": time_str,
                "lat": lat,
                "lng": lng
            }
        }

        return {
            "statusCode": HTTPStatus.OK,
            "headers": headers,
            "body": json.dumps(response_data, ensure_ascii=False, indent=2)
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
            "body": json.dumps({"error": f"参数格式错误: {str(e)}"})
        }
    except Exception as e:
        # 打印日志到Vercel控制台
        print(f"[ERROR] {str(e)}")
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "headers": headers,
            "body": json.dumps({"error": f"服务器内部错误: {str(e)}"})
        }

# 注意：Vercel会自动查找 `app` 函数作为入口，因此无需再定义 `main` 函数。
