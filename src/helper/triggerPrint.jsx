import { dateFormat } from 'src/utils/formatTime';
import { forEach, get, isEmpty, map } from 'lodash';
import printJS from 'print-js';
import dayjs from 'dayjs';
import { getCurrentDate } from 'src/helper/FormatTime';
import { generateFilename } from 'src/helper/generateFilename';
import jsPDF from 'jspdf';
import { base64_images } from 'src/constants/ImageConstants';

const triggerPrint = (props) => {
  const {
    heading,
    paymentRows,
    startDate,
    endDate,
    title,
    columns,
    docTitle,
    DocTitleRemove,
    logo,
  } = props;
  const printHeader = [];
  const printBody = [];
  const generateHeader = (logo, startDate, endDate, docTitle, DocTitleRemove) => {
    const dateString = `<h3>${dateFormat(startDate)} - ${dateFormat(endDate)}</h3>`;

    const logoElement = logo ? `<img src="${logo}" alt='logo' width="250" height="50" />` : '';

    const titleStyle = docTitle ? `font-size:24px; text-align:center; margin-bottom:10px;` : '';

    const footerText = 'Note: This document is auto-generated and does not require a signature.';
    const footerStyle = `font-size:12px; padding:1px 0`;

    return `
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3>${logoElement}  ${dateString}</h3>
        </div>
        
        <div style="position: absolute; top: 0; left: 0; width: 100%; text-align: center;">
          <h3 style="${titleStyle}">${docTitle}</h3>
          <br/>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; text-align: right;">
          <div style="${footerStyle}">${footerText}</div>
        </div>
        `;
  };

  forEach(columns, (__headerCell) => {
    if (get(__headerCell, 'title') !== 'Print') {
      printHeader.push({
        field: get(__headerCell, 'field'),
        displayName: get(__headerCell, 'title'),
      });
    }
  });

  forEach(paymentRows, (_row) => {
    const row = {};
    forEach(columns, (_headerCell) => {
      const addCurrencySymbolTitles = ['Order Amount(₹)', 'Total Amount(₹)', 'GST Amount(₹)'];

      if (title !== 'ProfitAndLoss') {
        addCurrencySymbolTitles.push('Price(₹)');
      }
      console.log(_row);
      if (addCurrencySymbolTitles.includes(get(_headerCell, 'title'))) {
        const fieldValue = get(_row, get(_headerCell, 'field'), 0);
        row[get(_headerCell, 'field')] = fieldValue / 100 || 0;
      } else if (get(_headerCell, 'title') === 'Total(₹)') {
        const fieldValue = _row.orderAmount / 100 || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Paid amount(₹)') {
        const fieldValue = get(_row, 'payments.paidAmount') / 100 || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Mode') {
        const fieldValue = get(_row, 'payments.mode');
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Payment type') {
        const fieldValue = _row.type;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Order amount(₹)') {
        const fieldValue = get(_row, 'orderAmount') / 100;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Payment status') {
        const fieldValue = get(_row, 'payments.paymentStatus');
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Unit price(₹)') {
        const fieldValue = _row.price / 100 / _row.quantity || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Product total(₹)') {
        const fieldValue = (_row.price / 100 / _row.quantity) * _row.quantity || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Amount') {
        const fieldValue = _row.price / 100;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Amount(₹)') {
        const fieldValue = (_row.orderAmount - _row.GSTPrice) / 100 || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'E.Amount(₹)') {
        const fieldValue = _row.amountSpent / 100 || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Collected Amount(₹)') {
        const fieldValue = _row['totalPrice'] || _row['total_price'] || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Total price(₹)') {
        const fieldValue = _row['totalPrice'] || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Total Orders') {
        const fieldValue = _row['totalOrders'] || '-';
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Collected Amount(₹)') {
        const fieldValue = _row.total_price || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'GST(₹)') {
        const fieldValue = _row.GSTPrice / 100 || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'title') === 'Profit(₹)') {
        const fieldValue = typeof _row.profit === 'string' ? '--' : _row.profit;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (
        get(_headerCell, 'title') === 'Units' &&
        get(_row, `${get(_headerCell, 'field')}`) !== null
      ) {
        const fieldValue = _row.unit + _row.unitName;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_headerCell, 'field') === 'roundOff') {
        const fieldValue = _row.roundOff / 100 || 0;
        row[get(_headerCell, 'field')] = fieldValue;
      } else if (get(_row, `${get(_headerCell, 'field')}`) === null) {
        row[get(_headerCell, 'field')] = '--';
      } else if (get(_row, `${get(_headerCell, 'field')}`) === undefined) {
        row[get(_headerCell, 'field')] = '--';
      } else {
        row[get(_headerCell, 'field')] = get(_row, `${get(_headerCell, 'field')}`);
      }
    });
    printBody.push(row);
  });
  let titleNamePrint = title;

  if (startDate && endDate) {
    const startDateFormatted = dayjs(startDate).format('DD-MM-YYYY');
    const endDateFormatted = dayjs(endDate).format('DD-MM-YYYY');
    titleNamePrint += ` (${startDateFormatted} to ${endDateFormatted})`;
  } else if (startDate) {
    const startDateFormatted = dayjs(startDate).format('DD-MM-YYYY');
    titleNamePrint += ` (from ${startDateFormatted})`;
  } else if (endDate) {
    const endDateFormatted = dayjs(endDate).format('DD-MM-YYYY');
    titleNamePrint += ` (to ${endDateFormatted} )`;
  } else {
    const currentDate = getCurrentDate();
    const dateF = new Date(currentDate).toISOString().split('T')[0];
    const dateFormatted = dayjs(dateF).format('DD-MM-YYYY');
    titleNamePrint += ` ( ${dateFormatted} )`;
  }

  //   const handleExportPDF = async () => {
  //     try {
  //       const fileName = generateFilename(title);
  //       const doc = new jsPDF();

  //       // Table header
  //       const headers = [map(printHeader, 'displayName')];
  //       // Table rows
  //       const rows = map(printBody, (it) => Object.values(it));
  //       // doc.text('POSITEASY', 10, 10);
  //       doc.addImage(base64_images.Logo_pos, 10, 10, 35, 8);
  //       doc.text(docTitle, 80, 20);

  //       // Add table to the document
  //       doc.autoTable({
  //         startY: 25,
  //         head: headers,
  //         body: rows,
  //         headStyles: {
  //           halign: 'center',
  //           valign: 'middle',
  //           fillColor: [90, 11, 69],
  //         },
  //         bodyStyles: { halign: 'center' },
  //       });

  //       doc.save(`${fileName}.pdf`);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  //   handleExportPDF();

  console.log('kkkkk', printHeader, printBody);

  printJS({
    documentTitle: DocTitleRemove || ' ',
    printable: printBody,
    type: 'json',
    properties: printHeader,
    header: generateHeader(logo, startDate, endDate, docTitle),
    gridStyle:
      'border: 1px solid lightgray; margin-bottom: -1px;padding-bottom:4px; padding-top:4px;',
    onError: function (error) {
      console.log(error);
      alert('Error found.');
    },
  });
};

export default triggerPrint;
