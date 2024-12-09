
function loadCharts(aData){
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

    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const data = {
        labels: labels, 
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

    const config = {
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
}





function groupArray(array) {

    const result = [0,0,0,0,0,0,0,0,0,0,0,0];
    array.forEach(item =>{
        result[item-1]+=1
    })
    return result;
  }