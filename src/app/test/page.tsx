import Script from 'next/script'

const Page = () => {
    const scriptBody = `
    window.wxOConfiguration = {
      orchestrationID: "20260130-2132-0452-00f5-cf3000909a5e_20260130-2132-2391-9069-8d31489ae0ba",
      hostURL: "https://dl.watson-orchestrate.ibm.com",
      rootElementID: "root",
      chatOptions: {
        agentId: "8bb500c1-5f4e-4ac4-8c8d-eb058d01064e"
      }
    };
    setTimeout(function () {
      var script = document.createElement('script');
      script.src = window.wxOConfiguration.hostURL + "/wxochat/wxoLoader.js?embed=true";
      script.addEventListener('load', function () {
        wxoLoader.init();
      });
      document.head.appendChild(script);
    }, 0);
  `

    return (
        <>
            <Script id="wxo-script" strategy="afterInteractive">
                {scriptBody}
            </Script>
            <div>page</div>
        </>
    )
}

export default Page