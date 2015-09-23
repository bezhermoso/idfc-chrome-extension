
(function() {

    var savedBlacklist = null;

    var notifyContentScript = function (blacklist) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {blacklist: blacklist});
        });
    };

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {giveMeTheBlacklist: true}, function (response) {
            savedBlacklist = response.blacklist;
            document.getElementById('idontfuckingcare--blacklist').value = savedBlacklist;
        });
    });

    document.addEventListener('DOMContentLoaded', function () {

        var button = document.getElementById('idontfuckingcare--apply');

        button.onclick = function () {
            var blacklistInput = document.getElementById('idontfuckingcare--blacklist');
            notifyContentScript(blacklistInput.value);
        };
    });
})();
