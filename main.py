from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import json
import httpx
import time
import random
import re
from pydantic import BaseModel
from fastapi import Body


app = FastAPI()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# 🔧 Otomatik örnek veri üretici (POST/PUT için)
def generate_sample_data(schema: dict) -> dict:
    sample = {}
    properties = schema.get("properties", {})
    for key, prop in properties.items():
        typ = prop.get("type", "string")
        if typ == "string":
            sample[key] = f"{key}_example"
        elif typ == "integer":
            sample[key] = random.randint(1, 100)
        elif typ == "boolean":
            sample[key] = True
        elif typ == "array":
            sample[key] = []
        elif typ == "object":
            sample[key] = {}
        else:
            sample[key] = None
    return sample


# 📥 Swagger dosyası yükleme
@app.post("/upload-swagger")
async def upload_swagger(file: UploadFile = File(...)):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Sadece JSON dosyaları destekleniyor.")

    file_location = os.path.join(UPLOAD_DIR, file.filename)
    try:
        contents = await file.read()
        swagger_json = json.loads(contents.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Geçersiz JSON formatı.")

    with open(file_location, "wb") as f:
        f.write(contents)

    # Endpoint listesi çıkar
    endpoints = []
    paths = swagger_json.get("paths", {})
    for path, methods in paths.items():
        for method, details in methods.items():
            endpoints.append({
                "path": path,
                "method": method.upper(),
                "summary": details.get("summary", ""),
                "parameters": details.get("parameters", [])
            })

    return JSONResponse(content={
        "success": True,
        "endpoint_count": len(endpoints),
        "endpoints": endpoints
    })


# ▶️ Swagger'dan test çalıştır
@app.post("/run-tests")
async def run_tests():
    try:
        latest_file = max(
            [os.path.join(UPLOAD_DIR, f) for f in os.listdir(UPLOAD_DIR) if f.endswith(".json")],
            key=os.path.getctime
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Hiçbir Swagger dosyası yüklenmemiş.")

    with open(latest_file, "r", encoding="utf-8") as f:
        swagger_json = json.load(f)

    # 🌐 Base URL Swagger'daki servers içinden
    servers = swagger_json.get("servers", [])
    base_url = servers[0]["url"] if servers else "http://localhost:8000"

    test_results = []
    paths = swagger_json.get("paths", {})

    async with httpx.AsyncClient() as client:
        for path, methods in paths.items():
            for method, details in methods.items():
                # Path parametrelerini "1" ile değiştir
                test_url = base_url + re.sub(r"\{[^}]*\}", "1", path)
                start_time = time.time()

                if method.lower() == "get":
                    try:
                        response = await client.get(test_url)
                        duration = time.time() - start_time
                        test_results.append({
                            "url": test_url,
                            "method": "GET",
                            "status_code": response.status_code,
                            "response_time": round(duration, 3),
                            "success": response.status_code == 200
                        })
                    except Exception as e:
                        test_results.append({
                            "url": test_url,
                            "method": "GET",
                            "error": str(e),
                            "success": False
                        })

                elif method.lower() in ["post", "put"]:
                    schema = details.get("requestBody", {}).get("content", {}).get("application/json", {}).get("schema", {})
                    payload = generate_sample_data(schema)
                    try:
                        response = await client.request(method.upper(), test_url, json=payload)
                        duration = time.time() - start_time
                        test_results.append({
                            "url": test_url,
                            "method": method.upper(),
                            "payload": payload,
                            "status_code": response.status_code,
                            "response_time": round(duration, 3),
                            "success": 200 <= response.status_code < 300
                        })
                    except Exception as e:
                        test_results.append({
                            "url": test_url,
                            "method": method.upper(),
                            "payload": payload,
                            "error": str(e),
                            "success": False
                        })

    return {
        "test_count": len(test_results),
        "results": test_results
    }


# 🔽 Örnek API uçları (lokal test için)
@app.get("/hello")
def hello():
    return {"message": "Merhaba dünya!"}


class User(BaseModel):
    name: str
    age: int

@app.post("/users")
def create_user(user: User):
    return {"id": 1, "created": user}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "John Doe", "age": 30}



@app.post("/import-swagger")
async def import_swagger(url: str = Body(..., embed=True)):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Swagger dokümanı alınamadı.")

            swagger_json = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hata: {str(e)}")

    # Dosya gibi kaydet (isteğe bağlı ama uyumlu olsun)
    filename = f"remote_swagger_{int(time.time())}.json"
    file_location = os.path.join(UPLOAD_DIR, filename)
    with open(file_location, "w", encoding="utf-8") as f:
        json.dump(swagger_json, f, indent=2)

    # Endpoint’leri oku
    endpoints = []
    paths = swagger_json.get("paths", {})
    for path, methods in paths.items():
        for method, details in methods.items():
            endpoints.append({
                "path": path,
                "method": method.upper(),
                "summary": details.get("summary", ""),
                "parameters": details.get("parameters", [])
            })

    return JSONResponse(content={
        "success": True,
        "source": url,
        "filename": filename,
        "endpoint_count": len(endpoints),
        "endpoints": endpoints
    })


@app.post("/generate-swagger-from-endpoint")
async def generate_swagger_from_endpoint(url: str = Body(..., embed=True)):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Veri alınamadı.")

            data = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Veri çekilirken hata oluştu: {str(e)}")

    # Tek bir nesne mi, liste mi?
    if isinstance(data, list):
        sample = data[0] if data else {}
    elif isinstance(data, dict):
        sample = data
    else:
        raise HTTPException(status_code=400, detail="JSON formatı desteklenmiyor.")

    # JSON'a göre property listesi çıkar
    def get_type(value):
        if isinstance(value, str):
            return "string"
        elif isinstance(value, int):
            return "integer"
        elif isinstance(value, float):
            return "number"
        elif isinstance(value, bool):
            return "boolean"
        elif isinstance(value, list):
            return "array"
        elif isinstance(value, dict):
            return "object"
        else:
            return "string"

    properties = {}
    for key, value in sample.items():
        properties[key] = {"type": get_type(value)}

    # Basit Swagger JSON üret
    swagger_template = {
        "openapi": "3.0.0",
        "info": {
            "title": f"Otomatik Swagger: {url}",
            "version": "1.0.0"
        },
        "paths": {
            "/" + url.split("/")[-1]: {
                "get": {
                    "summary": "Otomatik üretilmiş endpoint",
                    "responses": {
                        "200": {
                            "description": "Başarılı yanıt",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": properties
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "servers": [
            {"url": url.rsplit("/", 1)[0]}  # Ana domain adresini al
        ]
    }

    # Dosyaya yaz
    filename = f"auto_swagger_{int(time.time())}.json"
    file_location = os.path.join(UPLOAD_DIR, filename)
    with open(file_location, "w", encoding="utf-8") as f:
        json.dump(swagger_template, f, indent=2)

    return {
        "success": True,
        "filename": filename,
        "endpoint": url,
        "swagger_path": "/" + url.split("/")[-1],
        "detected_fields": list(properties.keys())
    }
