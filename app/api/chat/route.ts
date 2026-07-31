import { NextResponse } from 'next/server';

// Force dynamic execution so environment variables are read at runtime on Vercel
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { message, history } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;

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

  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined on Vercel");
    }

    // Build alternating message history for Gemini API
    const contents: any[] = [];
    const chatHistory = history || [];

    chatHistory.forEach((msg: any) => {
      if (msg.sender === "riya" && contents.length === 0) {
        return; 
      }
      
      const role = msg.sender === "client" ? "user" : "model";
      
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += "\n" + msg.message_text;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.message_text }]
        });
      }
    });

    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts[0].text += "\n" + message;
    } else {
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
    }

    // Exhaustive list of stable Gemini endpoints & Flash models to try in sequence
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    ];

    let lastError = null;
    let responseData = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });
        
        if (response.ok) {
          responseData = await response.json();
          break; // Successfully connected and generated content!
        } else {
          const errText = await response.text();
          lastError = new Error(`Status ${response.status} from endpoint ${url}: ${errText}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!responseData) {
      throw lastError || new Error("Failed to connect to any Gemini API model endpoint");
    }

    const reply = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error("Empty text reply candidates from Gemini API");
    }

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Gemini call failed, executing smart offline responder:", error);
    
    // Advanced contextual offline fallback responder representing Riya
    const msgLower = message.toLowerCase();
    let reply = "I am Riya, your AI assistant at Graphix Lab. I can help you with branding, web design, UI/UX, animations, vibe coding, and client bookings!";

    if (msgLower.includes("password") || msgLower.includes("reset") || msgLower.includes("forgot")) {
      reply = "To reset your password: click 'My Hub' at the top right, select 'Forgot Password?' inside the sign-in form, enter your email to request a 6-digit OTP code, verify it, and enter your new password to restore secure access.";
    } else if (msgLower.includes("palette") || msgLower.includes("color") || msgLower.includes("theme")) {
      reply = "Our new design color palette uses Space Indigo (#1E2749) as the canvas background, Twilight Indigo (#273469) for cards and sections, Jet Black (#30343F) for inputs, Ghost White (#FAFAFF) for typography, and Periwinkle (#E4D9FF) for glows, buttons, and active states.";
    } else if (msgLower.includes("moon")) {
      reply = "The moon is generally a greyish-white color in the night sky. In our cosmic-themed animations and 3D illustrations, we style the moon and universe backdrops using sleek periwinkle glows, midnight violet, and pure black!";
    } else if (msgLower.includes("sign up") || msgLower.includes("signup") || msgLower.includes("register") || msgLower.includes("create account")) {
      reply = "To register, click on the 'My Hub' button in the top right, choose 'Create Account', enter your email, password, and full name. Once done, you can access your dashboard to view your booking timeline!";
    } else if (msgLower.includes("login") || msgLower.includes("signin") || msgLower.includes("sign in") || msgLower.includes("my hub")) {
      reply = "Sign in by clicking 'My Hub' at the top right, entering your email and password, and clicking 'Sign In'. You can then view your custom idea requests and timeline updates.";
    } else if (msgLower.includes("contact") || msgLower.includes("admin") || msgLower.includes("email") || msgLower.includes("reach out")) {
      reply = "You can contact our studio administration directly at graphixlab07@gmail.com. We also receive automatic alerts whenever you submit a new booking request or custom service idea.";
    } else if (msgLower.includes("logo") || msgLower.includes("brand")) {
      reply = "We offer premium Logo & Brand Identity services, including custom vector logo marks, typography rules, and corporate identity guidelines. You can book a session via the 'Book Design' tab above.";
    } else if (msgLower.includes("ui") || msgLower.includes("ux") || msgLower.includes("design")) {
      reply = "Our UI/UX service creates high-fidelity interactive wireframes, custom digital product blueprints, and complete component design systems for web and mobile apps.";
    } else if (msgLower.includes("3d") || msgLower.includes("illustration")) {
      reply = "We build custom 3D scene illustrations, stylized low-poly/high-fidelity modeling, texturing, and holographic designs.";
    } else if (msgLower.includes("animation") || msgLower.includes("video")) {
      reply = "We produce custom cinema-quality logo reveals, promo cuts, post-production edits, and dynamic particle VFX.";
    } else if (msgLower.includes("vibe") || msgLower.includes("code") || msgLower.includes("coding")) {
      reply = "Vibe Coding is our AI-assisted rapid prototyping flow. We build fully functional software applications, client portals, and widgets at lighting speeds using modern agentic systems.";
    } else if (msgLower.includes("book") || msgLower.includes("session")) {
      reply = "To book a design session, navigate to the 'Book Design' tab, select your design service, choose a target delivery date, fill out your specifications, attach reference files, and sign in to submit.";
    } else if (msgLower.includes("custom") || msgLower.includes("idea")) {
      reply = "Submit your own unique ideas under 'Services' -> 'Customised Service' and fill out the 'ADD YOUR OWN IDEA' card where you can describe your specs and attach files.";
    } else if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
      reply = "Hello! I am Riya, your AI Assistant. I can help you with bookings, customized design projects, and inquiries. Ask me anything about our services!";
    } else if (msgLower.includes("name") || msgLower.includes("who are you")) {
      reply = "I am Riya, your 24/7 AI Assistant at Graphix Lab.";
    } else if (msgLower.includes("pricing") || msgLower.includes("cost") || msgLower.includes("price")) {
      reply = "Project pricing is tailored to your requirements. You can specify your target budget when booking a design session or submitting a custom idea request.";
    }
    
    // Return the clean reply without any diagnostics suffix for the user
    return NextResponse.json({ reply });
  }
}
