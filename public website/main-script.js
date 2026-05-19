// --- 0. PAGE LOADER ---
(function() {
  const loader    = document.getElementById('pageLoader');
  const bar       = document.getElementById('loaderBar');
  const status    = document.getElementById('loaderStatus');
  const messages  = ['LOADING...', 'BOOTING UP...', 'CALIBRATING...', 'PRESS START!'];
  let progress    = 0;
  let msgIndex    = 0;

  const tick = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress > 100) progress = 100;
    bar.style.width = progress + '%';

    msgIndex = Math.floor((progress / 100) * (messages.length - 1));
    status.textContent = messages[msgIndex];

    if (progress >= 100) {
      clearInterval(tick);
      status.textContent = 'PRESS START!';
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 400);
    }
  }, 120);
})();

document.addEventListener('DOMContentLoaded', () => {

  
  // --- 1. Mobile Navigation Toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close nav when clicking a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });

  // --- 2. Navbar Scroll Effect ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- 3. Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  };
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
  
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- 4. Number Counter Animation ---
  const statNumbers = document.querySelectorAll('.stat-num');
  
  const counterCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'));
        let count = 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        
        const updateCount = () => {
          count += increment;
          if (count < target) {
            entry.target.innerText = Math.ceil(count);
            requestAnimationFrame(updateCount);
          } else {
            entry.target.innerText = target;
          }
        };
        
        updateCount();
        observer.unobserve(entry.target);
      }
    });
  };
  
  const counterObserver = new IntersectionObserver(counterCallback, { threshold: 0.5 });
  
  statNumbers.forEach(num => {
    counterObserver.observe(num);
  });

  // --- 5. Pixel Rain Background Effect ---
  const pixelRainContainer = document.getElementById('pixelRain');
  const createPixel = () => {
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');
    
    // Random position and properties
    pixel.style.left = Math.random() * 100 + 'vw';
    pixel.style.animationDuration = Math.random() * 3 + 2 + 's'; // 2s to 5s
    pixel.style.opacity = Math.random() * 0.5 + 0.1;
    
    // Sometimes use pink instead of blue
    if (Math.random() > 0.8) {
      pixel.style.backgroundColor = 'var(--neon-pink)';
      pixel.style.boxShadow = '0 0 10px var(--neon-pink)';
    }
    
    pixelRainContainer.appendChild(pixel);
    
    // Remove after animation completes to avoid memory leak
    setTimeout(() => {
      pixel.remove();
    }, 5000);
  };
  
  // Create a new pixel every 200ms
  setInterval(createPixel, 200);

  // --- 6. Booking & Membership Form Logic ---
  const bookingForm = document.getElementById('bookingForm');
  const membershipForm = document.getElementById('membershipForm');
  const successMsg = document.getElementById('bookingSuccess');
  
  const tabStationBtn = document.getElementById('tabStationBtn');
  const tabMembershipBtn = document.getElementById('tabMembershipBtn');

  // Set minimum date restrictions
  const dateInput = document.getElementById('bookingDate');
  const memDateInput = document.getElementById('memStartDate');
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];
  if (dateInput) dateInput.setAttribute('min', localISOTime);
  if (memDateInput) memDateInput.setAttribute('min', localISOTime);

  // Tab Switching Logic
  function switchTab(tab) {
    if (tab === 'station') {
      tabStationBtn.classList.add('active');
      tabMembershipBtn.classList.remove('active');
      bookingForm.style.display = 'block';
      membershipForm.style.display = 'none';
    } else if (tab === 'membership') {
      tabMembershipBtn.classList.add('active');
      tabStationBtn.classList.remove('active');
      membershipForm.style.display = 'block';
      bookingForm.style.display = 'none';
    }
    successMsg.style.display = 'none'; // hide success msg if switching
  }

  if (tabStationBtn && tabMembershipBtn) {
    tabStationBtn.addEventListener('click', () => switchTab('station'));
    tabMembershipBtn.addEventListener('click', () => switchTab('membership'));
  }

  // URL Parsing (e.g. #book?type=membership&tier=gold)
  function checkUrlParams() {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      if (params.get('type') === 'membership') {
        switchTab('membership');
        const tier = params.get('tier');
        const memTierSelect = document.getElementById('memTier');
        if (tier && memTierSelect) {
          // Capitalize first letter to match value exactly
          const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
          memTierSelect.value = formattedTier;
        }
      }
    }
  }
  checkUrlParams(); // Run on load
  window.addEventListener('hashchange', checkUrlParams); // Run when clicking Level Up buttons

  // Form Submit Handler
  function handleFormSubmit(form, submitBtn, subject) {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitText = submitBtn.querySelector('.submit-text');
      const submitLoading = submitBtn.querySelector('.submit-loading');
      
      submitText.style.display = 'none';
      submitLoading.style.display = 'inline';
      submitBtn.disabled = true;
      
      const istTimeField = form.querySelector('input[name="Submitted At (IST)"]');
      if (istTimeField) {
        const istOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        istTimeField.value = new Date().toLocaleString('en-US', istOptions) + ' (IST)';
      }
      
      const formData = new FormData(form);
      formData.append('_captcha', 'false');
      formData.append('_subject', subject);
      formData.append('_template', 'table');
      
      fetch('https://formsubmit.co/ajax/terminal8gamingcafe@gmail.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success === 'true' || data.success === true) {
          form.style.display = 'none';
          document.querySelector('.form-tabs').style.display = 'none';
          successMsg.style.display = 'flex';
        } else {
          console.error("FormSubmit Error:", data);
          alert("Something went wrong. Please ensure you have activated your email address with FormSubmit.");
        }
      })
      .catch((error) => {
        console.error('Error sending booking:', error);
        alert("Failed to send booking request. Please try again later.");
      })
      .finally(() => {
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
        submitBtn.disabled = false;
        form.reset();
      });
    });
  }

  handleFormSubmit(bookingForm, document.getElementById('submitBtn'), '🎮 New Station Booking - Terminal 8');
  handleFormSubmit(membershipForm, document.getElementById('memSubmitBtn'), '🏆 New Membership Request - Terminal 8');

  // --- 7. Dynamic Current Year ---
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

});

