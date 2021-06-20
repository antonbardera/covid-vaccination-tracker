<script>
	export let grid = [2, 6];
	import locale from "@reuters-graphics/d3-locale";
	import GapChart from "./charts/GapChart.svelte"

	import * as ccaaData2 from "../../public/gap-chart-ca.json";
	import * as allCCAA from "../../public/gap-chart-demo.json";
	import * as data_raw from "../../public/data_xavier.json"; // downloaded from Xavier's branch
	
	/* --------------------  
	   DATA PREPROCESSING 
	-----------------------*/
	// first vaccination date March 31
	let DataLong = data_raw.default.filter(d => new Date(d.fecha) > new Date("2021-03-30"));

	let uniqueCCAA = [...new Set(DataLong.map(item => item.ccaa))]
	console.log("CCAAs in the dataset----------");
	console.log(uniqueCCAA);

	// Totales is missing in xavi's dataset, so use "Cataluña" as value1 for now
	let dataGlobal = DataLong.filter(d => d.ccaa === "Cataluña").map(d => {return{
		date: new Date(d.fecha.split("T")[0]),
		dateStr: d.fecha.split("T")[0],
		ccaa: d.ccaa,
		value1: Math.round(+d["dose2_perc_total"]) / 100
	};})

	function findValueByDate(dateStr){
		let result = dataGlobal.filter(d => d.dateStr === dateStr).map(d => d.value1)[0]
		// fill nan with 0 for value0 
		if (isNaN(result)){ return 0} else {return result} 
	}
	let data2 = DataLong.map(d => {return{
		date: new Date(d.fecha.split("T")[0]),
		dateStr: new Date(d.fecha.split("T")[0]),
		ccaa: d.ccaa,
		value0: (isNaN(d["dose2_perc_total"]))? 0 : Math.round(+d["dose2_perc_total"]) / 100,
		value1: findValueByDate(d.fecha.split("T")[0])
	};})

	/* --------------------  
	   Set up for <main> 
	-----------------------*/
	
	let color = ['rgba(92,198,178, 1)', 'rgba(0,0,0, 1)']
	let colorDiff = ['rgba(92,198,178, 0.5)', 'rgba(0,0,0, 0.5)']
	const loc = new locale('en');
	const format = {
		x: loc.formatTime('%B %e'),
		y: loc.format(',.2f'),
	}

	$: col = `repeat(${grid[1]}, 1fr)`;
	$: row = `repeat(${grid[0]}, 1fr)`;	
	
	// accent
	// for xavier's dataset
	var items = [
    ['Galicia', 'Asturias', 'Cantabria', 'País Vasco', 'Aragón', 'Cataluña'],
    [0, 'Castilla y León', 'La Rioja', 'Navarra', 'Com. Valenciana', 0],
    [0, 'Extremadura', 'Madrid', 'Castilla-La Mancha', 'Murcia', 0],
    ['Canarias',0, 'Andalucía', 0,0,'Baleares'],
    ];

	// to loosely match naming in data.json. some unicode problems
	// for demo dataset
	// var items_ = [
    // ['Galicia', 'Asturias', 'Cantabria', 'País Vasco', 'Aragón', 'Cataluña'],
    // [0, 'Castilla y Leon', 'La Rioja', 'Navarra', 'Com Valenciana', 0],
    // [0, 'Extremadura', 'Madrid', 'Castilla - La Mancha', 'Murcia', 0],
    // ['Canarias',0, 'Andalucía', 0,0,'Baleares'],
    // ];

	function getVaxDataByCCAA(ccaaName){
		let selected = data2.filter(d => d.ccaa === ccaaName)
		return selected
		// for other demo dataset
		// let selected = allCCAA.default.filter(d => d.ccaa === ccaaName)
		// return selected.map(d => {return{
		// 	date: d.date,
		// 	dateStr: new Date (d.dateStr),
		// 	ccaa: d.ccaa,
		// 	value0: d.value0,
		// 	value1: d.value1
		// };})
	}

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
						data={getVaxDataByCCAA(getItem(i,j))}
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
		border: 2px solid lightgray;
	}	
	
	.Canarias{
		transform: translate(50px, 20px);
	}
	
	.Baleares{
		transform: translate(40px, -200px);
	}
</style>