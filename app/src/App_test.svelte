<!-- scripts and imports -->
<script>
	import Footer from "./components/common/Footer.svelte";
	import Speedometer from "./components/charts/Speedometer.svelte";
	//import SpeedometerBg from "./components/charts/SpeedometerBg.svelte";
	import Menu from "./components/common/Menu.svelte";
	// import locale from "@reuters-graphics/d3-locale";
	// import Scatter from "./components/charts/Scatter2.svelte";
	import { textvalues } from "./utils.js";
	$: text = textvalues();
	// console.log('---text toodaaay',text.today)

	/* TopicB TabBar */
	import Tab, { Label } from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	$: active = "Cases";

	/* Small multiple map */
	import gridData from "../public/dataGrid.json";
	import Grid from "./components/Grid.svelte";
	import Grid1 from "./components/Grid1.svelte";

	let grid = [4, 6];
	let selectedCCAA

	/* Gauge */
	let speedData = gridData[gridData.length - 1].value0;

	/* Scatterplot */
	// import ScatterWapper from "./components/ScatterWapper.svelte";

	/* Multiline */
	// import MultilineWrapper from "./components/MultilineWrapper.svelte";
	let color = ["rgba(92,198,178, 1)", "rgba(0,0,0, 1)"];

	/* MUI Paper */
	import Paper, { Title, Subtitle, Content } from "@smui/paper";
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
					<!-- <Speedometer speedValue={speedData} /> -->
				</div>
			</div>
			<p>
				As of {text.today}, for every 100 people at least {text.vacc_over_pop_100_2dose}
				are fully vaccinated and {text.vacc_over_pop_100_1dose} had received
				their first dose in Spain. At the current rate, the national target
				of vaccinating 70% of its population would be reached by
				<span class="dotted">{text.end_date_70pct}</span>.
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

			<div class="overline" style="text-align: center; padding-bottom: 24px;">
				Published: June 26, 2021 | Updated: {text.today}
			</div>
			
			<p class="subtitle1">
				Spain rolled out its mass vaccination program in January. A
				total of {text.total_millions} million doses have been administered
				so far. On average, {text.daily_avg_prev_formatted} of shots were
				given out everyday in early {text.prev_month} and the figure has
				increased to {text.daily_avg_curr_formatted} in {text.curr_month}.
			</p>
			<p>
				Currently there are four types of Covid-19 vaccines being
				administered in seventeen Spanish regions. These include Johnson
				& Johnson’s single-dose vaccine, Janssenm and the two-dose
				series, Pfizer-BioNTech, Moderna and AstraZeneca/Oxford.
			</p>
			<p>
				The nation focuses on a health risk and age-based vaccine
				rollout plan to protect the most vulnerable groups from
				contracting the disease. In our preliminary analysis with
				available open data, we conclude some notable regional
				differences in vaccination rate and the first sign of vaccine
				effect comparing the nearly 100% vaccinated group versus less
				ones.
			</p>
		</div>

		<!-- TopicA -->
		<br />
		<div>
			<h4>
				How does each region compare to the <span class="dotted"
					>national share</span
				> of vaccinated people?
			</h4>
			<h6>
				Percentage of fully inoculated population by region versus
				national level
			</h6>
			<p class="overline center">
				<span class="aboveNational">⬤</span> Above national
				<span class="belowNational">⬤</span> Below national
			</p>

			<div>
				<Grid {grid} />
			</div>
			<p class='subtitle1'>Why is there a gap in those regions?</p>
			<p>
				Following the national guideline, each autonomous region (<i
					>Comunidad Autónoma</i
				> abbreviated as CCAA) manages the vaccine administration to its priority groups.
				Every region more or less follows the same rollout policy. So
				why does the gap occur?
			</p>
			<p>
				One possible explanation is that the demography in each region
				is not uniform. The age group of more than 70 years old takes up
				roughly 8% of the whole population in Spain.
			</p>
			<p>
				On the contrary, Castilla y León<Grid1 selectedCCAA={'Castilla y Leon'} />, Galicia <Grid1 selectedCCAA={'Galicia'} />
				and Asturias <Grid1 selectedCCAA={'Asturias'} />

				which sit in the northwestern corner of the country see more than 
				20% of their residents aged above 70 — the largest share of elderly 
				across all CCAAs — according to the latest census data.
			</p>
			<p>
				This aging demographic coincides with the above national
				vaccination rate regions colored green shown in the above chart.
				This vaccination gap is rooted in the age-based rollout plan.
				The opposite vaccination trends are reflected in the younger
				CCAAs like Madrid<Grid1 selectedCCAA={'Madrid'} />, Cataluña<Grid1 selectedCCAA={'Cataluña'} /> 
				and Com. Valenciana <Grid1 selectedCCAA={'C.Valenciana'} />where
				vaccination rates lag behind the national average, colored
				orange.
			</p>
			<p>
				However, the age group difference can not explain why two islands 
				have an older population but see the widest vaccination gap below 
				national average in the course of the inoculation campaign. Both 
				Canarias <Grid1 selectedCCAA={'Canarias'} />and Baleares <Grid1 selectedCCAA={'Baleares'} />
				have approximately 13% of its residents aged more than 70, whereas 8% of the whole population in Spain is beyond that age. 
			</p>
		</div>

		<!-- TopicB -->
		<br />
		<div>
			<h4>Vaccine effect shown by age group</h4>
			<p>
				Several covid-19 indicators continue their overall downward
				trend since January. However, indices trends of each age group
				diverged after the mass inoculation campaign rolled out
				progressively.
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
			<!-- <MultilineWrapper tablabel={active} /> -->
			<p>
				People over 80 were the earliest to receive shots. They were the
				most affected measured by the relative terms of covid-19 cases, hospital admissions, severe hospital cases (ICU)
				and deaths in previous waves of outbreak.
			</p>
			<p>
				Now with close to 100% vaccinated, the group’s share of cases
				versus its winter peak has been failing and separated itself
				from other younger age groups which received shots later than
				the group.
			</p>
			<p>
				Similar pattern surfaces after the vaccination rolled out to the
				next elderly age groups, 70 to 79, 60 to 69, 50 to 59 and so
				forth.
			</p>
			<br />

			<Paper class="paper-demo">
				<div class="subtitle1">
					<!-- svelte-ignore a11y-missing-content -->
					<a id="textBox" />
					Why do we show “share of the peak”, indices as a percentage of
					its peak, instead of absolute numbers?
				</div>
				<div class="body1" style="padding-top: 12px;">
					The share of peak is calculated by dividing the rolling
					average numbers by its max value. This normalization allows
					us to compare across age groups of various sizes.
				</div>
			</Paper>


		</div>

		<!-- TopicC -->
		<br />
		<div>
			<h4>Evolution of vaccine effectiveness by age group</h4>
			<!-- <ScatterWapper /> -->
		</div>
	</div>
</main>
<Footer />

<!-- EXTRA CSS & STYLES -->
<style>
	:global(body) {
		margin: 0;
		font-family: "Merriweather", "Merriweather Sans", Arial;
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

	/* .extendedContentContainer {
		margin-left: -160px;
	} */

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
		color: #3a505c;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.group6069 {
		color: #00a7b9;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.group7079 {
		color: #59c28e;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	.groupAbove80 {
		color: #85da46;
		margin-left: 15px;
		position: relative;
		top: -2px;
		margin-right: 2px;
	}

	* :global(.paper-demo) {
		margin: 0 auto;
		margin-bottom: 48px;
		max-width: 680px;
	}
</style>
