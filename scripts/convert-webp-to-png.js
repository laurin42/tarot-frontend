const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Konfiguration
const config = {
    // Verzeichnisse, in denen nach .webp Dateien gesucht werden soll
    sourceDirs: [
        path.resolve(__dirname, '../assets'),
        path.resolve(__dirname, '../assets/images'),
    ],
    // Qualität der PNG-Ausgabe (0-100)
    quality: 95,
    // Ob die ursprüngliche Webp-Datei behalten werden soll
    keepOriginal: true,
    // Ob bestehende PNG-Dateien überschrieben werden sollen
    overwriteExisting: false,
};

/**
 * Konvertiert eine einzelne Webp-Datei zu PNG
 * @param {string} sourcePath Pfad zur Webp-Datei
 * @returns {Promise<string>} Pfad zur erzeugten PNG-Datei
 */
async function convertWebpToPng(sourcePath) {
    // Ziel-Dateiname generieren (gleiches Verzeichnis, gleicher Name, aber .png)
    const targetPath = sourcePath.replace(/\.webp$/i, '.png');

    // Überprüfen, ob die Zieldatei bereits existiert
    const targetExists = await fs.pathExists(targetPath);
    if (targetExists && !config.overwriteExisting) {
        console.log(`⏭️ Überspringe: ${path.basename(targetPath)} existiert bereits`);
        return targetPath;
    }

    try {
        // Konvertierung mit Sharp durchführen
        await sharp(sourcePath)
            .png({ quality: config.quality })
            .toFile(targetPath);

        console.log(`✅ Konvertiert: ${path.basename(sourcePath)} → ${path.basename(targetPath)}`);

        // Originale Webp-Datei löschen, wenn gewünscht
        if (!config.keepOriginal) {
            await fs.remove(sourcePath);
            console.log(`🗑️ Gelöscht: ${path.basename(sourcePath)}`);
        }

        return targetPath;
    } catch (error) {
        console.error(`❌ Fehler bei Konvertierung von ${sourcePath}:`, error.message);
        throw error;
    }
}

/**
 * Findet alle Webp-Dateien in den konfigurierten Verzeichnissen und konvertiert sie
 */
async function convertAllWebpFiles() {
    try {
        console.log('🔍 Suche nach .webp Dateien...');

        // Alle .webp Dateien in den konfigurierten Verzeichnissen suchen
        const webpFiles = [];

        for (const dir of config.sourceDirs) {
            if (await fs.pathExists(dir)) {
                const files = await new Promise((resolve, reject) => {
                    glob(`${dir}/**/*.webp`, (err, matches) => {
                        if (err) reject(err);
                        else resolve(matches);
                    });
                });
                webpFiles.push(...files);
            }
        }

        console.log(`🔎 ${webpFiles.length} .webp Dateien gefunden.`);

        if (webpFiles.length === 0) {
            console.log('✨ Keine Dateien zum Konvertieren gefunden.');
            return [];
        }

        // Dateien konvertieren
        const results = await Promise.all(webpFiles.map(file => convertWebpToPng(file)));

        // Statistik ausgeben
        console.log('\n📊 Konvertierungsstatistik:');
        console.log(`   - ${results.length} Dateien verarbeitet`);
        console.log(`   - ${results.filter(r => r).length} Dateien erfolgreich konvertiert`);
        console.log(`   - ${results.length - results.filter(r => r).length} Fehler`);

        // Hinweis für App-Konfiguration
        console.log('\n💡 Tipp: Vergessen Sie nicht, Ihre Bildpfade in der App zu aktualisieren!');

        return results.filter(r => r);
    } catch (error) {
        console.error('❌ Fehler bei der Batch-Konvertierung:', error.message);
        throw error;
    }
}

/**
 * Aktualisiert Bildreferenzen in bestimmten Dateien
 * @param {string[]} convertedFiles Liste der konvertierten Dateien
 */
async function updateImageReferences(convertedFiles) {
    // Diese Funktion kann implementiert werden, wenn automatische Aktualisierungen
    // von Bildreferenzen in Codedateien gewünscht sind
    console.log('\n⚠️ Manuelle Aktualisierung: Denken Sie daran, Bildreferenzen in Ihrem Code zu aktualisieren, z.B.:');
    console.log('   - Pfade in require()-Aufrufen');
    console.log('   - Referenzen in constants/tarotcards.ts');
    console.log('   - Pfade in app.json und anderen Konfigurationsdateien');
}

// Hauptfunktion
async function main() {
    console.log('🖼️  Webp zu PNG Konverter - Start');
    console.log('=================================');

    try {
        // Paket-Abhängigkeiten prüfen
        if (!fs.existsSync(path.join(__dirname, '../node_modules/sharp'))) {
            console.error('❌ Sharp ist nicht installiert. Bitte führen Sie "npm install sharp" aus.');
            process.exit(1);
        }

        if (!fs.existsSync(path.join(__dirname, '../node_modules/glob'))) {
            console.log('📦 Installiere benötigte Abhängigkeit: glob...');
            require('child_process').execSync('npm install glob', { stdio: 'inherit' });
        }

        // Konvertierung durchführen
        const convertedFiles = await convertAllWebpFiles();

        // Tipps zur Aktualisierung von Bildreferenzen
        if (convertedFiles.length > 0) {
            await updateImageReferences(convertedFiles);
        }

        console.log('\n✨ Konvertierung abgeschlossen!');
    } catch (error) {
        console.error('\n❌ Ein Fehler ist aufgetreten:', error);
        process.exit(1);
    }
}

// Skript ausführen
main();