chrome.storage.local.get(
  ["relevantTags", "whitelistedChannels", "blacklistedChannels"],
  (result) => {

    let tags = result.relevantTags || ["education", "tutorial", "programming"];
    let whitelistedChannels = result.whitelistedChannels || [];
    let blacklistedChannels = result.blacklistedChannels || [];

    updateTagsList(tags);
    updateWhitelistedChannelsList(whitelistedChannels);
    updateBlacklistedChannelsList(blacklistedChannels);

    updatingContentjs(tags);

    document.getElementById("addTagButton").addEventListener("click", () => {
      chrome.storage.local.get(["relevantTags"], (result) => {
        const tags = result.relevantTags || [];
        showDialog("Enter a new tag", tags);
      });
    });

    document
      .getElementById("addWhitelistedButton")
      .addEventListener("click", () => {
         chrome.storage.local.get(["whitelistedChannels"], (result) => {
        const whitelistedChannels = result.whitelistedChannels || [];
        showChannelDialog("white list channels","whitelistedChannels", whitelistedChannels);
      });
      });

    document
      .getElementById("addBlacklistedButton")
     .addEventListener("click", () => {
         chrome.storage.local.get(["blacklistedChannels"], (result) => {
        const blacklistedChannels = result.blacklistedChannels || [];
        showChannelDialog("black list channels","blacklistedChannels", blacklistedChannels);
      });
      });

    document
      .getElementById("viewMoreWhitelisted")
      .addEventListener("click", () => {
        listDialog(
          header = "view all white listed channels",
          para = "make sure you enter the exact channel name as it is! any videos from this channel will always be shown!",
          type = "whitelisted",
        );
      });

    document
      .getElementById("viewMoreBlacklisted")
      .addEventListener("click", () => {
        listDialog(
          header = "view all black listed channels",
          para = "make sure you enter the exact channel name as it is! all videos from this channel will be hidden",
          type = "blacklisted",
        );
      });

    document.getElementById("viewMoreTags").addEventListener("click", () => {
      listDialog(
        header = "view all tags",
        para = "only videos that have one of these tags in their title or description will be shown",
        type = "tags",
      );
    });
  }
);

function updateTagsList(tags, showAll=false) {
  const tagsList = document.getElementById("tagsPreview");
  tagsList.innerHTML = "";

  const tagsToDisplay = showAll? tags : tags.slice(0,3);
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
  return tags
}

