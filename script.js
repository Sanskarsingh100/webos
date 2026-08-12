class LeafOS {
  constructor() {
    this.windows = {};
    this.windowStack = [];
    this.bootOverlay = document.getElementById('bootOverlay');
    this.desktop = document.getElementById('desktop');
    this.windowsContainer = document.getElementById('windowsContainer');
    this.wallpaperEl = document.getElementById('wallpaper');
    this.wallpaperModal = document.getElementById('wallpaperModal');
    this.wallpaperGrid = document.getElementById('wallpaperGrid');
    this.topTime = document.getElementById('topTime');
    this.bootText = document.getElementById('bootText');

    this.wallpapers = [
      { 
        name: 'Leaf Green', 
        url: 'assets/wallpapers/leaf-green.html',
        preview: 'linear-gradient(135deg, #0a2e1f 0%, #051410 100%)'
      },
      { 
        name: 'Neon Blue', 
        url: 'assets/wallpapers/neon-blue.html',
        preview: 'linear-gradient(135deg, #0a1f2e 0%, #051410 100%)'
      },
      { 
        name: 'Deep Forest', 
        url: 'assets/wallpapers/deep-forest.html',
        preview: 'linear-gradient(135deg, #0d3a2a 0%, #051410 100%)'
      },
      { 
        name: 'Ocean Glow', 
        url: 'assets/wallpapers/ocean-glow.html',
        preview: 'linear-gradient(135deg, #0a2838 0%, #05141a 100%)'
      },
    ];

    this.currentWallpaperIndex = 0;
    this.nextZIndex = 1000;
    this.draggedWindow = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  async boot() {
    const messages = [
      'Initializing system...',
      'Loading neon leaf kernel...',
      'Waking the desktop...',
      'Ready',
    ];

    let step = 0;
    const interval = setInterval(() => {
      this.bootText.textContent = messages[step] || messages[messages.length - 1];
      step += 1;
    }, 600);

    await new Promise(resolve => setTimeout(resolve, 2400));
    clearInterval(interval);

    this.bootOverlay.classList.add('hidden');
    this.desktop.style.display = 'grid';
    this.init();
  }

  createWindow(id, title, content, position = null) {
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = id;
    windowEl.dataset.windowId = id;
    
    // Use provided position or random
    let offsetX, offsetY;
    if (position) {
      offsetX = position.x;
      offsetY = position.y;
    } else {
      offsetX = 60 + Math.random() * 300;
      offsetY = 100 + Math.random() * 200;
    }
    
    windowEl.style.left = `${offsetX}px`;
    windowEl.style.top = `${offsetY}px`;
    windowEl.style.zIndex = this.nextZIndex++;

    windowEl.innerHTML = `
      <div class="window-header" data-header="${id}">
        <div class="window-title">${title}</div>
        <div class="window-buttons">
          <button class="window-btn minimize-btn" data-action="minimize" title="Minimize">−</button>
          <button class="window-btn maximize-btn" data-action="maximize" title="Maximize">□</button>
          <button class="window-btn close-btn" data-action="close" title="Close">×</button>
        </div>
      </div>
      <div class="window-body">
        ${content}
      </div>
    `;

    this.windowsContainer.appendChild(windowEl);
    this.windows[id] = {
      element: windowEl,
      isMinimized: false,
      isMaximized: false,
      originalState: {
        left: offsetX,
        top: offsetY,
        width: '360px',
        height: 'auto'
      }
    };

    this.setupWindowDrag(windowEl);
    this.setupWindowButtons(windowEl, id);
    this.windowStack.push(id);

    // Fade in animation
    windowEl.classList.add('fade-in');
    setTimeout(() => windowEl.classList.remove('fade-in'), 300);

    return windowEl;
  }

  setupWindowDrag(windowEl) {
    const header = windowEl.querySelector('.window-header');
    
    header.addEventListener('pointerdown', (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest('.window-btn')) return;
      
      this.draggedWindow = windowEl;
      const rect = windowEl.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
      
      // Bring to front
      this.bringWindowToFront(windowEl.id);
      
      header.setPointerCapture(e.pointerId);
      windowEl.classList.add('dragging');
    });

    document.addEventListener('pointermove', (e) => {
      if (this.draggedWindow) {
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Constrain to viewport
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 50;
        const minX = -280;
        const minY = 0;
        
        this.draggedWindow.style.left = `${Math.max(minX, Math.min(maxX, x))}px`;
        this.draggedWindow.style.top = `${Math.max(minY, Math.min(maxY, y))}px`;
      }
    });

    document.addEventListener('pointerup', () => {
      if (this.draggedWindow) {
        this.draggedWindow.classList.remove('dragging');
        this.draggedWindow = null;
      }
    });
  }

  setupWindowButtons(windowEl, id) {
    const closeBtn = windowEl.querySelector('[data-action="close"]');
    const minimizeBtn = windowEl.querySelector('[data-action="minimize"]');
    const maximizeBtn = windowEl.querySelector('[data-action="maximize"]');

    closeBtn?.addEventListener('click', () => this.closeWindow(id));
    minimizeBtn?.addEventListener('click', () => this.minimizeWindow(id));
    maximizeBtn?.addEventListener('click', () => this.maximizeWindow(id));
  }

  bringWindowToFront(id) {
    const windowEl = this.windows[id]?.element;
    if (windowEl) {
      windowEl.style.zIndex = this.nextZIndex++;
      // Reorder stack
      this.windowStack = this.windowStack.filter(w => w !== id);
      this.windowStack.push(id);
    }
  }

  makeDraggable(windowEl) {
    // Kept for backwards compatibility - calls new method
    this.setupWindowDrag(windowEl);
  }

  openWindow(id) {
    const windowData = this.windows[id];
    if (windowData) {
      windowData.element.classList.remove('hidden', 'minimized');
      windowData.isMinimized = false;
      this.bringWindowToFront(id);
    }
  }

  closeWindow(id) {
    const windowData = this.windows[id];
    if (windowData) {
      windowData.element.classList.add('slide-out');
      setTimeout(() => {
        windowData.element.classList.add('hidden');
        windowData.element.classList.remove('slide-out');
        this.windowStack = this.windowStack.filter(w => w !== id);
      }, 300);
    }
  }

  minimizeWindow(id) {
    const windowData = this.windows[id];
    if (windowData) {
      windowData.element.classList.toggle('minimized');
      windowData.isMinimized = !windowData.isMinimized;
    }
  }

  maximizeWindow(id) {
    const windowData = this.windows[id];
    if (windowData) {
      const element = windowData.element;
      
      if (windowData.isMaximized) {
        // Restore
        element.style.left = `${windowData.originalState.left}px`;
        element.style.top = `${windowData.originalState.top}px`;
        element.style.width = windowData.originalState.width;
        element.style.height = windowData.originalState.height;
        element.classList.remove('maximized');
        windowData.isMaximized = false;
      } else {
        // Maximize
        windowData.originalState.left = parseInt(element.style.left) || 0;
        windowData.originalState.top = parseInt(element.style.top) || 0;
        windowData.originalState.width = element.style.width || '360px';
        windowData.originalState.height = element.style.height || 'auto';
        
        element.style.left = '0px';
        element.style.top = '60px';
        element.style.width = '100%';
        element.style.height = `calc(100vh - 110px)`;
        element.classList.add('maximized');
        windowData.isMaximized = true;
      }
    }
  }

  updateClock() {
    const now = new Date();
    this.topTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const clockEl = document.getElementById('windowClock');
    if (clockEl) {
      const body = clockEl.querySelector('.window-body');
      if (body) {
        body.querySelector('.big-clock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        body.querySelector('.clock-date').textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      }
    }

    this.updateCalendar();
  }

  updateCalendar() {
    const now = new Date();
    const calendarEl = document.getElementById('windowCalendar');
    if (!calendarEl) return;

    const body = calendarEl.querySelector('.window-body');
    if (!body) return;

    const grid = body.querySelector('.calendar-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    const monthName = now.toLocaleDateString([], { month: 'long', year: 'numeric' });
    const monthHeader = body.querySelector('.calendar-month-header');
    if (monthHeader) monthHeader.textContent = monthName;

    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      if (day === today) dayEl.classList.add('today');
      dayEl.textContent = day;
      grid.appendChild(dayEl);
    }
  }

  setWallpaper(index) {
    this.currentWallpaperIndex = index;
    const wallpaper = this.wallpapers[index];
    
    // Create iframe for live wallpaper
    this.wallpaperEl.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = wallpaper.url;
    iframe.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      pointer-events: none;
      z-index: 0;
    `;
    this.wallpaperEl.appendChild(iframe);

    // Update preview
    document.querySelectorAll('.wallpaper-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  showWallpaperModal() {
    this.wallpaperGrid.innerHTML = '';
    this.wallpapers.forEach((wp, i) => {
      const item = document.createElement('div');
      item.className = 'wallpaper-item';
      if (i === this.currentWallpaperIndex) item.classList.add('active');
      item.style.backgroundImage = wp.preview;
      item.title = wp.name;
      item.addEventListener('click', () => this.setWallpaper(i));
      this.wallpaperGrid.appendChild(item);
    });
    this.wallpaperModal.classList.remove('hidden');
  }

  init() {
    // Create windows
    this.createWindow('windowWelcome', 'Welcome', `
      <div class="app-welcome">
        <h3>Welcome to Leaf OS 🍃</h3>
        <p>A beautiful neon-themed desktop experience with live wallpapers and smooth window management.</p>
        <ul style="margin-top: 16px; padding-left: 20px;">
          <li>Drag windows by their header</li>
          <li>Click minimize/maximize buttons</li>
          <li>Change wallpapers in Settings</li>
          <li>Everything is smooth and responsive</li>
        </ul>
      </div>
    `);

    this.createWindow('windowClock', 'Clock', `
      <div class="app-clock">
        <div class="big-clock">--:--:--</div>
        <div class="clock-date">Loading...</div>
      </div>
    `);

    this.createWindow('windowCalendar', 'Calendar', `
      <div class="app-calendar">
        <h3 class="calendar-month-header">Month</h3>
        <div class="calendar-grid"></div>
      </div>
    `);

    this.createWindow('windowNotes', 'Notes', `
      <div class="app-notes">
        <textarea placeholder="Write your notes..." style="
          width: 100%; 
          height: 200px; 
          background: rgba(255,255,255,0.05); 
          border: 1px solid var(--border); 
          border-radius: 8px; 
          color: var(--text); 
          padding: 8px; 
          resize: none; 
          font-family: monospace;
          font-size: 0.9rem;
        "></textarea>
      </div>
    `);

    this.createWindow('windowSettings', 'Settings', `
      <div class="app-settings">
        <h3>Display Settings</h3>
        <p style="margin: 12px 0; color: var(--muted); font-size: 0.9rem;">Select a live wallpaper theme:</p>
        <button id="changeWallpaper" style="
          padding: 10px 16px; 
          background: var(--accent); 
          color: var(--dark); 
          border: 0; 
          border-radius: 8px; 
          cursor: pointer; 
          font-weight: 600;
          transition: all 0.2s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          🎨 Change Wallpaper
        </button>
      </div>
    `);

    // Close modal button
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.wallpaperModal.classList.add('hidden');
      });
    }

    // Click outside modal to close
    this.wallpaperModal.addEventListener('click', (e) => {
      if (e.target === this.wallpaperModal) {
        this.wallpaperModal.classList.add('hidden');
      }
    });

    // Dock buttons
    document.querySelectorAll('.dock-icon').forEach(btn => {
      btn.addEventListener('click', () => {
        const appMap = {
          'welcome': 'windowWelcome',
          'clock': 'windowClock',
          'calendar': 'windowCalendar',
          'notes': 'windowNotes',
          'settings': 'windowSettings',
        };
        const windowId = appMap[btn.dataset.app];
        if (windowId) {
          const isVisible = !this.windows[windowId].element.classList.contains('hidden');
          if (isVisible && !this.windows[windowId].isMinimized) {
            this.minimizeWindow(windowId);
          } else {
            this.openWindow(windowId);
          }
        }
      });
    });

    // Wallpaper button
    const wallpaperBtn = document.getElementById('wallpaperBtn');
    if (wallpaperBtn) {
      wallpaperBtn.addEventListener('click', () => this.showWallpaperModal());
    }

    // Settings wallpaper button
    const changeWallpaperBtn = document.getElementById('changeWallpaper');
    if (changeWallpaperBtn) {
      changeWallpaperBtn.addEventListener('click', () => this.showWallpaperModal());
    }

    // Initialize wallpaper
    this.setWallpaper(0);

    // Start clock updates
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Close windows on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.wallpaperModal.classList.add('hidden');
      }
    });
  }
}

// Initialize when DOM is ready
const leafOS = new LeafOS();
document.addEventListener('DOMContentLoaded', () => {
  leafOS.boot();
});
