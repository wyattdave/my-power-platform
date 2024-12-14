/*By David wyatt, https://www.linkedin.com/in/wyattdave/ , under license: https://github.com/wyattdave/my-power-platform/blob/main/LICENSE*/
let sApiUrlFlow = 'https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/';
let sApiUrlApp="https://<tenantID>.tenant.api.powerplatform.com/powerapps/environments?api-version=1";
let dDate = new Date(new Date().getFullYear()+"-01-01");
let sDate= dDate.getFullYear()+"-01-01";
let dDateTo = new Date(new Date().getFullYear()+"-12-31");
let sDateTo= dDateTo.getFullYear()+"-12-31";
let sFilter="";
let bFirst=true;
let oDataAPI;
let aAllData=[];
let iAPICount=0;
let aEnvironmentsMaster=[]
const eData=document.getElementById("data");
const eDate=document.getElementById("input-date");
const eDateTo=document.getElementById("input-dateTo");
const eFilter=document.getElementById("input-filter");
const eUpdate=document.getElementById("button-update");
const eLoad=document.getElementById("sideTitle");
const eTotal=document.getElementById("span-total");
const eCount=document.getElementById("span-count");
const eDiv=document.getElementById("div-count");
const eDataDownload=document.getElementById("button-data");
const eEnvirDownload=document.getElementById("button-envir");
const eCsvDownload=document.getElementById("button-csv");

eUpdate.addEventListener("click", setDate);
eDataDownload.addEventListener("click", downloadData);
eEnvirDownload.addEventListener("click", downloadEnvironment);
eCsvDownload.addEventListener("click", downloadCsv);
eDate.value=sDate;
eDateTo.value=sDateTo;

document.addEventListener("DOMContentLoaded", () => {
  if(localStorage.getItem("solutionFilter")){
    eFilter.value=sFilter=localStorage.getItem("solutionFilter");
  }
  chrome.runtime.sendMessage({ type: "REQUEST_DATA" }, (response) => {
    console.log(response)
    if (response) {
      if(response.dataverse!="" && response.flow!=""){
        oDataAPI=response;
        eLoad.innerHTML="Data Loading..";
        load();      
      } else if(localStorage.getItem("data")){
        aAllData=JSON.parse(localStorage.getItem("data"));
        aEnvironmentsMaster=JSON.parse(localStorage.getItem("environments"));
        loadCharts(aAllData,aEnvironmentsMaster,false);
        sDate = localStorage.getItem("date");
        sDateTo = localStorage.getItem("dateTo");
        eDate.value=sDate;
        eDateTo.value=sDateTo;
        eLoad.innerHTML="Key Data Reloaded";
        alert("Access expired, reloaded previous data, if new update required please got to https:/make.powerautomate.com or refresh the page");
      }else{
        alert("Access expired, please go to https://make.powerautomate.com or refresh the page");
      }      
    } else {
      console.error("Failed to receive data");
    }
  });
});

function downloadData(){
  downloadJSON(aAllData,"MyPowerPlatform ("+sDate+" to "+sDateTo+").json");
}

function downloadEnvironment(){
  downloadJSON(aEnvironmentsMaster,"MyEnvironments ("+sDate+" to "+sDateTo+").json");
}

function downloadCsv(){
  let aCsv=[];
  aAllData.forEach(item =>{
    let sDataverseId="Not solution aware";

    if(item.dataverseId){sDataverseId= item.dataverseId};
    aCsv.push({
      displayName:item.displayName,
      id:item.id,
      dataverseId: sDataverseId,
      created:item.createdTime,
      type:item.type,
      environment:item.environment.displayName,
      environmentId:item.environment.id,
      environmentsUrl:item.environment.url

    })
  })

  const aHeaders=["Display_Name","Id","Dataverse_Id","Created","Type","Environment","Environment_Id","Environments_Url"];

  exportCSVFile(aHeaders,aCsv,"MyPowerPlatform ("+sDate+" to "+sDateTo+")");
}

