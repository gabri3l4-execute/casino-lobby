# 🎰 Casino Lobby – Cubeia Technical Test

A performant, maintainable, and responsive casino lobby built with React, TypeScript, and Vite. This project demonstrates frontend architecture optimized for scalability, real-world data integration, and business rule enforcement in a high-throughput gaming environment.

## 🚀 Live Demo

🔗 [https://casino-lobby.onrender.com](https://casino-lobby.onrender.com)

## 🧩 Features

- **Virtualized Game Grid**  
  Efficient rendering of large game datasets using `react-window`, ensuring smooth scroll performance even with hundreds of entries.

- **Dynamic Filtering System**  
  - Filter by game name, studio, tags, and supported currencies.  
  - Centralized filtering logic for maintainability and testability.  
  - Filters update reactively and reflect only valid, displayable games.

- **Data-Driven UI**  
  - Consumes a backend JSON API with live game metadata.  
  - Handles edge cases like missing thumbnails, tags, or currencies with graceful fallbacks.

- **Responsive Design**  
  - Adaptive grid layout using CSS Grid and media queries.  
  - Optimized for desktop and mobile viewports.

## ⚙️ Tech Stack

| Layer          | Technology                |
|----------------|---------------------------|
| Framework      | React + TypeScript        |
| Build Tool     | Vite                      |
| Virtualization | react-window              |
| Styling        | CSS Modules               |
| Deployment     | Render.com                |

## 🧠 Architecture & Design Decisions

- **Type Safety**  
  - Strongly typed models for `Game`, `Studio`, `Tag`, and `Currency`.  
  - Defensive programming to prevent runtime crashes from undefined/null values.

- **Performance Optimizations**  
  - Memoization with `useMemo` and `useCallback`.  
  - Lazy loading of images and components.  
  - Efficient keying and rendering in virtualized lists.

- **Code Organization**  
  - Modular components: `GameCard`, `GameGrid`, `FilterPanel`, etc.  
  - Business logic extracted into pure utility functions and selectors.

- **Error Handling**  
  - Fallback thumbnails for missing images.  
  - Filters exclude games with invalid or incomplete data.

## ✅ Validation

- Verified against business rules:
  - Only games with valid thumbnails and supported currencies are shown.
  - Filtering logic reflects backend data accurately.
- Manual QA of edge cases:
  - Games with multiple currencies, no tags, or missing studios.
- Live deployment tested for responsiveness and performance.

## 🛠️ Setup & Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📌 Notes

- Designed with fullstack readiness in mind: filtering logic is decoupled and ready for backend integration.
- Built with clarity, maintainability, and performance as top priorities.
- Easily extendable to support sorting, pagination, or real-time updates via WebSockets.

