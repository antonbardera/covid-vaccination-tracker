<script>
	import Axis from '../common/AxisSmallMultiple.svelte';
	import SimpleAxis from '../common/AxisSmallMultipleSimple.svelte';

	import PointInteractive from '../common/PointInteractive.svelte';
	import {line, curveStep,area, curveBasis} from 'd3-shape';
	import {scaleTime, scaleLinear} from 'd3-scale';
	import {max, extent, bisector} from 'd3-array'
    
    export let data;
	export let margin = {top: 0, right: 10, bottom: 13, left: 10};
	export let format;
	export let key;
	export let color;
	// export let colorDiff;
	// export let title;
	// export let desc;
	export let layout;
	let datum, width;
	let height = 150;	
	let width2 = 150;


	let selectedCurve = curveBasis;

	$: x = scaleTime()
		.domain(extent(data, d => d[key.x]))
		.range([margin.left, width - margin.right]);
	
	// $: y = scaleLinear()
	// 	.domain([0, max(data, d => d[key.y[0]])])
	// 	.range([height - margin.bottom - margin.top, margin.top]);
	
	$: y = scaleLinear()
		.domain([0, 0.45])
		.range([height - margin.bottom - margin.top, margin.top]);

	$: path = line()
		.x(d => x(d[key.x]))
		.y(d => y(d[key.y[0]]))
		.curve(selectedCurve);
	$: path2 = line()
		.x(d => x(d[key.x]))
		.y(d => y(d[key.y[1]]))
		.curve(selectedCurve);
	$: aboveAreaPath1 = area()
		.x(d => x(d[key.x]))
		.y0(0)
		.y1(d => y(d[key.y[0]]))
		.curve(selectedCurve);
	
	$: belowAreaPath1 = area()
		.x(d => x(d[key.x]))
		.y0(d => y(d[key.y[0]]))
		.y1(height)
		.curve(selectedCurve);
	$: aboveAreaPath2 = area()
		.x(d => x(d[key.x]))
		.y0(0)
		.y1(d => y(d[key.y[1]]))
		.curve(selectedCurve);
	
	$: belowAreaPath2 = area()
		.x(d => x(d[key.x]))
		.y0(d => y(d[key.y[1]]))
		.y1(height)
		.curve(selectedCurve);

</script> 

<div class='graphic {layout}' bind:clientWidth={width}>
{#if width}
<svg xmlns:svg='https://www.w3.org/2000/svg' 
	viewBox='0 0 {width} {width}'
	{width}
	height={width}
	role='img'
	>
	<!-- <title id='title'>{title}</title>
	<desc id='desc'>{desc}</desc> -->
	{#if ['Galicia', 'Castilla y Leon', 'Extremadura', 'Canarias', 'Baleares'].includes(data[0]['ccaa'])}
		<Axis {width} {height} {margin} scale={y} position='left' format={format.y} />
		<Axis {width} {height} {margin} scale={x} position='bottom' format={format.x} />
	{:else }
		<SimpleAxis {width} {height} {margin} scale={y} position='left' format={format.y} />
		<SimpleAxis {width} {height} {margin} scale={x} position='bottom' format={format.x} />
	{/if}
	<g>
		<clipPath id="abovearea">	
			<path 
				d={aboveAreaPath2(data)}
			/>
		</clipPath>
		<clipPath id="belowarea">	
			<path 
				d={belowAreaPath2(data)}
			/>
		</clipPath>
		<path 
			clip-path="url(#abovearea)"
			fill={color[0]}
			fill-opacity= 0.25
			d={belowAreaPath1(data)}
		/>
		<path 
			clip-path="url(#belowarea)"
			fill={color[1]}
			fill-opacity= 0.25
			d={aboveAreaPath1(data)}
		/>
		<path 
			clip-path="url(#abovearea)"
			d={path(data)}
			stroke={color[0]}
			fill='none'
			stroke-width=2.5
		/>
		<path 
			clip-path="url(#belowarea)"
			d={path(data)}
			stroke={color[1]}
			fill='none'
			stroke-width=2.5
		/>
		<path 
			d={path2(data)}
			stroke='#333'
			fill='none'
			stroke-width=2
			stroke-dasharray="2 3"
		/>
	</g>



	<!-- <PointInteractive {datum} {format} {x} {y} {key} {width} />  -->
	
</svg>
{/if}
</div>

<style>
/* 
svg{
	overflow: visible;
} */
</style>