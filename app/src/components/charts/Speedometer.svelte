<script>
	import Speedometer from "svelte-speedometer";
	export let speedValue;
</script>

<Speedometer
	minValue={0}
	maxValue={1.0}
	value={speedValue}
	valueFormat={".0%"}
	currentValueText={"${value} vaccinated"}
	fluidWidth={true}
	forceRender={true}
	labelFontSize={"12px"}
	valueTextFontSize={"19px"}
	textColor="{'#1E1E1E'}ª"
	maxSegmentLabels={1}
	customSegmentStops={[0, speedValue, 1.0]}
	segmentColors={["#04D94F", "#CFD8DC"]}
	ringWidth={55}
	needleColor={"#455A64"}
	needleTransitionDuration={4500}
	needleTransition="easeElastic"
	needleHeightRatio={0.9}
/>