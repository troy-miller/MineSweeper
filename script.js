//-----------------
//Classes
//-----------------
class CellContainer {

    /**
     * The container holds all the cells that make up the game
     * board. It also keeps track of some more general information,
     * like the amount flags currently placed and the state of the
     * game (has the user won yet?)
     */
    constructor(boardWidth, boardHeight) {
        this.cells = [];

        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.numCells = this.boardWidth*this.boardHeight;
        this.numBombs = 0;
        this.flags = 0;

        this.firstClick = true;
    }

    getCells() {
        return this.cells;
    }
    getCellAtIndex(index) {
        return this.cells[index];
    }
    addCell(cell) {
        this.cells.push(cell);
    }
    getWidth() {
        return this.boardWidth;
    }
    getHeight() {
        return this.boardHeight;
    }
    getNumCells() {
        return this.numCells;
    }
    getFlags() {
        return this.flags;
    }
    addFlag() {
        this.flags++;

        //This method also handles the win condition because if
        //every flag has been placed, the user may have won, this
        //is what the below flag checks
        if (this.flags == this.numBombs) {
            if (this.checkWin()) {
                endGame(true, this);
            }
        }
    }
    removeFlag() {
        this.flags--;
    }
    getNumBombs() {
        return this.numBombs;
    }
    setNumBombs(numBombs) {
        this.numBombs = numBombs;
    }
    isFirstClick() {
        return this.firstClick;
    }
    setFirstClick(firstClick) {
        this.firstClick = firstClick;
    }


    //If every cell that has a bomb in it has also been flagged,
    //the game is considered to have been won
    checkWin() {
        for (let i = 0; i < this.numCells; i++) {
            if (this.getCellAtIndex(i).getBomb()) {
                if (!this.getCellAtIndex(i).getFlagged()) {
                    return false;
                }
            }
        }

        return true;
    }
}


class Cell {
    
    /**
     * The game board is made up of cells, which contain the
     * following data:
     *  - the container they are being held in
     *  - the index that they are located at in their container
     *  - the div element in the document that they pertain to
     *  - whether or not they are a bomb and how many of their
     *    neighbors are bombs
     *  - if they are flagged, protected (protection described 
     *    below), or clicked
     *  - if they are located on an edge of the board (top, left,
     *    bottom, right)
     */
    constructor(div, index, container) {
        this.container = container;

        this.div = div;
        this.index = index;
        this.isBomb = false;
        this.neighbors = 0;
        this.clicked = false;
        this.flagged = false;
        this.protected = false;

        this.left = false;
        this.right = false;
        this.top = false;
        this.bottom = false;
    }


    //When moused over or clicked, cell is darkened
    colorDark() {
        if (!this.clicked && !gameOver) {
            this.changeColor("grey");
        }
    }

    //Return to normal when mouse leaves cell
    colorLight() {
        if (!this.clicked && !gameOver) {
            this.changeColor("darkgrey");
        }
    }

    //Cells can be flagged by the user when they believe they
    //contain a bomb; they can only, however, place as many flags
    //as there are bombs
    flag() {
        if (this.container.isFirstClick()) {
            alert("You can't place a flag until you've started the game.");
        }
        else if (!this.clicked && !gameOver) {
            if (this.container.getFlags() < this.container.getNumBombs()) {
                this.flagged = true;
                this.changeColor("orange");
                this.clicked = true;
                this.container.addFlag();
            }
            else {
                alert("All flags have been used!");
            }
        }
        else if (this.flagged) {
            this.changeColor("grey");
            this.clicked = false;
            this.container.removeFlag();
            this.flagged = false;
        }
    }


