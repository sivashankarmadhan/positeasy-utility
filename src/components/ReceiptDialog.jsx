import { Dialog } from '@mui/material';
import * as htmlToImage from 'html-to-image';
import { find, get, groupBy, isEmpty, map } from 'lodash';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { USER_AGENTS } from 'src/constants/AppConstants';
import BridgeConstants from 'src/constants/BridgeConstants';
import { billingProducts, cart } from 'src/global/recoilState';
import DateHelper from 'src/helper/DateHelper';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import NativeService from 'src/services/NativeService';
import PrinterService from 'src/services/PrinterService';
import AuthService from 'src/services/authService';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';

export default function ReceiptDialog(props) {
  const {
    onClose,
    open,
    parcel,
    bookingId,
    totalGST,
    totalValueNoOffer,
    totalOffer,
    totalOrderValue,
  } = props;
  const shopName = AuthService.getShopName();
  const address = AuthService.getAddress();
  const orderSummary = useRecoilValue(cart);
  const totalProducts = useRecoilValue(billingProducts);
  const totalQuantity = calculateTotalQuantity(orderSummary);
  const billNo = typeof bookingId === 'object' ? 0 : bookingId;
  const handleClose = () => {
    onClose();
  };
  const getPrice = (curr) => {
    if (!curr) return;
    const check = find(totalProducts, (e) => e.productId === curr);
    if (check) return check.offerPrice ? check.offerPrice : check.price;
  };

  const serializeData = () => {
    const options = [];

    if (isEmpty(orderSummary)) return;
    map(orderSummary, (e) => {
      let serializeAddOn = [];
      map(e.addOn, (d) => {
        serializeAddOn.push({
          addOnId: d.addOnId,
          quantity: d.quantity * e.quantity,
          price: d.price,
          name: d.name,
        });
      });
      options.push({
        quantity: e.quantity,
        price: getPrice(e.productId),
        productId: e.productId,
        addOns: serializeAddOn,
        name: e.name,
        counter: e.counter,
        unit: e.unit ? `${e.unit}${e.unitName}` : '',
      });
    });
    return options;
  };
  const generateTicketHeight = () => {
    const orderSummaryLength = orderSummary.length;
    if (orderSummaryLength > 10) return orderSummaryLength * 28;
    return 280;
  };

  const ticketHeight = generateTicketHeight();
  function printHtmlToImage() {
    htmlToImage
      .toJpeg(document.getElementById('print'), {
        backgroundColor: '#FFFFFF',
        pixelRatio: 10,
        height: ticketHeight,
        width: 200,
        canvasHeight: ticketHeight,
        canvasWidth: 200,
        skipAutoScale: true,
      })
      .then((dataUrl) => {
        setTimeout(() => {
          if (window.navigator.userAgent.includes(USER_AGENTS.REACT_NATIVE)) {
            const nativeRequest = [
              {
                name: BridgeConstants.PRINT,
                data: { printerName: 'BlueTooth Printer', base64String: orderSummary },
              },
            ];
            return NativeService.sendAndReceiveNativeData(nativeRequest).then((response) => {
              const nativeItem = response.filter(
                (responseItem) => responseItem.name === BridgeConstants.PRINT
              );
              return nativeItem[0].data.message;
            });
          } else {
            PrinterService.nodePrint(orderSummary);
          }
        }, 0);
      })
      .finally(() => {
        handleClose();
      })
      .catch((e) => {
        console.log(e);
        handleClose();
      });
  }
  const serializedCart = serializeData();
  function ErrorFallback() {
    return <div></div>;
  }
  const cartGroupBy = groupBy(serializedCart, 'counter');

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        printHtmlToImage();
      }, 200);
    }
  }, [open]);

  return (
    <Dialog open={open} sx={{ opacity: '0.5%' }}>
      <div
        id="print"
        style={{ height: `${ticketHeight}px`, width: '200px', fontFamily: 'Arial', padding: 2 }}
      >
        {parcel === 'Parcel' && (
          <div style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bolder' }}>Parcel </div>
        )}
        <div style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>{shopName}</div>
        <div style={{ fontSize: '10px', textAlign: 'center' }}>{address}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '8px', textAlign: 'right' }}>
            Date: &nbsp; <b>{DateHelper.format(Date().toString()) ?? '-'}</b>
          </div>
          <div style={{ fontSize: '10px', textAlign: 'left', marginLeft: 'auto' }}>
            Order No: &nbsp;<b style={{ fontSize: '12px' }}>{billNo}</b>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: '2px', fontSize: '8px' }}>
          --------------------------------------------------------------------------
        </div>
        <div
          style={{
            display: 'grid',
            fontWeight: 'bold',
            alignItems: 'center',
            gridTemplateColumns: '90px 30px 40px 40px',
          }}
        >
          <div style={{ fontSize: '10px', overflow: 'hidden', marginRight: 'auto' }}>Item </div>
          <div style={{ fontSize: '10px', textAlign: 'left' }}>Qty </div>
          <div style={{ fontSize: '10px', textAlign: 'right', marginLeft: 'auto' }}>Price(₹) </div>
          <div style={{ fontSize: '10px', textAlign: 'right', marginLeft: 'auto' }}>Amt(₹) </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: '1px', fontSize: '8px' }}>
          --------------------------------------------------------------------------
        </div>
        {map(cartGroupBy, (products, counters) => (
          <>
            <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              {counters !== 'null' ? counters : 'Common Counter'}
            </div>

            {map(products, (e, index) => {
              return (
                <>
                  <div
                    style={{
                      display: 'grid',
                      alignItems: 'center',
                      gridTemplateColumns: '100px 20px 40px 40px',
                    }}
                  >
                    <div style={{ fontSize: '10px', overflow: 'hidden', marginRight: 'auto' }}>
                      {index + 1}.{e.name} {e.unit ? `-${e.unit}` : ''}
                    </div>
                    <div style={{ fontSize: '10px', textAlign: 'left' }}>{e.quantity} </div>
                    <div style={{ fontSize: '10px', textAlign: 'right', marginLeft: 'auto' }}>
                      {toFixedIfNecessary(e.price, 2)}{' '}
                    </div>
                    <div style={{ fontSize: '10px', textAlign: 'right', marginLeft: 'auto' }}>
                      {toFixedIfNecessary(e.price * e.quantity, 2)}
                    </div>
                  </div>

                  {map(get(e, 'addOns', []), (d) => {
                    return (
                      <div
                        style={{
                          display: 'grid',
                          alignItems: 'center',
                          gridTemplateColumns: '100px 20px 40px 40px',
                        }}
                      >
                        <div style={{ fontSize: '8px', overflow: 'hidden', marginRight: 'auto' }}>
                          &emsp; - {d.name}
                        </div>
                        <div style={{ fontSize: '8px', textAlign: 'left' }}>{d.quantity} </div>
                        <div style={{ fontSize: '8px', textAlign: 'right', marginLeft: 'auto' }}>
                          {toFixedIfNecessary(d.price, 2)}
                        </div>
                        <div style={{ fontSize: '8px', textAlign: 'right', marginLeft: 'auto' }}>
                          {toFixedIfNecessary(d.price * d.quantity, 2)}
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })}
          </>
        ))}
        <div style={{ marignTop: '10px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginRight: 'auto' }}>
            Total Items
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}> {totalQuantity} </div>
        </div>

        <div style={{ marignTop: '10px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginRight: 'auto' }}>Total</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {' '}
            {fCurrency(totalValueNoOffer)}
          </div>
        </div>

        <div style={{ marignTop: '10px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginRight: 'auto' }}>
            TotalDiscount
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>+{totalOffer}</div>
        </div>
        <div style={{ marignTop: '10px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginRight: 'auto' }}>GST</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>+{totalGST}</div>
        </div>

        <div style={{ display: 'flex', lineHeight: '1px', alignItems: 'center', fontSize: '8px' }}>
          --------------------------------------------------------------------------
        </div>
        <div style={{ marignTop: '10px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginRight: 'auto' }}>Total </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fCurrency(totalOrderValue)}</div>
        </div>

        <div style={{ display: 'flex', lineHeight: '1px', alignItems: 'center', fontSize: '8px' }}>
          --------------------------------------------------------------------------
        </div>
        <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }}>
          Thank You !!! Visit Again!!!
        </div>
        <div style={{ marignTop: 'auto', display: 'flex', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '8px', marginLeft: 'auto' }}>powered by Poriyaalar.com</div>
        </div>
      </div>
    </Dialog>
  );
}
