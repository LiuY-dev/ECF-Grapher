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

const gameCountLabels = {
    id: "gameCountLabels",
    afterDatasetsDraw(chart) {
        const { ctx } = chart
        ctx.save()
        ctx.fillStyle = "#222"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex)
            meta.data.forEach((bar, dataIndex) => {
                const count = dataset.counts[dataIndex]
                const { x, y, base } = bar.getProps(["x", "y", "base"], true)
                const segmentWidth = Math.abs(x - base)
                const label = String(count)
                if (segmentWidth >= ctx.measureText(label).width + 8) {
                    ctx.fillText(label, (x + base) / 2, y)
                }
            })
        })

        ctx.restore()
    }
}

const { full_name, data , game_data} = get_data()
//alert(JSON.stringify(game_data))
document.getElementById("title").innerText = full_name + "'s Analytics" 
var graphData = format_data(data)
add_graph(graphData)
add_game_stats_charts(game_data)

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
        maintainAspectRatio: false,
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


function add_game_stats_charts(game_data) {
    const timeControls = [
        ["S", "Standard"],
        ["R", "Rapid"],
        ["B", "Blitz"]
    ]
    const gamesByControl = Object.fromEntries(
        timeControls.map(([control]) => [
            control,
            Array.isArray(game_data?.[control]) ? game_data[control] : []
        ])
    )
    const allGames = timeControls.flatMap(([control]) => gamesByControl[control])
    const chartGroups = [
        ...timeControls.map(([control, label]) => [label, gamesByControl[control]]),
        ["Total", allGames]
    ]
    const container = document.getElementById("game_stats_charts")

    for (const [label, games] of chartGroups) {
        const card = document.createElement("article")
        card.className = "game-stats-card"

        const heading = document.createElement("h3")
        heading.textContent = label
        card.appendChild(heading)

        const stats = [
            ["White", get_game_outcome_rates(games, "white")],
            ["Black", get_game_outcome_rates(games, "black")],
            ["Total", get_game_outcome_rates(games)]
        ]
        if (stats[2][1].gameCount === 0) {
            const emptyMessage = document.createElement("p")
            emptyMessage.className = "game-stats-empty"
            emptyMessage.textContent = "No games available"
            card.appendChild(emptyMessage)
        } else {
            const chartContainer = document.createElement("div")
            chartContainer.className = "game-stats-chart"
            const canvas = document.createElement("canvas")
            canvas.setAttribute("aria-label", `${label} win, draw, and loss rates`)
            chartContainer.appendChild(canvas)
            card.appendChild(chartContainer)

            const outcomes = [
                ["Win", "wins", "winRate", "#70AD87"],
                ["Draw", "draws", "drawRate", "#F2C14E"],
                ["Loss", "losses", "lossRate", "#D96C6C"]
            ]
            const datasets = outcomes.map(([outcome, countKey, rateKey, color]) => ({
                label: outcome,
                data: stats.map(([, result]) => result[rateKey]),
                counts: stats.map(([, result]) => result[countKey]),
                backgroundColor: color,
                borderColor: "#fff",
                borderWidth: 1
            }))

            new Chart(canvas, {
                type: "bar",
                data: {
                    labels: stats.map(([groupLabel]) => groupLabel),
                    datasets
                },
                options: {
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            stacked: true
                        },
                        x: {
                            stacked: true,
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: (value) => `${value}%`
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: "top"
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const count = context.dataset.counts[context.dataIndex]
                                    return `${context.dataset.label}: ${context.parsed.x.toFixed(1)}% (${count} games)`
                                }
                            }
                        }
                    }
                },
                plugins: [gameCountLabels]
            })
        }

        container.appendChild(card)
    }
}

function get_game_outcome_rates(games, colour) {
    const outcomes = { wins: 0, draws: 0, losses: 0 }

    for (const game of games) {
        if (game === null || typeof game !== "object") {
            continue
        }
        if (
            colour
            && (typeof game.colour !== "string" || !game.colour.toLowerCase().startsWith(colour[0]))
        ) {
            continue
        }

        const score = Number(game.score)
        if (score === 1 || score === 10) {
            outcomes.wins++
        } else if (score === 0.5 || score === 5) {
            outcomes.draws++
        } else if (score === 0) {
            outcomes.losses++
        }
    }

    const gameCount = outcomes.wins + outcomes.draws + outcomes.losses
    const rate = (count) => gameCount === 0 ? 0 : count / gameCount * 100

    return {
        gameCount,
        ...outcomes,
        winRate: rate(outcomes.wins),
        drawRate: rate(outcomes.draws),
        lossRate: rate(outcomes.losses)
    }
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