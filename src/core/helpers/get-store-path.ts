import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

/**
 * if ran directly from source (typescript files) or from the transpiled ones,
 * the path is relative in different ways. The exported constant should always point to the correct folder.
 */

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(currentDir.split('src')[0], 'src');
export const storeDir = join(srcDir, 'store');
