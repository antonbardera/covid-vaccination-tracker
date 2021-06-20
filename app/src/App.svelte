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

	/* Samll multiple map */	
	import Grid from './components/Grid.svelte';
	let grid = [4, 6];

	// Scatter
	import ScatterWapper from './components/ScatterWapper.svelte';



	import weather3 from './data/weather3.json';
	const loc = new locale('en');
	const format = {
		x: loc.formatTime('%B %e'),
		y: loc.format(',.2f'),
	}
	let color = ['rgba(92,198,178, 1)', 'rgba(0,0,0, 1)']

	console.log('weather3------------')
	console.log(weather3);

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
		<!-- GaugeChart -->
		<div>
			<p class="mdc-typography--body2">
				17% of the population with the complete schedule of the vaccine
				in Spain
			</p>
			<!-- <img
				src="img/placeholder.jpg"
				alt="placeholder"
				width="360"
				height="202"
				class="center"
			/> -->
			<div
				style=" 
				width: auto; 
				height: 360px; 
				margin-left: 5%;
				margin-right: 5%;
				"
			>
				<Speedometer />
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
			<ScatterWapper />

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

<!-- EXTRA CSS & STYLES -->
<style>
	:global(body, html) {
		margin: 0;
		font-family: Inter, Arial, Helvetica, sans-serif;
	}

	.center {
		display: block;
		margin-left: auto;
		margin-right: auto;
		width: 50%;
	}

	main {
		margin: 0 auto;
		padding-top: 24px;
		padding-bottom: 24px;
		max-width: 1048px;
		background-color: #fff;
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
