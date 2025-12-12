const API_URL = 'http://127.0.0.1:5000/api/generate'

function getRealLayout(outer_html) {

    let yCount = 1

    let newRows = outer_html.split("<br>").map(
        row => {
            let xCount = 1

            let newRow = row.split("").map(
                element => {

                    let newElement = ''
                    
                    if (element == '-') {
                        newElement = `<span data-tx=${xCount} data-ty=${yCount} class="letter-block disabled"> </span>`
                    } else {
                        newElement = `<span data-tx=${xCount} data-ty=${yCount} class="letter-block"><input class="letter-input" type="text" value=""></span>`
                    }

                    xCount++

                    return newElement
                }
            )

            yCount++

            return newRow.join("")
        }
    )

    return newRows.join("<br>")
}

async function getWords(theme) {
    const response = await fetch(API_URL + "?theme=" + theme, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin': "http://127.0.0.1:5000",
        }
    })

    if (!response.ok) {
        return ""
    }

    const data = await response.json();

    return data
}

async function makeGame(theme) {
        
        let data = await getWords(theme)

        // let input_json = JSON.parse('[{"clue":"that which is established as a rule or model by authority, custom, or general consent","answer":"standard"},{"clue":"a machine that computes","answer":"computer"},{"clue":"the collective designation of items for a particular purpose","answer":"equipment"},{"clue":"an opening or entrance to an inclosed place","answer":"port"},{"clue":"a point where two things can connect and interact","answer":"interface"}]')

        console.log(data)

        var layout = generateLayout(data);
        data = data.filter((o) => {return o.orientation != 'none'})

        console.log(data)

        console.log(layout)

        var rows = layout.rows;
        var cols = layout.cols;
        var table = layout.table; // table as two-dimensional array
        var output_html = layout.table_string; // table as plain text (with HTML line breaks)
        var output_json = layout.result; // words along with orientation, position, startx, and starty

        var indexs = data.map((word) => {
            return {
                json_index : word.position,
                tx : word.startx,
                ty : word.starty
            }
        })


        // console.log(getRealLayout(output_html))
        document.getElementById("content").innerHTML = getRealLayout(output_html)
        document.getElementById("clues").innerHTML = getRealClues(data)
        addIndexes(indexs)

        const letterInputs = document.querySelectorAll('input.letter-input');

        letterInputs.forEach(input => {
            input.addEventListener('input', singleLetter);
        });


        return data
}

function getRealClues(input_json) {
    let clues = input_json.map(word => {
        return `<span class="clue">${word.position}. ${word.clue}</span>`
    })

    return clues.join("")
}

function addIndexes(indexs) {
    for (let indexInf of indexs) {
        let tile = document.querySelector(`span[data-tx="${indexInf.tx}"][data-ty="${indexInf.ty}"]`)
        tile.setAttribute('data-index', indexInf.json_index)
        tile.classList.add('start')
    }
}

function singleLetter() {
    const value = this.value;
    const letter = value.match(/[A-Za-zА-Яа-я]$/)?.[0] || '';
    this.value = letter;
}

// document.querySelector('span[data-tx="0"][data-ty="1"] input')

function isCorrect(input_json) {

    if (!input_json) return

    for (let word of input_json) {
        let word_form = ''
        let x = word.startx
        let y = word.starty
        let isHorizontal = +(word.orientation != "down")
        let isVertical   = +(word.orientation == "down")

        for (let i = 0; i < word.answer.length; i++) {
            word_form += document.querySelector(`span[data-tx="${x}"][data-ty="${y}"] input`).value

            x += isHorizontal;
            y += isVertical;

        }

        if (word.answer != word_form) return false
    }

    return true
}