<script>

	import Axis from '../common/AxisScatter.svelte';
	import Tooltip from '../common/Tooltip.svelte'
	import {scaleSqrt, scaleTime, scaleLinear, scaleQuantize} from 'd3-scale';
	import {extent} from 'd3-array'
    import { Delaunay } from 'd3-delaunay'
    // import { fade } from 'svelte/transition';
	// import IntersectionObserver from "svelte-intersection-observer";

    export let data;
	export let margin = {top: 20, right: 10, bottom: 20, left: 10};
	export let format;
	export let minDate;
	export let maxDate;
	export let key;
	export let layout;

	let element;
  	let intersecting;

	let datum, width, height, tooltipOptions, tip;

	data.sort((a,b) => a[key.size] - b[key.size])

	// $: x = scaleLinear()
	// 	.domain(extent(data, d => d[key.x]))
	// 	.range([margin.left, width - margin.right]);

	$: x = scaleLinear()
		.domain([0,100])
		.range([margin.left, width - margin.right]);

	$: y = scaleLinear()
		.domain(extent(data, d => d[key.y]))
        .range([height - margin.bottom - margin.top, margin.top]);
    
	$: colorScale = scaleLinear()
		.domain([minDate, maxDate])
		.range(['#305C2A', '#B3FF7D']);	
		// .range(['#657C89','#85DA46']);	

	function fade2(node, { duration, delay}){
	const o = +getComputedStyle(node).opacity;
	return {
		delay,
		duration,
		css: t => { 
			if( t >= 1){
				return `opacity: 0`
			} 
			return `opacity : ${t*1}`
		}		
	};
	}


</script>


	<div  bind:this={element} class:intersecting class='graphic {layout}' bind:clientWidth={width} bind:clientHeight={height}  >
		{#if width }
			<svg xmlns:svg='https://www.w3.org/2000/svg' 
				viewBox='0 0 {width} {height}'
				{width}
				{height}
				role='img'
				>
				<text x=450 y=50> More people vaccinated ➔</text>
				<text x=600 y=80> Fewer </text>
				<text x=600 y=95> cases </text>
				<text x=620 y=110> ↓</text>
				<text x=500 y=520>Fully vaccinated rate</text>
				<text x=0 y=25>Share of peak</text>

				<Axis {width} {height} {margin} scale={y} position='left' format={format.y} />
				<Axis {width} {height} {margin} scale={x} position='bottom' format={format.x} />
				<g>
					{#each data as d, i}
						
						<circle 
							cx={x(d[key.x])}
							cy={y(d[key.y])}
							r=7
							fill-opacity=0.5
							fill={colorScale(d[key.z])}
							stroke='rgba(0, 0, 0, 0.3)'
							stroke-width=1
						/>
						<!-- <circle 
							cx={x(d[key.x])}
							cy={y(d[key.y])}
							r=7
							fill-opacity=1
							fill={colorScale(d[key.z])}
							stroke='#333'
							stroke-width=2
							class='date-text'
						/> -->
						<text
							x={x(d[key.x])}
							y={y(d[key.y])}
							class={ x(d[key.x]) < width/2 ? 'date-text date-text--left' : 'date-text date-text--right'}
						>
							{d.dateStr}
						</text>
					{/each}
					<!-- {#each data as d}
					<circle 
						cx={x(d[key.x])}
						cy={y(d[key.y])}
						r=5
						class='hover'
						class:selected={d === datum}
					/>
					{/each} -->

				</g>

			</svg>
		<!-- <Tooltip {... tooltipOptions} {width} {height} /> -->
		{/if}
	</div>

<style>
	/* path {
		fill:none;
		stroke-width: 2;
	}
	.hover {
		fill:none;
		stroke-width:2px;
		stroke:#000;
		stroke-opacity: 0;
		transition: all .3s;
	}
	.selected {
		stroke-opacity:1;
		transition: all .3s;
	} */

	.graphic{
		height:60vh;
	}

	.date-text{
		opacity: 0;
	}
	
	.date-text.date-text--left {
		text-anchor: start;
		transform: translate(7px,-5px);
	}

	.date-text.date-text--right {
		text-anchor: end;
		transform: translate(-7px , -5px);
	}	
	.date-text:last-of-type {
		/* last date stays  */
		opacity : 1;
	}

	svg{
  	  overflow: visible;
  	}
</style>