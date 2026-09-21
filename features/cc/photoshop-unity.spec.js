const IMAGE_FILE = 'assets/ballon.jpg';
const INVALID_FILE = 'assets/CT-GenAI_-_Syllabus_v1.0.pdf';

module.exports = {
    name: 'CC-Photoshop-Unity-Widget',
    features: [
      {
        tcid: '0',
        name: '@CC-PhotoshopUnity-UI',
        path: '/products/photoshop/remove-background.html?languageBanner=off',
        tags: '@cc @cc-PSUnitywidget @cc-removeBGCheckUI',
      },
      {
        tcid: '1',
        name: '@CC-PhotoshopUnity-FileUpload',
        path: '/products/photoshop/remove-background.html?languageBanner=off',
        data: { file: IMAGE_FILE },
        tags: '@cc @cc-PSUnitywidget @cc-removeBGFileUpload',
      },
      {
        tcid: '2',
        name: '@CC-PhotoshopUnity-PSpage',
        path: '/products/photoshop/remove-background.html?languageBanner=off',
        data: { file: IMAGE_FILE },
        tags: '@cc @cc-PSUnitywidget @cc-removeBGPSpage',
        url: 'https://stage.photoshop.adobe.com/id',
      },
      {
        tcid: '3',
        name: '@CC-PhotoshopUnity-InvalidFile',
        path: '/products/photoshop/remove-background.html?languageBanner=off',
        data: { file: INVALID_FILE },
        tags: '@cc @cc-PSUnitywidget @cc-removeBGInvalidFile',
      },
      {
        tcid: '4',
        name: '@CC-PSUnityProductNavigation-UI',
        path: '/products/photoshop/online.html?languageBanner=off',
        tags: '@cc @cc-PSUnitywidget @cc-PSProductPageUI',
      },
      {
        tcid: '5',
        name: '@CC-PSUnityProductNavigation',
        path: '/products/photoshop/online.html?languageBanner=off',
        data: { file: IMAGE_FILE },
        tags: '@cc @cc-PSUnitywidget @cc-PSProductPageNavigate',
        url: 'https://stage.photoshop.adobe.com/',
      },
      {
        tcid: '6',
        name: '@CC-PhotoshopUnity-FileUploadDropzone',
        path: '/products/photoshop/remove-background.html?languageBanner=off',
        data: { file: IMAGE_FILE },
        tags: '@cc @cc-PSUnitywidget @cc-removeBGFileUploadDropzone',
      },
      {
        tcid: '7',
        name: '@CC-PSUnityProductNavigation-Dropzone',
        path: '/products/photoshop/online.html?languageBanner=off',
        data: { file: IMAGE_FILE },
        tags: '@cc @cc-PSUnitywidget @cc-PSProductPage-Dropzone',
      },
    ],
  };