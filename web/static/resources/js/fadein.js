class ElementFadeIn {

	constructor(parent, duration_seconds = 1) {
		this.frame_rate = 16;
		this.parent = parent;
		this.elements = [];
		this.animating_elements = [];
		this.tmp_elements = [];
		this.text = parent.getAttribute("data-fadein");
		let chars = this.text.split("");
		for (let char of chars) {
			let span = document.createElement("span");
			span.style.opacity = 0;
			span.innerHTML = char;
			parent.appendChild(span);
		}
		let children = parent.children;
		this.cycle_rate = (duration_seconds * 1000) / (children.length - 1);
		for (let i in this.parent.children) {
			if (isNaN(i)) {
				continue;
			}
			this.elements.push(this.parent.children[i]);
			this.tmp_elements.push(
				{
					index: i,
					opacity: 0
				}
			);
		}
		this.animate();
		this.cycle();
	}

	animate() {
		let finished = true;
		for (let char of this.animating_elements) {
			if (char["opacity"] != 1) {
				finished = false;
				char["opacity"] += 0.01;
				if (char["opacity"] > 1) {
					char["opacity"] = 1;
				}
				this.elements[char["index"]].style.opacity = char["opacity"];
			}
		}
		if (!finished || this.tmp_elements.length != 0) {
			setTimeout(this.animate.bind(this), this.frame_rate);
		} else {
			this.parent.innerHTML = this.text;
		}
	}

	cycle() {
		let finished = true;
		if (this.tmp_elements.length > 0) {
			let i = Math.floor(Math.random() * this.tmp_elements.length);
			this.animating_elements.push(this.tmp_elements[i]);
			this.tmp_elements.splice(i, 1);
			finished = false;
		}
		if (!finished) {
			setTimeout(this.cycle.bind(this), this.cycle_rate);
		}
	}

}
