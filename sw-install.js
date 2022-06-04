window.addEventListener('load', async () => {
    navigator.serviceWorker.register(`/sw-mrzefr.js`)
        .then(async reg => {
            //安装成功，建议此处强刷新以立刻执行SW
            if (window.localStorage.getItem('install') != 'true') {
                window.localStorage.setItem('install', 'true');
            }
        }).catch(err => {
            //安装失败，错误信息会由err传参
        })
});
