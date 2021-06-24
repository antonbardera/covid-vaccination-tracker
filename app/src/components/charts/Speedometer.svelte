<script>
	import Speedometer from "svelte-speedometer";
</script>

<Speedometer
	minValue={0}
	maxValue={1.0}
	value={0.4}
	valueFormat={".0%"}
	currentValueText={"${value} vaccinated"}
	fluidWidth={true}
	forceRender={true}
	labelFontSize={"12px"}
	valueTextFontSize={"19px"}
	textColor="{'#1E1E1E'}ª"
	maxSegmentLabels={1}
	customSegmentStops={[0, 0.4, 1.0]}
	segmentColors={["rgba(4, 217, 79, 0.3)", "rgba(207, 216, 220, 0.3)"]}
	ringWidth={55}
	needleColor={"#455A64"}
	needleTransitionDuration={4500}
	needleTransition="easeElastic"
	needleHeightRatio={0.9}
/>
