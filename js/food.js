(function () {
  const navItems = document.querySelectorAll(".food-nav-item");
  const sections = document.querySelectorAll(".food-detail[data-province]");
  const floatActions = document.getElementById("floatActions");

  if (!sections.length) return;

  function setActiveProvince(id) {
    navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.province === id);
    });
  }

  function updateFromHash() {
    const hash = location.hash.replace("#", "");
    if (hash && document.getElementById(hash)) {
      setActiveProvince(hash);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveProvince(entry.target.dataset.province);
        }
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      setActiveProvince(item.dataset.province);
    });
  });

  window.addEventListener("hashchange", updateFromHash);
  updateFromHash();

  if (floatActions) {
    window.addEventListener(
      "scroll",
      () => {
        floatActions.classList.toggle("visible", window.scrollY > 320);
      },
      { passive: true }
    );
  }
})();
