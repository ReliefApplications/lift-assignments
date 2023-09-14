import pdfMake from 'pdfmake';
import { Case } from './types';

const getIntlDate = (date: string | Date) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

const getCorrectedText = (status: string) => {
  switch (status) {
    case 'Corrected':
      return 'Yes';
    case 'Partially corrected':
      return 'Partially';
    case 'Not corrected':
      return 'No';
    default:
      return status;
  }
};

export const getCasePDF = (data: Case, flag: string) => {
  const printer = new pdfMake({
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf',
    },
  });
  const docDefinition = {
    header: (currentPage) => {
      if (currentPage === 1 && flag) {
        return [
          {
            image: flag,
            width: 100,
            margin: 40,
          },
        ];
      }
      return [];
    },

    pageMargins: [40, 40, 40, 40],
    pageSize: 'A4',
    pageOrientation: 'portrait',
  };

  const content = [
    {
      text: 'Inspection Report',
      alignment: 'center',
      fontSize: 20,
      bold: true,
    },
    {
      text: `Case ${data.caseID}`,
      alignment: 'center',
      fontSize: 14,
    },
    {
      text: 'Enterprise Information',
      alignment: 'left',
      fontSize: 16,
      bold: true,
      margin: [0, 40, 0, 10],
    },
    {
      columns: [
        {
          text: 'Enterprise Name:',
          width: 'auto',
          bold: true,
        },
        {
          text: data.enterprise.name,
          width: 'auto',
        },
      ],
      columnGap: 5,
      margin: [0, 2],
    },
    {
      columns: [
        {
          text: 'Enterprise identifier:',
          width: 'auto',
          bold: true,
        },
        {
          text: data.enterprise.id,
          width: 'auto',
        },
      ],
      columnGap: 5,
      margin: [0, 2],
    },
    {
      columns: [
        {
          text: 'Address:',
          width: 'auto',
          bold: true,
        },
        {
          text: data.enterprise.address,
          width: 'auto',
        },
      ],
      columnGap: 5,
      margin: [0, 2],
    },
    {
      text: 'Inspection Information',
      alignment: 'left',
      fontSize: 16,
      bold: true,
      margin: [0, 40, 0, 10],
    },
    {
      columns: [
        {
          text: 'First Inspection',
          alignment: 'left',
          fontSize: 14,
          bold: true,
          width: '*',
        },
        {
          text: getIntlDate(data.inspection.date),
          alignment: 'right',
          fontSize: 12,
          width: '*',
        },
      ],
    },
    data.inspection.comments
      ? {
          columns: [
            {
              text: 'Comments:',
              width: 'auto',
              bold: true,
            },
            {
              text: data.inspection.comments,
            },
          ],
          columnGap: 5,
          margin: [0, 15, 0, 0],
        }
      : undefined,
    {
      text: 'Inspection actions',
      margin: [0, 10],
      bold: true,
    },
    {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['*', '15%', 'auto'],

        body: [
          ['Item', 'Action', 'Comment'],
          ...data.inspection.actions.map((x) => [
            x.point || '',
            x.action || '',
            x.comment || '',
          ]),
        ],
      },
    },
    ...data.followups.map((followUp, i) => [
      {
        columns: [
          {
            text: `Follow-up ${i + 1}`,
            alignment: 'left',
            fontSize: 14,
            bold: true,
            width: '*',
          },
          {
            text: getIntlDate(followUp.date),
            alignment: 'right',
            fontSize: 12,
            width: '*',
          },
        ],
        margin: [0, 20, 0, 0],
      },
      followUp.comments
        ? {
            columns: [
              {
                text: 'Comments:',
                width: 'auto',
                bold: true,
              },
              {
                text: followUp.comments,
              },
            ],
            columnGap: 5,
            margin: [0, 15, 0, 0],
          }
        : '',
      {
        columns: [
          {
            text: `Inspection actions${
              followUp.actions.length === 0 ? ':' : ''
            }`,
            bold: true,
            width: 'auto',
          },
          followUp.actions.length === 0
            ? {
                text: 'No issue noted',
                width: 'auto',
              }
            : '',
        ],
        margin: [0, 10],
        columnGap: 5,
      },

      followUp.actions.length
        ? {
            layout: 'lightHorizontalLines',
            table: {
              headerRows: 1,
              widths: ['*', '15%', '15%', 'auto'],

              body: [
                ['Item', 'Corrected', 'Action', 'New comment'],
                ...followUp.actions.map((x) => [
                  x.point || '',
                  getCorrectedText(x.status) || '',
                  x.action || '',
                  x.comment || '',
                ]),
              ],
            },
          }
        : undefined,
    ]),
    {
      margin: [0, 60, 0, 0],
      columns: [
        {
          text: `Date of notification:`,
          width: '*',
          fontSize: 14,
          bold: true,
        },
        {
          columns: [
            {
              text: `Date of report:`,
              width: 'auto',
              fontSize: 14,
              bold: true,
            },
            {
              text: getIntlDate(data.reportDate),
              fontSize: 14,
              width: 'auto',
            },
          ],
          width: '*',
          columnGap: 5,
        },
      ],
    },
    {
      margin: [0, 50, 0, 0],
      columns: [
        {
          stack: [
            {
              text: 'Name and signature of inspector',
              fontSize: 14,
              bold: true,
            },
            {
              text: data.inspector.name,
              fontSize: 12,
            },
          ],
          width: '*',
        },
        {
          stack: [
            {
              text: "Employer's legal representative",
              fontSize: 14,
              bold: true,
            },
            {
              text: data.enterprise.repName,
              fontSize: 12,
            },
          ],
          width: '*',
        },
      ],
    },
  ];

  // Case report definition
  Object.assign(docDefinition, {
    content,
  });

  const doc = printer.createPdfKitDocument(docDefinition as any);

  return new Promise((resolve) => {
    const chunks = [];
    doc.end();
    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
};
