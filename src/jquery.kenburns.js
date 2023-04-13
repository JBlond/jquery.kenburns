/*!
 * jQuery Ken Burns plugin
 * http://labs.codapixa.com/jquery.kenburns
 *
 * Licensed under MIT License http://opensource.org/licenses/mit-license.php
 * Copyright (c) 2012 Codapixa
 *
 * Version: 0.1
 * Author: Firman W <firmanw@codapixa.com>
 *
 * Version 1.0.1
 * Author: https://github.com/JBlond/jquery.kenburns
 */
(function( $ ){
	let Kenburns = function(target, options) {
	this.target = target;
	this.options = $.extend({}, this.defaults, options);
	this.init();

	return this;
	};

	Kenburns.prototype = {
	defaults: {
		'duration': 7000,
		'width':	940,
		'height': 360,
		'align': 'random',
		'zoom': 1.1,
		'debug': false
	},
	canvas: null,
	image: null,
	interval: 0,
	actual: {},
	state: 'init',
	time: 0,
	scale: 1,
	align: 'center',
	init: function() {
		let self = this;

		jQuery('<img alt=""  src=""/>').attr('src', jQuery(self.target).attr('src')).on('load', function() {
			// Create Canvas element and append to target parent
			if (self.canvas === null) {
				// Hide the target
				jQuery(self.target).hide();

				// Create the replacement canvas
				self.canvas = $('<canvas />')[0];
				jQuery(self.canvas).appendTo(jQuery(self.target).parent());
			}

			self.image = this;

			// Set the canvas dimension
			self.canvas.width = self.options.width;
			self.canvas.height = self.options.height;

			// Set the actual position and dimension relatively to canvas
			self.actual.width = self.canvas.width;
			self.actual.height = Math.floor((self.canvas.width / self.image.width) * self.image.height);
			self.actual.x = (self.actual.width - self.canvas.width) / 2 * -1;
			self.actual.y = (self.actual.height - self.canvas.height) / 2 * -1;

			self.start();
		});
	},
	_context: function() {
		return this.canvas.getContext('2d');
	},
	_redraw: function() {
		let self = this,
			ctx = self._context();

		ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
		ctx.drawImage(self.image, 0, 0, self.image.width, self.image.height, self.actual.x, self.actual.y, self.actual.width, self.actual.height);
		ctx.save();
	},
	_log: function(msg) {
		if (this.options.debug){
			console.log('jQuery.kenburns > %s', msg);
		}
	},
	start: function() {
		if (this.state === 'finish'){
			return;
		}
		if (this.time === 0){
			this._redraw();
		}
		this.exec();
	},
	exec: function() {
		let self = this,
			ctx = self._context(),

			timer = function(time) {
			let d = new Date();

			return d.getTime() - time;
			},

			align = function(ax, ay, aw, ah, sw, sh, alignment) {
			let dx = 0;
			let dy = 0;

			switch (alignment) {
				case 'top':
				dx = (sw - aw) / 2 * -1;
				break;
				case 'left':
				dy = (sh - ah) / 2 * -1;
				break;
				case 'bottom':
				dx = (sw - aw) / 2 * -1;
				dy = (sh - ah) * -1;
				break;
				case 'right':
				dx = (sw - aw) * -1;
				dy = (sh - ah) / 2 * -1;
				break;
				default:
				dx = (sw - aw) / 2 * -1;
				dy = (sh - ah) / 2 * -1;
				break;
			}

			return {x: ax + dx, y: ay + dy};
			},
			aligns = ['top', 'left', 'center', 'bottom', 'right'], // alignments

			scaling = function(actual, scale, alignment) {
			let sw = Math.floor(actual.width * scale);
			let sh = Math.floor(actual.height * scale);
			let a = align(actual.x, actual.y, actual.width, actual.height, sw, sh, alignment);

			return {x: a.x, y: a.y, width: sw, height: sh};
			};

		if (self.state !== 'animate'){
			if(self.options.align === 'random'){
				self.align = aligns[Math.floor(Math.random() * aligns.length)];
			}
			else
			{
				self.align = self.options.align;
			}
		}
		if (self.time === 0){
			self.time = timer(0);
		}

		self.state = 'animate';

		self.interval = setInterval(function() {
		let s = scaling(self.actual, self.scale, self.align),
			passed = timer(self.time);


		self._log('State: ' + self.state + ', Passed: ' + passed + ', Scale: ' + self.scale + ', Align: ' + self.align);

		ctx.drawImage(self.image, 0, 0, self.image.width, self.image.height, s.x, s.y, s.width, s.height);
		ctx.save();

		// Stop if time passed
		if (passed >= self.options.duration) {
			self.state = 'finish';
			clearInterval(self.interval);
			return false;
		}

		// Count the scale
		self.scale += ( Math.abs(self.options.zoom - 1) / self.options.duration ) * 30;
		}, 30);
	},
	set: function(options) {
		this.options = $.extend(this.options, options);
	},
	reset: function() {
		this.scale = 1;
		this.time	= 0;
		this.state = 'reset';

		clearInterval(this.interval);
		this.start();
	},
	pause: function() {
		clearInterval(this.interval);
	},
	stop: function() {
		this.scale = 1;
		this.time	= 0;
		this.state = 'stop';

		clearInterval(this.interval);
	}
	};

	jQuery.fn.kenburns = function( arg ) {
	let args = arguments;

	return this.each(function() {
		let instance = jQuery(this).data('kenburns') || {};

		if ( instance[arg] ) {
			return instance[arg].apply( instance, Array.prototype.slice.call( args, 1 ));
		} else if ( typeof arg === 'object' || !arg ) {
			instance = new Kenburns(this, arg);
			jQuery(this).data('kenburns', instance);
			return this;
		}
		else
		{
			jQuery.error( 'Method ' +	arg + ' does not exist on jQuery.kenburns' );
		}
	});
	};

})( jQuery );
