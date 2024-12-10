
function loadCharts(aData,aEnvironments){
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

    let aLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let data = {
        labels: aLabels, 
        datasets: [
            {
                label:"Flows",
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(44,123,239,0.5)",
                data: groupArray(oTimelineFlow)
            },
            {
                label:"Apps",
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(145,45,135,0.5)",
                data: groupArray(oTimelineApp)
            },
            {
                label:"Agents",
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(20,183,0.5)",
                data: groupArray(oTimelineAgent)
            }
        ]
    };

    let config = {
        type: 'line', // Type of chart
        data: data,
        options: {
            responsive: true, // Make the chart responsive
            plugins: {
                legend: {
                    display: true, // Show legend
                    position: 'top' // Position of legend
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // Y-axis starts at 0
                    title: {
                        display: true,
                        text: 'Totals' // Label for Y-axis
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Months' // Label for X-axis
                    }
                }
            }
        }
    };

    new Chart(document.getElementById('timelineChart').getContext('2d'), config);


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
          label: 'Solutions',
          data: [
            aEnvironmentSolutions[0].solutions, 
            aEnvironmentSolutions[1].solutions, 
            aEnvironmentSolutions[2].solutions,
            aEnvironmentSolutions[3].solutions,
            aEnvironmentSolutions.splice(0,4).length
          ],
          backgroundColor: [
            'rgb(66, 135, 246)',
            'rgb(216, 46, 46)',
            'rgb(226, 226, 56)',
            'rgb(46, 196, 56)',
            'rgb(176, 56, 196)'
          ],
          hoverOffset: 4
        }]
    };

    config = {
        type: 'doughnut',
        data: data,
    };
    new Chart(document.getElementById('solutionChart').getContext('2d'), config);

        
    ////environment variable
    aEnvironmentSolutions=aEnvironmentData.sort((a, b) => {
        return b.components - a.components;
    });

    aLabels =["String","Number","Boolean","JSON","Data Source","Secret"]

    data = {
        labels: aLabels,
        datasets: [{
        label: 'Environment Variables',
        data: [
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="String"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Number"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Boolean"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="JSON"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Data Source"}).length,
            aData.filter(item =>{return item.type=="environment variable" && item.variableType=="Secret"}).length
        ],
        backgroundColor: [
            'rgb(66, 135, 246)',
            'rgb(216, 46, 46)',
            'rgb(226, 226, 56)',
            'rgb(46, 196, 56)',
            'rgb(176, 56, 196)',
            'rgb(236, 136, 56)'
        ],
        hoverOffset: 4
        }]
    };

    config = {
        type: 'doughnut',
        data: data,
    };
    new Chart(document.getElementById('variableChart').getContext('2d'), config);

}






function groupArray(array) {

    const result = [0,0,0,0,0,0,0,0,0,0,0,0];
    array.forEach(item =>{
        result[item-1]+=1
    })
    return result;
  }