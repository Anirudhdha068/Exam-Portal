const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function generateCertificatePDF(certData) {
  try {
    // Read HTML template
    const templatePath = path.join(__dirname, 'certificateTemplate.html');
    let html = await fs.readFile(templatePath, 'utf8');

    // Replace placeholders with actual data
    html = html.replace(/{{studentName}}/g, certData.studentName || 'Student Name');
    html = html.replace(/{{examTitle}}/g, certData.examTitle || 'Exam Title');
    html = html.replace(/{{issueDate}}/g, certData.issueDate || new Date().toLocaleDateString());
    html = html.replace(/{{score}}/g, certData.score != null ? Math.round(certData.score) : '0');
    html = html.replace(/{{totalMarks}}/g, certData.totalMarks || '100');
    html = html.replace(/{{certId}}/g, certData.certId || '000000');

    // Launch puppeteer
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate certificate PDF');
  }
}

module.exports = generateCertificatePDF;

