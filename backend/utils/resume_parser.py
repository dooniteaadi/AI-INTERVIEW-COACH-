import pypdf
import io

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text content from a PDF file
    """
    try:
        pdf_file = io.BytesIO(file_content)
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        raise Exception("Failed to parse PDF file")
