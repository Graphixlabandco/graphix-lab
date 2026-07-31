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

    // 1. Query Google's Model list to find the available model for this API key
    let modelName = "";
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listRes = await fetch(listUrl);
      if (listRes.ok) {
        const listData = await listRes.json();
        const availableModels = listData.models || [];
        
        // PRIORITIZE stable, free-tier Flash models over rate-limited Pro models
        let targetModel = availableModels.find((m: any) => 
          m.name === "models/gemini-1.5-flash-latest" && 
          m.supportedGenerationMethods?.includes("generateContent")
        );
        
        if (!targetModel) {
          targetModel = availableModels.find((m: any) => 
            m.name === "models/gemini-1.5-flash" && 
            m.supportedGenerationMethods?.includes("generateContent")
          );
        }
        
        if (!targetModel) {
          targetModel = availableModels.find((m: any) => 
            m.name && 
            m.name.includes("flash") && 
            m.supportedGenerationMethods?.includes("generateContent")
          );
        }

        if (!targetModel) {
          targetModel = availableModels.find((m: any) => 
            m.name && 
            m.name.includes("gemini") && 
            m.supportedGenerationMethods?.includes("generateContent")
          );
        }
        
        if (targetModel) {
          modelName = targetModel.name;
          console.log(`Auto-selected active model for API key: ${modelName}`);
        }
      }
    } catch (err) {
      console.warn("Could not fetch model list, attempting fallback model names.", err);
    }

    // Default fallback model
    if (!modelName) {
      modelName = "models/gemini-1.5-flash-latest";
    }

    // 2. Call the discovered model endpoint
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      
      // Secondary fallback to gemini-1.5-flash-latest if the discovered model (like pro) fails
      if (modelName !== "models/gemini-1.5-flash-latest") {
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });
        
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const reply = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      }
      
      throw new Error(`Gemini API returned status ${response.status} for ${modelName}: ${errText}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error(`Empty text reply candidates from Gemini API using ${modelName}`);
    }

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Gemini call failed, executing fallback responder:", error);
    
    // Highly comprehensive fallback responder representing Riya
    const msgLower = message.toLowerCase();
    let reply = "I am here to assist you with any questions! As Riya, the Graphix Lab assistant, I can guide you through our services (branding, UI/UX, 3D animations, vibe coding), explain how to sign up, how to reset passwords, or how to submit custom requests.";

    if (msgLower.includes("password") || msgLower.includes("reset") || msgLower.includes("forgot")) {
      reply = "If you forgot your password or need to reset it: click 'My Hub' at the top right, click 'Forgot Password?' inside the sign-in form, enter your registered email to request a 6-digit OTP code, verify the code, and then enter your new password. This will securely update your access!";
    } else if (msgLower.includes("sign up") || msgLower.includes("signup") || msgLower.includes("register") || msgLower.includes("create account")) {
      reply = "To sign up, click on the 'My Hub' button in the top right corner of the navigation bar, choose 'Create Account', enter your email, password, and full name, and submit. You can then access your personal dashboard!";
    } else if (msgLower.includes("login") || msgLower.includes("signin") || msgLower.includes("sign in") || msgLower.includes("my hub")) {
      reply = "You can sign in by clicking 'My Hub' at the top right, entering your email and password, and clicking 'Sign In'. If you forgot your password, there is an OTP password recovery option available right inside the form.";
    } else if (msgLower.includes("contact") || msgLower.includes("admin") || msgLower.includes("email") || msgLower.includes("reach out")) {
      reply = "You can contact our administration directly at graphixlab07@gmail.com. When you book a session or submit a custom idea request, an automated email notification with your details is instantly dispatched to us.";
    } else if (msgLower.includes("logo") || msgLower.includes("brand")) {
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
    } else if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
      reply = "Hello! I am Riya, your AI Assistant. I can help you with bookings, customized design projects, and inquiries. Ask me anything about our services!";
    } else if (msgLower.includes("name") || msgLower.includes("who are you")) {
      reply = "I am Riya, your 24/7 AI Assistant at Graphix Lab.";
    } else if (msgLower.includes("pricing") || msgLower.includes("cost") || msgLower.includes("price")) {
      reply = "Our project pricing depends on your requirements. You can customize your project budget when submitting a booking request or customized service idea!";
    }
    
    // Clean reply with absolutely NO diagnostic logs printed to clients (completely clean response)
    return NextResponse.json({ reply });
  }
}
