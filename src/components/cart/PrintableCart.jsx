import { get, map, isEmpty } from 'lodash';
import { useEffect } from 'react';
import DateHelper from 'src/helper/DateHelper';
import PrinterService from 'src/services/PrinterService';
import {
  allConfiguration,
  cart,
  currentStoreId,
  customCode,
  customerCode,
  noStockProducts,
  selectedBLE,
  selectedUSB,
} from 'src/global/recoilState';
import { useRecoilValue } from 'recoil';
import { fCurrency } from 'src/utils/formatNumber';
import moment from 'moment';
const PrintableCart = (props) => {
  const {
    totalGST,
    totalDiscount,
    sortedData,
    totalQuantity,
    totalValueNoOffer,
    totalOrderValue,
    printerInfo,
    orderId,
    estimateId,
    content,
    additionalCharges,
    additionalDiscount,
    packingCharges,
    deliveryCharges,
    isHidePaymentStatus,
    printerPaperSize,
    balance,
    roundedOff,
    totalOrderQuantity,
  } = props;

  const configuration = useRecoilValue(allConfiguration);
  const printInfomationData = get(configuration, 'printInfo.printInformation');
  const title = get(printInfomationData, 'shopName');
  const subTitle = get(printInfomationData, 'address');
  const footer = get(printInfomationData, 'footer');
  const items = sortedData;
  const totalAmount = totalValueNoOffer;
  const totalCartItems = sortedData?.length;
  const totalQty = totalQuantity;
  const gstAmount = totalGST;
  const totalWithGst = totalOrderValue;
  const paymentStatus = estimateId ? 'ESTIMATE' : 'PAID';
  const orderDate = moment().format('MMM DD, YYYY h:mm A');
  const is28mm = printerPaperSize === 28;
  return (
    <div
      id="print"
      style={{ visibility: 'hidden', position: 'fixed', top: 0, left: 0, width: '800px' }}
    >
      <div style={{ display: 'flex', justifyContent: content ? 'space-between' : 'flex-end' }}>
        {content && (
          <div style={{ fontSize: is28mm ? '16px' : '18px', fontWeight: 'bold' }}>DUPLICATE</div>
        )}
        <div style={{ fontSize: is28mm ? '16px' : '18px', fontWeight: 'bold' }}>
          {!isHidePaymentStatus ? paymentStatus : ''}
        </div>
      </div>

      <div
        style={{
          fontSize: is28mm ? '16px' : '18px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: is28mm ? '12px' : '14px', textAlign: 'center' }}>{subTitle}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px dashed #000',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            fontSize: estimateId ? (is28mm ? '10px' : '12px') : is28mm ? '12px' : '14px',
            textAlign: 'right',
          }}
        >
          Date: &nbsp; <b>{orderDate}</b>
        </div>

        {orderId && (
          <div
            style={{
              fontSize: estimateId ? (is28mm ? '10px' : '12px') : is28mm ? '12px' : '14px',
              textAlign: 'left',
              marginLeft: 'auto',
            }}
          >
            Order No: &nbsp;
            <b
              style={{
                fontSize: estimateId ? (is28mm ? '10px' : '12px') : is28mm ? '12px' : '14px',
              }}
            >
              {orderId}
            </b>
          </div>
        )}
        {estimateId && (
          <div
            style={{
              fontSize: estimateId ? (is28mm ? '10px' : '12px') : is28mm ? '12px' : '14px',
              textAlign: 'left',
              marginLeft: 'auto',
            }}
          >
            Estimate No: &nbsp;
            <b
              style={{
                fontSize: estimateId ? (is28mm ? '10px' : '12px') : is28mm ? '12px' : '14px',
              }}
            >
              {estimateId}
            </b>
          </div>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          fontWeight: 'bold',
          alignItems: 'center',
          gridTemplateColumns: '45% 15% 20% 20%',
        }}
      >
        <div
          style={{ fontSize: is28mm ? '12px' : '14px', overflow: 'hidden', marginRight: 'auto' }}
        >
          Item{' '}
        </div>
        <div style={{ fontSize: is28mm ? '12px' : '14px', textAlign: 'right' }}>Qty </div>
        <div style={{ fontSize: is28mm ? '12px' : '14px', textAlign: 'right', marginLeft: 'auto' }}>
          Price(₹){' '}
        </div>
        <div style={{ fontSize: is28mm ? '12px' : '14px', textAlign: 'right', marginLeft: 'auto' }}>
          Amt(₹){' '}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          lineHeight: '2px',
          alignItems: 'center',
          fontSize: is28mm ? '12px' : '14px',
        }}
      ></div>

      <div>
        {map(items, (e) => {
          return (
            <div>
              <div
                style={{
                  display: 'grid',
                  alignItems: 'center',
                  gridTemplateColumns: '45% 15% 20% 20%',
                }}
              >
                <div
                  style={{
                    fontSize: is28mm ? '12px' : '14px',
                    overflow: 'hidden',
                    marginRight: 'auto',
                  }}
                >
                  {get(e, 'name')}
                </div>
                <div style={{ fontSize: is28mm ? '12px' : '14px', textAlign: 'right' }}>
                  {get(e, 'quantity')}{' '}
                </div>
                <div
                  style={{
                    fontSize: is28mm ? '12px' : '14px',
                    textAlign: 'right',
                    marginLeft: 'auto',
                  }}
                >
                  {get(e, 'price')}
                </div>
                <div
                  style={{
                    fontSize: is28mm ? '12px' : '14px',
                    textAlign: 'right',
                    marginLeft: 'auto',
                  }}
                >
                  {get(e, 'price') * get(e, 'quantity')}
                </div>
              </div>
              {map(get(e, 'addOns'), (d) => {
                return (
                  <div
                    style={{
                      display: 'grid',
                      alignItems: 'center',
                      gridTemplateColumns: '45% 15% 20% 20%',
                    }}
                  >
                    <div
                      style={{
                        fontSize: is28mm ? '12px' : '14px',
                        overflow: 'hidden',
                        marginRight: 'auto',
                      }}
                    >
                      -Addon: {get(d, 'name')}
                    </div>
                    <div style={{ fontSize: is28mm ? '12px' : '14px', textAlign: 'left' }}>
                      {get(d, 'quantity')}{' '}
                    </div>
                    <div
                      style={{
                        fontSize: is28mm ? '12px' : '14px',
                        textAlign: 'right',
                        marginLeft: 'auto',
                      }}
                    >
                      {get(d, 'price')}
                    </div>
                    <div
                      style={{
                        fontSize: is28mm ? '12px' : '14px',
                        textAlign: 'right',
                        marginLeft: 'auto',
                      }}
                    >
                      {get(d, 'price') * get(d, 'quantity')}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marignTop: '20px',
          borderTop: '1px dashed #000',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginRight: 5 }}
        >
          <div
            style={{ fontSize: is28mm ? '14px' : '16px', fontWeight: 'bold', marginRight: 'auto' }}
          >
            Total Items:
          </div>
          <div style={{ fontSize: is28mm ? '16px' : '18px', fontWeight: 'bold', marginLeft: 2 }}>
            {totalCartItems}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
          <div
            style={{ fontSize: is28mm ? '14px' : '16px', fontWeight: 'bold', marginRight: 'auto' }}
          >
            Total Qty:
          </div>
          <div style={{ fontSize: is28mm ? '16px' : '18px', fontWeight: 'bold', marginLeft: 2 }}>
            {' '}
            {totalQty}{' '}
          </div>
        </div>
      </div>

      <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: is28mm ? '14px' : '16px', marginRight: 'auto' }}>Total Summary</div>
        <div style={{ fontSize: is28mm ? '14px' : '16px' }}>{totalAmount?.toFixed(2)}</div>
      </div>

      {!!totalDiscount && (
        <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: is28mm ? '12px' : '14px', marginRight: 'auto' }}>
            Total Discount
          </div>
          <div>
            <span style={{ fontSize: is28mm ? '12px' : '14px' }}>-</span>
            <span style={{ fontSize: is28mm ? '12px' : '14px' }}>{fCurrency(totalDiscount)}</span>
          </div>
        </div>
      )}
      <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: is28mm ? '12px' : '14px', marginRight: 'auto' }}>SGST</div>
        <div>
          <span style={{ fontSize: is28mm ? '12px' : '14px' }}>+</span>
          <span style={{ fontSize: is28mm ? '12px' : '14px' }}>
            {fCurrency((gstAmount / 2).toFixed(2))}
          </span>
        </div>
      </div>
      <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: is28mm ? '12px' : '14px', marginRight: 'auto' }}>CGST</div>
        <div>
          <span style={{ fontSize: is28mm ? '12px' : '14px' }}>+</span>
          <span style={{ fontSize: is28mm ? '12px' : '14px' }}>
            {fCurrency((gstAmount / 2).toFixed(2))}
          </span>
        </div>
      </div>

      {additionalDiscount > 0 && (
        <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: is28mm ? '14px' : '16px', marginRight: 'auto' }}>
            Additional Discount
          </div>
          <div>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>-</span>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>{additionalDiscount}</span>
          </div>
        </div>
      )}

      {additionalCharges > 0 && (
        <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: is28mm ? '14px' : '16px', marginRight: 'auto' }}>
            Additional Charges
          </div>
          <div>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>+</span>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>{additionalCharges}</span>
          </div>
        </div>
      )}
      {packingCharges > 0 && (
        <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: is28mm ? '14px' : '16px', marginRight: 'auto' }}>
            Packing Charges
          </div>
          <div>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>+</span>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>{packingCharges}</span>
          </div>
        </div>
      )}
      {deliveryCharges > 0 && (
        <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: is28mm ? '14px' : '16px', marginRight: 'auto' }}>
            Delivery Charges
          </div>
          <div>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>+</span>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>{deliveryCharges}</span>
          </div>
        </div>
      )}
      {roundedOff?.value > 0 && (
        <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: is28mm ? '14px' : '16px', marginRight: 'auto' }}>Rounded Off</div>
          <div>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>{roundedOff?.symbol}</span>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>{roundedOff?.value}</span>
          </div>
        </div>
      )}
      {balance && (
        <div style={{ marignTop: '20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: is28mm ? '14px' : '16px', marginRight: 'auto' }}>Balance</div>
          <div>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>+</span>
            <span style={{ fontSize: is28mm ? '14px' : '16px' }}>{balance}</span>
          </div>
        </div>
      )}

      <div
        style={{
          marignTop: '20px',
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px dashed #000',
          borderBottom: '1px dashed #000',
          marginTop: '10px',
        }}
      >
        <div
          style={{ fontSize: is28mm ? '16px' : '18px', fontWeight: 'bold', marginRight: 'auto' }}
        >
          Grand Total
        </div>
        <div style={{ fontSize: is28mm ? '20px' : '22px', fontWeight: 'bold' }}>{totalWithGst}</div>
      </div>
      <div style={{ fontSize: is28mm ? '14px' : '16px', fontWeight: 'bold', textAlign: 'center' }}>
        {footer}
      </div>
      <div>.</div>
    </div>
  );
};
export default PrintableCart;
