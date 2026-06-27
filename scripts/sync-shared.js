const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'api');
const webDir = path.join(rootDir, 'web');

const filesToSync = [
    {
        src: path.join(apiDir, 'src', 'lib', 'db', 'schema.ts'),
        dest: path.join(webDir, 'src', 'db', 'schema.ts'),
    },
    {
        src: path.join(apiDir, 'src', 'lib', 'db', 'index.ts'),
        dest: path.join(webDir, 'src', 'db', 'index.ts'),
    },
    {
        src: path.join(apiDir, 'src', 'lib', 'cityCoords.ts'),
        dest: path.join(webDir, 'src', 'lib', 'cityCoords.ts'),
    },
    {
        src: path.join(apiDir, 'src', 'lib', 'fetch-ads.ts'),
        dest: path.join(webDir, 'src', 'lib', 'fetch-ads.ts'),
        transform: (content) => {
            return content
                .replace(/@\/lib\/db/g, '@/db')
                .replace(/@\/routes\/categories/g, '@/lib/categories');
        }
    }
];

console.log('🔄 Starting shared files synchronization...');

filesToSync.forEach(({ src, dest, transform }) => {
    try {
        if (!fs.existsSync(src)) {
            console.warn(`⚠️ Source file not found: ${src}`);
            return;
        }

        // Ensure destination folder exists
        const destFolder = path.dirname(dest);
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }

        let content = fs.readFileSync(src, 'utf8');
        if (transform) {
            content = transform(content);
        }

        fs.writeFileSync(dest, content, 'utf8');
        console.log(`✅ Synced: ${path.relative(rootDir, src)} -> ${path.relative(rootDir, dest)}`);
    } catch (err) {
        console.error(`❌ Failed to sync file ${src}:`, err.message);
    }
});

console.log('✅ Synchronization completed.');
