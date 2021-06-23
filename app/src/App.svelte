<!-- scripts and imports -->
<script>
	import Footer from "./components/common/Footer.svelte";
	import Speedometer from "./components/charts/Speedometer.svelte";
	import Menu from "./components/common/Menu.svelte";
	/* TEMP DEACTIVATE IMPROVE LOCAL PERFORMANCE */
	import Scatter from "./components/charts/Scatter2.svelte";
	import locale from "@reuters-graphics/d3-locale";

	/* TopicB Tab BAR */
	import Tab, { Label } from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	let active = "Cases";

	/* Small multiple map */
	/* TEMP DEACTIVATE IMPROVE LOCAL PERFORMANCE */
	import Grid from "./components/Grid.svelte";
	let grid = [4, 6];

	// Scatter
	/* TEMP DEACTIVATE IMPROVE LOCAL PERFORMANCE */
	import ScatterWapper from "./components/ScatterWapper.svelte";
	import weather3 from "./data/weather3.json";
	const loc = new locale("en");
	const format = {
		x: loc.formatTime("%B %e"),
		y: loc.format(",.2f"),
	};
	let color = ["rgba(92,198,178, 1)", "rgba(0,0,0, 1)"];

	// console.log('weather3------------')
	// console.log(weather3);

	//// FUNCTION-TESTING ////
	/* TEMP DEACTIVATE IMPROVE LOCAL PERFORMANCE */
	/* rolling average */
	import * as csv from "../public/data.csv";
	// console.log(csv.default)
	let csv_data = csv.default;
	// export let data
	import { rollingAvg, nationalValues, allAges } from "./utils.js";
	console.log(rollingAvg(csv_data));

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
	<div class="contentContainer">
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

		<!-- Intro -->
		<div>
			<p class="mdc-typography--headline2" style="text-align: center;">
				This is how vaccination progresses in Spain
			</p>
			<div class="mdc-typography--subtitle1" style="text-align: center;">
				By Spe Chen, Xavier Bolló and Santiago Salcido
			</div>
			<div class="mdc-typography--overline" style="text-align: center;">
				June 26, 2021
			</div>
			<p class="mdc-typography--subtitle1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
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
			<p class="mdc-typography--headline4">
				How does each CCAA compare to the national share of vaccinated
				people?
			</p>

			<div>
				<!-- TEMP DEACTIVATE IMPROVE LOCAL PERFORMANCE -->
				<Grid {grid} />
			</div>
			<!-- <img
				src="img/topicA-smallMultiples.png"
				alt="placeholder"
				class="extendedContentContainer"
			/> -->
			<!-- <p class="mdc-typography--caption">
				Share of the population that has received two doses
			</p> -->
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
				<!--
				  Note: tabs must be unique. (They cannot === each other.)
				-->
				<TabBar
					tabs={["Cases", "Hospitalized", "Deaths", "ICU"]}
					let:tab
					bind:active
				>
					<!-- Note: the `tab` property is required! -->
					<Tab {tab}>
						<Label>{tab}</Label>
					</Tab>
				</TabBar>
			</div>

			<br />
			<img
				src="img/topicB-DailyCases1.png"
				alt="placeholder"
				class="extendedContentContainer"
			/>
			<img
				src="img/topicB-DailyCases2.png"
				alt="placeholder"
				class="extendedContentContainer"
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
			<!-- TEMP DEACTIVATE IMPROVE LOCAL PERFORMANCE -->
			<ScatterWapper />

			<img
				src="img/topicC-scatterplot.png"
				alt="placeholder"
				class="extendedContentContainer"
			/>
			<p class="mdc-typography--body1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
		</div>
	</div>
</main>
<Footer />

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
		padding-bottom: 84px;
		border-left: 1px solid #757575;
		border-right: 1px solid #757575;
		max-width: 1024px;
		background-color: #f2f2f2;
	}

	.contentContainer {
		margin: 0 auto;
		max-width: 680px;
	}

	.extendedContentContainer {
		margin-left: -160px;
	}

	.credits {
		border-top: 1px solid rgb(124, 124, 124);
		margin: 48px 0px 24px 0px;
	}
</style>
