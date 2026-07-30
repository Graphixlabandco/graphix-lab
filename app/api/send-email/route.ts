import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { clientName, clientEmail, serviceType, bookingDate, notes, id } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY environment variable is not set. Skipping email sending.");
      return NextResponse.json({ success: false, message: "API Key not configured" }, { status: 500 });
    }

    const adminEmail = "rvprasad24d@gmail.com";

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
          ${notes ? `<p style="margin: 5px 0;"><strong>Design Brief Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <p>You can track the progress of your project inside your <a href="https://graphixlab-lab.vercel.app/#portal" style="color: #a855f7; text-decoration: underline;">Client Hub</a>.</p>
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
          ${notes ? `<p style="margin: 5px 0;"><strong>Brief Description:</strong> ${notes}</p>` : ''}
        </div>
        
        <p>Please log in to the <a href="https://graphixlab-lab.vercel.app/#portal" style="color: #8b5cf6; text-decoration: underline;">Founder Board</a> to approve the timeline or manage the request.</p>
      </div>
    `;

    // Send email to client
    const clientEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Graphix Lab <onboarding@resend.dev>', // Or verified custom domain
        to: clientEmail,
        subject: `Graphix Lab | Design Session Booked!`,
        html: clientHtml,
      }),
    });

    console.log("Client email status:", clientEmailRes.status);
    try {
      const clientBody = await clientEmailRes.text();
      console.log("Client email body:", clientBody);
    } catch (e) {
      console.error("Could not parse client email response body");
    }

    // Send email to admin
    const adminEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Graphix Lab <onboarding@resend.dev>', // Match exact same display name
        to: adminEmail,
        subject: `Graphix Lab | NEW ORDER REQUEST: ${serviceType}`,
        html: adminHtml,
      }),
    });

    console.log("Admin email status:", adminEmailRes.status);
    try {
      const adminBody = await adminEmailRes.text();
      console.log("Admin email body:", adminBody);
    } catch (e) {
      console.error("Could not parse admin email response body");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email sending API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
