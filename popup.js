
    // Fetch stored tags when popup opens
    chrome.storage.local.get(['relevantTags'], (result) => {
      let tags = result.relevantTags || ["education", "tutorial", "programming"];
      updateTagsList(tags);
      
      // Update the content.js with the fetched tags
      chrome.scripting.executeScript({
        target: {tabId: chrome.tabs.query({active: true, currentWindow: true})[0].id},
        func: updateRelevantTags,
        args: [tags]
      });

      document.getElementById('addTagButton').addEventListener('click', () => {
        const newTag = prompt("Enter a new tag:");
        if (newTag) {
          tags.push(newTag);
          chrome.storage.local.set({relevantTags: tags}, () => {
            updateTagsList(tags);
            
            // Update content.js with the new tags
            chrome.scripting.executeScript({
              target: {tabId: chrome.tabs.query({active: true, currentWindow: true})[0].id},
              func: updateRelevantTags,
              args: [tags]
            });
          });
        }
      });
    });

    // Update tags list in the popup UI
    function updateTagsList(tags) {
      const tagsList = document.getElementById('tagsList');
      tagsList.innerHTML = ''; // Clear current list
      tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `${tag} <button onclick="removeTag('${tag}')">x</button>`;
        tagsList.appendChild(tagElement);
      });
    }

    // Function to remove a tag
    function removeTag(tagToRemove) {
      chrome.storage.local.get(['relevantTags'], (result) => {
        let tags = result.relevantTags || [];
        tags = tags.filter(tag => tag !== tagToRemove);
        chrome.storage.local.set({relevantTags: tags}, () => {
          updateTagsList(tags);
          
          // Update content.js with the new tags
          chrome.scripting.executeScript({
            target: {tabId: chrome.tabs.query({active: true, currentWindow: true})[0].id},
            func: updateRelevantTags,
            args: [tags]
          });
        });
      });
    }
  