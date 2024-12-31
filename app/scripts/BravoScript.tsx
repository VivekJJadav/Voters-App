import Script from "next/script";

export default function BravoScript() {
  return (
    <head>
      <Script
        src="https://cdn.brevo.com/js/sdk-loader.js"
        strategy="afterInteractive"
      />
      <Script id="brevo-config">
        {`
            window.Brevo = window.Brevo || [];
            Brevo.push([
              "init",
              {
                client_key: "b6qhcyk5b1q8e7yk9va9t2ze",
              }
            ]);
          `}
      </Script>
    </head>
  );
}
