<login>
	
	<form id="github-form" onsubmit={ checkRepo }>
		<span>Name:</span>
		<input name="usernameInput" oninput="{ editUserName }">
		<br>
		<span>Repository:</span>
		<input name="repoInput" oninput="{ editRepoName }">
		<br>
		<button disabled={ !userName || !repoName || !validation.name }>Get repo</button>
	</form>
	<ul class="errors">
		<li if={ !validation.name }>Name cannot be empty.</li>
		<li if={ !validation.name }>Name cannot be empty.</li>
		<li if={ repoError }>Error retrieving repository: { repoError }</li>
	</ul>
	
	this.div = document.getElementById('dump');
	this.validation = {name: true, repo: true};
	this.userName = null; //vonwolfehaus
	this.repoName = null; //von-component
	this.repoError = null;
	
	editUserName(evt) {
		this.validation.name = !!evt.target.value;
		this.userName = evt.target.value;
		// this.userName = this.capitalise(evt.target.value);
		// this.nameInput.value = this.userName;
	}
	
	editRepoName(evt) {
		this.repoName = evt.target.value;
	}
	
	checkRepo(evt) {
		console.log('checking');
		
		var github = new Github();
		var repo = github.getRepo(this.userName, this.repoName);
		
		repo.getTree('master?recursive=true', function(err, tree) {
			if (err) {
				this.repoError = err;
				return;
			}
			
		}.bind(this));
	}
	
</login>