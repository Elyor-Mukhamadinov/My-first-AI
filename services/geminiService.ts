/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const callApi = async (
    formData: FormData
): Promise<string> => {
    // We call our own serverless function, which will securely call the Gemini API.
    const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Serverda noma\'lum xatolik yuz berdi.');
    }

    return result.imageUrl;
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
    const formData = new FormData();
    formData.append('action', 'edit');
    formData.append('image', originalImage);
    formData.append('prompt', userPrompt);
    formData.append('hotspot', JSON.stringify(hotspot));
    return callApi(formData);
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
    const formData = new FormData();
    formData.append('action', 'filter');
    formData.append('image', originalImage);
    formData.append('prompt', filterPrompt);
    return callApi(formData);
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
    const formData = new FormData();
    formData.append('action', 'adjust');
    formData.append('image', originalImage);
    formData.append('prompt', adjustmentPrompt);
    return callApi(formData);
};
