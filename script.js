function showComingSoon() {
  const modal = document.getElementById("coming-soon-modal");
  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function hideComingSoon() {
  const modal = document.getElementById("coming-soon-modal");
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("DOMContentLoaded", () => {

  const viewport =
    document.getElementById("projectsViewport");

  const track =
    document.getElementById("projectsTrack");

  const prevButton =
    document.getElementById("projectsPrev");

  const nextButton =
    document.getElementById("projectsNext");

  if (
    !viewport ||
    !track ||
    !prevButton ||
    !nextButton
  ) {
    return;
  }

  const cards = Array.from(
    track.querySelectorAll(".project-card")
  );

  function updateProjectMoreButtons() {
    cards.forEach((card, index) => {
      const description = card.querySelector(".project-desc");
      if (!description) return;

      if (!description.id) {
        description.id = `project-description-${index + 1}`;
      }

      let button = card.querySelector(".project-more");
      if (!button) {
        button = document.createElement("button");
        button.className = "project-more";
        button.type = "button";
        button.textContent = "View more";
        button.setAttribute("aria-expanded", "false");
        description.insertAdjacentElement("afterend", button);
      }

      button.setAttribute("aria-controls", description.id);

      const isExpanded = description.classList.contains("expanded");
      description.classList.remove("expanded");
      const hasOverflow = description.scrollHeight > description.clientHeight + 1;
      description.classList.toggle("expanded", isExpanded);
      button.hidden = !hasOverflow;
    });
  }

  updateProjectMoreButtons();
  window.addEventListener("resize", updateProjectMoreButtons);

  track.addEventListener("click", (event) => {
    const button = event.target.closest(".project-more");
    if (!button) return;

    const card = button.closest(".project-card");
    const description = document.getElementById(
      button.getAttribute("aria-controls")
    );
    if (!card || !description) return;

    if (card.classList.contains("is-expanded")) {
      card.classList.remove("is-expanded");
      description.classList.remove("expanded");
      button.setAttribute("aria-expanded", "false");
      button.textContent = "View more";
      track.style.removeProperty("--project-card-height");
      return;
    }

    const expandedCard = track.querySelector(".project-card.is-expanded");
    if (expandedCard) {
      expandedCard.classList.remove("is-expanded");
      expandedCard.querySelector(".project-desc").classList.remove("expanded");
      const expandedButton = expandedCard.querySelector(".project-more");
      expandedButton.setAttribute("aria-expanded", "false");
      expandedButton.textContent = "View more";
    } else {
      track.style.setProperty(
        "--project-card-height",
        `${cards[0].getBoundingClientRect().height}px`
      );
    }

    card.classList.add("is-expanded");
    description.classList.add("expanded");
    button.setAttribute("aria-expanded", "true");
    button.textContent = "View less";
  });


  let currentIndex = 0;

  let startX = 0;
  let currentX = 0;

  let isDragging = false;

  let startTranslate = 0;

  function getVisibleCards() {

    if (window.innerWidth <= 650) {
      return 1;
    }

    if (window.innerWidth <= 900) {
      return 2;
    }

    return 3;
  }

  function getMaxIndex() {

    const visibleCards = getVisibleCards();

    return Math.max(
      0,
      cards.length - visibleCards
    );
  }

  function getCardMovement() {

    if (!cards.length) {
      return 0;
    }

    const cardWidth =
      cards[0].getBoundingClientRect().width;

    const gap =
      parseFloat(
        window.getComputedStyle(track).gap
      ) || 0;

    return cardWidth + gap;
  }

  function updateCarousel(animate = true) {

    const maxIndex = getMaxIndex();

    currentIndex = Math.max(
      0,
      Math.min(currentIndex, maxIndex)
    );

    const movement =
      currentIndex * getCardMovement();

    if (!animate) {

      track.style.transition = "none";

    } else {

      track.style.transition =
        "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)";
    }


    track.style.transform =
      `translateX(-${movement}px)`;

    if (currentIndex <= 0) {

      prevButton.classList.add("disabled");

    } else {

      prevButton.classList.remove("disabled");
    }


    if (currentIndex >= maxIndex) {

      nextButton.classList.add("disabled");

    } else {

      nextButton.classList.remove("disabled");
    }
  }

  nextButton.addEventListener("click", () => {

    if (isDragging) return;

    const visibleCards =
      getVisibleCards();

    const maxIndex =
      getMaxIndex();

    currentIndex = Math.min(
      currentIndex + visibleCards,
      maxIndex
    );


    updateCarousel(true);
  });

  prevButton.addEventListener("click", () => {

    if (isDragging) return;


    const visibleCards =
      getVisibleCards();

    currentIndex = Math.max(
      currentIndex - visibleCards,
      0
    );


    updateCarousel(true);
  });

  viewport.addEventListener(
    "pointerdown",
    (event) => {

      if (
        event.target.closest("a") ||
        event.target.closest("button")
      ) {
        return;
      }

      isDragging = true;

      startX = event.clientX;

      currentX = startX;

      startTranslate =
        -currentIndex * getCardMovement();


      viewport.classList.add("dragging");

      viewport.setPointerCapture(
        event.pointerId
      );
    }
  );

  viewport.addEventListener(
    "pointermove",
    (event) => {

      if (!isDragging) return;

      currentX = event.clientX;

      const diff =
        currentX - startX;

      const maxTranslate =
        -(getMaxIndex() * getCardMovement());

      let newTranslate =
        startTranslate + diff;

      if (newTranslate > 0) {

        newTranslate =
          newTranslate * 0.35;

      }

      if (newTranslate < maxTranslate) {

        const extra =
          newTranslate - maxTranslate;

        newTranslate =
          maxTranslate + extra * 0.35;
      }

      track.style.transition = "none";


      track.style.transform =
        `translateX(${newTranslate}px)`;
    }
  );

  function endDrag(event) {

    if (!isDragging) return;


    isDragging = false;

    viewport.classList.remove("dragging");

    const diff =
      currentX - startX;


    const threshold = 60;

    if (diff < -threshold) {

      currentIndex =
        Math.min(
          currentIndex + getVisibleCards(),
          getMaxIndex()
        );
    }

    else if (diff > threshold) {

      currentIndex =
        Math.max(
          currentIndex - getVisibleCards(),
          0
        );
    }

    updateCarousel(true);

    try {

      viewport.releasePointerCapture(
        event.pointerId
      );

    } catch (error) {

    }
  }


  viewport.addEventListener(
    "pointerup",
    endDrag
  );


  viewport.addEventListener(
    "pointercancel",
    endDrag
  );


  viewport.addEventListener(
    "pointerleave",
    (event) => {

      /*
        Don't end the drag simply because
        the pointer temporarily leaves.
      */

      if (
        isDragging &&
        event.pointerType === "mouse"
      ) {
        return;
      }
    }
  );


  /* =========================================
     PREVENT IMAGE DRAGGING
  ========================================= */

  cards.forEach((card) => {

    const images =
      card.querySelectorAll("img");

    images.forEach((img) => {

      img.addEventListener(
        "dragstart",
        (event) => {
          event.preventDefault();
        }
      );

    });

  });


  /* =========================================
     WINDOW RESIZE
  ========================================= */

  window.addEventListener(
    "resize",
    () => {

      /*
        Recalculate because the number
        of visible cards can change.
      */

      currentIndex =
        Math.min(
          currentIndex,
          getMaxIndex()
        );


      updateCarousel(false);
    }
  );


  /* =========================================
     INITIAL STATE
  ========================================= */

  updateCarousel(false);

});

document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.getElementById("experienceViewport");
  const track = document.querySelector("#experience .experience-grid");
  const previousButton = document.getElementById("experiencePrev");
  const nextButton = document.getElementById("experienceNext");

  if (!viewport || !track || !previousButton || !nextButton) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".experience-card"));
  if (!cards.length) {
    return;
  }

  let currentIndex = 0;

  const getMovement = () => {
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };

  const getMaxIndex = () => {
    const movement = getMovement();
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const visibleCards = Math.max(
      1,
      Math.floor((viewport.clientWidth + gap) / movement)
    );
    return Math.max(0, cards.length - visibleCards);
  };

  const updateControls = () => {
    currentIndex = Math.max(
      0,
      Math.min(Math.round(viewport.scrollLeft / getMovement()), getMaxIndex())
    );
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === getMaxIndex();
  };

  const scrollToIndex = (index) => {
    currentIndex = Math.max(0, Math.min(index, getMaxIndex()));
    viewport.scrollTo({
      left: currentIndex * getMovement(),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    updateControls();
  };

  previousButton.addEventListener("click", () => {
    scrollToIndex(currentIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    scrollToIndex(currentIndex + 1);
  });

  viewport.addEventListener("scroll", updateControls, { passive: true });
  window.addEventListener("resize", updateControls);
  updateControls();
});

document.addEventListener("DOMContentLoaded", () => {
  const titlePrefix = document.getElementById("job-title-prefix");
  const titleAccent = document.getElementById("job-title-accent");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (titlePrefix && titleAccent) {
    const prefixText = "AI";
    const accentText = "Backend Developer";
    const fullText = prefixText + " " + accentText;
    const fixedCharacters = 2;

    if (reduceMotion) {
      titlePrefix.textContent = prefixText;
      titleAccent.textContent = accentText;
    } else {
      let visibleCharacters = fixedCharacters;
      let deleting = false;

      const updateTitle = () => {
        titlePrefix.textContent = prefixText.slice(0, visibleCharacters);
        titleAccent.textContent = visibleCharacters > prefixText.length
          ? accentText.slice(0, visibleCharacters - prefixText.length)
          : "";
      };

      const animateTitle = () => {
        if (deleting) {
          visibleCharacters = Math.max(fixedCharacters, visibleCharacters - 1);
          updateTitle();

          if (visibleCharacters === fixedCharacters) {
            deleting = false;
            window.setTimeout(animateTitle, 350);
          } else {
            window.setTimeout(animateTitle, 45);
          }
          return;
        }

        visibleCharacters += 1;
        updateTitle();

        if (visibleCharacters === fullText.length) {
          deleting = true;
          window.setTimeout(animateTitle, 1100);
        } else {
          window.setTimeout(animateTitle, 85);
        }
      };

      updateTitle();
      window.setTimeout(animateTitle, 85);
    }
  }
  
  // THEME TOGGLE (DARK/LIGHT MODE)
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  // Check local storage for saved theme
  const currentTheme = localStorage.getItem('theme');
  
  // Apply saved theme on load
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }

  // Toggle functionality
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    // Check if dark theme is currently active
    if (document.body.classList.contains('dark-theme')) {
      localStorage.setItem('theme', 'dark');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      localStorage.setItem('theme', 'light');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  });

  // --- MOBILE MENU TOGGLE ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navContainer = document.getElementById('nav-container');

  // Open/Close menu when clicking the 3 lines
  mobileMenuBtn.addEventListener('click', () => {
    navContainer.classList.toggle('active');
  });

  // Automatically close the menu when clicking any navigation link
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navContainer.classList.remove('active');
      navLinks.forEach(navLink => navLink.classList.remove("active"));
      link.classList.add("active");
    });
  });

  const sections = Array.from(document.querySelectorAll("#home, section[id]"));

  const updateActiveNavLink = () => {
    const headerOffset = 120;
    let currentSectionId = "home";

    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerOffset;
      if (window.scrollY >= sectionTop) {
        currentSectionId = section.id;
      }
    });

    navLinks.forEach(link => {
      const linkTarget = link.getAttribute("href");
      link.classList.toggle("active", linkTarget === `#${currentSectionId}`);
    });
  };

  updateActiveNavLink();
  window.addEventListener("scroll", updateActiveNavLink, { passive: true });

  const comingSoonModal = document.getElementById("coming-soon-modal");
  const comingSoonClose = document.getElementById("coming-soon-close");

  if (comingSoonClose) {
    comingSoonClose.addEventListener("click", hideComingSoon);
  }

  if (comingSoonModal) {
    comingSoonModal.addEventListener("click", (event) => {
      if (event.target === comingSoonModal) {
        hideComingSoon();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideComingSoon();
    }
  });
});

