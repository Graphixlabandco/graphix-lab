import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Intelligent local fallback replies when Gemini API is not configured
      const msgLower = message.toLowerCase();
      let reply = "Hello! I am Riya, your Graphix Lab Assistant. How can I assist you with your design, logo branding, UI/UX, or coding needs today?";
      
      if (msgLower.includes("logo") || msgLower.includes("brand")) {
        reply = "We offer premium Logo & Brand Identity services! This includes custom vector logo designs, typography sheets, and complete corporate identity style guides. You can book a session via the 'Book Design' tab above.";
      } else if (msgLower.includes("ui") || msgLower.includes("ux") || msgLower.includes("design")) {
        reply = "Our UI/UX & Digital Product Design service creates high-fidelity, interactive prototypes and design systems for web and mobile apps. Let's design something stunning!";
      } else if (msgLower.includes("3d") || msgLower.includes("illustration")) {
        reply = "We craft low-poly and high-fidelity 3D illustrations, scene models, textures, and holographic visual concepts.";
      } else if (msgLower.includes("animation") || msgLower.includes("video")) {
        reply = "We produce cinema-quality logo animations, promo video cuts, sound design, and custom particle VFX.";
      } else if (msgLower.includes("vibe") || msgLower.includes("code") || msgLower.includes("coding")) {
        reply = "Our Next-Gen Vibe Coding service uses agentic AI orchestration to compile functional prototypes and complete software solutions at lighting speed.";
      } else if (msgLower.includes("book") || msgLower.includes("session")) {
        reply = "To book a design session, navigate to the 'Book Design' tab, select your service, specify a target date, write your specs, upload reference files, and sign in to submit.";
      } else if (msgLower.includes("custom") || msgLower.includes("idea")) {
        reply = "Have a unique idea? Select 'Services' -> 'Customised Service' tab and fill out the 'ADD YOUR OWN IDEA' card where you can describe your specs and attach files.";
      }
      
      return NextResponse.json({ reply });
    }

    const systemPrompt = `You are Riya, the 24/7 official AI Assistant for Graphix Lab. Graphix Lab is an elite generative design and brand studio.
Our main services are:
1. Logo & Brand Identity (Elite vector marks, typography rules, branding guidebooks)
2. UI/UX & Digital Product Design (Mobile/web blueprints, high-fidelity components, prototypes)
3. 3D Illustrations (Stylized scene modeling, texturing, holographic concepts)
4. Animations & Video Editing (Logo reveals, particle simulations, VFX, post-production cinematic cuts)
5. Vibe Coding (AI-assisted rapid flow-state coding, high-speed software prototypes)
6. Customised Service (Bespoke visual & code challenges tailored to client idea briefs)

How to use the platform:
- Book a design session via the 'Book Design' tab at the top.
- Clients can upload specs and reference media files during booking.
- Submit custom ideas under 'Services' -> 'Customised Service' tab using the 'ADD YOUR OWN IDEA' card, where reference files can also be attached.
- Track all bookings, requests, and timeline statuses inside the 'Client Hub' (requires Login/Signup).
- Leave testimonials/reviews at the bottom of the page.

Be professional, polite, helpful, and concise. Always answer questions accurately. If a user asks about general topics, you can answer them too.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...history.slice(-10).map((msg: any) => ({
        role: msg.sender === 'client' ? 'user' : 'model',
        parts: [{ text: msg.message_text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I encountered an issue processing your request. How else can I help you?";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
