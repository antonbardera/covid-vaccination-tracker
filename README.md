# This is how vaccination progresses in Spain
[**Live project here**](https://covid-vaccination-tracker.vercel.app/)

## Introduction 

Spain rolled out its mass vaccination program in January. 

The first people to receive the vaccine were elderly people as well as first-line medical staff. As the vaccination campaign progresses, doses of different vaccins have been administered to the rest of the population, with the elderly being given priority. Currently there are four types of Covid-19 vaccines being administered in seventeen Spanish regions. These include Johnson & Johnson’s single-dose vaccine, Janssenm and the two-dose series, Pfizer-BioNTech, Moderna and AstraZeneca/Oxford. 

The nation focuses on a health risk and age-based vaccine rollout plan to protect the most vulnerable groups from contracting the disease. In our preliminary analysis with available open data, we conclude some notable regional differences in vaccination rate and the first sign of vaccine effect comparing the nearly 100% vaccinated group versus less ones.

This tracker shows the status of the vaccination process in Spain in each autonomous community, the percentage of fully inoculated population by CCAA versus national level, the vaccine effect shown by age group and the evaluation of vaccine effectiveness by age group.

## Data source and ethical considerations

Our data pipeline aggregates two official data sources: [one on vaccination rollout](https://www.mscbs.gob.es/profesionales/saludPublica/ccayes/alertasActual/nCov/vacunaCovid19.htm) and the other on [pandemic indices](https://cnecovid.isciii.es/covid19/#documentaci%C3%B3n-y-datos). 

The age group breakdown of the vaccination data is not available before March 31 hence we are not able to present the evolution of the earliest batch (Aged 80+) in our last scatter plot section along with other age groups.


## Data processing and analysis


## Visualization and interaction design

Earlier experiences from previous workshops made clear that before moving too early to prototyping, there were some key stages to improve the decisions about storytelling, visualization and implementation:

- Early analysis
- Benchmarking
- Whiteboarding sessions
    - Whiteboard meetings allow one or more people to quickly draw and write content on a board during a meeting. Virtual whiteboarding emulates this dynamic through collaborative digital whiteboards modified in real time.
- Wireframing. Low-fidelity design layout
- Static prototyping
- Style Guide and UI Kit

**Early analysis**. [Quick exploration](https://public.tableau.com/app/profile/ssalcido/viz/TableauAnalysis_16225631164420/1DosisVsCasesMay) of available datasets, in R and Tableau, to explore trends and insights.

Benchmarking and [whiteboarding sessions](https://miro.com/app/board/o9J_lBLs_mM=/?fromRedirect=1), to explore and compare vaccination trackers from different media. This was helpful during the first week of the project to detect minimum requirements and opportunities to improve on the existing options of trackers. In this stage we found the three main topics that we wanted to cover:
- The percentage of fully vaccinated population by CCAA (autonomous communities) versus the national level 
- The vaccine effect by age group, and
- The evaluation of vaccine effectiveness by age group

**Wireframing and static prototyping**. After our whiteboard sessions conclusions we had two ways of structuring the project: 
By individual CCAA with its corresponding topics.
By topic with all of the CCAAs data inside each one.

We chose option B because it reduced repetition of topics as well as allowing us to compare each CCAA status with each other in the first topic. We also decided to add a national progress bar as the Hero Viz; since it provides the first important answer: How Vaccinations Are Going in Spain?

Most of these decisions were made during the Hackathon weekend. In addition to presenting our findings from whiteboarding sessions and early analysis to our mentors, we wireframed different iterations for the overall layout.

Figma collaboration in real time was very helpful in early outlining the structure and layout of the page. We did not create high fidelity production on this stage, we worked with screenshots from R analysis to quickly decide the visual encoding for the charts:

- **National Progress: Gauge chart** 
    We choose it as our hero viz because it makes a strong visual statement on the current state of the vaccination rollout in Spain. It is also a nice alternative to a traditional progress bar.
- **Percentage of vaccinated population by CCAA: Small Multiples**
    We agreed on the beginning of a series of small multiples of line charts to compare each CCAA to the national share of the vaccinated population. We also got inspired by a similar approach by the NYT using color to visualize the gap between above and below the national level. The layout emulates a Spain cartogram. 
- **Vaccine effect by age group: Multi Line Chart**
    While traditional, the time series approach is quite useful to compare how trends of each age group diverged after the mass inoculation campaign. We completed it with a zoom level on the last trends from April 2021 when vaccination data breakdown by age group is available.
- **Vaccine effectiveness by age group: Scatterplot**
    Lastly, we choose a series of scatterplots per age group to visualize the correlation between the percentage of peak number of cases as the vaccination rate increased. 

**Style guide and UI Kit**. We decided to implement a UI library (Svelte Material UI) for interactive components. In our case, we focused on a **Material Theme**, customizing only the Type System, Type Scale and Theme colors. 

We chose a scrollytelling format with basic interaction to explore the charts: rolling over for tooltips and Tabs to filter data from the time series. The first scatterplot (age group 70-79) uses animation to introduce the cases of the winter peak vs. vaccination rate.

Both the prototype and the styleguide were iteratively adjusted as the project advanced, particularly to adapt the overall style and color palettes for the charts. The final versions of the static prototype and the styleguide can be [consulted here](https://www.figma.com/file/tMdbRGYP15EL99NovIp6OD/Static-Prototype?node-id=180%3A3357).


## Implementation details


## Conclusions


## Data pipeline
![pipeline](https://github.com/ssalcido/mvtec-group1/blob/main/pipeline_flowchart.png?raw=true)
![pipeline](https://github.com/X80110/covid-vaccination-tracker/blob/main/dataPipeline.png?raw=true)

