<script>
	import Axis from '../common/AxisScatter.svelte';
	import Tooltip from '../common/Tooltip.svelte'
	import {scaleSqrt, scaleTime, scaleLinear} from 'd3-scale';
	import {extent} from 'd3-array'
    import { Delaunay } from 'd3-delaunay'
    import { fade } from 'svelte/transition';

    export let data;
	export let margin = {top: 20, right: 5, bottom: 20, left: 5};
	export let format;
	export let key;
    export let color;
    export let title;
	export let desc;
	export let layout;

	let datum, width, height, tooltipOptions, tip;

	data.sort((a,b) => a[key.size] - b[key.size])

	$: x = scaleLinear()
		.domain(extent(data, d => d[key.x]))
		.range([margin.left, width - margin.right]);
	
	$: y = scaleLinear()
		.domain(extent(data, d => d[key.y]))
        .range([height - margin.bottom - margin.top, margin.top]);
        
    $: size = scaleSqrt()
		.domain(extent(data, d => d[key.size]))
		.range([3, (width > 640) ? 30 : width / 15]);

	$: delaunay = Delaunay.from(data, d => x(d[key.x]), d => y(d[key.y]));

	const mouseMove = (m) => {
        const mX = (m.offsetX) ? m.offsetX : m.clientX;
		const mY = (m.offsetY) ? m.offsetY : m.clientY;
		let visible = true;
        const picked = delaunay.find(mX, mY);
		datum = data[picked];
		tip = (datum !== undefined)
			?``
			:``;
		tooltipOptions = {x: mX, y: mY, tip: tip, visible: visible}
	}

	const leave = (m) => {
		tooltipOptions = {x: -1000, y: -1000, tip: '', visible: false}
	}

	let visible = false;
	function handleClick() {
		visible = !visible;
		console.log(visible)
	}

	function fade2(node, { duration, delay }){
	const o = +getComputedStyle(node).opacity;
	return {
		delay,
		duration,
		css: t => { 
			console.log('t=======')
			console.log(t)
			// return `opacity: ${t * o}`
			if( t <= 0.5){
				return `opacity: ${t * 2 * o}`
			} else {
				return `opacity: ${(1-t) * 2 * o}`
			}
		}		
	};
	}
</script>

<div class='graphic {layout}' bind:clientWidth={width} bind:clientHeight={height}>

<!-- <label>
	<input type="checkbox" bind:checked={visible}>
	visible
</label> -->

<button on:click={handleClick}>
	Play by date
</button>

{#if width}
<svg xmlns:svg='https://www.w3.org/2000/svg' 
	viewBox='0 0 {width} {height}'
	{width}
	{height}
	role='img'
    aria-labelledby='title desc'
    on:touchmove|preventDefault
	on:pointermove|preventDefault={mouseMove}
	on:mouseleave={leave}
	on:touchend={leave}
	>
	<title id='title'>{title}</title>
	<desc id='desc'>{desc}</desc>
	{#if visible}
	<g>
		{#each data as d, i}
			<text
				x={x(d[key.x])}
				y={y(d[key.y])}
				transition:fade='{{ delay:500 * i}}'
				fill="rgba(232, 232, 232, 0.5)"
			>
				{d.dateStr}
			</text>
		<circle 
			cx={x(d[key.x])}
			cy={y(d[key.y])}
			r=5
			fill-opacity=.5
			fill={color}
			stroke={color}
			stroke-width=.3
			transition:fade='{{ delay:500 * i, intro: true }}'
		/>
		{/each}
		{#each data as d}
		<circle 
			cx={x(d[key.x])}
			cy={y(d[key.y])}
			r=5
			class='hover'
			class:selected={d === datum}
		/>
		{/each}

	</g>
	{/if}
	<Axis {width} {height} {margin} scale={y} position='left' format={format.y} />
	<Axis {width} {height} {margin} scale={x} position='bottom' format={format.x} />

</svg>

<Tooltip {... tooltipOptions} {width} {height} />

{/if}

</div>

<style>
	path {
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
	}

	.graphic{
		height:40vh;
	}
</style>