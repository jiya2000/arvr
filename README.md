# Lumière — An Augmented Culinary Experience 🍽️✨

An AR-enhanced restaurant menu web app that lets diners explore Indian cuisine through interactive 3D models, augmented reality, and an immersive digital experience.

**Live Demo:** [jiya2000.github.io/arvr](https://jiya2000.github.io/arvr/)

---

## ✨ Features

### 🔮 3D & AR Menu
- Interactive 3D models of dishes using `<model-viewer>`
- AR placement on real surfaces (Android WebXR / iOS Quick Look)
- Rotate, zoom, and inspect every dish before ordering

### 🍛 Smart Menu System
- 34 authentic Indian dishes across 4 categories
- Category filtering (Starters, Mains, Desserts, Beverages)
- Detailed dish cards with ingredients, allergens, calories, prep time
- Chef's notes for every dish

### 🛒 Full Cart & Customization
- Add dishes with customizable spice levels and portion sizes
- Add-ons system with dynamic pricing
- Session-persistent cart

### 🔍 AR Dish Discovery Game
- Gamified dish exploration with points and badges
- Progress tracking across featured dishes
- 4-tier badge system (Curious Diner → AR Food Master)

### ✨ Smart Recommendations
- Rule-based preference matching (clearly labeled, not AI)
- Filter by dietary needs, mood, budget, and protein preference

### 🏛️ Virtual Restaurant Tour
- 3D restaurant scene viewer
- Interactive hotspots for different restaurant areas
- Table reservation system (demo)

### 📱 Mobile-First Design
- Premium dark-mode UI with gold accents
- Glassmorphism, micro-animations, and smooth transitions
- Responsive across all device sizes
- QR code for instant mobile access

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 Semantic |
| Styling | Vanilla CSS (custom properties, animations) |
| Logic | Vanilla JavaScript (ES Modules) |
| 3D/AR | [model-viewer](https://modelviewer.dev) (WebXR + Quick Look) |
| Typography | Google Fonts (Playfair Display, Outfit) |
| 3D Assets | [Khronos glTF Samples](https://github.com/KhronosGroup/glTF-Sample-Assets) (open license) |

**No frameworks. No build tools. Pure web standards.**

---

## 📁 Project Structure

```
arvr/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # Complete design system
├── js/
│   ├── app.js          # Main controller
│   ├── config.js       # Global configuration
│   ├── cart.js          # Cart & customization
│   ├── discovery.js     # Discovery game
│   ├── recommendations.js  # Smart recommendations
│   ├── restaurant.js    # Virtual tour
│   └── ar.js           # AR experience
├── data/
│   └── menu.json       # Menu data (34 items)
└── assets/
    └── images/         # Image assets
```

---

## 🚀 Getting Started

### Run Locally

```bash
# Clone the repo
git clone https://github.com/jiya2000/arvr.git
cd arvr

# Start a local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

### AR Experience
1. Open the site on a mobile device (or scan the QR code)
2. Tap "🔮 View 3D / AR" on any dish with a 3D model
3. Tap "📱 View in AR" to place the dish on your table
4. Android: Uses WebXR/Scene Viewer
5. iOS: Uses Quick Look (USDZ)

---

## 📋 Important Notes

- **Prototype**: This is an academic project. No real transactions are processed.
- **3D Models**: Using open-license Khronos sample models as representative placeholders. Full production would use custom food-specific models.
- **Recommendations**: Rule-based pattern matching, clearly labeled. Not AI-generated.
- **AR Availability**: Requires a compatible mobile browser (Chrome on Android, Safari on iOS).

---

## 📜 License

Academic project. 3D assets are from the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) repository under their respective licenses.

---

Built with 🍛 and ✨ by the Lumière team.
