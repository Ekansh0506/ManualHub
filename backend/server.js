const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { brand, category, model } = req.body;
        if (!brand || !category || !model) return cb(new Error('Brand, category, and model required'));
        const dir = path.join(__dirname, 'uploads', brand, category, model);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDFs are allowed!"));
        }
        cb(null, true);
    }
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('manual'), (req, res) => {
    res.json({ message: 'Uploaded successfully', file: req.file.filename });
});

// List manuals for a specific brand/category/model
app.get('/manuals/:brand/:category/:model', (req, res) => {
    const { brand, category, model } = req.params;
    const dir = path.join(__dirname, 'uploads', brand, category, model);
    if (!fs.existsSync(dir)) return res.json([]);
    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.pdf'))
        .map(f => ({
            name: f,
            url: `/static/manuals/${encodeURIComponent(brand)}/${encodeURIComponent(category)}/${encodeURIComponent(model)}/${encodeURIComponent(f)}`
        }));
    res.json(files);
});

// List ALL manuals (flat list for 'Manuals' page)
app.get('/manuals-all', (req, res) => {
    const baseDir = path.join(__dirname, 'uploads');
    let results = [];

    function walk(dir, brand = '', category = '', model = '') {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (!brand) walk(fullPath, file, '', '');
                else if (!category) walk(fullPath, brand, file, '');
                else if (!model) walk(fullPath, brand, category, file);
            } else if (file.endsWith('.pdf')) {
                results.push({
                    brand, category, model,
                    name: file,
                    url: `/static/manuals/${encodeURIComponent(brand)}/${encodeURIComponent(category)}/${encodeURIComponent(model)}/${encodeURIComponent(file)}`
                });
            }
        });
    }

    walk(baseDir);
    res.json(results);
});

// Serve PDFs
app.use('/static/manuals', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`ManualHub backend running at http://localhost:${PORT}`);
});