function setDate(){
   sDate= eDate.value;
   dDate= new Date(sDate);
   sDateTo= eDateTo.value;
   dDateTo= new Date(sDateTo);
   eData.innerHTML="";
   eLoad.innerHTML="Data Loading..";
   eDiv.style.display=null;
   aAllData.length=0;
   iAPICount=0;
   eCount.innerText=0;   
   console.log(aAllData);
   aEnvironmentsMaster.forEach(envir =>{    
    getData(envir,true)
  })
}

async function load(){
  eDiv.style.display=null;
  aEnvironmentsMaster=await getEnvironments(oDataAPI.envirs,oDataAPI.url,"")
  console.log(aEnvironmentsMaster)
  eTotal.innerText=aEnvironmentsMaster.length;
  aEnvironmentsMaster.forEach(envir =>{    
    getData(envir,false)
  })  
}

async function getData(oEnvir,bDestroy){
  let oWhoAmI;
  let sURLuser;
  let oUser;
  localStorage.setItem("solutionFilter",eFilter.value);
  sFilter=eFilter.value;  
  
  ////get user
  try{
    oWhoAmI=await fetchAPIData(oEnvir.url+"/api/data/v9.2/WhoAmI", oDataAPI.dataverse,oEnvir.displayName); 
  }catch(error) {
    oWhoAmI=null;
  }

  if(!oWhoAmI){
    iAPICount++;
    eData.innerHTML+="<i class='fa-solid fa-globe' style='color:red' aria-hidden='true'></i>&nbsp;"+oEnvir.displayName+" failed, id: cant find<br>";  
    }else{
      if(bFirst){   
        bFirst=false;     
        sURLuser=oEnvir.url+"/api/data/v9.2/systemusers("+oWhoAmI.UserId+")";
        oUser= await fetchAPIData(sURLuser, oDataAPI.dataverse);
        eData.innerHTML+="Hello "+oUser.fullname+"<br>";        
      }
      eData.innerHTML+="<i class='fa-solid fa-globe' aria-hidden='true'></i>&nbsp;"+oEnvir.displayName+" identified, id:"+oWhoAmI.UserId+"<br>";
    
    ////flows   
    const aFlows=await fetchAPIData(sApiUrlFlow+oEnvir.id+"/flows?api-version=2016-11-01",oDataAPI.flow,oEnvir.displayName )
    if(aFlows){
      aFlows.value.forEach(flow =>{
        const dCreated=new Date(flow.properties.createdTime);
        if(dCreated>=dDate && dCreated<=dDateTo){
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
      eData.innerHTML+="<i class='fa-solid fa-puzzle-piece'></i>&nbsp;"+oEnvir.displayName+" flows found "+aFlows.value.length+"<br>";
    }
      
    ////apps
    const aApps =await fetchAPIData(oEnvir.url+"/api/data/v9.2/canvasapps?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdtime ge "+sDate+" and createdtime le "+sDateTo,oDataAPI.dataverse,oEnvir.displayName);
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
            displayName:app.displayname,
            createdTime:app.createdtime,
            isManaged:app.ismanaged,
            appUrl:app.appopenuri,
            month:new Date(app.createdtime).getMonth()+1
          }
        )
      })
      eData.innerHTML+="<i class='fa-solid fa-laptop'></i>&nbsp;"+oEnvir.displayName+" apps found "+aApps.value.length+"<br>";
    }
    
    ////agents
    const aBots =await fetchAPIData(oEnvir.url+"/api/data/v9.2/bots?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate+" and createdon le "+sDateTo,oDataAPI.dataverse,oEnvir.displayName);
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
      eData.innerHTML+="<i class='fa-solid fa-robot'></i>&nbsp;"+oEnvir.displayName+" copilot agents found "+aBots.value.length+"<br>";
    }
    
    ///solutions
    const aSolutions =await fetchAPIData(oEnvir.url+"/api/data/v9.2/solutions?$filter=_createdby_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate+" and createdon le "+sDateTo,oDataAPI.dataverse,oEnvir.displayName);
    if(aSolutions){    
      aSolutions.value.forEach(sol =>{   
        if(!sol.uniquename.includes("msdyn")){
          getComponents(oEnvir,sol,oWhoAmI.UserId)
        }       
      })      
      eData.innerHTML+="<i class='fa-solid fa-box-open'></i>&nbsp;"+oEnvir.displayName+" solutions found "+aSolutions.value.length+"<br>";
    }

    ////connection refs
    const aConnections =await fetchAPIData(oEnvir.url+"/api/data/v9.2/connectionreferences?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate+" and createdon le "+sDateTo,oDataAPI.dataverse,oEnvir.displayName);
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
            connector:con.connectorid.replace("/providers/Microsoft.PowerApps/apis/",""),
            month:new Date(con.createdon).getMonth()+1
          }
        )
      })
      eData.innerHTML+="<i class='fa-solid fa-plug'></i>&nbsp;"+oEnvir.displayName+" connection references found "+aConnections.value.length+"<br>";
    }   
    
    ////environment variables
    const aVaraiables =await fetchAPIData(oEnvir.url+"/api/data/v9.2/environmentvariabledefinitions?$filter=_ownerid_value eq '"+oWhoAmI.UserId+"' and createdon gt "+sDate+" and createdon le "+sDateTo,oDataAPI.dataverse,oEnvir.displayName);
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
            variableType:variableType(eva.type),
            month:new Date(eva.createdon).getMonth()+1
          }
        )
      })
      eData.innerHTML+="<i class='fa-solid fa-database'></i>&nbsp;"+oEnvir.displayName+" environment variables found "+aVaraiables.value.length+"<br>";
    }
    iAPICount++;   
    eCount.innerText=iAPICount;   
  }  

  if(iAPICount==aEnvironmentsMaster.length){
    console.log(aAllData);
    eLoad.innerHTML="Key Data";
    eDiv.style.display="none";
    loadCharts(aAllData,aEnvironmentsMaster,bDestroy);
    localStorage.setItem("data",JSON.stringify(aAllData));
    localStorage.setItem("environments",JSON.stringify(aEnvironmentsMaster));
    localStorage.setItem("date",sDate);
    localStorage.setItem("dateTo",sDateTo);
  }
  
}