    //The click method acts sort-of recursively. If a cell, when
    //clicked, has no neighbors who are bombs, then it will
    //automatically trigger those cell also
    click() {
        if (this.flagged) {return;}

        this.clicked = true;


        //This is where protection comes into play. When the game has
        //just started, the experience is pretty well ruined if the
        //user clicks on a cell and all it gives is a number of neighbor
        //bombs. What this firstClick method does, then, is make sure
        //that the first cell has no neighbors that are bombs
        if (this.container.isFirstClick()) {
            this.protected = true;
            
            if (!this.left) {
                this.container.getCellAtIndex(this.index - 1).protect();

                if (!this.top) {
                    this.container.getCellAtIndex(this.index - this.container.getWidth() - 1).protect();
                }
                if (!this.bottom) {
                    this.container.getCellAtIndex(this.index + this.container.getWidth() - 1).protect();
                }
            }

            if (!this.right) {
                this.container.getCellAtIndex(this.index + 1).protect();

                if (!this.top) {
                    this.container.getCellAtIndex(this.index - this.container.getWidth() + 1).protect();
                }
                if (!this.bottom) {
                    this.container.getCellAtIndex(this.index + this.container.getWidth() + 1).protect();
                }
            }

            if (!this.top) {
                this.container.getCellAtIndex(this.index - this.container.getWidth()).protect();
            }

            if (!this.bottom) {
                this.container.getCellAtIndex(this.index + this.container.getWidth()).protect();
            }

            populateBoard(this.container, this.container.getNumBombs(), this.container.getWidth(), this.container.getHeight());
            this.container.setFirstClick(false);

            this.click();
        }

        //This triggers a losing condition if user clicks on a bomb
        else if (this.isBomb) {
            this.changeColor("red");

            if (!gameOver) {
                endGame(false, this.container);
            }
        }
        else {

            if (gameOver) { return; }

            this.changeColor("grey");

            //If the cell has any bombs adjacent to it, it will simply
            //show how many there are
            if (this.neighbors != 0) {
                this.setText(this.neighbors.toString());
            }

            //Otherwise, the 'recursion' is triggered
            else {
                if (!this.left) {
                    if (!this.container.getCellAtIndex(this.index - 1).getClicked()) {
                        this.container.getCellAtIndex(this.index - 1).click();
                    }
    
                    if (!this.top) {
                        if (!this.container.getCellAtIndex(this.index - this.container.getWidth() - 1).getClicked()) {
                            this.container.getCellAtIndex(this.index - this.container.getWidth() - 1).click();
                        }
                    }
                    if (!this.bottom) {
                        if (!this.container.getCellAtIndex(this.index + this.container.getWidth() - 1).getClicked()) {
                            this.container.getCellAtIndex(this.index + this.container.getWidth() - 1).click();
                        };
                    }
                }
    
                if (!this.right) {
                    if (!this.container.getCellAtIndex(this.index + 1).getClicked()) {
                        this.container.getCellAtIndex(this.index + 1).click();
                    }
    
                    if (!this.top) {
                        if (!this.container.getCellAtIndex(this.index - this.container.getWidth() + 1).getClicked()) {
                            this.container.getCellAtIndex(this.index - this.container.getWidth() + 1).click();
                        }
                    }
                    if (!this.bottom) {
                        if (!this.container.getCellAtIndex(this.index + this.container.getWidth() + 1).getClicked()) {
                            this.container.getCellAtIndex(this.index + this.container.getWidth() + 1).click();
                        }
                    }
                }
    
                if (!this.top) {
                    if (!this.container.getCellAtIndex(this.index - this.container.getWidth()).getClicked()) {
                        this.container.getCellAtIndex(this.index - this.container.getWidth()).click();
                    }
                }
    
                if (!this.bottom) {
                    if (!this.container.getCellAtIndex(this.index + this.container.getWidth()).getClicked()) {
                        this.container.getCellAtIndex(this.index + this.container.getWidth()).click();
                    }
                }
            }
        }
    }

    changeColor(color) {
        this.div.style.backgroundColor = color;
    }


    //Getters and setters
    getDiv() {return this.div;}
    getBomb() {return this.isBomb;}
    setBomb() {this.isBomb = true;}
    setText(text) {this.div.innerHTML = text;}
    getNeighbors() {return this.neighbors;}
    setNeighbors(numNeighbors) {this.neighbors = numNeighbors;}
    getClicked() {return this.clicked;}
    getFlagged() {return this.flagged;}
    getProtected() {return this.protected;}
    protect() {this.protected = true;}

    getLeft() {return this.left;}
    getRight() {return this.right;}
    getTop() {return this.top;}
    getBottom() {return this.bottom;}
    setLeft() {this.left = true;}
    setRight() {this.right = true;}
    setTop() {this.top = true;}
    setBottom() {this.bottom = true;}
}


//-----------------
//Functions
//-----------------

