<script>
	import locale from "@reuters-graphics/d3-locale";
	import Multiline from "../components/charts/Multiline.svelte";
	import {curveBasis} from 'd3-shape'
	import {multiline_data} from '../utils.js'
	import Button, { Label, Icon } from '@smui/button';
	import { fade } from 'svelte/transition';
	import IntersectionObserver from "svelte-intersection-observer";
	let element;
  	let intersecting;
	
	import * as csv from "../../public/data.csv"
	let data = csv.default
	
	const loc = new locale('en');
	const format = {
		x: loc.formatTime('%b %e'),
		y: loc.format('%').loc.format(',.2f')
	}
	
	let mldata = multiline_data(data) 

	console.log('hello',mldata)
	
	$: mldata = multiline_data(data) 
	
	let cases = ['peak_cases_50to59', 'peak_cases_60to69','peak_cases_70to79','peak_cases_above80']
	let deaths = ['peak_deaths_50to59', 'peak_deaths_60to69','peak_deaths_70to79','peak_deaths_above80']
	let hosp = ['peak_hosp_50to59', 'peak_hosp_60to69','peak_hosp_70to79','peak_hosp_above80']
	let uci = ['peak_uci_50to59', 'peak_uci_60to69','peak_uci_70to79','peak_uci_above80']
	
	let xKey = "fecha";
	let yKey = cases
	let selected;
	

	let selected_cases = () => { y = cases }
	let selected_deaths = () => { y = deaths }

	
	function setValues(vars){
		y = `${vars}`
	}






</script>

<div class="narrowColumn">
	<Button bind:value={yKey} on:click={()=>yKey = cases } variant="raised" class="button-shaped-round">
		<Label>Cases</Label>
	</Button>
	<Button bind:value={yKey} on:click={()=>yKey = deaths } variant="raised" class="button-shaped-round">
		<Label>Deaths</Label>
	</Button>
	<!-- <Button on:click={() => selected_deaths  = hosp} variant="raised" class="button-shaped-round">
		<Label>Hospitalized</Label>
	</Button>
	<Button on:click={() => selected_deaths = 'uci'} variant="raised" class="button-shaped-round">
		<Label>UCI</Label>
	</Button> -->

	   
	  
	

	<Multiline 
	let:y
	data={mldata}
	options={
		{
			key:{x: 'fecha', y: yKey},
			// key:{x: 'fecha', y: ['ra_cases_50to59', 'ra_cases_60to69','ra_cases_70to79','ra_cases_above80']},
			// key:{x: 'fecha', y: ['cases_50to59', 'cases_60to69','cases_70to79','cases_above80']},
			format: format,
			color: ['#fc0', '#ccc','#dcc011','#000','#1bf011'],
			layout: 'col',
			title:'Title',
			desc:'Description',
			curve: curveBasis
		}
	}
	/>

	
	<Multiline 
	data={mldata.filter(d=>  new Date(d.fecha) > new Date("2021-04-01"))}
	options={
		{
			key:{x: 'fecha', y: ['peak_cases_50to59', 'peak_cases_60to69','peak_cases_70to79','peak_cases_above80']},
			// key:{x: 'fecha', y: ['ra_cases_50to59', 'ra_cases_60to69','ra_cases_70to79','ra_cases_above80']},
			// key:{x: 'fecha', y: ['cases_50to59', 'cases_60to69','cases_70to79','cases_above80']},
			format: format,
			color: ['#fc0', '#ccc','#dcc011','#cdf011','#1bf011'],
			layout: 'col',
			title:'Title',
			desc:'Description',
			curve: curveBasis
		}
	}
	/>
	</div>