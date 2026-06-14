import os
import uuid
import pandas as pd
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas

class CertificateGenerator:
    def __init__(self, excel_path: str, output_dir: str = "generated_certificates"):
        """
        Initializes the certificate automation processor.
        """
        self.excel_path = excel_path
        self.output_dir = output_dir
        
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def process_bulk_data(self) -> pd.DataFrame:
        """
        Parses the incoming Excel sheet containing participant metadata.
        """
        if not os.path.exists(self.excel_path):
            raise FileNotFoundError(f"Source data file not found at: {self.excel_path}")
            
        df = pd.read_excel(self.excel_path)
        df.columns = df.columns.str.strip().str.lower()
        
        required_columns = {'name', 'email', 'role'}
        if not required_columns.issubset(df.columns):
            raise ValueError(f"Excel matrix must contain these columns: {required_columns}")
            
        return df

    def generate_pdf_certificate(self, name: str, role: str, cert_id: str) -> str:
        """
        Generates an independent, personalized certificate layout via ReportLab.
        """
        file_name = f"Cert_{name.replace(' ', '_')}_{cert_id[:8]}.pdf"
        file_path = os.path.join(self.output_dir, file_name)
        
        c = canvas.Canvas(file_path, pagesize=landscape(letter))
        width, height = landscape(letter)
        
        # Design Border Matrix
        c.setLineWidth(4)
        c.setStrokeColorRGB(0.12, 0.53, 0.90)  # Vura Branding Accent Blue
        c.rect(20, 20, width - 40, height - 40)
        
        c.setLineWidth(1)
        c.setStrokeColorRGB(0.7, 0.7, 0.7)
        c.rect(26, 26, width - 52, height - 52)
        
        # Typography & Data Injection
        c.setFont("Helvetica-Bold", 36)
        c.setFillColorRGB(0.1, 0.1, 0.2)
        c.drawCentredString(width / 2.0, height - 120, "CERTIFICATE OF EXCELLENCE")
        
        c.setFont("Helvetica", 14)
        c.setFillColorRGB(0.4, 0.4, 0.4)
        c.drawCentredString(width / 2.0, height - 160, "PROUDLY PRESENTED TO")
        
        c.setFont("Helvetica-Bold", 28)
        c.setFillColorRGB(0.12, 0.53, 0.90)
        c.drawCentredString(width / 2.0, height - 220, name.upper())
        
        c.setFont("Helvetica", 14)
        c.setFillColorRGB(0.3, 0.3, 0.3)
        narrative = f"for outstanding contributions and successfully completing the role of {role.title()}."
        c.drawCentredString(width / 2.0, height - 270, narrative)
        
        # Verification Layer Elements
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColorRGB(0.5, 0.5, 0.5)
        c.drawString(40, 50, f"Verification ID: {cert_id}")
        c.drawRightString(width - 40, 50, "Verify status securely online at: vurakit.in/verify")
        
        c.setStrokeColorRGB(0.5, 0.5, 0.5)
        c.rect(width - 90, 70, 50, 50)
        c.setFont("Helvetica", 6)
        c.drawCentredString(width - 65, 92, "[ QR CODE ]")
        
        c.showPage()
        c.save()
        return file_path

    def run_automation_pipeline(self) -> int:
        """
        Orchestrates full background runtime execution pipeline.
        """
        print(f"[VURA] Starting bulk parsing operation on: {self.excel_path}...")
        data_matrix = self.process_bulk_data()
        generated_count = 0
        
        for _, row in data_matrix.iterrows():
            unique_id = str(uuid.uuid4())
            self.generate_pdf_certificate(
                name=str(row['name']),
                role=str(row['role']),
                cert_id=unique_id
            )
            generated_count += 1
            
        print(f"[VURA] Process completed successfully. Total generated items: {generated_count}")
        return generated_count

if __name__ == "__main__":
    sample_file = "participants.xlsx"
    if not os.path.exists(sample_file):
        sample_data = {
            'Name': ['V Radha Krishna', 'Om Narkhede', 'Jane Doe'],
            'Email': ['radha@example.com', 'omn@example.com', 'jane@example.com'],
            'Role': ['Data Science Lead', 'Core Maintainer', 'Participant']
        }
        pd.DataFrame(sample_data).to_excel(sample_file, index=False)
        print(f"[TEST] Created local mock template spreadsheet metadata: '{sample_file}'")

    pipeline = CertificateGenerator(excel_path=sample_file)
    pipeline.run_automation_pipeline()
