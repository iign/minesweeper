var MS = (function () {

	var myPrivateVar, myPrivateMethod; 

	// A private counter variable
	myPrivateVar = 0;

	// A private function which logs any arguments
	myPrivateMethod = function( foo ) {
	  console.log( foo );
	};

	var CELL_STATUS = { NEW: 0, FLAGGED: 1, CLEARED: 2, BOMBED: 3 };

	return {

		// A public variable
		myPublicVar: "foo",

		gridSize: 9,

		grid: [],


		init: function(){

			var bombCounter = 10;



			
			$('#board .square').each(function(index){

				index++;
				var x = Math.ceil(index/9);
				var y = (index % 9) ? (index%9) : 9;

				$(this).attr('data-x', x);
				$(this).attr('data-y', y);
				$(this).attr('id', 'cell-' + x + '-' + y);

			})

			
			//Init grid.
			//zero-index & 10-index are dummy cells
			for (var i = 0; i <= this.gridSize + 1; i++) {
				this.grid[i] = [];
				for (var j = 0; j <= this.gridSize + 1; j++) {
					this.grid[i][j] = {hasBomb: false, bombCount: 0, status: CELL_STATUS.NEW };

				}
			}


			//Insert bombs randomly
			var b = bombCounter;

			while(b > 0){
				
				var x = Math.ceil(Math.random() * this.gridSize);
				var y = Math.ceil(Math.random() * this.gridSize);


				if ( !(this.grid[x][y]).hasBomb ) {
					(this.grid[x][y]).hasBomb = true;
					b--;
					console.log('x:' + x + ' y:' + y + ' Bomb!');
				}
			}

			//Init adjacent bomb counter
			for (var i = 1; i <= this.gridSize; i++) {
				for (var j = 1; j <= this.gridSize; j++) {

					if ( (this.grid[i][j]).hasBomb ) {

						this.grid[i-1][j-1].bombCount++;
						this.grid[i-1][j  ].bombCount++;
						this.grid[i-1][j+1].bombCount++;
						this.grid[i  ][j-1].bombCount++;
						this.grid[i  ][j+1].bombCount++;
						this.grid[i+1][j-1].bombCount++;
						this.grid[i+1][j  ].bombCount++;
						this.grid[i+1][j+1].bombCount++;

					}
				}
			}

			this.bindEvents();

		},


		clickCell: function(x, y){
			
			if (this.grid[x][y].status === CELL_STATUS.NEW) {
				if ( this.grid[x][y].hasBomb ) {
					this.grid[x][y].status = CELL_STATUS.BOMBED;
					$('#cell-' + x + '-' + y).addClass('bombed');
					
				}
				else{

					this.grid[x][y].status = CELL_STATUS.CLEARED;
					var cellText = this.grid[x][y].bombCount? this.grid[x][y].bombCount : '';
					$('#cell-' + x + '-' + y).addClass('cleared').text( cellText );

				}
			}
		},



		flagCell: function(){

		},



		//Cleans out cells with no adjacent bombs all at once.
		flushEmptyCells: function(x, y){
			
			if ( this.grid[x][y].status === CELL_STATUS.NEW ) {



			}

		},






		bindEvents: function() {
			$("#board .square").on("click", function(event){
				
				MS.clickCell( $(this).attr('data-x'), $(this).attr('data-y') );

			});

		}





	};

})();


MS.init();



