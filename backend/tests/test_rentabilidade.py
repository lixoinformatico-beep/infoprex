"""Backend tests for Pharma Rentabilidade API (cardex + analysis flows)."""
import os
import urllib.request
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://drug-margin-calc.preview.emergentagent.com').rstrip('/')

XLS_URL = "https://customer-assets.emergentagent.com/job_0d2492da-5b71-4d0b-a51b-d9e5cdc8be5b/artifacts/swobp28z_Cardex%20Total%20MG_23_06_2026.xlsx"
TXT_URL = "https://customer-assets.emergentagent.com/job_0d2492da-5b71-4d0b-a51b-d9e5cdc8be5b/artifacts/uyeal7sk_INFOPREX202606020806.TXT"

XLS_PATH = "/tmp/test_files/cardex.xlsx"
TXT_PATH = "/tmp/test_files/vendas.txt"


@pytest.fixture(scope="module", autouse=True)
def ensure_files():
    os.makedirs("/tmp/test_files", exist_ok=True)
    if not os.path.exists(XLS_PATH):
        urllib.request.urlretrieve(XLS_URL, XLS_PATH)
    if not os.path.exists(TXT_PATH):
        urllib.request.urlretrieve(TXT_URL, TXT_PATH)


# -------------------- Health / Root --------------------
def test_api_root():
    r = requests.get(f"{BASE_URL}/api/", timeout=15)
    assert r.status_code == 200
    assert "Pharma" in r.json().get("message", "")


# -------------------- Cardex upload --------------------
def test_cardex_upload_xls():
    with open(XLS_PATH, "rb") as f:
        files = {"file": ("cardex.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        r = requests.post(f"{BASE_URL}/api/cardex/upload", files=files, timeout=120)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["filename"] == "cardex.xlsx"
    assert data["count"] >= 5000 and data["count"] <= 5200, f"Unexpected count: {data['count']}"
    assert isinstance(data["labs"], list)
    assert len(data["labs"]) == 17, f"Expected 17 labs, got {len(data['labs'])}"


def test_cardex_get_after_upload():
    r = requests.get(f"{BASE_URL}/api/cardex", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["exists"] is True
    assert "filename" in data
    assert data["count"] >= 5000
    assert len(data["labs"]) == 17
    assert isinstance(data["sample"], list)
    assert len(data["sample"]) > 0
    # validate sample fields
    s0 = data["sample"][0]
    for key in ("cnp", "descricao", "pvp", "pcu", "iva", "laboratorio"):
        assert key in s0


def test_cardex_upload_rejects_non_xlsx():
    files = {"file": ("foo.txt", b"not an excel", "text/plain")}
    r = requests.post(f"{BASE_URL}/api/cardex/upload", files=files, timeout=15)
    assert r.status_code == 400
    assert "Excel" in r.json().get("detail", "")


# -------------------- Analysis upload --------------------
def test_analysis_upload_requires_txt():
    files = {"file": ("foo.csv", b"abc", "text/plain")}
    r = requests.post(f"{BASE_URL}/api/analysis/upload", files=files, timeout=15)
    assert r.status_code == 400
    detail = r.json().get("detail", "")
    assert ".txt" in detail.lower() or "vendas" in detail.lower()


def test_analysis_upload_txt_success():
    # depends on test_cardex_upload_xls already populating cardex
    with open(TXT_PATH, "rb") as f:
        files = {"file": ("INFOPREX.TXT", f, "text/plain")}
        r = requests.post(f"{BASE_URL}/api/analysis/upload", files=files, timeout=180)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "summary" in data and "labs" in data and "products" in data
    s = data["summary"]
    for k in ("total_rent_txt", "total_rent_xls", "total_diff", "n_products", "n_labs", "total_qty"):
        assert k in s
    assert 800 <= s["n_products"] <= 1100, f"Unexpected n_products={s['n_products']}"
    assert s["n_labs"] == 17, f"Expected 17 labs in analysis, got {s['n_labs']}"
    assert isinstance(data["labs"], list) and len(data["labs"]) == s["n_labs"]
    assert isinstance(data["products"], list) and len(data["products"]) == s["n_products"]
    # product fields
    p0 = data["products"][0]
    for key in ("cpr", "nome", "laboratorio", "qty", "pvp_txt", "pcu_txt",
                "rent_txt_total", "rent_xls_total", "diff_total"):
        assert key in p0
    # ensure analysis id was returned
    assert "id" in data and isinstance(data["id"], str)


def test_analysis_latest():
    r = requests.get(f"{BASE_URL}/api/analysis/latest", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("exists") is True
    assert "summary" in data
    assert "products" in data and "labs" in data
    # ensure mongo _id not leaked
    assert "_id" not in data


def test_analysis_list_and_get_by_id():
    r = requests.get(f"{BASE_URL}/api/analysis", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list) and len(items) > 0
    assert "id" in items[0]
    aid = items[0]["id"]
    r2 = requests.get(f"{BASE_URL}/api/analysis/{aid}", timeout=15)
    assert r2.status_code == 200
    assert r2.json()["id"] == aid


def test_analysis_get_not_found():
    r = requests.get(f"{BASE_URL}/api/analysis/non-existent-id", timeout=15)
    assert r.status_code == 404


# -------------------- Cardex required for analysis (400) --------------------
def test_analysis_requires_cardex():
    """Drop cardex via the driver, attempt analysis (expect 400), then restore cardex."""
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']

    async def remove_cardex():
        c = AsyncIOMotorClient(mongo_url)
        doc = await c[db_name].cardex.find_one({'_id': 'current'})
        await c[db_name].cardex.delete_one({'_id': 'current'})
        c.close()
        return doc

    async def restore_cardex(doc):
        if doc is None:
            return
        c = AsyncIOMotorClient(mongo_url)
        await c[db_name].cardex.replace_one({'_id': 'current'}, doc, upsert=True)
        c.close()

    saved = asyncio.get_event_loop().run_until_complete(remove_cardex())
    try:
        with open(TXT_PATH, "rb") as f:
            files = {"file": ("INFOPREX.TXT", f, "text/plain")}
            r = requests.post(f"{BASE_URL}/api/analysis/upload", files=files, timeout=30)
        assert r.status_code == 400
        detail = r.json().get("detail", "")
        assert "Cardex" in detail or "cardex" in detail
        assert "Definições" in detail or "Definicoes" in detail or "antes" in detail
    finally:
        asyncio.get_event_loop().run_until_complete(restore_cardex(saved))
