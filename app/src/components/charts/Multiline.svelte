<script>
	import Axis from "../common/Axis.svelte";
	import PointInteractive from "../common/PointInteractive.svelte";
	import { line } from "d3-shape";
	import { scaleTime, scaleLinear } from "d3-scale";
	import { max, extent } from "d3-array";
	import { Delaunay } from "d3-delaunay";
	import { fade } from 'svelte/transition';
	
	export let data;
	export let margin = { top: 20, right: 5, bottom: 20, left: 5 };
	export let options;
	// export let text;
	export let keyx;
	export let keyy;
	let {format, color, layout, title, desc, curve } = options;
	$: key = {
		x:keyx,
		y:keyy
	}

	let datum, width, height;

	$: _data = key.y.map((key, i) =>
		data.map((d) => ({
			x: new Date(d.fecha),
			y: d[key],
			key: key,
			color: color[i],
		}))
	);

	console.log(data[data.length -3]['fecha'])
	console.log(max(data.map(d => new Date(d.fecha))))

	$: x = scaleTime()
		.domain(extent(_data.flat(), (d) => d.x))
		.range([margin.left, width - margin.right]);
	$: y = scaleLinear()
		.domain([0, max(_data.flat(), (d) => d.y)])
		.range([height - margin.bottom - margin.top, margin.top]);

	$: path = line()
		.x((d) => x(d.x))
		.y((d) => y(d.y))
		.curve(curve);

	$: delaunay = Delaunay.from(
		_data.flat(),
		(d) => x(d.x),
		(d) => y(d.y)
	);

	const mouseMove = (m) => {
		const mX = m.offsetX ? m.offsetX : m.clientX;
		const mY = m.offsetY ? m.offsetY : m.clientY;
		const picked = delaunay.find(mX, mY);
		datum = _data.flat()[picked];
	};

	const leave = (m) => {
		datum = null;
	};

	$: hilite = (key) => {
		if (datum) return datum.key === key ? 1 : 0.3;
		else return 1;
	};
</script>

<div
	class="graphic {layout}"
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	{#if width}
		<svg
			xmlns:svg="https://www.w3.org/2000/svg"
			viewBox="0 0 {width} {height}"
			{width}
			{height}
			role="img"
			aria-labelledby="title desc"
			on:touchmove|preventDefault
			on:pointermove|preventDefault={mouseMove}
			on:mouseleave={leave}
			on:touchend={leave}
		>
			<!-- <title id="title">{text}</title>
			<desc id="desc">{desc}</desc> -->
			<text class='axis-label' x={width*0.85} y={height*0.08} >Share of peak</text>

			<g>
				{#each _data as d}
					<path
						d={path(d)}
						stroke={d[0].color}
						fill="none"
						opacity={hilite(d[0].key)}
						transition:fade="{{duration: 1000}}"
					/>
				{/each}
			</g>
			<Axis
				{width}
				{height}
				{margin}
				scale={y}
				position="left"
				format={format.yAxis}
			/>
			<Axis
				{width}
				{height}
				{margin}
				scale={x}
				position="bottom"
				format={format.x}
			/>

			<PointInteractive
				{datum}
				{format}
				{x}
				{y}
				key={{ x: "x", y: "y" }}
				{width}
			/>
		</svg>
	{/if}
</div>

<style>
	.graphic {
		height: 450px;
		/* font-size: 100%; */
		font-family: "Merriweather Sans";
		font-style: normal;
		font-weight: normal;
		font-size: 10px;
		fill: #757575;
	}
	path {
		transition: opacity 0.3s;
		stroke-width: 2px;
	}

	.axis-label{
		text-transform: uppercase;
	}
</style>
