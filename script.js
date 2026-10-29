import { popup } from "./assets/modules/popups.js"

document.getElementById("info_button").addEventListener("click", open_info)
document.getElementById("go_button").addEventListener("click",collect_inputs)
document.addEventListener("click", (event) => {
    if (event.target.closest("#close_info_book")) {
        close_info()
    } else if (event.target.closest("#btn_1")) {
        how_to_use_it()
    } else if (event.target.closest("#btn_2")) {
        how_it_works()
    } else if (event.target.closest("#btn_3")) {
        troubleshooting()
    } else if (event.target.closest("#btn_4")) {
        contact()
    }
})

async function collect_inputs() {
    var rating_code = document.getElementById("rating_code_input").value;
    var timescale = document.getElementById("timescale_input").value;

    var standard = document.getElementById("S_input").checked;
    var rapid = document.getElementById("R_input").checked;
    var blitz = document.getElementById("B_input").checked;

    rating_code = rating_code.slice(0,6)
    if (isNaN(rating_code) || rating_code.length < 6) {
        await popup("ECF rating code must be a 6 digit string of numbers.")
        return;
    }

    timescale = parseInt(timescale)
    if (isNaN(timescale)) {
        await popup("Timescale input must be an integer, if you enter a decimal, it will round down.")
        return;
    }
    if ((timescale < 1)) {
        await popup("Timescale input must be >= 1.");
        return;
    }

    if (standard === false && rapid === false && blitz === false) {
        await popup("Please choose at least one of Standard, Rapid or Blitz.");
        return;
    }

    show_loading_screen()
    collect_data(rating_code, timescale, standard, rapid, blitz)
}


function show_loading_screen() {
    //Delete all the stuff, add the screen
    document.getElementById("choose_settings_page").remove()
    let ls = document.getElementById("loading_screen");
    let clon = ls.content.cloneNode(true);
    document.body.appendChild(clon);
}


async function collect_data(rating_code, timescale, standard, rapid, blitz) {
    const dates = create_date_list(timescale)
    const time_ctrls = []
    let name = ""
    
    if (standard) {
        time_ctrls.push("S")
    }
    if (rapid) {
        time_ctrls.push("R")
    }
    if (blitz) {
        time_ctrls.push("B")
    }

    const data = {
        "S": {

        },
        "R": {

        },
        "B": {

        }
    }

    try {
        const requests = []

        const res = await fetch("https://rating.englishchess.org.uk/api/players/rating-code?code=" + rating_code)
        const result = await res.json()

        name = result["data"]["full_name"]

        for (const date of dates) {
            for (const ctrl of time_ctrls) {
                requests.push(
                    send_request(`https://rating.englishchess.org.uk/api/ratings?player_no=${rating_code}&domain=${ctrl}&date=${date}`)
                        .then((rating) => {
                            data[ctrl][date] = rating
                        })
                        .catch((error) => {
                            if (error.message === "Player has no ratings for the given date") {
                                data[ctrl][date] = 0
                                return
                            }
                            throw error
                        })
                )
            }
        }

        await Promise.all(requests)

        const commaIndex = name.indexOf(",")
        if (commaIndex !== -1) {
            name = `${name.slice(commaIndex + 1).trim()} ${name.slice(0, commaIndex).trim()}`
        }

        convert_and_open(name,data)

    } catch (error) {
        await popup(`Unable to retrieve ratings: ${error.message}`)
        location.reload()
    }
}


async function send_request(url) {
    const response = await fetch(url)
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || `Request failed with status ${response.status}`)
    }
    if (!result.success) {
        throw new Error(result.message || "The API did not return a rating")
    }

    return result.data.original_rating
}


function create_date_list(timescale) {
    //Creates a list of dates that will put on the graph

    const dates = [];
    const current = new Date();

    for (let i = 0; i < timescale; i++) {
        const running = new Date(current.getFullYear(), current.getMonth() - i, 1);

        let formatted = String(running.getFullYear());
        let month = String(running.getMonth() + 1).padStart(2, "0");
        let date = String(running.getDate()).padStart(2, "0");

        dates.push(`${formatted}-${month}-${date}`);
    }

    return dates;
}


function convert_and_open(name, data) {
    //alert(JSON.stringify(data).length)
    sessionStorage.setItem("ecfGraphData", JSON.stringify({ full_name: name, data }))
    window.location.assign(new URL("graph/", window.location.href))
}

function open_info() {
    let ib = document.getElementById("info_book");
    let clon = ib.content.cloneNode(true);
    document.body.appendChild(clon);
}

function close_info() {
    let clon = document.getElementById("info_book_clon");
    if (clon) {
        clon.remove();
    }
}

function how_to_use_it() {
    document.getElementById("current_content").innerHTML = document.getElementById("how_to_use_it").innerHTML;
}

function how_it_works() {
    document.getElementById("current_content").innerHTML = document.getElementById("how_it_works").innerHTML;
}

function contact() {
    document.getElementById("current_content").innerHTML = document.getElementById("contact").innerHTML;
}

function troubleshooting() {
    document.getElementById("current_content").innerHTML = document.getElementById("troubleshooting").innerHTML;
}