/**
 * this file contains createFontSubsetter vite plugin, that uses subset-font library to subset a chosen font (designed for icon fonts)
 */
import subsetFont from 'subset-font';
import fs from 'fs';
import path from 'path';

export function createFontSubsetter(
    selectedChars: string,
    name: string,
    source: string,
    destination: string,
) {
    const fullName = `font-subsetter-${name}`;
    
    const srcPath = path.resolve(source);
    const destPath = path.resolve(destination);
    
    function log(...args: any[]) {
        console.log("[", fullName, "]", ...args);
    }
    
    return {
        name: fullName,

        async buildStart() {
            try {
                log("subsetting ", selectedChars.length.toString(), "characters from font:", srcPath, "to:", destPath);
                
                log("reading input...");
                const inputBuffer = fs.readFileSync(srcPath);
                
                log("subsetting...");
                const outputBuffer = await subsetFont(
                    inputBuffer,
                    selectedChars,
                    {
                        targetFormat: 'woff2'
                    }
                );
                
                log("creating output file...");
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                log("writing output...");
                fs.writeFileSync(destPath, outputBuffer);
                log("successfully subsetted font:",srcPath);
            } catch (error) {
                log("error encountered:",error);
                process.exit(1);
            }
        },
    };
}
