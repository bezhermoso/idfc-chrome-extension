
(function() {

    document.addEventListener('DOMContentLoaded', function () {
        var button = document.getElementById('idontfuckingcare--apply');
        button.onclick = function () {
            var blacklistInput = document.getElementById('idontfuckingcare--blacklist');
            var blacklist = blacklistInput.value;
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {blacklist: blacklist});
            });
        };
    });
})();
