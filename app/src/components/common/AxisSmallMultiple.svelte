<script>
	export let width;
  export let height;
  export let margin;
  export let scale;
  export let position;
  export let format;
  export let time;
	
	$: nTicks = (position === 'bottom' || position === 'top' ) 
		? width / 50
    : height / 25;

  $: transform = position === 'bottom'
    ? `translate(0, ${height - margin.bottom - margin.top})`
		: position === 'top'
    ? `translate(0, ${margin.top})`
    : position === 'left'
    ? `translate(${margin.left}, 0)`
    : `translate(0, ${margin.right})`

  $: ticks = scale.ticks((!time)? nTicks : time)
    .map(d => ({value: format(d), offset: scale(d)}));
    
  $: anchor = (x) => {
		switch(true) {
			case x < 20:
				return 'start';
			case x  > width - 40:
				return 'end';
			default:
				return 'middle'
		}
	}

</script>

<g class='axis' {transform} pointer-events='none'>
  {#each ticks as tick, i}
    {#if position === 'bottom'}
    <g class='tick' transform='translate({tick.offset}, 0)'>
      <!-- show only first and last text-->
      {#if i === 0} 
      <text class='label-bg-l' y=3 text-anchor='start'>
        {tick.value}
       </text>
       <text class='label' y=3 text-anchor='start'>
        {tick.value}
       </text>
       {:else if i === ticks.length - 1} 
       <text class='label-bg-l' x=10 y=3 text-anchor='start'>
        {tick.value}
       </text>
       <text class='label' x=10 y=3 text-anchor='start'>
        {tick.value}
       </text>
      {/if}
    </g>
		{:else if position === 'top'}
    <g class='tick' transform='translate({tick.offset}, 0)'>
      <line y2=-6 />
      <text class='label' y=-10 text-anchor={anchor(tick.offset)}>
        {tick.value}
      </text>
    </g>
    {:else if position === 'right'}
    <g class='tick' transform='translate(0, {tick.offset})'>
			{#if tick.value === '0'}
      <line x2={width}/>
			{:else}
      <line x2={width} stroke-dasharray="2 3" />
      <text class='label' x={width} y=-5 text-anchor='end'>
        {tick.value}
      </text>
			{/if}
    </g>
    {:else if position === 'left'}
    <g class='tick' transform='translate(0, {tick.offset})'>
        {#if i !== 0 && i % 2 !== 1} 
          <line class='thin-line' x2={width - margin.left - margin.right - 5}/>
          <text class='label-bg' x=0 y=3 text-anchor='start'> 
            {tick.value * 100}
          </text>
          <text class='label' x=0 y=3 text-anchor='start'> 
            {tick.value * 100}
          </text>
        {:else if i % 2 === 1}
          <line class='thin-line' x2={width - margin.left - margin.right - 5}/>
        {:else}
           <line class='thick-line' x2={width - margin.left - margin.right}/>
        {/if}
    </g>
    {/if}
  {/each}
</g>

<style>
	line {
		stroke: #E0E0E0;
	}
  .thin-line{
    stroke-width: 0.5px;
  }
  .thick-line{
    stroke-width: 2px;
  }
  .label-bg{
    stroke-width: 13px;
    stroke: white;
  }
  .label-bg-l{
    stroke-width: 10px;
    stroke: white;
  }
  text{
    font-family: "Merriweather Sans";
    font-style: normal;
    font-weight: normal;
    font-size: 10px;
    fill: #bdbdbd;
  }

</style>