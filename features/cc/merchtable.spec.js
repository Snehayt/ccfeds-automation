module.exports = {
    name: 'merchtable',
      features: [
        {
          tcid: '0',
          name: '@merchtable-3column-layout-block',
          path: '/creativecloud/animation/testdoc/automation-pw/merch-table.html?languageBanner=off',
          tags: '@cc @cc-merchtable @cc-merchtableui',
        },
        {
          tcid: '1',
          name: '@merchtable-headrowitems',
          path: '/creativecloud/animation/testdoc/automation-pw/merch-table.html?languageBanner=off',
          tags: '@cc @cc-merchtable @cc-merchtableheadrow',
        },
        {
          tcid: '2',
          name: '@merchtable-rowheadprices',
          path: '/creativecloud/animation/testdoc/automation-pw/merch-table.html?languageBanner=off',
          tags: '@cc @cc-merchtable @cc-merchtableprices',
          data: {
            ccIndividualPrice: 'US$54.99/mo',
            ccStudentPrice: 'US$9.99/mo',
            ccTeamsprice: 'US$22.99/mo',
            ccTeamsStrikeThrough: 'Regularly at US$54.99 per month'
          },
        },
        {
          tcid: '3',
          name: '@merchtable-appdetails',
          path: '/creativecloud/animation/testdoc/automation-pw/merch-table.html?languageBanner=off',
          tags: '@cc @cc-merchtable @cc-appdeatilsinrows',
        },
        {
          tcid: '4',
          name: '@merchtable-priceCTA',
          path: '/creativecloud/animation/testdoc/automation-pw/merch-table.html?languageBanner=off',
          tags: '@cc @cc-merchtable @cc-PriceCtacommerce',
          // item id is the offer's OST-assigned hash and can change independently of
          // this test's intent (verifying Buy Now reaches commerce checkout), so it's
          // wildcarded rather than pinned to a specific value.
          commerceurl : /^https:\/\/commerce\.adobe\.com\/store\/commitment\?items%5B0%5D%5Bid%5D=[0-9A-F]+&cli=adobe_com&co=IN&ctx=fp&lang=en$/,
        },     
      ],
    };