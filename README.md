# This is how vaccination progresses in Spain
[**Live project here**](https://covid-vaccination-tracker.vercel.app/)

## Introduction 

Spain rolled out its mass vaccination program in January. A total of 38.81 million doses have been administered so far. On average, 321,636 of shots were given out everyday in early May and the figure has increased to 411,024 in June. 

The first people to receive the vaccine were elderly people as well as first-line medical staff. As the vaccination campaign progresses, doses of different vaccins have been administered to the rest of the population, with the elderly being given priority. Currently there are four types of Covid-19 vaccines being administered in seventeen Spanish regions. These include Johnson & Johnson’s single-dose vaccine, Janssenm and the two-dose series, Pfizer-BioNTech, Moderna and AstraZeneca/Oxford. 

The nation focuses on a health risk and age-based vaccine rollout plan to protect the most vulnerable groups from contracting the disease. In our preliminary analysis with available open data, we conclude some notable regional differences in vaccination rate and the first sign of vaccine effect comparing the nearly 100% vaccinated group versus less ones.

This tracker shows the status of the vaccination process in Spain in each autonomous community, the percentage of fully inoculated population by CCAA versus national level, the vaccine effect shown by age group and the evaluation of vaccine effectiveness by age group.

## Data source and ethical considerations

Our data pipeline aggregates two official data sources: [one on vaccination rollout](https://www.mscbs.gob.es/profesionales/saludPublica/ccayes/alertasActual/nCov/vacunaCovid19.htm) and the other on [pandemic indices](https://cnecovid.isciii.es/covid19/#documentaci%C3%B3n-y-datos). 

Datasets are provided by the official ministries of health of Spain. Despite being built and delivered by the same entity and being related to the same public health concern, the disparities on how they are structured and the methodology behind is an alarmant threat to citizen’s trust. 

The proficiency levels are opposite from one dataset to another, being the vaccines one much more low quality than coronavirus one. Coronavirus metadata explains in detail how data is collected including detailed academic reference and software used for the computed stats. Vaccination metadata is specified as footnotes on the pdf files they deliver. Many of them are about corrections required due to ineffective management, which adds to transparency but not to reliability. 

Given the age priority strategy for the vaccine deployment, most of the data was unusable to evaluate the decisions taken. Age-groups details do not come in until early April, that’s almost 4 months after vaccination started. Some age groups ranges didn’t match neither census population groups nor coronavirus incidence data. Since 21st June age groups match wider for analysis, but until then detail for population under 50 was almost untrackable. The dataset also holds inconsistencies giving values of vaccinated people being higher than the population in the census for its age group. 

The data in its nature shows no relationship with any kind of personal or private data that could harm any individuals. 


## Data processing and analysis

The goal of our tracker is to provide immediate feedback with live analysis of regional and age patterns of vaccination effect. 

Despite both datasets being supplied by official Spanish authorities, they come in different formats and structures.

Vaccination data is supplied in daily .ods files (OpenOffice spreadsheets format) each with a date specific url and multiple worksheets. Since the beginning, the data structure of those files has changed headers and relocated values to new names or positions making automated processes difficult to reach stability. The time series for this data is irregular with common gaps on weekends and national holidays.

On the other hand, the dataset for the coronavirus stats is a bit more mature in the shape and form, being delivered in a flat .csv file fetched from the same url and updated daily. Includes the complete date span and data is more regular.

Joint together, the datasets provide daily regional data which include demographic, coronavirus incidence and vaccination values for 5 consistent age-groups, building up more than 60 data points for each day and region.

### Data pipeline and preprocessing
- Unifying CCAA (region) names
- Clear variable definitions and naming structure to work with
- Parsing .ods worksheets and its headers
- Matching age groups from two separate data sources
- Impute missing data and compute rolling average to smooth out the irregularity caused by timing of updates 
- Calculating the share of the peak index, indices as a percentage of its peak

The ETL process is built using JavaScript and the library [*‘Arquero’*](https://uwdata.github.io/arquero/) at some steps to ease the data wrangling. 

### Analysis
The initial exploratory analysis was done in Python with Pandas and Seaborn. We were able to prototype static charts quickly with the libraries’ built-in functions and settled main topics and visualizations in the first hackathon. Our analysis includes:

- Exploring demographic characteristics including age and gender by CCAA
- Comparing pandemic indices and vaccination rate against national average to examine possible vaccine effects
- Breaking down covid-19 and vaccination figures and by age group and CCAA
- Singling out age group of 70 to 79 

We conclude that there is a significant vaccination gap between some CCAAs and national level due to the disproportionate number of youth and elderly population. This reflects the result of Spanish government’s age-based vaccine rollout plan.   

However, our conclusion only applies to CCAAs in mainland Spain. The age group difference can not explain why two islands have an older population but still lag behind the national average. Both Canarias and Baleares have approximately 13% of its residents aged more than 70, whereas 8% of the whole population in Spain is beyond that age. 

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

**Benchmarking and [whiteboarding sessions](https://miro.com/app/board/o9J_lBLs_mM=/?fromRedirect=1)**, to explore and compare vaccination trackers from different media. This was helpful during the first week of the project to detect minimum requirements and opportunities to improve on the existing options of trackers. In this stage we found the three main topics that we wanted to cover:
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

#### Node.js (Github Actions)
A cron-job set with Github Actions runs the scripts under a Node.js environment which fetches and prepares the data files feeding the live app. 

#### Svelte
The project has been coded using Svelte as a framework. Each student worked collaboratively with Visual Studio as code editor and Github for version control. We initially forked the tracker from [https://vacunas.fndvit.org](https://vacunas.fndvit.org/) as a starting point and continued building our own version. 

#### Charts and Common component
All charts and common elements, such as axis, menus, footer and tooltips are coded as svelte components.    

#### UI Library
Early in the process, we considered using a UI library for components. Although we had access to *Svelte Materialify*, it is soon to be deprecated. We decided to implement an alternative: [*SMUI Svelte Material UI*](https://sveltematerialui.com/). SMUI is based on the Material Design Components for the Web, by Google. 

Not only SMUI provides Svelte components and actions for a wide variety of interface elements, it also works with Material UI Kits. In our case, we focused on a **Material Theme**, customizing only the Type System, Type Scale and Theme colors. 

We customized a [UI kit in Figma](https://www.figma.com/file/U8l9GjvhphEkKu0Gsy9shw/MUI-Kit-Light?node-id=0%3A7243) that helped us build the prototype. 

SMUI is styled through Sass. SMUI supports all of the mixins provided by Material Design Components for Web. Theming SMUI was challenging, because we did not have previous experience with Sass; however, once we managed to compile the styles from it, it became a powerful solution to globally control the Design Theme for our page. Although we didn’t make extensive use of Material components, the Type and Color System is entirely managed through it and it provides a strong foundation for future projects.

Main difficulties
- At some point, refreshing the development environment in Visual Studio became quite slow. We think it may be due to calculations in the charts as well as a great number of dependencies installed in node modules.
- While we worked continuously during the whole duration of the project, we still faced challenges on web development due to the complexity of the code or our own learning curve. In order to present a final project, we made some decisions:
    - We dropped optimizing a mobile version for the small multiples.
    - We dropped the implementation of an inset chart on the second line chart, to indicate that it is a zoom level from the first one.
    - We focused on optimizing the Desktop version.
    - We adapted the UI on the GaugeChart according to the props available on the component, which is slightly different from the one on the prototype.


## Conclusions

When we began the project it became quickly evident that there are many different trackers available in the media. We found that the comparison of regional and national data was not that evident in some of them. We had also noted some sort of information overload. As such, we decided to focus on three specific topics and present them as good as possible:
- The percentage of fully vaccinated population by CCAA (autonomous communities) versus the national level 
- The vaccine effect by age group, and
- The evaluation of vaccine effectiveness by age group
 
While our visualizations are traditional, we strive for accuracy and efficiency; particularly, to make sure that the automated data pipeline is working well.

Toolchain:
- Data analysis: R, Tableau 
- Whiteboarding: Miro 
- Design, Static prototyping and Accessibility: Figma, Illustrator, Data - - Color Picker, Viz Palette, Colour Contrast Analyser 
- Development and version control: Visual Studio, Github, Svelte
- App deployment: Vercel 
- Project Management and collaboration: Google Workspace, Slack


## Data pipeline
![pipeline](https://github.com/X80110/covid-vaccination-tracker/raw/main/pipeline_flowchart.png)
