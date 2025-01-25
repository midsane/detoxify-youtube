chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  if (message.action === "updateRelevantTags") {
    updateRelevantTags(message.tags);
    sendResponse({ status: "success" });
  } else {
    console.warn("Unknown message action:", message.action);
  }
});

console.log("Content script loaded on YouTube");

function updateRelevantTags(tags) {
  const relevantTags = tags;

  // Pass relevantTags to filterVideos
  function filterVideos(relevantTags) {
    const videos = document.querySelectorAll("ytd-rich-item-renderer");
    let irrelevantVideos = [];

    // First, go through all videos to identify irrelevant ones
    videos.forEach((video) => {
      const titleElement = video.querySelector("#video-title");
      const descriptionElement = video.querySelector("#description-text");

      const title = titleElement?.textContent?.toLowerCase() || "";
      const description = descriptionElement?.textContent?.toLowerCase() || "";

      const isRelevant = relevantTags.some(
        (tag) => title.includes(tag) || description.includes(tag)
      );

      if (!isRelevant) {
        irrelevantVideos.push(video); // Keep track of irrelevant videos

        // Add overlay for irrelevant videos
        if (!video.querySelector(".detoxify-overlay")) {
          const overlay = document.createElement("div");
          overlay.className = "detoxify-overlay";

          const logoDiv = document.createElement("div");
          const image = document.createElement("img");
          image.src =
            "https://res.cloudinary.com/midcloud/image/upload/v1737743594/detoxifyyt-removebg-preview_1_al00xo.png";
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
        // If the video is relevant, remove any overlay and show it
        const existingOverlay = video.querySelector(".detoxify-overlay");
        if (existingOverlay) {
          existingOverlay.remove();
        }
      }
    });

    // After processing the videos, search for relevant videos for each irrelevant video
    // if (irrelevantVideos.length > 0) {
    //   irrelevantVideos.forEach((video) => {
    //     const titleElement = video.querySelector("#video-title");
    //     const descriptionElement = video.querySelector("#description-text");

    //     const title = titleElement?.textContent || "";
    //     const description = descriptionElement?.textContent || "";

    //     // Show loading indicator while fetching relevant videos
    //     showLoadingIndicator(video);

    //     // Fetch relevant video based on the title/description using YouTube API
    //     searchForRelevantVideo(title, description)
    //       .then((newData) => {
    //         if (newData) {
    //           // Replace the content of the irrelevant video with the new one
    //           const newVideoElement = video.cloneNode(true); // Clone the irrelevant video
    //           replaceVideoContent(newVideoElement, newData);

    //           // Replace the irrelevant video with the new one
    //           video.replaceWith(newVideoElement);

    //           // Unhide the newly replaced video
    //           newVideoElement.style.display = "block";
    //         }
    //       })
    //       .catch(() => {
    //         // If an error occurs, show error message
    //         showErrorMessage(video);
    //       });
    //   });
    // }
  }

  function replaceVideoContent(videoElement, newData) {
    const titleElement = videoElement.querySelector("#video-title");
    const descriptionElement = videoElement.querySelector("#description-text");
    const thumbnailElement = videoElement.querySelector("yt-image img");

    // Update video content with the fetched relevant video data
    if (titleElement) titleElement.textContent = newData.title;
    if (descriptionElement)
      descriptionElement.textContent = newData.description;
    if (thumbnailElement) thumbnailElement.src = newData.thumbnailUrl;
  }

  function searchForRelevantVideo(title, description) {
    // Use YouTube API to search for relevant videos
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      title + " " + description
    )}&key=YOUR_YOUTUBE_API_KEY`;

    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const video = data.items[0]; // Take the first result
        if (video) {
          return {
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnailUrl: video.snippet.thumbnails.medium.url,
          };
        }
        return null;
      });
  }

  function showLoadingIndicator(video) {
    // Create and show loading overlay
    const overlay = document.createElement("div");
    overlay.className = "detoxify-overlay loading-overlay";

    const loader = document.createElement("div");
    loader.className = "loader"; // Add a loader class for styling
    overlay.appendChild(loader);

    const para = document.createElement("p");
    para.textContent = "Loading relevant video...";
    overlay.appendChild(para);

    video.style.position = "relative";
    video.appendChild(overlay);
  }

  function showErrorMessage(video) {
    // Create and show error message overlay
    const overlay = document.createElement("div");
    overlay.className = "detoxify-overlay error-overlay";

    const para = document.createElement("p");
    para.textContent = "Error loading relevant video.";
    overlay.appendChild(para);

    video.style.position = "relative";
    video.appendChild(overlay);
  }

  const observer = new MutationObserver(() => filterVideos(relevantTags));
  observer.observe(document.body, { childList: true, subtree: true });

  filterVideos(relevantTags);
}

chrome.storage.local.get(["relevantTags"], (result) => {
  const tags = result.relevantTags || ["education", "tutorial", "programming"];
  updateRelevantTags(tags);
});
