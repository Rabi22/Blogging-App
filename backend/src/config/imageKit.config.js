import ImageKit from '@imagekit/nodejs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.Imagekit_private_key;

const imagekit = privateKey
  ? new ImageKit({
      privateKey,
      logLevel: 'debug',
    })
  : null;

export default imagekit;