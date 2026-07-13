import os
import pypdf
import docx

def parse_file(file_path: str, filename: str) -> str:
    """
    Parses a given file and returns extracted text.
    Supported extensions: .pdf, .docx, .txt, .md
    """
    ext = os.path.splitext(filename)[1].lower()
    text = ""
    
    try:
        if ext == '.pdf':
            with open(file_path, 'rb') as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        elif ext == '.docx':
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif ext == '.txt' or ext == '.md':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
            
    except Exception as e:
        raise ValueError(f"Error parsing file: {e}")
        
    return text.strip()
