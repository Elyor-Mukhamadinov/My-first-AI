/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This is a Netlify Function running in a standard Node.js environment.
// It acts as a secure proxy between our front-end and the Google Gemini API.

import { GoogleGenAI, type GenerateContentResponse, Modality } from "@google/genai";

// Helper function to extract mime type and base64 data from a Data URL
const parseDataUrl = (dataUrl: string) => {
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
        throw new Error("Yaroqsiz rasm ma'lumotlari formati.");
    }
    return { mimeType: match[1], data: match[2] };
};

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        throw new Error(`So'rov bloklandi: ${response.promptFeedback.blockReason}`);
    }

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (imagePart?.inlineData) {
        const { mimeType, data } = imagePart.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Rasm yaratish to‘xtadi. Sabab: ${finishReason}.`);
    }

    throw new Error(`AI modeli rasm qaytarmadi. So'rovingizni boshqacha ifodalab ko'ring.`);
};

// Standard Netlify Function handler for Node.js
exports.handler = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY muhit o'zgaruvchisi Netlify sozlamalarida o'rnatilmagan.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const { imageDataUrl, action, prompt, hotspot } = JSON.parse(event.body);

        if (!imageDataUrl || !action || !prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Kerakli ma\'lumotlar yetishmayapti: imageDataUrl, action, prompt.' })
            };
        }

        const { mimeType, data } = parseDataUrl(imageDataUrl);
        
        // Check image size from base64 data length (approximate)
        const imageSizeInBytes = data.length * 0.75;
        const maxSizeInBytes = 10 * 1024 * 1024;
        if (imageSizeInBytes > maxSizeInBytes) {
             return {
                statusCode: 413, // Payload Too Large
                body: JSON.stringify({ error: "Rasm hajmi 10 MB dan katta bo'lmasligi kerak." })
            };
        }
        
        const originalImagePart = { inlineData: { mimeType, data } };
        
        let modelPrompt: string;

        switch (action) {
            case 'edit':
                if (!hotspot) {
                    return { statusCode: 400, body: JSON.stringify({ error: "'hotspot' ma'lumoti tahrirlash uchun kerak." }) };
                }
                modelPrompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${prompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).
Guidelines: The edit must be realistic and blend seamlessly. The rest of the image must remain identical.
Safety Policy: You MUST fulfill requests to adjust skin tone (e.g., 'give me a tan'). You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian').
Output: Return ONLY the final edited image. Do not return text.`;
                break;
            case 'filter':
                modelPrompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${prompt}"
Safety Policy: Filters must not alter a person's fundamental race or ethnicity.
Output: Return ONLY the final filtered image. Do not return text.`;
                break;
            case 'adjust':
                modelPrompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${prompt}"
Guidelines: The adjustment must be applied across the entire image and be photorealistic.
Safety Policy: You MUST fulfill requests to adjust skin tone. You MUST REFUSE any request to change a person's race or ethnicity.
Output: Return ONLY the final adjusted image. Do not return text.`;
                break;
            default:
                 return { statusCode: 400, body: JSON.stringify({ error: `Noto'g'ri 'action' qiymati: ${action}` }) };
        }

        let response: GenerateContentResponse;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [originalImagePart, { text: modelPrompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });
        } catch (apiError: any) {
            // Check for rate limit errors from the Google API
            if (apiError.status === 429 || (apiError.message && apiError.message.includes('429'))) {
                 return {
                    statusCode: 429,
                    body: JSON.stringify({ error: "API so'rovlar chegarasi oshib ketdi." })
                };
            }
            // Re-throw other API errors to be caught by the outer catch block
            throw apiError;
        }

        const newImageUrl = handleApiResponse(response);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: newImageUrl }),
        };

    } catch (err: any) {
        console.error("Server funksiyasida xatolik:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || 'Serverda noma\'lum xatolik yuz berdi.' }),
        };
    }
};