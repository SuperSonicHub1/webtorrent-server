// @ts-check

const Express = require('express')
const sendSeekable = require('send-seekable')
const WebTorrent = require('webtorrent')
const MemoryChunkStore = require('memory-chunk-store')

// Utilities

/**
 * @param {Express.Response} res 
 */
function doesNotExist(res) {
	res.statusCode = 404
	res.write('Torrent does not exist in client.')
	res.end()
}

/**
 * @param {WebTorrent.Torrent} torrent 
 */
function destroyTorrent(torrent) {
	torrent.destroy({ destroyStore: true })
	console.log(`Torrent ${torrent.name} (${torrent.infoHash}) destroyed.`)
}

const app = Express()
app.set('view engine', 'ejs')
app.use(sendSeekable)

const client = new WebTorrent()

client.on('error', console.error)

app.get('/', (req, res) => res.render('index', {title: "Index", torrents: client.torrents}))

process.on('exit', () => client.destroy())

app.get('/add', (req, res) => {
	if (!(req.query.location)) {
		res.statusCode = 400
		res.write('No "location" query parameter.')
		return
	}

	const location = /** @type string */ (req.query.location)

	client.add(
		location,
		{
			// Most server solutions have limited storage space, which can cause crashes,
			// so we'll use an in-memory solution instead.
			store: MemoryChunkStore,
		},
		(torrent) => {
			// Destroy torrents automatically on finishing of download after 6 hours
			torrent.on("done", () => setTimeout(() => destroyTorrent(torrent), 1000 * 60 * 60 * 6))

			res.redirect(`/preview/${torrent.infoHash}`)
			res.end()
		}
	)
})

app.get('/preview/:infoHash', (req, res) => {
	const { infoHash } = req.params
	const torrent = client.get(infoHash)
	if (torrent) {
		res.render('preview', {title: `Preview "${torrent.name}"`, torrent})
		res.end()
	} else {
		doesNotExist(res)
	}
})

app.post('/destroy/:infoHash', (req, res) => {
	const { infoHash } = req.params
	const torrent = client.get(infoHash)
	if (torrent) {
		destroyTorrent(torrent)
		res.redirect('/')
	} else {
		doesNotExist(res)
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
		doesNotExist(res)
		return
	}	
})

app.listen(4000, () => console.log('webtorrent-server listening @ http://localhost:4000/'))
