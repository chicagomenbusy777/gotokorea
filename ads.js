/* ==========================================================
   ads.js — optional Google AdSense loader.
   Does nothing until ads-config.js exists with a real publisher ID
   (see ads-config.js.example / SETUP.md). Ad slot containers
   (.ad-slot) are hidden by CSS until this script activates them, so
   the layout doesn't show empty boxes before you're approved.
   ========================================================== */
(function(){
  "use strict";

  if(typeof window.ADS_CONFIG === "undefined" || !window.ADS_CONFIG.client || window.ADS_CONFIG.client.indexOf("XXXX") !== -1){
    return; // not configured yet — leave ad slots hidden
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(window.ADS_CONFIG.client);
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".ad-slot").forEach(function(slot){
      slot.style.display = "block";
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", window.ADS_CONFIG.client);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      if(slot.dataset.adSlot) ins.setAttribute("data-ad-slot", slot.dataset.adSlot);
      slot.appendChild(ins);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  });
})();
