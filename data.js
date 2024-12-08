let sApiUrlFlow = 'https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/';
let sApiUrlApp="https://<tenantID>.tenant.api.powerplatform.com/powerapps/environments?api-version=1";


let oDataAPI;
let aAllData=[];

const eData=document.getElementById("data");

console.log(eData.innerText);

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ type: "REQUEST_DATA" }, (response) => {
    console.log(response)
    if (response) {
      oDataAPI=response;
      load();
      console.log(oDataAPI);
      
    } else {
      console.error("Failed to receive data from the background script.");
    }
  });
});

async function load(){
  const aEnvironments=await getEnvironments(oDataAPI.envirs,oDataAPI.url)
  console.log(aEnvironments)
  aEnvironments.forEach(envir =>{    
    getData(envir)
  })
}


async function getData(oEnvir){
  let bContinue=true;
  
  ////get user
  const oWhoAmI=await fetchAPIData(oEnvir.url+"/api/data/v9.2/WhoAmI", oDataAPI.dataverse,0);
  console.log(oWhoAmI)
  const sURLuser=oEnvir.url+"/api/data/v9.2/systemusers("+oWhoAmI.UserId+")";
  const oUser= await fetchAPIData(sURLuser, oDataAPI.dataverse,0)
  console.log(sApiUrlFlow+oEnvir.id+"/flows?api-version=2016-11-01")
  
  if(oUser){
    ////flows
    eData.innerHTML+=oEnvir.displayName+" identified, user: "+oUser.fullname+", id:"+oWhoAmI.UserId+"<br>";
    const aFlows=await fetchAPIData(sApiUrlFlow+oEnvir.id+"/flows?api-version=2016-11-01",oDataAPI.flow) 
    console.log(aFlows)
    aFlows.value.forEach(flow =>{
      aAllData.push(
        {
          type:"flow",
          environment:{
            displayName:oEnvir.displayName,
            id:oEnvir.id,
            url:oEnvir.dyn
          },
          id:flow.name,
          dataverseId:flow.properties.workflowEntityId,
          displayName:flow.properties.displayName,
          createdTime:flow.properties.createdTime,
          isManaged:flow.properties.isManaged,
          trigger:flow.properties.definitionSummary.triggers[0].type
        }
      )
    })
    eData.innerHTML+=oEnvir.displayName+" flows found<br>";
    
    ////apps
    const aApps =await fetchAPIData(oEnvir.url+"/api/data/v9.2/canvasapps?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"'",oDataAPI.dataverse);
    aApps.value.forEach(app =>{
      aAllData.push(
        {
          type:"app",
          environment:{
            displayName:oEnvir.displayName,
            id:oEnvir.id,
            url:oEnvir.dyn
          },
          id:app.uniquecanvasappid,
          dataverseId:app.canvasappid,
          displayName:app.displayName,
          createdTime:app.createdtime,
          isManaged:app.ismanaged,
          appUrl:app.appopenuri
        }
      )
    })
    eData.innerHTML+=oEnvir.displayName+" apps found<br>";
    console.log(aAllData)
  }  

}

async function getEnvironments(sEnvirToken, sEnvirURL) {
  try {
    const data = await fetchAPIData(sEnvirURL, sEnvirToken);

    const aEnvironments = data.value
      .sort((a, b) => {
        const titleA = a.properties.displayName.toUpperCase();
        const titleB = b.properties.displayName.toUpperCase();
        return titleA.localeCompare(titleB);
      })
      .map(item => {
        let sUrl = "";
        if (item.properties.hasOwnProperty("linkedEnvironmentMetadata")) {
          sUrl = item.properties.linkedEnvironmentMetadata.instanceUrl;
          sUrlAPI= item.properties.linkedEnvironmentMetadata.instanceApiUrl
        }

        return {
          displayName: item.properties.displayName,
          id: item.name,
          url: sUrlAPI,
          dyn: sUrl
        };
      });

    return aEnvironments; // Return the processed array
  } catch (error) {
    console.error("Error Get Environments:", error);
    return []; // Return an empty array as a fallback
  }
}




async function fetchAPIData(url, token) {
  try {
    const options = {
      headers: {
        Authorization: token
      },
    };
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching API data:', error);
    return 'Error fetching API data: '+ error
  }
}