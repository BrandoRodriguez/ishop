
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const cart = writable({});

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\components\Oferta.svelte generated by Svelte v3.21.0 */

    const file = "src\\components\\Oferta.svelte";

    function create_fragment(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*o*/ ctx[0]);
    			attr_dev(span, "class", "ProductCardstyle__DiscountPercent-sc-14yo7ej-3 gBbfsg svelte-1s0bftq");
    			add_location(span, file, 22, 0, 423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*o*/ 1) set_data_dev(t, /*o*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { o } = $$props;
    	const writable_props = ["o"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Oferta> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Oferta", $$slots, []);

    	$$self.$set = $$props => {
    		if ("o" in $$props) $$invalidate(0, o = $$props.o);
    	};

    	$$self.$capture_state = () => ({ o });

    	$$self.$inject_state = $$props => {
    		if ("o" in $$props) $$invalidate(0, o = $$props.o);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [o];
    }

    class Oferta extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { o: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Oferta",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*o*/ ctx[0] === undefined && !("o" in props)) {
    			console.warn("<Oferta> was created without expected prop 'o'");
    		}
    	}

    	get o() {
    		throw new Error("<Oferta>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set o(value) {
    		throw new Error("<Oferta>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Card.svelte generated by Svelte v3.21.0 */
    const file$1 = "src\\components\\Card.svelte";

    // (375:12) {:else}
    function create_else_block(ctx) {
    	let button;
    	let span0;
    	let svg_1;
    	let g;
    	let path;
    	let t0;
    	let span1;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			svg_1 = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "card";
    			attr_dev(path, "data-name", "Path 154");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", /*svg*/ ctx[1]);
    			attr_dev(path, "class", "svelte-16iweel");
    			add_location(path, file$1, 385, 22, 10386);
    			attr_dev(g, "data-name", "Group 120");
    			attr_dev(g, "transform", "translate(-288 -413.89)");
    			attr_dev(g, "class", "svelte-16iweel");
    			add_location(g, file$1, 382, 20, 10255);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "14.4");
    			attr_dev(svg_1, "height", "12");
    			attr_dev(svg_1, "viewBox", "0 0 14.4 12");
    			attr_dev(svg_1, "class", "svelte-16iweel");
    			add_location(svg_1, file$1, 377, 18, 10062);
    			attr_dev(span0, "class", "button-icon svelte-16iweel");
    			add_location(span0, file$1, 376, 16, 10016);
    			attr_dev(span1, "class", "btn-text svelte-16iweel");
    			add_location(span1, file$1, 389, 16, 10538);
    			attr_dev(button, "class", "button-general button-card svelte-16iweel");
    			add_location(button, file$1, 375, 14, 9934);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, svg_1);
    			append_dev(svg_1, g);
    			append_dev(g, path);
    			append_dev(button, t0);
    			append_dev(button, span1);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*addToCart*/ ctx[6], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(375:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (317:12) {#if inCart > 0}
    function create_if_block(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let rect0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*inCart*/ ctx[0]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			attr_dev(rect0, "class", "svelte-16iweel");
    			add_location(rect0, file$1, 332, 20, 8313);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			attr_dev(svg0, "class", "svelte-16iweel");
    			add_location(svg0, file$1, 327, 18, 8122);
    			attr_dev(button0, "class", "add Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-16iweel");
    			add_location(button0, file$1, 324, 16, 7966);
    			attr_dev(span, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-16iweel");
    			add_location(span, file$1, 340, 16, 8582);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			attr_dev(rect1, "class", "svelte-16iweel");
    			add_location(rect1, file$1, 355, 22, 9229);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			attr_dev(rect2, "class", "svelte-16iweel");
    			add_location(rect2, file$1, 362, 22, 9518);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			attr_dev(g, "class", "svelte-16iweel");
    			add_location(g, file$1, 351, 20, 9060);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			attr_dev(svg1, "class", "svelte-16iweel");
    			add_location(svg1, file$1, 346, 18, 8867);
    			attr_dev(button1, "class", " Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-16iweel");
    			add_location(button1, file$1, 343, 16, 8714);
    			attr_dev(div, "class", "Counterstyle__CounterBox-sc-14ahato-0 fmEddu svelte-16iweel");
    			add_location(div, file$1, 320, 14, 7813);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[7], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[7], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*inCart*/ 1) set_data_dev(t1, /*inCart*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(317:12) {#if inCart > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div7;
    	let div6;
    	let div5;
    	let div4;
    	let div0;
    	let img_1;
    	let img_1_src_value;
    	let t0;
    	let t1;
    	let div3;
    	let h3;
    	let t3;
    	let span0;
    	let t7;
    	let div2;
    	let div1;
    	let span1;
    	let t10;
    	let current;

    	const oferta = new Oferta({
    			props: { o: "" + (50 + "%") },
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*inCart*/ ctx[0] > 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img_1 = element("img");
    			t0 = space();
    			create_component(oferta.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = `${/*name*/ ctx[2]}`;
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = `${/*soles*/ ctx[5]}  ${/*price*/ ctx[3]}`;
    			t7 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = `${/*soles*/ ctx[5]}${/*price*/ ctx[3]}`;
    			t10 = space();
    			if_block.c();
    			if (img_1.src !== (img_1_src_value = `img/${/*img*/ ctx[4]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[2]);
    			attr_dev(img_1, "class", "svelte-16iweel");
    			add_location(img_1, file$1, 297, 10, 7009);
    			attr_dev(div0, "class", "card-image svelte-16iweel");
    			add_location(div0, file$1, 295, 8, 6971);
    			attr_dev(h3, "class", "product-title svelte-16iweel");
    			add_location(h3, file$1, 309, 10, 7384);
    			attr_dev(span0, "class", "product-weight svelte-16iweel");
    			add_location(span0, file$1, 310, 10, 7433);
    			attr_dev(span1, "class", "product-price svelte-16iweel");
    			add_location(span1, file$1, 313, 14, 7585);
    			attr_dev(div1, "class", "productPriceWrapper svelte-16iweel");
    			add_location(div1, file$1, 312, 12, 7536);
    			attr_dev(div2, "class", "product-meta svelte-16iweel");
    			add_location(div2, file$1, 311, 10, 7496);
    			attr_dev(div3, "class", "card-information svelte-16iweel");
    			add_location(div3, file$1, 308, 8, 7342);
    			attr_dev(div4, "class", "card-product product-card svelte-16iweel");
    			add_location(div4, file$1, 293, 6, 6920);
    			attr_dev(div5, "class", "react-reveal svelte-16iweel");
    			add_location(div5, file$1, 292, 4, 6886);
    			attr_dev(div6, "class", "card-size svelte-16iweel");
    			add_location(div6, file$1, 291, 2, 6857);
    			attr_dev(div7, "class", "card-measurements svelte-16iweel");
    			add_location(div7, file$1, 290, 0, 6822);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, img_1);
    			append_dev(div0, t0);
    			mount_component(oferta, div0, null);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, h3);
    			append_dev(div3, t3);
    			append_dev(div3, span0);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(div2, t10);
    			if_block.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(oferta.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(oferta.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_component(oferta);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let visible = true;
    	let svg = "M298.7,418.289l-2.906-4.148a.835.835,0,0,0-.528-.251.607.607,0,0,0-.529.251l-2.905,4.148h-3.17a.609.609,0,0,0-.661.625v.191l1.651,5.84a1.336,1.336,0,0,0,1.255.945h8.588a1.261,1.261,0,0,0,1.254-.945l1.651-5.84v-.191a.609.609,0,0,0-.661-.625Zm-5.419,0,1.984-2.767,1.98,2.767Zm1.984,5.024a1.258,1.258,0,1,1,1.319-1.258,1.3,1.3,0,0,1-1.319,1.258Zm0,0";
    	let { item } = $$props;
    	let { name, price, img, count } = item;
    	let soles = "$";
    	const cartItems = get_store_value(cart);
    	let inCart = cartItems[name] ? cartItems[name].count : 0;

    	function addToCart() {
    		$$invalidate(0, inCart++, inCart);

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	}

    	const countButtonHandler = e => {
    		if (e.target.classList.contains("add")) {
    			$$invalidate(0, inCart--, inCart);
    		} else if (inCart >= 1) {
    			$$invalidate(0, inCart++, inCart);
    		}

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	};

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, []);

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(8, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		cart,
    		fly,
    		Oferta,
    		visible,
    		svg,
    		item,
    		name,
    		price,
    		img,
    		count,
    		soles,
    		cartItems,
    		inCart,
    		addToCart,
    		countButtonHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("svg" in $$props) $$invalidate(1, svg = $$props.svg);
    		if ("item" in $$props) $$invalidate(8, item = $$props.item);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("price" in $$props) $$invalidate(3, price = $$props.price);
    		if ("img" in $$props) $$invalidate(4, img = $$props.img);
    		if ("count" in $$props) count = $$props.count;
    		if ("soles" in $$props) $$invalidate(5, soles = $$props.soles);
    		if ("inCart" in $$props) $$invalidate(0, inCart = $$props.inCart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [inCart, svg, name, price, img, soles, addToCart, countButtonHandler, item];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { item: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[8] === undefined && !("item" in props)) {
    			console.warn("<Card> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var items = [
      {
        name: "Tomate",
        img: "tomatoes.png",
        price: "5",
      },
      {
        name: "Cebolla",
        img: "onions.png",
        price: "5",
      },
      {
        name: "Aji",
        img: "garlic.png",
        price: "7.2",
      },
      {
        name: "Limon",
        img: "pepper.png",
        price: "12",
      },
      {
        name: "Ajo",
        img: "cocnut.png",
        price: "4",
      },
      {
        name: "Platano",
        img: "banana.png",
        price: "10",
      },
      {
        name: "Piña",
        img: "apineapple.png",
        price: "20",
      },
      {
        name: "Uva",
        img: "garlic.png",
        price: "5",
      },
      {
        name: "Cebolla",
        img: "onions.png",
        price: "5",
      },
      {
        name: "Aji",
        img: "garlic.png",
        price: "7.2",
      },
      {
        name: "Limon",
        img: "pepper.png",
        price: "12",
      },
      {
        name: "Ajo",
        img: "cocnut.png",
        price: "4",
      },
      {
        name: "Platano",
        img: "banana.png",
        price: "10",
      },
      {
        name: "Piña",
        img: "apineapple.png",
        price: "20",
      },
      {
        name: "Uva",
        img: "garlic.png",
        price: "5",
      },
    ];

    /* src\components\CardWrapper.svelte generated by Svelte v3.21.0 */
    const file$2 = "src\\components\\CardWrapper.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (47:4) {#each items as item}
    function create_each_block(ctx) {
    	let current;

    	const card = new Card({
    			props: { item: /*item*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(47:4) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value = items;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "card-details svelte-of8qlo");
    			add_location(div0, file$2, 44, 2, 807);
    			attr_dev(div1, "class", "card svelte-of8qlo");
    			add_location(div1, file$2, 43, 0, 785);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 0) {
    				each_value = items;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardWrapper> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CardWrapper", $$slots, []);
    	$$self.$capture_state = () => ({ Card, items });
    	return [];
    }

    class CardWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardWrapper",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Navbar.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1 } = globals;
    const file$3 = "src\\components\\Navbar.svelte";

    // (157:10) {#if cart_sum > 0}
    function create_if_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*cart_sum*/ ctx[0]);
    			attr_dev(div, "class", "circle svelte-1ca2dhk");
    			add_location(div, file$3, 157, 12, 4262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cart_sum*/ 1) set_data_dev(t, /*cart_sum*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(157:10) {#if cart_sum > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let ul;
    	let li;
    	let t1;
    	let button;
    	let span6;
    	let span0;
    	let svg;
    	let g4;
    	let g1;
    	let g0;
    	let path0;
    	let g3;
    	let g2;
    	let path1;
    	let t2;
    	let span2;
    	let span1;
    	let t4;
    	let span5;
    	let span4;
    	let span3;
    	let dispose;
    	let if_block = /*cart_sum*/ ctx[0] > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			ul = element("ul");
    			li = element("li");
    			li.textContent = "SvelteCommerce";
    			t1 = space();
    			button = element("button");
    			span6 = element("span");
    			span0 = element("span");
    			svg = svg_element("svg");
    			g4 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path1 = svg_element("path");
    			t2 = space();
    			span2 = element("span");
    			span1 = element("span");
    			span1.textContent = `${/*articulo*/ ctx[1]}`;
    			t4 = space();
    			span5 = element("span");
    			span4 = element("span");
    			span3 = element("span");
    			if (if_block) if_block.c();
    			attr_dev(li, "class", "svelte-1ca2dhk");
    			add_location(li, file$3, 111, 4, 2300);
    			attr_dev(ul, "class", "svelte-1ca2dhk");
    			add_location(ul, file$3, 110, 2, 2290);
    			attr_dev(header, "class", "svelte-1ca2dhk");
    			add_location(header, file$3, 109, 0, 2278);
    			attr_dev(path0, "data-name", "Path 3");
    			attr_dev(path0, "d", "M65.7,111.043l-.714-9A1.125,1.125,0,0,0,63.871,101H62.459V103.1a.469.469,0,1,1-.937,0V101H57.211V103.1a.469.469,0,1,1-.937,0V101H54.862a1.125,1.125,0,0,0-1.117,1.033l-.715,9.006a2.605,2.605,0,0,0,2.6,2.8H63.1a2.605,2.605,0,0,0,2.6-2.806Zm-4.224-4.585-2.424,2.424a.468.468,0,0,1-.663,0l-1.136-1.136a.469.469,0,0,1,.663-.663l.8.8,2.092-2.092a.469.469,0,1,1,.663.663Z");
    			attr_dev(path0, "transform", "translate(-53.023 -101.005)");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "class", "svelte-1ca2dhk");
    			add_location(path0, file$3, 128, 14, 2887);
    			attr_dev(g0, "data-name", "Group 16");
    			attr_dev(g0, "class", "svelte-1ca2dhk");
    			add_location(g0, file$3, 127, 12, 2847);
    			attr_dev(g1, "data-name", "Group 17");
    			attr_dev(g1, "transform", "translate(27.023 5.156)");
    			attr_dev(g1, "class", "svelte-1ca2dhk");
    			add_location(g1, file$3, 126, 10, 2773);
    			attr_dev(path1, "data-name", "Path 4");
    			attr_dev(path1, "d", "M160.132,0a3.1,3.1,0,0,0-3.093,3.093v.063h.937V3.093a2.155,2.155,0,1,1,4.311,0v.063h.937V3.093A3.1,3.1,0,0,0,160.132,0Z");
    			attr_dev(path1, "transform", "translate(-157.039)");
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "class", "svelte-1ca2dhk");
    			add_location(path1, file$3, 137, 14, 3567);
    			attr_dev(g2, "data-name", "Group 18");
    			attr_dev(g2, "class", "svelte-1ca2dhk");
    			add_location(g2, file$3, 136, 12, 3527);
    			attr_dev(g3, "data-name", "Group 19");
    			attr_dev(g3, "transform", "translate(30.274 2)");
    			attr_dev(g3, "class", "svelte-1ca2dhk");
    			add_location(g3, file$3, 135, 10, 3457);
    			attr_dev(g4, "data-name", "Group 2704");
    			attr_dev(g4, "transform", "translate(-27.023 -2)");
    			attr_dev(g4, "class", "svelte-1ca2dhk");
    			add_location(g4, file$3, 125, 8, 2701);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "12.686");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 12.686 16");
    			attr_dev(svg, "class", "svelte-1ca2dhk");
    			add_location(svg, file$3, 120, 6, 2564);
    			attr_dev(span0, "class", "svelte-1ca2dhk");
    			add_location(span0, file$3, 119, 4, 2550);
    			set_style(span1, "vertical-align", "inherit");
    			attr_dev(span1, "class", "svelte-1ca2dhk");
    			add_location(span1, file$3, 149, 6, 3968);
    			set_style(span2, "vertical-align", "inherit");
    			attr_dev(span2, "class", "svelte-1ca2dhk");
    			add_location(span2, file$3, 148, 4, 3921);
    			set_style(span3, "vertical-align", "inherit");
    			attr_dev(span3, "class", "svelte-1ca2dhk");
    			add_location(span3, file$3, 155, 8, 4179);
    			set_style(span4, "vertical-align", "inherit");
    			attr_dev(span4, "class", "svelte-1ca2dhk");
    			add_location(span4, file$3, 154, 6, 4130);
    			attr_dev(span5, "class", "CartPopupstyle__PriceBoxAlt-sc-67tc19-6 iZKyqx svelte-1ca2dhk");
    			add_location(span5, file$3, 151, 4, 4043);
    			attr_dev(span6, "class", "CartPopupstyle__TotalItems-sc-67tc19-5 bMppaE svelte-1ca2dhk");
    			add_location(span6, file$3, 118, 2, 2484);
    			attr_dev(button, "class", "CartPopupstyle__CartPopupBoxButton-sc-67tc19-4 hQDCQX product-cart svelte-1ca2dhk");
    			add_location(button, file$3, 115, 0, 2367);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, header, anchor);
    			append_dev(header, ul);
    			append_dev(ul, li);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, span6);
    			append_dev(span6, span0);
    			append_dev(span0, svg);
    			append_dev(svg, g4);
    			append_dev(g4, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g4, g3);
    			append_dev(g3, g2);
    			append_dev(g2, path1);
    			append_dev(span6, t2);
    			append_dev(span6, span2);
    			append_dev(span2, span1);
    			append_dev(span6, t4);
    			append_dev(span6, span5);
    			append_dev(span5, span4);
    			append_dev(span4, span3);
    			if (if_block) if_block.m(span3, null);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(li, "click", /*goToHome*/ ctx[2], false, false, false),
    				listen_dev(button, "click", /*goToCheckout*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*cart_sum*/ ctx[0] > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(span3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let cart_sum = 0;
    	let articulo = "Item";

    	const unsubscribe = cart.subscribe(items => {
    		const itemValues = Object.values(items);
    		$$invalidate(0, cart_sum = 0);

    		itemValues.forEach(item => {
    			$$invalidate(0, cart_sum += item.count);
    		});
    	});

    	function goToHome() {
    		dispatch("nav", { option: "home" });
    	}

    	function goToCheckout() {
    		dispatch("nav", { option: "checkout" });
    	}

    	function goToModa() {
    		dispatch("nav", { option: "moda" });
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	$$self.$capture_state = () => ({
    		cart,
    		createEventDispatcher,
    		dispatch,
    		cart_sum,
    		articulo,
    		unsubscribe,
    		goToHome,
    		goToCheckout,
    		goToModa
    	});

    	$$self.$inject_state = $$props => {
    		if ("cart_sum" in $$props) $$invalidate(0, cart_sum = $$props.cart_sum);
    		if ("articulo" in $$props) $$invalidate(1, articulo = $$props.articulo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cart_sum, articulo, goToHome, goToCheckout];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\CheckoutItem.svelte generated by Svelte v3.21.0 */
    const file$4 = "src\\components\\CheckoutItem.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let img_1;
    	let img_1_src_value;
    	let t0;
    	let div2;
    	let h3;
    	let t2;
    	let p0;
    	let t5;
    	let p1;
    	let t6;
    	let t7;
    	let t8;
    	let div1;
    	let div0;
    	let button0;
    	let svg0;
    	let rect0;
    	let t9;
    	let span;
    	let t10;
    	let t11;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let t12;
    	let button2;
    	let object;
    	let t13;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			img_1 = element("img");
    			t0 = space();
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = `${/*name*/ ctx[2]}`;
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = `Price: ${/*price*/ ctx[3]}`;
    			t5 = space();
    			p1 = element("p");
    			t6 = text("Suma: ");
    			t7 = text(/*doubled*/ ctx[1]);
    			t8 = space();
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t9 = space();
    			span = element("span");
    			t10 = text(/*count*/ ctx[0]);
    			t11 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			t12 = space();
    			button2 = element("button");
    			object = element("object");
    			t13 = text("\r\n        Remove");
    			if (img_1.src !== (img_1_src_value = `img/${/*img*/ ctx[4]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[2]);
    			attr_dev(img_1, "class", "svelte-mr7xmw");
    			add_location(img_1, file$4, 377, 2, 7842);
    			attr_dev(h3, "class", "title svelte-mr7xmw");
    			add_location(h3, file$4, 379, 4, 7917);
    			attr_dev(p0, "class", "price svelte-mr7xmw");
    			add_location(p0, file$4, 380, 4, 7952);
    			attr_dev(p1, "class", "price svelte-mr7xmw");
    			add_location(p1, file$4, 381, 4, 7993);
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			attr_dev(rect0, "class", "svelte-mr7xmw");
    			add_location(rect0, file$4, 396, 12, 8485);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			attr_dev(svg0, "class", "svelte-mr7xmw");
    			add_location(svg0, file$4, 391, 10, 8334);
    			attr_dev(button0, "class", " add Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-mr7xmw");
    			add_location(button0, file$4, 388, 8, 8201);
    			attr_dev(span, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-mr7xmw");
    			add_location(span, file$4, 404, 8, 8690);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			attr_dev(rect1, "class", "svelte-mr7xmw");
    			add_location(rect1, file$4, 419, 14, 9215);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			attr_dev(rect2, "class", "svelte-mr7xmw");
    			add_location(rect2, file$4, 426, 14, 9448);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			attr_dev(g, "class", "svelte-mr7xmw");
    			add_location(g, file$4, 415, 12, 9078);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			attr_dev(svg1, "class", "svelte-mr7xmw");
    			add_location(svg1, file$4, 410, 10, 8925);
    			attr_dev(button1, "class", "Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-mr7xmw");
    			add_location(button1, file$4, 407, 8, 8797);
    			attr_dev(div0, "class", "Counterstyle__CounterBox-sc-14ahato-0 fmEddu svelte-mr7xmw");
    			add_location(div0, file$4, 384, 6, 8064);
    			attr_dev(object, "aria-label", "remove");
    			attr_dev(object, "type", "image/svg+xml");
    			attr_dev(object, "data", "img/svg/cancel.svg");
    			attr_dev(object, "class", "svelte-mr7xmw");
    			add_location(object, file$4, 439, 8, 9810);
    			attr_dev(button2, "class", "remove svelte-mr7xmw");
    			add_location(button2, file$4, 438, 6, 9755);
    			attr_dev(div1, "class", "count svelte-mr7xmw");
    			add_location(div1, file$4, 383, 4, 8037);
    			attr_dev(div2, "class", "item-meta-data svelte-mr7xmw");
    			add_location(div2, file$4, 378, 2, 7883);
    			attr_dev(div3, "class", "item-grid svelte-mr7xmw");
    			add_location(div3, file$4, 376, 0, 7815);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img_1);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    			append_dev(div2, t2);
    			append_dev(div2, p0);
    			append_dev(div2, t5);
    			append_dev(div2, p1);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div0, t9);
    			append_dev(div0, span);
    			append_dev(span, t10);
    			append_dev(div0, t11);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			append_dev(div1, t12);
    			append_dev(div1, button2);
    			append_dev(button2, object);
    			append_dev(button2, t13);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[5], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[5], false, false, false),
    				listen_dev(button2, "click", /*removeItem*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*doubled*/ 2) set_data_dev(t7, /*doubled*/ ctx[1]);
    			if (dirty & /*count*/ 1) set_data_dev(t10, /*count*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { item } = $$props;
    	let { name, price, img, count } = item;

    	const countButtonHandler = e => {
    		if (e.target.classList.contains("add")) {
    			$$invalidate(0, count++, count);
    		} else if (count >= 1) {
    			$$invalidate(0, count--, count);
    		}

    		cart.update(n => ({ ...n, [name]: { ...n[name], count } }));
    	};

    	const removeItem = () => {
    		cart.update(n => {
    			delete n[name];
    			return n;
    		});
    	};

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckoutItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CheckoutItem", $$slots, []);

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(7, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		cart,
    		item,
    		name,
    		price,
    		img,
    		count,
    		countButtonHandler,
    		removeItem,
    		doubled
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(7, item = $$props.item);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("price" in $$props) $$invalidate(3, price = $$props.price);
    		if ("img" in $$props) $$invalidate(4, img = $$props.img);
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    		if ("doubled" in $$props) $$invalidate(1, doubled = $$props.doubled);
    	};

    	let doubled;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*count*/ 1) {
    			 $$invalidate(1, doubled = count * price);
    		}
    	};

    	return [count, doubled, name, price, img, countButtonHandler, removeItem, item];
    }

    class CheckoutItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { item: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckoutItem",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[7] === undefined && !("item" in props)) {
    			console.warn("<CheckoutItem> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<CheckoutItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<CheckoutItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Checkout.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1$1 } = globals;
    const file$5 = "src\\components\\Checkout.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (68:2) {:else}
    function create_else_block_1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let button;
    	let current;
    	let dispose;
    	let each_value = /*cartItems*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[4].name;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			button.textContent = "Checkout";
    			attr_dev(button, "class", "checkout svelte-1worxli");
    			add_location(button, file$5, 71, 4, 1447);
    		},
    		m: function mount(target, anchor, remount) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*checkout*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cartItems*/ 2) {
    				const each_value = /*cartItems*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, t0.parentNode, outro_and_destroy_block, create_each_block$1, t0, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(68:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (62:2) {#if cartItems.length === 0}
    function create_if_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*checkedOut*/ ctx[0]) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(62:2) {#if cartItems.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {#each cartItems as item (item.name)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let current;

    	const checkoutitem = new CheckoutItem({
    			props: { item: /*item*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(checkoutitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(checkoutitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkoutitem_changes = {};
    			if (dirty & /*cartItems*/ 2) checkoutitem_changes.item = /*item*/ ctx[4];
    			checkoutitem.$set(checkoutitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkoutitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkoutitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(checkoutitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(69:4) {#each cartItems as item (item.name)}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Your cart is empty";
    			attr_dev(p, "class", "empty-message svelte-1worxli");
    			add_location(p, file$5, 65, 6, 1285);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(65:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if checkedOut}
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Thank you for shopping with us";
    			attr_dev(p, "class", "empty-message svelte-1worxli");
    			add_location(p, file$5, 63, 6, 1205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(63:4) {#if checkedOut}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*cartItems*/ ctx[1].length === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "My Cart";
    			t1 = space();
    			if_block.c();
    			add_location(h1, file$5, 60, 2, 1127);
    			attr_dev(div, "class", "checkout-container svelte-1worxli");
    			add_location(div, file$5, 59, 0, 1091);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let checkedOut = false;
    	let cartItems = [];

    	const unsubscribe = cart.subscribe(items => {
    		$$invalidate(1, cartItems = Object.values(items));
    	});

    	const checkout = () => {
    		$$invalidate(0, checkedOut = true);

    		cart.update(n => {
    			return {};
    		});
    	};

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkout> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Checkout", $$slots, []);

    	$$self.$capture_state = () => ({
    		CheckoutItem,
    		cart,
    		checkedOut,
    		cartItems,
    		unsubscribe,
    		checkout
    	});

    	$$self.$inject_state = $$props => {
    		if ("checkedOut" in $$props) $$invalidate(0, checkedOut = $$props.checkedOut);
    		if ("cartItems" in $$props) $$invalidate(1, cartItems = $$props.cartItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checkedOut, cartItems, checkout];
    }

    class Checkout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkout",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.21.0 */

    // (18:0) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const checkout = new Checkout({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(checkout.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkout, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(18:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if nav === 'home'}
    function create_if_block$3(ctx) {
    	let current;
    	const cardwrapper = new CardWrapper({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cardwrapper.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardwrapper, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(16:0) {#if nav === 'home'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const navbar = new Navbar({ $$inline: true });
    	navbar.$on("nav", /*navHandler*/ ctx[1]);
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nav*/ ctx[0] === "home") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let nav = "home";

    	function navHandler(event) {
    		$$invalidate(0, nav = event.detail.option);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		CardWrapper,
    		Navbar,
    		Checkout,
    		nav,
    		navHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("nav" in $$props) $$invalidate(0, nav = $$props.nav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nav, navHandler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