//This function creates the cell container and the cells that will
//fill it, along with associating a new div element in the document
//to each of those cells
let createCells = function(cellWidth, cellHeight) {

    //Set up css
    let divContainer = document.getElementsByClassName("grid-container")[0];
    divContainer.style.width = (30*cellWidth + 5*(cellWidth-1)).toString() + "px";
    divContainer.style.height = (30*cellHeight + 5*(cellHeight-1)).toString() + "px";
    let template = "";
    for (let i = 0; i < cellWidth; i++) {
        template += "30px ";
    }
    divContainer.style.gridTemplateColumns = template;
    template = "";
    for (let i = 0; i < cellHeight; i++) {
        template += "30px ";
    }
    divContainer.style.gridTemplateRows = template;
    if (parseInt(divContainer.style.width) > window.innerWidth) {
        divContainer.style.left = "0";
        divContainer.style.marginLeft = "auto";
    }
    else {
        divContainer.style.left = "50%";
        divContainer.style.marginLeft = (0 - parseInt(divContainer.style.width)/2).toString() + "px";
    }
    divContainer.style.backgroundColor = "black";

    let button = document.getElementById("button-container");
    //button.style.top = (parseInt(divContainer.style.height) + 130).toString() + "px";
    

    


    for (let i = 1; i < cellWidth*cellHeight + 1; i++) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("grid-cell");

        let container = document.getElementsByClassName("grid-container")[0];
        container.appendChild(newDiv);
    }

    let divs = document.getElementsByClassName("grid-cell");
    let cells = new CellContainer(cellWidth, cellHeight);
    cells.setNumBombs(cellWidth*cellHeight/5);

    for (let i = 0; i < divs.length; i++) {
        let div = divs[i];
        cells.addCell(new Cell(div, i, cells));

        //Here is where the event listeners are added to the div
        //elements which trigger the functions in the cell class
        div.addEventListener("mouseover", function() {cells.getCellAtIndex(i).colorDark();});
        div.addEventListener("mouseleave", function() {cells.getCellAtIndex(i).colorLight();});
        div.addEventListener("click", function() {cells.getCellAtIndex(i).click();});
        div.addEventListener("contextmenu", function(ev) {
                                                ev.preventDefault();
                                                cells.getCellAtIndex(i).flag();
                                                return false;
                                            });


        if (i%cellWidth == 0) { cells.getCellAtIndex(i).setLeft(); }
        if ((i - cellWidth + 1)%cellWidth == 0) { cells.getCellAtIndex(i).setRight(); }
        if (i < cellWidth) { cells.getCellAtIndex(i).setTop(); }
        if (i >= (cellWidth*cellHeight - cellWidth)) { cells.getCellAtIndex(i).setBottom(); }
    }

    return cells;
}

let populateBoard = function(cells, numBombs, width, height) {
    //Set bombs
    for (let i = 0; i < numBombs; i++) {
        bombCell = Math.floor(Math.random() * cells.getNumCells());
        while (cells.getCellAtIndex(bombCell).getBomb() || cells.getCellAtIndex(bombCell).getProtected()) {
            bombCell = Math.floor(Math.random() * cells.getNumCells());
        }

        cells.getCellAtIndex(bombCell).setBomb();
    }

    //Find how many bomb neighbors each cell has
    for (let i = 0; i < cells.getNumCells(); i++) {
        if (!cells.getCellAtIndex(i).getBomb()) {
            let neighbors = 0;

            if (!cells.getCellAtIndex(i).getLeft()) {
                if (cells.getCellAtIndex(i - 1).getBomb()) { neighbors++; }

                if (!cells.getCellAtIndex(i).getTop()) {
                    if (cells.getCellAtIndex(i - width - 1).getBomb()) { neighbors++; }
                }
                if (!cells.getCellAtIndex(i).getBottom()) {
                    if (cells.getCellAtIndex(i + width - 1).getBomb()) { neighbors++; }
                }
            }

            if (!cells.getCellAtIndex(i).getRight()) {
                if (cells.getCellAtIndex(i + 1).getBomb()) { neighbors++; };

                if (!cells.getCellAtIndex(i).getTop()) {
                    if (cells.getCellAtIndex(i - width + 1).getBomb()) { neighbors++; }
                }
                if (!cells.getCellAtIndex(i).getBottom()) {
                    if (cells.getCellAtIndex(i + width + 1).getBomb()) { neighbors++; }
                }
            }

            if (!cells.getCellAtIndex(i).getTop()) {
                if (cells.getCellAtIndex(i - width).getBomb()) { neighbors++; }
            }

            if (!cells.getCellAtIndex(i).getBottom()) {
                if (cells.getCellAtIndex(i + width).getBomb()) { neighbors++; }
            }

            cells.getCellAtIndex(i).setNeighbors(neighbors);
        }
    }
}

let endGame = function(isWin, cells) {
    gameOver = true;

    if (isWin) {
        alert("You win! Good job");
    }
    else {
        for (let i = 0; i < cells.getNumCells(); i++) {
            if (cells.getCellAtIndex(i).getBomb()) {
                cells.getCellAtIndex(i).click();
                cells.getCellAtIndex(i).changeColor("red");
            }
        }
        alert("You lost! Sorry");
    }
    
}


//Creating a new game removes all the current div elements and
//and rewrites new cells into the game
let newGame = function() {
    let divs = document.getElementsByClassName("grid-cell");
    while (divs.length != 0) {
        divs[0].parentNode.removeChild(divs[0]);
    }

    let inputWidth = prompt("Enter preferred board width (must be between 4 and 100):");
    let width = parseInt(inputWidth);
    while (width < 4 || width > 100 || isNaN(width)) {
        inputWidth = prompt("Please enter a valid width:");
        width = parseInt(inputWidth);
    }

    let inputHeight = prompt("Enter preferred board height (must be between 4 and 100):");
    let height = parseInt(inputHeight);
    while (height < 4 || height > 100 || isNaN(height)) {
        inputHeight = prompt("Please enter a valid height:");
        height = parseInt(inputHeight);
    }

    newCells = createCells(width, height);
    gameOver = false;
}