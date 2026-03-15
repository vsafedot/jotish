# 📊 Jotish - Employee Insights Dashboard

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

This is a 4-screen **Employee Insights Dashboard** built as part of an engineering evaluation. It demonstrates advanced front-end capabilities, focusing on low-level DOM manipulation, custom mathematics for list virtualization, native browser APIs (Camera, Canvas), and custom SVG charting—all without relying on bloated or generic UI component libraries.

---

## 🚀 Setup and Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vsafedot/jotish.git
   cd jotish
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

---

## ✨ Key Features Implemented

1. 🔒 **Secure Authentication**: 
   - Utilizes React's Context API with `localStorage` persistence for session management.
2. ⚡ **High-Performance Grid (Custom Virtualization)**: 
   - A from-scratch virtualized list implementation (no external libraries like `react-window` or `react-virtualized`).
   - Efficiently handles and parses paginated or extremely large datasets without browser lag.
3. 📸 **Identity Verification (Camera + Signature Canvas Merge)**: 
   - Accesses `getUserMedia` hardware APIs natively.
   - Captures a still frame onto an HTML5 Canvas, layers a transparent Signature Canvas on top, and merges them securely into a single Base64 image payload.
4. 📈 **Data Analytics**: 
   - **Geospatial Mapping**: Uses Leaflet with a static coordinate dictionary to map users while avoiding synchronous geocoding constraints and API rate limits.
   - **Custom Data Visualization**: A fully custom SVG Bar Chart implementing salary distribution mathematically from the ground up, avoiding heavy charting libraries like D3 or Chart.js.

---

## 🧮 Virtualization Math Explained

In `src/pages/ListPage.jsx` (or similar list component), the custom virtualization works using absolute positioning and scroll-offset calculations to only render DOM nodes that are currently intersecting the viewport.

### 1. Constants
- **`ROW_HEIGHT = 80px`**
- **`V_BUFFER = 5`**: Renders 5 extra items above and below the visible viewport to prevent white-flashing during fast scroll events.

### 2. The Viewport Computation
On scroll, the `container` div updates a `scrollTop` state variable.
- `startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - V_BUFFER)`
- `endIndex = Math.min(totalLength - 1, Math.floor((scrollTop + containerHeight) / ROW_HEIGHT) + V_BUFFER)`

### 3. The Rendering Logic
We strictly map and loop exclusively from `startIndex` to `endIndex`. Each node is absolutely positioned within the container using:
```css
transform: translateY(index * ROW_HEIGHT)px
```

### 4. The Ghost Container
The outer wrapper uses a calculated `height: totalLength * ROW_HEIGHT`. This ensures that the browser's native scrollbar accurately reflects the immense size of the dataset. This provides native scroll acceleration, despite only having ~15-20 actual DOM nodes existing in the document at any given time.

---

## 🚨 Intentional Vulnerability Documented

> **Disclaimer:** This vulnerability was intentionally included for conceptual discussion and evaluation purposes.

* **The Bug:** A severe Memory Leak & Privacy Vulnerability via unclosed MediaStream tracks.
* **Where is it?:** `src/pages/Details.jsx` inside the `useEffect` handling the Camera activation.
* **Why this was chosen:** 
  In modern React applications dealing with hardware APIs (like WebRTC or MediaDevices), developers often initialize physical hardware constraints without considering the component lifecycle cleanup phase. 
  
  By intentionally omitting the cleanup logic (`stream.getTracks().forEach(track => track.stop())`), the user's Camera stays physically powered ON (e.g., the green hardware indicator light remains visible on Mac/Windows) even after navigating away from `/details/:id` to other routes like `/analytics`. 

  This represents both a **massive performance memory leak** (keeping a live media stream buffer active indefinitely in the background) and a **critical privacy violation**.

---
*Built by SIDDHARTH*