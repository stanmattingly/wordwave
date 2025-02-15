// filterWords.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import wordListPath from 'word-list';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const words = fs.readFileSync(path.resolve(dirname, wordListPath), 'utf8').split('\n');
const filteredWords = words.filter(word => word.length >= 3 && word.length <= 20);

fs.writeFileSync(path.join(dirname, '../../../public/dictionary/filteredWords.txt'), filteredWords.join('\n'));
