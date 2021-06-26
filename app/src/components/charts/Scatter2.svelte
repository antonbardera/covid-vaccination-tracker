<script>

	import Axis from '../common/AxisScatter.svelte';
	import Tooltip from '../common/Tooltip.svelte'
	import {scaleSqrt, scaleTime, scaleLinear, scaleQuantize} from 'd3-scale';
	import {extent} from 'd3-array'
    import { Delaunay } from 'd3-delaunay'
    import { fade } from 'svelte/transition';
	import IntersectionObserver from "svelte-intersection-observer";

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
		// .domain(extent(data, d => d[key.y]))
		.domain([0,25])
		.range([height - margin.bottom - margin.top, margin.top]);
    
	$: colorScale = scaleLinear()
		.domain([minDate, maxDate])
		.range(['#E3F5EC', '#59C28E']);	

		// .range(['#285920', '#54FF7F']);	
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


<IntersectionObserver once {element} bind:intersecting>
	<!-- <div class='placeholder' id="detected" bind:this={element}> 
		Detect this element
	</div> -->
	<div  bind:this={element} class:intersecting class='graphic {layout}' bind:clientWidth={width} bind:clientHeight={height}  >
		{#if width && intersecting }
			<svg xmlns:svg='https://www.w3.org/2000/svg' 
				viewBox='0 0 {width} {height}'
				{width}
				{height}
				role='img'
				>
				<!-- <text x=450 y=50> More people vaccinated ➔</text>
				<text x=600 y=80> Fewer </text>
				<text x=600 y=95> cases </text>
				<text x=620 y=110> ↓</text> -->
				<text class='axis-label'x={x(82)} y={y(-2.8)}>Fully vaccinated rate</text>
				<text class='axis-label' x={x(1)} y={y(25.3)}>Share of peak</text>

				<Axis {width} {height} {margin} scale={y} position='left' format={format.y} />
				<Axis {width} {height} {margin} scale={x} position='bottom' format={format.x} />
				<g>
					{#each data as d, i}
						
						<circle 
							cx={x(d[key.x])}
							cy={y(d[key.y])}
							r=7
							fill-opacity=1
							fill={colorScale(d[key.z])}
							stroke='white'
							stroke-width=1
							transition:fade='{{ delay:700 * i}}'
						/>
						<circle 
							cx={x(d[key.x])}
							cy={y(d[key.y])}
							r=7
							fill-opacity=1
							fill={colorScale(d[key.z])}
							stroke='#757575'
							stroke-width=2
							in:fade2='{{ delay:700 * i, duration:800}}'
							class='date-text'
						/>
						<text
							x={x(d[key.x])}
							y={y(d[key.y])}
							in:fade2='{{ delay:700 * i, duration:800}}'
							class={ x(d[key.x]) < width/ 1.2 ? 'date-text date-text--left' : 'date-text date-text--right'}
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
</IntersectionObserver>

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
		/* height:60vh; */
		height: 450px;
		font-family: "Merriweather Sans";
		font-style: normal;
		font-weight: normal;
		font-size: 10px;
		fill: #757575;
	}

	.date-text{
		opacity: 0;
	}
	
	.date-text.date-text--left {
		text-anchor: start;
		transform: translate(15px, 5px);
		font-size: 13px;
	}

	.date-text.date-text--right {
		text-anchor: end;
		transform: translate(-15px, 5px);
		font-size: 13px;
	}	
	.date-text:last-of-type {
		/* last date stays  */
		opacity : 1;
	}

	svg{
  	  overflow: visible;
  	}

	  .axis-label{
		text-transform: uppercase;
	}
</style>