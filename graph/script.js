function get_data() {
    const serializedData = sessionStorage.getItem("ecfGraphData")

    if (serializedData === null) {
        throw new Error("No player rating data was found. Return to the home page and generate a graph.")
    }

    let data
    try {
        data = JSON.parse(serializedData)
    } catch {
        throw new Error("The saved player rating data is invalid.")
    }

    if (
        data === null
        || typeof data !== "object"
        || typeof data.full_name !== "string"
        || data.data === null
        || typeof data.data !== "object"
        || Array.isArray(data.data)
    ) {
        throw new Error("The saved player rating data is incomplete.")
    }

    return data
}

const { full_name, data } = get_data()
//alert(JSON.stringify(data))
document.getElementById("title").innerText = full_name + "'s Rating" 
var graphData = format_data(data)
add_graph(graphData)

function format_data(data) {
    var formatted = {
        labels: [],
        datasets: []
    }
    const time_ctrls = []

    //This block handles making the objects in the datasets array that will then be filled with the rating data
    if (Object.keys(data["S"] || {}).length > 0) {
        formatted.datasets.push({
            data: [],
            label: "Standard",
            borderColor: "#FF6284",
            backgroundColor: "#FF6284",
        })
        time_ctrls.push("S")
    }
    if (Object.keys(data["R"] || {}).length > 0) {
        formatted.datasets.push({
            data: [],
            label: "Rapid",
            borderColor: "#4bc0c0",
            backgroundColor: "#4bc0c0",
        })
        time_ctrls.push("R")
    }
    if (Object.keys(data["B"] || {}).length > 0) {
        formatted.datasets.push({
            data: [],
            label: "Blitz",
            borderColor: "#FFCD56",
            backgroundColor: "#FFCd56",
        })
        time_ctrls.push("B")
    }

    formatted.labels = [...new Set(time_ctrls.flatMap(
        (time_ctrl) => Object.keys(data[time_ctrl] || {})
    ))]
        .sort((dateA, dateB) => dateA.localeCompare(dateB))
        .map(convert_date)

    //This block is the iteration of S, R, and B
    for (let i = 0; i < time_ctrls.length; i++) {
        for (const [date, rating] of Object.entries(data[time_ctrls[i]] || {}).sort(
            ([dateA], [dateB]) => dateA.localeCompare(dateB)
        )) {
            if (rating != 0) {
                const adjustedRating = date.slice(0, 7) <= "2020-07"
                    ? rating * 7.5 + 700
                    : rating
                formatted.datasets[i].data.push({x:convert_date(date),y:adjustedRating});
            }
        }
    }

    //alert(JSON.stringify(formatted))
    return formatted
}

function convert_date(date) {
    const new_date = date.slice(5,7) + "/" + date.slice(0,4)
    return new_date
}

function add_graph(data) {
    const point_size = get_point_size(data)
    // This is one way of doing data
    //const exampleData = {
    //    labels:[1,2,3,4,5],
    //   datasets: [{
    //        data: [203,280,140,492,350],
    //        label: "Values 1"
    //    },
    //    {
    //        data: [320,485,201,150,290],
    //        label: "Values 2"
    //    }    
    //]
    //}

    //And this is another way of putting data in
    const exampleData = {
        datasets: [{
            data: [{x: "1", y:203},{x: "2", y:280},{x: "3", y:140},{x: "4", y:492},{x: "5", y:350}],
            label: "Values 1"
        },{
            data: [{x: "1", y:320},{x: "2", y:485},{x: "3", y:201},{x: "4", y:150},{x: "5", y:290}],
            label: "Values 2"
        }]
    }

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Month",
                    font: {
                        size: 20
                    },
                    color: "#353A40"
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Rating",
                    font: {
                        size: 20
                    },
                    color: "#353A40"
                }
            }
        },
        plugins: {
            tooltip: {
                intersect: false
            },
            title: {
                display: true,
                text: "ECF Rating over Months",
                padding: 0,
                font: {
                    size: 20
                },
                color: "#353A40"
            }
        },
        elements: {
            point: {
                radius: point_size,
            },
        },
        animation: {
            duration: 250
        },
    }


    const ctx = document.getElementById("graph");
    const myChart = new Chart(
        ctx,
        {
            type: 'line',
            data: data, //The actual data, replace with exampleData for testing data
            options: options,
        }
    )
}

function go_back() {
    window.open("../", "_self")
}

function get_point_size(data) {
    // Implementation for determining point size based on data length
    const len = data.datasets[0].data.length
    if (len < 25) {
        return 4
    } else if (len < 51) {
        return 3
    } else if (len < 121) {
        return 2
    } else {
        return 0
    }
}