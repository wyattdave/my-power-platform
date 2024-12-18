/*By David wyatt, https://www.linkedin.com/in/wyattdave/ , under license: https://github.com/wyattdave/my-power-platform/blob/main/LICENSE*/
let sFlowAPI="";
let sDataAPI="";
let sAppAPI="";
let sEnvirAPI="";
let sTokenAPI="";
let sUserUrl="";
let sEnvironment="";
let sEnvironmentsUrl="";
let bEnvir=false;

let sApiUrlFlowEnvir="https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments?$expand=properties%2Fpermissions&api-version=2016-11-01";
let sApiUrlFlow = "https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/";
let sApiUrlApp="https://<tenantID>.tenant.api.powerplatform.com/powerapps/environments?api-version=1";
const rGuid=new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", "i");

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
          "url":sEnvironmentsUrl,
          "token":sTokenAPI,
          "user":sUserUrl
        }
        sendResponse(oTokens);
    }
  )

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  const bData=details.url.includes(".dynamics.com/api/data/v9.");
  const bFlow=details.url.includes(".api.flow.microsoft.com/")&&!details.url.includes("scopes/admin/");
  const bApp=details.url.includes("environment.api.powerplatform.com");
  const bTenant=details.url.includes(".tenant.api.powerplatform.com/");
  const bToken=details.url=="https://make.powerapps.com/api/exchangeToken";

  if (bFlow||bData||bApp||bTenant || bToken) {
    for(var i = 0; i < details.requestHeaders.length;i++) {      
      if(details.requestHeaders[i].name.toLowerCase() == "authorization"){
        if(bFlow){
          sFlowAPI=details.requestHeaders[i].value;
          if(!bEnvir){
            bEnvir=true;
            sEnvirAPI=sFlowAPI;
            sEnvironmentsUrl=sApiUrlFlowEnvir;
          }          
        }
        if(bData){
          sDataAPI=details.requestHeaders[i].value;           
        }
        if(bApp){
          sAppAPI=details.requestHeaders[i].value;  
        }
        if(bTenant){
          const sEnvironment=details.url.split(".tenant.api")[0].split("https://")[1];
          if(!bEnvir){
            bEnvir=true;
            sEnvirAPI=details.requestHeaders[i].value ;
            sEnvironmentsUrl=sApiUrlApp.replace("<tenantID>",sEnvironment);
          }  
        }   
        if(bToken){
          sTokenAPI=details.requestHeaders[i].value;  
        }
 
        if(details.url.includes("api/data/v9.2/systemusers(")){
          sUserUrl=details.url.split("/Microsoft.Dynamics")[0]
        }     
      }
    }
  }
}, 
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);
///urls: ["https://*.api.flow.microsoft.com/*","https://make.powerautomate.com/*", "https://*.api.powerapps.com/*",  "https://make.powerapps.com/*","https://*.dynamics.com/api/data/v9*"] ,


