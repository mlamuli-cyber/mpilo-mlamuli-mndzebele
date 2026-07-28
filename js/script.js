// ===================================================================
// Mobile menu toggle
// ===================================================================
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

menuToggle.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('#mobileNav a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===================================================================
// Scroll progress bar
// ===================================================================
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}

// ===================================================================
// Back to top button
// ===================================================================
const toTop = document.getElementById('toTop');
function updateToTop(){
  if (window.scrollY > 600) toTop.classList.add('show');
  else toTop.classList.remove('show');
}
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('scroll', () => {
  updateScrollProgress();
  updateToTop();
}, { passive: true });
updateScrollProgress();
updateToTop();

// ===================================================================
// Scrollspy — highlight active nav route based on visible section
// ===================================================================
const sections = document.querySelectorAll('main section[id]');
const routeLinks = document.querySelectorAll('.route[data-route]');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = entry.target.getAttribute('id');
      routeLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach(section => spyObserver.observe(section));

// ===================================================================
// Scroll reveal animations
// ===================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('in-view'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));
}

// ===================================================================
// Hero terminal typewriter effect
// ===================================================================
function typeLines(){
  const lines = document.querySelectorAll('.type-line');

  if (prefersReducedMotion){
    lines.forEach(line => { line.textContent = line.dataset.text; });
    return;
  }

  let lineIndex = 0;

  function typeNextLine(){
    if (lineIndex >= lines.length) return;
    const line = lines[lineIndex];
    const text = line.dataset.text;
    let charIndex = 0;

    const interval = setInterval(() => {
      line.textContent = text.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex >= text.length){
        clearInterval(interval);
        lineIndex++;
        setTimeout(typeNextLine, 220);
      }
    }, 18);
  }

  // Slight delay so it starts after page load settles
  setTimeout(typeNextLine, 500);
}
typeLines();

// ===================================================================
// Footer year
// ===================================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ===================================================================
// Contact form
// ===================================================================
// To make this form actually send emails:
// 1. Create a free form endpoint at https://formspree.io (or similar service)
// 2. Set the <form> "action" attribute in index.html to your endpoint URL
// 3. This script will then submit to it via fetch and show a success message
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  const formAction = contactForm.getAttribute('action');
  const formData = new FormData(contactForm);

  if (!formAction) {
    // No endpoint configured yet — fall back to opening the user's email client
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const subject = encodeURIComponent('Portfolio contact from ' + name);
    const body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = `mailto:youremail@example.com?subject=${subject}&body=${body}`;
    formStatus.textContent = 'Opening your email client… (connect a form endpoint to send directly — see README)';
    return;
  }

  try {
    const response = await fetch(formAction, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      formStatus.textContent = 'Message sent — thank you! I\'ll get back to you soon.';
      formStatus.classList.add('ok');
      contactForm.reset();
    } else {
      formStatus.textContent = 'Something went wrong. Please try emailing me directly.';
      formStatus.classList.add('err');
    }
  } catch (err) {
    formStatus.textContent = 'Network error — please try emailing me directly.';
    formStatus.classList.add('err');
  }
});

// ===================================================================
// TESTIMONIALS — infinite sideways marquee
// ===================================================================
(() => {
  const track = document.getElementById('testimonialTrack');
  if (!track) return;

  // Duplicate the card set once so the CSS animation (translateX -50%) loops seamlessly.
  const originalCards = Array.from(track.children);
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('inert', '');
    track.appendChild(clone);
  });

  // Pause the marquee on keyboard focus so keyboard users aren't chasing a moving target.
  track.addEventListener('focusin', () => track.classList.add('is-paused'));
  track.addEventListener('focusout', () => track.classList.remove('is-paused'));

  // Pause on touch (mobile hover doesn't exist) while the user is reading/dragging.
  const marquee = document.getElementById('testimonialMarquee');
  if (marquee) {
    marquee.addEventListener('touchstart', () => track.classList.add('is-paused'), { passive: true });
    marquee.addEventListener('touchend', () => {
      setTimeout(() => track.classList.remove('is-paused'), 1500);
    }, { passive: true });
  }
})();
