const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const modal = document.getElementById("registrationModal");
const modalClose = document.getElementById("modalClose");
const form = document.getElementById("registrationForm");
const formMessage = document.getElementById("formMessage");

window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 20));
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => navLinks.classList.remove("open")));

document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", (event) => {
  event.preventDefault();
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.querySelector("#registrationModal input")?.focus();
}));
function closeModal() { modal.classList.remove("show"); document.body.style.overflow = ""; }
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "Thanks! Your application has been received. We will contact you soon.";
  form.reset();
});

const observer = new IntersectionObserver((entries, currentObserver) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); currentObserver.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
