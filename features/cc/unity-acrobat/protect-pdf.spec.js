const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-ProtectPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-ProtectPdf-UI',
      path: '/acrobat/online/password-protect-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-protect-pdf @cc-acrobat-protect-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-ProtectPdf-Upload',
      path: '/acrobat/online/password-protect-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-protect-pdf @cc-acrobat-protect-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-ProtectPdf-Splash',
      path: '/acrobat/online/password-protect-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-protect-pdf @cc-acrobat-protect-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-ProtectPdf-Redirect',
      path: '/acrobat/online/password-protect-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-protect-pdf @cc-acrobat-protect-pdf-redirect',
    },
  ],
};
