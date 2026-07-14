import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const enhancePromptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    enhancedPrompt: {
      type: Type.STRING,
      description: "A professional, detailed brief for the website based on the user's idea.",
    },
    projectSummary: { type: Type.STRING },
    pagesList: { type: Type.ARRAY, items: { type: Type.STRING } },
    featuresList: { type: Type.ARRAY, items: { type: Type.STRING } },
    designRecommendations: { type: Type.STRING },
    technologySuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    generationPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "enhancedPrompt",
    "projectSummary",
    "pagesList",
    "featuresList",
    "designRecommendations",
    "technologySuggestions",
    "generationPlan"
  ],
};

export const componentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    type: { type: Type.STRING, description: "button | text | card | input | image | logo" },
    content: { type: Type.STRING },
    props: { type: Type.STRING, description: "JSON stringified properties or style classes or label text" }
  },
  required: ["id", "type", "content"]
};

export const sectionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    layoutType: { type: Type.STRING, description: "navbar | hero | features | testimonials | pricing | gallery | faq | contact | footer" },
    components: { type: Type.ARRAY, items: componentSchema }
  },
  required: ["id", "title", "description", "layoutType", "components"]
};

export const pageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    slug: { type: Type.STRING },
    sections: { type: Type.ARRAY, items: sectionSchema }
  },
  required: ["id", "name", "slug", "sections"]
};

export const fullWebsiteSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    style: { type: Type.STRING },
    color: { type: Type.STRING },
    pages: { type: Type.ARRAY, items: pageSchema }
  },
  required: ["name", "style", "color", "pages"]
};

export async function enhanceWebsitePrompt(prompt: string, model: string = "gemini-3.5-flash") {
  // Map our UI models to actual Gemini models if needed
  let actualModel = "gemini-3.5-flash";
  if (model === "gemini-3.1-pro-preview" || model === "VGPT-2.0 FLASH") {
     actualModel = "gemini-3.5-flash"; // default map
  } else if (model.includes("pro") || model === "VGPT-2.0 LITE") {
     actualModel = "gemini-3.1-pro-preview";
  }

  const response = await ai.models.generateContent({
    model: actualModel,
    contents: `Analyze the following website request and enhance it into a professional development brief:\n\nUser Request: ${prompt}\n\nPlease analyze: project type, required pages, suggested sections, design style, recommended features, color direction, and target audience. Provide a structured JSON response.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: enhancePromptSchema,
      systemInstruction: "You are an expert Senior Web Architecture AI. Your job is to transform user ideas into professional web development briefs.",
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text.trim());
}

export async function generateFullWebsite(
  prompt: string,
  style: string,
  color: string,
  pagesList: string[],
  model: string = "gemini-3.5-flash"
) {
  let actualModel = "gemini-3.5-flash";
  if (model === "gemini-3.1-pro-preview" || model.includes("pro")) {
    actualModel = "gemini-3.1-pro-preview";
  }

  const systemInstruction = `You are a world-class Web Development Generation Engine. Your goal is to generate a fully fleshed-out, highly creative, and beautiful website structure.
You MUST output a detailed, valid JSON conforming to the requested schema.
Apply the design guidelines for the selected design style:
- 'Minimalist / Luxury Black & White': Pure black background (bg-black), high-contrast white text, thin borders (border-white/10), high negative space, editorial sans/serif typography.
- 'Clean Slate': Clean slate gray and off-whites, corporate and highly professional, soft shadows.
- 'Futuristic Neon / Cyberpunk': Dark purple/indigo backgrounds, neon cyan or purple highlights, glowing borders.
- 'Corporate Classic': Solid deep navy primary, clean layouts, crisp blue accents.
- 'Playful Vibrant': Rich pastel gradients, rounded-3xl cards, bouncy buttons, high energy.

CRITICAL: Determine the language of the user's initial prompt ("${prompt}"). If the user writes in Arabic or requests an Arabic site, all website contents (page names, section titles, description text, components labels, placeholders) MUST be written in beautiful, professional Arabic. If the user writes in English, write in English.`;

  const contents = `Generate a full website for this project idea: "${prompt}".
Style Selection: "${style}"
Color Selection: "${color}"
Pages to generate: ${JSON.stringify(pagesList)}

Please write highly realistic content (no placeholder text like 'lorem ipsum') for each page, including matching sections (navbar, hero, features, testimonials, pricing, contact, footer, etc.) and individual child components for each section with suitable details (content, button text, image ideas).`;

  const response = await ai.models.generateContent({
    model: actualModel,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: fullWebsiteSchema,
      systemInstruction,
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text.trim());
}

export async function regenerateWebsite(
  currentProject: any,
  userInstruction: string,
  model: string = "gemini-3.5-flash"
) {
  let actualModel = "gemini-3.5-flash";
  if (model === "gemini-3.1-pro-preview" || model.includes("pro")) {
    actualModel = "gemini-3.1-pro-preview";
  }

  const systemInstruction = `You are a Senior Website Regeneration Engine. Your job is to modify an existing website project structure based on the user's specific instruction.
You MUST modify ONLY the parts requested (e.g. if the user says "add pricing section to home page", keep other pages/sections intact, but insert the new pricing section with fully rendered details).
Ensure design integrity matches the existing style. Keep the content language consistent (if Arabic, write Arabic; if English, write English). Return the updated complete website structure matching the fullWebsiteSchema.`;

  const contents = `Current Website Structure:
${JSON.stringify(currentProject, null, 2)}

User Request to update: "${userInstruction}"

Please apply this instruction to the website structure, edit, add, or delete components/sections as requested, and return the complete, updated website structure.`;

  const response = await ai.models.generateContent({
    model: actualModel,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: fullWebsiteSchema,
      systemInstruction,
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text.trim());
}
