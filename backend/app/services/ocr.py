import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import io
from pypdf import PdfReader
import shutil

# Check if tesseract is available
TESSERACT_AVAILABLE = shutil.which("tesseract") is not None

def extract_text_from_image(image_bytes: bytes) -> str:
    if not TESSERACT_AVAILABLE:
        return "[Error: Tesseract OCR is not installed on the server. Cannot extract text from images.]"
    
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(image)
    except Exception as e:
        return f"[Error extracting text from image: {str(e)}]"

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    
    # Method 1: Try pypdf (no external dependencies, works for digital PDFs)
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    except Exception as e:
        print(f"pypdf extraction failed: {e}")

    # If pypdf found text, return it
    if text.strip():
        return text

    # Method 2: Fallback to OCR (works for scanned PDFs, requires Tesseract & Poppler)
    if not TESSERACT_AVAILABLE:
        return "[Error: This appears to be a scanned PDF. Tesseract OCR is not installed to handle it.]"
        
    try:
        images = convert_from_bytes(pdf_bytes)
        ocr_text = ""
        for image in images:
            ocr_text += pytesseract.image_to_string(image) + "\n"
        return ocr_text
    except Exception as e:
        return f"[Error extracting text from PDF (OCR): {str(e)}. Ensure Poppler is installed.]"

def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return extract_text_from_image(file_bytes)
    elif filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_bytes)
    else:
        # Assume text file
        try:
            return file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            return file_bytes.decode('latin-1')
