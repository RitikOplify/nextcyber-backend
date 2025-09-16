import ImageKit from "imagekit";

const initImageKit = function () {
  var imagekit = new ImageKit({
    publicKey: process.env.PUBLIC_KEY_IMAGEKIT,
    privateKey: process.env.PRIVATE_KEY_IMAGEKIT,
    urlEndpoint: process.env.ENDPOINT_IMAGEKIT,
  });
  return imagekit;
};

export default initImageKit;