function updateWhitelistedChannelsList(whitelisted, showAll = false) {
  const whitelistedList = document.getElementById("whitelistedChannelsPreview");
  whitelistedList.innerHTML = "";

  const whiteListedToDisplay = showAll ? whitelistedList: whitelisted.slice(0,3);
  whiteListedToDisplay.forEach((channel) => {
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

  return whiteListedToDisplay;
}

function updateBlacklistedChannelsList(blacklisted, showAll=false) {
  const blacklistedList = document.getElementById("blacklistedChannelsPreview");
  blacklistedList.innerHTML = "";

  const blackListedToDisplay = showAll ? blacklisted : blacklisted.slice(0,3);
  blackListedToDisplay.forEach((channel) => {
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
  return blackListedToDisplay
}

function removeTag(tag) {
  chrome.storage.local.get(["relevantTags"], (result) => {
    const updatedTags = result.relevantTags.filter((t) => t !== tag);
    chrome.storage.local.set({ relevantTags: updatedTags }, () => {
      updateTagsList(updatedTags); 
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
  dialogOverlay.className = "modal-overlay"; 

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

function showChannelDialog(message, type, channel) {
  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "modal-overlay"; 

  const dialogContent = document.createElement("div");
  dialogContent.className = "modal-content";

  const dialogMessage = document.createElement("p");
  dialogMessage.textContent = message;

  const inputField = document.createElement("input");
  inputField.placeholder = "Enter channel name...";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.className = "dialog-savebutton";
  saveButton.addEventListener("click", () => {
    const newChannel = inputField.value.trim();
     if (newChannel && !channel.includes(newChannel)) {
       channel.push(newChannel);
       chrome.storage.local.set({ [type]: channel }, () => {
         if (type === "blacklistedChannels") 
          updateBlacklistedChannelsList(channel);
          
        else updateWhitelistedChannelsList(channel);

        //updatingContentjs(channel);
          
       });
     } else {
       alert("input cannot be empty or already exists!");
     }
   
    document.body.removeChild(dialogOverlay);
  });

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.className = "dialog-closebutton";
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

const listDialog = (
  header = "view all tags",
  para = "relevant videos are those videos which have one of these tags as a substring in their title or description",
  type = "tags",
) => {
  let list = [];
  switch(type){
    case "tags":
          chrome.storage.local.get(["relevantTags"], (result) => {
            list = result.relevantTags || [];
            const entryList = document.createElement("div");
            entryList.className = "entrylist"
            list.forEach((l) => {
              const channelElement = document.createElement("div");
              channelElement.className = "tags";
              channelElement.textContent = l;

              const removeButton = document.createElement("button");
              removeButton.textContent = "x";
              removeButton.addEventListener("click", () =>
                removeTag(l, "tags")
              );

              channelElement.appendChild(removeButton);
              entryList.appendChild(channelElement);
            });

            const closeButton = document.createElement("button");
            closeButton.textContent = "Close";
            closeButton.className = "dialog-closebutton";
            closeButton.addEventListener("click", () => {
              document.body.removeChild(dialogOverlay);
            });

            dialogContent.appendChild(dialogMessage);
            dialogContent.appendChild(paraText);
            dialogContent.appendChild(entryList);
            dialogContent.appendChild(closeButton);
            dialogOverlay.appendChild(dialogContent);

            document.body.appendChild(dialogOverlay);
          });
          break;
    case "whitelisted":
            chrome.storage.local.get(["whitelistedChannels"], (result) => {
              list = result.whitelistedChannels || [];
              const entryList = document.createElement("div");
              entryList.className = "entrylist";
              list.forEach((l) => {
                const channelElement = document.createElement("div");
                channelElement.className = "tags";
                channelElement.textContent = l;

                const removeButton = document.createElement("button");
                removeButton.textContent = "x";
                removeButton.addEventListener("click", () =>
                  removeTag(l, "tags")
                );

                channelElement.appendChild(removeButton);
                entryList.appendChild(channelElement);
              });

              const closeButton = document.createElement("button");
              closeButton.textContent = "Close";
              closeButton.className = "dialog-closebutton";
              closeButton.addEventListener("click", () => {
                document.body.removeChild(dialogOverlay);
              });

              dialogContent.appendChild(dialogMessage);
              dialogContent.appendChild(paraText);
              dialogContent.appendChild(entryList);
              dialogContent.appendChild(closeButton);
              dialogOverlay.appendChild(dialogContent);

              document.body.appendChild(dialogOverlay);
            });
            break;
          case "blacklisted":
            chrome.storage.local.get(["blacklistedChannels"], (result) => {
              list = result.blacklistedChannels || [];
              const entryList = document.createElement("div");
              entryList.className = "entrylist";

              list.forEach((l) => {
                const channelElement = document.createElement("div");
                channelElement.className = "tags";
                channelElement.textContent = l;

                const removeButton = document.createElement("button");
                removeButton.textContent = "x";
                removeButton.addEventListener("click", () =>
                  removeTag(l, "tags")
                );

                channelElement.appendChild(removeButton);
                entryList.appendChild(channelElement);
              });

              const closeButton = document.createElement("button");
              closeButton.textContent = "Close";
              closeButton.className = "dialog-closebutton";
              closeButton.addEventListener("click", () => {
                document.body.removeChild(dialogOverlay);
              });

              dialogContent.appendChild(dialogMessage);
              dialogContent.appendChild(paraText);
              dialogContent.appendChild(entryList);
              dialogContent.appendChild(closeButton);
              dialogOverlay.appendChild(dialogContent);

              document.body.appendChild(dialogOverlay);
            });
          break;
  }

  const dialogOverlay = document.createElement("div");
  dialogOverlay.className = "modal-overlay";

  const dialogContent = document.createElement("div");
  dialogContent.className = "modal-content";

  const dialogMessage = document.createElement("h3");
  dialogMessage.textContent = header;

  const paraText = document.createElement("p");
  paraText.textContent = para;

  
};
