<script>
	import locale from "@reuters-graphics/d3-locale";
	import Multiline from "../components/charts/Multiline.svelte";
	import {curveBasis} from 'd3-shape'
	import {multiline_data} from '../utils.js'
//	import Button, { Label, Icon } from '@smui/button';
//	import { fade } from 'svelte/transition';
//	import IntersectionObserver from "svelte-intersection-observer";

	export let tablabel;

	let element;
  	let intersecting;
	
	import * as csv from "../../public/data.csv"
	let data = csv.default
	
	const formatPercentage = (value, locale = "en-GB") => {
    return Intl.NumberFormat(locale, {
			style: "percent",
			minimumFractionDigits: 1,
			maximumFractionDigits: 2
    	}).format(value);
	};
	const formatPercentageAxis = (value, locale = "en-GB") => {
    return Intl.NumberFormat(locale, {
			style: "percent",
			maximumFractionDigits: 0
    	}).format(value);
	};
	
	const loc = new locale('en');
	const format = {
		x: loc.formatTime('%b'),
		y: formatPercentage,
		yAxis: formatPercentageAxis
	}
	
	const formatLong = {
		x: loc.formatTime('%b %e'),
		y: formatPercentage,
		yAxis: formatPercentageAxis
	}
	
	let mldata = multiline_data(data) 

	//console.log('hello',mldata)
	
	$: mldata = multiline_data(data) 

	
	const keysLabels = {
		Cases : ['peak_cases_50to59', 'peak_cases_60to69','peak_cases_70to79','peak_cases_above80'],
		Deaths : ['peak_deaths_50to59', 'peak_deaths_60to69','peak_deaths_70to79','peak_deaths_above80'],
		Hospitalized : ['peak_hosp_50to59', 'peak_hosp_60to69','peak_hosp_70to79','peak_hosp_above80'],
		ICU : ['peak_uci_50to59', 'peak_uci_60to69','peak_uci_70to79','peak_uci_above80']
	}
	
	let xKey = "fecha";
	//let yKey = cases
	let selected;
	

	let selected_cases = () => { y = cases }
	let selected_deaths = () => { y = deaths }

	
	function setValues(vars){
		y = `${vars}`
	}



</script>

<div class="narrowColumn">
	<Multiline
		data = {mldata[tablabel]}
		text = {tablabel}
		keyx = 'fecha'
		keyy = {keysLabels[tablabel]}
		options={{
			//key:{x: 'fecha', y: keysLabels[tablabel]},
			// key:{x: 'fecha', y: ['cases_50to59', 'cases_60to69','cases_70to79','cases_above80']},
			format: format,
			color: ["#3A505C", "#00A7B9", "#59C28E", "#85DA46"],
			layout: "col",
			title: tablabel,
			desc: "Description",
			curve: curveBasis,
		}}
	/>
</div> 
 <br> 
<p class="overline center">Trend from April 2021</p>
<div class="narrowColumn">
	<Multiline
		data={mldata[tablabel].filter((d) => new Date(d.fecha) > new Date("2021-04-01"))}
		keyx = 'fecha'
		keyy = {keysLabels[tablabel]}
		options={{
			// key:{x: 'fecha', y: ['ra_cases_50to59', 'ra_cases_60to69','ra_cases_70to79','ra_cases_above80']},
			// key:{x: 'fecha', y: ['cases_50to59', 'cases_60to69','cases_70to79','cases_above80']},
			format: formatLong,
			color: ["#3A505C", "#00A7B9", "#59C28E", "#85DA46"],
			layout: "col",
			title: "Title",
			desc: "Description",
			curve: curveBasis
		}}
	/>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
	}
</style>
