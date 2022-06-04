const CACHE_NAME = 'MrZeFrCache';
let cachelist = [];
self.addEventListener('install', async function (installEvent) {
    self.skipWaiting();
    installEvent.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(cachelist);
            })
    );
});
self.addEventListener('fetch', async event => {
    try {
        event.respondWith(handle(event.request))
    } catch (msg) {
        event.respondWith(handleerr(event.request, msg))
    }
});
const handleerr = async (req, msg) => {
    return new Response(`<h1>MrZeFrCache Error</h1>
    <b>${msg}</b>`, { headers: { "content-type": "text/html; charset=utf-8" } })
}
let cdn = {
    "gh": {
        jsdelivr: {
            "url": "https://cdn.jsdelivr.net/gh"
        },
        jsdelivr_fastly: {
            "url": "https://fastly.jsdelivr.net/gh"
        },
        jsdelivr_gcore: {
            "url": "https://gcore.jsdelivr.net/gh"
        },
        tianli: {
            "url": "https://cdn1.tianli0.top/gh"
        }        
    },
    "combine": {
        jsdelivr: {
            "url": "https://cdn.jsdelivr.net/combine"
        },
        jsdelivr_fastly: {
            "url": "https://fastly.jsdelivr.net/combine"
        },
        jsdelivr_gcore: {
            "url": "https://gcore.jsdelivr.net/combine"
        },
        tianli: {
            "url": "https://cdn1.tianli0.top/combine"
        }
    },
    "npm": {
        eleme: {
            "url": "https://npm.elemecdn.com"
        },
        jsdelivr: {
            "url": "https://cdn.jsdelivr.net/npm"
        },
        zhimg: {
            "url": "https://unpkg.zhimg.com"
        },
        unpkg: {
            "url": "https://unpkg.com"
        },
        staticfile: {
            "url": "https://cdn.staticfile.org"
        },
        tianli: {
            "url": "https://cdn1.tianli0.top/npm"
        }
    }
}
const cache_url_list = [
    /(http:\/\/|https:\/\/)cdn\.elemecdn\.com/g,
    /(http:\/\/|https:\/\/)cdn\.mrzefr\.cn/g,
    /(http:\/\/|https:\/\/)cdn\.staticfile\.org/g,
    /(http:\/\/|https:\/\/)cdnjs\.sourcegcdn\.com/g
]
const handle = async function (req) {
    const urlStr = req.url
    const domain = (urlStr.split('/'))[2]
    let urls = []
    for (let i in cdn) {
        for (let j in cdn[i]) {
            if (domain == cdn[i][j].url.split('https://')[1].split('/')[0] && urlStr.match(cdn[i][j].url)) {
                urls = []
                for (let k in cdn[i]) {
                    urls.push(urlStr.replace(cdn[i][j].url, cdn[i][k].url))
                }
                if (urlStr.indexOf('@latest/') > -1) {
                    return lfetch(urls, urlStr)
                } else {
                    return caches.match(req).then(function (resp) {
                        return resp || lfetch(urls, urlStr).then(function (res) {
                            return caches.open(CACHE_NAME).then(function (cache) {
                                cache.put(req, res.clone());
                                return res;
                            });
                        });
                    })
                }
            }
        }
    }
    return fetch(req)
}
const lfetch = async (urls, url) => {
    let controller = new AbortController();
    const PauseProgress = async (res) => {
        return new Response(await (res).arrayBuffer(), { status: res.status, headers: res.headers });
    };
    if (!Promise.any) {
        Promise.any = function (promises) {
            return new Promise((resolve, reject) => {
                promises = Array.isArray(promises) ? promises : []
                let len = promises.length
                let errs = []
                if (len === 0) return reject(new AggregateError('All promises were rejected'))
                promises.forEach((promise) => {
                    promise.then(value => {
                        resolve(value)
                    }, err => {
                        len--
                        errs.push(err)
                        if (len === 0) {
                            reject(new AggregateError(errs))
                        }
                    })
                })
            })
        }
    }
return new Promise((resolve, reject) => {
    setTimeout(() => {
        caches.match(req).then(function (resp) {
            if (!!resp) {
                setTimeout(() => {
                    resolve(resp)
                }, 200);
                setTimeout(() => {
                    lfetch(urls, urlStr).then(async function (res) {
                        return caches.open(CACHE_NAME).then(async function (cache) {
                            cache.delete(req);
                            if (fullpath(pathname).match(/\.html$/g)) {
                                const NewRes = new Response(await res.arrayBuffer(), {
                                    headers: {
                                        'Content-Type': 'text/html;charset=utf-8'
                                    },
                                    status: res.status,
                                    statusText: res.statusText
                                })
                                cache.put(req, NewRes.clone());
                                resolve(NewRes)
                            } else {
                                cache.put(req, res.clone());
                                resolve(res)
                            }
                        });
                    });
                }, 0);
            } else {
                setTimeout(() => {
                    lfetch(urls, urlStr).then(async function (res) {
                        return caches.open(CACHE_NAME).then(async function (cache) {
                            if (fullpath(pathname).match(/\.html$/g)) {
                                const NewRes = new Response(await res.arrayBuffer(), {
                                    headers: {
                                        'Content-Type': 'text/html;charset=utf-8'
                                    },
                                    status: res.status,
                                    statusText: res.statusText
                                })
                                cache.put(req, NewRes.clone());
                                resolve(NewRes)
                            } else {
                                cache.put(req, res.clone());
                                resolve(res)
                            }
                        });
                    }).catch(function (err) {
                        resolve(caches.match(new Request('/offline.html')))
                    })
                }, 0);
                setTimeout(() => {
                    resolve(caches.match(new Request('/offline.html')))
                }, 5000);
            }
        })
    }, 0);
})

