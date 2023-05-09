import sharp from 'sharp'

await sharp({
  text: {
    text: 'Sharp Works!',
    width: 600, // max width
    height: 400 // max height
  }
}).toFile('test.png')

console.log('Sharp Works!')