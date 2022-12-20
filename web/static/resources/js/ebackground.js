class EBackground {
	constructor(canvas) {
		this.c_offset = 0.5;
		this.c_interval = 64;
		this.c_fill_speed = 0.02;
		this.c_pixel_brightness = 150;
		this.c_background_color = "#000";
		this.c_relative_pixel_size = 0.04;
		this.c_appearance_interval_primary = 2;
		this.c_appearance_interval_random = 3;
		this.c_random_brightness_min = 0.50;
		this.c_random_brightness_max = 0.75;
		this.c_secondary_amount = 0.025;
		this.c_map_center = this.string_to_map(
			"...00;" +
			".0...;" +
			"00.0.;" +
			".0...;" +
			"00000;",
			-2, -2
		);
		this.c_map_secondary = this.string_to_map(
			"0.....................0..0.......0................0;" +
			"0....0...0............0..0.......0................0;" +
			"0...000.000.....00.0..0..0.......0.000...000.000..0;" +
			"000..0...0..000.0....0..0........0.0.0...0.0.0.0.0.;" +
			"0.0..0...0..0.0..0.0.0..0........0.0.0...0.0.0.0.0.;" +
			"0.0..00..00.000.00...0..0........0.000.0.000.000.0.;" +
			"............0........................0.....0...0...;" +
			"............0......................000...000.000...;",
			-29, -3
		);
		this.c_map_void = this.string_to_map(
			"...0000;" +
			".000..0;" +
			"00.0000;" +
			"0..0.00;" +
			"00.0000;" +
			"0.....0;" +
			"0000000;" +
			".......;" +
			"0000000;" +
			"0000000;",
			-3, -3
		);

		this.canvas = canvas;
		if (!this.canvas) {
			console.error("\"ebackground\" canvas id not found");
			return;
		}
		this.ctx = this.canvas.getContext("2d");
		window.ebackground = this;
		window.document.body.setAttribute("onresize", "window.ebackground.reset();");
		window.document.body.setAttribute("onkeypress", "window.ebackground.keypress(event);");
		this.initialize();
		this.reset();
		this.frame = 0;
		setInterval(this.animate.bind(this), this.c_interval);
	}

	draw_map(map) {
		this.ctx.fillStyle = this.c_background_color;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		for (let i in map) {
			this.draw_pixel(map[i]);
		}
	}

	animate() {
		this.frame++;

		if (this.frame % this.c_appearance_interval_primary == 0) {
			if (this.map_primary_queue.length) {
				let i = Math.floor(this.map_primary_queue.length * Math.random());
				this.map_primary.push(this.map_primary_queue.splice(i, 1)[0]);
			}
		}

		if (this.frame % this.c_appearance_interval_random == 0) {
			let x = Math.ceil(this.pixels_x * Math.random() - (this.pixels_x / 2));
			let y = Math.ceil(this.pixels_y * Math.random() - (this.pixels_y / 2));
			let valid = true;
			for (let i in this.map_void) {
				if (this.map_void[i].x == x && this.map_void[i].y == y) {
					valid = false;
					break;
				}
			}
			if (valid) {
				this.map_random.push({
					x,
					y,
					"t": this.c_random_brightness_min + (Math.random() * this.rand_t_range),
					"f": false,
					"o": 0,
					"r": (Math.random() > 0.5) ? true : false
				});
			}
		}

		let map = [];

		for (let i in this.map_random) {
			if (this.map_random[i].f) {
				this.map_random[i].o -= this.c_fill_speed;
				if (this.map_random[i].o <= 0) {
					delete this.map_random[i];
					continue;
				}
			} else {
				this.map_random[i].o += this.c_fill_speed;
				if (this.map_random[i].o >= this.map_random[i].t) {
					this.map_random[i].f = true;
				}
			}
			map.push(this.map_random[i]);
		}

		for (let i in this.map_secondary) {
			if (this.map_secondary[i].w) {
				if (Math.random() < this.c_secondary_amount) {
					this.map_secondary[i].w = false;
				}
				map.push(this.map_secondary[i]);
				continue;
			}

			if (this.map_secondary[i].o >= 0.9) {
				this.map_secondary[i].o = 0.9;
				this.map_secondary[i].f = true;
			}


			if (this.map_secondary[i].f) {
				this.map_secondary[i].o -= this.c_fill_speed;
				if (Math.random() < this.c_secondary_amount) {
					this.map_secondary[i].f = false;
				}
			} else {
				this.map_secondary[i].o += this.c_fill_speed;
			}


			if (this.map_secondary[i].o <= 0) {
				this.map_secondary[i].o = 0;
				this.map_secondary[i].f = false;
				this.map_secondary[i].w = true;
			}

			map.push(this.map_secondary[i]);
		}

		for (let i in this.map_primary) {
			if (this.map_primary[i].o >= 1) {
				this.map_primary[i].o = 1;
				map.push(this.map_primary[i]);
				continue;
			}
			this.map_primary[i].o += this.c_fill_speed;
			map.push(this.map_primary[i]);
		}

		this.draw_map(map);
	}

	reset() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.pixelsize = window.innerHeight * this.c_relative_pixel_size;
		this.pixels_x = (window.innerWidth / this.pixelsize);
		this.pixels_y = window.innerHeight / this.pixelsize;
		this.animate();
	}

	draw_pixel(pixel) {
		let c = Math.floor(this.c_pixel_brightness * pixel.o);
		let overlap = ("p" in pixel) ? 1 : 0;
		this.ctx.fillStyle = "rgb(" + c + "," + c + "," + c + ")";
		this.ctx.fillRect(
			((((this.pixels_x / 2) + pixel.x) * this.pixelsize) - (this.c_offset * this.pixelsize)) - overlap,
			(((this.pixels_y / 2) + pixel.y) * this.pixelsize) - overlap,
			this.pixelsize + overlap,
			this.pixelsize + overlap
		);
		if (!overlap && pixel.r) {
			this.ctx.fillStyle = this.c_background_color;
			this.ctx.fillRect(
				((((this.pixels_x / 2) + pixel.x) * this.pixelsize) - (this.c_offset * this.pixelsize)) + 4,
				(((this.pixels_y / 2) + pixel.y) * this.pixelsize) + 4,
				this.pixelsize - 8,
				this.pixelsize - 8
			);
		} else {

		}
	}

	string_to_map(str, offset_x, offset_y) {
		let x = offset_x;
		let y = offset_y;
		let map = [];
		for (let c of str) {
			switch (c) {
				case ".":
					x++;
					break;
				case "0":
					map.push({
						x,
						y,
						"o": 0
					});
					x++;
					break;
				case ";":
					y++;
					x = offset_x;
					break;
			}

		}
		return map;
	}

	initialize() {
		this.map_primary = [];
		this.map_primary_queue = this.c_map_center;
		this.map_secondary = this.c_map_secondary;
		this.map_void = this.c_map_void;
		for (let i in this.map_primary_queue) {
			this.map_primary_queue[i].p = true;
		}
		for (let i in this.map_secondary) {
			this.map_secondary[i].f = false;
			this.map_secondary[i].w = true;
		}
		this.map_random = [];
		this.rand_t_range = this.c_random_brightness_max - this.c_random_brightness_min;
	}

	keypress(e) {
		if (e.key == "r") {
			this.initialize();
		}
	}
}
