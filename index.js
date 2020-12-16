const {createServer} = require('http');
const fs = require('fs');
const axios = require('axios');
const rxjs = require('rxjs')

function getByUrl(key, url) {
    return new rxjs.Observable(subscriber => {
        axios.get(url, {
            params: {wd: "大秦"}
        }).then(res => {
            subscriber.next(`"${key}": {"ok": true, "data": ${JSON.stringify(res.data.data)}}`);
        }).catch(() => {
            subscriber.next(`"${key}": {"ok": false, "data": []}`);
        }).finally(() => {
            subscriber.complete();
        });
    });
}

function home(req, res) {
    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    res.writeHead(200);
    fs.createReadStream('./index.html').pipe(res);
}

function data(req, res) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.writeHead(200);
    res.write(`{"code": 1, "data": {`);
    const obs = [
        getByUrl("okzy", "https://cj.okzy.tv/inc/feifei3ckm3u8s/"),
        getByUrl("1156zy", "http://cj.1156zy.net/inc/feifei3/"),
        getByUrl("yongjiuzyw", "http://cj.yongjiuzyw.com/inc/s_feifei3/"),
        getByUrl("zdziyuan", "http://www.zdziyuan.com/inc/s_feifei3.4/"),
        getByUrl("1886zy", "http://cj.1886zy.co/inc/feifei3/")
    ];
    let i = 1;
    rxjs.merge(...obs)
        .subscribe({
            next: (data) => {
                const shouldAddComma = i < obs.length;
                res.write(data)
                if (shouldAddComma) {
                    res.write(",")
                }
                i++;
            },
            complete: () => res.end("}}")
        })
}

const serve = createServer((req, res) => {
    switch (req.url) {
        case '/':
            home(req, res);
            break;
        case '/data':
            data(req, res);
            break;
        default:
            res.end();
    }
});

serve.listen(8080);
