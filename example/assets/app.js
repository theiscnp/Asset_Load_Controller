
class app {

	constructor(){

		this.is_initialized = false

		this.config = {

			// ...

			dependencies: [
				'jQuery',
			]
		}
	}


	init(){

		if(this.is_initialized) return true

		this.is_initialized = true

		if(!this.check_dependencies_loaded()) return false



		// ....

		console.info('example app initialized')
	}


	static sinit(){

		window._App = new app()

		_App.init()

		return _App
	}


	check_dependencies_loaded(){

		let { dependencies } = this.config
		
		let got_em_all = true

		for(let i = 0, dep = dependencies[i]; i < dependencies.length; i++) // dependencies.length should be var as otherwise read in each iteration
		{
			if(['undefined','null'].indexOf(typeof window[dep])>=0)
			{
				console.error("Missing dependency: "+dep)

				got_em_all = false
			}
		}

		return got_em_all
	}



	// ....





}



