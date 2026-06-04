import os
import uuid
import pandas as pd
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
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
        # Sanitize name to prevent path traversal
        clean_name = "".join(c for c in name if c.isalnum() or c in (' ', '_', '-')).strip()
        if not clean_name:
            clean_name = "Recipient"
        file_name = f"Cert_{clean_name.replace(' ', '_')}_{cert_id[:8]}.pdf"
        
        # Ensure the file path remains inside output_dir
        file_path = os.path.abspath(os.path.join(self.output_dir, file_name))
        if not file_path.startswith(os.path.abspath(self.output_dir)):
            raise ValueError("Invalid output path detected due to path traversal attempt.")
        
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
        c.drawRightString(width - 40, 50, "Verify status securely online at: vura.vercel.app/verify")
        
        c.setStrokeColorRGB(0.5, 0.5, 0.5)
        c.rect(width - 90, 70, 50, 50)
        c.setFont("Helvetica", 6)
        c.drawCentredString(width - 65, 92, "[ QR CODE ]")
        
        c.showPage()
        c.save()
        return file_path

    def send_email(self, recipient_email: str, recipient_name: str, cert_id: str, pdf_path: str) -> bool:
        """
        Sends the certificate PDF via SMTP to the recipient.
        """
        smtp_host = os.environ.get("SMTP_HOST")
        smtp_port = os.environ.get("SMTP_PORT")
        smtp_user = os.environ.get("SMTP_USER")
        smtp_pass = os.environ.get("SMTP_PASS")
        smtp_from = os.environ.get("SMTP_FROM", '"Vura" <noreply@vura.com>')

        if not smtp_host or not smtp_user or not smtp_pass or not recipient_email:
            print(f"[VURA] Skip email sending for {recipient_email}: SMTP credentials or recipient email missing.")
            return False

        try:
            port = int(smtp_port) if smtp_port else 587
        except ValueError:
            port = 587

        msg = MIMEMultipart()
        msg['From'] = smtp_from
        msg['To'] = recipient_email
        msg['Subject'] = f"Your certificate for {cert_id} is ready"

        # Email body
        body = f"""Hello {recipient_name},

Your certificate has been generated.
Verification ID: {cert_id}
Verify status securely online at: vura.vercel.app/verify

Please find your certificate attached.
"""
        msg.attach(MIMEText(body, 'plain'))

        # Attach PDF
        try:
            with open(pdf_path, 'rb') as f:
                attachment = MIMEApplication(f.read(), _subtype="pdf")
                attachment.add_header('Content-Disposition', 'attachment', filename=os.path.basename(pdf_path))
                msg.attach(attachment)
        except Exception as e:
            print(f"[VURA] Failed to attach PDF to email for {recipient_email}: {e}")
            return False

        try:
            # Determine secure connection based on port
            if port == 465:
                server = smtplib.SMTP_SSL(smtp_host, port, timeout=10)
            else:
                server = smtplib.SMTP(smtp_host, port, timeout=10)
                server.starttls()
            
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_from, recipient_email, msg.as_string())
            server.quit()
            print(f"[VURA] Certificate email successfully sent to {recipient_email}")
            return True
        except Exception as e:
            print(f"[VURA] Error sending email to {recipient_email}: {e}")
            return False

    def run_automation_pipeline(self) -> int:
        """
        Orchestrates full background runtime execution pipeline.
        """
        print(f"[VURA] Starting bulk parsing operation on: {self.excel_path}...")
        data_matrix = self.process_bulk_data()
        generated_count = 0
        
        for _, row in data_matrix.iterrows():
            unique_id = str(uuid.uuid4())
            file_path = self.generate_pdf_certificate(
                name=str(row['name']),
                role=str(row['role']),
                cert_id=unique_id
            )
            # Send certificate email if email is present
            email_val = row.get('email')
            if pd.notna(email_val) and str(email_val).strip():
                self.send_email(
                    recipient_email=str(email_val).strip(),
                    recipient_name=str(row['name']),
                    cert_id=unique_id,
                    pdf_path=file_path
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
