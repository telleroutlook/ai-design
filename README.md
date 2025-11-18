# AI Design Assistant

Welcome to the AI Design Assistant! This application is a powerful tool for designers, developers, and creators to quickly brainstorm and visualize design concepts for websites, applications, products, and even interior spaces.

![AI Design Assistant Screenshot](https://i.imgur.com/example.png) <!-- It's good practice to add a screenshot -->

## Features

-   **Multi-Disciplinary Design:** Get assistance with a wide range of design fields:
    -   **UI/UX Design:** Generate mockups for web and mobile apps.
    -   **Industrial/Product Design:** Create consistent, multi-view concept renderings for physical products.
    -   **Interior Design:** Create photorealistic renderings from a description or a floor plan image.
-   **Text-to-Design:** Simply describe your idea in a design brief, and the AI will generate a step-by-step design process and high-quality visual mockups or renderings.
-   **Image as Inspiration:** Upload a logo, sketch, floor plan, or reference image. The AI will incorporate its style, colors, and concepts into the generated designs.
-   **Brainstorming Assistant:** Use the integrated chatbot to brainstorm and refine your ideas before generating a full design package.
-   **Comprehensive Output:** The generated package includes detailed text (design processes, concepts) and stunning images (UI mockups, 3D renderings).
-   **PDF Export:** Compile your entire design package into a single, professional PDF document with one click.
-   **Fast & Efficient:** Go from a rough idea to a visual concept in minutes, dramatically speeding up the initial phases of your design workflow.

## How to Use the Application

1.  **Write a Design Brief:** In the main text area, describe your concept. Be as descriptive as you like!
    -   *For an app:* "A mobile app for local gardeners to trade seeds and share tips."
    -   *For a website:* "A modern, minimalist portfolio website for a photographer."
    -   *For interior design:* "A cozy, Scandinavian-style living room with a fireplace."
    -   *For a product:* "A cute, cartoon-themed water bottle for kids."
2.  **Upload an Image (Optional):** Click the upload area to add a reference image, a sketch of a layout, or even a floor plan. This gives the AI visual context.
3.  **Generate:** Click the "Generate Design" button. The assistant will show its progress as it works.
4.  **Review & Export:** Your design package, including a design process and visual mockups/renderings, will appear on the screen. You can then click "Export as PDF" to save your work.
5.  **Brainstorm (Anytime!):** Click the chat bubble icon in the bottom-right corner to open the Presentation Assistant. Use it to flesh out ideas for your project.

## How It Works

This application leverages the Google Gemini API to understand your requests and generate creative content.

-   **Text Generation:** It uses the `gemini-2.5-pro` model to analyze your prompt, create design processes, and identify key visuals to generate.
-   **Image Generation:** It uses the powerful `gemini-2.5-flash-image` model to create high-quality, original mockups and renderings based on the text descriptions.
-   **API Key:** The application is configured to use a Google Gemini API key provided by the execution environment. There is no need for manual setup of API keys.

## Technologies Used

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Model:** Google Gemini API (`gemini-2.5-pro` for text, `gemini-2.5-flash-image` for images)
-   **PDF Generation:** jsPDF
-   **Image Handling:** browser-image-compression