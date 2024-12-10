let sFlowAPI="";
let sDataAPI="";
let sAppAPI="";
let sEnvirAPI="";
let sEnvironment="";
let sEnvironmentsUrl="";
let bEnvir=false;

let sApiUrlFlowEnvir="https://us.api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments?$expand=properties%2Fpermissions&api-version=2016-11-01";
let sApiUrlFlow = 'https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/';
let sApiUrlApp="https://<tenantID>.tenant.api.powerplatform.com/powerapps/environments?api-version=1";
///https://emea.api.flow.microsoft.com/providers/Microsoft.ProcessSimple
///https://unitedkingdom.api.flow.microsoft.com/providers/Microsoft.ProcessSimple
///https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple

  chrome.action.onClicked.addListener((tab) => {
    (async () => {
      chrome.windows.create({
        url: chrome.runtime.getURL("index.html"),
        type:"popup",
        state:"maximized"
      });   
    })(); 
  });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {  
        const oTokens={
          "dataverse":sDataAPI,
          "flow":sFlowAPI,
          "app":sAppAPI,
          "envirs":sEnvirAPI,
          "url":sEnvironmentsUrl
        }
        sendResponse(oTokens);
    }
  )

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  const bData=details.url.includes('.dynamics.com/api/data/v9.');
  const bFlow=details.url.includes('.api.flow.microsoft.com/')&&!details.url.includes('scopes/admin/');
  const bApp=details.url.includes('environment.api.powerplatform.com');
  const bTenant=details.url.includes('.tenant.api.powerplatform.com/');
  if (bFlow||bData||bApp||bTenant) {
    for(var i = 0; i < details.requestHeaders.length;i++) {
      if(details.requestHeaders[i].name.toLowerCase() == "authorization"){
        if(bFlow){
          sFlowAPI=details.requestHeaders[i].value
          if(!bEnvir){
            bEnvir=true;
            sEnvirAPI=sFlowAPI;
            sEnvironmentsUrl=sApiUrlFlowEnvir;
          }
          
        }
        if(bData){
          sDataAPI=details.requestHeaders[i].value    
        }
        if(bApp){
          sAppAPI=details.requestHeaders[i].value   
        }
        if(bTenant){
          const sEnvironment=details.url.split(".tenant.api")[0].split("https://")[1];
          if(!bEnvir){
            bEnvir=true;
            sEnvirAPI=details.requestHeaders[i].value ;
            sEnvironmentsUrl=sApiUrlApp.replace("<tenantID>",sEnvironment);
          }  
          
        }       
      }
    }
  }
}, 
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);
///urls: ["https://*.api.flow.microsoft.com/*","https://make.powerautomate.com/*"] },


