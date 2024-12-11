let timeLineChart;
let solutionChart;
let variableChart;
let connectionChart;
let componentChart;

function loadCharts(aData,aEnvironments,bDestroy){
     if(bDestroy){
        destroyCharts()
    }

    let aEnvironmentData=[];

    aEnvironments.forEach(envir =>{
        const aThisEnvironment=aData.filter(item => {return item.environment.id==envir.id});
        aEnvironmentData.push({
            displayName:envir.displayName,
            id:envir.id,
            flows: aThisEnvironment.filter(item =>{return item.type=="flow"}).length,
            apps: aThisEnvironment.filter(item =>{return item.type=="app"}).length,
            agents: aThisEnvironment.filter(item =>{return item.type=="agent"}).length,
            solutions: aThisEnvironment.filter(item =>{return item.type=="solution"}).length,
            connectionReferences: aThisEnvironment.filter(item =>{return item.type=="connectionReferences"}).length,
            environmentVariables: aThisEnvironment.filter(item =>{return item.type=="environmentVariable"}).length,
            components:aThisEnvironment.length
        })
    })


        ///timeline
    let oTimelineFlow=[];  
    let oTimelineApp=[];  
    let oTimelineAgent=[];    

    const aTimline = aData.filter(item =>{
        return item.type=="flow" || item.type=="app" || item.type=="agent"
    })
    aTimline.forEach(item => {
        if(item.type=="flow"){
            oTimelineFlow.push(item.month)
        }
        if(item.type=="app"){
            oTimelineApp.push(item.month)
        }
        if(item.type=="agent"){
            oTimelineAgent.push(item.month)
        }
    });

    let aLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const iMaxMonth= aTimline.reduce((max, item) => Math.max(max, item.month), -Infinity);
    const iMinMonth= aTimline.reduce((min, item) => Math.min(min, item.month), Infinity);

    console.log(iMaxMonth,iMinMonth)
    aLabels=aLabels.slice(iMinMonth,iMaxMonth);

    let data = {
        labels: aLabels, 
        datasets: [
            {
                label:"Flows",
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(44,123,239,0.5)",
                data: groupArray(oTimelineFlow),
                pointRadius: 3, 
                pointHoverRadius: 5,
                pointBackgroundColor: "rgba(44,123,239,0.5)",
                pointBorderColor: "rgba(44,123,239,0.5)"
            },
            {
                label:"Apps",
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(145,45,135,0.5)",
                data: groupArray(oTimelineApp),
                pointRadius: 3, 
                pointHoverRadius: 5,
                pointBackgroundColor: "rgba(145,45,135,0.5)",
                pointBorderColor: "rgba(145,45,135,0.5)" 
            },
            {
                label:"Agents",
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(20,183,0.5)",
                data: groupArray(oTimelineAgent),
                pointRadius: 3, 
                pointHoverRadius: 5,
                pointBackgroundColor: "rgba(20,183,0.5)",
                pointBorderColor: "rgba(20,183,0.5)"
            }
        ]
    };

    let config = {
        type: "line",
        data: data,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true, 
                    position: "top" 
                }
            },
            scales: {
                y: {
                    beginAtZero: true, 
                    title: {
                        display: true,
                        text: "Totals" 
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Months"
                    }
                }
            }
        }
    };

    timeLineChart= new Chart(document.getElementById("timelineChart").getContext("2d"), config);


    ////solution
    aEnvironmentSolutions=aEnvironmentData.sort((a, b) => {
        return b.components - a.components;
    });

    aLabels =[
        aEnvironmentData[0].displayName,
        aEnvironmentData[1].displayName,
        aEnvironmentData[2].displayName,
        "All Others"
    ]

    data = {
        labels: aLabels,
        datasets: [{
          label: "Solutions",
          data: [
            aEnvironmentSolutions[0].solutions, 
            aEnvironmentSolutions[1].solutions, 
            aEnvironmentSolutions[2].solutions,
            aEnvironmentSolutions[3].solutions,
            aEnvironmentSolutions.splice(0,4).length
          ],
          backgroundColor: [
            "rgb(66, 135, 246)",
            "rgb(216, 46, 46)",
            "rgb(226, 226, 56)",
            "rgb(46, 196, 56)",
            "rgb(176, 56, 196)"
          ],
          hoverOffset: 4
        }]
    };

    config = {
        type: "doughnut",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    };
    solutionChart= new Chart(document.getElementById("solutionChart").getContext("2d"), config);

        
    ////environment variable
    aEnvironmentSolutions=aEnvironmentData.sort((a, b) => {
        return b.components - a.components;
    });

    aLabels =["String","Number","Boolean","JSON","Data Source","Secret"]

    data = {
        labels: aLabels,
        datasets: [{
        label: "Environment Variables",
        data: [
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="String"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Number"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Boolean"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="JSON"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Data Source"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Secret"}).length
        ],
        backgroundColor: [
            "rgb(66, 135, 246)",
            "rgb(216, 46, 46)",
            "rgb(226, 226, 56)",
            "rgb(46, 196, 56)",
            "rgb(176, 56, 196)",
            "rgb(236, 136, 56)"
        ],
        hoverOffset: 4
        }]
    };

    config = {
        type: "doughnut",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    };
    variableChart= new Chart(document.getElementById("variableChart").getContext("2d"), config);

    ////connection references
       aEnvironmentSolutions=aEnvironmentData.sort((a, b) => {
        return b.components - a.components;
    });

    aLabels =["SharePoint","Dataverse","Outlook 365","Forms","Users 365","Teams","Power BI","Excel Business","OneDrive Buiness","Approvals","Others"]

    data = {
        labels: aLabels,
        datasets: [{
        label: "Connection References",
        data: [
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_sharepointonline"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_commondataserviceforapps"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_office365"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_microsoftforms"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_office365users"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_teams"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_powerbi"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_excelonlinebusiness"}).length,
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_onedriveforbusiness"}).length,            
            aData.filter(item =>{return item.type=="connection reference" && item.connector=="shared_approvals"}).length,
            aData.filter(item =>{return item.type=="connection reference"}).splice(0,10).length.length

        ],
        backgroundColor: [
            "rgb(0, 110, 74)",//sp
            "rgb(51, 153, 51)",//dv
            "rgb(1, 115, 199)",//out
            "rgb(62, 169, 92)",//form
            "rgb(242, 80, 34)",//user
            "rgb(70, 47, 146)",//teams
            "rgb(255, 190, 0)",//pbi
            "rgb(16, 124, 16)",//exc
            "rgb(0, 114, 198)",//one
            "rgb(100, 100, 246)",//app
            "rgb(115, 115, 115)"//other
        ],
        hoverOffset: 4
        }]
    };

    config = {
        type: "pie",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    };
    connectionChart= new Chart(document.getElementById("connectionChart").getContext("2d"), config);

