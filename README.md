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
* 67 lines of code! (minus deps)!
* Easy-to-understand real-world usage of WebTorrent!
* Public domain via Unlicense!

## One annoying thing about WebTorrent
`client.get` and `client.add` are not equal functions. The latter *can*
take a torrent file as an arument, but the former can't. You *will* get
an error if you try to add the same file more than once, and the error isn't handled by a callback parameter, but by an *event listener*(?!), meaning
I can't tell the user that a URL has already been added because the error 
is given to me outside of the request context. Therefore, if I 
want to enable someone to refresh a page or navigate backwards, I have to 
keep all requested torrents and their locations in an object, which feels
gross. The WebTorrent team really needs to fix this.

## Run
```bash
npm install
npm start # node index.js
xdg-open http://localhost:4000/
```
