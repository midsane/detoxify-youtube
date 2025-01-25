// Fetch stored data when popup opens
chrome.storage.local.get(
  ["relevantTags", "whitelistedChannels", "blacklistedChannels"],
  (result) => {
    console.log(result); // Debugging line to check if data is retrieved

    let tags = result.relevantTags || ["education", "tutorial", "programming"];
    let whitelistedChannels = result.whitelistedChannels || [];
    let blacklistedChannels = result.blacklistedChannels || [];

    updateTagsList(tags);
    updateWhitelistedChannelsList(whitelistedChannels);
    updateBlacklistedChannelsList(blacklistedChannels);

    updatingContentjs(tags);

    // Add tag functionality
    document.getElementById("addTagButton").addEventListener("click", () => {
      console.log("Add Tag Button Clicked"); // Debugging line
      chrome.storage.local.get(["relevantTags"], (result) => {
        const tags = result.relevantTags || [];
        showDialog("Enter a new tag", tags);
      });
    });

    // Add channel functionality for whitelisted and blacklisted
    document
      .getElementById("addWhitelistedButton")
      .addEventListener("click", () => {
        console.log("Add Whitelisted Channel Button Clicked"); // Debugging line
        showChannelDialog("Enter a new whitelisted channel", "whitelisted");
      });

    document
      .getElementById("addBlacklistedButton")
      .addEventListener("click", () => {
        console.log("Add Blacklisted Channel Button Clicked"); // Debugging line
        showChannelDialog("Enter a new blacklisted channel", "blacklisted");
      });

    // View more functionality
    document
      .getElementById("viewMoreWhitelisted")
      .addEventListener("click", () => {
        updateWhitelistedChannelsList(whitelistedChannels, true);
      });

    document
      .getElementById("viewMoreBlacklisted")
      .addEventListener("click", () => {
        updateBlacklistedChannelsList(blacklistedChannels, true);
      });

    document.getElementById("viewMoreTags").addEventListener("click", () => {
      updateTagsList(tags); // Show all tags when clicked
    });
  }
);

function updateTagsList(tags, showAll = false) {
  const tagsList = document.getElementById("tagsPreview");
  tagsList.innerHTML = ""; // Clear the list

  const tagsToDisplay = showAll ? tags : tags.slice(0, 3);
  tagsToDisplay.forEach((tag) => {
    const tagElement = document.createElement("div");
    tagElement.className = "tag";
    tagElement.textContent = tag;

    const removeButton = document.createElement("button");
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () => removeTag(tag));

    tagElement.appendChild(removeButton);
    tagsList.appendChild(tagElement);
  });

  // Add "View All" or "View Less" button
  if (tags.length > 3) {
    const viewButton = document.createElement("span");
    viewButton.textContent = showAll ? "... View less" : "... View all";
    viewButton.className = "action-link";
    viewButton.addEventListener("click", () => {
      updateTagsList(tags, !showAll);
    });
    tagsList.appendChild(viewButton);
  }
}

function updateWhitelistedChannelsList(whitelisted, showAll = false) {
  const whitelistedList = document.getElementById("whitelistedChannelsPreview");
  whitelistedList.innerHTML = ""; // Clear the list

  const whitelistedToDisplay = showAll ? whitelisted : whitelisted.slice(0, 3);
  whitelistedToDisplay.forEach((channel) => {
    const channelElement = document.createElement("div");
    channelElement.className = "channel";
    channelElement.textContent = channel;

    const removeButton = document.createElement("button");
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () =>
      removeChannel(channel, "whitelisted")
    );

    channelElement.appendChild(removeButton);
    whitelistedList.appendChild(channelElement);
  });

  // Add "View All" or "View Less" button for whitelisted
  if (whitelisted.length > 3) {
    const viewMoreButton = document.createElement("span");
    viewMoreButton.textContent = showAll ? "... View less" : "... View all";
    viewMoreButton.className = "action-link";
    viewMoreButton.addEventListener("click", () =>
      updateWhitelistedChannelsList(whitelisted, !showAll)
    );
    whitelistedList.appendChild(viewMoreButton);
  }
}

