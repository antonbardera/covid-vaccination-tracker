<!-- scripts and imports -->
<script>
	import Menu from "./components/common/Menu.svelte";
	import Button from "@smui/button";
	import Card, { Content } from "@smui/card";
	import Select, { Option } from "@smui/select";
	let fruits = ["Pomme", "Orange", "Banana", "Mango"];
	let value = "Orange"
	import Tab, { Label } from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	let active = "Home";
	
	// GET APP DATA FROM MAIN.JS
	export let data
	// console.log(data)
	
	// GET DATA FROM STATIC FILE
	import * as json from "../public/data.json";
	import * as csv from "../public/data.csv";
	console.log(csv)
	// console.log(json)

</script>

<!-- HEAD -->
<svelte:head>
	<!-- Fonts -->
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/icon?family=Material+Icons"
	/>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700"
	/>
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>

	<!-- Material Typography -->
	<!-- <link
		rel="stylesheet"
		href="https://unpkg.com/@material/typography@11.0.0/dist/mdc.typography.css"
	/> -->
	<link rel="stylesheet" href="/mdc.typography.css" />

	<!-- SMUI -->
	<link rel="stylesheet" href="/build/smui.css" />
</svelte:head>

<!-- MENU -->
<Menu />

<!-- CONTENT -->
<main>
	<Card style="width: 360px; margin: 2em auto;">
		<img src="img/placeholder.jpg" alt="placeholder" />
		<Content class="mdc-typography--headline4">Gauge chart</Content>
		<Content class="mdc-typography--body2">This is a card!</Content>
	</Card>

	<p class="mdc-typography--headline2">
		This is how vaccination progresses in Spain
	</p>

	<p class="mdc-typography--body1">
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat donec
		pretium, proin metus. Amet, malesuada dui purus amet ullamcorper dui,
		nec. Dis nisl eu tristique dolor fames consectetur.
	</p>

	<div class="columns margins" style="justify-content: flex-start;">
		<div>
			<Select bind:value label="Pick a fruit">
				{#each fruits as fruit}
					<Option value={fruit}>{fruit}</Option>
				{/each}
			</Select>

			<pre class="status">Selected: {value}</pre>
		</div>
	</div>

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

		<div style="margin-top: 1em;">
			<div>Programmatically select:</div>
			{#each ["Cases", "Hospitalized", "Deaths", "ICU"] as tab}
				<Button on:click={() => (active = tab)}
					><Label>{tab}</Label></Button
				>
			{/each}
		</div>

		<pre class="status">Selected: {active}</pre>
	</div>
</main>

<!-- CSS & STYLES -->
<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
	}

	main {
		margin: 0 auto;
		max-width: 680px;
		padding: 0px 24px;
		background-color: #fff;
	}

	/* :global(.link) {
		color: #333;
		text-decoration: none;
		border-bottom: 1px dashed #333;
		transition: all 0.3s;
	} */

	/* :global(.link:hover) {
		color: #505050;
		background-color: #fff;
		text-decoration: none;
		border-bottom: 1px solid #333;
	}
	:global(.number, .header) {
		padding-left: 1rem !important;
	} */
</style>
