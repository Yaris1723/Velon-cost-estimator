# Velon Constructions - Cost Estimator

A premium internal web application for construction cost estimation, material quantity calculation, and BOQ generation.

## Features

- **Dashboard**: Track and manage all project estimations.
- **Auto-Quantity Calculation**: Estimate materials based on built-up area and construction thumb rules.
- **Pricing Entry**: Real-time pricing adjustment for materials.
- **BOQ Generation**: Generate professional PDF, Excel summaries, and printable layouts.
- **Version Control**: Duplicate and refine estimates (v1, v2, etc.).
- **Local Storage**: All data is persisted locally in the browser for speed and ease of use.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **State Management**: Zustand with Persistence
- **Export**: jsPDF (PDF) & SheetJS (Excel)
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

This project is ready for one-click deployment on Vercel:

1. Push this code to a GitHub repository.
2. Connect the repository to Vercel.
3. Vercel will automatically detect Next.js and deploy the app.

## Project Structure

- `src/app`: Application routes and pages.
- `src/components`: Reusable UI components.
- `src/store`: Zustand state management and calculation logic.
- `src/lib`: Utility functions and constants.

---

Built with ❤️ for **Velon Constructions**
