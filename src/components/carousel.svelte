<script>
	import Carousel from 'svelte-carousel';
	let carousel;
	import Icon from '@iconify/svelte';
	export let jobs;
</script>

<div class="carousel-container">
	<Carousel bind:this={carousel} arrows={false} dots={false}>
		{#each jobs as { name, position, salary, description, techStack, slogan, picUrl }}
			<li class="job" style="background-image: url({picUrl})">
				<div class="job-header">
					<span class="job-name">{name}</span>
					<span class="job-position">{position}</span>
					<span class="job-tech-stack">{techStack}</span>
					<span class="job-salary">${salary}</span>
				</div>
			</li>
		{/each}
	</Carousel>

	<ul class="rating-container">
		<li><Icon icon="uil:x" /></li>
		<li><Icon icon="uil:check-circle" /></li>
	</ul>
</div>

<style>

	.carousel-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	div :global(.sc-carousel__carousel-container) {
		height: 100%;
	}

	div :global(.sc-carousel__content-container) {
		height: 100%;
	}

	.job {
		list-style-type: none;
		background-color: beige;
		border-radius: 1em;
		display: flex;
		flex-direction: column-reverse;
	}

	.job-header {
		display: flex;
		flex-direction: column;
		background-color: rgb(0 0 0 / 35%);
		color: white;
		padding: .5em;
		border-bottom-left-radius: 1em;
		border-bottom-right-radius: 1em;
	}

	.job-name {
		font-size: 2em;
	}

	.rating-container {
		padding: 0;
		list-style-type: none;
		display: flex;
		justify-content: center;
		font-size: 2em;
		margin-bottom: 0;
		margin-top: .5em;
	}

	.rating-container li {
		padding: .5em;
		margin: 0 .25em;
		height: 1em;
		width: 1em;
		border-radius: 5em;
		background-color: rgb(0 0 0 / 20%);
		display: flex;
	}

</style>