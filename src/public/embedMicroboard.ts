(function () {
  const callbacks: Record<"success" | "error" | "cancel", () => void> = {
    success: () => {
      throw new Error("No MB success callback");
    },
    error: () => {
      throw new Error("No MB error callback");
    },
    cancel: () => {
      throw new Error("No MB cancel callback");
    },
  };

  window.microboardOpener = {
    selectBoard: function ({ success, error, cancel }) {
      const popupUrl = `${import.meta.env.EMBED_URL}/selectBoard`;
      window.open(
        popupUrl,
        "_blank",
        "popup=true,width=400,height=600,resizable=yes,scrollbars=yes",
      );
      callbacks.success = success;
      callbacks.error = error;
      callbacks.cancel = cancel;
    },
  };

  window.addEventListener(
    "message",
    function (event) {
      if (event.origin === `${import.meta.env.EMBED_URL}`) {
        for (const type in callbacks) {
          if (event.data[type]) {
            callbacks[type](event.data[type]);
            if (type !== "cancel" && event.source && "close" in event.source) {
              event.source.close();
            }
          }
        }
      }
    },
    false,
  );
})();
