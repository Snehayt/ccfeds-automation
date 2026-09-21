module.exports = {
  name: 'breadcrumb',
  features: [
    {
      tcid: '0',
      name: '@breadcrumb-display',
      path: '/creativecloud/animation/testdoc/automation-pw/breadcrumb.html?languageBanner=off',
      tags: '@cc @cc-breadcrumb @cc-breadcrumbdisplay',
    },
    {
      tcid: '1',
      name: '@breadcrumb-displayfirstlevelcheck',
      path: '/creativecloud/animation/testdoc/automation-pw/breadcrumb.html?languageBanner=off',
      tags: '@cc @cc-breadcrumb @cc-breadcrumbfirstlevellinkcheck',
      url: 'https://www.stage.adobe.com/',
    },
    {
      tcid: '2',
      name: '@breadcrumb-displaypageparentlink',
      path: '/creativecloud/animation/testdoc/automation-pw/breadcrumb.html?languageBanner=off',
      tags: '@cc @cc-breadcrumb @cc-breadcrumbparentlinkcheck',
      url: 'https://www.stage.adobe.com/products/photoshop.html',
    },
  ],
};