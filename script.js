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

/* =========================================
   PROJECTS CAROUSEL
   Arrow + Mouse Drag + Touch Swipe
========================================= */

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


  /* =========================================
     NUMBER OF VISIBLE CARDS
  ========================================= */

  function getVisibleCards() {

    if (window.innerWidth <= 650) {
      return 1;
    }

    if (window.innerWidth <= 900) {
      return 2;
    }

    return 3;
  }


  /* =========================================
     MAXIMUM POSITION
  ========================================= */

  function getMaxIndex() {

    const visibleCards = getVisibleCards();

    return Math.max(
      0,
      cards.length - visibleCards
    );
  }


  /* =========================================
     GET CARD MOVEMENT
  ========================================= */

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


  /* =========================================
     UPDATE CAROUSEL
  ========================================= */

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


    /* =========================================
       UPDATE ARROW STATES
    ========================================= */

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


  /* =========================================
     NEXT
  ========================================= */

  nextButton.addEventListener("click", () => {

    if (isDragging) return;

    const visibleCards =
      getVisibleCards();

    const maxIndex =
      getMaxIndex();


    /*
      Move by the number of visible cards.

      Example:

      6 projects
      [1 2 3] → [4 5 6]

      5 projects
      [1 2 3] → [3 4 5]
    */

    currentIndex = Math.min(
      currentIndex + visibleCards,
      maxIndex
    );


    updateCarousel(true);
  });


  /* =========================================
     PREVIOUS
  ========================================= */

  prevButton.addEventListener("click", () => {

    if (isDragging) return;


    const visibleCards =
      getVisibleCards();


    /*
      Move backwards by the number
      of visible cards.

      Example:

      [4 5 6] → [1 2 3]

      [3 4 5] → [1 2 3]
    */

    currentIndex = Math.max(
      currentIndex - visibleCards,
      0
    );


    updateCarousel(true);
  });


  /* =========================================
     POINTER DOWN
     Works for:
     - Mouse
     - Touch
     - Pen
  ========================================= */

  viewport.addEventListener(
    "pointerdown",
    (event) => {

      /*
        Don't start dragging when clicking
        directly on buttons/links.
      */

      if (
        event.target.closest("a") ||
        event.target.closest("button")
      ) {
        return;
      }


      isDragging = true;

      startX = event.clientX;

      currentX = startX;


      /*
        Get current transform position.
      */

      startTranslate =
        -currentIndex * getCardMovement();


      viewport.classList.add("dragging");


      /*
        Capture pointer so dragging
        continues outside the viewport.
      */

      viewport.setPointerCapture(
        event.pointerId
      );
    }
  );


  /* =========================================
     POINTER MOVE
  ========================================= */

  viewport.addEventListener(
    "pointermove",
    (event) => {

      if (!isDragging) return;


      currentX = event.clientX;


      const diff =
        currentX - startX;


      /*
        Add resistance when trying to
        drag beyond the beginning/end.
      */

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


      /*
        Disable transition while dragging.
      */

      track.style.transition = "none";


      track.style.transform =
        `translateX(${newTranslate}px)`;
    }
  );


  /* =========================================
     END DRAG
  ========================================= */

  function endDrag(event) {

    if (!isDragging) return;


    isDragging = false;

    viewport.classList.remove("dragging");


    /*
      Calculate how far the user dragged.
    */

    const diff =
      currentX - startX;


    const threshold = 60;


    /*
      Drag LEFT
      ↓
      Next projects
    */

    if (diff < -threshold) {

      currentIndex =
        Math.min(
          currentIndex + getVisibleCards(),
          getMaxIndex()
        );
    }


    /*
      Drag RIGHT
      ↓
      Previous projects
    */

    else if (diff > threshold) {

      currentIndex =
        Math.max(
          currentIndex - getVisibleCards(),
          0
        );
    }


    /*
      Snap to nearest valid position.
    */

    updateCarousel(true);


    /*
      Release pointer.
    */

    try {

      viewport.releasePointerCapture(
        event.pointerId
      );

    } catch (error) {
      // Pointer may already be released.
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
  const titlePrefix = document.getElementById("job-title-prefix");
  const titleAccent = document.getElementById("job-title-accent");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (titlePrefix && titleAccent) {
    const prefixText = "A Software";
    const accentText = "Developer";
    const fullText = prefixText + accentText;
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
