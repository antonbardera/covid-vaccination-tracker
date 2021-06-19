<script>
	export let grid = [2, 6];
	
	$: col = `repeat(${grid[1]}, 1fr)`;
	$: row = `repeat(${grid[0]}, 1fr)`;	
	
	var items = [
    ['Galicia', 'Asturias', 'Cantabria', 'País Vasco', 'Aragón', 'Cataluña'],
    [0, 'Castilla y León', 'La Rioja', 'Navarra', 'Com. Valenciana', 0],
    [0, 'Extremadura', 'Madrid', 'Castilla-La Mancha', 'Murcia', 0],
    ['Canarias',0, 'Andalucía', 0,0,'Baleares'],
    ];
	
    function getItem(i,j){
		if (items[i][j] === 0){
			return ' '
		} else {
            return items[i][j]
        }
    }
	
	function color(i,j){
		if (getItem(i,j) != ' '){
			return 'colored '.concat(getItem(i,j))
		} 
	}
	
</script>

<div class="container" style="grid-template-rows: {row}; grid-template-columns: {col};">

	{#each {length: grid[0]} as _, i (i)}
	  {#each {length: grid[1]} as _, j (j)}
			<div class={color(i,j)}> {getItem(i,j)}
            
            </div>
		{/each}
	{/each}
	

</div>

<style>
	.container {
		display: grid;
/* 		border: 1px solid #999; */
		border-radius: 2px;
		width: 800px;
		height: 500px;
		grid-gap: 1px;
/* 		background: #999; */
	} 
	
	.container div {
		background: #fff;
	}	
	
	.colored{
		background-color: limegreen !important;
	}
	
	.Canarias{
		transform: translate(50px, 20px);
	}
	
	.Baleares{
		transform: translate(40px, -200px);
	}
</style>