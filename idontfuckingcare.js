(function() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = null;

    chrome.runtime.onMessage.addListener(function (req, sender, res) {
        if (req.blacklist) {
            var pattern = new RegExp(req.blacklist, 'gi');
            strip(pattern, document.body);
            createObserver(pattern);
        };
    });
    var strip = function (pattern, node) {
        var n, 
            ns = [],
            walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        while(n = walker.nextNode()) {
            ns.push(n);
        }
        ns.filter(function (n) {
            return pattern.test(n.textContent); 
        }).forEach(function (n) {
            console.log(n);
            n.remove();
        });
    };
    var createObserver = function (pattern) {
        if (observer) {
            observer.disconnect();
        }
        observer = new MutationObserver(function (mutations) {
            var nodes = [];
            mutations.forEach(function (mutation) {
                for (var i = 0; i <  mutation.addedNodes.length; i++) {
                    strip(pattern, mutation.addedNodes.item(i));
                }
            });
        });
        observer.observe(document, {
            subtree: true,
            childList: true,
            attributes: true
        });
    };

})();
