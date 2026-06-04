import Script from 'next/script';

/** Giventa Inc. SalesIQ embed (MOSC redesign). Override via NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_URL. */
const DEFAULT_WIDGET_SRC =
  'https://salesiq.zohopublic.com/widget?wc=siqbe8568b33d4324158e8ce69784c5036bbf71674335df3b9d0651c884762072d0';

export default function ZohoSalesIqWidget() {
  const widgetSrc =
    process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_URL ?? DEFAULT_WIDGET_SRC;

  return (
    <>
      <Script
        id="zoho-salesiq-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html:
            'window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}',
        }}
      />
      <Script id="zsiqscript" src={widgetSrc} strategy="lazyOnload" />
    </>
  );
}
