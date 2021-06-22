<!-- scripts and imports -->
<script>
	/* import Speedometer from "svelte-speedometer" */
	import Speedometer from "./components/charts/Speedometer.svelte";
	import Menu from "./components/common/Menu.svelte";
	import Button from "@smui/button";
	import Card, { Content } from "@smui/card";
	import Select, { Option } from "@smui/select";
	import Scatter from "./components/charts/Scatter2.svelte";
	import locale from "@reuters-graphics/d3-locale";

	let fruits = ["Pomme", "Orange", "Banana", "Mango"];
	let value = "Orange";
	

	/* TopicB Tab */
	import Tab, { Label } from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	let active = "Cases";

	/* Small multiple map */
	import gridData from "../public/dataGrid.json";
	import Grid from "./components/Grid.svelte";
	let grid = [4, 6];

	let speedData = gridData[gridData.length -1].value0;
	console.log("speed: "+speedData);

	// Scatter
	// import ScatterWapper from './components/ScatterWapper.svelte';



	import weather3 from './data/weather3.json';
	const loc = new locale('en');
	const format = {
		x: loc.formatTime('%B %e'),
		y: loc.format(',.2f'),
	}
	let color = ['rgba(92,198,178, 1)', 'rgba(0,0,0, 1)']

	// console.log('weather3------------')
	// console.log(weather3);

	
	//// FUNCTION-TESTING ////
	/* rolling average */
	import * as csv from "../public/data.csv";
	let csv_data = csv.default
	
	// multiline test
	export let data
	import {rollingAvg, multiline_data} from './utils.js'
	import Multiline from "./components/charts/Multiline.svelte";
	import {curveMonotoneX} from 'd3-shape'
	let mldata = multiline_data(data) 
	$: mldata = multiline_data(data) 
	
	console.log(mldata)

import { utcMillisecond } from "d3-time";

</script>

<!-- HEAD -->
<svelte:head>
	<!-- Material Baseline Typography -->
	<link
		rel="stylesheet"
		href="https://unpkg.com/@material/typography@11.0.0/dist/mdc.typography.css"
	/>
	<!-- SMUI / Our Theme -->
	<link rel="stylesheet" href="/build/smui.css" />
</svelte:head>

<!-- MENU -->
<Menu />

<!-- CONTENT -->
<main>
	<div class="narrowColumn">
	<Multiline 
	data={mldata}
	options={
		{
			key:{x: 'fecha', y: ['cases_50to59', 'cases_60to69','cases_70to79','cases_above80']},
			format: format,
			color: ['#fc0', '#ccc','#dcc011','#cdf011','#1bf011'],
			layout: 'col',
			title:'Title',
			desc:'Description',
			curve: curveMonotoneX
		}
	}
	/>
	</div>

	<div class="narrowColumn">
		<!-- GaugeChart -->
		<div>
			<p class="mdc-typography--headline6" style="text-align: center;">
				Percentage of the population with complete vaccination
			</p>

			<div class="center">
				<div style="width: 500px; height: 281px;">
					<Speedometer />
				</div>
			</div>

			<p class="mdc-typography--body2">
				17% 1 dose Lorem ipsum dolor sit amet, consectetur adipiscing
				elit. Volutpat donec pretium, proin metus. At the current rate,
				it would take 3 months to vaccinate 70% of the population (with
				two doses)
			</p>
		</div>

		<!-- Hero -->
		<div>
			<p class="mdc-typography--headline2">
				This is how vaccination progresses in Spain
			</p>
			<p class="mdc-typography--body1">
				By Spe Chen, Xavier Bolló and Santiago Salcido June 26, 2021
			</p>
			<p class="mdc-typography--body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
		</div>

		<!-- TopicA -->
		<br />
		<div>
			<p class="mdc-typography--body2">[TopicA]</p>
			<p class="mdc-typography--headline4">
				How does each CCAA compare to the national share of vaccinated
				people?
			</p>
			<div>
				<Grid {grid} />
			</div>
			<!-- <img
				src="img/topicA-smallMultiples.png"
				alt="placeholder"
				class="wideColumn"
			/> -->
			<p class="mdc-typography--caption">
				Share of the population that has received two doses
			</p>
			<p class="mdc-typography--body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
		</div>

		<!-- TopicB -->
		<br />
		<div>
			<br />
			<p class="mdc-typography--body2">[TopicB]</p>
			<p class="mdc-typography--headline4">
				Vaccine effect shown by age group
			</p>
			<p class="mdc-typography--body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
			<!-- TopicB Tabs -->
			<div>
				<TabBar
					tabs={["Cases", "Hospitalized", "Deaths", "ICU"]}
					let:tab
					bind:active
				>
					<Tab {tab} minWidth>
						<Label>{tab}</Label>
					</Tab>
				</TabBar>
			</div>
			<br />
			<img
				src="img/topicB-DailyCases1.png"
				alt="placeholder"
				class="wideColumn"
			/>
			<img
				src="img/topicB-DailyCases2.png"
				alt="placeholder"
				class="wideColumn"
			/>
			<p class="mdc-typography--body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
			<img src="img/topicB-scatterplot.png" alt="placeholder" />
		</div>

		<!-- TopicC -->
		<br />
		<div>
			<p class="mdc-typography--body2">[TopicC]</p>
			<p class="mdc-typography--headline4">
				How each age group compare to the others
			</p>
			<p class="mdc-typography--body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>

			<p>x: 'dose2_pct_70to79', y: 'ra_case_peak_pct_70to79'</p>
			<!-- <ScatterWapper /> -->

			<img
				src="img/topicC-scatterplot.png"
				alt="placeholder"
				class="wideColumn"
			/>
			<p class="mdc-typography--body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
		</div>

		<!-- Credits -->
		<div class="credits">
			<p class="mdc-typography--subtitle2">Credits</p>
			<p class="mdc-typography--body1">
				Spe Chen, Xavier Bolló and Santiago Salcido
			</p>
		</div>
	</div>
</main>

<!-- TypeScale HiddenByDeafult // Just to check the TypeScale -->
<div>
	<p class="mdc-typography--headline1">
		This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--headline2">
		This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--headline3">
		This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--headline4">
		This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--headline5">
		This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--headline6">
		This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--subtitle1">
		Subtitle1. This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--subtitle2">
		Subtitle2. This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--body1">
		Body 1. This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--body2">
		Body 2. This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--caption">
		Caption. This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--button">
		Button. This is how vaccination progresses in Spain
	</p>
	<p class="mdc-typography--overline">
		Overline. This is how vaccination progresses in Spain
	</p>
</div>

<!-- EXTRA CSS & STYLES -->
<style>
	:global(body, html) {
		margin: 0;
		font-family: Merriweather Sans, Arial, Helvetica, sans-serif;
	}

	.center {
		display: flex;
		justify-content: center;
	}

	main {
		margin: 0 auto;
		padding-top: 24px;
		padding-bottom: 24px;
		border-left: 1px solid #757575;
		border-right: 1px solid #757575;
		max-width: 1024px;
		background-color: #f2f2f2;
	}

	.narrowColumn {
		margin: 0 auto;
		max-width: 680px;
	}

	.wideColumn {
		margin-left: -160px;
	}

	.credits {
		border-top: 1px solid rgb(124, 124, 124);
		margin: 48px 0px 24px 0px;
	}

</style>
