(function () {
  // 通用浮动导航：滚动一定距离后显示"返回顶部/返回首页"按钮
  const floatActions = document.getElementById("floatActions");
  if (!floatActions) return;

  window.addEventListener(
    "scroll",
    () => {
      floatActions.classList.toggle("visible", window.scrollY > 320);
    },
    { passive: true }
  );
})();
