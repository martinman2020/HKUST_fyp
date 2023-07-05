import Compress from "compress.js";

const compress = new Compress()

export default async function resizeImage(file) {

    const resizedImage = await compress.compress([file], {
      size: 2, // the max size in MB, defaults to 2MB
      quality: 1, // the quality of the image, max is 1,
      maxWidth: 400, // the max width of the output image, defaults to 1920px
      maxHeight: 400, // the max height of the output image, defaults to 1920px
      resize: true // defaults to true, set false if you do not want to resize the image width and height
    })
    const img = resizedImage[0];
    const base64str = img.data
    return "data:image/jpeg;base64,"+base64str
    const imgExt = img.ext
    const resizedFiile = Compress.convertBase64ToFile(base64str, imgExt)
    return resizedFiile;
  }