// ==UserScript==
// @name        HideYerInfo
// @author      NoahBK (https://github.com/NoahBK)
// @namespace   https://violentmonkey.github.io/get-it/
// @version     1.9
// @homepage    https://github.com/NoahBK
// @supportURL  https://github.com/NoahBK/HideYerInfo/issues
// @downloadURL https://github.com/NoahBK/HideYerInfo/raw/main/script.user.js
// @updateURL   https://github.com/NoahBK/HideYerInfo/raw/main/script.user.js
// @description Automatically hide plaintext passkeys/API keys using styled spoiler tags w/ toggle visibility on click
// @grant       none
// @match       *://*/*/profile/*
// @match       *://*/*/user.php?u=*
// @match       *://*/*profile*
// @match       *://*/*user*
// ==/UserScript==

(function () {
    'use strict';

    // Function to create a clickable spoiler
    function wrapInSpoiler(passkey, parentNode) {
        const existingSpoiler = parentNode.closest('.spoiler-wrapper');
        if (existingSpoiler) return; // Prevent double wrapping the same passkey

        const spoilerWrapper = document.createElement('span');
        spoilerWrapper.classList.add('spoiler-wrapper');
        spoilerWrapper.style.cursor = 'pointer';
        spoilerWrapper.style.border = '1px solid #aaa';
        spoilerWrapper.style.backgroundColor = '#f5f5f5';
        spoilerWrapper.style.color = '#888';
        spoilerWrapper.style.padding = '2px 4px';
        spoilerWrapper.style.marginLeft = '5px';
        spoilerWrapper.textContent = 'Show'; // Button initially shows "Show"

        const content = document.createElement('span');
        content.textContent = passkey;
        content.style.display = 'none'; // Initially hide content

        parentNode.appendChild(spoilerWrapper);
        parentNode.appendChild(content);

        // Toggle functionality for the spoiler
        spoilerWrapper.addEventListener('click', function () {
            const isHidden = content.style.display === 'none';
            if (isHidden) {
                content.style.display = 'inline';
                spoilerWrapper.textContent = ''; // Remove "Show" when content is shown
                spoilerWrapper.style.display = 'none'; // Hide the "Show" button when the content is shown
            } else {
                content.style.display = 'none';
                spoilerWrapper.textContent = 'Show'; // Show the "Show" button again when content is hidden
                spoilerWrapper.style.display = ''; // Restore the visibility of the "Show" button
            }
        });

        // Make the passkey itself clickable to toggle the spoiler as well
        content.addEventListener('click', function () {
            const isHidden = content.style.display === 'none';
            if (isHidden) {
                content.style.display = 'inline';
                spoilerWrapper.textContent = ''; // Remove "Show" when content is shown
                spoilerWrapper.style.display = 'none'; // Hide the "Show" button when the content is shown
            } else {
                content.style.display = 'none';
                spoilerWrapper.textContent = 'Show'; // Show the "Show" button again when content is hidden
                spoilerWrapper.style.display = ''; // Restore the visibility of the "Show" button
            }
        });
    }

    // Function to detect sensitive keys and protect them
    function protectSensitiveInfo() {
        // Ensure the script only runs on profile pages with "?id=" or "/profile" or "/user.php?u="
        const profilePattern = /[?&]id=\d+$/;
        const profilePattern2 = /\/profile/;
        const profilePattern3 = /user.php\?u=\d+$/;
        if (!(profilePattern.test(window.location.href) || profilePattern2.test(window.location.href) || profilePattern3.test(window.location.href))) {
            return; // Exit if not on a profile page
        }

        const textNodes = document.evaluate("//text()[not(ancestor::span[contains(@class, 'spoiler')])]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        // Iterate over all text nodes and apply spoiler if needed
        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            const textContent = node.nodeValue.trim();

            // Skip content that contains links or looks like usernames (i.e., no URLs or long-letter-only words)
            if (textContent.length < 16 || /https?:\/\/[^\s]+/.test(textContent)) {
                continue;
            }

            const match = textContent.match(/[a-zA-Z0-9]{16,64}/);

            // If the content matches a passkey pattern and it's not a username, create a spoiler
            if (match && !node.parentElement.closest('.spoiler-wrapper')) {
                const passkey = match[0];
                const [before, after] = textContent.split(passkey);
                const beforeNode = document.createTextNode(before);
                const afterNode = document.createTextNode(after);
                const passkeyNode = document.createElement('span');

                node.replaceWith(beforeNode, passkeyNode, afterNode);
                wrapInSpoiler(passkey, passkeyNode);
            }
        }
    }

    // Run on page load and on AJAX content load
    protectSensitiveInfo();
    document.addEventListener('DOMNodeInserted', protectSensitiveInfo);
})();
