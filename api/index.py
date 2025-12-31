import json
from datetime import datetime
from http import HTTPStatus

# 尝试导入kerykeion，部署时Vercel会根据requirements.txt安装
try:
    from kerykeion import KrInstance
    KERYKEION_AVAILABLE = True
except ImportError:
    KERYKEION_AVAILABLE = False

def handler(request):
    """Vercel Serverless Function 主处理函数"""
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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
        # 解析请求
        body = request.get("body", "{}")
        data = json.loads(body)
        date_str = data.get("date", "")
        time_str = data.get("time", "")
        lat = float(data.get("lat", 0))
        lng = float(data.get("lng", 0))

        # 检查库是否安装
        if not KERYKEION_AVAILABLE:
            raise RuntimeError("服务器未安装kerykeion库，请检查requirements.txt")

        # 解析时间
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")

        # === 核心计算：创建星盘实例 ===
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

        # === 构建响应数据（示例结构，您可根据需要扩展）===
        response_data = {
            "success": True,
            "data": {
                "planets": [
                    {
                        "name": "Sun",
                        "sign": getattr(kr.sun, "sign_num", 1) - 1,
                        "degree": round(getattr(kr.sun, "position", 0.0), 2),
                        "house": getattr(kr.sun, "house", 1),
                    }
                    # 可在此处添加其他行星：kr.moon, kr.mercury等
                ],
                "houses": [
                    {
                        "house": i + 1,
                        "sign": (house["sign_num"] - 1) if hasattr(house, "sign_num") else 0,
                        "degree": round(house["position"], 2) if hasattr(house, "position") else 0.0,
                    }
                    for i, house in enumerate(kr.houses)
                ] if hasattr(kr, "houses") else [],
                "ascendant": {
                    "sign": getattr(kr.ascendant, "sign_num", 1) - 1,
                    "degree": round(getattr(kr.ascendant, "position", 0.0), 2),
                } if hasattr(kr, "ascendant") else {"sign": 0, "degree": 0.0},
            }
        }

        return {
            "statusCode": HTTPStatus.OK,
            "headers": headers,
            "body": json.dumps(response_data, ensure_ascii=False)
        }

    except Exception as e:
        return {
            "statusCode": HTTPStatus.INTERNAL_SERVER_ERROR,
            "headers": headers,
            "body": json.dumps({"error": f"服务器内部错误: {str(e)}"})
        }

# Vercel入口点
def main(request):
    return handler(request)
