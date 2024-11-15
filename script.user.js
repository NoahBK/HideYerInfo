// ==UserScript==
// @name        HideYerInfo
// @author      NoahBK (https://github.com/NoahBK)  // Combined author and URL on one line
// @namespace   https://violentmonkey.github.io/get-it/
// @version     1.0
// @homepage    https://github.com/NoahBK
// @supportURL  https://github.com/NoahBK/HideYerInfo/issues
// @downloadURL https://github.com/NoahBK/HideYerInfo/raw/main/script.user.js
// @updateURL   https://github.com/NoahBK/HideYerInfo/raw/main/script.user.js
// @description Automatically hide plaintext passkeys/API keys using styled spoiler tags w/ toggle visibility on click
// @grant       none
// ==/UserScript==

(function () {
    'use strict';

    // Function to create a clickable spoiler
    function wrapInSpoiler(passkey, parentNode) {
        const spoilerWrapper = document.createElement('span');
        spoilerWrapper.classList.add('spoiler-wrapper');
        spoilerWrapper.style.cursor = 'pointer';
        spoilerWrapper.style.border = '1px solid #aaa';
        spoilerWrapper.style.backgroundColor = '#f5f5f5';
        spoilerWrapper.style.color = '#888';
        spoilerWrapper.style.padding = '2px 4px';
        spoilerWrapper.style.marginLeft = '5px';
        spoilerWrapper.textContent = 'Show';

        const content = document.createElement('span');
        content.textContent = passkey;
        content.style.display = 'none'; // Hidden by default

        // Insert the spoiler button and hidden content
        parentNode.appendChild(spoilerWrapper);
        parentNode.appendChild(content);

        // Toggle visibility on click of the "Show" button
        spoilerWrapper.addEventListener('click', function () {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'inline' : 'none';

            if (isHidden) {
                spoilerWrapper.style.display = 'none'; // Hide the "Show" button when revealing the passkey
            } else {
                spoilerWrapper.style.display = 'inline'; // Show the "Show" button again when hiding the passkey
            }
        });

        // Toggle visibility when the passkey itself is clicked
        content.addEventListener('click', function () {
            content.style.display = 'none';  // Hide the passkey
            spoilerWrapper.style.display = 'inline'; // Show the "Show" button again
        });
    }

    // Function to detect sensitive keys and protect them
    function protectSensitiveInfo() {
        const keyPattern = /\b[a-z0-9]{16,50}\b/i;  // Match passkeys/api keys with a more flexible length (16 to 50 characters)
        const sensitiveKeywords = ['passkey', 'api', 'pid', 'key']; // List of sensitive keywords
        const excludedKeywords = ['paypalavatarunfucker']; // List of excluded keywords to avoid false positives
        const textNodes = document.evaluate("//text()[not(ancestor::span[contains(@class, 'spoiler')])]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            const textContent = node.nodeValue;

            // Ensure we don't match excluded keywords
            if (excludedKeywords.some(keyword => textContent.toLowerCase().includes(keyword))) {
                continue; // Skip any content containing excluded keywords
            }

            // Match passkeys/api keys with length 16-50 characters
            const match = textContent.match(keyPattern);
            if (match && !node.parentElement.closest('.spoiler') && textContent.length >= 16 && textContent.length <= 50) {
                // Check if the text content contains any of the sensitive keywords
                const containsSensitiveKeyword = sensitiveKeywords.some(keyword => textContent.toLowerCase().includes(keyword));

                // If the passkey is found and it's linked to a keyword or its own
                if (containsSensitiveKeyword || textContent.match(keyPattern)) {
                    const passkey = match[0];
                    const [before, after] = textContent.split(passkey);

                    // Create new elements to wrap around the passkey
                    const beforeNode = document.createTextNode(before);
                    const afterNode = document.createTextNode(after);
                    const passkeyNode = document.createElement('span');

                    // Attach the text nodes and the spoiler
                    node.replaceWith(beforeNode, passkeyNode, afterNode);
                    wrapInSpoiler(passkey, passkeyNode);
                }
            }
        }
    }

    // Run on page load and on AJAX content load
    protectSensitiveInfo();
    document.addEventListener('DOMNodeInserted', protectSensitiveInfo);
})();
