# 🍃 Leaf OS

A beautiful, minimal desktop operating system interface inspired by modern design principles. Built with vanilla JavaScript, HTML5, and CSS3—no frameworks required.

---

## ✨ Features

- **Boot Animation**: Elegant startup sequence with spinner and system initialization messages
- **Draggable Windows**: Fully functional window management system with smooth pointer-based dragging
- **Modern Dock**: Bottom-aligned navigation dock with app launchers and visual feedback
- **Multiple Applications**:
  - 📋 **Welcome**: Introductory information
  - 🕐 **Clock**: Real-time display with live date
  - 📅 **Calendar**: Interactive month view with today highlight
  - 📝 **Notes**: Simple text editor for quick notes
  - ⚙️ **Settings**: Wallpaper customization panel
- **Wallpaper Switcher**: 4 beautiful gradient themes with live preview
- **Search Bar**: Top navigation search interface
- **Live Clock & Calendar**: Real-time updates
- **Responsive Design**: Adapts to different screen sizes
- **Glass-Morphism UI**: Modern frosted glass effect with backdrop blur
- **Neon Aesthetic**: Green and cyan neon accents on dark background

---

## 🎨 Design & Theming

### Color Palette
- **Primary Accent**: Neon Green (#5dffaa)
- **Secondary Accent**: Neon Cyan (#00e5ff)
- **Background**: Deep Dark (#040d09)
- **Panel**: Transparent Dark with Green Border (rgba)
- **Text**: Off-White (#f0fff8)

### Wallpapers
1. **Leaf Green** - Lush green gradient
2. **Neon Blue** - Cool blue tones
3. **Deep Forest** - Darker forest green
4. **Ocean Glow** - Deep ocean blue

---

## 📋 Project Structure

```
webos/
├── index.html              # Main HTML structure
├── style.css              # Complete styling & animations
├── script.js              # LeafOS class with all logic
├── README.md              # This file
├── .git/                  # Git repository
└── assets/
    ├── icons/             # App icons (SVG)
    │   └── leaf.svg
    └── wallpapers/        # Wallpaper assets
        └── README.txt
```

---

## 🚀 Installation & Setup

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (optional, for local server)
- Node.js (optional, for development)

### Quick Start

#### Option 1: Direct File Access
1. Clone or download the repository
2. Open `index.html` in your browser
3. Boot animation plays automatically, then enjoy the desktop!

#### Option 2: Local Server (Recommended)
```bash
cd /workspaces/webos
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

#### Option 3: Node.js HTTP Server
```bash
cd /workspaces/webos
npx http-server -p 8000
```

---

## 💻 Usage Guide

### Boot Screen
- **Duration**: ~2.4 seconds
- **Messages**: 
  - "Initializing system..."
  - "Loading neon leaf kernel..."
  - "Waking the desktop..."
  - "Ready"
- Desktop automatically appears when boot completes

### Window Management
- **Open Apps**: Click app icons in the dock at the bottom
- **Drag Windows**: Click and drag the window header (title bar)
- **Close Windows**: Click the ✕ button in the top-right of any window
- **Z-Index**: Windows automatically bring to front when opened

### Dock Navigation
Located at the bottom of the screen with 5 app launchers:
- 📄 Welcome
- 🕐 Clock
- 📅 Calendar
- 📝 Notes
- ⚙️ Settings

### Wallpaper Selector
1. Click the 🎨 button in the top-right (topbar)
2. Modal appears with 4 wallpaper options
3. Click any wallpaper to apply it
4. Selection persists during the session

### Clock & Calendar
- **Clock Window**: Shows current time and date, updates every second
- **Calendar Window**: Displays the current month with today highlighted
- Auto-updates at midnight

### Notes Application
- Simple textarea for taking quick notes
- No persistence (clears on page refresh)

### Search Bar
- Located in the top-left topbar
- Currently cosmetic; ready for feature implementation

---

## 🛠️ Customization Guide

### Change Theme Colors
Edit `/style.css` CSS variables at the top:

```css
:root {
  --bg: #040d09;              /* Main background */
  --panel: rgba(8, 24, 16, 0.75);    /* Window panels */
  --border: rgba(108, 255, 178, 0.25); /* Border color */
  --text: #f0fff8;             /* Text color */
  --muted: #a8e6c5;            /* Muted text */
  --accent: #5dffaa;           /* Primary accent */
  --accent-2: #00e5ff;         /* Secondary accent */
  --dark: #030a07;             /* Dark background */
}
```

### Add New Wallpapers
Edit the `wallpapers` array in `/script.js`:

```javascript
this.wallpapers = [
  { name: 'Your Wallpaper', gradient: 'linear-gradient(135deg, #color1 0%, #color2 100%)' },
  // Add more...
];
```

### Add New Applications
In `/script.js`, add to the `init()` method:

```javascript
this.createWindow('app-id', 'App Title', `
  <div class="app-content">
    <!-- Your content here -->
  </div>
`);
```

Then add a dock button in `index.html`:
```html
<button class="dock-item" data-app="app-id" title="App Title">🎯</button>
```

### Customize Window Appearance
Modify `.window` and `.window-header` classes in `/style.css`:
- Border radius: `border-radius: 20px`
- Width: `360px` (max-width on mobile)
- Glass effect: `backdrop-filter: blur(10px)`

### Adjust Boot Duration
In `/script.js` boot method:
```javascript
await new Promise(resolve => setTimeout(resolve, 2400)); // Change this value (ms)
```

---

## 📱 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Browsers | Modern | ✅ Full |

### CSS Features Used
- CSS Grid & Flexbox
- CSS Custom Properties (Variables)
- Backdrop Filter
- Pointer Events API
- Gradient Backgrounds
- CSS Animations & Transitions

---

## 🏗️ Architecture

### LeafOS Class
The entire application is built on a single `LeafOS` class that handles:

**Initialization**:
- DOM element references
- Wallpaper definitions
- Window registry

**Boot Process**:
- Sequential status messages
- 2400ms animation duration
- Desktop reveal

**Window Management**:
- `createWindow()` - Generate new window elements
- `makeDraggable()` - Add pointer event handlers
- `openWindow()` - Show window and adjust z-index
- `closeWindow()` - Hide window

**Features**:
- `updateClock()` - Live time display
- `updateCalendar()` - Month view with highlighting
- `setWallpaper()` - Apply gradient wallpaper
- `showWallpaperModal()` - Display selector

**Event Binding**:
- All listeners attached in `init()` method
- Dynamically created windows receive drag handlers
- Dock buttons trigger window open/close

---

## 🎯 File Descriptions

### index.html
**Purpose**: Complete desktop OS interface shell
- Boot overlay with spinner
- Desktop grid layout (topbar, workspace, dock)
- Wallpaper layer with gradient background
- Windows container for dynamic window creation
- Wallpaper modal with selectable gradients
- Search bar, time display, dock buttons

### style.css
**Purpose**: Complete responsive styling with neon theme
- CSS color variables system
- Boot animation keyframes
- Topbar with search and clock
- Window styling with glass effect
- Dock with hover animations
- Modal and wallpaper grid styling
- Responsive media queries
- Calendar grid layout
- Smooth transitions and backdrop filters

### script.js
**Purpose**: Main application logic
- LeafOS singleton class
- Boot sequence with messaging
- Pointer-based window dragging
- Window lifecycle management (create, open, close)
- Clock and calendar updates
- Wallpaper selection and persistence
- Event listener setup
- 500+ lines of well-structured ES6+ code

---

## 🔧 Development Notes

### Performance Optimizations
- Minimal DOM manipulation
- CSS animations for smooth performance
- Efficient pointer event handling
- No external dependencies

### Debugging
- Open browser DevTools (F12)
- Check console for any errors
- Inspect styles in Elements tab
- Monitor network tab for asset loading

### Git Workflow
- Repository: `Sanskarsingh100/webos`
- Branch: `b2`
- Default branch: `main`
- All changes tracked in Git

### Local Testing Commands
```bash
# Syntax check
node --check script.js

# Start server
python3 -m http.server 8000

# Check file sizes
ls -lah

# View file structure
tree -L 2
```

---

## 📚 Features Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Boot Animation | ✅ Complete | 2.4s with 4 messages |
| Window Dragging | ✅ Complete | Pointer events, boundary safe |
| Window Close | ✅ Complete | Smooth hide animation |
| Clock Display | ✅ Complete | Updates every 1s |
| Calendar | ✅ Complete | 7-column grid, today highlight |
| Wallpapers | ✅ Complete | 4 gradients, instant apply |
| Dock Navigation | ✅ Complete | 5 app buttons + separator |
| Settings Panel | ✅ Complete | Wallpaper switcher |
| Search Bar | ⏳ Ready | UI ready for future implementation |
| Notes | ✅ Complete | Simple textarea |
| Welcome Window | ✅ Complete | Introduction text |

---

## 🚀 Future Enhancement Ideas

- [ ] Persistent storage (localStorage for wallpaper, notes)
- [ ] Keyboard shortcuts (Alt+Tab window switching, Cmd+Q quit)
- [ ] Additional apps (Calculator, Text Editor, File Manager)
- [ ] Notification system
- [ ] Desktop context menu
- [ ] Window snapping
- [ ] Fullscreen toggle
- [ ] Custom cursor
- [ ] Audio effects
- [ ] Screenshot functionality
- [ ] Real wallpaper images
- [ ] Window maximize/minimize
- [ ] App switcher overlay

---

## 📄 License

This project is open source and available for personal and educational use.

---

## 👨‍💻 Credits

Designed and built by Sanskarsingh100

Inspired by modern desktop OS interfaces and minimalist design principles.

---

## 📞 Support & Feedback

For issues, suggestions, or questions:
- Check the code comments in `script.js` and `style.css`
- Review the customization guide above
- Inspect browser console for error messages
- Test in different browsers for compatibility

---

## 🎓 Learning Resources

This project demonstrates:
- ES6+ Class-based JavaScript architecture
- DOM manipulation and event handling
- CSS Grid and Flexbox layouts
- CSS animations and transitions
- Pointer events API
- Modern CSS features (custom properties, backdrop filter)
- Responsive web design

Perfect for learning modern web development fundamentals!

---

**Enjoy your Leaf OS experience! 🍃✨**
