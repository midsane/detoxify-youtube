function updateRelevantTags(tags) {
  const relevantTags = tags;

  function filterVideos() {
    const videos = document.querySelectorAll("ytd-rich-item-renderer");

    videos.forEach((video) => {
      const titleElement = video.querySelector("#video-title");
      const descriptionElement = video.querySelector("#description-text");

      const title = titleElement?.textContent?.toLowerCase() || "";
      const description = descriptionElement?.textContent?.toLowerCase() || "";


      const isRelevant = relevantTags.some(
        (tag) => title.includes(tag) || description.includes(tag)
      );

      if (!isRelevant) {
      if (!video.querySelector(".detoxify-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "detoxify-overlay";

        const logoDiv = document.createElement("div");
        const image = document.createElement("img");
        image.src = chrome.runtime.getURL("icons/icon-128.png");


        console.log(image.src); // Debugging: Check the image URL

        image.src = imageUrl;
        image.alt = "Detoxify YouTube Logo"; // Add alt text for accessibility
        logoDiv.appendChild(image);

        const para = document.createElement("p");
        para.textContent = "Detoxify: Hidden by your filter";

        overlay.appendChild(logoDiv);
        overlay.appendChild(para);

        video.style.position = "relative";
        video.appendChild(overlay);
      }

      } else {
        const existingOverlay = video.querySelector(".detoxify-overlay");
        if (existingOverlay) {
          existingOverlay.remove();
        }
      }
    });
  }

  const observer = new MutationObserver(filterVideos);
  observer.observe(document.body, { childList: true, subtree: true });

  filterVideos();
}

chrome.storage.local.get(["relevantTags"], (result) => {
  const tags = result.relevantTags || ["education", "tutorial", "programming"];
  updateRelevantTags(tags);
});
