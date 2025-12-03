import requests
import sys
import os

BASE_URL = "http://localhost:8000"
EMAIL = "test@example.com"
PASSWORD = "password123"

def create_user():
    print("Creating user...")
    try:
        response = requests.post(f"{BASE_URL}/users/", json={"email": EMAIL, "password": PASSWORD})
        if response.status_code == 200:
            print("User created.")
        elif response.status_code == 400 and "Email already registered" in response.text:
            print("User already exists.")
        else:
            print(f"Failed to create user: {response.status_code} {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

def login():
    print("Logging in...")
    response = requests.post(f"{BASE_URL}/token", data={"username": EMAIL, "password": PASSWORD})
    if response.status_code == 200:
        print("Login successful.")
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.status_code} {response.text}")
        sys.exit(1)

def upload_file(token, filename, content, mime_type):
    print(f"Uploading {filename}...")
    headers = {"Authorization": f"Bearer {token}"}
    files = {"file": (filename, content, mime_type)}
    # The backend expects 'title' as a query parameter based on Upload.jsx: 
    # api.post(`/upload/chapter?title=${encodeURIComponent(title)}`, formData, ...)
    # But let's check upload.py again.
    # @router.post("/upload/chapter")
    # async def upload_chapter(title: str, ...)
    # FastAPI usually expects query params if not specified as Form/Body.
    
    response = requests.post(f"{BASE_URL}/upload/chapter", headers=headers, files=files, params={"title": "Test Chapter"})
    
    if response.status_code == 200:
        print(f"Upload successful: {response.json()}")
    else:
        print(f"Upload failed: {response.status_code} {response.text}")

if __name__ == "__main__":
    create_user()
    token = login()
    
    # Test Text File
    upload_file(token, "test.txt", b"This is a test content.", "text/plain")
    
    # Test PDF File (Minimal valid PDF)
    # This is a very simple PDF content
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n70 700 Td\n/F1 24 Tf\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000220 00000 n\n0000000306 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n400\n%%EOF"
    
    upload_file(token, "test.pdf", pdf_content, "application/pdf")

    # Test Generation
    # We need a chapter ID. Let's use the one from the last upload.
    # We need to modify upload_file to return the ID.

