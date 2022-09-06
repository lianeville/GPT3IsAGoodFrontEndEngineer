<script>
	import Icon from '@iconify/svelte';
</script>

<ul class="nav-menu">
	<li><Icon icon="uil:home-alt" /></li>
	<li><Icon icon="uil:comment-alt-notes" /></li>
	<li><Icon icon="uil:setting" /></li>
	<li><Icon icon="uil:user-circle" /></li>
</ul>

<style>
	.nav-menu {
		list-style-type: none;
		font-size: 2em;
		background-color: #565680;
		color: white;
		border-radius: .5em;
		/* margin: .25em; */
		padding: .5em;
		display: flex;
		justify-content: space-around;
		margin-top: .5em;
		margin-bottom: .5em;
	}

</style>