function updateBlacklistedChannelsList(blacklisted, showAll = false) {
  const blacklistedList = document.getElementById("blacklistedChannelsPreview");
  blacklistedList.innerHTML = ""; // Clear the list

  const blacklistedToDisplay = showAll ? blacklisted : blacklisted.slice(0, 3);
  blacklistedToDisplay.forEach((channel) => {
    const channelElement = document.createElement("div");
    channelElement.className = "channel";
    channelElement.textContent = channel;

    const removeButton = document.createElement("button");
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () =>
      removeChannel(channel, "blacklisted")
    );

    channelElement.appendChild(removeButton);
    blacklistedList.appendChild(channelElement);
  });

  // Add "View All" or "View Less" button for blacklisted
  if (blacklisted.length > 3) {
    const viewMoreButton = document.createElement("span");
    viewMoreButton.textContent = showAll ? "... View less" : "... View all";
    viewMoreButton.className = "action-link";
    viewMoreButton.addEventListener("click", () =>
      updateBlacklistedChannelsList(blacklisted, !showAll)
    );
    blacklistedList.appendChild(viewMoreButton);
  }
}

function removeTag(tag) {
  chrome.storage.local.get(["relevantTags"], (result) => {
    const updatedTags = result.relevantTags.filter((t) => t !== tag);
    chrome.storage.local.set({ relevantTags: updatedTags }, () => {
      updateTagsList(updatedTags); // Refresh the tags list
    });
  });
}

function removeChannel(channel, type) {
  chrome.storage.local.get([`${type}Channels`], (result) => {
    const updatedChannels = result[`${type}Channels`].filter(
      (ch) => ch !== channel
    );
    chrome.storage.local.set({ [`${type}Channels`]: updatedChannels }, () => {
      if (type === "whitelisted") {
        updateWhitelistedChannelsList(updatedChannels);
      } else {
        updateBlacklistedChannelsList(updatedChannels);
      }
    });
  });
}

function showDialog(message, tags) {
  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "modal-overlay"; // Use modal styling

  const dialogContent = document.createElement("div");
  dialogContent.className = "modal-content";

  const dialogMessage = document.createElement("p");
  dialogMessage.textContent = message;

  const inputField = document.createElement("input");
  inputField.placeholder = "Enter tag...";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.className = "dialog-savebutton";
  saveButton.addEventListener("click", () => {
    const newTag = inputField.value.trim();
    if (newTag && !tags.includes(newTag)) {
      tags.push(newTag);
      chrome.storage.local.set({ relevantTags: tags }, () => {
        updateTagsList(tags);
        updatingContentjs(tags);
      });
    } else {
      alert("Tag cannot be empty or already exists!");
    }
    document.body.removeChild(dialogOverlay);
  });

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(dialogOverlay);
  });
  closeButton.className = "dialog-closebutton";

  dialogContent.appendChild(dialogMessage);
  dialogContent.appendChild(inputField);
  dialogContent.appendChild(saveButton);
  dialogContent.appendChild(closeButton);
  dialogOverlay.appendChild(dialogContent);

  document.body.appendChild(dialogOverlay);
}

function showChannelDialog(message, type) {
  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "modal-overlay"; // Use modal styling

  const dialogContent = document.createElement("div");
  dialogContent.className = "modal-content";

  const dialogMessage = document.createElement("p");
  dialogMessage.textContent = message;

  const inputField = document.createElement("input");
  inputField.placeholder = "Enter channel name...";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.className = "dialog-savebutton"
  saveButton.addEventListener("click", () => {
    const newChannel = inputField.value.trim();
    if (newChannel) {
      chrome.storage.local.get([`${type}Channels`], (result) => {
        let channels = result[`${type}Channels`] || [];
        if (!channels.includes(newChannel)) {
          channels.push(newChannel);
          chrome.storage.local.set({ [`${type}Channels`]: channels }, () => {
            if (type === "whitelisted") {
              updateWhitelistedChannelsList(channels);
            } else {
              updateBlacklistedChannelsList(channels);
            }
          });
        } else {
          alert("Channel already exists!");
        }
      });
    }
    document.body.removeChild(dialogOverlay);
  });

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.className ="dialog-closebutton"
  closeButton.addEventListener("click", () => {
    document.body.removeChild(dialogOverlay);
  });

  dialogContent.appendChild(dialogMessage);
  dialogContent.appendChild(inputField);
  dialogContent.appendChild(saveButton);
  dialogContent.appendChild(closeButton);
  dialogOverlay.appendChild(dialogContent);

  document.body.appendChild(dialogOverlay);
}

const updatingContentjs = (tags) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes("https://www.youtube.com/")) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateRelevantTags",
        tags: tags,
      });
    }
  });
};
