/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Helper to convert a File object to a Data URL string.
const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};


const callApi = async (payload: object): Promise<string> => {
    const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorMsg = `Server xatosi: ${response.status} ${response.statusText}.`;
        
        if (response.status === 404) {
            errorMsg = "Server funksiyasi topilmadi (404). Loyiha tuzilishi to'g'ri ekanligiga ishonch hosil qiling.";
        } else if (response.status === 429) {
             errorMsg = "Server haddan tashqari yuklangan. Iltimos, bir daqiqadan so'ng qayta urinib ko'ring.";
        } else {
            try {
                // Try to parse a specific JSON error from our function
                const errorResult = await response.json();
                errorMsg = errorResult.error || errorMsg;
            } catch (e) {
                // If parsing fails, it's likely not our function's response (e.g., Netlify error page)
                errorMsg += " Serverdan yaroqli JSON javob kelmadi. Funksiya to'g'ri joylashtirilganligini tekshiring.";
            }
        }
        throw new Error(errorMsg);
    }

    try {
        const result = await response.json();
        if (!result.imageUrl) {
            throw new Error("Serverdan rasm manzili kelmadi.");
        }
        return result.imageUrl;
    } catch (e) {
        console.error("Javobni JSON formatida o'qishda xatolik:", e);
        throw new Error("Serverdan yaroqli javob kelmadi.");
    }
};

/**
 * Generates an edited image by calling our secure serverless function.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    const imageDataUrl = await fileToDataURL(originalImage);
    const payload = {
        action: 'edit',
        imageDataUrl,
        prompt: userPrompt,
        hotspot,
    };
    return callApi(payload);
};

/**
 * Generates an image with a filter applied by calling our secure serverless function.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    const imageDataUrl = await fileToDataURL(originalImage);
    const payload = {
        action: 'filter',
        imageDataUrl,
        prompt: filterPrompt,
    };
    return callApi(payload);
};

/**
 * Generates an image with a global adjustment applied by calling our secure serverless function.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    const imageDataUrl = await fileToDataURL(originalImage);
    const payload = {
        action: 'adjust',
        imageDataUrl,
        prompt: adjustmentPrompt,
    };
    return callApi(payload);
};