from pathlib import Path

from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas


RAW_DATA_DIR = Path("datasets/raw")


def create_loan_application_pdf() -> None:
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

    file_path = RAW_DATA_DIR / "loan_application_001.pdf"

    pdf = canvas.Canvas(str(file_path), pagesize=LETTER)
    width, height = LETTER

    y = height - 60

    lines = [
        "FinAgent AI - Sample Loan Application",
        "",
        "Application ID: LOAN-2026-001",
        "Customer Name: Daniel Matthews",
        "Date of Birth: 1989-04-12",
        "Address: 2458 Oak Ridge Drive, Dallas, TX 75201",
        "Employer: Northstar Logistics LLC",
        "Employment Status: Full-Time",
        "Annual Income: $118,000",
        "Requested Loan Amount: $350,000",
        "Loan Type: Home Mortgage",
        "Credit Score: 724",
        "Monthly Debt Payments: $1,850",
        "Down Payment: $70,000",
        "",
        "Applicant Notes:",
        "Customer is applying for a 30-year fixed mortgage.",
        "Employment history shows 5 years with current employer.",
        "Customer provided pay stubs and bank statements.",
        "",
        "Missing Items:",
        "Home insurance quote is not yet provided.",
        "Final property appraisal is pending.",
    ]

    pdf.setFont("Helvetica", 11)

    for line in lines:
        pdf.drawString(60, y, line)
        y -= 18

    pdf.save()

    print(f"Created: {file_path}")


if __name__ == "__main__":
    create_loan_application_pdf()