// --- 8. Reset Booking UI Function ---
window.resetBookingUI = function() {
  const successMsg = document.getElementById('bookingSuccess');
  const bookingForm = document.getElementById('bookingForm');
  const membershipForm = document.getElementById('membershipForm');
  const tabStationBtn = document.getElementById('tabStationBtn');
  const tabsContainer = document.querySelector('.form-tabs');
  
  if (successMsg) successMsg.style.display = 'none';
  if (tabsContainer) tabsContainer.style.display = 'flex';
  
  // Default to station form if they click back
  if (tabStationBtn && tabStationBtn.classList.contains('active')) {
    if (bookingForm) bookingForm.style.display = 'block';
  } else {
    if (membershipForm) membershipForm.style.display = 'block';
  }
};

// --- 9. Copy Coupon Code Function ---
// Exposed globally so inline onclick handlers can access it
window.copyCode = function(elementId) {
  const codeElement = document.getElementById(elementId);
  const codeText = codeElement.innerText;
  
  navigator.clipboard.writeText(codeText).then(() => {
    // Change button text temporarily to show success
    const btn = codeElement.nextElementSibling;
    const originalText = btn.innerText;
    btn.innerText = "COPIED!";
    btn.style.background = "var(--neon-green)";
    btn.style.color = "#000";
    
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = "#333";
      btn.style.color = "#fff";
    }, 2000);
  });
};

// --- 10. LEADERBOARD DYNAMIC FETCH & RENDER ---
(function() {
  const fetchLeaderboard = async () => {
    let apiUrl = '/api/leaderboard';
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
      apiUrl = 'http://localhost:3000/api/leaderboard';
    } else {
      apiUrl = 'https://shop.terminal8.live/api/leaderboard';
    }

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Network response was not ok');
      const players = await res.json();
      if (Array.isArray(players) && players.length > 0) {
        renderLeaderboard(players);
      }
    } catch (error) {
      console.log('Using static fallback for leaderboard due to connection block/offline:', error);
    }
  };

  const renderLeaderboard = (players) => {
    // Sort players by rank ascending
    players.sort((a, b) => a.rank - b.rank);

    // Populate Podium
    const p1 = players.find(p => p.rank === 1);
    const p2 = players.find(p => p.rank === 2);
    const p3 = players.find(p => p.rank === 3);

    if (p1) {
      document.getElementById('podium1GamerTag').textContent = p1.gamerTag;
      document.getElementById('podium1Game').textContent = `${p1.gameName} (${p1.platform})`;
      document.getElementById('podium1Score').textContent = p1.formattedScore;
      document.getElementById('podium1Platform').textContent = p1.platform.toUpperCase();
      document.getElementById('podium1Tag').textContent = p1.gamerTag.slice(0, 3).toUpperCase();
    }
    if (p2) {
      document.getElementById('podium2GamerTag').textContent = p2.gamerTag;
      document.getElementById('podium2Game').textContent = `${p2.gameName} (${p2.platform})`;
      document.getElementById('podium2Score').textContent = p2.formattedScore;
      document.getElementById('podium2Platform').textContent = p2.platform.toUpperCase();
      document.getElementById('podium2Tag').textContent = p2.gamerTag.slice(0, 3).toUpperCase();
    }
    if (p3) {
      document.getElementById('podium3GamerTag').textContent = p3.gamerTag;
      document.getElementById('podium3Game').textContent = `${p3.gameName} (${p3.platform})`;
      document.getElementById('podium3Score').textContent = p3.formattedScore;
      document.getElementById('podium3Platform').textContent = p3.platform.toUpperCase();
      document.getElementById('podium3Tag').textContent = p3.gamerTag.slice(0, 3).toUpperCase();
    }

    // Populate Table (Ranks 4+)
    const tableBody = document.getElementById('leaderboardRows');
    const tablePlayers = players.filter(p => p.rank >= 4);

    if (tablePlayers.length > 0 && tableBody) {
      tableBody.innerHTML = '';
      tablePlayers.forEach(p => {
        const tr = document.createElement('tr');
        
        // Define tags
        const platformClass = p.platform.toLowerCase().includes('sim') ? 'sim-tag' : 'ps5-tag';
        const rankColor = p.rank === 4 ? 'style="color: var(--neon-pink);"' : '';

        tr.innerHTML = `
          <td class="col-rank" ${rankColor}>#${p.rank}</td>
          <td class="col-player">
            <span class="gamer-handle">${p.gamerTag}</span>
            <span class="real-name">${p.playerName}</span>
          </td>
          <td class="col-game">${p.gameName}</td>
          <td class="col-platform"><span class="plat-tag ${platformClass}">${p.platform.toUpperCase()}</span></td>
          <td class="col-score font-mono">${p.formattedScore}</td>
        `;
        tableBody.appendChild(tr);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', fetchLeaderboard);
})();

