const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `Exam Portal Admin <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">🎉 Exam Certificate</h2>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white; margin: 20px 0;">
            <h1 style="margin: 0; font-size: 28px;">Certificate of Completion</h1>
            <p style="font-size: 18px; opacity: 0.9;">This certifies that</p>
            <h2 style="font-size: 24px; margin: 20px 0;">${options.studentName || 'Student'}</h2>
            <p style="font-size: 18px; font-weight: bold;">${options.examTitle || 'Exam'}</p>
            <p style="font-size: 16px; margin-top: 20px;">Score: <strong>${options.score || 0}/${options.totalMarks || 100}</strong></p>
            <p style="font-size: 14px; margin-top: 30px; opacity: 0.8;">Issued: ${options.issueDate || new Date().toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <p>Certificate available in your dashboard.</p>
            <p style="color: #666; font-size: 14px;"><strong>Exam Portal Team</strong></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
