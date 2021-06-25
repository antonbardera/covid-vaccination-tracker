<!-- scripts and imports -->
<script>
	import Footer from "./components/common/Footer.svelte";
	import Speedometer from "./components/charts/Speedometer.svelte";
	import SpeedometerBg from "./components/charts/SpeedometerBg.svelte";
	import Menu from "./components/common/Menu.svelte";
	// import locale from "@reuters-graphics/d3-locale";
	// import Scatter from "./components/charts/Scatter2.svelte";
	import {textvalues} from "./utils.js"
	export let data
	let text = textvalues(data)
	console.log(text.today)

	/* TopicB TabBar */
	import Tab, { Label } from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	let active = "Cases";

	/* Small multiple map */
	import gridData from "../public/dataGrid.json";
	import Grid from "./components/Grid.svelte";
	let grid = [4, 6];

	/* Gauge */
	let speedData = gridData[gridData.length - 1].value0;
	console.log("speed: " + speedData);

	/* Scatterplot */
	import ScatterWapper from "./components/ScatterWapper.svelte";

	/* Multiline */
	import MultilineWrapper from "./components/MultilineWrapper.svelte";


	let color = ["rgba(92,198,178, 1)", "rgba(0,0,0, 1)"];
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
			<h6 style="text-align: center;">
				Percentage of the population with complete vaccination
			</h6>

			<div class="center">
				<div style="width: 500px; height: 281px;">
					<!-- Disabled Temporarily -->
					<!-- <SpeedometerBg /> -->
					<Speedometer speedValue={speedData} />
				</div>
			</div>
			<p>
				17% 1 dose Lorem ipsum dolor sit amet, consectetur adipiscing
				elit. Volutpat donec pretium, proin metus. At the current rate,
				it would take 3 months to vaccinate 70% of the population (with
				two doses)
			</p>
		</div>

		<!-- Intro -->
		<div>
			<h2 style="text-align: center;">
				This is how vaccination progresses in Spain
			</h2>

			<div class="subtitle1" style="text-align: center;">
				By Spe Chen, Xavier Bolló and Santiago Salcido
			</div>
			<div class="overline" style="text-align: center;">
				June 26, 2021
			</div>
			<p class="subtitle1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
		</div>

		<!-- TopicA -->
		<br />
		<div>
			<h4>
				How does each CCAA compare to the <span class="dotted"
					>national share</span
				> of vaccinated people?
			</h4>
			<p class="overline center">
				<span class="aboveNational">⬤</span> Above national
				<span class="belowNational">⬤</span> Below national
			</p>

			<div>
				<Grid {grid} />
			</div>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
		</div>

		<!-- TopicB -->
		<br />
		<div>
			<h4>Vaccine effect shown by age group</h4>
			<p>
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
			<p class="overline center">
				<span> Age groups </span>
				<span class="group5059">⬤</span> 50-59
				<span class="group6069">⬤</span> 60-69
				<span class="group7079">⬤</span> 70-79
				<span class="groupAbove80">⬤</span> 80+
			</p>
			<MultilineWrapper />
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>
			<!-- <img src="img/topicB-scatterplot.png" alt="placeholder" /> -->
		</div>

		<!-- TopicC -->
		<br />
		<div>
			<h4>How each age group compare to the others</h4>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Volutpat donec pretium, proin metus. Amet, malesuada dui purus
				amet ullamcorper dui, nec. Dis nisl eu tristique dolor fames
				consectetur.
			</p>

			<p>Daily cases versus the winter peak in the age group 70 to 79</p>
			<!-- <p>x: 'ra_dose2_pct_70to79', y: 'ra_case_peak_pct_70to79'</p> -->
			<ScatterWapper />

			<!-- <img
				src="img/topicC-scatterplot.png"
				alt="placeholder"
				class="extendedContentContainer"
			/> -->
			<p>
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
	:global(body) {
		margin: 0;
		font-family: "Merriweather", "Merriweather Sans", Arial, 
	}

	.center {
		display: flex;
		justify-content: center;
	}

	main {
		margin: 0 auto;
		padding-top: 24px;
		padding-bottom: 84px;
		/* border-left: 1px solid #757575;
		border-right: 1px solid #757575; */
		max-width: 1024px;
		background-color: #f6f8f9;
	}

	.contentContainer {
		margin: 0 auto;
		max-width: 680px;
	}

	.extendedContentContainer {
		margin-left: -160px;
	}

	.dotted {
		border-bottom: 2px dotted #999;
		text-decoration: none;
	}

	.aboveNational {
		color: #569e4b;
		margin-bottom: 2px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.belowNational {
		color: #f0a81c;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.group5059 {
		color: #3A505C;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.group6069 {
		color: #00A7B9;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.group7079 {
		color: #59C28E;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.groupAbove80 {
		color: #85DA46;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

</style>
