import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard fallback, user can change if using Resend SMTP
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendDonationReceipt = async (donation: any) => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto p-8 border border-gray-200 rounded-lg shadow-sm">
        <h1 style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">
          Thank You for Your Donation!
        </h1>
        
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Dear ${donation.donorName},
        </p>
        
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          We have successfully received your generous contribution. Your support directly empowers our initiatives at the Mangal Guruji Foundation.
        </p>
        
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
          <h2 style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin-bottom: 16px; margin-top: 0;">
            Donation Receipt
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Amount</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">
                  ₹${donation.amount}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Transaction ID</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                  ${donation.razorpayPaymentId}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Date</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                  ${new Date(donation.createdAt).toLocaleDateString()}
                </td>
              </tr>
              ${donation.pan ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">PAN</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                  ${donation.pan.toUpperCase()}
                </td>
              </tr>` : ''}
            </tbody>
          </table>
        </div>
        
        <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 0;">
          With gratitude,<br/>
          <strong>Mangal Guruji Foundation</strong>
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Mangal Guruji Foundation" <${process.env.SMTP_USER}>`,
      to: donation.email,
      subject: "Receipt for your Donation - Mangal Guruji Foundation",
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return false;
  }
};
