<script>
	import Carousel from 'svelte-carousel';
	let carousel;
	import Icon from '@iconify/svelte';
	export let jobs;

	let formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
</script>

<div class="carousel-container">
	<Carousel bind:this={carousel} arrows={false} dots={false}>
		{#each jobs as { name, position, salary, description, techStack, slogan, picUrl }}
			<li id="{name.replace(/\s/g, '')}" class="job-container" ontouchstart="this.classList.toggle('clicked');">
				<div class="job">
					<div class="job-front" style="background-image: url({picUrl})">
						<div class="job-header">
							<span class="job-name">{name}</span>
							<span class="job-position job-tag">{position}</span>
							<span class="job-salary job-tag">{formatter.format(salary)}</span>
							<div class="stack-container">
								{#each techStack as tech}
									<span class="job-tag">{tech}</span>
								{/each}
							</div>
						</div>
					</div>
					<div class="job-back">
						back
					</div>

				</div>
			</li>
		{/each}
	</Carousel>

	<ul class="rating-container">
		<li><Icon icon="uil:x" /></li>
		<li><Icon icon="uil:check-circle" /></li>
	</ul>
</div>

<style lang="scss">

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

	.job-container {
		position: relative;
		list-style-type: none;
		width: 100%;
		height: 100%;
		perspective: 500px;
	}

	:global(.job-container.clicked .job) {
		transform: rotateY(180deg);
	}

	:global(.job-container.clicked .job-front) {
		display: none;
	}
	:global(.job-container:not(.clicked) .job-front) {
		display: block;
	}

	:global(.job-container.clicked .job-back) {
		display: block;
	}
	:global(.job-container:not(.clicked) .job-back) {
		display: none;
	}

	.job {
		padding-bottom: 100%;
		border-radius: 1em;
		display: flex;
		flex-direction: column-reverse;
		position: absolute;
		width: 100%;
		height: 100%;
		transition: 0.6s;
		transform-style: preserve-3d;
		position: relative;
	}

	.job-front, .job-back {
		height: 100%;
		transition: 0.6s;
		transform-style: preserve-3d;
		position: relative;
		backface-visibility: hidden;
	}

	.job-front {
		z-index: 2;
		transform: rotateY(0deg);
	}

	.job-back {
		transform: rotateY(180deg);
		background-color: beige;
	}

	.job-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		background-color: rgb(0 0 0 / 35%);
		color: white;
		padding: .5em;
		border-bottom-left-radius: 1em;
		border-bottom-right-radius: 1em;
	}

	.job-name {
		font-size: 2em;
	}

	.job-tag {
		background-color: rgb(255 255 255 / 20%);
		border-radius: 5px;
		margin: 2px;
		padding: 2px;
	}

	.stack-container {
		display: flex;
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
		background-color: (rgb(0 0 0 / 20%));
		padding: .5em;
		margin: 0 .25em;
		height: 1em;
		width: 1em;
		border-radius: 5em;
		display: flex;
	}


</style>