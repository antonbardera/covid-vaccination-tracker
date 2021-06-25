<script>
</script>

<!-- HEAD -->
<svelte:head>
	<!-- SMUI / Our Theme -->
	<link rel="stylesheet" href="/build/smui.css" />
</svelte:head>

<div class="footer">
    <div class="contentContainer">
        <div class="body2" style="text-align: center;">
            Made By
        </div>
        <div class="subtitle1" style="text-align: center;">
            Spe Chen, Xavier Bolló and Santiago Salcido
        </div>
        <br />
        <div class="body2" style="text-align: center;">
            Mentors
        </div>
        <div class="subtitle1" style="text-align: center;">
            Anton Bardera, Niko Kommenda
        </div>
        <br />

        <div class="body2" style="text-align: center;">
            This project was designed and developed in the <a
                href="http://www.mastervisualtoolsudg.com/" target="_blank"
                >Master’s program in Visual Tools to Empower Citizens (MVTEC)</a
            >
            organized by
            <a href="https://www.fundacioudg.org/" target="_blank">Fundació UdG</a>
            and the
            <a href="https://www.fundaciovit.org/" target="_blank">ViT Foundation</a>
        </div>
    </div>
</div>

<style>
    .footer {
        display: flex;
        align-items: center;
        padding: 16px;
        color: #ffffff;
        font-family: "Merriweather", sans-serif;
        background-color: #232226;
        height: 252px;
    }

    .contentContainer {
        margin: 0 auto;
        max-width: 680px;
    }
</style>