/* ===== Portfolio AI Chatbot: UI and voice input ===== */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("chatbot-toggle");
  const chatWindow = document.getElementById("chatbot-window");
  const closeButton = document.getElementById("chatbot-close");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const messages = document.getElementById("chatbot-messages");
  const micButton = document.getElementById("chatbot-mic");
  const suggestions = document.getElementById("chatbot-suggestions");

  if (
    !toggle || !chatWindow || !closeButton ||
    !form || !input || !messages || !micButton
  ) return;

  function openChat() {
    chatWindow.classList.add("is-open");
    chatWindow.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closeChat() {
    chatWindow.classList.remove("is-open");
    chatWindow.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (chatWindow.classList.contains("is-open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeButton.addEventListener("click", closeChat);

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      chatWindow.classList.contains("is-open")
    ) {
      closeChat();
    }
  });

  function addMessage(text, type) {
    const bubble = document.createElement("div");
    bubble.className = `chat-message ${type}-message`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  
async function sendMessage(text) {
  const message = text.trim();
  if (!message) return;

  openChat();
  addMessage(message, "user");
  input.value = "";

  const loadingBubble = document.createElement("div");
  loadingBubble.className = "chat-message bot-message"; 
  loadingBubble.textContent = "Thinking...";
  messages.appendChild(loadingBubble);
  messages.scrollTop = messages.scrollHeight;

  try {
    const response = await fetch(
      "https://gentle-water-4659.santhoshkumarnaikgp5678.workers.dev/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The AI service returned an error.");
    }

    loadingBubble.textContent =
      data.reply || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chatbot request failed:", error);

    loadingBubble.textContent =
      error.message === "Failed to fetch"
        ? "I couldn't connect to the AI service. Please try again."
        : error.message || "Something went wrong. Please try again.";
  }

  messages.scrollTop = messages.scrollHeight;
}


  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  if (suggestions) {
    suggestions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-question]");
      if (button) sendMessage(button.dataset.question);
    });
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micButton.title = "Voice input isn't supported by this browser";
    micButton.addEventListener("click", () => {
      addMessage(
        "Voice input isn't supported in this browser. Please type your question.",
        "bot"
      );
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  micButton.addEventListener("click", () => {
    try {
      recognition.start();
    } catch {
      // Prevent duplicate start errors if recognition is already running.
    }
  });

  recognition.addEventListener("start", () => {
    micButton.classList.add("is-listening");
    micButton.setAttribute("aria-label", "Listening");
  });

  recognition.addEventListener("result", (event) => {
    input.value = event.results[0][0].transcript;
    input.focus();
  });

  recognition.addEventListener("end", () => {
    micButton.classList.remove("is-listening");
    micButton.setAttribute("aria-label", "Speak your question");
  });

  recognition.addEventListener("error", (event) => {
    micButton.classList.remove("is-listening");

    if (event.error !== "no-speech" && event.error !== "aborted") {
      addMessage(
        "I couldn't access voice input. Check your browser's microphone permission, or type your question instead.",
        "bot"
      );
    }
  });
});
