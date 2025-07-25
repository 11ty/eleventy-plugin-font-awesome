import test from "ava";
import { findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import Eleventy from "@11ty/eleventy";
import fontAwesomePlugin from "../plugin.js";
import { findIconMetadata, filterAttrs } from "../src/transform.js";


test("Transform", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Transform using a missing (pro) icon", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("index.njk", `<i class="fa-solid fa-left"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content.trim(), `<i class="fa-solid fa-left"></i>`);
});

test("Transform using a missing (pro) icon with fail on error", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-solid fa-left"></i>
{% getBundle "fontawesome" %}`);
		}
	});
	elev.disableLogger();

	let e = await t.throwsAsync(() => elev.toJSON());
	t.is(e.originalError.originalError.message, `Error with icon, via class="fa-solid fa-left". Resolved to: {"prefix":"fas","style":"solid","family":"classic","iconName":"left"}. Original error message: Could not find icon: fas:left`);
});

test("Transform is working in layout", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("_includes/layout.njk", `{{ content | safe }}
{% getBundle "fontawesome" %}`);
			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>`, {
				layout: "layout.njk"
			});
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Shortcode", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				transform: false,
				shortcode: "icon",
				defaultAttributes: {
					class: "zicon",
				}
			});

			eleventyConfig.addTemplate("index.njk", `{% icon "far:user" %}
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg class="zicon"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Shortcode with Accessible text", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				transform: false,
				shortcode: "icon",
				generateId: () => `shortcode-a11y`,
			});

			eleventyConfig.addTemplate("index.njk", `{% icon "far:user", { "alt": "A user" } %}
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-labelledby="shortcode-a11y" role="img"><use href="#far-fa-user" xlink:href="#far-fa-user"></use><title id="shortcode-a11y">A user</title></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Transform with defaultAttributes", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				defaultAttributes: {
					class: "zicon"
				}
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg class="zicon"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Transform with ignoredClasses", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				ignoredClasses: ["fak"],
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fak fa-dot"></i><i class="fa-regular fa-font-awesome"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<i class="fak fa-dot"></i><svg aria-hidden="true"><use href="#far-fa-font-awesome" xlink:href="#far-fa-font-awesome"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="font-awesome" class="svg-inline--fa fa-font-awesome" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" id="far-fa-font-awesome"><path fill="currentColor" d="M91.7 96C106.3 86.8 116 70.5 116 52C116 23.3 92.7 0 64 0S12 23.3 12 52c0 16.7 7.8 31.5 20 41l0 3 0 48 0 256 0 48 0 64 48 0 0-64 389.6 0c14.6 0 26.4-11.8 26.4-26.4c0-3.7-.8-7.3-2.3-10.7L432 272l61.7-138.9c1.5-3.4 2.3-7 2.3-10.7c0-14.6-11.8-26.4-26.4-26.4L91.7 96zM80 400l0-256 356.4 0L388.1 252.5c-5.5 12.4-5.5 26.6 0 39L436.4 400 80 400z"></path></symbol></svg>`);
});

test("findIconMetadata", async t => {
	t.deepEqual(findIconMetadata("fa-regular fa-user"), { family: "classic", iconName: "user", prefix: "far", style: "regular" });
	t.deepEqual(findIconMetadata("fas fa-starfighter fa-fw"), { family: "classic", iconName: "starfighter", prefix: "fas", style: "solid" });
	t.deepEqual(findIconMetadata("fal fa-arrow-up-right"), { family: "classic", iconName: "arrow-up-right", prefix: "fal", style: "light" });
});

test("filterAttrs", async t => {
	t.deepEqual(filterAttrs({
		class: "fas fa-sparkles fa-2xl"
	}), {
		class: "fa-2xl"
	});
});

test("Old tshirt syntax", async t => {
	let def = findIconDefinition({ prefix: 'fas', iconName: 'tshirt' });
	t.is(def.iconName, "shirt");

	// tshirt is used here, not yet normalized via aliases
	t.deepEqual(findIconMetadata("fas fa-tshirt"), { family: "classic", iconName: "tshirt", prefix: "fas", style: "solid" });
});

test("Old tshirt syntax (html)", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fas fa-tshirt"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#fas-fa-shirt" xlink:href="#fas-fa-shirt"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="fas" data-icon="shirt" class="svg-inline--fa fa-shirt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" id="fas-fa-shirt"><path fill="currentColor" d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0l12.6 0c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7 480 448c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-250.3-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0l12.6 0z"></path></symbol></svg>`);
});

test("Accessible text", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
				generateId: () => `demo-static-id`, // override for test
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fas fa-tshirt">shirt</i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-labelledby="demo-static-id" role="img"><title id="demo-static-id">shirt</title><use href="#fas-fa-shirt" xlink:href="#fas-fa-shirt"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="fas" data-icon="shirt" class="svg-inline--fa fa-shirt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" id="fas-fa-shirt"><path fill="currentColor" d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0l12.6 0c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7 480 448c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-250.3-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0l12.6 0z"></path></symbol></svg>`);
});

test("Disable accessible text", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
				generateId: false,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fas fa-tshirt">shirt</i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#fas-fa-shirt" xlink:href="#fas-fa-shirt"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="fas" data-icon="shirt" class="svg-inline--fa fa-shirt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" id="fas-fa-shirt"><path fill="currentColor" d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0l12.6 0c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7 480 448c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-250.3-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0l12.6 0z"></path></symbol></svg>`);
});

test("Opt-out of xlink:href attributes", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				useXlinkHref: false,
				// generateId: () => `demo-static-id`, // override for test
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg aria-hidden="true"><use href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});