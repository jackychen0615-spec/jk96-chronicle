// Scroll reveal
const revealEls = document.querySelectorAll('.chapter-content, .door-container');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// Timeline nav active state
const chapters = document.querySelectorAll('.chapter');
const dots = document.querySelectorAll('.timeline-dot');

const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      dots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('href') === `#${id}`) {
          dot.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.5 });

chapters.forEach(c => chapterObserver.observe(c));
