/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Fix for "Cannot find name 'Deno'" error in TypeScript environments that
// don't have Deno types globally available. This declares the Deno global.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Bu Deno muhitida ishlaydigan Netlify Funksiyasi.
// U bizning front-end va Google Gemini API o'rtasida xavfsiz proksi vazifasini bajaradi.
// Bu API kalitlari bilan ishlashning ENG YAXSHI USULI hisoblanadi.

import { GoogleGenAI, type GenerateContentResponse, Modality } from "https://esm.sh/@google/genai@^1.10.0";

// ArrayBuffer'ni Base64 satriga o'giruvchi yordamchi funksiya (veb-standart API'lar yordamida).
// Bu ba'zi serverless muhitlarda muammo tug'dirishi mumkin bo'lgan Node.js'ga xos 'Buffer'dan qochadi.
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};


const handleApiResponse = (
    response: GenerateContentResponse,
    context: string
): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `So'rov bloklandi. Sabab: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Rasm yaratish ${context} uchun kutilmaganda to‘xtadi. Sabab: ${finishReason}. Bu ko‘pincha xavfsizlik sozlamalari bilan bog‘liq.`;
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `AI modeli ${context} uchun rasm qaytarmadi. ` + 
        (textFeedback 
            ? `Model matn bilan javob berdi: "${textFeedback}"`
            : "Bu xavfsizlik filtrlari tufayli yoki so'rov juda murakkab bo'lsa sodir bo'lishi mumkin. Iltimos, so'rovingizni aniqroq qilib qayta ifodalashga harakat qiling.");

    throw new Error(errorMessage);
};


// Netlify'ning Deno uchun zamonaviy handler imzosi (global Request va Response'dan foydalanadi)
export default async (request: Request) => {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        // Deno'da muhit o'zgaruvchilarini olishning to'g'ri usuli
        const apiKey = Deno.env.get("API_KEY");
        if (!apiKey) {
            throw new Error("API_KEY muhit o'zgaruvchisi Netlify sozlamalarida o'rnatilmagan.");
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const formData = await request.formData();

        const imageFile = formData.get('image') as File | null;
        const action = formData.get('action') as string | null;
        const prompt = formData.get('prompt') as string | null;
        
        if (!imageFile || !action || !prompt) {
             return new Response(JSON.stringify({ error: 'Kerakli form ma\'lumotlari yetishmayapti.' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const imageArrayBuffer = await imageFile.arrayBuffer();
        const imageBase64 = arrayBufferToBase64(imageArrayBuffer);
        const originalImagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: imageBase64
            }
        };
        
        let modelPrompt: string;
        let response: GenerateContentResponse;
        
        switch (action) {
            case 'edit':
                const hotspotRaw = formData.get('hotspot') as string | null;
                if (!hotspotRaw) {
                    return new Response(JSON.stringify({ error: "'hotspot' ma'lumoti yetishmayapti." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
                }
                let hotspot;
                try {
                    hotspot = JSON.parse(hotspotRaw);
                } catch (e) {
                    return new Response(JSON.stringify({ error: "'hotspot' ma'lumoti noto'g'ri JSON formatida." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
                }
                modelPrompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${prompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).
Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain identical to the original.
Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.
Output: Return ONLY the final edited image. Do not return text.`;
                break;
            case 'filter':
                modelPrompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${prompt}"
Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- YOU MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').
Output: Return ONLY the final filtered image. Do not return text.`;
                break;
            case 'adjust':
                modelPrompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${prompt}"
Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.
Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.
Output: Return ONLY the final adjusted image. Do not return text.`;
                break;
            default:
                throw new Error("Noto'g'ri 'action' qiymati taqdim etildi.");
        }

        const textPart = { text: modelPrompt };
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [originalImagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imageUrl = handleApiResponse(response, action);

        return new Response(JSON.stringify({ imageUrl }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        const error = err as Error;
        console.error("Server funksiyasida xatolik:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};