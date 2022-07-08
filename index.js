// @ts-check

const Express = require('express')
const sendSeekable = require('send-seekable')
const WebTorrent = require('webtorrent')

const app = Express()
app.set('view engine', 'ejs')
app.use(sendSeekable)

const client = new WebTorrent()

client.on('error', (err) => {
	console.error(err)
})
const exisitingTorrents = {}

app.get('/', (req, res) => {
	res.render('index', {title: "Index", torrents: client.torrents});
})

process.on('exit', () => {
	client.destroy(() => {})
})

app.get('/preview', (req, res) => {
	if (!(req.query.location)) {
		res.statusCode = 400
		res.write('No "location" query parameter.')
		return
	}

	const location = /** @type string */ (req.query.location)

	// TODO: why does `location in client.torrents` not work?
	if (location in exisitingTorrents) {
		const torrent = exisitingTorrents[location]
		res.render('preview', {title: `Preview "${torrent.name}"`, torrent})
	} else {
		client.add(
			location,
			(torrent) => {
				torrent._location = location
				exisitingTorrents[location] = torrent
				exisitingTorrents[torrent.infoHash] = torrent
				res.render('preview', {title: `Preview "${torrent.name}"`, torrent})
			}
		)
	}
})

app.post('/destroy/:infoHash', (req, res) => {
	const { infoHash } = req.params
	const torrent = client.get(infoHash)
	if (torrent) {
		delete exisitingTorrents[torrent._location]
		delete exisitingTorrents[torrent.infoHash]
		torrent.destroy({ destroyStore: true })
		res.redirect('/')
	} else {
		res.statusCode = 404
		res.write('Torrent does not exist in client.')
	}
})

app.get('/download/:infoHash/:filename', (req, res) => {
	const { infoHash, filename } = req.params
	const torrent = client.get(infoHash)
	if (torrent) {
		const files = torrent.files.filter(f => f.name == filename)
		if (files.length) {
			const file = files[0]
			const stream = file.createReadStream()
			res.sendSeekable(stream, {length: file.length})	
		} else {
			res.statusCode = 404
			res.write('File does not exist in torrent.')
			return
		}
	} else {
		res.statusCode = 404
		res.write('Client not downloading requested torrent.')
		return
	}	
})

app.listen(4000, () => console.log('webtorrent-server listening @ http://localhost:4000/'))
