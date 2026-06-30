import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  privateKey: process.env.Imagekit_private_key,
  logLevel: 'debug'
});

export default imagekit;