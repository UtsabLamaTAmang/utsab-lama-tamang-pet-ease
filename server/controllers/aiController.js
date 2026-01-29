import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MASTER_PROMPT = `
You are PetEase AI, a specialized veterinary and pet care assistant.
Your Role: Provide accurate, helpful, and empathetic advice about pet health, behavior, nutrition, and care.
Constraints:
1. ONLY answer questions related to pets, animals, and veterinary care.
2. If a user asks about non-pet topics (e.g., coding, politics, math), politely refuse and steer the conversation back to pets.
3. For medical queries, always include a disclaimer that you are an AI and they should consult a real vet for emergencies.
4. Keep responses concise and easy to read. Use bullet points where appropriate.
`;

export const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "AI configuration missing (API Key)"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Construct chat history with system instruction (simulated via first message)
        const chatSession = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: MASTER_PROMPT }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am PetEase AI, ready to assist with pet-related queries." }],
                },
                ...(history || []).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            ],
        });

        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();

        res.json({
            success: true,
            data: responseText
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get AI response",
            error: error.message
        });
    }
};
