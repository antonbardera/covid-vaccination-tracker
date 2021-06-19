<script>
	export let grid = [2, 6];
	import * as ccaaData2 from "../public/gap-chart-ca-demo.json";
	import locale from "@reuters-graphics/d3-locale";
	import GapChart from "./charts/GapChart.svelte"

	console.log('in Grid -----')
	console.log(ccaaData2)	

// let ccaaData = [{"date":"2021-03-30T00:00:00.000Z","dateStr":"2021-03-30","ccaa":"Cataluña","value0":0.13,"value1":0.13},
// {"date":"2021-03-31T00:00:00.000Z","dateStr":"2021-03-31","ccaa":"Cataluña","value0":0.14,"value1":0.14},
// {"date":"2021-03-31T00:00:00.000Z","dateStr":"2021-04-01","ccaa":"Cataluña","value0":0.16,"value1":0.14},
// {"date":"2021-04-02T00:00:00.000Z","dateStr":"2021-04-02","ccaa":"Cataluña","value0":0.14,"value1":0.14},
// {"date":"2021-04-02T00:00:00.000Z","dateStr":"2021-04-03","ccaa":"Cataluña","value0":0.13,"value1":0.14},
// {"date":"2021-04-04T00:00:00.000Z","dateStr":"2021-04-04","ccaa":"Cataluña","value0":0.15,"value1":0.15},
// {"date":"2021-04-05T00:00:00.000Z","dateStr":"2021-04-05","ccaa":"Cataluña","value0":0.16,"value1":0.15},
// {"date":"2021-04-06T00:00:00.000Z","dateStr":"2021-04-06","ccaa":"Cataluña","value0":0.16,"value1":0.16},
// {"date":"2021-04-07T00:00:00.000Z","dateStr":"2021-04-07","ccaa":"Cataluña","value0":0.18,"value1":0.17},
// {"date":"2021-04-08T00:00:00.000Z","dateStr":"2021-04-08","ccaa":"Cataluña","value0":0.19,"value1":0.18}];
let ccaaData = ccaaData2.default
	console.log(ccaaData)	
	let color = ['rgba(92,198,178, 1)', 'rgba(0,0,0, 1)']
let colorDiff = ['rgba(92,198,178, 0.5)', 'rgba(0,0,0, 0.5)']
ccaaData.forEach(d => d.dateStr = new Date(d.dateStr));
const loc2 = new locale('en');
const format = {
	x: loc2.formatTime('%B %e'),
    y: loc2.format(',.2f'),
}



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
	
	function coloring(i,j){
		if (getItem(i,j) != ' '){
			return 'colored '.concat(getItem(i,j))
		} 
	}
	
</script>

<div class="container" style="grid-template-rows: {row}; grid-template-columns: {col};">

	{#each {length: grid[0]} as _, i (i)}
	  {#each {length: grid[1]} as _, j (j)}
			<div class={coloring(i,j)}> {getItem(i,j)}
				{#if getItem(i,j) != ' '}      
					<GapChart 
						data={ccaaData}
						title='Title' desc='Description'
						key={{x: 'dateStr', y: ['value0', 'value1']}}
						{format}
						{color}
						{colorDiff}
						layout='col'
					/>
				{/if}
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
		display: block;
	}	
	
	.colored{
		/* background-color: limegreen !important; */
	border-style: dotted;
	}	
	
	.Canarias{
		transform: translate(50px, 20px);
	}
	
	.Baleares{
		transform: translate(40px, -200px);
	}
</style>