# webtorrent-server
A simple HTTP client for [WebTorrent](https://webtorrent.io).

webtorrent-server enables one to access the contents 
of torrents where one lacks access to JavaScript, WebRTC, or an
unmonitored network, such as older browsers, smart TVs, game consoles,
school, or work.

The main draw of this server is the ability to seek WebTorrent streams
through [HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests) via [send-seekable](https://www.npmjs.com/package/send-seekable). This makes webtorrent-server significantly more reliable
for watching video compared to clients that make use of WebTorrent directly.

## Other cool things about this app
* No JavaScript or CSS!
* 107 (minus deps) lines of code! !
* Easy-to-understand real-world usage of WebTorrent!
* Public domain via Unlicense!

## Run
```bash
npm install
npm start # node index.js

# In another window…
xdg-open http://localhost:4000/
```
