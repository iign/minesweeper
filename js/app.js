var MS = (function () {
	"use strict";

	var CELL_STATUS = { NEW: 0, FLAGGED: 1, CLEARED: 2, BOMBED: 3 };
	
	//private grid.
	var grid = [];

	return {

		// A public variable
		myPublicVar: "foo",

		gridSize: 9,

		init: function(){

			var bombCounter = 10;

			$('#board .square').removeClass('cleared', 'bombed').text('');
			
			$('#board .square').each(function(index){

				index++;
				var x = Math.ceil(index/9);
				var y = (index % 9) ? (index%9) : 9;

				$(this).attr('data-x', x);
				$(this).attr('data-y', y);
				$(this).attr('id', 'cell-' + x + '-' + y);

			});

			
			//Init grid.
			//zero-index & 10-index are dummy cells
			for (var row = 0; row <= this.gridSize + 1; row++) {
				grid[row] = [];
				for (var col = 0; col <= this.gridSize + 1; col++) {
					grid[row][col] = {hasBomb: false, bombCount: 0, status: CELL_STATUS.NEW };

				}
			}


			//Insert bombs randomly
			var b = bombCounter;

			while(b > 0){
				
				var x = Math.ceil(Math.random() * this.gridSize);
				var y = Math.ceil(Math.random() * this.gridSize);


				if ( !(grid[x][y]).hasBomb ) {
					(grid[x][y]).hasBomb = true;
					b--;
					console.log('x:' + x + ' y:' + y + ' Bomb!');
				}
			}

			//Init adjacent bomb counter
			for (var i = 1; i <= this.gridSize; i++) {
				for (var j = 1; j <= this.gridSize; j++) {

					if ( (grid[i][j]).hasBomb ) {

						grid[i-1][j-1].bombCount++;
						grid[i-1][j  ].bombCount++;
						grid[i-1][j+1].bombCount++;
						grid[i  ][j-1].bombCount++;
						grid[i  ][j+1].bombCount++;
						grid[i+1][j-1].bombCount++;
						grid[i+1][j  ].bombCount++;
						grid[i+1][j+1].bombCount++;

					}
				}
			}

			this.bindEvents();

		},


		clickCell: function(x, y){
			
			if (grid[x][y].status === CELL_STATUS.NEW) {
				if ( grid[x][y].hasBomb ) {
					grid[x][y].status = CELL_STATUS.BOMBED;
					$('#cell-' + x + '-' + y).addClass('bombed trigger');

					this.revealBombs();
					
				}
				else{

					if ( grid[x][y].bombCount === 0 ) {

						if ( (x > 0 && y > 0) && (x < this.gridSize + 1 && y < this.gridSize + 1) ) {
							this.clearAdjacentCells(x, y);
						}

					}

					grid[x][y].status = CELL_STATUS.CLEARED;
					var cellText = grid[x][y].bombCount? grid[x][y].bombCount : '';
					$('#cell-' + x + '-' + y).addClass('cleared').text( cellText );

					//check win condition.
					
				}
			}


		},

		//Cleans out cells with no adjacent bombs all at once.
		clearAdjacentCells: function(x, y){

			if ( (x > 0 && y > 0) && (x < this.gridSize + 1 && y < this.gridSize + 1) && (grid[x][y]).status !== CELL_STATUS.CLEARED  ) {


				if ( (grid[x][y]).bombCount === 0) {
					
					(grid[x][y]).status = CELL_STATUS.CLEARED;
					$('#cell-' + x + '-' + y).addClass('cleared');

					x = parseInt(x, 10);
					y = parseInt(y, 10);

					this.clearAdjacentCells(x-1, y-1);
					this.clearAdjacentCells(x-1, y);
					this.clearAdjacentCells(x-1, y+1);
					this.clearAdjacentCells(x, y-1);
					this.clearAdjacentCells(x, y+1);
					this.clearAdjacentCells(x+1, y-1);
					this.clearAdjacentCells(x+1, y);
					this.clearAdjacentCells(x+1, y+1);

				}
				else{
					(grid[x][y]).status = CELL_STATUS.CLEARED;
					var cellText = (grid[x][y]).bombCount? (grid[x][y]).bombCount : '';
					$('#cell-' + x + '-' + y).addClass('cleared').text( cellText );
				}

			}

		},

		revealBombs: function(){

			for (var i = 1; i <= this.gridSize; i++) {
				for (var j = 1; j <= this.gridSize; j++) {
				
					if ( (grid[i][j]).hasBomb  &&  (grid[i][j]).status !== CELL_STATUS.CLEARED ) {
						(grid[i][j]).status = CELL_STATUS.BOMBED;
						$('#cell-' + i + '-' + j).addClass('bombed');
					}

				}
			}

		},

		flagCell: function(){

		},

		//Bind mouse events.
		bindEvents: function() {
			$("#board .square").on('click', function(event){
				
				MS.clickCell( $(this).attr('data-x'), $(this).attr('data-y') );

			});


			$('#score-restart-button').on('click', function(event) {
				
				MS.init();

			});

		}


	};

})();

//Start game
MS.init();
