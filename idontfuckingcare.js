(function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    storage = localStorage,
    observer = null,
    savedBlacklist = null,
    strippers = [],
    matchingStrippers = [];

    var blacklistStorage = {
        key: 'idontfuckingcare--blacklist',
        set: function (v) { 
            storage.setItem(this.key, v); 
        },
        get: function () { 
            return storage.getItem(this.key); 
        } 
    };

    var genericStrip = function (pattern, node) {
        var n, 
        ns = [],
        walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        while(n = walker.nextNode()) {
            ns.push(n);
        }
        ns.filter(function (n) {
            return pattern.test(n.textContent); 
        }).forEach(function (n) {
            n.remove();
        });
        return node;
    };

    strippers = [
        {
            matches: /facebook\.com$/,
            strip: function (pattern, node) {
                if (node.nodeType == 3) {
                    if (pattern.test(node.textContent)) {
                        node.remove();
                    }
                    return node;
                }
                var elems = node.querySelectorAll('.userContentWrapper');
                for (var i = 0; i < elems.length; i++) {
                    if (elems[i].innerHTML.match(pattern)) {
                        elems[i].remove();
                    }
                }
                return node;
            }
        }
    ];

    matchingStrippers = strippers.filter(function (s) {
        return s.matches.test(document.location.hostname);
    }).map(function (s) {
        return s.strip;
    }).concat([genericStrip]);

    var strip = function (pattern, node) {
        return matchingStrippers.reduce(function (accum, stripper) {
            return stripper(pattern, accum);
        }, node);
    }

    
    var escapeRegexp = function (str) {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    var trim = function (s) {
        return s.trim();
    };

    var notEmptyString = function (s) {
        return s.length > 0;
    }
    
    var doit = function (blacklist) {
        blacklistStorage.set(blacklist);
        console.log('I don\'t fucking care about ' + blacklist + '!');
        var keywords = blacklist
            .split(',')
            .map(trim)
            .filter(notEmptyString)
            .map(escapeRegexp)
            .join('|');
        var expr = new RegExp('(' + keywords + ')', 'gi');
        strip(expr, document.body);
        createObserver(expr);
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

    savedBlacklist = blacklistStorage.get();

    if (savedBlacklist) {
        doit(savedBlacklist);
    }

    chrome.runtime.onMessage.addListener(function (req, sender, res) {
        if (typeof req.blacklist != 'undefined') {
            if (req.blacklist.length > 0) {
                doit(req.blacklist);
            } else {
                blacklistStorage.set('');
            }
        } else if(req.giveMeTheBlacklist) {
            res({blacklist: blacklistStorage.get()});
        }
    });
})();
