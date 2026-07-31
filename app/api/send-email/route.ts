import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { parseNotes } from '@/lib/attachments';

export async function POST(request: Request) {
  try {
    const { clientName, clientEmail, serviceType, bookingDate, notes, id } = await request.json();

    const { briefText, attachments } = parseNotes(notes);

    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailPassword) {
      console.warn("GMAIL_APP_PASSWORD environment variable is not set. Skipping email sending.");
      return NextResponse.json({ success: false, message: "Gmail password not configured" }, { status: 500 });
    }

    const adminEmail = "graphixlab07@gmail.com";
    const senderEmail = "graphixlab07@gmail.com";

    // Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: gmailPassword
      }
    });

    // 1. Client Confirmation HTML Content
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #0d0b18; color: #ffffff;">
        <h2 style="color: #a855f7; border-bottom: 2px solid #a855f7; padding-bottom: 10px; text-transform: uppercase;">Booking Confirmed!</h2>
        <p>Dear <strong>${clientName}</strong>,</p>
        <p>Thank you for booking a design session with <strong>Graphix Lab</strong>. We have received your order details and our design team is ready to engineer your brand visuals.</p>
        
        <div style="background-color: #131026; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #8b5cf6;">
          <h3 style="margin-top: 0; color: #a855f7;">Session Details:</h3>
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${id || 'Pending'}</p>
          <p style="margin: 5px 0;"><strong>Service Chosen:</strong> ${serviceType}</p>
          <p style="margin: 5px 0;"><strong>Target Date:</strong> ${bookingDate}</p>
          ${briefText ? `<p style="margin: 5px 0;"><strong>Design Brief Notes:</strong> ${briefText}</p>` : ''}
          ${attachments.length > 0 ? `
            <p style="margin: 10px 0 5px 0;"><strong>Attached Reference Media:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #a855f7; font-size: 13px;">
              ${attachments.map(file => `<li>${file.name} (${file.size})</li>`).join('')}
            </ul>
          ` : ''}
        </div>
        
        <p>You can track the progress of your project inside your <a href="https://graphix-lab.vercel.app/#portal" style="color: #a855f7; text-decoration: underline;">Client Hub</a>.</p>
        <p>If you have any questions, feel free to reply directly to this email.</p>
        <br/>
        <p>Best Regards,<br/><strong>The Graphix Lab Team</strong></p>
      </div>
    `;

    // 2. Admin Notification HTML Content
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #0d0b18; color: #ffffff;">
        <h2 style="color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; text-transform: uppercase;">New Order Request Alert!</h2>
        <p>Hello Admin,</p>
        <p>A new design session has been successfully booked by a client on the Graphix Lab portal.</p>
        
        <div style="background-color: #131026; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #a855f7;">
          <h3 style="margin-top: 0; color: #8b5cf6;">Client Info:</h3>
          <p style="margin: 5px 0;"><strong>Client Name:</strong> ${clientName}</p>
          <p style="margin: 5px 0;"><strong>Client Email:</strong> ${clientEmail}</p>
          <h3 style="margin-top: 15px; color: #8b5cf6;">Order Details:</h3>
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${id || 'Pending'}</p>
          <p style="margin: 5px 0;"><strong>Service Type:</strong> ${serviceType}</p>
          <p style="margin: 5px 0;"><strong>Target Date:</strong> ${bookingDate}</p>
          ${briefText ? `<p style="margin: 5px 0;"><strong>Brief Description:</strong> ${briefText}</p>` : ''}
          ${attachments.length > 0 ? `
            <p style="margin: 10px 0 5px 0;"><strong>Attached Reference Media:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #8b5cf6; font-size: 13px;">
              ${attachments.map(file => `<li>${file.name} (${file.size})</li>`).join('')}
            </ul>
          ` : ''}
        </div>
        
        <p>Please log in to the <a href="https://graphix-lab.vercel.app/#portal" style="color: #8b5cf6; text-decoration: underline;">Founder Board</a> to approve the timeline or manage the request.</p>
      </div>
    `;

    // Format email attachments for Nodemailer
    const emailAttachments = attachments.map(file => {
      const base64Data = file.base64.split(',')[1] || file.base64;
      return {
        filename: file.name,
        content: base64Data,
        encoding: 'base64'
      };
    });

    // Send email to client
    await transporter.sendMail({
      from: `"Graphix Lab" <${senderEmail}>`,
      to: clientEmail,
      subject: `Graphix Lab | Design Session Booked!`,
      html: clientHtml,
      attachments: emailAttachments
    });
    console.log("Client confirmation email sent successfully.");

    // Send email to admin
    await transporter.sendMail({
      from: `"Graphix Lab" <${senderEmail}>`,
      to: adminEmail,
      subject: `Graphix Lab | NEW ORDER REQUEST: ${serviceType}`,
      html: adminHtml,
      attachments: emailAttachments
    });
    console.log("Admin alert email sent successfully.");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email sending API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
