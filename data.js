let sApiUrlFlow = 'https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/';
let sApiUrlApp="https://<tenantID>.tenant.api.powerplatform.com/powerapps/environments?api-version=1";
const dDate = new Date(new Date().getFullYear()+"-01-01");
let sDate= dDate.getFullYear()+"-"+(dDate.getMonth()+1)+"-"+(dDate.getDate()+1);
let bFirst=false;
let oDataAPI;
let aAllData=[];
let iAPICount=0;
let aEnvironmentsMaster=[]
const eData=document.getElementById("data");
const eDate=document.getElementById("input-date");

eDate.addEventListener("change", setDate);

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

function setDate(){
   sDate= eDate.value;
   eData.innerHTML="";
   aEnvironmentsMaster.forEach(envir =>{    
    getData(envir)
  })
}

async function load(){
  aEnvironmentsMaster=await getEnvironments(oDataAPI.envirs,oDataAPI.url)
  console.log(aEnvironmentsMaster)
  aEnvironmentsMaster.forEach(envir =>{    
    getData(envir)
  })  
}


async function getData(oEnvir){
    
  ////get user
  const oWhoAmI=await fetchAPIData(oEnvir.url+"/api/data/v9.2/WhoAmI", oDataAPI.dataverse,0);
  const sURLuser=oEnvir.url+"/api/data/v9.2/systemusers("+oWhoAmI.UserId+")";
  const oUser= await fetchAPIData(sURLuser, oDataAPI.dataverse,0)
  
  if(bFirst){
    eData.innerHTML+="Hello "+oUser.fullname+"<br>";
  }
  eData.innerHTML+="<i class='fa-solid fa-globe' aria-hidden='true'></i>"+oEnvir.displayName+" identified, id:"+oWhoAmI.UserId+"<br>";

  if(oUser){
    ////flows
   
    const aFlows=await fetchAPIData(sApiUrlFlow+oEnvir.id+"/flows?api-version=2016-11-01",oDataAPI.flow) 
    if(aFlows){
      aFlows.value.forEach(flow =>{
        const dCreated=new Date(flow.properties.createdTime);
        if(dCreated>dDate){
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
              trigger:flow.properties.definitionSummary.triggers[0].type,
              month:dCreated.getMonth()+1
            }
          )
        }      
      })
      eData.innerHTML+="<i class='fa-solid fa-puzzle-piece'></i>"+oEnvir.displayName+" flows found<br>";
    }
   
    
    ////apps
    const aApps =await fetchAPIData(oEnvir.url+"/api/data/v9.2/canvasapps?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdtime gt "+sDate,oDataAPI.dataverse);
    if(aApps){
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
            appUrl:app.appopenuri,
            month:new Date(app.createdtime).getMonth()+1
          }
        )
      })
      eData.innerHTML+="<i class='fa-solid fa-computer'></i>"+oEnvir.displayName+" apps found<br>";
    }
    
    ////agents
    const aBots =await fetchAPIData(oEnvir.url+"/api/data/v9.2/bots?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate,oDataAPI.dataverse);
    if(aBots){
      aBots.value.forEach(bot =>{
        aAllData.push(
          {
            type:"agent",
            environment:{
              displayName:oEnvir.displayName,
              id:oEnvir.id,
              url:oEnvir.dyn
            },
            id:bot.schemaname,
            dataverseId:bot.botid,
            displayName:bot.name,
            createdTime:bot.createdon,
            isManaged:bot.ismanaged,
            triggger:bot.authenticationtrigger,
            month:new Date(bot.createdon).getMonth()+1
          }
        )
      })
      eData.innerHTML+="<i class='fa-solid fa-robot'></i>"+oEnvir.displayName+" copilot agents found<br>";
    }
    ///solutions
    const aSolutions =await fetchAPIData(oEnvir.url+"/api/data/v9.2/solutions?$filter=_createdby_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate,oDataAPI.dataverse);
    if(aSolutions){
      aSolutions.value.forEach(sol =>{       
        getComponents(oEnvir,sol)
      })      
      eData.innerHTML+="<i class='fa-solid fa-box-open'></i>"+oEnvir.displayName+" solutions found<br>";
    }

    ////connection refs
    const aConnections =await fetchAPIData(oEnvir.url+"/api/data/v9.2/connectionreferences?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate,oDataAPI.dataverse);
    if(aConnections){
      aConnections.value.forEach(con =>{
        aAllData.push(
          {
            type:"connection reference",
            environment:{
              displayName:oEnvir.displayName,
              id:oEnvir.id,
              url:oEnvir.dyn
            },
            id:con.connectionreferencelogicalname,
            dataverseId:con.connectionreferenceid,
            displayName:con.connectionreferencedisplayname,
            createdTime:con.createdon,
            isManaged:con.ismanaged,
            connectionid:con.connectionid,
            month:new Date(con.createdon).getMonth()+1
          }
        )
      })
      eData.innerHTML+="<i class='fa-solid fa-plug'></i>"+oEnvir.displayName+" connection references found<br>";
    }   
    
     ////environment variables
     const aVaraiables =await fetchAPIData(oEnvir.url+"/api/data/v9.2/environmentvariabledefinitions?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate,oDataAPI.dataverse);
     if(aVaraiables){
      aVaraiables.value.forEach(eva =>{
         aAllData.push(
           {
             type:"environment variable",
             environment:{
               displayName:oEnvir.displayName,
               id:oEnvir.id,
               url:oEnvir.dyn
             },
             id:eva.schemaname,
             dataverseId:eva.environmentvariabledefinitionid,
             displayName:eva.displayname,
             createdTime:eva.createdon,
             isManaged:eva.ismanaged,
             variableType:eva.type,
             month:new Date(eva.createdon).getMonth()+1
           }
         )
       })
       eData.innerHTML+="<i class='fa-solid fa-database'></i>"+oEnvir.displayName+" environment variables found<br>";
     }    
  }  
  iAPICount++;
  if(iAPICount==aEnvironmentsMaster.length){
    console.log(aAllData);
    loadCharts(aAllData)
  }
 


}

async function getComponents(oEnvir,sol){
  console.log(oEnvir.url+"/api/data/v9.2/solutioncomponents?$filter=_solutionid_value eq '"+sol.solutionid+"'")
  const aComponents =await fetchAPIData(oEnvir.url+"/api/data/v9.2/solutioncomponents?$filter=_solutionid_value eq '"+sol.solutionid+"'",oDataAPI.dataverse);
  aAllData.push(
    {
      type:"solution",
      environment:{
        displayName:oEnvir.displayName,
        id:oEnvir.id,
        url:oEnvir.dyn
      },
      id:sol.uniquename,
      dataverseId:sol.solutionid,
      displayName:sol.friendlyname,
      createdTime:sol.createdon,
      isManaged:sol.ismanaged,
      contents:{
        flows:aComponents.value.filter(item =>{return item.componenttype == 29}).length,
        components:aComponents.value.length
      },
      month:new Date(sol.createdon).getMonth()+1
    }
  )
  
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
//  try {
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
//  } catch (error) {
//    console.error('Error fetching API data:', error);
//  }
}