////componets
    aLabels =["Flows","Apps","Agents","Solutions"]

    data = {
        labels: aLabels,
        datasets: [{
        label: "Component",
        data: [
            aData.filter(item =>{return item.type=="flow"}).length,
            aData.filter(item =>{return item.type=="app"}).length,
            aData.filter(item =>{return item.type=="agent" }).length,
            aData.filter(item =>{return item.type=="solution"}).length
        ],
        backgroundColor: [
            "rgba(44,123,239,0.5)",
            "rgba(145,45,135,0.5)",
            "rgba(20,183,0.5)",
            "rgb(102, 45, 145)"
        ],
        hoverOffset: 4
        }]
    };

    config = {
        type: "bar",
        data: data,
        options: {
            indexAxis: "y",
            responsive:true,
            barThickness:10,
            barPercentage: 0.8,
            scales: {
                y: {
                    ticks: {
                        autoSkip: false, 
                        maxRotation: 0,  
                        minRotation: 0  
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    position: "top"
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    };
    componentChart= new Chart(document.getElementById("componentChart").getContext("2d"), config);
}

function groupArray(array) {
    const result = [0,0,0,0,0,0,0,0,0,0,0,0];
    array.forEach(item =>{
        result[item-1]+=1
    })
    return result;
}

function destroyCharts(){
    timeLineChart.destroy();
    solutionChart.destroy();
    variableChart.destroy();
    connectionChart.destroy();
    componentChart.destroy();
}