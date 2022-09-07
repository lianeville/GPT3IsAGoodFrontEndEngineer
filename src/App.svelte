<script>
	import Icon from '@iconify/svelte';

	import CarouselComponent from './components/carousel.svelte';
	import NavMenuComponent from './components/navmenu.svelte';

	let jobs = [];

	class Job {
		constructor(name, position, salary, description, techStack, slogan, picUrl) {
			this.name = name,
			this.position = position,
			this.salary = salary,
			this.description = description,
			this.techStack = techStack,
			this.slogan = slogan
			this.picUrl = picUrl
		}
	}

	populateJobs()

	function handleNextClick() {
		carousel.goToNext()
	}

	function populateJobs() {
		jobs.push(new Job(
			'Cool Tech Technologies',
			'Senior Dev',
			150000,
			'Looking for a rlly cool dev who knows their stuff and is okay with never seeing their family.',
			['React', 'Node', 'Eric', 'MongoDB', 'Express'],
			"Coolin Off and Techin' Out",
			"https://images.unsplash.com/photo-1636535845762-50d7c7a56570?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
		))

		jobs.push(new Job(
			'Coin Op Bop',
			'Junior Web Developer',
			50000,
			'All you can eat coins, all the time. Please note we are no longer giving away pennies, and do not support them.',
			['PHP', 'Laravel', 'MySQL', 'Django'],
			"Coolin' Off and Techin' Out",
			"https://images.unsplash.com/photo-1586974710160-55f48f417990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"
		))

		jobs.push(new Job(
			'Tiny Startup',
			'CEO',
			100,
			'Please.',
			['Everything'],
			"Help Us.",
			"https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80"
		))
	}

</script>

<div class="main-content">
	<h1>Your Jobs</h1>
	<CarouselComponent bind:jobs />
	<NavMenuComponent />
</div>

<style lang="scss">
	$color: #ddd;
	h1 {
		color: $color;
	}
	.main-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	.main-content {
		// margin: 0 .75em;
	}

	h1 {
		margin-bottom: 0;
	}


</style>