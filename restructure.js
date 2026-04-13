const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const mappings = [
    { from: 'utils', to: 'core/utils' },
    { from: 'types', to: 'core/types' },
    { from: 'services/api', to: 'data/api' },
    { from: 'services/firebase', to: 'data/firebase' },
    { from: 'components', to: 'presentation/common' },
    { from: 'screens', to: 'presentation/screens' },
    { from: 'navigation', to: 'presentation/navigation' },
    { from: 'theme', to: 'presentation/themes' },
    { from: 'store', to: 'presentation/state' }
];

// Helper to ensure dir exists
function ensureDir(targetPath) {
    fs.mkdirSync(targetPath, { recursive: true });
}

// Ensure target directories exist before moving
['core', 'data', 'domain', 'presentation/dialogs'].forEach(d => {
    ensureDir(path.join(srcDir, d));
});

// Move folders
console.log('--- MOVING DIRECTORIES ---');
mappings.forEach(({ from, to }) => {
    const fromPath = path.join(srcDir, from);
    const toPath = path.join(srcDir, to);
    if (fs.existsSync(fromPath)) {
        ensureDir(path.dirname(toPath)); // ensure parent exists
        fs.renameSync(fromPath, toPath);
        console.log(`Moved src/${from} to src/${to}`);
    } else {
        console.log(`WARN: src/${from} not found, skipping.`);
    }
});

// Helper to walk all files in a directory
function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walkSync(filepath, filelist);
        } else {
            filelist.push(filepath);
        }
    });
    return filelist;
}

// Map of imports to replace
const importReplacements = [
    { regex: /@\/components\/([^'"]+)/g, replacement: '@/presentation/common/$1' },
    { regex: /@\/components(['"])/g, replacement: '@/presentation/common$1' },
    { regex: /@\/navigation\/([^'"]+)/g, replacement: '@/presentation/navigation/$1' },
    { regex: /@\/navigation(['"])/g, replacement: '@/presentation/navigation$1' },
    { regex: /@\/screens\/([^'"]+)/g, replacement: '@/presentation/screens/$1' },
    { regex: /@\/screens(['"])/g, replacement: '@/presentation/screens$1' },
    { regex: /@\/theme\/([^'"]+)/g, replacement: '@/presentation/themes/$1' },
    { regex: /@\/theme(['"])/g, replacement: '@/presentation/themes$1' },
    { regex: /@\/utils\/([^'"]+)/g, replacement: '@/core/utils/$1' },
    { regex: /@\/utils(['"])/g, replacement: '@/core/utils$1' },
    { regex: /@\/types\/([^'"]+)/g, replacement: '@/core/types/$1' },
    { regex: /@\/types(['"])/g, replacement: '@/core/types$1' },
    { regex: /@\/services\/api\/([^'"]+)/g, replacement: '@/data/api/$1' },
    { regex: /@\/services\/api(['"])/g, replacement: '@/data/api$1' },
    { regex: /@\/services\/firebase\/([^'"]+)/g, replacement: '@/data/firebase/$1' },
    { regex: /@\/services\/firebase(['"])/g, replacement: '@/data/firebase$1' },
    { regex: /@\/store\/([^'"]+)/g, replacement: '@/presentation/state/$1' },
    { regex: /@\/store(['"])/g, replacement: '@/presentation/state$1' }
];

console.log('--- UPDATING IMPORTS ---');
// Walk all files in root and src (App.tsx and all inside src)
const rootFiles = [path.join(__dirname, 'App.tsx'), path.join(__dirname, 'index.js')].filter(f => fs.existsSync(f));
const srcFiles = walkSync(srcDir);
const allFiles = [...rootFiles, ...srcFiles];

allFiles.forEach(filepath => {
    if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
        let content = fs.readFileSync(filepath, 'utf8');
        let modified = false;

        importReplacements.forEach(({ regex, replacement }) => {
            const newContent = content.replace(regex, replacement);
            if (newContent !== content) {
                modified = true;
                content = newContent;
            }
        });

        if (modified) {
            fs.writeFileSync(filepath, content, 'utf8');
            console.log(`Updated imports in ${filepath.replace(__dirname, '')}`);
        }
    }
});

// Optional cleanup of empty directories
try {
    if (fs.existsSync(path.join(srcDir, 'services'))) {
        fs.rmdirSync(path.join(srcDir, 'services'));
        console.log('Cleaned up src/services');
    }
} catch (e) {
    console.log('Could not removed src/services, maybe not empty.');
}

console.log('--- DONE ---');
