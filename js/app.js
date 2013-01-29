var MS = (function () {
	"use strict";

	var CELL_STATUS = { NEW: 0, FLAGGED: 1, CLEARED: 2, BOMBED: 3 };

	//private grid.
	var grid = [];
	var timer = null;

	return {

		gridSize: 9, //Board size
		bombSize: 10, //Amount of bombs in board
		scoreBombs: 10, //Bombs flagged count
		timeElapsed: 0,

		init: function(){

			this.bombSize = 10;
			this.scoreBombs = 10;
			this.timeElapsed = 0;

			this.startTimer();

			$('#board .square').removeClass('cleared bombed flagged trigger bomb-1 bomb-2 bomb-3 bomb-4 bomb-5 bomb-6').text('');
			$('#board button').removeAttr('disabled');
			$('#score-restart-button').removeClass('success');

			$('#score-bomb-count').text(this.zeroPad(this.scoreBombs, 3));

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
			var b = MS.bombSize;

			while(b > 0){

				var x = Math.ceil(Math.random() * this.gridSize);
				var y = Math.ceil(Math.random() * this.gridSize);


				if ( !(grid[x][y]).hasBomb ) {
					(grid[x][y]).hasBomb = true;
					b--;
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

					if (MS.scoreBombs === 0) {
						this.checkWinCondition();
					}

					grid[x][y].status = CELL_STATUS.CLEARED;
					var cellText = grid[x][y].bombCount;

					if (cellText > 0) {

						$('#cell-' + x + '-' + y).addClass('cleared ' + 'bomb-' + cellText).text( cellText );

					}
					else{
						$('#cell-' + x + '-' + y).addClass('cleared');
					}

				}
			}
		},

		//Cleans out cells with no adjacent bombs all at once.
		clearAdjacentCells: function(x, y){

			if ( (x > 0 && y > 0) && (x < this.gridSize + 1 && y < this.gridSize + 1) && (grid[x][y]).status !== CELL_STATUS.CLEARED && (grid[x][y]).status !== CELL_STATUS.FLAGGED ) {

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
					var cellText = (grid[x][y]).bombCount;
					if (cellText > 0) {

						$('#cell-' + x + '-' + y).addClass('cleared ' + 'bomb-' + cellText).text( cellText );

					}
					else{
						$('#cell-' + x + '-' + y).addClass('cleared');
					}
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

			$('#board button').attr('disabled', 'disabled');
			window.clearInterval(timer);

		},

		flagCell: function( x, y ){

			if ( grid[x][y].status === CELL_STATUS.NEW && this.scoreBombs > 0 ) {

				$('#cell-' + x + '-' + y).addClass('flagged');
				grid[x][y].status = CELL_STATUS.FLAGGED;
				this.scoreBombs--;
				$('#score-bomb-count').text(this.zeroPad(this.scoreBombs, 3));

			}
			else if(grid[x][y].status === CELL_STATUS.FLAGGED){
				$('#cell-' + x + '-' + y).removeClass('flagged');
				grid[x][y].status = CELL_STATUS.NEW;
				this.scoreBombs++;
				$('#score-bomb-count').text(this.zeroPad(this.scoreBombs, 3));
			}

			this.checkWinCondition();

		},

		//Bind mouse events.
		bindEvents: function() {
			$("#board .square").on('click', function(event){

				MS.clickCell( $(this).attr('data-x'), $(this).attr('data-y') );

			});

			$('#score-restart-button').on('click', function(event) {

				MS.init();

			});

			//Flagging bombs.
			$('#board .square').on('contextmenu rightclick', function(e){
				e.preventDefault();
				MS.flagCell($(this).attr('data-x'), $(this).attr('data-y'));
				return false;
			});

		},

		checkWinCondition: function(){

			var flaggedBombs = 0;
			var unclearedCells = 0;

			for (var i = 1; i <= this.gridSize; i++) {
				for (var j = 1; j <= this.gridSize; j++) {

					if (grid[i][j].status === CELL_STATUS.NEW){
						unclearedCells++;
					}

					if (grid[i][j].status === CELL_STATUS.FLAGGED && grid[i][j].hasBomb ) {
						flaggedBombs++;
					}
				}
			}

			if (unclearedCells > 1){
				return false;
			}

			if (flaggedBombs === this.bombSize) {
				$('#score-restart-button').addClass('success');
				$('#board button').attr('disabled', 'disabled');
				clearInterval(timer);
				alert('You Win! Time: ' + this.timeElapsed);
			}
			else{
				return false;
			}

		},

		//Helper function, padding numbers.
		zeroPad: function(number, width){
			width -= number.toString().length;
			if ( width > 0 )
			{
				return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
			}

			return number + ''; // always return a string

		},

		startTimer: function(){

			$('#score-time-count').text(this.zeroPad(0, 3));
			clearInterval(timer);
			var ms = this;
			timer = window.setInterval(function(){

				ms.timeElapsed++;
				$('#score-time-count').text(ms.zeroPad(ms.timeElapsed, 3));

			}, 1000);

		}

	};

})();

//Start game
MS.init();
MS.bindEvents();
