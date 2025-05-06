from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import json
import httpx
import time
import random
import re
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()  # .env dosyasını yükle

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme ortamında hepsine izin ver
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



UPLOAD_DIR = "uploaded_files"
TEST_RESULTS_DIR = "test_results"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TEST_RESULTS_DIR, exist_ok=True)


# 🔧 Örnek payload üretici
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
    # 1. Uzantı kontrolü
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Sadece JSON dosyaları destekleniyor.")

    # 2. Dosya içeriğini oku ve JSON olup olmadığını kontrol et
    try:
        contents = await file.read()
        swagger_json = json.loads(contents.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Geçersiz JSON formatı.")

    # 3. Dosyayı kaydet (isteğe bağlı)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # 4. Endpoint listesini çıkart (opsiyonel)
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

    return {
        "success": True,
        "filename": file.filename,
        "endpoint_count": len(endpoints),
        "endpoints": endpoints
    }

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

    servers = swagger_json.get("servers", [])
    base_url = servers[0]["url"] if servers else "http://localhost:8000"

    test_results = []
    paths = swagger_json.get("paths", {})

    async with httpx.AsyncClient() as client:
        for path, methods in paths.items():
            for method, details in methods.items():
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

    # 🔴 LOG KAYDET
    result_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "test_count": len(test_results),
        "results": test_results
    }

    result_filename = f"test_result_{int(time.time())}.json"
    result_path = os.path.join(TEST_RESULTS_DIR, result_filename)
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(result_data, f, indent=2)

    return {
        **result_data,
        "saved_as": result_filename
    }


# 🌐 Swagger URL'den içe aktarma
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

    filename = f"remote_swagger_{int(time.time())}.json"
    file_location = os.path.join(UPLOAD_DIR, filename)
    with open(file_location, "w", encoding="utf-8") as f:
        json.dump(swagger_json, f, indent=2)

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


# 🌐 JSON endpoint'ten Swagger üretme
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

    if isinstance(data, list):
        sample = data[0] if data else {}
    elif isinstance(data, dict):
        sample = data
    else:
        raise HTTPException(status_code=400, detail="JSON formatı desteklenmiyor.")

    def get_type(value):
        if isinstance(value, str): return "string"
        if isinstance(value, int): return "integer"
        if isinstance(value, float): return "number"
        if isinstance(value, bool): return "boolean"
        if isinstance(value, list): return "array"
        if isinstance(value, dict): return "object"
        return "string"

    properties = {key: {"type": get_type(val)} for key, val in sample.items()}

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
            {"url": url.rsplit("/", 1)[0]}
        ]
    }

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

@app.get("/test-history")
def list_test_results():
    try:
        files = [
            f for f in os.listdir(TEST_RESULTS_DIR)
            if f.endswith(".json")
        ]
        results = []
        for file in sorted(files, reverse=True):
            file_path = os.path.join(TEST_RESULTS_DIR, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = json.load(f)
                results.append({
                    "filename": file,
                    "timestamp": content.get("timestamp"),
                    "test_count": content.get("test_count")
                })
        return {
            "count": len(results),
            "tests": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Listeleme hatası: {str(e)}")

@app.get("/test-result/{filename}")
def get_test_result(filename: str):
    path = os.path.join(TEST_RESULTS_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Dosya bulunamadı.")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
    

# 🎯 Örnek lokal test endpoint'leri
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


@app.post("/ai-analyze")
def ai_analyze_with_gemini(filename: str = Body(..., embed=True)):
    file_path = os.path.join(TEST_RESULTS_DIR, filename)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Dosya bulunamadı.")

    with open(file_path, "r", encoding="utf-8") as f:
        result = json.load(f)

    prompt = f"""
Aşağıda bir API'ye ait test sonuçları JSON formatında verilmiştir.

Senin görevin bu çıktıyı detaylıca analiz ederek geliştiriciye **yalnızca geçerli bir JSON formatında** aşağıdaki bilgileri sağlamaktır:

Lütfen yalnızca aşağıdaki JSON formatında ve Türkçe açıklamalarla dönüş yap:

{{
  "success_count": int,                       
  "failure_count": int,                       
  "failures": [                               
    {{
      "url": "string",                        
      "reason": "string"                      
    }}
  ],
  "performance_summary": "string",            
  "recommendations": "string"                 
}}

🧠 Açıklamalar için şunları dikkate al:
- **Başarısız endpoint'leri detaylı açıkla** (404, 500, doğrulama hatası, eksik parametre vs. gibi olası nedenleri belirt).
- **Yanıt sürelerini yorumla**: Yüksekse "bu endpoint'in yanıt süresi yüksek olabilir, önbellekleme (caching), sorgu optimizasyonu veya veri miktarı azaltımı düşünülebilir" gibi öneriler ver.
- **Başarılı endpoint'ler hakkında da kısa bir değerlendirme yap** (örneğin: tümü istikrarlı çalışıyor mu?).
- Gerekiyorsa **örnek performans iyileştirme yolları** öner (ör: sorgu filtreleme, pagination, arka planda işleme alma).
- Teknik terimleri geliştirici seviyesine uygun sade ve anlaşılır bir dille kullan.

🛑 Kurallar:
- JSON dışında hiçbir açıklama, markdown veya cümle yazma
- Formatı bozma
- Markdown kullanma (örneğin: ```json gibi)

Test sonucu şu şekildedir:

{json.dumps(result, indent=2)}
"""


    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash-exp")  # daha stabil

        response = model.generate_content(prompt)
        response_text = response.text.strip()


        # Markdown içeriğini temizle: ```json ... ```
        cleaned = re.sub(r"^```json\s*|\s*```$", "", response_text).strip()

        try:
            ai_json = json.loads(cleaned)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Yapay zeka çıktısı geçerli bir JSON değil.")

        return JSONResponse(content={"analysis": ai_json})

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Gemini AI ile analiz başarısız oldu.")
