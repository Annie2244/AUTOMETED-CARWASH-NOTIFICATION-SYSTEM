const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;

app.use('/js', express.static(path.join(rootDir, 'src/js')));
app.use('/css', express.static(path.join(rootDir, 'css')));
app.get('/backgroundvideo.mp4', (req, res) => res.sendFile(path.join(rootDir, 'backgroundvideo.mp4')));

app.use(express.static(path.join(rootDir, 'src/pages'), { index: false }));
app.get('/', (req, res) => res.sendFile(path.join(rootDir, 'src/pages/index.html')));

app.use((req, res) => res.status(404).send('Not found'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
