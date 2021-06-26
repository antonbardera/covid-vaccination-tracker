<script>
	import Axis from '../common/AxisSmallMultiple.svelte';
	import SimpleAxis from '../common/AxisSmallMultipleSimple.svelte';

	import PointInteractive from '../common/PointInteractive.svelte';
	import {line, curveStep,area, curveBasis} from 'd3-shape';
	import {scaleTime, scaleLinear} from 'd3-scale';
	import {max, extent, bisector} from 'd3-array'
    
    export let data;
	export let margin = {top: 1, right: 1, bottom: 1, left: 1};
	export let format;
	export let key;
	export let color;
	// export let colorDiff;
	// export let title;
	// export let desc;
	export let layout;
	let datum;
	let height = 45;	
	let width = 45;

	let data_ = data
	const shuffled = data_.sort(() => 0.5 - Math.random());

	// Get sub-array of first n elements after shuffled
	let selected = shuffled.slice(0, data.length / 3);

	let data2 = selected.sort((a, b) => a.date - b.date);

	console.log(selected)
	let selectedCurve = curveBasis;

	$: x = scaleTime()
		.domain(extent(data2, d => d[key.x]))
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

<div class='container'>
<!-- <div {width}> -->
<!-- {#if width} -->
	<svg xmlns:svg='https://www.w3.org/2000/svg' 
		viewBox='0 0 {width} {width}'
		{width}
		height={width}
		role='img'
		>
		<!-- <title id='title'>{title}</title>
		<desc id='desc'>{desc}</desc> -->
		<!-- {#if ['Galicia', 'Castilla y Leon', 'Extremadura', 'Canarias', 'Baleares'].includes(data[0]['ccaa'])}
			<Axis {width} {height} {margin} scale={y} position='left' format={format.y} />
			<Axis {width} {height} {margin} scale={x} position='bottom' format={format.x} />
		{:else } -->
			<!-- <SimpleAxis {width} {height} {margin} scale={y} position='left' format={format.y} />
			<SimpleAxis {width} {height} {margin} scale={x} position='bottom' format={format.x} /> -->
		<!-- {/if} -->
		<g>
			<path 
			d={path(data2)}
			stroke={color[0]}
			fill='none'
			stroke-width=2.5
			/>
			<clipPath id="abovearea">	
				<path 
					d={aboveAreaPath2(data2)}
				/>
			</clipPath>
			<clipPath id="belowarea">	
				<path 
					d={belowAreaPath2(data2)}
				/>
			</clipPath>
			<path 
				clip-path="url(#abovearea)"
				fill={color[0]}
				fill-opacity= 0.25
				d={belowAreaPath1(data2)}
			/>
			<path 
				clip-path="url(#belowarea)"
				fill={color[1]}
				fill-opacity= 0.25
				d={aboveAreaPath1(data2)}
			/>
			<path 
				clip-path="url(#abovearea)"
				d={path(data2)}
				stroke={color[0]}
				fill='none'
				stroke-width=1.5
			/>
			<path 
				clip-path="url(#belowarea)"
				d={path(data2)}
				stroke={color[1]}
				fill='none'
				stroke-width=1.5
			/>
			<path 
				d={path2(data2)}
				stroke='#333'
				fill='none'
				stroke-width=1
				stroke-dasharray="2 3"
			/>
		</g>


		<!-- <PointInteractive {datum} {format} {x} {y} {key} {width} />  -->
		
	</svg>
<!-- {/if}
</div> -->
</div>
<style>
	.container{
		display: inline-block;
		margin-bottom: -3px;
	}
</style>