async function getComponents(oEnvir,sol,sUser){
  const aComponents =await fetchAPIData(oEnvir.url+"/api/data/v9.2/solutioncomponents?$filter=_createdby_value eq '"+sUser+"' and _solutionid_value eq '"+sol.solutionid+"'",oDataAPI.dataverse,oEnvir.displayName);
  if(aComponents.value.length>0){
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
          apps:aComponents.value.filter(item =>{return item.componenttype == 300}).length,
          var:aComponents.value.filter(item =>{return item.componenttype == 381}).length,
          components:aComponents.value.length
        },
        month:new Date(sol.createdon).getMonth()+1
      }
    )
  }  
}


function downloadJSON(data,sFileName) {

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = sFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function getEnvironments(sEnvirToken, sEnvirURL) {
  try {
    const data = await fetchAPIData(sEnvirURL, sEnvirToken,"");

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
          sUrlAPI= item.properties.linkedEnvironmentMetadata.instanceApiUrl;
        }

        return {
          displayName: item.properties.displayName,
          id: item.name,
          url: sUrlAPI,
          dyn: sUrl
        };
      });

    return aEnvironments; 
  } catch (error) {
    console.log("Error Get Environments:", error);
    return []; 
  }
}



function variableType(iVar){
  if(iVar==100000000){
    return "String"
  }
  if(iVar==100000001){
    return "Number"
  }
  if(iVar==100000002){
    return "Boolean"
  }
  if(iVar==100000003){
    return "JSON"
  }
  if(iVar==100000004){
    return "Data Source"
  }
  if(iVar==100000005){
    return "Secret"
  }
}

async function fetchAPIData(url, token, environment) {
  try {
    const options = {
      headers: {
        Authorization: token
      },
    };
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status == 401 && !url.includes("WhoAmI")) {
        eData.innerHTML+="<br><b style='color:red;'>"+environment+" Invalid token, refresh https://make.powerautomate.com page to update</b><br>";
        return null;
      }
      if (!response.status == 401 && url.includes("WhoAmI")){
        eData.innerHTML+="<br><b style='color:red;'>"+environment+" WhoAmI failed</b><br>";
        return null;
      }
    }
    const data = await response.json();
    return data;
 } catch (error) {
   console.log("Error fetching API data:", error);
   return null
 }
}