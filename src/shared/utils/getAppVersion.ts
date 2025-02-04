import fs from 'fs';
import path from 'path';

const versionFilePath = path.join(__dirname, 'version.json');

export function getAppVersion(): string | null {
    if (!fs.existsSync(versionFilePath)) {
        console.error('Version file not found');
        return null;
    }

    try {
        const versionData = fs.readFileSync(versionFilePath, 'utf-8');
        const parsedData = JSON.parse(versionData);
        return parsedData.version;
    } catch (error) {
        console.error('Error while reading version:', error);
        return null;
    }
}
