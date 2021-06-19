<script>
	import Speedometer from "svelte-speedometer";
</script>

<!-- <Speedometer
  maxValue={100}
  value={40}
  needleColor="#CFD8DC"
  startColor="green"
  segments={10}
  endColor="white"
/> -->

<Speedometer
	fluidWidth={true}
	forceRender={true}
	maxSegmentLabels={1}
	customSegmentStops={[0, 40, 100]}
	segmentColors={["#64DD17", "#f5f5f5"]}
	needleColor={"#CFD8DC"}
	currentValueText={"Current Value: ${value}"}
	minValue={0}
	maxValue={100}
	value={40}
	needleTransitionDuration={4000}
	needleTransition="easeElastic"
/>
