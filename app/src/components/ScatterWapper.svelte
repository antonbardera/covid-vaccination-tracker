<script>
    import Scatter from "./charts/Scatter2.svelte";
    import ScatterStatic from "./charts/ScatterStatic.svelte";

    // import * as data_raw from "../../public/data_xavier.json"; // dose2_perc_total
    import * as data_raw from "../../public/dataScatter.json"; // dose2_perc_total

    import { max, min } from "d3-array";
    import locale from "@reuters-graphics/d3-locale";

    const loc = new locale("en");
    const format = {
        x: loc.format(",.0f"),
        y: loc.format(",.0f"),
        z: loc.formatTime("%B %e"),
        // a: loc.format(),
    };
    /* --------------------  
	   DATA PREPROCESSING 
	-----------------------*/
    // first vaccination date: March 31
    // missing dates--> do we need impute them?
    let DataLong = data_raw.default;

    let data_ = DataLong.map((d) => {
        return {
            date: new Date(d.date),
            dateStr: loc.formatTime("%B %d")(new Date(d.date)),
            age_group: d.age_group,
            dateDiff: new Date(d.date) - new Date("2021-03-30"),
            dose2_pct: d.dose2_pct,
            cases_peak: d.cases_peak * 100, // needs func
            // fill nan with 0 for value0
            // value0: (isNaN(d["dose2_pct_total"]))? 0 : Math.round(+d["dose2_pct_total"]) / 100,
            // value1: findValueByDate(d.fecha.split("T")[0])
        };
    });

    let data = data_.sort((a, b) => a.date - b.date);

    // .filter(d=>d.dose2_pct_70to79 !== undefined && !isNaN(d.dose2_pct_70to79))

    // console.log('checking~~~~~')
    // console.log(data)
    // console.log(data.sort((a, b) => a.date - b.date));

    // console.log(data.filter(d=>d.dose2_pct === undefined))
    // console.log(data.filter(d=>d.cases_peak === undefined))
    // console.log(data.filter(d=>isNaN(d.cases_peak)))
    // console.log(data.filter(d=>isNaN(d.dose2_pct)))

    let maxDate = max(data.map((d) => d.dateDiff));
    let minDate = min(data.map((d) => d.dateDiff));
    let maxDate2 = max(data.map((d) => d.date));
    let minDate2 = min(data.map((d) => d.date));
    // console.log("min max ======");
    // console.log(maxDate);
    // console.log(minDate);

    let d70 = data.filter((d) => d.age_group === "70to79")
    let d60 = data.filter((d) => d.age_group === "60to69")
    let d50 = data.filter((d) => d.age_group === "50to59")
</script>

<div>
    <h6 class='h6'>Age group 70-79</h6>
    <p class='subtitle1'>Cases as share of the winter peak vs. vaccination rate</p>
    <Scatter
        data={d70}
        key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff" }}
        {format}
        {maxDate}
        {minDate}
        layout="col"
    />
    <p> 
        The 70 to 79 age group is the second batch invited to get jabs. 
        The earliest available data shows {d70[0]['dose2_pct'].toFixed(1)}% of the group have received a second 
        shot on {d70[0]['dateStr']}. 
    </p>
    <p>
        As of {d70[d70.length-1]['dateStr']}, 
        the number has increased to {d70[d70.length-1]['dose2_pct'].toFixed(1)}%. 
        It takes almost three months from close to 
        zero to almost 100 percent fully vaccinated. 
    </p>
    <p>
        With more being fully vaccinated, the share of the peak index 
        has dropped from {d70[0]['cases_peak'].toFixed(1)}% on {d70[0]['dateStr']} 
        to {d70[d70.length-1]['cases_peak'].toFixed(1)}% on {d70[d70.length-1]['dateStr']}. 
    </p>
    <!-- <p>above80</p>
    <ScatterStatic
        data={data.filter((d) => d.age_group === "above80")}
        key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff" }}
        {format}
        {maxDate}
        {minDate}
        class="scatter-item"
    /> -->

    <h6 class='h6'>Age group 60-69</h6>
    <p class='subtitle1'>Cases as share of the winter peak vs. vaccination rate</p>
    <ScatterStatic
        data={data.filter((d) => d.age_group === "60to69")}
        key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff", a:"age_group" }}
        {format}
        {maxDate}
        {minDate}
    />

    <p> 
        The earliest available data shows {d60[0]['dose2_pct'].toFixed(1)}% of the group have received a second 
        shot on {d60[0]['dateStr']}. 
        
        As of {d60[d60.length-1]['dateStr']}, the number has increased to 
        {d60[d60.length-1]['dose2_pct'].toFixed(1)}%. 
    </p>
    <p>
        With more being fully vaccinated, the share of the peak index 
        has dropped from {d60[0]['cases_peak'].toFixed(1)}% on {d60[0]['dateStr']} 
        to {d60[d60.length-1]['cases_peak'].toFixed(1)}% on {d60[d60.length-1]['dateStr']}. 
    </p>

    <h6 class='h6'>Age group 50-59</h6>
    <p class='subtitle1'>Cases as share of the winter peak vs. vaccination rate</p>
    <ScatterStatic
        data={data.filter((d) => d.age_group === "50to59")}
        key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff", a:"age_group"}}
        {format}
        {maxDate}
        {minDate}
    />
    <p> 
        The earliest available data shows {d50[0]['dose2_pct'].toFixed(1)}% of the group have received a second 
        shot on {d50[0]['dateStr']}. 
        
        As of {d50[d50.length-1]['dateStr']}, the number has increased to 
        {d50[d50.length-1]['dose2_pct'].toFixed(1)}%. 
    </p>
    <p>
        With more being fully vaccinated, the share of the peak index 
        has dropped from {d50[0]['cases_peak'].toFixed(1)}% on {d50[0]['dateStr']} 
        to {d50[d50.length-1]['cases_peak'].toFixed(1)}% on {d50[d50.length-1]['dateStr']}. 
    </p>

</div>

<!-- COLUMNS TEST WITH FLEX GRID -->
<!-- <div class="flex-grid">
    <div class="col">
        <p>50to59</p>
        <ScatterStatic
            data={data.filter((d) => d.age_group === "50to59")}
            key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff" }}
            {format}
            {maxDate}
            {minDate}
            class="scatter-item"
        />
    </div>
    <div class="col">
        <p>60to69</p>
        <ScatterStatic
            data={data.filter((d) => d.age_group === "60to69")}
            key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff" }}
            {format}
            {maxDate}
            {minDate}
            class="scatter-item"
        />
    </div>
</div>
<div class="flex-grid">
    <div class="col">
        <p>70to79</p>
        <Scatter
            data={data.filter((d) => d.age_group === "70to79")}
            key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff" }}
            {format}
            {maxDate}
            {minDate}
            class="scatter-item"
        />
    </div>
    <div class="col">
        <p>above80</p>
        <ScatterStatic
            data={data.filter((d) => d.age_group === "above80")}
            key={{ x: "dose2_pct", y: "cases_peak", z: "dateDiff" }}
            {format}
            {maxDate}
            {minDate}
            class="scatter-item"
        />
    </div>
</div> -->

<style>
    .h6{
        margin-bottom: -10px;
    }
    /* .scatter-container {
        display: grid;
        grid-template-columns: auto auto;
        padding: 10px;
    }

    .scatter-item {
        width: 300px;
    }

    .flex-grid {
        display: flex;
    }
    .col {
        flex: 1;
    } */
</style>
