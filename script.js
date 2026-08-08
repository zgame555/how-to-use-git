(() => {
  const progress = document.querySelector('[data-progress]');
  const toast = document.querySelector('[data-toast]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const tocLinks = [...document.querySelectorAll('.toc a')];
  const sections = tocLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
  };

  const updateActiveToc = () => {
    const current = sections.reduce((active, section) => {
      if (section.getBoundingClientRect().top <= 150) return section.id;
      return active;
    }, sections[0]?.id);
    tocLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  window.addEventListener('scroll', () => {
    updateProgress();
    updateActiveToc();
  }, { passive: true });
  updateProgress();
  updateActiveToc();

  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        button.textContent = 'copied';
        button.classList.add('copied');
        showToast('คัดลอกคำสั่งแล้ว');
        setTimeout(() => {
          button.textContent = 'copy';
          button.classList.remove('copied');
        }, 1500);
      } catch {
        showToast('คัดลอกไม่สำเร็จ — ลองเลือกข้อความเอง');
      }
    });
  });

  const savedTheme = localStorage.getItem('git-guide-theme');
  if (savedTheme === 'night') document.body.classList.add('night');
  document.documentElement.style.colorScheme = savedTheme === 'night' ? 'dark' : 'light';
  themeToggle?.addEventListener('click', () => {
    const isNight = document.body.classList.toggle('night');
    localStorage.setItem('git-guide-theme', isNight ? 'night' : 'day');
    document.documentElement.style.colorScheme = isNight ? 'dark' : 'light';
    themeToggle.querySelector('.theme-label').textContent = isNight ? 'โหมดกลางวัน' : 'โหมดกลางคืน';
  });
  if (document.body.classList.contains('night') && themeToggle) themeToggle.querySelector('.theme-label').textContent = 'โหมดกลางวัน';
})();
