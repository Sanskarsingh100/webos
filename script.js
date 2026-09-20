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
        type: 'still',
        url: 'assets/wallpapers/leaf-green.html',
        preview: 'linear-gradient(180deg, #0a2f1d 0%, #103c2d 35%, #071a14 100%)',
      },
      {
        name: 'Deep Forest',
        type: 'still',
        url: 'assets/wallpapers/deep-forest.html',
        preview: 'linear-gradient(180deg, #07130d 0%, #0d261b 35%, #040d09 100%)',
      },
      {
        name: 'Neon Blue',
        type: 'still',
        url: 'assets/wallpapers/neon-blue.html',
        preview: 'linear-gradient(180deg, #0a1d30 0%, #12364d 38%, #071611 100%)',
      },
      {
        name: 'Ocean Glow',
        type: 'still',
        url: 'assets/wallpapers/ocean-glow.html',
        preview: 'linear-gradient(180deg, #031a25 0%, #0a2c39 42%, #061915 100%)',
      },
    ];

    this.wallpaperFilter = 'all';
    const savedWallpaper = Number(localStorage.getItem('leafos-wallpaper'));
    this.currentWallpaperIndex = Number.isInteger(savedWallpaper)
      && savedWallpaper >= 0
      && savedWallpaper < this.wallpapers.length
      ? savedWallpaper
      : 0;
    this.nextZIndex = 1000;
    this.draggedWindow = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragListenersBound = false;
    this.browserHome = 'assets/browser/home.html';
    this.browserHistory = [];
    this.browserHistoryIndex = -1;
    this.browserCurrentUrl = this.browserHome;
    this.browserPins = [];
  }

  getStartupLayout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const topOffset = 80;
    const bottomReserve = 100;
    const areaH = vh - topOffset - bottomReserve;

    const welcomeW = 400;
    const sideW = 300;
    const gap = 28;
    const welcomeH = 280;
    const sideH = 260;

    const welcomeX = Math.round((vw - welcomeW) / 2);
    const welcomeY = Math.round(topOffset + Math.max(16, (areaH - welcomeH) / 2));

    const clockX = Math.max(16, welcomeX - sideW - gap);
    const calendarX = Math.min(vw - sideW - 16, welcomeX + welcomeW + gap);
    const sideY = Math.round(topOffset + Math.max(16, (areaH - sideH) / 2));

    const canFitSides = vw >= 1040;

    return {
      canFitSides,
      welcome: { x: welcomeX, y: welcomeY, width: `${welcomeW}px` },
      clock: { x: clockX, y: sideY, width: `${sideW}px` },
      calendar: { x: calendarX, y: sideY, width: `${sideW}px` },
    };
  }

  async boot() {
    const messages = [
      'Starting desktop...',
      'Loading shell...',
      'Mounting wallpaper...',
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

  createWindow(id, title, content, options = {}) {
    const {
      position = null,
      width = '360px',
      height = 'auto',
      hidden = false,
      bodyClass = '',
    } = options;

    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = id;
    windowEl.dataset.windowId = id;

    let offsetX;
    let offsetY;
    if (position) {
      offsetX = position.x;
      offsetY = position.y;
    } else {
      offsetX = 60 + Math.random() * 300;
      offsetY = 100 + Math.random() * 200;
    }

    windowEl.style.left = `${offsetX}px`;
    windowEl.style.top = `${offsetY}px`;
    windowEl.style.width = width;
    if (height !== 'auto') {
      windowEl.style.height = height;
    }
    windowEl.style.zIndex = this.nextZIndex++;

    if (hidden) {
      windowEl.classList.add('hidden');
    }

    windowEl.innerHTML = `
      <div class="window-header" data-header="${id}">
        <div class="window-title">${title}</div>
        <div class="window-buttons">
          <button class="window-btn minimize-btn" data-action="minimize" title="Minimize">−</button>
          <button class="window-btn maximize-btn" data-action="maximize" title="Maximize">□</button>
          <button class="window-btn close-btn" data-action="close" title="Close">×</button>
        </div>
      </div>
      <div class="window-body${bodyClass ? ` ${bodyClass}` : ''}">
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
        width,
        height,
      },
    };

    this.setupWindowDrag(windowEl);
    this.setupWindowButtons(windowEl, id);

    if (!hidden) {
      this.windowStack.push(id);
      windowEl.classList.add('fade-in');
      setTimeout(() => windowEl.classList.remove('fade-in'), 300);
    }

    return windowEl;
  }

  bindGlobalDragListeners() {
    if (this.dragListenersBound) return;
    this.dragListenersBound = true;

    document.addEventListener('pointermove', (e) => {
      if (!this.draggedWindow) return;

      const x = e.clientX - this.dragOffset.x;
      const y = e.clientY - this.dragOffset.y;
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 50;
      const minX = -280;
      const minY = 0;

      this.draggedWindow.style.left = `${Math.max(minX, Math.min(maxX, x))}px`;
      this.draggedWindow.style.top = `${Math.max(minY, Math.min(maxY, y))}px`;
    });

    document.addEventListener('pointerup', () => {
      if (!this.draggedWindow) return;
      this.draggedWindow.classList.remove('dragging');
      this.draggedWindow = null;
    });
  }

  setupWindowDrag(windowEl) {
    this.bindGlobalDragListeners();
    const header = windowEl.querySelector('.window-header');

    header.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.window-btn')) return;

      const win = this.windows[windowEl.id];
      if (win?.isMaximized) return;

      this.draggedWindow = windowEl;
      const rect = windowEl.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      this.bringWindowToFront(windowEl.id);
      header.setPointerCapture(e.pointerId);
      windowEl.classList.add('dragging');
    });
  }

  setupWindowButtons(windowEl, id) {
    const closeBtn = windowEl.querySelector('[data-action="close"]');
    const minimizeBtn = windowEl.querySelector('[data-action="minimize"]');
    const maximizeBtn = windowEl.querySelector('[data-action="maximize"]');

    closeBtn?.addEventListener('click', () => this.closeWindow(id));
    minimizeBtn?.addEventListener('click', () => this.minimizeWindow(id));
    maximizeBtn?.addEventListener('click', () => this.maximizeWindow(id));

    windowEl.addEventListener('pointerdown', () => this.bringWindowToFront(id));
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
    if (!windowData) return;

    windowData.element.classList.remove('hidden', 'minimized');
    windowData.isMinimized = false;

    if (!this.windowStack.includes(id)) {
      this.windowStack.push(id);
    }

    windowData.element.classList.add('fade-in');
    setTimeout(() => windowData.element.classList.remove('fade-in'), 300);
    this.bringWindowToFront(id);
  }

  closeWindow(id) {
    const windowData = this.windows[id];
    if (!windowData) return;

    windowData.element.classList.add('slide-out');
    setTimeout(() => {
      windowData.element.classList.add('hidden');
      windowData.element.classList.remove('slide-out', 'minimized');
      windowData.isMinimized = false;
      this.windowStack = this.windowStack.filter((w) => w !== id);
    }, 300);
  }

  minimizeWindow(id) {
    const windowData = this.windows[id];
    if (!windowData || windowData.element.classList.contains('hidden')) return;

    windowData.element.classList.add('minimized');
    windowData.isMinimized = true;
  }

  maximizeWindow(id) {
    const windowData = this.windows[id];
    if (!windowData) return;

    const element = windowData.element;

    if (windowData.isMaximized) {
      element.style.left = `${windowData.originalState.left}px`;
      element.style.top = `${windowData.originalState.top}px`;
      element.style.width = windowData.originalState.width;
      element.style.height = windowData.originalState.height;
      element.classList.remove('maximized');
      windowData.isMaximized = false;
    } else {
      windowData.originalState.left = parseInt(element.style.left, 10) || 0;
      windowData.originalState.top = parseInt(element.style.top, 10) || 0;
      windowData.originalState.width = element.style.width || '360px';
      windowData.originalState.height = element.style.height || 'auto';

      element.style.left = '0px';
      element.style.top = '60px';
      element.style.width = '100%';
      element.style.height = 'calc(100vh - 110px)';
      element.classList.remove('minimized');
      element.classList.add('maximized');
      windowData.isMinimized = false;
      windowData.isMaximized = true;
    }

    this.bringWindowToFront(id);
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
    if (index < 0 || index >= this.wallpapers.length) return;

    this.currentWallpaperIndex = index;
    const wallpaper = this.wallpapers[index];
    localStorage.setItem('leafos-wallpaper', String(index));

    this.wallpaperEl.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = wallpaper.url;
    iframe.title = `${wallpaper.name} wallpaper`;
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

    document.querySelectorAll('.wallpaper-item').forEach((item) => {
      const itemIndex = Number(item.dataset.index);
      item.classList.toggle('active', itemIndex === index);
    });

    const label = document.getElementById('currentWallpaperLabel');
    if (label) {
      label.textContent = `${wallpaper.name} · ${wallpaper.type}`;
    }
  }

  renderWallpaperGrid(container, filter = 'all') {
    if (!container) return;
    container.innerHTML = '';

    this.wallpapers.forEach((wp, i) => {
      if (filter !== 'all' && wp.type !== filter) return;

      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'wallpaper-item';
      item.dataset.index = String(i);
      if (i === this.currentWallpaperIndex) item.classList.add('active');
      item.style.backgroundImage = wp.preview;
      item.title = wp.name;
      item.innerHTML = `
        <span class="wallpaper-badge">${wp.type}</span>
        <span class="wallpaper-name">${wp.name}</span>
      `;
      item.addEventListener('click', () => this.setWallpaper(i));
      container.appendChild(item);
    });
  }

  showWallpaperModal(filter = this.wallpaperFilter) {
    this.wallpaperFilter = filter;
    this.renderWallpaperGrid(this.wallpaperGrid, filter);

    document.querySelectorAll('[data-wallpaper-filter]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.wallpaperFilter === filter);
    });

    this.wallpaperModal.classList.remove('hidden');
  }

  cycleWallpaper(step = 1) {
    const next = (this.currentWallpaperIndex + step + this.wallpapers.length) % this.wallpapers.length;
    this.setWallpaper(next);
  }

  normalizeBrowserUrl(input) {
    const raw = (input || '').trim();
    if (!raw) return this.browserHome;

    if (
      raw.startsWith('assets/') ||
      raw.startsWith('./') ||
      raw.startsWith('/') ||
      raw.startsWith('file:')
    ) {
      return raw;
    }

    if (/^https?:\/\//i.test(raw)) {
      return this.toEmbeddableUrl(raw);
    }

    if (raw.includes(' ') || !raw.includes('.')) {
      return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(raw)}`;
    }

    return this.toEmbeddableUrl(`https://${raw}`);
  }

  toEmbeddableUrl(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');

      if (host === 'google.com' || host.endsWith('.google.com')) {
        if (!parsed.searchParams.has('igu')) {
          parsed.searchParams.set('igu', '1');
        }
        if (parsed.pathname === '/' || parsed.pathname === '') {
          parsed.pathname = '/webhp';
        }
        return parsed.toString();
      }

      if (host === 'duckduckgo.com' && parsed.pathname === '/') {
        return 'https://html.duckduckgo.com/html/';
      }
    } catch (_) {
      return url;
    }

    return url;
  }

  updateBrowserChrome() {
    const backBtn = document.getElementById('browserBack');
    const forwardBtn = document.getElementById('browserForward');
    const urlInput = document.getElementById('browserUrl');
    const status = document.getElementById('browserStatus');

    if (backBtn) backBtn.disabled = this.browserHistoryIndex <= 0;
    if (forwardBtn) {
      forwardBtn.disabled = this.browserHistoryIndex >= this.browserHistory.length - 1;
    }
    if (urlInput && document.activeElement !== urlInput) {
      urlInput.value = this.browserCurrentUrl;
    }
    if (status) {
      const mode = this.browserCurrentUrl.startsWith('http')
        ? 'Loaded in Leaf Browser'
        : 'Local start page';
      status.textContent = mode;
    }
  }

  showBrowserFallback(show) {
    const fallback = document.getElementById('browserFallback');
    if (!fallback) return;
    fallback.classList.toggle('visible', Boolean(show));
  }

  navigateBrowser(url, { push = true } = {}) {
    const nextUrl = this.normalizeBrowserUrl(url);
    const frame = document.getElementById('browserFrame');
    if (!frame) return;

    this.browserCurrentUrl = nextUrl;
    this.showBrowserFallback(false);

    if (push) {
      this.browserHistory = this.browserHistory.slice(0, this.browserHistoryIndex + 1);
      this.browserHistory.push(nextUrl);
      this.browserHistoryIndex = this.browserHistory.length - 1;
    }

    const status = document.getElementById('browserStatus');
    if (status) status.textContent = 'Loading in Leaf Browser…';

    frame.src = nextUrl;
    this.updateBrowserChrome();

    if (/^https?:\/\//i.test(nextUrl)) {
      window.clearTimeout(this.browserFallbackTimer);
      this.browserFallbackTimer = window.setTimeout(() => {
        if (this.browserCurrentUrl !== nextUrl) return;
        if (status) {
          status.textContent = 'Loaded in Leaf Browser · if blank, use Open in browser';
        }
      }, 2800);
    }
  }

  openInSystemBrowser(url = this.browserCurrentUrl) {
    const target = this.normalizeBrowserUrl(url);

    if (/^https?:\/\//i.test(target)) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const absolute = new URL(target, window.location.href).href;
      window.open(absolute, '_blank', 'noopener,noreferrer');
    } catch (_) {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  }

  openPinnedSite(pin) {
    if (!pin?.url && !pin?.embedUrl) return;
    this.navigateBrowser(pin.embedUrl || pin.url);
  }

  async renderBrowserPins() {
    const pinsEl = document.getElementById('browserPins');
    if (!pinsEl) return;

    try {
      const res = await fetch('assets/browser/pins.json');
      const pins = await res.json();
      this.browserPins = pins;
      pinsEl.innerHTML = '';

      pins.forEach((pin) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'browser-pin';
        btn.title = `${pin.name} · ${pin.host}`;
        btn.innerHTML = `
          <img class="browser-pin-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(pin.host)}&sz=64" alt="" loading="lazy" />
          <span>${pin.name}</span>
        `;
        btn.addEventListener('click', () => this.openPinnedSite(pin));
        pinsEl.appendChild(btn);
      });
    } catch (_) {
      pinsEl.innerHTML = '<span class="browser-pins-empty">Pins unavailable</span>';
    }
  }

  setupBrowserApp() {
    const form = document.getElementById('browserUrlForm');
    const urlInput = document.getElementById('browserUrl');
    const backBtn = document.getElementById('browserBack');
    const forwardBtn = document.getElementById('browserForward');
    const reloadBtn = document.getElementById('browserReload');
    const homeBtn = document.getElementById('browserHome');
    const externalBtn = document.getElementById('browserExternal');
    const fallbackOpen = document.getElementById('browserFallbackOpen');
    const frame = document.getElementById('browserFrame');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.navigateBrowser(urlInput.value);
    });

    backBtn?.addEventListener('click', () => {
      if (this.browserHistoryIndex <= 0) return;
      this.browserHistoryIndex -= 1;
      this.navigateBrowser(this.browserHistory[this.browserHistoryIndex], { push: false });
    });

    forwardBtn?.addEventListener('click', () => {
      if (this.browserHistoryIndex >= this.browserHistory.length - 1) return;
      this.browserHistoryIndex += 1;
      this.navigateBrowser(this.browserHistory[this.browserHistoryIndex], { push: false });
    });

    reloadBtn?.addEventListener('click', () => {
      if (!frame) return;
      frame.src = this.browserCurrentUrl;
    });

    homeBtn?.addEventListener('click', () => {
      this.navigateBrowser(this.browserHome);
    });

    externalBtn?.addEventListener('click', () => {
      this.openInSystemBrowser();
    });

    fallbackOpen?.addEventListener('click', () => {
      this.openInSystemBrowser();
      this.showBrowserFallback(false);
    });

    frame?.addEventListener('load', () => {
      this.updateBrowserChrome();
    });

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || !data.url) return;

      if (
        data.type === 'leaf-browser-navigate' ||
        data.type === 'leaf-browser-open-external'
      ) {
        this.navigateBrowser(data.url);
      }
    });

    this.browserHistory = [this.browserHome];
    this.browserHistoryIndex = 0;
    this.browserCurrentUrl = this.browserHome;
    if (frame) frame.src = this.browserHome;
    this.updateBrowserChrome();
    this.renderBrowserPins();
  }

  init() {
    const layout = this.getStartupLayout();

    this.createWindow('windowWelcome', 'Welcome', `
      <div class="app-welcome">
        <h3>Welcome to Leaf OS</h3>
        <p>A small desktop shell with live wallpapers and simple window controls.</p>
        <ul>
          <li>Drag a window from its title bar</li>
          <li>Use minimize, maximize, and close</li>
          <li>Open Browser from the dock to visit real sites</li>
          <li>Change the wallpaper in Settings</li>
        </ul>
      </div>
    `, {
      position: layout.welcome,
      width: layout.welcome.width,
    });

    this.createWindow('windowClock', 'Clock', `
      <div class="app-clock">
        <div class="big-clock">--:--:--</div>
        <div class="clock-date">Loading...</div>
      </div>
    `, {
      position: layout.clock,
      width: layout.clock.width,
      hidden: !layout.canFitSides,
    });

    this.createWindow('windowCalendar', 'Calendar', `
      <div class="app-calendar">
        <h3 class="calendar-month-header">Month</h3>
        <div class="calendar-grid"></div>
      </div>
    `, {
      position: layout.calendar,
      width: layout.calendar.width,
      hidden: !layout.canFitSides,
    });

    this.createWindow('windowNotes', 'Notes', `
      <div class="app-notes">
        <textarea class="notes-editor" placeholder="Write a note..."></textarea>
      </div>
    `, {
      position: { x: 120, y: 140 },
      hidden: true,
    });

    this.createWindow('windowBrowser', 'Browser', `
      <div class="app-browser">
        <div class="browser-toolbar">
          <div class="browser-nav">
            <button type="button" class="browser-btn" id="browserBack" title="Back" aria-label="Back">
              <span class="icon icon-back"></span>
            </button>
            <button type="button" class="browser-btn" id="browserForward" title="Forward" aria-label="Forward">
              <span class="icon icon-forward"></span>
            </button>
            <button type="button" class="browser-btn" id="browserReload" title="Reload" aria-label="Reload">
              <span class="icon icon-reload"></span>
            </button>
            <button type="button" class="browser-btn" id="browserHome" title="Home" aria-label="Home">
              <span class="icon icon-home"></span>
            </button>
          </div>
          <form class="browser-url-form" id="browserUrlForm">
            <input class="browser-url" id="browserUrl" type="text" spellcheck="false" placeholder="Search or enter address" />
          </form>
          <button type="button" class="browser-btn browser-btn-external" id="browserExternal" title="Open in system browser">
            <span class="icon icon-external"></span>
            <span>Open in browser</span>
          </button>
        </div>
        <div class="browser-pins" id="browserPins" aria-label="Pinned sites"></div>
        <div class="browser-stage">
          <iframe class="browser-frame" id="browserFrame" title="Leaf Browser" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>
          <div class="browser-fallback" id="browserFallback">
            <div>
              <h4>Open in your real browser</h4>
              <p>This site blocks embedded viewing. Leaf Browser can still hand the same URL to Chrome, Edge, or Firefox.</p>
              <button type="button" class="btn-primary" id="browserFallbackOpen">Open in system browser</button>
            </div>
          </div>
        </div>
        <div class="browser-status" id="browserStatus">Ready</div>
      </div>
    `, {
      position: { x: 90, y: 88 },
      width: '760px',
      height: '520px',
      hidden: true,
    });

    this.createWindow('windowSettings', 'Settings', `
      <div class="app-settings">
        <h3>Background</h3>
        <p>Current: <span id="currentWallpaperLabel">—</span></p>
        <div class="settings-wallpaper-actions">
          <button type="button" class="btn-secondary" id="prevWallpaper">Previous</button>
          <button type="button" class="btn-secondary" id="nextWallpaper">Next</button>
          <button type="button" class="btn-primary" id="changeWallpaper">Browse all</button>
        </div>
        <div class="settings-section-label">Quick pick</div>
        <div class="wallpaper-grid wallpaper-grid-compact" id="settingsWallpaperGrid"></div>
      </div>
    `, {
      position: { x: 120, y: 100 },
      width: '420px',
      height: '520px',
      hidden: true,
    });

    this.setupBrowserApp();

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
    document.querySelectorAll('.dock-icon').forEach((btn) => {
      btn.addEventListener('click', () => {
        const appMap = {
          welcome: 'windowWelcome',
          browser: 'windowBrowser',
          clock: 'windowClock',
          calendar: 'windowCalendar',
          notes: 'windowNotes',
          settings: 'windowSettings',
        };
        const windowId = appMap[btn.dataset.app];
        if (!windowId || !this.windows[windowId]) return;

        const win = this.windows[windowId];
        const isHidden = win.element.classList.contains('hidden');
        const isMinimized = win.isMinimized;

        if (!isHidden && !isMinimized) {
          this.minimizeWindow(windowId);
        } else {
          this.openWindow(windowId);
        }
      });
    });

    // Wallpaper controls
    const wallpaperBtn = document.getElementById('wallpaperBtn');
    if (wallpaperBtn) {
      wallpaperBtn.addEventListener('click', () => this.showWallpaperModal('all'));
    }

    const changeWallpaperBtn = document.getElementById('changeWallpaper');
    if (changeWallpaperBtn) {
      changeWallpaperBtn.addEventListener('click', () => this.showWallpaperModal('all'));
    }

    document.getElementById('prevWallpaper')?.addEventListener('click', () => this.cycleWallpaper(-1));
    document.getElementById('nextWallpaper')?.addEventListener('click', () => this.cycleWallpaper(1));

    document.querySelectorAll('[data-wallpaper-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.showWallpaperModal(btn.dataset.wallpaperFilter);
      });
    });

    this.renderWallpaperGrid(document.getElementById('settingsWallpaperGrid'), 'all');

    // Initialize wallpaper
    this.setWallpaper(this.currentWallpaperIndex);

    // Start clock updates
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Close windows on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.wallpaperModal.classList.add('hidden');
      }
    });

    // Keep startup trio aligned if the browser is resized before the user moves them
    window.addEventListener('resize', () => {
      const next = this.getStartupLayout();
      const keepLayout = ['windowWelcome', 'windowClock', 'windowCalendar'];

      const positions = {
        windowWelcome: next.welcome,
        windowClock: next.clock,
        windowCalendar: next.calendar,
      };

      keepLayout.forEach((id) => {
        const win = this.windows[id];
        if (!win || win.isMaximized || win.element.classList.contains('hidden')) return;
        if (win.element.classList.contains('dragging')) return;

        const pos = positions[id];
        if (!pos) return;

        // Only auto-reposition windows that still sit near their original startup spot
        const left = parseInt(win.element.style.left, 10);
        const top = parseInt(win.element.style.top, 10);
        const nearOriginal =
          Math.abs(left - win.originalState.left) < 40 &&
          Math.abs(top - win.originalState.top) < 40;

        if (!nearOriginal) return;

        win.element.style.left = `${pos.x}px`;
        win.element.style.top = `${pos.y}px`;
        win.element.style.width = pos.width;
        win.originalState.left = pos.x;
        win.originalState.top = pos.y;
        win.originalState.width = pos.width;
      });
    });
  }
}

// Initialize when DOM is ready
const leafOS = new LeafOS();
const leafMusic = typeof LeafMusicPlayer === 'function' ? new LeafMusicPlayer() : null;
document.addEventListener('DOMContentLoaded', () => {
  leafOS.boot();
  leafMusic?.init();
});
