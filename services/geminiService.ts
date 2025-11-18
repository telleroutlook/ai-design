import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ResultItem } from '../types';

declare const imageCompression: any;

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

// Helper function to translate text to English for the image model.
const translateToEnglish = async (text: string): Promise<string> => {
    // If text is empty or already plain English/ASCII, no need to translate.
    if (!text || !/[^\u0000-\u007F]/.test(text)) {
        return text;
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to English for an AI image generation model. Keep core concepts. Output only the translation. Text: "${text}"`,
            config: {
                temperature: 0,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Translation to English failed:", error);
        return text; // Fallback to original text if translation fails
    }
};


export async function* generateDesignAssets(prompt: string, imageFile: File | null): AsyncGenerator<ResultItem> {
    
    yield { type: 'status', content: 'Analyzing your design brief...' };
    
    // Step 0: Classify the design type
    const classificationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Is the following design request for an 'app', 'website', 'interior design', 'industrial design', or 'other'? Respond with only one of these options. Request: "${prompt}"`,
        config: { temperature: 0 }
    });
    const designType = classificationResponse.text.trim().toLowerCase(); // 'app', 'website', 'interior design', 'industrial design', or 'other'


    let imagePart: { inlineData: { data: string; mimeType: string; } } | null = null;
    
    if (imageFile) {
        yield { type: 'status', content: 'Processing uploaded image...' };
        
        let processedImageFile = imageFile;
        let processedMimeType = imageFile.type;

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: 'image/webp',
            };
            const compressedFile = await imageCompression(imageFile, options);
            processedImageFile = compressedFile;
            processedMimeType = 'image/webp';
        } catch (error) {
            console.error('Image compression failed, using original file.', error);
        }

        const imageBase64 = await fileToBase64(processedImageFile);
        imagePart = {
            inlineData: { data: imageBase64, mimeType: processedMimeType },
        };
    }

    // --- Unified Design Flow ---

    // 1. Generate Design Process Text (in user's language)
    yield { type: 'status', content: 'Brainstorming design process...' };

    const textGenParts: any[] = [];
    let textGenPrompt = `Create a detailed design process for the following concept: "${prompt}". Include key stages and user interface elements, rooms, or components to be designed. Output as Markdown.`;

    if (imagePart) {
        textGenParts.push(imagePart);
        textGenPrompt = `Using the provided image as inspiration, create a detailed design process for the following concept: "${prompt}". Include key stages and user interface elements, rooms, or components to be designed. Output as Markdown.`;
    }
    textGenParts.push({ text: textGenPrompt });

    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: textGenParts },
    });
    yield { type: 'text', content: textResponse.text };

    // 2. Identify Key Screens/Sections/Rooms (in user's language)
    yield { type: 'status', content: 'Identifying key sections for visuals...' };
    
    const screenGenParts: any[] = [];
    let itemType = 'screens or sections';
    if (designType === 'interior design') {
        itemType = 'rooms or areas (e.g., Living Room, Kitchen)';
    } else if (designType === 'industrial design') {
        itemType = 'different views or variations (e.g., Front View, In Context)';
    }

    let screenGenPrompt = `Based on the design concept "${prompt}", identify the 3 most important ${itemType} to create a visual for.`;
    
    if (imagePart) {
        screenGenParts.push(imagePart);
        screenGenPrompt = `Based on the design concept "${prompt}" and the provided reference image, identify the 3 most important ${itemType} to create a visual for.`;
    }
    screenGenParts.push({ text: screenGenPrompt });
    
    const screensResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: screenGenParts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        description: `A list of the 3 most important ${itemType} to design.`,
                        items: {
                            type: Type.STRING,
                        }
                    }
                },
                required: ["items"],
            }
        }
    });

    let itemsToGenerate: string[] = [];
    try {
        const jsonResponse = JSON.parse(screensResponse.text);
        itemsToGenerate = jsonResponse.items.slice(0, 3);
    } catch (e) {
        console.error("Failed to parse items from AI, falling back to text.", e);
        itemsToGenerate = screensResponse.text.split(',').map(s => s.trim()).slice(0, 3);
    }

    if (itemsToGenerate.length === 0) {
         yield { type: 'text', content: "Could not identify specific items to generate. Please try a more detailed prompt." };
         return;
    }

    // 3. Generate Mockups (using English prompts and correct style)
    yield { type: 'status', content: `Generating visuals for: ${itemsToGenerate.join(', ')}...` };
    
    const PROMPT_STYLE_APP = "High-fidelity UI mockup for a mobile phone screen, clean, modern, minimalist aesthetic, vibrant accent colors, intuitive layout, professional design, dribbble quality.";
    const PROMPT_STYLE_WEBSITE = "High-fidelity UI mockup for a responsive website landing page, clean, modern, minimalist aesthetic, vibrant accent colors, intuitive layout, professional design, dribbble quality.";
    const PROMPT_STYLE_INTERIOR = "Photorealistic 3D rendering of an interior design, high-quality, detailed, modern, professional architectural visualization.";
    const PROMPT_STYLE_INDUSTRIAL = "Professional product design concept shot, white background, studio lighting, high-quality 3D render, photorealistic, commercial aesthetic."
    const PROMPT_STYLE_OTHER = "High-quality, professional design mockup, clean, modern, minimalist aesthetic, vibrant accent colors, intuitive layout, professional design.";

    let stylePrompt = PROMPT_STYLE_OTHER;
    switch(designType) {
        case 'app':
            stylePrompt = PROMPT_STYLE_APP;
            break;
        case 'website':
            stylePrompt = PROMPT_STYLE_WEBSITE;
            break;
        case 'interior design':
            stylePrompt = PROMPT_STYLE_INTERIOR;
            break;
        case 'industrial design':
            stylePrompt = PROMPT_STYLE_INDUSTRIAL;
            break;
    }

    // Translate the main concept to English once for all image generations.
    const englishPrompt = await translateToEnglish(prompt);
    
    if (designType === 'industrial design') {
        // --- Sequential generation for product design consistency ---
        let referenceImagePart = imagePart; // Start with user's image, if any

        for (const item of itemsToGenerate) {
            const englishItem = await translateToEnglish(item);
            yield { type: 'status', content: `Generating visual for: ${item}...` };

            const imageGenParts: any[] = [];
            let mockupPrompt: string;
            
            if (referenceImagePart) {
                imageGenParts.push(referenceImagePart);
                // Modify prompt to request a variation of the *provided image*
                mockupPrompt = `Using the provided image as a reference for the product, create a new visual for the "${englishItem}". Maintain the core design of the product. Concept: "${englishPrompt}". ${stylePrompt}`;
            } else {
                 mockupPrompt = `Visual for the "${englishItem}" of the product concept: "${englishPrompt}". ${stylePrompt}`;
            }
            imageGenParts.push({ text: mockupPrompt });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: imageGenParts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            const generatedPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

            if (generatedPart?.inlineData?.data) {
                const mimeType = generatedPart.inlineData.mimeType || 'image/webp';
                yield { 
                    type: 'image', 
                    content: `data:${mimeType};base64,${generatedPart.inlineData.data}`,
                    alt: `Visual for ${item}`
                };
                referenceImagePart = { inlineData: {
                    data: generatedPart.inlineData.data,
                    mimeType: generatedPart.inlineData.mimeType,
                } };
            }
        }
    } else {
        // --- Parallel generation for other types (apps, websites, etc.) ---
        const imagePromises = itemsToGenerate.map(async (item) => {
            const englishItem = await translateToEnglish(item);

            const imageGenParts: any[] = [];
            let mockupPrompt = `Visual for the "${englishItem}" based on the concept: "${englishPrompt}". ${stylePrompt}`;
            
            if (imagePart) {
                imageGenParts.push(imagePart);
                mockupPrompt = `Inspired by the provided image, create a visual for the "${englishItem}" based on the concept: "${englishPrompt}". ${stylePrompt}`;
            }
            imageGenParts.push({ text: mockupPrompt });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: imageGenParts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            // Return item for alt text and error reporting
            return { item, response };
        });

        const imageResults = await Promise.allSettled(imagePromises);

        for (const [index, result] of imageResults.entries()) {
             if (result.status === 'fulfilled') {
                const { item, response } = result.value;
                const parts = response.candidates?.[0]?.content?.parts ?? [];
                let imageGenerated = false;
                for (const part of parts) {
                    if (part.inlineData?.data) {
                        const mimeType = part.inlineData.mimeType || 'image/webp';
                        yield { 
                            type: 'image', 
                            content: `data:${mimeType};base64,${part.inlineData.data}`,
                            alt: `Visual for ${item}` 
                        };
                        imageGenerated = true;
                    }
                }
                if (!imageGenerated) {
                    yield { 
                        type: 'text', 
                        content: `**Notice:** The model did not return a visual for "${item}". This can happen with certain prompts.`,
                        alt: `Notice for ${item}`
                    };
                }
            } else {
                const item = itemsToGenerate[index];
                console.error(`Failed to generate image for ${item}:`, result.reason);
                yield { 
                    type: 'text', 
                    content: `**Error:** Could not generate a visual for "${item}". Please try again or adjust your prompt.`,
                    alt: `Error for ${item}`
                };
            }
        }
    }
}

export async function getChatbotResponse(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful and friendly presentation assistant. You help users brainstorm content for their presentation slides.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
}