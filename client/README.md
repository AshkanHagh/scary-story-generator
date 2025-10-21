# Scary Story Generator 🎃

**Scary Story Generator** is a spooky web app where users can create custom horror videos based on their own story ideas.  
Simply provide a **title** and a **description** of your scary story, and the app will generate a **creepy video** with haunting visuals and sound effects that bring your story to life.  

[Live Demo](https://scary-story-generator.vercel.app)
---

## Tech Stack

- **Next.js** — Framework for server-side rendering and routing  
- **React.js** — UI library  
- **TypeScript** — Type-safe development  
- **Tailwind CSS** — Styling and layout  
- **Framer Motion** — Smooth and dynamic animations  
- **Ky** — Lightweight HTTP client (alternative to Axios)

---

## Project Structure

The project follows a route-segment–scoped structure, meaning each route segment in the App Router contains its own related components, hooks, and types — keeping the project modular, isolated, and easy to maintain
```
client/
├── app/
│ ├── videos/
│ │ ├── _components/ # Page-specific components
│ │ ├── _hooks/ # Page-specific hooks
│ │ ├── _types/ # Page-specific TypeScript types
│ ├── dashboard/
│ │ ├── _components/
│ │ ├── _hooks/
│ │ ├── _types/
│ └── ...
│
├── public/ # Static assets
├── styles/ # Global styles
└── ...
```
---

## Installation

> Make sure you have **Node.js (v18+)** and **pnpm** installed.

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShahinFallah/scary-story-generator.git
   cd scary-story-generator/client
   ```
   
2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```
---

### Notes
- This project is focused on generating animated horror videos based on user input.
- Heavy use of Framer Motion for cinematic and eerie animations.
