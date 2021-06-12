
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
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
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
            set_current_component(null);
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
            block.m(node, next);
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
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/common/Tweet.svelte generated by Svelte v3.38.2 */

    const file$m = "src/components/common/Tweet.svelte";

    function create_fragment$r(ctx) {
    	let button;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M48,22.1c-1.2,0.5-2.4,0.9-3.8,1c1.4-0.8,2.4-2.1,2.9-3.6c-1.3,0.8-2.7,1.3-4.2,1.6 C41.7,19.8,40,19,38.2,19c-3.6,0-6.6,2.9-6.6,6.6c0,0.5,0.1,1,0.2,1.5c-5.5-0.3-10.3-2.9-13.5-6.9c-0.6,1-0.9,2.1-0.9,3.3 c0,2.3,1.2,4.3,2.9,5.5c-1.1,0-2.1-0.3-3-0.8c0,0,0,0.1,0,0.1c0,3.2,2.3,5.8,5.3,6.4c-0.6,0.1-1.1,0.2-1.7,0.2c-0.4,0-0.8,0-1.2-0.1 c0.8,2.6,3.3,4.5,6.1,4.6c-2.2,1.8-5.1,2.8-8.2,2.8c-0.5,0-1.1,0-1.6-0.1c2.9,1.9,6.4,2.9,10.1,2.9c12.1,0,18.7-10,18.7-18.7 c0-0.3,0-0.6,0-0.8C46,24.5,47.1,23.4,48,22.1z");
    			add_location(path, file$m, 24, 9, 518);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "aria-roledescription", "logo");
    			attr_dev(svg, "aria-label", "Twitter logo");
    			attr_dev(svg, "viewBox", "0 0 48 48");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "color", "#ffffff");
    			add_location(svg, file$m, 16, 4, 324);
    			attr_dev(button, "class", "icon");
    			attr_dev(button, "role", "link");
    			attr_dev(button, "rel", "noopener");
    			attr_dev(button, "aria-label", "Tweet this story (Opens in a new tab)");
    			add_location(button, file$m, 5, 0, 62);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tweet", slots, []);
    	let { tweet } = $$props;
    	let { url } = $$props;
    	const writable_props = ["tweet", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tweet> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.open(`https://twitter.com/intent/tweet?text=${tweet}${url}`, "_blank");

    	$$self.$$set = $$props => {
    		if ("tweet" in $$props) $$invalidate(0, tweet = $$props.tweet);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({ tweet, url });

    	$$self.$inject_state = $$props => {
    		if ("tweet" in $$props) $$invalidate(0, tweet = $$props.tweet);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tweet, url, click_handler];
    }

    class Tweet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$r, safe_not_equal, { tweet: 0, url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tweet",
    			options,
    			id: create_fragment$r.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tweet*/ ctx[0] === undefined && !("tweet" in props)) {
    			console.warn("<Tweet> was created without expected prop 'tweet'");
    		}

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console.warn("<Tweet> was created without expected prop 'url'");
    		}
    	}

    	get tweet() {
    		throw new Error("<Tweet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tweet(value) {
    		throw new Error("<Tweet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Tweet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Tweet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/common/Menu.svelte generated by Svelte v3.38.2 */
    const file$l = "src/components/common/Menu.svelte";

    function create_fragment$q(ctx) {
    	let div1;
    	let button;
    	let svg;
    	let path;
    	let t0;
    	let div0;
    	let t2;
    	let tweet;
    	let current;
    	let mounted;
    	let dispose;

    	tweet = new Tweet({
    			props: {
    				tweet: "Check this ",
    				url: "https://www.google.com/"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Vaccination Tracker";
    			t2 = space();
    			create_component(tweet.$$.fragment);
    			attr_dev(path, "d", "M32,16c-8.8,0-16,7.2-16,16c0,7.1,4.6,13.1,10.9,15.2 c0.8,0.1,1.1-0.3,1.1-0.8c0-0.4,0-1.4,0-2.7c-4.5,1-5.4-2.1-5.4-2.1c-0.7-1.8-1.8-2.3-1.8-2.3c-1.5-1,0.1-1,0.1-1 c1.6,0.1,2.5,1.6,2.5,1.6c1.4,2.4,3.7,1.7,4.7,1.3c0.1-1,0.6-1.7,1-2.1c-3.6-0.4-7.3-1.8-7.3-7.9c0-1.7,0.6-3.2,1.6-4.3 c-0.2-0.4-0.7-2,0.2-4.2c0,0,1.3-0.4,4.4,1.6c1.3-0.4,2.6-0.5,4-0.5c1.4,0,2.7,0.2,4,0.5c3.1-2.1,4.4-1.6,4.4-1.6 c0.9,2.2,0.3,3.8,0.2,4.2c1,1.1,1.6,2.5,1.6,4.3c0,6.1-3.7,7.5-7.3,7.9c0.6,0.5,1.1,1.5,1.1,3c0,2.1,0,3.9,0,4.4 c0,0.4,0.3,0.9,1.1,0.8C43.4,45.1,48,39.1,48,32C48,23.2,40.8,16,32,16z");
    			add_location(path, file$l, 23, 13, 555);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "aria-roledescription", "logo");
    			attr_dev(svg, "aria-label", "GitHub logo");
    			attr_dev(svg, "viewBox", "0 0 48 48");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "color", "#ffffff");
    			add_location(svg, file$l, 15, 8, 330);
    			attr_dev(button, "class", "icon");
    			attr_dev(button, "target", "_blank");
    			attr_dev(button, "role", "link");
    			attr_dev(button, "rel", "noopener");
    			attr_dev(button, "aria-label", "Find this repo on GitHub (Opens in a new tab)");
    			add_location(button, file$l, 7, 4, 114);
    			attr_dev(div0, "class", "navbarTitle svelte-kcpiga");
    			add_location(div0, file$l, 28, 4, 1196);
    			attr_dev(div1, "class", "navbar svelte-kcpiga");
    			add_location(div1, file$l, 4, 0, 60);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			mount_component(tweet, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tweet.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tweet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(tweet);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.open();
    	$$self.$capture_state = () => ({ Tweet });
    	return [click_handler];
    }

    class Menu$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    // Match modifiers on DOM events.
    const oldModifierRegex = /^[a-z]+(?::(?:preventDefault|stopPropagation|passive|nonpassive|capture|once|self))+$/;
    // Match modifiers on other events.
    const newModifierRegex = /^[^$]+(?:\$(?:preventDefault|stopPropagation|passive|nonpassive|capture|once|self))+$/;

    function forwardEventsBuilder(component) {
      // This is our pseudo $on function. It is defined on component mount.
      let $on;
      // This is a list of events bound before mount.
      let events = [];
      // This is the original component $on function.
      const componentOn = component.$on;

      // And we override the $on function to forward all bound events.
      component.$on = (fullEventType, callback) => {
        let eventType = fullEventType;
        let destructor = () => {};
        if ($on) {
          // The event was bound programmatically.
          destructor = $on(eventType, callback);
        } else {
          // The event was bound before mount by Svelte.
          events.push([eventType, callback]);
        }
        const oldModifierMatch = eventType.match(oldModifierRegex);
        const newModifierMatch = eventType.match(newModifierRegex);
        const modifierMatch = oldModifierMatch || newModifierMatch;

        if (oldModifierMatch && console) {
          console.warn(
            'Event modifiers in SMUI now use "$" instead of ":", so that all events can be bound with modifiers. Please update your event binding: ',
            eventType
          );
        }

        if (modifierMatch) {
          // Remove modifiers from the real event.
          const parts = eventType.split(oldModifierMatch ? ':' : '$');
          eventType = parts[0];
        }

        // Call the original $on function.
        const componentDestructor = componentOn.call(
          component,
          eventType,
          callback
        );

        return (...args) => {
          destructor();
          return componentDestructor(...args);
        };
      };

      function forward(e) {
        // Internally bubble the event up from Svelte components.
        bubble(component, e);
      }

      return (node) => {
        const destructors = [];
        const forwardDestructors = {};

        // This function is responsible for forwarding all bound events.
        $on = (fullEventType, callback) => {
          let eventType = fullEventType;
          let handler = callback;
          // DOM addEventListener options argument.
          let options = false;
          const oldModifierMatch = eventType.match(oldModifierRegex);
          const newModifierMatch = eventType.match(newModifierRegex);
          const modifierMatch = oldModifierMatch || newModifierMatch;
          if (modifierMatch) {
            // Parse the event modifiers.
            // Supported modifiers:
            // - preventDefault
            // - stopPropagation
            // - passive
            // - nonpassive
            // - capture
            // - once
            const parts = eventType.split(oldModifierMatch ? ':' : '$');
            eventType = parts[0];
            options = Object.fromEntries(parts.slice(1).map((mod) => [mod, true]));
            if (options.nonpassive) {
              options.passive = false;
              delete options.nonpassive;
            }
            if (options.preventDefault) {
              handler = prevent_default(handler);
              delete options.preventDefault;
            }
            if (options.stopPropagation) {
              handler = stop_propagation(handler);
              delete options.stopPropagation;
            }
          }

          // Listen for the event directly, with the given options.
          const off = listen(node, eventType, handler, options);
          const destructor = () => {
            off();
            const idx = destructors.indexOf(destructor);
            if (idx > -1) {
              destructors.splice(idx, 1);
            }
          };

          destructors.push(destructor);

          // Forward the event from Svelte.
          if (!eventType in forwardDestructors) {
            forwardDestructors[eventType] = listen(node, eventType, forward);
          }

          return destructor;
        };

        for (let i = 0; i < events.length; i++) {
          // Listen to all the events added before mount.
          $on(events[i][0], events[i][1]);
        }

        return {
          destroy: () => {
            // Remove all event listeners.
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }

            // Remove all event forwarders.
            for (let entry of Object.entries(forwardDestructors)) {
              entry[1]();
            }
          },
        };
      };
    }

    function classMap(classObj) {
      return Object.entries(classObj)
        .filter(([name, value]) => name !== '' && value)
        .map(([name]) => name)
        .join(' ');
    }

    /* node_modules/@smui/common/ClassAdder.svelte generated by Svelte v3.38.2 */

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     [smuiClass]: true,     ...smuiClassMap,   })}   {...props}   {...$$restProps}>
    function create_default_slot$a(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     [smuiClass]: true,     ...smuiClassMap,   })}   {...props}   {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[7], .../*use*/ ctx[0]]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				[/*smuiClass*/ ctx[5]]: true,
    				.../*smuiClassMap*/ ctx[4]
    			})
    		},
    		/*props*/ ctx[6],
    		/*$$restProps*/ ctx[8]
    	];

    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$a] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[11](switch_instance);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*forwardEvents, use, classMap, className, smuiClass, smuiClassMap, props, $$restProps*/ 499)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*forwardEvents, use*/ 129 && {
    						use: [/*forwardEvents*/ ctx[7], .../*use*/ ctx[0]]
    					},
    					dirty & /*classMap, className, smuiClass, smuiClassMap*/ 50 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							[/*smuiClass*/ ctx[5]]: true,
    							.../*smuiClassMap*/ ctx[4]
    						})
    					},
    					dirty & /*props*/ 64 && get_spread_object(/*props*/ ctx[6]),
    					dirty & /*$$restProps*/ 256 && get_spread_object(/*$$restProps*/ ctx[8])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 4096) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[11](switch_instance);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[11](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const internals = {
    	component: null,
    	class: "",
    	// The class map maps classes to contexts. The context
    	// should resolve to a Svelte store, and the class
    	// will be added if the Svelte store's value is true.
    	classMap: {},
    	contexts: {},
    	props: {}
    };

    function instance$d($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","component","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClassAdder", slots, ['default']);
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let element;
    	const smuiClass = internals.class;
    	const smuiClassMap = {};
    	const smuiClassUnsubscribes = [];
    	const contexts = internals.contexts;
    	const props = internals.props;
    	let { component = internals.component } = $$props;

    	Object.entries(internals.classMap).forEach(([name, context]) => {
    		const store = getContext(context);

    		if (store && "subscribe" in store) {
    			smuiClassUnsubscribes.push(store.subscribe(value => {
    				$$invalidate(4, smuiClassMap[name] = value, smuiClassMap);
    			}));
    		}
    	});

    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	for (let context in contexts) {
    		if (contexts.hasOwnProperty(context)) {
    			setContext(context, contexts[context]);
    		}
    	}

    	onDestroy(() => {
    		for (const unsubscribe of smuiClassUnsubscribes) {
    			unsubscribe();
    		}
    	});

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("component" in $$new_props) $$invalidate(2, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		internals,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		use,
    		className,
    		element,
    		smuiClass,
    		smuiClassMap,
    		smuiClassUnsubscribes,
    		contexts,
    		props,
    		component,
    		forwardEvents,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("element" in $$props) $$invalidate(3, element = $$new_props.element);
    		if ("component" in $$props) $$invalidate(2, component = $$new_props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		component,
    		element,
    		smuiClassMap,
    		smuiClass,
    		props,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		slots,
    		switch_instance_binding,
    		$$scope
    	];
    }

    class ClassAdder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$p, safe_not_equal, {
    			use: 0,
    			class: 1,
    			component: 2,
    			getElement: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClassAdder",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get use() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[9];
    	}

    	set getElement(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const defaults = { ...internals };

    function classAdderBuilder(props) {
      function Component(...args) {
        Object.assign(internals, defaults, props);
        return new ClassAdder(...args);
      }

      Component.prototype = ClassAdder;

      // SSR support
      if (ClassAdder.$$render) {
        Component.$$render = (...args) =>
          Object.assign(internals, defaults, props) && ClassAdder.$$render(...args);
      }
      if (ClassAdder.render) {
        Component.render = (...args) =>
          Object.assign(internals, defaults, props) && ClassAdder.render(...args);
      }

      return Component;
    }

    function dispatch(
      element,
      eventType,
      detail = {},
      eventInit = { bubbles: true }
    ) {
      if (typeof Event !== 'undefined' && element) {
        const event = new Event(eventType, eventInit);
        event.detail = detail;
        const el = 'getElement' in element ? element.getElement() : element;
        el.dispatchEvent(event);
        return event;
      }
    }

    function exclude(obj, keys) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const cashIndex = name.indexOf('$');
        if (
          cashIndex !== -1 &&
          keys.indexOf(name.substring(0, cashIndex + 1)) !== -1
        ) {
          continue;
        }
        if (keys.indexOf(name) !== -1) {
          continue;
        }
        newObj[name] = obj[name];
      }

      return newObj;
    }

    function prefixFilter(obj, prefix) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (name.substring(0, prefix.length) === prefix) {
          newObj[name.substring(prefix.length)] = obj[name];
        }
      }

      return newObj;
    }

    function useActions(node, actions) {
      let objects = [];

      if (actions) {
        for (let i = 0; i < actions.length; i++) {
          const isArray = Array.isArray(actions[i]);
          const action = isArray ? actions[i][0] : actions[i];
          if (isArray && actions[i].length > 1) {
            objects.push(action(node, actions[i][1]));
          } else {
            objects.push(action(node));
          }
        }
      }

      return {
        update(actions) {
          if (((actions && actions.length) || 0) != objects.length) {
            throw new Error('You must not change the length of an actions array.');
          }

          if (actions) {
            for (let i = 0; i < actions.length; i++) {
              if (objects[i] && 'update' in objects[i]) {
                const isArray = Array.isArray(actions[i]);
                if (isArray && actions[i].length > 1) {
                  objects[i].update(actions[i][1]);
                } else {
                  objects[i].update();
                }
              }
            }
          }
        },

        destroy() {
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] && 'destroy' in objects[i]) {
              objects[i].destroy();
            }
          }
        },
      };
    }

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        supportsCssVars =
            explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus;
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: false,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive$1(globalObj) {
        if (globalObj === void 0) { globalObj = window; }
        return supportsPassiveOption(globalObj) ?
            { passive: true } :
            false;
    }
    function supportsPassiveOption(globalObj) {
        if (globalObj === void 0) { globalObj = window; }
        // See
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
        var passiveSupported = false;
        try {
            var options = {
                // This function will be called when the browser
                // attempts to access the passive property.
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            var handler = function () { };
            globalObj.document.addEventListener('test', handler, options);
            globalObj.document.removeEventListener('test', handler, options);
        }
        catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    var events = /*#__PURE__*/Object.freeze({
        __proto__: null,
        applyPassive: applyPassive$1
    });

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * @fileoverview A "ponyfill" is a polyfill that doesn't modify the global prototype chain.
     * This makes ponyfills safer than traditional polyfills, especially for libraries like MDC.
     */
    function closest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        var el = element;
        while (el) {
            if (matches$1(el, selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }
    function matches$1(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }
    /**
     * Used to compute the estimated scroll width of elements. When an element is
     * hidden due to display: none; being applied to a parent element, the width is
     * returned as 0. However, the element will have a true width once no longer
     * inside a display: none context. This method computes an estimated width when
     * the element is hidden or returns the true width when the element is visble.
     * @param {Element} element the element whose width to estimate
     */
    function estimateScrollWidth(element) {
        // Check the offsetParent. If the element inherits display: none from any
        // parent, the offsetParent property will be null (see
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent).
        // This check ensures we only clone the node when necessary.
        var htmlEl = element;
        if (htmlEl.offsetParent !== null) {
            return htmlEl.scrollWidth;
        }
        var clone = htmlEl.cloneNode(true);
        clone.style.setProperty('position', 'absolute');
        clone.style.setProperty('transform', 'translate(-9999px, -9999px)');
        document.documentElement.appendChild(clone);
        var scrollWidth = clone.scrollWidth;
        document.documentElement.removeChild(clone);
        return scrollWidth;
    }

    var ponyfill = /*#__PURE__*/Object.freeze({
        __proto__: null,
        closest: closest,
        matches: matches$1,
        estimateScrollWidth: estimateScrollWidth
    });

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$b = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings$a = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers$6 = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300, // Delay between touch and simulated mouse events on touch devices
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCRippleFoundation.defaultAdapter), adapter)) || this;
            _this.activationAnimationHasEnded_ = false;
            _this.activationTimer_ = 0;
            _this.fgDeactivationRemovalTimer_ = 0;
            _this.fgScale_ = '0';
            _this.frame_ = { width: 0, height: 0 };
            _this.initialSize_ = 0;
            _this.layoutFrame_ = 0;
            _this.maxRadius_ = 0;
            _this.unboundedCoords_ = { left: 0, top: 0 };
            _this.activationState_ = _this.defaultActivationState_();
            _this.activationTimerCallback_ = function () {
                _this.activationAnimationHasEnded_ = true;
                _this.runDeactivationUXLogicIfReady_();
            };
            _this.activateHandler_ = function (e) { return _this.activate_(e); };
            _this.deactivateHandler_ = function () { return _this.deactivate_(); };
            _this.focusHandler_ = function () { return _this.handleFocus(); };
            _this.blurHandler_ = function () { return _this.handleBlur(); };
            _this.resizeHandler_ = function () { return _this.layout(); };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$b;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings$a;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers$6;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: false,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple_();
            this.registerRootHandlers_(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter.addClass(ROOT_1);
                    if (_this.adapter.isUnbounded()) {
                        _this.adapter.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal_();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple_()) {
                if (this.activationTimer_) {
                    clearTimeout(this.activationTimer_);
                    this.activationTimer_ = 0;
                    this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer_) {
                    clearTimeout(this.fgDeactivationRemovalTimer_);
                    this.fgDeactivationRemovalTimer_ = 0;
                    this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter.removeClass(ROOT_2);
                    _this.adapter.removeClass(UNBOUNDED_2);
                    _this.removeCssVars_();
                });
            }
            this.deregisterRootHandlers_();
            this.deregisterDeactivationHandlers_();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activate_(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivate_();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame_) {
                cancelAnimationFrame(this.layoutFrame_);
            }
            this.layoutFrame_ = requestAnimationFrame(function () {
                _this.layoutInternal_();
                _this.layoutFrame_ = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter.addClass(UNBOUNDED);
            }
            else {
                this.adapter.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.adapter.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.adapter.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
            return this.adapter.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState_ = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
            var _this = this;
            if (supportsPressRipple) {
                ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter.registerInteractionHandler(evtType, _this.activateHandler_);
                });
                if (this.adapter.isUnbounded()) {
                    this.adapter.registerResizeHandler(this.resizeHandler_);
                }
            }
            this.adapter.registerInteractionHandler('focus', this.focusHandler_);
            this.adapter.registerInteractionHandler('blur', this.blurHandler_);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
            var _this = this;
            if (evt.type === 'keydown') {
                this.adapter.registerInteractionHandler('keyup', this.deactivateHandler_);
            }
            else {
                POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
                });
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
            var _this = this;
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter.deregisterInteractionHandler(evtType, _this.activateHandler_);
            });
            this.adapter.deregisterInteractionHandler('focus', this.focusHandler_);
            this.adapter.deregisterInteractionHandler('blur', this.blurHandler_);
            if (this.adapter.isUnbounded()) {
                this.adapter.deregisterResizeHandler(this.resizeHandler_);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
            var _this = this;
            this.adapter.deregisterInteractionHandler('keyup', this.deactivateHandler_);
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        };
        MDCRippleFoundation.prototype.removeCssVars_ = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activate_ = function (evt) {
            var _this = this;
            if (this.adapter.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState_;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent_;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined &&
                activatedTargets.length > 0 &&
                activatedTargets.some(function (target) { return _this.adapter.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState_();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers_(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation_();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation_();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState_ = _this.defaultActivationState_();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ?
                this.adapter.isSurfaceActive() :
                true;
        };
        MDCRippleFoundation.prototype.animateActivation_ = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal_();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer_);
            clearTimeout(this.fgDeactivationRemovalTimer_);
            this.rmBoundedActivationClasses_();
            this.adapter.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter.computeBoundingRect();
            this.adapter.addClass(FG_ACTIVATION);
            this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
            var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter.getWindowPageOffset(), this.adapter.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame_.width / 2,
                    y: this.frame_.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize_ / 2),
                y: startPoint.y - (this.initialSize_ / 2),
            };
            var endPoint = {
                x: (this.frame_.width / 2) - (this.initialSize_ / 2),
                y: (this.frame_.height / 2) - (this.initialSize_ / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded_) {
                this.rmBoundedActivationClasses_();
                this.adapter.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                    _this.adapter.removeClass(FG_DEACTIVATION);
                }, numbers$6.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded_ = false;
            this.adapter.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState_ = function () {
            var _this = this;
            this.previousActivationEvent_ = this.activationState_.activationEvent;
            this.activationState_ = this.defaultActivationState_();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivate_ = function () {
            var _this = this;
            var activationState = this.activationState_;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
                this.resetActivationState_();
            }
            else {
                this.deregisterDeactivationHandlers_();
                requestAnimationFrame(function () {
                    _this.activationState_.hasDeactivationUXRun = true;
                    _this.animateDeactivation_(state);
                    _this.resetActivationState_();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady_();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal_ = function () {
            var _this = this;
            this.frame_ = this.adapter.computeBoundingRect();
            var maxDim = Math.max(this.frame_.height, this.frame_.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius_ = this.adapter.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            var initialSize = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            // Unbounded ripple size should always be even number to equally center align.
            if (this.adapter.isUnbounded() && initialSize % 2 !== 0) {
                this.initialSize_ = initialSize - 1;
            }
            else {
                this.initialSize_ = initialSize;
            }
            this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
            this.updateLayoutCssVars_();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
            this.adapter.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
            if (this.adapter.isUnbounded()) {
                this.unboundedCoords_ = {
                    left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                    top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
                };
                this.adapter.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
                this.adapter.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * KEY provides normalized string values for keys.
     */
    var KEY = {
        UNKNOWN: 'Unknown',
        BACKSPACE: 'Backspace',
        ENTER: 'Enter',
        SPACEBAR: 'Spacebar',
        PAGE_UP: 'PageUp',
        PAGE_DOWN: 'PageDown',
        END: 'End',
        HOME: 'Home',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_UP: 'ArrowUp',
        ARROW_RIGHT: 'ArrowRight',
        ARROW_DOWN: 'ArrowDown',
        DELETE: 'Delete',
        ESCAPE: 'Escape',
        TAB: 'Tab',
    };
    var normalizedKeys = new Set();
    // IE11 has no support for new Map with iterable so we need to initialize this
    // by hand.
    normalizedKeys.add(KEY.BACKSPACE);
    normalizedKeys.add(KEY.ENTER);
    normalizedKeys.add(KEY.SPACEBAR);
    normalizedKeys.add(KEY.PAGE_UP);
    normalizedKeys.add(KEY.PAGE_DOWN);
    normalizedKeys.add(KEY.END);
    normalizedKeys.add(KEY.HOME);
    normalizedKeys.add(KEY.ARROW_LEFT);
    normalizedKeys.add(KEY.ARROW_UP);
    normalizedKeys.add(KEY.ARROW_RIGHT);
    normalizedKeys.add(KEY.ARROW_DOWN);
    normalizedKeys.add(KEY.DELETE);
    normalizedKeys.add(KEY.ESCAPE);
    normalizedKeys.add(KEY.TAB);
    var KEY_CODE = {
        BACKSPACE: 8,
        ENTER: 13,
        SPACEBAR: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40,
        DELETE: 46,
        ESCAPE: 27,
        TAB: 9,
    };
    var mappedKeyCodes = new Map();
    // IE11 has no support for new Map with iterable so we need to initialize this
    // by hand.
    mappedKeyCodes.set(KEY_CODE.BACKSPACE, KEY.BACKSPACE);
    mappedKeyCodes.set(KEY_CODE.ENTER, KEY.ENTER);
    mappedKeyCodes.set(KEY_CODE.SPACEBAR, KEY.SPACEBAR);
    mappedKeyCodes.set(KEY_CODE.PAGE_UP, KEY.PAGE_UP);
    mappedKeyCodes.set(KEY_CODE.PAGE_DOWN, KEY.PAGE_DOWN);
    mappedKeyCodes.set(KEY_CODE.END, KEY.END);
    mappedKeyCodes.set(KEY_CODE.HOME, KEY.HOME);
    mappedKeyCodes.set(KEY_CODE.ARROW_LEFT, KEY.ARROW_LEFT);
    mappedKeyCodes.set(KEY_CODE.ARROW_UP, KEY.ARROW_UP);
    mappedKeyCodes.set(KEY_CODE.ARROW_RIGHT, KEY.ARROW_RIGHT);
    mappedKeyCodes.set(KEY_CODE.ARROW_DOWN, KEY.ARROW_DOWN);
    mappedKeyCodes.set(KEY_CODE.DELETE, KEY.DELETE);
    mappedKeyCodes.set(KEY_CODE.ESCAPE, KEY.ESCAPE);
    mappedKeyCodes.set(KEY_CODE.TAB, KEY.TAB);
    var navigationKeys = new Set();
    // IE11 has no support for new Set with iterable so we need to initialize this
    // by hand.
    navigationKeys.add(KEY.PAGE_UP);
    navigationKeys.add(KEY.PAGE_DOWN);
    navigationKeys.add(KEY.END);
    navigationKeys.add(KEY.HOME);
    navigationKeys.add(KEY.ARROW_LEFT);
    navigationKeys.add(KEY.ARROW_UP);
    navigationKeys.add(KEY.ARROW_RIGHT);
    navigationKeys.add(KEY.ARROW_DOWN);
    /**
     * normalizeKey returns the normalized string for a navigational action.
     */
    function normalizeKey(evt) {
        var key = evt.key;
        // If the event already has a normalized key, return it
        if (normalizedKeys.has(key)) {
            return key;
        }
        // tslint:disable-next-line:deprecation
        var mappedKey = mappedKeyCodes.get(evt.keyCode);
        if (mappedKey) {
            return mappedKey;
        }
        return KEY.UNKNOWN;
    }

    const { applyPassive } = events;
    const { matches } = ponyfill;

    function Ripple(
      node,
      {
        ripple = true,
        surface = false,
        unbounded = false,
        disabled = false,
        color = null,
        active = null,
        eventTarget = null,
        activeTarget = null,
        addClass = (className) => node.classList.add(className),
        removeClass = (className) => node.classList.remove(className),
        addStyle = (name, value) => node.style.setProperty(name, value),
        initPromise = Promise.resolve(),
      } = {}
    ) {
      let instance;
      let addLayoutListener = getContext('SMUI:addLayoutListener');
      let removeLayoutListener;
      let oldActive = active;
      let oldEventTarget = eventTarget;
      let oldActiveTarget = activeTarget;

      function handleProps() {
        if (surface) {
          addClass('mdc-ripple-surface');
          if (color === 'primary') {
            addClass('smui-ripple-surface--primary');
            removeClass('smui-ripple-surface--secondary');
          } else if (color === 'secondary') {
            removeClass('smui-ripple-surface--primary');
            addClass('smui-ripple-surface--secondary');
          } else {
            removeClass('smui-ripple-surface--primary');
            removeClass('smui-ripple-surface--secondary');
          }
        }

        // Handle activation first.
        if (instance && oldActive !== active) {
          oldActive = active;
          if (active) {
            instance.activate();
          } else if (active === false) {
            instance.deactivate();
          }
        }

        // Then create/destroy an instance.
        if (ripple && !instance) {
          instance = new MDCRippleFoundation({
            addClass,
            browserSupportsCssVars: () => supportsCssVariables(window),
            computeBoundingRect: () => node.getBoundingClientRect(),
            containsEventTarget: (target) => node.contains(target),
            deregisterDocumentInteractionHandler: (evtType, handler) =>
              document.documentElement.removeEventListener(
                evtType,
                handler,
                applyPassive()
              ),
            deregisterInteractionHandler: (evtType, handler) =>
              (eventTarget || node).removeEventListener(
                evtType,
                handler,
                applyPassive()
              ),
            deregisterResizeHandler: (handler) =>
              window.removeEventListener('resize', handler),
            getWindowPageOffset: () => ({
              x: window.pageXOffset,
              y: window.pageYOffset,
            }),
            isSurfaceActive: () =>
              active == null ? matches(activeTarget || node, ':active') : active,
            isSurfaceDisabled: () => !!disabled,
            isUnbounded: () => !!unbounded,
            registerDocumentInteractionHandler: (evtType, handler) =>
              document.documentElement.addEventListener(
                evtType,
                handler,
                applyPassive()
              ),
            registerInteractionHandler: (evtType, handler) =>
              (eventTarget || node).addEventListener(
                evtType,
                handler,
                applyPassive()
              ),
            registerResizeHandler: (handler) =>
              window.addEventListener('resize', handler),
            removeClass,
            updateCssVariable: addStyle,
          });

          initPromise.then(() => {
            instance.init();
            instance.setUnbounded(unbounded);
          });
        } else if (instance && !ripple) {
          initPromise.then(() => {
            instance.destroy();
            instance = null;
          });
        }

        // Now handle event/active targets
        if (
          instance &&
          (oldEventTarget !== eventTarget || oldActiveTarget !== activeTarget)
        ) {
          oldEventTarget = eventTarget;
          oldActiveTarget = activeTarget;

          instance.destroy();
          requestAnimationFrame(() => {
            if (instance) {
              instance.init();
              instance.setUnbounded(unbounded);
            }
          });
        }

        if (!ripple && unbounded) {
          addClass('mdc-ripple-upgraded--unbounded');
        }
      }

      handleProps();

      if (addLayoutListener) {
        removeLayoutListener = addLayoutListener(layout);
      }

      function layout() {
        if (instance) {
          instance.layout();
        }
      }

      return {
        update(props) {
          ({
            ripple,
            surface,
            unbounded,
            disabled,
            color,
            active,
            eventTarget,
            activeTarget,
            addClass,
            removeClass,
            addStyle,
            initPromise,
          } = {
            ripple: true,
            surface: false,
            unbounded: false,
            disabled: false,
            color: null,
            active: null,
            eventTarget: null,
            activeTarget: null,
            addClass: (className) => node.classList.add(className),
            removeClass: (className) => node.classList.remove(className),
            addStyle: (name, value) => node.style.setProperty(name, value),
            initPromise: Promise.resolve(),
            ...props,
          });
          handleProps();
        },

        destroy() {
          if (instance) {
            instance.destroy();
            instance = null;
            removeClass('mdc-ripple-surface');
            removeClass('smui-ripple-surface--primary');
            removeClass('smui-ripple-surface--secondary');
          }

          if (removeLayoutListener) {
            removeLayoutListener();
          }
        },
      };
    }

    /* node_modules/@smui/common/A.svelte generated by Svelte v3.38.2 */
    const file$k = "node_modules/@smui/common/A.svelte";

    function create_fragment$o(ctx) {
    	let a;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let a_levels = [{ href: /*href*/ ctx[0] }, /*$$restProps*/ ctx[4]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$k, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[8](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, a, /*use*/ ctx[1])),
    					action_destroyer(/*forwardEvents*/ ctx[3].call(null, a))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				dirty & /*$$restProps*/ 16 && /*$$restProps*/ ctx[4]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const omit_props_names = ["href","use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("A", slots, ['default']);
    	let { href = "javascript:void(0);" } = $$props;
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element = null;

    	function getElement() {
    		return element;
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("href" in $$new_props) $$invalidate(0, href = $$new_props.href);
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		href,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("element" in $$props) $$invalidate(2, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		href,
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		a_binding
    	];
    }

    class A extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$o, safe_not_equal, { href: 0, use: 1, getElement: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "A",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get href() {
    		throw new Error("<A>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<A>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[5];
    	}

    	set getElement(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Button.svelte generated by Svelte v3.38.2 */
    const file$j = "node_modules/@smui/common/Button.svelte";

    function create_fragment$n(ctx) {
    	let button;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let button_levels = [/*$$restProps*/ ctx[3]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			/*button_binding*/ ctx[7](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, button, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, button))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element = null;

    	function getElement() {
    		return element;
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		button_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$n, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/button/Button.svelte generated by Svelte v3.38.2 */
    const file$i = "node_modules/@smui/button/Button.svelte";

    // (50:10) {#if touch}
    function create_if_block$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "mdc-button__touch");
    			add_location(div, file$i, 49, 21, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(50:10) {#if touch}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: false,         color,         disabled: !!$$restProps.disabled,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-button': true,     'mdc-button--raised': variant === 'raised',     'mdc-button--unelevated': variant === 'unelevated',     'mdc-button--outlined': variant === 'outlined',     'smui-button--color-secondary': color === 'secondary',     'mdc-button--touch': touch,     'mdc-card__action': context === 'card:action',     'mdc-card__action--button': context === 'card:action',     'mdc-dialog__button': context === 'dialog:action',     'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',     'mdc-top-app-bar__action-item': context === 'top-app-bar:action',     'mdc-snackbar__action': context === 'snackbar:actions',     'mdc-banner__secondary-action': context === 'banner' && secondary,     'mdc-banner__primary-action': context === 'banner' && !secondary,     'mdc-tooltip__action': context === 'tooltip:rich-actions',     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...actionProp}   {...defaultProp}   {...secondaryProp}   {href}   on:click={handleClick}   {...$$restProps}   >
    function create_default_slot$9(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[28], null);
    	let if_block = /*touch*/ ctx[6] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "mdc-button__ripple");
    			add_location(div, file$i, 48, 3, 1466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 268435456)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[28], dirty, null, null);
    				}
    			}

    			if (/*touch*/ ctx[6]) {
    				if (if_block) ; else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: false,         color,         disabled: !!$$restProps.disabled,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-button': true,     'mdc-button--raised': variant === 'raised',     'mdc-button--unelevated': variant === 'unelevated',     'mdc-button--outlined': variant === 'outlined',     'smui-button--color-secondary': color === 'secondary',     'mdc-button--touch': touch,     'mdc-card__action': context === 'card:action',     'mdc-card__action--button': context === 'card:action',     'mdc-dialog__button': context === 'dialog:action',     'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',     'mdc-top-app-bar__action-item': context === 'top-app-bar:action',     'mdc-snackbar__action': context === 'snackbar:actions',     'mdc-banner__secondary-action': context === 'banner' && secondary,     'mdc-banner__primary-action': context === 'banner' && !secondary,     'mdc-tooltip__action': context === 'tooltip:rich-actions',     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...actionProp}   {...defaultProp}   {...secondaryProp}   {href}   on:click={handleClick}   {...$$restProps}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [
    				[
    					Ripple,
    					{
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4],
    						disabled: !!/*$$restProps*/ ctx[22].disabled,
    						addClass: /*addClass*/ ctx[18],
    						removeClass: /*removeClass*/ ctx[19],
    						addStyle: /*addStyle*/ ctx[20]
    					}
    				],
    				/*forwardEvents*/ ctx[16],
    				.../*use*/ ctx[0]
    			]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-button": true,
    				"mdc-button--raised": /*variant*/ ctx[5] === "raised",
    				"mdc-button--unelevated": /*variant*/ ctx[5] === "unelevated",
    				"mdc-button--outlined": /*variant*/ ctx[5] === "outlined",
    				"smui-button--color-secondary": /*color*/ ctx[4] === "secondary",
    				"mdc-button--touch": /*touch*/ ctx[6],
    				"mdc-card__action": /*context*/ ctx[17] === "card:action",
    				"mdc-card__action--button": /*context*/ ctx[17] === "card:action",
    				"mdc-dialog__button": /*context*/ ctx[17] === "dialog:action",
    				"mdc-top-app-bar__navigation-icon": /*context*/ ctx[17] === "top-app-bar:navigation",
    				"mdc-top-app-bar__action-item": /*context*/ ctx[17] === "top-app-bar:action",
    				"mdc-snackbar__action": /*context*/ ctx[17] === "snackbar:actions",
    				"mdc-banner__secondary-action": /*context*/ ctx[17] === "banner" && /*secondary*/ ctx[8],
    				"mdc-banner__primary-action": /*context*/ ctx[17] === "banner" && !/*secondary*/ ctx[8],
    				"mdc-tooltip__action": /*context*/ ctx[17] === "tooltip:rich-actions",
    				.../*internalClasses*/ ctx[11]
    			})
    		},
    		{
    			style: Object.entries(/*internalStyles*/ ctx[12]).map(func$9).concat([/*style*/ ctx[2]]).join(" ")
    		},
    		/*actionProp*/ ctx[13],
    		/*defaultProp*/ ctx[14],
    		/*secondaryProp*/ ctx[15],
    		{ href: /*href*/ ctx[7] },
    		/*$$restProps*/ ctx[22]
    	];

    	var switch_value = /*component*/ ctx[9];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$9] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[27](switch_instance);
    		switch_instance.$on("click", /*handleClick*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*Ripple, ripple, color, $$restProps, addClass, removeClass, addStyle, forwardEvents, use, classMap, className, variant, touch, context, secondary, internalClasses, Object, internalStyles, style, actionProp, defaultProp, secondaryProp, href*/ 6289919)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*Ripple, ripple, color, $$restProps, addClass, removeClass, addStyle, forwardEvents, use*/ 6094873 && {
    						use: [
    							[
    								Ripple,
    								{
    									ripple: /*ripple*/ ctx[3],
    									unbounded: false,
    									color: /*color*/ ctx[4],
    									disabled: !!/*$$restProps*/ ctx[22].disabled,
    									addClass: /*addClass*/ ctx[18],
    									removeClass: /*removeClass*/ ctx[19],
    									addStyle: /*addStyle*/ ctx[20]
    								}
    							],
    							/*forwardEvents*/ ctx[16],
    							.../*use*/ ctx[0]
    						]
    					},
    					dirty & /*classMap, className, variant, color, touch, context, secondary, internalClasses*/ 133490 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							"mdc-button": true,
    							"mdc-button--raised": /*variant*/ ctx[5] === "raised",
    							"mdc-button--unelevated": /*variant*/ ctx[5] === "unelevated",
    							"mdc-button--outlined": /*variant*/ ctx[5] === "outlined",
    							"smui-button--color-secondary": /*color*/ ctx[4] === "secondary",
    							"mdc-button--touch": /*touch*/ ctx[6],
    							"mdc-card__action": /*context*/ ctx[17] === "card:action",
    							"mdc-card__action--button": /*context*/ ctx[17] === "card:action",
    							"mdc-dialog__button": /*context*/ ctx[17] === "dialog:action",
    							"mdc-top-app-bar__navigation-icon": /*context*/ ctx[17] === "top-app-bar:navigation",
    							"mdc-top-app-bar__action-item": /*context*/ ctx[17] === "top-app-bar:action",
    							"mdc-snackbar__action": /*context*/ ctx[17] === "snackbar:actions",
    							"mdc-banner__secondary-action": /*context*/ ctx[17] === "banner" && /*secondary*/ ctx[8],
    							"mdc-banner__primary-action": /*context*/ ctx[17] === "banner" && !/*secondary*/ ctx[8],
    							"mdc-tooltip__action": /*context*/ ctx[17] === "tooltip:rich-actions",
    							.../*internalClasses*/ ctx[11]
    						})
    					},
    					dirty & /*Object, internalStyles, style*/ 4100 && {
    						style: Object.entries(/*internalStyles*/ ctx[12]).map(func$9).concat([/*style*/ ctx[2]]).join(" ")
    					},
    					dirty & /*actionProp*/ 8192 && get_spread_object(/*actionProp*/ ctx[13]),
    					dirty & /*defaultProp*/ 16384 && get_spread_object(/*defaultProp*/ ctx[14]),
    					dirty & /*secondaryProp*/ 32768 && get_spread_object(/*secondaryProp*/ ctx[15]),
    					dirty & /*href*/ 128 && { href: /*href*/ ctx[7] },
    					dirty & /*$$restProps*/ 4194304 && get_spread_object(/*$$restProps*/ ctx[22])
    				])
    			: {};

    			if (dirty & /*$$scope, touch*/ 268435520) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[9])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[27](switch_instance);
    					switch_instance.$on("click", /*handleClick*/ ctx[21]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[27](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$9 = ([name, value]) => `${name}: ${value};`;

    function instance$a($$self, $$props, $$invalidate) {
    	let actionProp;
    	let defaultProp;
    	let secondaryProp;

    	const omit_props_names = [
    		"use","class","style","ripple","color","variant","touch","href","action","default","secondary","component","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { style = "" } = $$props;
    	let { ripple = true } = $$props;
    	let { color = "primary" } = $$props;
    	let { variant = "text" } = $$props;
    	let { touch = false } = $$props;
    	let { href = null } = $$props;
    	let { action = "close" } = $$props;
    	let { default: defaultAction = false } = $$props;
    	let { secondary = false } = $$props;
    	let element;
    	let internalClasses = {};
    	let internalStyles = {};
    	let context = getContext("SMUI:button:context");
    	let { component = href == null ? Button : A } = $$props;
    	setContext("SMUI:label:context", "button");
    	setContext("SMUI:icon:context", "button");

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete internalStyles[name];
    				$$invalidate(12, internalStyles);
    			} else {
    				$$invalidate(12, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function handleClick() {
    		if (context === "banner") {
    			dispatch(getElement(), secondary
    			? "SMUI:banner:button:secondaryActionClick"
    			: "SMUI:banner:button:primaryActionClick");
    		}
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(10, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(29, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(22, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(2, style = $$new_props.style);
    		if ("ripple" in $$new_props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("variant" in $$new_props) $$invalidate(5, variant = $$new_props.variant);
    		if ("touch" in $$new_props) $$invalidate(6, touch = $$new_props.touch);
    		if ("href" in $$new_props) $$invalidate(7, href = $$new_props.href);
    		if ("action" in $$new_props) $$invalidate(23, action = $$new_props.action);
    		if ("default" in $$new_props) $$invalidate(24, defaultAction = $$new_props.default);
    		if ("secondary" in $$new_props) $$invalidate(8, secondary = $$new_props.secondary);
    		if ("component" in $$new_props) $$invalidate(9, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(28, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		Ripple,
    		A,
    		Button,
    		forwardEvents,
    		use,
    		className,
    		style,
    		ripple,
    		color,
    		variant,
    		touch,
    		href,
    		action,
    		defaultAction,
    		secondary,
    		element,
    		internalClasses,
    		internalStyles,
    		context,
    		component,
    		addClass,
    		removeClass,
    		addStyle,
    		handleClick,
    		getElement,
    		actionProp,
    		defaultProp,
    		secondaryProp
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(29, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("style" in $$props) $$invalidate(2, style = $$new_props.style);
    		if ("ripple" in $$props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("variant" in $$props) $$invalidate(5, variant = $$new_props.variant);
    		if ("touch" in $$props) $$invalidate(6, touch = $$new_props.touch);
    		if ("href" in $$props) $$invalidate(7, href = $$new_props.href);
    		if ("action" in $$props) $$invalidate(23, action = $$new_props.action);
    		if ("defaultAction" in $$props) $$invalidate(24, defaultAction = $$new_props.defaultAction);
    		if ("secondary" in $$props) $$invalidate(8, secondary = $$new_props.secondary);
    		if ("element" in $$props) $$invalidate(10, element = $$new_props.element);
    		if ("internalClasses" in $$props) $$invalidate(11, internalClasses = $$new_props.internalClasses);
    		if ("internalStyles" in $$props) $$invalidate(12, internalStyles = $$new_props.internalStyles);
    		if ("context" in $$props) $$invalidate(17, context = $$new_props.context);
    		if ("component" in $$props) $$invalidate(9, component = $$new_props.component);
    		if ("actionProp" in $$props) $$invalidate(13, actionProp = $$new_props.actionProp);
    		if ("defaultProp" in $$props) $$invalidate(14, defaultProp = $$new_props.defaultProp);
    		if ("secondaryProp" in $$props) $$invalidate(15, secondaryProp = $$new_props.secondaryProp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(13, actionProp = context === "dialog:action" && action != null
    		? { "data-mdc-dialog-action": action }
    		: { action: $$props.action });

    		$$invalidate(14, defaultProp = context === "dialog:action" && defaultAction
    		? { "data-mdc-dialog-button-default": "" }
    		: { default: $$props.default });

    		$$invalidate(15, secondaryProp = context === "banner"
    		? {}
    		: { secondary: $$props.secondary });
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		style,
    		ripple,
    		color,
    		variant,
    		touch,
    		href,
    		secondary,
    		component,
    		element,
    		internalClasses,
    		internalStyles,
    		actionProp,
    		defaultProp,
    		secondaryProp,
    		forwardEvents,
    		context,
    		addClass,
    		removeClass,
    		addStyle,
    		handleClick,
    		$$restProps,
    		action,
    		defaultAction,
    		getElement,
    		slots,
    		switch_instance_binding,
    		$$scope
    	];
    }

    class Button_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$m, safe_not_equal, {
    			use: 0,
    			class: 1,
    			style: 2,
    			ripple: 3,
    			color: 4,
    			variant: 5,
    			touch: 6,
    			href: 7,
    			action: 23,
    			default: 24,
    			secondary: 8,
    			component: 9,
    			getElement: 25
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button_1",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touch() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touch(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get default() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set default(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[25];
    	}

    	set getElement(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Span.svelte generated by Svelte v3.38.2 */
    const file$h = "node_modules/@smui/common/Span.svelte";

    function create_fragment$l(ctx) {
    	let span;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let span_levels = [/*$$restProps*/ ctx[3]];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[7](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Span", slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element = null;

    	function getElement() {
    		return element;
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		span_binding
    	];
    }

    class Span extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$l, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Span",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get use() {
    		throw new Error("<Span>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Span>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Span>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/CommonLabel.svelte generated by Svelte v3.38.2 */

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-button__label': context === 'button',     'mdc-fab__label': context === 'fab',     'mdc-tab__text-label': context === 'tab',     'mdc-image-list__label': context === 'image-list',     'mdc-snackbar__label': context === 'snackbar',     'mdc-banner__text': context === 'banner',     'mdc-segmented-button__label': context === 'segmented-button',     'mdc-data-table__pagination-rows-per-page-label':       context === 'data-table:pagination',     'mdc-data-table__header-cell-label':       context === 'data-table:sortable-header-cell',   })}   {...context === 'snackbar' ? { 'aria-atomic': 'false' } : {}}   {tabindex}   {...$$restProps}>
    function create_default_slot$8(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-button__label': context === 'button',     'mdc-fab__label': context === 'fab',     'mdc-tab__text-label': context === 'tab',     'mdc-image-list__label': context === 'image-list',     'mdc-snackbar__label': context === 'snackbar',     'mdc-banner__text': context === 'banner',     'mdc-segmented-button__label': context === 'segmented-button',     'mdc-data-table__pagination-rows-per-page-label':       context === 'data-table:pagination',     'mdc-data-table__header-cell-label':       context === 'data-table:sortable-header-cell',   })}   {...context === 'snackbar' ? { 'aria-atomic': 'false' } : {}}   {tabindex}   {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-button__label": /*context*/ ctx[5] === "button",
    				"mdc-fab__label": /*context*/ ctx[5] === "fab",
    				"mdc-tab__text-label": /*context*/ ctx[5] === "tab",
    				"mdc-image-list__label": /*context*/ ctx[5] === "image-list",
    				"mdc-snackbar__label": /*context*/ ctx[5] === "snackbar",
    				"mdc-banner__text": /*context*/ ctx[5] === "banner",
    				"mdc-segmented-button__label": /*context*/ ctx[5] === "segmented-button",
    				"mdc-data-table__pagination-rows-per-page-label": /*context*/ ctx[5] === "data-table:pagination",
    				"mdc-data-table__header-cell-label": /*context*/ ctx[5] === "data-table:sortable-header-cell"
    			})
    		},
    		/*context*/ ctx[5] === "snackbar"
    		? { "aria-atomic": "false" }
    		: {},
    		{ tabindex: /*tabindex*/ ctx[6] },
    		/*$$restProps*/ ctx[7]
    	];

    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$8] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[10](switch_instance);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*forwardEvents, use, classMap, className, context, tabindex, $$restProps*/ 243)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*forwardEvents, use*/ 17 && {
    						use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    					},
    					dirty & /*classMap, className, context*/ 34 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							"mdc-button__label": /*context*/ ctx[5] === "button",
    							"mdc-fab__label": /*context*/ ctx[5] === "fab",
    							"mdc-tab__text-label": /*context*/ ctx[5] === "tab",
    							"mdc-image-list__label": /*context*/ ctx[5] === "image-list",
    							"mdc-snackbar__label": /*context*/ ctx[5] === "snackbar",
    							"mdc-banner__text": /*context*/ ctx[5] === "banner",
    							"mdc-segmented-button__label": /*context*/ ctx[5] === "segmented-button",
    							"mdc-data-table__pagination-rows-per-page-label": /*context*/ ctx[5] === "data-table:pagination",
    							"mdc-data-table__header-cell-label": /*context*/ ctx[5] === "data-table:sortable-header-cell"
    						})
    					},
    					dirty & /*context*/ 32 && get_spread_object(/*context*/ ctx[5] === "snackbar"
    					? { "aria-atomic": "false" }
    					: {}),
    					dirty & /*tabindex*/ 64 && { tabindex: /*tabindex*/ ctx[6] },
    					dirty & /*$$restProps*/ 128 && get_spread_object(/*$$restProps*/ ctx[7])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 2048) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[10](switch_instance);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[10](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","component","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CommonLabel", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let element;
    	let { component = Span } = $$props;
    	const context = getContext("SMUI:label:context");
    	const tabindex = getContext("SMUI:label:tabindex");

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("component" in $$new_props) $$invalidate(2, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		Span,
    		forwardEvents,
    		use,
    		className,
    		element,
    		component,
    		context,
    		tabindex,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("element" in $$props) $$invalidate(3, element = $$new_props.element);
    		if ("component" in $$props) $$invalidate(2, component = $$new_props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		component,
    		element,
    		forwardEvents,
    		context,
    		tabindex,
    		$$restProps,
    		getElement,
    		slots,
    		switch_instance_binding,
    		$$scope
    	];
    }

    class CommonLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$k, safe_not_equal, {
    			use: 0,
    			class: 1,
    			component: 2,
    			getElement: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CommonLabel",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get use() {
    		throw new Error("<CommonLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<CommonLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<CommonLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[8];
    	}

    	set getElement(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/card/Card.svelte generated by Svelte v3.38.2 */

    const file$g = "node_modules/@smui/card/Card.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-card": true,
    				"mdc-card--outlined": /*variant*/ ctx[2] === "outlined",
    				"smui-card--padded": /*padded*/ ctx[3]
    			})
    		},
    		/*$$restProps*/ ctx[6]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[10](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[5].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, variant, padded*/ 14 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					"mdc-card": true,
    					"mdc-card--outlined": /*variant*/ ctx[2] === "outlined",
    					"smui-card--padded": /*padded*/ ctx[3]
    				}))) && { class: div_class_value },
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","variant","padded","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { variant = "raised" } = $$props;
    	let { padded = false } = $$props;
    	let element;

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("variant" in $$new_props) $$invalidate(2, variant = $$new_props.variant);
    		if ("padded" in $$new_props) $$invalidate(3, padded = $$new_props.padded);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		variant,
    		padded,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("variant" in $$props) $$invalidate(2, variant = $$new_props.variant);
    		if ("padded" in $$props) $$invalidate(3, padded = $$new_props.padded);
    		if ("element" in $$props) $$invalidate(4, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		variant,
    		padded,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$j, safe_not_equal, {
    			use: 0,
    			class: 1,
    			variant: 2,
    			padded: 3,
    			getElement: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get use() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padded() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padded(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[7];
    	}

    	set getElement(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Div.svelte generated by Svelte v3.38.2 */
    const file$f = "node_modules/@smui/common/Div.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let div_levels = [/*$$restProps*/ ctx[3]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[7](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Div", slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element = null;

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Div extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$i, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Div",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get use() {
    		throw new Error("<Div>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Div>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Div>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Content = classAdderBuilder({
      class: 'smui-card__content',
      component: Div,
    });

    classAdderBuilder({
      class: 'mdc-card__media-content',
      component: Div,
    });

    classAdderBuilder({
      class: 'mdc-card__action-buttons',
      component: Div,
    });

    classAdderBuilder({
      class: 'mdc-card__action-icons',
      component: Div,
    });

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$a = {
        LABEL_FLOAT_ABOVE: 'mdc-floating-label--float-above',
        LABEL_REQUIRED: 'mdc-floating-label--required',
        LABEL_SHAKE: 'mdc-floating-label--shake',
        ROOT: 'mdc-floating-label',
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFloatingLabelFoundation = /** @class */ (function (_super) {
        __extends(MDCFloatingLabelFoundation, _super);
        function MDCFloatingLabelFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCFloatingLabelFoundation.defaultAdapter), adapter)) || this;
            _this.shakeAnimationEndHandler_ = function () { return _this.handleShakeAnimationEnd_(); };
            return _this;
        }
        Object.defineProperty(MDCFloatingLabelFoundation, "cssClasses", {
            get: function () {
                return cssClasses$a;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCFloatingLabelFoundation, "defaultAdapter", {
            /**
             * See {@link MDCFloatingLabelAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    getWidth: function () { return 0; },
                    registerInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCFloatingLabelFoundation.prototype.init = function () {
            this.adapter.registerInteractionHandler('animationend', this.shakeAnimationEndHandler_);
        };
        MDCFloatingLabelFoundation.prototype.destroy = function () {
            this.adapter.deregisterInteractionHandler('animationend', this.shakeAnimationEndHandler_);
        };
        /**
         * Returns the width of the label element.
         */
        MDCFloatingLabelFoundation.prototype.getWidth = function () {
            return this.adapter.getWidth();
        };
        /**
         * Styles the label to produce a shake animation to indicate an error.
         * @param shouldShake If true, adds the shake CSS class; otherwise, removes shake class.
         */
        MDCFloatingLabelFoundation.prototype.shake = function (shouldShake) {
            var LABEL_SHAKE = MDCFloatingLabelFoundation.cssClasses.LABEL_SHAKE;
            if (shouldShake) {
                this.adapter.addClass(LABEL_SHAKE);
            }
            else {
                this.adapter.removeClass(LABEL_SHAKE);
            }
        };
        /**
         * Styles the label to float or dock.
         * @param shouldFloat If true, adds the float CSS class; otherwise, removes float and shake classes to dock the label.
         */
        MDCFloatingLabelFoundation.prototype.float = function (shouldFloat) {
            var _a = MDCFloatingLabelFoundation.cssClasses, LABEL_FLOAT_ABOVE = _a.LABEL_FLOAT_ABOVE, LABEL_SHAKE = _a.LABEL_SHAKE;
            if (shouldFloat) {
                this.adapter.addClass(LABEL_FLOAT_ABOVE);
            }
            else {
                this.adapter.removeClass(LABEL_FLOAT_ABOVE);
                this.adapter.removeClass(LABEL_SHAKE);
            }
        };
        /**
         * Styles the label as required.
         * @param isRequired If true, adds an asterisk to the label, indicating that it is required.
         */
        MDCFloatingLabelFoundation.prototype.setRequired = function (isRequired) {
            var LABEL_REQUIRED = MDCFloatingLabelFoundation.cssClasses.LABEL_REQUIRED;
            if (isRequired) {
                this.adapter.addClass(LABEL_REQUIRED);
            }
            else {
                this.adapter.removeClass(LABEL_REQUIRED);
            }
        };
        MDCFloatingLabelFoundation.prototype.handleShakeAnimationEnd_ = function () {
            var LABEL_SHAKE = MDCFloatingLabelFoundation.cssClasses.LABEL_SHAKE;
            this.adapter.removeClass(LABEL_SHAKE);
        };
        return MDCFloatingLabelFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$9 = {
        LINE_RIPPLE_ACTIVE: 'mdc-line-ripple--active',
        LINE_RIPPLE_DEACTIVATING: 'mdc-line-ripple--deactivating',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCLineRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCLineRippleFoundation, _super);
        function MDCLineRippleFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCLineRippleFoundation.defaultAdapter), adapter)) || this;
            _this.transitionEndHandler_ = function (evt) { return _this.handleTransitionEnd(evt); };
            return _this;
        }
        Object.defineProperty(MDCLineRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$9;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCLineRippleFoundation, "defaultAdapter", {
            /**
             * See {@link MDCLineRippleAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setStyle: function () { return undefined; },
                    registerEventHandler: function () { return undefined; },
                    deregisterEventHandler: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCLineRippleFoundation.prototype.init = function () {
            this.adapter.registerEventHandler('transitionend', this.transitionEndHandler_);
        };
        MDCLineRippleFoundation.prototype.destroy = function () {
            this.adapter.deregisterEventHandler('transitionend', this.transitionEndHandler_);
        };
        MDCLineRippleFoundation.prototype.activate = function () {
            this.adapter.removeClass(cssClasses$9.LINE_RIPPLE_DEACTIVATING);
            this.adapter.addClass(cssClasses$9.LINE_RIPPLE_ACTIVE);
        };
        MDCLineRippleFoundation.prototype.setRippleCenter = function (xCoordinate) {
            this.adapter.setStyle('transform-origin', xCoordinate + "px center");
        };
        MDCLineRippleFoundation.prototype.deactivate = function () {
            this.adapter.addClass(cssClasses$9.LINE_RIPPLE_DEACTIVATING);
        };
        MDCLineRippleFoundation.prototype.handleTransitionEnd = function (evt) {
            // Wait for the line ripple to be either transparent or opaque
            // before emitting the animation end event
            var isDeactivating = this.adapter.hasClass(cssClasses$9.LINE_RIPPLE_DEACTIVATING);
            if (evt.propertyName === 'opacity') {
                if (isDeactivating) {
                    this.adapter.removeClass(cssClasses$9.LINE_RIPPLE_ACTIVE);
                    this.adapter.removeClass(cssClasses$9.LINE_RIPPLE_DEACTIVATING);
                }
            }
        };
        return MDCLineRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$8 = {
        ANCHOR: 'mdc-menu-surface--anchor',
        ANIMATING_CLOSED: 'mdc-menu-surface--animating-closed',
        ANIMATING_OPEN: 'mdc-menu-surface--animating-open',
        FIXED: 'mdc-menu-surface--fixed',
        IS_OPEN_BELOW: 'mdc-menu-surface--is-open-below',
        OPEN: 'mdc-menu-surface--open',
        ROOT: 'mdc-menu-surface',
    };
    // tslint:disable:object-literal-sort-keys
    var strings$9 = {
        CLOSED_EVENT: 'MDCMenuSurface:closed',
        CLOSING_EVENT: 'MDCMenuSurface:closing',
        OPENED_EVENT: 'MDCMenuSurface:opened',
        FOCUSABLE_ELEMENTS: [
            'button:not(:disabled)',
            '[href]:not([aria-disabled="true"])',
            'input:not(:disabled)',
            'select:not(:disabled)',
            'textarea:not(:disabled)',
            '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
        ].join(', '),
    };
    // tslint:enable:object-literal-sort-keys
    var numbers$5 = {
        /** Total duration of menu-surface open animation. */
        TRANSITION_OPEN_DURATION: 120,
        /** Total duration of menu-surface close animation. */
        TRANSITION_CLOSE_DURATION: 75,
        /** Margin left to the edge of the viewport when menu-surface is at maximum possible height. Also used as a viewport margin. */
        MARGIN_TO_EDGE: 32,
        /** Ratio of anchor width to menu-surface width for switching from corner positioning to center positioning. */
        ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO: 0.67,
    };
    /**
     * Enum for bits in the {@see Corner) bitmap.
     */
    var CornerBit;
    (function (CornerBit) {
        CornerBit[CornerBit["BOTTOM"] = 1] = "BOTTOM";
        CornerBit[CornerBit["CENTER"] = 2] = "CENTER";
        CornerBit[CornerBit["RIGHT"] = 4] = "RIGHT";
        CornerBit[CornerBit["FLIP_RTL"] = 8] = "FLIP_RTL";
    })(CornerBit || (CornerBit = {}));
    /**
     * Enum for representing an element corner for positioning the menu-surface.
     *
     * The START constants map to LEFT if element directionality is left
     * to right and RIGHT if the directionality is right to left.
     * Likewise END maps to RIGHT or LEFT depending on the directionality.
     */
    var Corner;
    (function (Corner) {
        Corner[Corner["TOP_LEFT"] = 0] = "TOP_LEFT";
        Corner[Corner["TOP_RIGHT"] = 4] = "TOP_RIGHT";
        Corner[Corner["BOTTOM_LEFT"] = 1] = "BOTTOM_LEFT";
        Corner[Corner["BOTTOM_RIGHT"] = 5] = "BOTTOM_RIGHT";
        Corner[Corner["TOP_START"] = 8] = "TOP_START";
        Corner[Corner["TOP_END"] = 12] = "TOP_END";
        Corner[Corner["BOTTOM_START"] = 9] = "BOTTOM_START";
        Corner[Corner["BOTTOM_END"] = 13] = "BOTTOM_END";
    })(Corner || (Corner = {}));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var _a, _b;
    var cssClasses$7 = {
        LIST_ITEM_ACTIVATED_CLASS: 'mdc-list-item--activated',
        LIST_ITEM_CLASS: 'mdc-list-item',
        LIST_ITEM_DISABLED_CLASS: 'mdc-list-item--disabled',
        LIST_ITEM_SELECTED_CLASS: 'mdc-list-item--selected',
        LIST_ITEM_TEXT_CLASS: 'mdc-list-item__text',
        LIST_ITEM_PRIMARY_TEXT_CLASS: 'mdc-list-item__primary-text',
        ROOT: 'mdc-list',
    };
    (_a = {},
        _a["" + cssClasses$7.LIST_ITEM_ACTIVATED_CLASS] = 'mdc-list-item--activated',
        _a["" + cssClasses$7.LIST_ITEM_CLASS] = 'mdc-list-item',
        _a["" + cssClasses$7.LIST_ITEM_DISABLED_CLASS] = 'mdc-list-item--disabled',
        _a["" + cssClasses$7.LIST_ITEM_SELECTED_CLASS] = 'mdc-list-item--selected',
        _a["" + cssClasses$7.LIST_ITEM_PRIMARY_TEXT_CLASS] = 'mdc-list-item__primary-text',
        _a["" + cssClasses$7.ROOT] = 'mdc-list',
        _a);
    var deprecatedClassNameMap = (_b = {},
        _b["" + cssClasses$7.LIST_ITEM_ACTIVATED_CLASS] = 'mdc-deprecated-list-item--activated',
        _b["" + cssClasses$7.LIST_ITEM_CLASS] = 'mdc-deprecated-list-item',
        _b["" + cssClasses$7.LIST_ITEM_DISABLED_CLASS] = 'mdc-deprecated-list-item--disabled',
        _b["" + cssClasses$7.LIST_ITEM_SELECTED_CLASS] = 'mdc-deprecated-list-item--selected',
        _b["" + cssClasses$7.LIST_ITEM_TEXT_CLASS] = 'mdc-deprecated-list-item__text',
        _b["" + cssClasses$7.LIST_ITEM_PRIMARY_TEXT_CLASS] = 'mdc-deprecated-list-item__primary-text',
        _b["" + cssClasses$7.ROOT] = 'mdc-deprecated-list',
        _b);
    var strings$8 = {
        ACTION_EVENT: 'MDCList:action',
        ARIA_CHECKED: 'aria-checked',
        ARIA_CHECKED_CHECKBOX_SELECTOR: '[role="checkbox"][aria-checked="true"]',
        ARIA_CHECKED_RADIO_SELECTOR: '[role="radio"][aria-checked="true"]',
        ARIA_CURRENT: 'aria-current',
        ARIA_DISABLED: 'aria-disabled',
        ARIA_ORIENTATION: 'aria-orientation',
        ARIA_ORIENTATION_HORIZONTAL: 'horizontal',
        ARIA_ROLE_CHECKBOX_SELECTOR: '[role="checkbox"]',
        ARIA_SELECTED: 'aria-selected',
        ARIA_INTERACTIVE_ROLES_SELECTOR: '[role="listbox"], [role="menu"]',
        ARIA_MULTI_SELECTABLE_SELECTOR: '[aria-multiselectable="true"]',
        CHECKBOX_RADIO_SELECTOR: 'input[type="checkbox"], input[type="radio"]',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]',
        CHILD_ELEMENTS_TO_TOGGLE_TABINDEX: "\n    ." + cssClasses$7.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$7.LIST_ITEM_CLASS + " a,\n    ." + deprecatedClassNameMap[cssClasses$7.LIST_ITEM_CLASS] + " button:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$7.LIST_ITEM_CLASS] + " a\n  ",
        DEPRECATED_SELECTOR: '.mdc-deprecated-list',
        FOCUSABLE_CHILD_ELEMENTS: "\n    ." + cssClasses$7.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$7.LIST_ITEM_CLASS + " a,\n    ." + cssClasses$7.LIST_ITEM_CLASS + " input[type=\"radio\"]:not(:disabled),\n    ." + cssClasses$7.LIST_ITEM_CLASS + " input[type=\"checkbox\"]:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$7.LIST_ITEM_CLASS] + " button:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$7.LIST_ITEM_CLASS] + " a,\n    ." + deprecatedClassNameMap[cssClasses$7.LIST_ITEM_CLASS] + " input[type=\"radio\"]:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$7.LIST_ITEM_CLASS] + " input[type=\"checkbox\"]:not(:disabled)\n  ",
        RADIO_SELECTOR: 'input[type="radio"]',
        SELECTED_ITEM_SELECTOR: '[aria-selected="true"], [aria-current="true"]',
    };
    var numbers$4 = {
        UNSET_INDEX: -1,
        TYPEAHEAD_BUFFER_CLEAR_TIMEOUT_MS: 300
    };

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ELEMENTS_KEY_ALLOWED_IN = ['input', 'button', 'textarea', 'select'];
    /**
     * Ensures that preventDefault is only called if the containing element
     * doesn't consume the event, and it will cause an unintended scroll.
     *
     * @param evt keyboard event to be prevented.
     */
    var preventDefaultEvent = function (evt) {
        var target = evt.target;
        if (!target) {
            return;
        }
        var tagName = ("" + target.tagName).toLowerCase();
        if (ELEMENTS_KEY_ALLOWED_IN.indexOf(tagName) === -1) {
            evt.preventDefault();
        }
    };

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Initializes a state object for typeahead. Use the same reference for calls to
     * typeahead functions.
     *
     * @return The current state of the typeahead process. Each state reference
     *     represents a typeahead instance as the reference is typically mutated
     *     in-place.
     */
    function initState() {
        var state = {
            bufferClearTimeout: 0,
            currentFirstChar: '',
            sortedIndexCursor: 0,
            typeaheadBuffer: '',
        };
        return state;
    }
    /**
     * Initializes typeahead state by indexing the current list items by primary
     * text into the sortedIndexByFirstChar data structure.
     *
     * @param listItemCount numer of items in the list
     * @param getPrimaryTextByItemIndex function that returns the primary text at a
     *     given index
     *
     * @return Map that maps the first character of the primary text to the full
     *     list text and it's index
     */
    function initSortedIndex(listItemCount, getPrimaryTextByItemIndex) {
        var sortedIndexByFirstChar = new Map();
        // Aggregate item text to index mapping
        for (var i = 0; i < listItemCount; i++) {
            var primaryText = getPrimaryTextByItemIndex(i).trim();
            if (!primaryText) {
                continue;
            }
            var firstChar = primaryText[0].toLowerCase();
            if (!sortedIndexByFirstChar.has(firstChar)) {
                sortedIndexByFirstChar.set(firstChar, []);
            }
            sortedIndexByFirstChar.get(firstChar).push({ text: primaryText.toLowerCase(), index: i });
        }
        // Sort the mapping
        // TODO(b/157162694): Investigate replacing forEach with Map.values()
        sortedIndexByFirstChar.forEach(function (values) {
            values.sort(function (first, second) {
                return first.index - second.index;
            });
        });
        return sortedIndexByFirstChar;
    }
    /**
     * Given the next desired character from the user, it attempts to find the next
     * list option matching the buffer. Wraps around if at the end of options.
     *
     * @param opts Options and accessors
     *   - nextChar - the next character to match against items
     *   - sortedIndexByFirstChar - output of `initSortedIndex(...)`
     *   - focusedItemIndex - the index of the currently focused item
     *   - focusItemAtIndex - function that focuses a list item at given index
     *   - skipFocus - whether or not to focus the matched item
     *   - isItemAtIndexDisabled - function that determines whether an item at a
     *        given index is disabled
     * @param state The typeahead state instance. See `initState`.
     *
     * @return The index of the matched item, or -1 if no match.
     */
    function matchItem(opts, state) {
        var nextChar = opts.nextChar, focusItemAtIndex = opts.focusItemAtIndex, sortedIndexByFirstChar = opts.sortedIndexByFirstChar, focusedItemIndex = opts.focusedItemIndex, skipFocus = opts.skipFocus, isItemAtIndexDisabled = opts.isItemAtIndexDisabled;
        clearTimeout(state.bufferClearTimeout);
        state.bufferClearTimeout = setTimeout(function () {
            clearBuffer(state);
        }, numbers$4.TYPEAHEAD_BUFFER_CLEAR_TIMEOUT_MS);
        state.typeaheadBuffer = state.typeaheadBuffer + nextChar;
        var index;
        if (state.typeaheadBuffer.length === 1) {
            index = matchFirstChar(sortedIndexByFirstChar, focusedItemIndex, isItemAtIndexDisabled, state);
        }
        else {
            index = matchAllChars(sortedIndexByFirstChar, isItemAtIndexDisabled, state);
        }
        if (index !== -1 && !skipFocus) {
            focusItemAtIndex(index);
        }
        return index;
    }
    /**
     * Matches the user's single input character in the buffer to the
     * next option that begins with such character. Wraps around if at
     * end of options. Returns -1 if no match is found.
     */
    function matchFirstChar(sortedIndexByFirstChar, focusedItemIndex, isItemAtIndexDisabled, state) {
        var firstChar = state.typeaheadBuffer[0];
        var itemsMatchingFirstChar = sortedIndexByFirstChar.get(firstChar);
        if (!itemsMatchingFirstChar) {
            return -1;
        }
        // Has the same firstChar been recently matched?
        // Also, did starting index remain the same between key presses?
        // If both hold true, simply increment index.
        if (firstChar === state.currentFirstChar &&
            itemsMatchingFirstChar[state.sortedIndexCursor].index ===
                focusedItemIndex) {
            state.sortedIndexCursor =
                (state.sortedIndexCursor + 1) % itemsMatchingFirstChar.length;
            var newIndex = itemsMatchingFirstChar[state.sortedIndexCursor].index;
            if (!isItemAtIndexDisabled(newIndex)) {
                return newIndex;
            }
        }
        // If we're here, it means one of the following happened:
        // - either firstChar or startingIndex has changed, invalidating the
        // cursor.
        // - The next item of typeahead is disabled, so we have to look further.
        state.currentFirstChar = firstChar;
        var newCursorPosition = -1;
        var cursorPosition;
        // Find the first non-disabled item as a fallback.
        for (cursorPosition = 0; cursorPosition < itemsMatchingFirstChar.length; cursorPosition++) {
            if (!isItemAtIndexDisabled(itemsMatchingFirstChar[cursorPosition].index)) {
                newCursorPosition = cursorPosition;
                break;
            }
        }
        // Advance cursor to first item matching the firstChar that is positioned
        // after starting item. Cursor is unchanged from fallback if there's no
        // such item.
        for (; cursorPosition < itemsMatchingFirstChar.length; cursorPosition++) {
            if (itemsMatchingFirstChar[cursorPosition].index > focusedItemIndex &&
                !isItemAtIndexDisabled(itemsMatchingFirstChar[cursorPosition].index)) {
                newCursorPosition = cursorPosition;
                break;
            }
        }
        if (newCursorPosition !== -1) {
            state.sortedIndexCursor = newCursorPosition;
            return itemsMatchingFirstChar[state.sortedIndexCursor].index;
        }
        return -1;
    }
    /**
     * Attempts to find the next item that matches all of the typeahead buffer.
     * Wraps around if at end of options. Returns -1 if no match is found.
     */
    function matchAllChars(sortedIndexByFirstChar, isItemAtIndexDisabled, state) {
        var firstChar = state.typeaheadBuffer[0];
        var itemsMatchingFirstChar = sortedIndexByFirstChar.get(firstChar);
        if (!itemsMatchingFirstChar) {
            return -1;
        }
        // Do nothing if text already matches
        var startingItem = itemsMatchingFirstChar[state.sortedIndexCursor];
        if (startingItem.text.lastIndexOf(state.typeaheadBuffer, 0) === 0 &&
            !isItemAtIndexDisabled(startingItem.index)) {
            return startingItem.index;
        }
        // Find next item that matches completely; if no match, we'll eventually
        // loop around to same position
        var cursorPosition = (state.sortedIndexCursor + 1) % itemsMatchingFirstChar.length;
        var nextCursorPosition = -1;
        while (cursorPosition !== state.sortedIndexCursor) {
            var currentItem = itemsMatchingFirstChar[cursorPosition];
            var matches = currentItem.text.lastIndexOf(state.typeaheadBuffer, 0) === 0;
            var isEnabled = !isItemAtIndexDisabled(currentItem.index);
            if (matches && isEnabled) {
                nextCursorPosition = cursorPosition;
                break;
            }
            cursorPosition = (cursorPosition + 1) % itemsMatchingFirstChar.length;
        }
        if (nextCursorPosition !== -1) {
            state.sortedIndexCursor = nextCursorPosition;
            return itemsMatchingFirstChar[state.sortedIndexCursor].index;
        }
        return -1;
    }
    /**
     * Whether or not the given typeahead instaance state is currently typing.
     *
     * @param state The typeahead state instance. See `initState`.
     */
    function isTypingInProgress(state) {
        return state.typeaheadBuffer.length > 0;
    }
    /**
     * Clears the typeahaed buffer so that it resets item matching to the first
     * character.
     *
     * @param state The typeahead state instance. See `initState`.
     */
    function clearBuffer(state) {
        state.typeaheadBuffer = '';
    }
    /**
     * Given a keydown event, it calculates whether or not to automatically focus a
     * list item depending on what was typed mimicing the typeahead functionality of
     * a standard <select> element that is open.
     *
     * @param opts Options and accessors
     *   - event - the KeyboardEvent to handle and parse
     *   - sortedIndexByFirstChar - output of `initSortedIndex(...)`
     *   - focusedItemIndex - the index of the currently focused item
     *   - focusItemAtIndex - function that focuses a list item at given index
     *   - isItemAtFocusedIndexDisabled - whether or not the currently focused item
     *      is disabled
     *   - isTargetListItem - whether or not the event target is a list item
     * @param state The typeahead state instance. See `initState`.
     *
     * @returns index of the item matched by the keydown. -1 if not matched.
     */
    function handleKeydown(opts, state) {
        var event = opts.event, isTargetListItem = opts.isTargetListItem, focusedItemIndex = opts.focusedItemIndex, focusItemAtIndex = opts.focusItemAtIndex, sortedIndexByFirstChar = opts.sortedIndexByFirstChar, isItemAtIndexDisabled = opts.isItemAtIndexDisabled;
        var isArrowLeft = normalizeKey(event) === 'ArrowLeft';
        var isArrowUp = normalizeKey(event) === 'ArrowUp';
        var isArrowRight = normalizeKey(event) === 'ArrowRight';
        var isArrowDown = normalizeKey(event) === 'ArrowDown';
        var isHome = normalizeKey(event) === 'Home';
        var isEnd = normalizeKey(event) === 'End';
        var isEnter = normalizeKey(event) === 'Enter';
        var isSpace = normalizeKey(event) === 'Spacebar';
        if (event.ctrlKey || event.metaKey || isArrowLeft || isArrowUp ||
            isArrowRight || isArrowDown || isHome || isEnd || isEnter) {
            return -1;
        }
        var isCharacterKey = !isSpace && event.key.length === 1;
        if (isCharacterKey) {
            preventDefaultEvent(event);
            var matchItemOpts = {
                focusItemAtIndex: focusItemAtIndex,
                focusedItemIndex: focusedItemIndex,
                nextChar: event.key.toLowerCase(),
                sortedIndexByFirstChar: sortedIndexByFirstChar,
                skipFocus: false,
                isItemAtIndexDisabled: isItemAtIndexDisabled,
            };
            return matchItem(matchItemOpts, state);
        }
        if (!isSpace) {
            return -1;
        }
        if (isTargetListItem) {
            preventDefaultEvent(event);
        }
        var typeaheadOnListItem = isTargetListItem && isTypingInProgress(state);
        if (typeaheadOnListItem) {
            var matchItemOpts = {
                focusItemAtIndex: focusItemAtIndex,
                focusedItemIndex: focusedItemIndex,
                nextChar: ' ',
                sortedIndexByFirstChar: sortedIndexByFirstChar,
                skipFocus: false,
                isItemAtIndexDisabled: isItemAtIndexDisabled,
            };
            // space participates in typeahead matching if in rapid typing mode
            return matchItem(matchItemOpts, state);
        }
        return -1;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    function isNumberArray(selectedIndex) {
        return selectedIndex instanceof Array;
    }
    var MDCListFoundation = /** @class */ (function (_super) {
        __extends(MDCListFoundation, _super);
        function MDCListFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCListFoundation.defaultAdapter), adapter)) || this;
            _this.wrapFocus_ = false;
            _this.isVertical_ = true;
            _this.isSingleSelectionList_ = false;
            _this.selectedIndex_ = numbers$4.UNSET_INDEX;
            _this.focusedItemIndex = numbers$4.UNSET_INDEX;
            _this.useActivatedClass_ = false;
            _this.useSelectedAttr_ = false;
            _this.ariaCurrentAttrValue_ = null;
            _this.isCheckboxList_ = false;
            _this.isRadioList_ = false;
            _this.hasTypeahead = false;
            // Transiently holds current typeahead prefix from user.
            _this.typeaheadState = initState();
            _this.sortedIndexByFirstChar = new Map();
            return _this;
        }
        Object.defineProperty(MDCListFoundation, "strings", {
            get: function () {
                return strings$8;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "cssClasses", {
            get: function () {
                return cssClasses$7;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "numbers", {
            get: function () {
                return numbers$4;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClassForElementIndex: function () { return undefined; },
                    focusItemAtIndex: function () { return undefined; },
                    getAttributeForElementIndex: function () { return null; },
                    getFocusedElementIndex: function () { return 0; },
                    getListItemCount: function () { return 0; },
                    hasCheckboxAtIndex: function () { return false; },
                    hasRadioAtIndex: function () { return false; },
                    isCheckboxCheckedAtIndex: function () { return false; },
                    isFocusInsideList: function () { return false; },
                    isRootFocused: function () { return false; },
                    listItemAtIndexHasClass: function () { return false; },
                    notifyAction: function () { return undefined; },
                    removeClassForElementIndex: function () { return undefined; },
                    setAttributeForElementIndex: function () { return undefined; },
                    setCheckedCheckboxOrRadioAtIndex: function () { return undefined; },
                    setTabIndexForListItemChildren: function () { return undefined; },
                    getPrimaryTextAtIndex: function () { return ''; },
                };
            },
            enumerable: false,
            configurable: true
        });
        MDCListFoundation.prototype.layout = function () {
            if (this.adapter.getListItemCount() === 0) {
                return;
            }
            // TODO(b/172274142): consider all items when determining the list's type.
            if (this.adapter.hasCheckboxAtIndex(0)) {
                this.isCheckboxList_ = true;
            }
            else if (this.adapter.hasRadioAtIndex(0)) {
                this.isRadioList_ = true;
            }
            else {
                this.maybeInitializeSingleSelection();
            }
            if (this.hasTypeahead) {
                this.sortedIndexByFirstChar = this.typeaheadInitSortedIndex();
            }
        };
        /**
         * Sets the private wrapFocus_ variable.
         */
        MDCListFoundation.prototype.setWrapFocus = function (value) {
            this.wrapFocus_ = value;
        };
        /**
         * Sets the isVertical_ private variable.
         */
        MDCListFoundation.prototype.setVerticalOrientation = function (value) {
            this.isVertical_ = value;
        };
        /**
         * Sets the isSingleSelectionList_ private variable.
         */
        MDCListFoundation.prototype.setSingleSelection = function (value) {
            this.isSingleSelectionList_ = value;
            if (value) {
                this.maybeInitializeSingleSelection();
            }
        };
        /**
         * Automatically determines whether the list is single selection list. If so,
         * initializes the internal state to match the selected item.
         */
        MDCListFoundation.prototype.maybeInitializeSingleSelection = function () {
            var listItemsCount = this.adapter.getListItemCount();
            for (var i = 0; i < listItemsCount; i++) {
                var hasSelectedClass = this.adapter.listItemAtIndexHasClass(i, cssClasses$7.LIST_ITEM_SELECTED_CLASS);
                var hasActivatedClass = this.adapter.listItemAtIndexHasClass(i, cssClasses$7.LIST_ITEM_ACTIVATED_CLASS);
                if (!(hasSelectedClass || hasActivatedClass)) {
                    continue;
                }
                if (hasActivatedClass) {
                    this.setUseActivatedClass(true);
                }
                this.isSingleSelectionList_ = true;
                this.selectedIndex_ = i;
                return;
            }
        };
        /**
         * Sets whether typeahead is enabled on the list.
         * @param hasTypeahead Whether typeahead is enabled.
         */
        MDCListFoundation.prototype.setHasTypeahead = function (hasTypeahead) {
            this.hasTypeahead = hasTypeahead;
            if (hasTypeahead) {
                this.sortedIndexByFirstChar = this.typeaheadInitSortedIndex();
            }
        };
        /**
         * @return Whether typeahead is currently matching a user-specified prefix.
         */
        MDCListFoundation.prototype.isTypeaheadInProgress = function () {
            return this.hasTypeahead &&
                isTypingInProgress(this.typeaheadState);
        };
        /**
         * Sets the useActivatedClass_ private variable.
         */
        MDCListFoundation.prototype.setUseActivatedClass = function (useActivated) {
            this.useActivatedClass_ = useActivated;
        };
        /**
         * Sets the useSelectedAttr_ private variable.
         */
        MDCListFoundation.prototype.setUseSelectedAttribute = function (useSelected) {
            this.useSelectedAttr_ = useSelected;
        };
        MDCListFoundation.prototype.getSelectedIndex = function () {
            return this.selectedIndex_;
        };
        MDCListFoundation.prototype.setSelectedIndex = function (index) {
            if (!this.isIndexValid_(index)) {
                return;
            }
            if (this.isCheckboxList_) {
                this.setCheckboxAtIndex_(index);
            }
            else if (this.isRadioList_) {
                this.setRadioAtIndex_(index);
            }
            else {
                this.setSingleSelectionAtIndex_(index);
            }
        };
        /**
         * Focus in handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusIn = function (_, listItemIndex) {
            if (listItemIndex >= 0) {
                this.focusedItemIndex = listItemIndex;
                this.adapter.setAttributeForElementIndex(listItemIndex, 'tabindex', '0');
                this.adapter.setTabIndexForListItemChildren(listItemIndex, '0');
            }
        };
        /**
         * Focus out handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusOut = function (_, listItemIndex) {
            var _this = this;
            if (listItemIndex >= 0) {
                this.adapter.setAttributeForElementIndex(listItemIndex, 'tabindex', '-1');
                this.adapter.setTabIndexForListItemChildren(listItemIndex, '-1');
            }
            /**
             * Between Focusout & Focusin some browsers do not have focus on any
             * element. Setting a delay to wait till the focus is moved to next element.
             */
            setTimeout(function () {
                if (!_this.adapter.isFocusInsideList()) {
                    _this.setTabindexToFirstSelectedOrFocusedItem();
                }
            }, 0);
        };
        /**
         * Key handler for the list.
         */
        MDCListFoundation.prototype.handleKeydown = function (event, isRootListItem, listItemIndex) {
            var _this = this;
            var isArrowLeft = normalizeKey(event) === 'ArrowLeft';
            var isArrowUp = normalizeKey(event) === 'ArrowUp';
            var isArrowRight = normalizeKey(event) === 'ArrowRight';
            var isArrowDown = normalizeKey(event) === 'ArrowDown';
            var isHome = normalizeKey(event) === 'Home';
            var isEnd = normalizeKey(event) === 'End';
            var isEnter = normalizeKey(event) === 'Enter';
            var isSpace = normalizeKey(event) === 'Spacebar';
            // Have to check both upper and lower case, because having caps lock on affects the value.
            var isLetterA = event.key === 'A' || event.key === 'a';
            if (this.adapter.isRootFocused()) {
                if (isArrowUp || isEnd) {
                    event.preventDefault();
                    this.focusLastElement();
                }
                else if (isArrowDown || isHome) {
                    event.preventDefault();
                    this.focusFirstElement();
                }
                if (this.hasTypeahead) {
                    var handleKeydownOpts = {
                        event: event,
                        focusItemAtIndex: function (index) {
                            _this.focusItemAtIndex(index);
                        },
                        focusedItemIndex: -1,
                        isTargetListItem: isRootListItem,
                        sortedIndexByFirstChar: this.sortedIndexByFirstChar,
                        isItemAtIndexDisabled: function (index) {
                            return _this.adapter.listItemAtIndexHasClass(index, cssClasses$7.LIST_ITEM_DISABLED_CLASS);
                        },
                    };
                    handleKeydown(handleKeydownOpts, this.typeaheadState);
                }
                return;
            }
            var currentIndex = this.adapter.getFocusedElementIndex();
            if (currentIndex === -1) {
                currentIndex = listItemIndex;
                if (currentIndex < 0) {
                    // If this event doesn't have a mdc-list-item ancestor from the
                    // current list (not from a sublist), return early.
                    return;
                }
            }
            if ((this.isVertical_ && isArrowDown) ||
                (!this.isVertical_ && isArrowRight)) {
                preventDefaultEvent(event);
                this.focusNextElement(currentIndex);
            }
            else if ((this.isVertical_ && isArrowUp) || (!this.isVertical_ && isArrowLeft)) {
                preventDefaultEvent(event);
                this.focusPrevElement(currentIndex);
            }
            else if (isHome) {
                preventDefaultEvent(event);
                this.focusFirstElement();
            }
            else if (isEnd) {
                preventDefaultEvent(event);
                this.focusLastElement();
            }
            else if (isLetterA && event.ctrlKey && this.isCheckboxList_) {
                event.preventDefault();
                this.toggleAll(this.selectedIndex_ === numbers$4.UNSET_INDEX ? [] : this.selectedIndex_);
            }
            else if (isEnter || isSpace) {
                if (isRootListItem) {
                    // Return early if enter key is pressed on anchor element which triggers
                    // synthetic MouseEvent event.
                    var target = event.target;
                    if (target && target.tagName === 'A' && isEnter) {
                        return;
                    }
                    preventDefaultEvent(event);
                    if (this.adapter.listItemAtIndexHasClass(currentIndex, cssClasses$7.LIST_ITEM_DISABLED_CLASS)) {
                        return;
                    }
                    if (!this.isTypeaheadInProgress()) {
                        if (this.isSelectableList_()) {
                            this.setSelectedIndexOnAction_(currentIndex);
                        }
                        this.adapter.notifyAction(currentIndex);
                    }
                }
            }
            if (this.hasTypeahead) {
                var handleKeydownOpts = {
                    event: event,
                    focusItemAtIndex: function (index) {
                        _this.focusItemAtIndex(index);
                    },
                    focusedItemIndex: this.focusedItemIndex,
                    isTargetListItem: isRootListItem,
                    sortedIndexByFirstChar: this.sortedIndexByFirstChar,
                    isItemAtIndexDisabled: function (index) { return _this.adapter.listItemAtIndexHasClass(index, cssClasses$7.LIST_ITEM_DISABLED_CLASS); },
                };
                handleKeydown(handleKeydownOpts, this.typeaheadState);
            }
        };
        /**
         * Click handler for the list.
         */
        MDCListFoundation.prototype.handleClick = function (index, toggleCheckbox) {
            if (index === numbers$4.UNSET_INDEX) {
                return;
            }
            if (this.adapter.listItemAtIndexHasClass(index, cssClasses$7.LIST_ITEM_DISABLED_CLASS)) {
                return;
            }
            if (this.isSelectableList_()) {
                this.setSelectedIndexOnAction_(index, toggleCheckbox);
            }
            this.adapter.notifyAction(index);
        };
        /**
         * Focuses the next element on the list.
         */
        MDCListFoundation.prototype.focusNextElement = function (index) {
            var count = this.adapter.getListItemCount();
            var nextIndex = index + 1;
            if (nextIndex >= count) {
                if (this.wrapFocus_) {
                    nextIndex = 0;
                }
                else {
                    // Return early because last item is already focused.
                    return index;
                }
            }
            this.focusItemAtIndex(nextIndex);
            return nextIndex;
        };
        /**
         * Focuses the previous element on the list.
         */
        MDCListFoundation.prototype.focusPrevElement = function (index) {
            var prevIndex = index - 1;
            if (prevIndex < 0) {
                if (this.wrapFocus_) {
                    prevIndex = this.adapter.getListItemCount() - 1;
                }
                else {
                    // Return early because first item is already focused.
                    return index;
                }
            }
            this.focusItemAtIndex(prevIndex);
            return prevIndex;
        };
        MDCListFoundation.prototype.focusFirstElement = function () {
            this.focusItemAtIndex(0);
            return 0;
        };
        MDCListFoundation.prototype.focusLastElement = function () {
            var lastIndex = this.adapter.getListItemCount() - 1;
            this.focusItemAtIndex(lastIndex);
            return lastIndex;
        };
        MDCListFoundation.prototype.focusInitialElement = function () {
            var initialIndex = this.getFirstSelectedOrFocusedItemIndex();
            this.focusItemAtIndex(initialIndex);
            return initialIndex;
        };
        /**
         * @param itemIndex Index of the list item
         * @param isEnabled Sets the list item to enabled or disabled.
         */
        MDCListFoundation.prototype.setEnabled = function (itemIndex, isEnabled) {
            if (!this.isIndexValid_(itemIndex)) {
                return;
            }
            if (isEnabled) {
                this.adapter.removeClassForElementIndex(itemIndex, cssClasses$7.LIST_ITEM_DISABLED_CLASS);
                this.adapter.setAttributeForElementIndex(itemIndex, strings$8.ARIA_DISABLED, 'false');
            }
            else {
                this.adapter.addClassForElementIndex(itemIndex, cssClasses$7.LIST_ITEM_DISABLED_CLASS);
                this.adapter.setAttributeForElementIndex(itemIndex, strings$8.ARIA_DISABLED, 'true');
            }
        };
        MDCListFoundation.prototype.setSingleSelectionAtIndex_ = function (index) {
            if (this.selectedIndex_ === index) {
                return;
            }
            var selectedClassName = cssClasses$7.LIST_ITEM_SELECTED_CLASS;
            if (this.useActivatedClass_) {
                selectedClassName = cssClasses$7.LIST_ITEM_ACTIVATED_CLASS;
            }
            if (this.selectedIndex_ !== numbers$4.UNSET_INDEX) {
                this.adapter.removeClassForElementIndex(this.selectedIndex_, selectedClassName);
            }
            this.setAriaForSingleSelectionAtIndex_(index);
            this.setTabindexAtIndex(index);
            if (index !== numbers$4.UNSET_INDEX) {
                this.adapter.addClassForElementIndex(index, selectedClassName);
            }
            this.selectedIndex_ = index;
        };
        /**
         * Sets aria attribute for single selection at given index.
         */
        MDCListFoundation.prototype.setAriaForSingleSelectionAtIndex_ = function (index) {
            // Detect the presence of aria-current and get the value only during list
            // initialization when it is in unset state.
            if (this.selectedIndex_ === numbers$4.UNSET_INDEX) {
                this.ariaCurrentAttrValue_ =
                    this.adapter.getAttributeForElementIndex(index, strings$8.ARIA_CURRENT);
            }
            var isAriaCurrent = this.ariaCurrentAttrValue_ !== null;
            var ariaAttribute = isAriaCurrent ? strings$8.ARIA_CURRENT : strings$8.ARIA_SELECTED;
            if (this.selectedIndex_ !== numbers$4.UNSET_INDEX) {
                this.adapter.setAttributeForElementIndex(this.selectedIndex_, ariaAttribute, 'false');
            }
            if (index !== numbers$4.UNSET_INDEX) {
                var ariaAttributeValue = isAriaCurrent ? this.ariaCurrentAttrValue_ : 'true';
                this.adapter.setAttributeForElementIndex(index, ariaAttribute, ariaAttributeValue);
            }
        };
        /**
         * Returns the attribute to use for indicating selection status.
         */
        MDCListFoundation.prototype.getSelectionAttribute = function () {
            return this.useSelectedAttr_ ? strings$8.ARIA_SELECTED : strings$8.ARIA_CHECKED;
        };
        /**
         * Toggles radio at give index. Radio doesn't change the checked state if it
         * is already checked.
         */
        MDCListFoundation.prototype.setRadioAtIndex_ = function (index) {
            var selectionAttribute = this.getSelectionAttribute();
            this.adapter.setCheckedCheckboxOrRadioAtIndex(index, true);
            if (this.selectedIndex_ !== numbers$4.UNSET_INDEX) {
                this.adapter.setAttributeForElementIndex(this.selectedIndex_, selectionAttribute, 'false');
            }
            this.adapter.setAttributeForElementIndex(index, selectionAttribute, 'true');
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setCheckboxAtIndex_ = function (index) {
            var selectionAttribute = this.getSelectionAttribute();
            for (var i = 0; i < this.adapter.getListItemCount(); i++) {
                var isChecked = false;
                if (index.indexOf(i) >= 0) {
                    isChecked = true;
                }
                this.adapter.setCheckedCheckboxOrRadioAtIndex(i, isChecked);
                this.adapter.setAttributeForElementIndex(i, selectionAttribute, isChecked ? 'true' : 'false');
            }
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setTabindexAtIndex = function (index) {
            if (this.focusedItemIndex === numbers$4.UNSET_INDEX && index !== 0) {
                // If some list item was selected set first list item's tabindex to -1.
                // Generally, tabindex is set to 0 on first list item of list that has no
                // preselected items.
                this.adapter.setAttributeForElementIndex(0, 'tabindex', '-1');
            }
            else if (this.focusedItemIndex >= 0 && this.focusedItemIndex !== index) {
                this.adapter.setAttributeForElementIndex(this.focusedItemIndex, 'tabindex', '-1');
            }
            // Set the previous selection's tabindex to -1. We need this because
            // in selection menus that are not visible, programmatically setting an
            // option will not change focus but will change where tabindex should be 0.
            if (!(this.selectedIndex_ instanceof Array) &&
                this.selectedIndex_ !== index) {
                this.adapter.setAttributeForElementIndex(this.selectedIndex_, 'tabindex', '-1');
            }
            if (index !== numbers$4.UNSET_INDEX) {
                this.adapter.setAttributeForElementIndex(index, 'tabindex', '0');
            }
        };
        /**
         * @return Return true if it is single selectin list, checkbox list or radio
         *     list.
         */
        MDCListFoundation.prototype.isSelectableList_ = function () {
            return this.isSingleSelectionList_ || this.isCheckboxList_ ||
                this.isRadioList_;
        };
        MDCListFoundation.prototype.setTabindexToFirstSelectedOrFocusedItem = function () {
            var targetIndex = this.getFirstSelectedOrFocusedItemIndex();
            this.setTabindexAtIndex(targetIndex);
        };
        MDCListFoundation.prototype.getFirstSelectedOrFocusedItemIndex = function () {
            var targetIndex = this.focusedItemIndex >= 0 ? this.focusedItemIndex : 0;
            if (this.isSelectableList_()) {
                if (typeof this.selectedIndex_ === 'number' &&
                    this.selectedIndex_ !== numbers$4.UNSET_INDEX) {
                    targetIndex = this.selectedIndex_;
                }
                else if (isNumberArray(this.selectedIndex_) &&
                    this.selectedIndex_.length > 0) {
                    targetIndex = this.selectedIndex_.reduce(function (currentIndex, minIndex) { return Math.min(currentIndex, minIndex); });
                }
            }
            return targetIndex;
        };
        MDCListFoundation.prototype.isIndexValid_ = function (index) {
            var _this = this;
            if (index instanceof Array) {
                if (!this.isCheckboxList_) {
                    throw new Error('MDCListFoundation: Array of index is only supported for checkbox based list');
                }
                if (index.length === 0) {
                    return true;
                }
                else {
                    return index.some(function (i) { return _this.isIndexInRange_(i); });
                }
            }
            else if (typeof index === 'number') {
                if (this.isCheckboxList_) {
                    throw new Error("MDCListFoundation: Expected array of index for checkbox based list but got number: " + index);
                }
                return this.isIndexInRange_(index) ||
                    this.isSingleSelectionList_ && index === numbers$4.UNSET_INDEX;
            }
            else {
                return false;
            }
        };
        MDCListFoundation.prototype.isIndexInRange_ = function (index) {
            var listSize = this.adapter.getListItemCount();
            return index >= 0 && index < listSize;
        };
        /**
         * Sets selected index on user action, toggles checkbox / radio based on
         * toggleCheckbox value. User interaction should not toggle list item(s) when
         * disabled.
         */
        MDCListFoundation.prototype.setSelectedIndexOnAction_ = function (index, toggleCheckbox) {
            if (toggleCheckbox === void 0) { toggleCheckbox = true; }
            if (this.isCheckboxList_) {
                this.toggleCheckboxAtIndex_(index, toggleCheckbox);
            }
            else {
                this.setSelectedIndex(index);
            }
        };
        MDCListFoundation.prototype.toggleCheckboxAtIndex_ = function (index, toggleCheckbox) {
            var selectionAttribute = this.getSelectionAttribute();
            var isChecked = this.adapter.isCheckboxCheckedAtIndex(index);
            if (toggleCheckbox) {
                isChecked = !isChecked;
                this.adapter.setCheckedCheckboxOrRadioAtIndex(index, isChecked);
            }
            this.adapter.setAttributeForElementIndex(index, selectionAttribute, isChecked ? 'true' : 'false');
            // If none of the checkbox items are selected and selectedIndex is not
            // initialized then provide a default value.
            var selectedIndexes = this.selectedIndex_ === numbers$4.UNSET_INDEX ?
                [] :
                this.selectedIndex_.slice();
            if (isChecked) {
                selectedIndexes.push(index);
            }
            else {
                selectedIndexes = selectedIndexes.filter(function (i) { return i !== index; });
            }
            this.selectedIndex_ = selectedIndexes;
        };
        MDCListFoundation.prototype.focusItemAtIndex = function (index) {
            this.adapter.focusItemAtIndex(index);
            this.focusedItemIndex = index;
        };
        MDCListFoundation.prototype.toggleAll = function (currentlySelectedIndexes) {
            var count = this.adapter.getListItemCount();
            // If all items are selected, deselect everything.
            if (currentlySelectedIndexes.length === count) {
                this.setCheckboxAtIndex_([]);
            }
            else {
                // Otherwise select all enabled options.
                var allIndexes = [];
                for (var i = 0; i < count; i++) {
                    if (!this.adapter.listItemAtIndexHasClass(i, cssClasses$7.LIST_ITEM_DISABLED_CLASS) ||
                        currentlySelectedIndexes.indexOf(i) > -1) {
                        allIndexes.push(i);
                    }
                }
                this.setCheckboxAtIndex_(allIndexes);
            }
        };
        /**
         * Given the next desired character from the user, adds it to the typeahead
         * buffer. Then, attempts to find the next option matching the buffer. Wraps
         * around if at the end of options.
         *
         * @param nextChar The next character to add to the prefix buffer.
         * @param startingIndex The index from which to start matching. Only relevant
         *     when starting a new match sequence. To start a new match sequence,
         *     clear the buffer using `clearTypeaheadBuffer`, or wait for the buffer
         *     to clear after a set interval defined in list foundation. Defaults to
         *     the currently focused index.
         * @return The index of the matched item, or -1 if no match.
         */
        MDCListFoundation.prototype.typeaheadMatchItem = function (nextChar, startingIndex, skipFocus) {
            var _this = this;
            if (skipFocus === void 0) { skipFocus = false; }
            var opts = {
                focusItemAtIndex: function (index) {
                    _this.focusItemAtIndex(index);
                },
                focusedItemIndex: startingIndex ? startingIndex : this.focusedItemIndex,
                nextChar: nextChar,
                sortedIndexByFirstChar: this.sortedIndexByFirstChar,
                skipFocus: skipFocus,
                isItemAtIndexDisabled: function (index) { return _this.adapter.listItemAtIndexHasClass(index, cssClasses$7.LIST_ITEM_DISABLED_CLASS); }
            };
            return matchItem(opts, this.typeaheadState);
        };
        /**
         * Initializes the MDCListTextAndIndex data structure by indexing the current
         * list items by primary text.
         *
         * @return The primary texts of all the list items sorted by first character.
         */
        MDCListFoundation.prototype.typeaheadInitSortedIndex = function () {
            return initSortedIndex(this.adapter.getListItemCount(), this.adapter.getPrimaryTextAtIndex);
        };
        /**
         * Clears the typeahead buffer.
         */
        MDCListFoundation.prototype.clearTypeaheadBuffer = function () {
            clearBuffer(this.typeaheadState);
        };
        return MDCListFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenuSurfaceFoundation = /** @class */ (function (_super) {
        __extends(MDCMenuSurfaceFoundation, _super);
        function MDCMenuSurfaceFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCMenuSurfaceFoundation.defaultAdapter), adapter)) || this;
            _this.isSurfaceOpen = false;
            _this.isQuickOpen = false;
            _this.isHoistedElement = false;
            _this.isFixedPosition = false;
            _this.isHorizontallyCenteredOnViewport = false;
            _this.maxHeight = 0;
            _this.openAnimationEndTimerId = 0;
            _this.closeAnimationEndTimerId = 0;
            _this.animationRequestId = 0;
            _this.anchorCorner = Corner.TOP_START;
            /**
             * Corner of the menu surface to which menu surface is attached to anchor.
             *
             *  Anchor corner --->+----------+
             *                    |  ANCHOR  |
             *                    +----------+
             *  Origin corner --->+--------------+
             *                    |              |
             *                    |              |
             *                    | MENU SURFACE |
             *                    |              |
             *                    |              |
             *                    +--------------+
             */
            _this.originCorner = Corner.TOP_START;
            _this.anchorMargin = { top: 0, right: 0, bottom: 0, left: 0 };
            _this.position = { x: 0, y: 0 };
            return _this;
        }
        Object.defineProperty(MDCMenuSurfaceFoundation, "cssClasses", {
            get: function () {
                return cssClasses$8;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "strings", {
            get: function () {
                return strings$9;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "numbers", {
            get: function () {
                return numbers$5;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "Corner", {
            get: function () {
                return Corner;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "defaultAdapter", {
            /**
             * @see {@link MDCMenuSurfaceAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    hasAnchor: function () { return false; },
                    isElementInContainer: function () { return false; },
                    isFocused: function () { return false; },
                    isRtl: function () { return false; },
                    getInnerDimensions: function () { return ({ height: 0, width: 0 }); },
                    getAnchorDimensions: function () { return null; },
                    getWindowDimensions: function () { return ({ height: 0, width: 0 }); },
                    getBodyDimensions: function () { return ({ height: 0, width: 0 }); },
                    getWindowScroll: function () { return ({ x: 0, y: 0 }); },
                    setPosition: function () { return undefined; },
                    setMaxHeight: function () { return undefined; },
                    setTransformOrigin: function () { return undefined; },
                    saveFocus: function () { return undefined; },
                    restoreFocus: function () { return undefined; },
                    notifyClose: function () { return undefined; },
                    notifyOpen: function () { return undefined; },
                    notifyClosing: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCMenuSurfaceFoundation.prototype.init = function () {
            var _a = MDCMenuSurfaceFoundation.cssClasses, ROOT = _a.ROOT, OPEN = _a.OPEN;
            if (!this.adapter.hasClass(ROOT)) {
                throw new Error(ROOT + " class required in root element.");
            }
            if (this.adapter.hasClass(OPEN)) {
                this.isSurfaceOpen = true;
            }
        };
        MDCMenuSurfaceFoundation.prototype.destroy = function () {
            clearTimeout(this.openAnimationEndTimerId);
            clearTimeout(this.closeAnimationEndTimerId);
            // Cancel any currently running animations.
            cancelAnimationFrame(this.animationRequestId);
        };
        /**
         * @param corner Default anchor corner alignment of top-left menu surface corner.
         */
        MDCMenuSurfaceFoundation.prototype.setAnchorCorner = function (corner) {
            this.anchorCorner = corner;
        };
        /**
         * Flip menu corner horizontally.
         */
        MDCMenuSurfaceFoundation.prototype.flipCornerHorizontally = function () {
            this.originCorner = this.originCorner ^ CornerBit.RIGHT;
        };
        /**
         * @param margin Set of margin values from anchor.
         */
        MDCMenuSurfaceFoundation.prototype.setAnchorMargin = function (margin) {
            this.anchorMargin.top = margin.top || 0;
            this.anchorMargin.right = margin.right || 0;
            this.anchorMargin.bottom = margin.bottom || 0;
            this.anchorMargin.left = margin.left || 0;
        };
        /** Used to indicate if the menu-surface is hoisted to the body. */
        MDCMenuSurfaceFoundation.prototype.setIsHoisted = function (isHoisted) {
            this.isHoistedElement = isHoisted;
        };
        /** Used to set the menu-surface calculations based on a fixed position menu. */
        MDCMenuSurfaceFoundation.prototype.setFixedPosition = function (isFixedPosition) {
            this.isFixedPosition = isFixedPosition;
        };
        /** Sets the menu-surface position on the page. */
        MDCMenuSurfaceFoundation.prototype.setAbsolutePosition = function (x, y) {
            this.position.x = this.isFinite(x) ? x : 0;
            this.position.y = this.isFinite(y) ? y : 0;
        };
        /** Sets whether menu-surface should be horizontally centered to viewport. */
        MDCMenuSurfaceFoundation.prototype.setIsHorizontallyCenteredOnViewport = function (isCentered) {
            this.isHorizontallyCenteredOnViewport = isCentered;
        };
        MDCMenuSurfaceFoundation.prototype.setQuickOpen = function (quickOpen) {
            this.isQuickOpen = quickOpen;
        };
        /**
         * Sets maximum menu-surface height on open.
         * @param maxHeight The desired max-height. Set to 0 (default) to
         *     automatically calculate max height based on available viewport space.
         */
        MDCMenuSurfaceFoundation.prototype.setMaxHeight = function (maxHeight) {
            this.maxHeight = maxHeight;
        };
        MDCMenuSurfaceFoundation.prototype.isOpen = function () {
            return this.isSurfaceOpen;
        };
        /**
         * Open the menu surface.
         */
        MDCMenuSurfaceFoundation.prototype.open = function () {
            var _this = this;
            if (this.isSurfaceOpen) {
                return;
            }
            this.adapter.saveFocus();
            if (this.isQuickOpen) {
                this.isSurfaceOpen = true;
                this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                this.dimensions = this.adapter.getInnerDimensions();
                this.autoposition();
                this.adapter.notifyOpen();
            }
            else {
                this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
                this.animationRequestId = requestAnimationFrame(function () {
                    _this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                    _this.dimensions = _this.adapter.getInnerDimensions();
                    _this.autoposition();
                    _this.openAnimationEndTimerId = setTimeout(function () {
                        _this.openAnimationEndTimerId = 0;
                        _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
                        _this.adapter.notifyOpen();
                    }, numbers$5.TRANSITION_OPEN_DURATION);
                });
                this.isSurfaceOpen = true;
            }
        };
        /**
         * Closes the menu surface.
         */
        MDCMenuSurfaceFoundation.prototype.close = function (skipRestoreFocus) {
            var _this = this;
            if (skipRestoreFocus === void 0) { skipRestoreFocus = false; }
            if (!this.isSurfaceOpen) {
                return;
            }
            this.adapter.notifyClosing();
            if (this.isQuickOpen) {
                this.isSurfaceOpen = false;
                if (!skipRestoreFocus) {
                    this.maybeRestoreFocus();
                }
                this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
                this.adapter.notifyClose();
                return;
            }
            this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
            requestAnimationFrame(function () {
                _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
                _this.closeAnimationEndTimerId = setTimeout(function () {
                    _this.closeAnimationEndTimerId = 0;
                    _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
                    _this.adapter.notifyClose();
                }, numbers$5.TRANSITION_CLOSE_DURATION);
            });
            this.isSurfaceOpen = false;
            if (!skipRestoreFocus) {
                this.maybeRestoreFocus();
            }
        };
        /** Handle clicks and close if not within menu-surface element. */
        MDCMenuSurfaceFoundation.prototype.handleBodyClick = function (evt) {
            var el = evt.target;
            if (this.adapter.isElementInContainer(el)) {
                return;
            }
            this.close();
        };
        /** Handle keys that close the surface. */
        MDCMenuSurfaceFoundation.prototype.handleKeydown = function (evt) {
            var keyCode = evt.keyCode, key = evt.key;
            var isEscape = key === 'Escape' || keyCode === 27;
            if (isEscape) {
                this.close();
            }
        };
        MDCMenuSurfaceFoundation.prototype.autoposition = function () {
            var _a;
            // Compute measurements for autoposition methods reuse.
            this.measurements = this.getAutoLayoutmeasurements();
            var corner = this.getoriginCorner();
            var maxMenuSurfaceHeight = this.getMenuSurfaceMaxHeight(corner);
            var verticalAlignment = this.hasBit(corner, CornerBit.BOTTOM) ? 'bottom' : 'top';
            var horizontalAlignment = this.hasBit(corner, CornerBit.RIGHT) ? 'right' : 'left';
            var horizontalOffset = this.getHorizontalOriginOffset(corner);
            var verticalOffset = this.getVerticalOriginOffset(corner);
            var _b = this.measurements, anchorSize = _b.anchorSize, surfaceSize = _b.surfaceSize;
            var position = (_a = {},
                _a[horizontalAlignment] = horizontalOffset,
                _a[verticalAlignment] = verticalOffset,
                _a);
            // Center align when anchor width is comparable or greater than menu surface, otherwise keep corner.
            if (anchorSize.width / surfaceSize.width > numbers$5.ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO) {
                horizontalAlignment = 'center';
            }
            // If the menu-surface has been hoisted to the body, it's no longer relative to the anchor element
            if (this.isHoistedElement || this.isFixedPosition) {
                this.adjustPositionForHoistedElement(position);
            }
            this.adapter.setTransformOrigin(horizontalAlignment + " " + verticalAlignment);
            this.adapter.setPosition(position);
            this.adapter.setMaxHeight(maxMenuSurfaceHeight ? maxMenuSurfaceHeight + 'px' : '');
            // If it is opened from the top then add is-open-below class
            if (!this.hasBit(corner, CornerBit.BOTTOM)) {
                this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
            }
        };
        /**
         * @return Measurements used to position menu surface popup.
         */
        MDCMenuSurfaceFoundation.prototype.getAutoLayoutmeasurements = function () {
            var anchorRect = this.adapter.getAnchorDimensions();
            var bodySize = this.adapter.getBodyDimensions();
            var viewportSize = this.adapter.getWindowDimensions();
            var windowScroll = this.adapter.getWindowScroll();
            if (!anchorRect) {
                // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
                anchorRect = {
                    top: this.position.y,
                    right: this.position.x,
                    bottom: this.position.y,
                    left: this.position.x,
                    width: 0,
                    height: 0,
                };
                // tslint:enable:object-literal-sort-keys
            }
            return {
                anchorSize: anchorRect,
                bodySize: bodySize,
                surfaceSize: this.dimensions,
                viewportDistance: {
                    // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
                    top: anchorRect.top,
                    right: viewportSize.width - anchorRect.right,
                    bottom: viewportSize.height - anchorRect.bottom,
                    left: anchorRect.left,
                    // tslint:enable:object-literal-sort-keys
                },
                viewportSize: viewportSize,
                windowScroll: windowScroll,
            };
        };
        /**
         * Computes the corner of the anchor from which to animate and position the
         * menu surface.
         *
         * Only LEFT or RIGHT bit is used to position the menu surface ignoring RTL
         * context. E.g., menu surface will be positioned from right side on TOP_END.
         */
        MDCMenuSurfaceFoundation.prototype.getoriginCorner = function () {
            var corner = this.originCorner;
            var _a = this.measurements, viewportDistance = _a.viewportDistance, anchorSize = _a.anchorSize, surfaceSize = _a.surfaceSize;
            var MARGIN_TO_EDGE = MDCMenuSurfaceFoundation.numbers.MARGIN_TO_EDGE;
            var isAnchoredToBottom = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
            var availableTop;
            var availableBottom;
            if (isAnchoredToBottom) {
                availableTop =
                    viewportDistance.top - MARGIN_TO_EDGE + this.anchorMargin.bottom;
                availableBottom =
                    viewportDistance.bottom - MARGIN_TO_EDGE - this.anchorMargin.bottom;
            }
            else {
                availableTop =
                    viewportDistance.top - MARGIN_TO_EDGE + this.anchorMargin.top;
                availableBottom = viewportDistance.bottom - MARGIN_TO_EDGE +
                    anchorSize.height - this.anchorMargin.top;
            }
            var isAvailableBottom = availableBottom - surfaceSize.height > 0;
            if (!isAvailableBottom && availableTop > availableBottom) {
                // Attach bottom side of surface to the anchor.
                corner = this.setBit(corner, CornerBit.BOTTOM);
            }
            var isRtl = this.adapter.isRtl();
            var isFlipRtl = this.hasBit(this.anchorCorner, CornerBit.FLIP_RTL);
            var hasRightBit = this.hasBit(this.anchorCorner, CornerBit.RIGHT) ||
                this.hasBit(corner, CornerBit.RIGHT);
            // Whether surface attached to right side of anchor element.
            var isAnchoredToRight = false;
            // Anchored to start
            if (isRtl && isFlipRtl) {
                isAnchoredToRight = !hasRightBit;
            }
            else {
                // Anchored to right
                isAnchoredToRight = hasRightBit;
            }
            var availableLeft;
            var availableRight;
            if (isAnchoredToRight) {
                availableLeft =
                    viewportDistance.left + anchorSize.width + this.anchorMargin.right;
                availableRight = viewportDistance.right - this.anchorMargin.right;
            }
            else {
                availableLeft = viewportDistance.left + this.anchorMargin.left;
                availableRight =
                    viewportDistance.right + anchorSize.width - this.anchorMargin.left;
            }
            var isAvailableLeft = availableLeft - surfaceSize.width > 0;
            var isAvailableRight = availableRight - surfaceSize.width > 0;
            var isOriginCornerAlignedToEnd = this.hasBit(corner, CornerBit.FLIP_RTL) &&
                this.hasBit(corner, CornerBit.RIGHT);
            if (isAvailableRight && isOriginCornerAlignedToEnd && isRtl ||
                !isAvailableLeft && isOriginCornerAlignedToEnd) {
                // Attach left side of surface to the anchor.
                corner = this.unsetBit(corner, CornerBit.RIGHT);
            }
            else if (isAvailableLeft && isAnchoredToRight && isRtl ||
                (isAvailableLeft && !isAnchoredToRight && hasRightBit) ||
                (!isAvailableRight && availableLeft >= availableRight)) {
                // Attach right side of surface to the anchor.
                corner = this.setBit(corner, CornerBit.RIGHT);
            }
            return corner;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Maximum height of the menu surface, based on available space. 0 indicates should not be set.
         */
        MDCMenuSurfaceFoundation.prototype.getMenuSurfaceMaxHeight = function (corner) {
            if (this.maxHeight > 0) {
                return this.maxHeight;
            }
            var viewportDistance = this.measurements.viewportDistance;
            var maxHeight = 0;
            var isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
            var isBottomAnchored = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
            var MARGIN_TO_EDGE = MDCMenuSurfaceFoundation.numbers.MARGIN_TO_EDGE;
            // When maximum height is not specified, it is handled from CSS.
            if (isBottomAligned) {
                maxHeight = viewportDistance.top + this.anchorMargin.top - MARGIN_TO_EDGE;
                if (!isBottomAnchored) {
                    maxHeight += this.measurements.anchorSize.height;
                }
            }
            else {
                maxHeight = viewportDistance.bottom - this.anchorMargin.bottom +
                    this.measurements.anchorSize.height - MARGIN_TO_EDGE;
                if (isBottomAnchored) {
                    maxHeight -= this.measurements.anchorSize.height;
                }
            }
            return maxHeight;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Horizontal offset of menu surface origin corner from corresponding anchor corner.
         */
        MDCMenuSurfaceFoundation.prototype.getHorizontalOriginOffset = function (corner) {
            var anchorSize = this.measurements.anchorSize;
            // isRightAligned corresponds to using the 'right' property on the surface.
            var isRightAligned = this.hasBit(corner, CornerBit.RIGHT);
            var avoidHorizontalOverlap = this.hasBit(this.anchorCorner, CornerBit.RIGHT);
            if (isRightAligned) {
                var rightOffset = avoidHorizontalOverlap ?
                    anchorSize.width - this.anchorMargin.left :
                    this.anchorMargin.right;
                // For hoisted or fixed elements, adjust the offset by the difference
                // between viewport width and body width so when we calculate the right
                // value (`adjustPositionForHoistedElement`) based on the element
                // position, the right property is correct.
                if (this.isHoistedElement || this.isFixedPosition) {
                    return rightOffset -
                        (this.measurements.viewportSize.width -
                            this.measurements.bodySize.width);
                }
                return rightOffset;
            }
            return avoidHorizontalOverlap ? anchorSize.width - this.anchorMargin.right :
                this.anchorMargin.left;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Vertical offset of menu surface origin corner from corresponding anchor corner.
         */
        MDCMenuSurfaceFoundation.prototype.getVerticalOriginOffset = function (corner) {
            var anchorSize = this.measurements.anchorSize;
            var isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
            var avoidVerticalOverlap = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
            var y = 0;
            if (isBottomAligned) {
                y = avoidVerticalOverlap ? anchorSize.height - this.anchorMargin.top :
                    -this.anchorMargin.bottom;
            }
            else {
                y = avoidVerticalOverlap ?
                    (anchorSize.height + this.anchorMargin.bottom) :
                    this.anchorMargin.top;
            }
            return y;
        };
        /** Calculates the offsets for positioning the menu-surface when the menu-surface has been hoisted to the body. */
        MDCMenuSurfaceFoundation.prototype.adjustPositionForHoistedElement = function (position) {
            var e_1, _a;
            var _b = this.measurements, windowScroll = _b.windowScroll, viewportDistance = _b.viewportDistance, surfaceSize = _b.surfaceSize, viewportSize = _b.viewportSize;
            var props = Object.keys(position);
            try {
                for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
                    var prop = props_1_1.value;
                    var value = position[prop] || 0;
                    if (this.isHorizontallyCenteredOnViewport &&
                        (prop === 'left' || prop === 'right')) {
                        position[prop] = (viewportSize.width - surfaceSize.width) / 2;
                        continue;
                    }
                    // Hoisted surfaces need to have the anchor elements location on the page added to the
                    // position properties for proper alignment on the body.
                    value += viewportDistance[prop];
                    // Surfaces that are absolutely positioned need to have additional calculations for scroll
                    // and bottom positioning.
                    if (!this.isFixedPosition) {
                        if (prop === 'top') {
                            value += windowScroll.y;
                        }
                        else if (prop === 'bottom') {
                            value -= windowScroll.y;
                        }
                        else if (prop === 'left') {
                            value += windowScroll.x;
                        }
                        else { // prop === 'right'
                            value -= windowScroll.x;
                        }
                    }
                    position[prop] = value;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * The last focused element when the menu surface was opened should regain focus, if the user is
         * focused on or within the menu surface when it is closed.
         */
        MDCMenuSurfaceFoundation.prototype.maybeRestoreFocus = function () {
            var isRootFocused = this.adapter.isFocused();
            var childHasFocus = document.activeElement &&
                this.adapter.isElementInContainer(document.activeElement);
            if (isRootFocused || childHasFocus) {
                this.adapter.restoreFocus();
            }
        };
        MDCMenuSurfaceFoundation.prototype.hasBit = function (corner, bit) {
            return Boolean(corner & bit); // tslint:disable-line:no-bitwise
        };
        MDCMenuSurfaceFoundation.prototype.setBit = function (corner, bit) {
            return corner | bit; // tslint:disable-line:no-bitwise
        };
        MDCMenuSurfaceFoundation.prototype.unsetBit = function (corner, bit) {
            return corner ^ bit;
        };
        /**
         * isFinite that doesn't force conversion to number type.
         * Equivalent to Number.isFinite in ES2015, which is not supported in IE.
         */
        MDCMenuSurfaceFoundation.prototype.isFinite = function (num) {
            return typeof num === 'number' && isFinite(num);
        };
        return MDCMenuSurfaceFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssPropertyNameMap = {
        animation: {
            prefixed: '-webkit-animation',
            standard: 'animation',
        },
        transform: {
            prefixed: '-webkit-transform',
            standard: 'transform',
        },
        transition: {
            prefixed: '-webkit-transition',
            standard: 'transition',
        },
    };
    function isWindow(windowObj) {
        return Boolean(windowObj.document) && typeof windowObj.document.createElement === 'function';
    }
    function getCorrectPropertyName(windowObj, cssProperty) {
        if (isWindow(windowObj) && cssProperty in cssPropertyNameMap) {
            var el = windowObj.document.createElement('div');
            var _a = cssPropertyNameMap[cssProperty], standard = _a.standard, prefixed = _a.prefixed;
            var isStandard = standard in el.style;
            return isStandard ? standard : prefixed;
        }
        return cssProperty;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$6 = {
        MENU_SELECTED_LIST_ITEM: 'mdc-menu-item--selected',
        MENU_SELECTION_GROUP: 'mdc-menu__selection-group',
        ROOT: 'mdc-menu',
    };
    var strings$7 = {
        ARIA_CHECKED_ATTR: 'aria-checked',
        ARIA_DISABLED_ATTR: 'aria-disabled',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]',
        LIST_SELECTOR: '.mdc-list,.mdc-deprecated-list',
        SELECTED_EVENT: 'MDCMenu:selected',
    };
    var numbers$3 = {
        FOCUS_ROOT_INDEX: -1,
    };
    var DefaultFocusState;
    (function (DefaultFocusState) {
        DefaultFocusState[DefaultFocusState["NONE"] = 0] = "NONE";
        DefaultFocusState[DefaultFocusState["LIST_ROOT"] = 1] = "LIST_ROOT";
        DefaultFocusState[DefaultFocusState["FIRST_ITEM"] = 2] = "FIRST_ITEM";
        DefaultFocusState[DefaultFocusState["LAST_ITEM"] = 3] = "LAST_ITEM";
    })(DefaultFocusState || (DefaultFocusState = {}));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenuFoundation = /** @class */ (function (_super) {
        __extends(MDCMenuFoundation, _super);
        function MDCMenuFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCMenuFoundation.defaultAdapter), adapter)) || this;
            _this.closeAnimationEndTimerId_ = 0;
            _this.defaultFocusState_ = DefaultFocusState.LIST_ROOT;
            return _this;
        }
        Object.defineProperty(MDCMenuFoundation, "cssClasses", {
            get: function () {
                return cssClasses$6;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "strings", {
            get: function () {
                return strings$7;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "numbers", {
            get: function () {
                return numbers$3;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "defaultAdapter", {
            /**
             * @see {@link MDCMenuAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClassToElementAtIndex: function () { return undefined; },
                    removeClassFromElementAtIndex: function () { return undefined; },
                    addAttributeToElementAtIndex: function () { return undefined; },
                    removeAttributeFromElementAtIndex: function () { return undefined; },
                    elementContainsClass: function () { return false; },
                    closeSurface: function () { return undefined; },
                    getElementIndex: function () { return -1; },
                    notifySelected: function () { return undefined; },
                    getMenuItemCount: function () { return 0; },
                    focusItemAtIndex: function () { return undefined; },
                    focusListRoot: function () { return undefined; },
                    getSelectedSiblingOfItemAtIndex: function () { return -1; },
                    isSelectableItemAtIndex: function () { return false; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCMenuFoundation.prototype.destroy = function () {
            if (this.closeAnimationEndTimerId_) {
                clearTimeout(this.closeAnimationEndTimerId_);
            }
            this.adapter.closeSurface();
        };
        MDCMenuFoundation.prototype.handleKeydown = function (evt) {
            var key = evt.key, keyCode = evt.keyCode;
            var isTab = key === 'Tab' || keyCode === 9;
            if (isTab) {
                this.adapter.closeSurface(/** skipRestoreFocus */ true);
            }
        };
        MDCMenuFoundation.prototype.handleItemAction = function (listItem) {
            var _this = this;
            var index = this.adapter.getElementIndex(listItem);
            if (index < 0) {
                return;
            }
            this.adapter.notifySelected({ index: index });
            this.adapter.closeSurface();
            // Wait for the menu to close before adding/removing classes that affect styles.
            this.closeAnimationEndTimerId_ = setTimeout(function () {
                // Recompute the index in case the menu contents have changed.
                var recomputedIndex = _this.adapter.getElementIndex(listItem);
                if (recomputedIndex >= 0 &&
                    _this.adapter.isSelectableItemAtIndex(recomputedIndex)) {
                    _this.setSelectedIndex(recomputedIndex);
                }
            }, MDCMenuSurfaceFoundation.numbers.TRANSITION_CLOSE_DURATION);
        };
        MDCMenuFoundation.prototype.handleMenuSurfaceOpened = function () {
            switch (this.defaultFocusState_) {
                case DefaultFocusState.FIRST_ITEM:
                    this.adapter.focusItemAtIndex(0);
                    break;
                case DefaultFocusState.LAST_ITEM:
                    this.adapter.focusItemAtIndex(this.adapter.getMenuItemCount() - 1);
                    break;
                case DefaultFocusState.NONE:
                    // Do nothing.
                    break;
                default:
                    this.adapter.focusListRoot();
                    break;
            }
        };
        /**
         * Sets default focus state where the menu should focus every time when menu
         * is opened. Focuses the list root (`DefaultFocusState.LIST_ROOT`) element by
         * default.
         */
        MDCMenuFoundation.prototype.setDefaultFocusState = function (focusState) {
            this.defaultFocusState_ = focusState;
        };
        /**
         * Selects the list item at `index` within the menu.
         * @param index Index of list item within the menu.
         */
        MDCMenuFoundation.prototype.setSelectedIndex = function (index) {
            this.validatedIndex_(index);
            if (!this.adapter.isSelectableItemAtIndex(index)) {
                throw new Error('MDCMenuFoundation: No selection group at specified index.');
            }
            var prevSelectedIndex = this.adapter.getSelectedSiblingOfItemAtIndex(index);
            if (prevSelectedIndex >= 0) {
                this.adapter.removeAttributeFromElementAtIndex(prevSelectedIndex, strings$7.ARIA_CHECKED_ATTR);
                this.adapter.removeClassFromElementAtIndex(prevSelectedIndex, cssClasses$6.MENU_SELECTED_LIST_ITEM);
            }
            this.adapter.addClassToElementAtIndex(index, cssClasses$6.MENU_SELECTED_LIST_ITEM);
            this.adapter.addAttributeToElementAtIndex(index, strings$7.ARIA_CHECKED_ATTR, 'true');
        };
        /**
         * Sets the enabled state to isEnabled for the menu item at the given index.
         * @param index Index of the menu item
         * @param isEnabled The desired enabled state of the menu item.
         */
        MDCMenuFoundation.prototype.setEnabled = function (index, isEnabled) {
            this.validatedIndex_(index);
            if (isEnabled) {
                this.adapter.removeClassFromElementAtIndex(index, cssClasses$7.LIST_ITEM_DISABLED_CLASS);
                this.adapter.addAttributeToElementAtIndex(index, strings$7.ARIA_DISABLED_ATTR, 'false');
            }
            else {
                this.adapter.addClassToElementAtIndex(index, cssClasses$7.LIST_ITEM_DISABLED_CLASS);
                this.adapter.addAttributeToElementAtIndex(index, strings$7.ARIA_DISABLED_ATTR, 'true');
            }
        };
        MDCMenuFoundation.prototype.validatedIndex_ = function (index) {
            var menuSize = this.adapter.getMenuItemCount();
            var isIndexInRange = index >= 0 && index < menuSize;
            if (!isIndexInRange) {
                throw new Error('MDCMenuFoundation: No list item at specified index.');
            }
        };
        return MDCMenuFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$6 = {
        NOTCH_ELEMENT_SELECTOR: '.mdc-notched-outline__notch',
    };
    var numbers$2 = {
        // This should stay in sync with $mdc-notched-outline-padding * 2.
        NOTCH_ELEMENT_PADDING: 8,
    };
    var cssClasses$5 = {
        NO_LABEL: 'mdc-notched-outline--no-label',
        OUTLINE_NOTCHED: 'mdc-notched-outline--notched',
        OUTLINE_UPGRADED: 'mdc-notched-outline--upgraded',
    };

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCNotchedOutlineFoundation = /** @class */ (function (_super) {
        __extends(MDCNotchedOutlineFoundation, _super);
        function MDCNotchedOutlineFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCNotchedOutlineFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCNotchedOutlineFoundation, "strings", {
            get: function () {
                return strings$6;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCNotchedOutlineFoundation, "cssClasses", {
            get: function () {
                return cssClasses$5;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCNotchedOutlineFoundation, "numbers", {
            get: function () {
                return numbers$2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCNotchedOutlineFoundation, "defaultAdapter", {
            /**
             * See {@link MDCNotchedOutlineAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    setNotchWidthProperty: function () { return undefined; },
                    removeNotchWidthProperty: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Adds the outline notched selector and updates the notch width calculated based off of notchWidth.
         */
        MDCNotchedOutlineFoundation.prototype.notch = function (notchWidth) {
            var OUTLINE_NOTCHED = MDCNotchedOutlineFoundation.cssClasses.OUTLINE_NOTCHED;
            if (notchWidth > 0) {
                notchWidth += numbers$2.NOTCH_ELEMENT_PADDING; // Add padding from left/right.
            }
            this.adapter.setNotchWidthProperty(notchWidth);
            this.adapter.addClass(OUTLINE_NOTCHED);
        };
        /**
         * Removes notched outline selector to close the notch in the outline.
         */
        MDCNotchedOutlineFoundation.prototype.closeNotch = function () {
            var OUTLINE_NOTCHED = MDCNotchedOutlineFoundation.cssClasses.OUTLINE_NOTCHED;
            this.adapter.removeClass(OUTLINE_NOTCHED);
            this.adapter.removeNotchWidthProperty();
        };
        return MDCNotchedOutlineFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$4 = {
        ACTIVATED: 'mdc-select--activated',
        DISABLED: 'mdc-select--disabled',
        FOCUSED: 'mdc-select--focused',
        INVALID: 'mdc-select--invalid',
        MENU_INVALID: 'mdc-select__menu--invalid',
        OUTLINED: 'mdc-select--outlined',
        REQUIRED: 'mdc-select--required',
        ROOT: 'mdc-select',
        WITH_LEADING_ICON: 'mdc-select--with-leading-icon',
    };
    var strings$5 = {
        ARIA_CONTROLS: 'aria-controls',
        ARIA_DESCRIBEDBY: 'aria-describedby',
        ARIA_SELECTED_ATTR: 'aria-selected',
        CHANGE_EVENT: 'MDCSelect:change',
        HIDDEN_INPUT_SELECTOR: 'input[type="hidden"]',
        LABEL_SELECTOR: '.mdc-floating-label',
        LEADING_ICON_SELECTOR: '.mdc-select__icon',
        LINE_RIPPLE_SELECTOR: '.mdc-line-ripple',
        MENU_SELECTOR: '.mdc-select__menu',
        OUTLINE_SELECTOR: '.mdc-notched-outline',
        SELECTED_TEXT_SELECTOR: '.mdc-select__selected-text',
        SELECT_ANCHOR_SELECTOR: '.mdc-select__anchor',
        VALUE_ATTR: 'data-value',
    };
    var numbers$1 = {
        LABEL_SCALE: 0.75,
        UNSET_INDEX: -1,
        CLICK_DEBOUNCE_TIMEOUT_MS: 330,
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCSelectFoundation = /** @class */ (function (_super) {
        __extends(MDCSelectFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        /**
         * @param adapter
         * @param foundationMap Map from subcomponent names to their subfoundations.
         */
        function MDCSelectFoundation(adapter, foundationMap) {
            if (foundationMap === void 0) { foundationMap = {}; }
            var _this = _super.call(this, __assign(__assign({}, MDCSelectFoundation.defaultAdapter), adapter)) || this;
            // Disabled state
            _this.disabled = false;
            // isMenuOpen is used to track the state of the menu by listening to the
            // MDCMenuSurface:closed event For reference, menu.open will return false if
            // the menu is still closing, but isMenuOpen returns false only after the menu
            // has closed
            _this.isMenuOpen = false;
            // By default, select is invalid if it is required but no value is selected.
            _this.useDefaultValidation = true;
            _this.customValidity = true;
            _this.lastSelectedIndex = numbers$1.UNSET_INDEX;
            _this.clickDebounceTimeout = 0;
            _this.recentlyClicked = false;
            _this.leadingIcon = foundationMap.leadingIcon;
            _this.helperText = foundationMap.helperText;
            return _this;
        }
        Object.defineProperty(MDCSelectFoundation, "cssClasses", {
            get: function () {
                return cssClasses$4;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCSelectFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCSelectFoundation, "strings", {
            get: function () {
                return strings$5;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCSelectFoundation, "defaultAdapter", {
            /**
             * See {@link MDCSelectAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    activateBottomLine: function () { return undefined; },
                    deactivateBottomLine: function () { return undefined; },
                    getSelectedIndex: function () { return -1; },
                    setSelectedIndex: function () { return undefined; },
                    hasLabel: function () { return false; },
                    floatLabel: function () { return undefined; },
                    getLabelWidth: function () { return 0; },
                    setLabelRequired: function () { return undefined; },
                    hasOutline: function () { return false; },
                    notchOutline: function () { return undefined; },
                    closeOutline: function () { return undefined; },
                    setRippleCenter: function () { return undefined; },
                    notifyChange: function () { return undefined; },
                    setSelectedText: function () { return undefined; },
                    isSelectAnchorFocused: function () { return false; },
                    getSelectAnchorAttr: function () { return ''; },
                    setSelectAnchorAttr: function () { return undefined; },
                    removeSelectAnchorAttr: function () { return undefined; },
                    addMenuClass: function () { return undefined; },
                    removeMenuClass: function () { return undefined; },
                    openMenu: function () { return undefined; },
                    closeMenu: function () { return undefined; },
                    getAnchorElement: function () { return null; },
                    setMenuAnchorElement: function () { return undefined; },
                    setMenuAnchorCorner: function () { return undefined; },
                    setMenuWrapFocus: function () { return undefined; },
                    focusMenuItemAtIndex: function () { return undefined; },
                    getMenuItemCount: function () { return 0; },
                    getMenuItemValues: function () { return []; },
                    getMenuItemTextAtIndex: function () { return ''; },
                    isTypeaheadInProgress: function () { return false; },
                    typeaheadMatchItem: function () { return -1; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        /** Returns the index of the currently selected menu item, or -1 if none. */
        MDCSelectFoundation.prototype.getSelectedIndex = function () {
            return this.adapter.getSelectedIndex();
        };
        MDCSelectFoundation.prototype.setSelectedIndex = function (index, closeMenu, skipNotify) {
            if (closeMenu === void 0) { closeMenu = false; }
            if (skipNotify === void 0) { skipNotify = false; }
            if (index >= this.adapter.getMenuItemCount()) {
                return;
            }
            if (index === numbers$1.UNSET_INDEX) {
                this.adapter.setSelectedText('');
            }
            else {
                this.adapter.setSelectedText(this.adapter.getMenuItemTextAtIndex(index).trim());
            }
            this.adapter.setSelectedIndex(index);
            if (closeMenu) {
                this.adapter.closeMenu();
            }
            if (!skipNotify && this.lastSelectedIndex !== index) {
                this.handleChange();
            }
            this.lastSelectedIndex = index;
        };
        MDCSelectFoundation.prototype.setValue = function (value, skipNotify) {
            if (skipNotify === void 0) { skipNotify = false; }
            var index = this.adapter.getMenuItemValues().indexOf(value);
            this.setSelectedIndex(index, /** closeMenu */ false, skipNotify);
        };
        MDCSelectFoundation.prototype.getValue = function () {
            var index = this.adapter.getSelectedIndex();
            var menuItemValues = this.adapter.getMenuItemValues();
            return index !== numbers$1.UNSET_INDEX ? menuItemValues[index] : '';
        };
        MDCSelectFoundation.prototype.getDisabled = function () {
            return this.disabled;
        };
        MDCSelectFoundation.prototype.setDisabled = function (isDisabled) {
            this.disabled = isDisabled;
            if (this.disabled) {
                this.adapter.addClass(cssClasses$4.DISABLED);
                this.adapter.closeMenu();
            }
            else {
                this.adapter.removeClass(cssClasses$4.DISABLED);
            }
            if (this.leadingIcon) {
                this.leadingIcon.setDisabled(this.disabled);
            }
            if (this.disabled) {
                // Prevent click events from focusing select. Simply pointer-events: none
                // is not enough since screenreader clicks may bypass this.
                this.adapter.removeSelectAnchorAttr('tabindex');
            }
            else {
                this.adapter.setSelectAnchorAttr('tabindex', '0');
            }
            this.adapter.setSelectAnchorAttr('aria-disabled', this.disabled.toString());
        };
        /** Opens the menu. */
        MDCSelectFoundation.prototype.openMenu = function () {
            this.adapter.addClass(cssClasses$4.ACTIVATED);
            this.adapter.openMenu();
            this.isMenuOpen = true;
            this.adapter.setSelectAnchorAttr('aria-expanded', 'true');
        };
        /**
         * @param content Sets the content of the helper text.
         */
        MDCSelectFoundation.prototype.setHelperTextContent = function (content) {
            if (this.helperText) {
                this.helperText.setContent(content);
            }
        };
        /**
         * Re-calculates if the notched outline should be notched and if the label
         * should float.
         */
        MDCSelectFoundation.prototype.layout = function () {
            if (this.adapter.hasLabel()) {
                var optionHasValue = this.getValue().length > 0;
                var isFocused = this.adapter.hasClass(cssClasses$4.FOCUSED);
                var shouldFloatAndNotch = optionHasValue || isFocused;
                var isRequired = this.adapter.hasClass(cssClasses$4.REQUIRED);
                this.notchOutline(shouldFloatAndNotch);
                this.adapter.floatLabel(shouldFloatAndNotch);
                this.adapter.setLabelRequired(isRequired);
            }
        };
        /**
         * Synchronizes the list of options with the state of the foundation. Call
         * this whenever menu options are dynamically updated.
         */
        MDCSelectFoundation.prototype.layoutOptions = function () {
            var menuItemValues = this.adapter.getMenuItemValues();
            var selectedIndex = menuItemValues.indexOf(this.getValue());
            this.setSelectedIndex(selectedIndex, /** closeMenu */ false, /** skipNotify */ true);
        };
        MDCSelectFoundation.prototype.handleMenuOpened = function () {
            if (this.adapter.getMenuItemValues().length === 0) {
                return;
            }
            // Menu should open to the last selected element, should open to first menu item otherwise.
            var selectedIndex = this.getSelectedIndex();
            var focusItemIndex = selectedIndex >= 0 ? selectedIndex : 0;
            this.adapter.focusMenuItemAtIndex(focusItemIndex);
        };
        MDCSelectFoundation.prototype.handleMenuClosing = function () {
            this.adapter.setSelectAnchorAttr('aria-expanded', 'false');
        };
        MDCSelectFoundation.prototype.handleMenuClosed = function () {
            this.adapter.removeClass(cssClasses$4.ACTIVATED);
            this.isMenuOpen = false;
            // Unfocus the select if menu is closed without a selection
            if (!this.adapter.isSelectAnchorFocused()) {
                this.blur();
            }
        };
        /**
         * Handles value changes, via change event or programmatic updates.
         */
        MDCSelectFoundation.prototype.handleChange = function () {
            this.layout();
            this.adapter.notifyChange(this.getValue());
            var isRequired = this.adapter.hasClass(cssClasses$4.REQUIRED);
            if (isRequired && this.useDefaultValidation) {
                this.setValid(this.isValid());
            }
        };
        MDCSelectFoundation.prototype.handleMenuItemAction = function (index) {
            this.setSelectedIndex(index, /** closeMenu */ true);
        };
        /**
         * Handles focus events from select element.
         */
        MDCSelectFoundation.prototype.handleFocus = function () {
            this.adapter.addClass(cssClasses$4.FOCUSED);
            this.layout();
            this.adapter.activateBottomLine();
        };
        /**
         * Handles blur events from select element.
         */
        MDCSelectFoundation.prototype.handleBlur = function () {
            if (this.isMenuOpen) {
                return;
            }
            this.blur();
        };
        MDCSelectFoundation.prototype.handleClick = function (normalizedX) {
            if (this.disabled || this.recentlyClicked) {
                return;
            }
            this.setClickDebounceTimeout();
            if (this.isMenuOpen) {
                this.adapter.closeMenu();
                return;
            }
            this.adapter.setRippleCenter(normalizedX);
            this.openMenu();
        };
        /**
         * Handles keydown events on select element. Depending on the type of
         * character typed, does typeahead matching or opens menu.
         */
        MDCSelectFoundation.prototype.handleKeydown = function (event) {
            if (this.isMenuOpen || !this.adapter.hasClass(cssClasses$4.FOCUSED)) {
                return;
            }
            var isEnter = normalizeKey(event) === KEY.ENTER;
            var isSpace = normalizeKey(event) === KEY.SPACEBAR;
            var arrowUp = normalizeKey(event) === KEY.ARROW_UP;
            var arrowDown = normalizeKey(event) === KEY.ARROW_DOWN;
            var isModifier = event.ctrlKey || event.metaKey;
            // Typeahead
            if (!isModifier &&
                (!isSpace && event.key && event.key.length === 1 ||
                    isSpace && this.adapter.isTypeaheadInProgress())) {
                var key = isSpace ? ' ' : event.key;
                var typeaheadNextIndex = this.adapter.typeaheadMatchItem(key, this.getSelectedIndex());
                if (typeaheadNextIndex >= 0) {
                    this.setSelectedIndex(typeaheadNextIndex);
                }
                event.preventDefault();
                return;
            }
            if (!isEnter && !isSpace && !arrowUp && !arrowDown) {
                return;
            }
            // Increment/decrement index as necessary and open menu.
            if (arrowUp && this.getSelectedIndex() > 0) {
                this.setSelectedIndex(this.getSelectedIndex() - 1);
            }
            else if (arrowDown &&
                this.getSelectedIndex() < this.adapter.getMenuItemCount() - 1) {
                this.setSelectedIndex(this.getSelectedIndex() + 1);
            }
            this.openMenu();
            event.preventDefault();
        };
        /**
         * Opens/closes the notched outline.
         */
        MDCSelectFoundation.prototype.notchOutline = function (openNotch) {
            if (!this.adapter.hasOutline()) {
                return;
            }
            var isFocused = this.adapter.hasClass(cssClasses$4.FOCUSED);
            if (openNotch) {
                var labelScale = numbers$1.LABEL_SCALE;
                var labelWidth = this.adapter.getLabelWidth() * labelScale;
                this.adapter.notchOutline(labelWidth);
            }
            else if (!isFocused) {
                this.adapter.closeOutline();
            }
        };
        /**
         * Sets the aria label of the leading icon.
         */
        MDCSelectFoundation.prototype.setLeadingIconAriaLabel = function (label) {
            if (this.leadingIcon) {
                this.leadingIcon.setAriaLabel(label);
            }
        };
        /**
         * Sets the text content of the leading icon.
         */
        MDCSelectFoundation.prototype.setLeadingIconContent = function (content) {
            if (this.leadingIcon) {
                this.leadingIcon.setContent(content);
            }
        };
        MDCSelectFoundation.prototype.setUseDefaultValidation = function (useDefaultValidation) {
            this.useDefaultValidation = useDefaultValidation;
        };
        MDCSelectFoundation.prototype.setValid = function (isValid) {
            if (!this.useDefaultValidation) {
                this.customValidity = isValid;
            }
            this.adapter.setSelectAnchorAttr('aria-invalid', (!isValid).toString());
            if (isValid) {
                this.adapter.removeClass(cssClasses$4.INVALID);
                this.adapter.removeMenuClass(cssClasses$4.MENU_INVALID);
            }
            else {
                this.adapter.addClass(cssClasses$4.INVALID);
                this.adapter.addMenuClass(cssClasses$4.MENU_INVALID);
            }
            this.syncHelperTextValidity(isValid);
        };
        MDCSelectFoundation.prototype.isValid = function () {
            if (this.useDefaultValidation &&
                this.adapter.hasClass(cssClasses$4.REQUIRED) &&
                !this.adapter.hasClass(cssClasses$4.DISABLED)) {
                // See notes for required attribute under https://www.w3.org/TR/html52/sec-forms.html#the-select-element
                // TL;DR: Invalid if no index is selected, or if the first index is selected and has an empty value.
                return this.getSelectedIndex() !== numbers$1.UNSET_INDEX &&
                    (this.getSelectedIndex() !== 0 || Boolean(this.getValue()));
            }
            return this.customValidity;
        };
        MDCSelectFoundation.prototype.setRequired = function (isRequired) {
            if (isRequired) {
                this.adapter.addClass(cssClasses$4.REQUIRED);
            }
            else {
                this.adapter.removeClass(cssClasses$4.REQUIRED);
            }
            this.adapter.setSelectAnchorAttr('aria-required', isRequired.toString());
            this.adapter.setLabelRequired(isRequired);
        };
        MDCSelectFoundation.prototype.getRequired = function () {
            return this.adapter.getSelectAnchorAttr('aria-required') === 'true';
        };
        MDCSelectFoundation.prototype.init = function () {
            var anchorEl = this.adapter.getAnchorElement();
            if (anchorEl) {
                this.adapter.setMenuAnchorElement(anchorEl);
                this.adapter.setMenuAnchorCorner(Corner.BOTTOM_START);
            }
            this.adapter.setMenuWrapFocus(false);
            this.setDisabled(this.adapter.hasClass(cssClasses$4.DISABLED));
            this.syncHelperTextValidity(!this.adapter.hasClass(cssClasses$4.INVALID));
            this.layout();
            this.layoutOptions();
        };
        /**
         * Unfocuses the select component.
         */
        MDCSelectFoundation.prototype.blur = function () {
            this.adapter.removeClass(cssClasses$4.FOCUSED);
            this.layout();
            this.adapter.deactivateBottomLine();
            var isRequired = this.adapter.hasClass(cssClasses$4.REQUIRED);
            if (isRequired && this.useDefaultValidation) {
                this.setValid(this.isValid());
            }
        };
        MDCSelectFoundation.prototype.syncHelperTextValidity = function (isValid) {
            if (!this.helperText) {
                return;
            }
            this.helperText.setValidity(isValid);
            var helperTextVisible = this.helperText.isVisible();
            var helperTextId = this.helperText.getId();
            if (helperTextVisible && helperTextId) {
                this.adapter.setSelectAnchorAttr(strings$5.ARIA_DESCRIBEDBY, helperTextId);
            }
            else {
                // Needed because screenreaders will read labels pointed to by
                // `aria-describedby` even if they are `aria-hidden`.
                this.adapter.removeSelectAnchorAttr(strings$5.ARIA_DESCRIBEDBY);
            }
        };
        MDCSelectFoundation.prototype.setClickDebounceTimeout = function () {
            var _this = this;
            clearTimeout(this.clickDebounceTimeout);
            this.clickDebounceTimeout = setTimeout(function () {
                _this.recentlyClicked = false;
            }, numbers$1.CLICK_DEBOUNCE_TIMEOUT_MS);
            this.recentlyClicked = true;
        };
        return MDCSelectFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$4 = {
        ARIA_HIDDEN: 'aria-hidden',
        ROLE: 'role',
    };
    var cssClasses$3 = {
        HELPER_TEXT_VALIDATION_MSG: 'mdc-select-helper-text--validation-msg',
        HELPER_TEXT_VALIDATION_MSG_PERSISTENT: 'mdc-select-helper-text--validation-msg-persistent',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCSelectHelperTextFoundation = /** @class */ (function (_super) {
        __extends(MDCSelectHelperTextFoundation, _super);
        function MDCSelectHelperTextFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCSelectHelperTextFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCSelectHelperTextFoundation, "cssClasses", {
            get: function () {
                return cssClasses$3;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCSelectHelperTextFoundation, "strings", {
            get: function () {
                return strings$4;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCSelectHelperTextFoundation, "defaultAdapter", {
            /**
             * See {@link MDCSelectHelperTextAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setAttr: function () { return undefined; },
                    getAttr: function () { return null; },
                    removeAttr: function () { return undefined; },
                    setContent: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @return The ID of the helper text, or null if none is set.
         */
        MDCSelectHelperTextFoundation.prototype.getId = function () {
            return this.adapter.getAttr('id');
        };
        /**
         * @return Whether the helper text is currently visible.
         */
        MDCSelectHelperTextFoundation.prototype.isVisible = function () {
            return this.adapter.getAttr(strings$4.ARIA_HIDDEN) !== 'true';
        };
        /**
         * Sets the content of the helper text field.
         */
        MDCSelectHelperTextFoundation.prototype.setContent = function (content) {
            this.adapter.setContent(content);
        };
        /**
         * Sets the helper text to act as a validation message.
         * By default, validation messages are hidden when the select is valid and
         * visible when the select is invalid.
         *
         * @param isValidation True to make the helper text act as an error validation
         *     message.
         */
        MDCSelectHelperTextFoundation.prototype.setValidation = function (isValidation) {
            if (isValidation) {
                this.adapter.addClass(cssClasses$3.HELPER_TEXT_VALIDATION_MSG);
            }
            else {
                this.adapter.removeClass(cssClasses$3.HELPER_TEXT_VALIDATION_MSG);
            }
        };
        /**
         * Sets the persistency of the validation helper text.
         * This keeps the validation message visible even if the select is valid,
         * though it will be displayed in the normal (grey) color.
         */
        MDCSelectHelperTextFoundation.prototype.setValidationMsgPersistent = function (isPersistent) {
            if (isPersistent) {
                this.adapter.addClass(cssClasses$3.HELPER_TEXT_VALIDATION_MSG_PERSISTENT);
            }
            else {
                this.adapter.removeClass(cssClasses$3.HELPER_TEXT_VALIDATION_MSG_PERSISTENT);
            }
        };
        /**
         * When acting as a validation message, shows/hides the helper text and
         * triggers alerts as necessary based on the select's validity.
         */
        MDCSelectHelperTextFoundation.prototype.setValidity = function (selectIsValid) {
            var isValidationMsg = this.adapter.hasClass(cssClasses$3.HELPER_TEXT_VALIDATION_MSG);
            if (!isValidationMsg) {
                // Non-validating helper-text is always displayed and does not participate
                // in validation logic.
                return;
            }
            var isPersistentValidationMsg = this.adapter.hasClass(cssClasses$3.HELPER_TEXT_VALIDATION_MSG_PERSISTENT);
            // Validating helper text is displayed if select is invalid, unless it is
            // set as persistent, in which case it always displays.
            var msgShouldDisplay = !selectIsValid || isPersistentValidationMsg;
            if (msgShouldDisplay) {
                this.showToScreenReader();
                // In addition to displaying, also trigger an alert if the select
                // has become invalid.
                if (!selectIsValid) {
                    this.adapter.setAttr(strings$4.ROLE, 'alert');
                }
                else {
                    this.adapter.removeAttr(strings$4.ROLE);
                }
                return;
            }
            // Hide everything.
            this.adapter.removeAttr(strings$4.ROLE);
            this.hide();
        };
        /**
         * Makes the helper text visible to screen readers.
         */
        MDCSelectHelperTextFoundation.prototype.showToScreenReader = function () {
            this.adapter.removeAttr(strings$4.ARIA_HIDDEN);
        };
        /**
         * Hides the help text from screen readers.
         */
        MDCSelectHelperTextFoundation.prototype.hide = function () {
            this.adapter.setAttr(strings$4.ARIA_HIDDEN, 'true');
        };
        return MDCSelectHelperTextFoundation;
    }(MDCFoundation));

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

    function Anchor(
      node,
      {
        addClass = (className) => node.classList.add(className),
        removeClass = (className) => node.classList.remove(className),
      } = {}
    ) {
      addClass('mdc-menu-surface--anchor');

      return {
        destroy() {
          removeClass('mdc-menu-surface--anchor');
        },
      };
    }

    /* node_modules/@smui/menu-surface/MenuSurface.svelte generated by Svelte v3.38.2 */

    const { document: document_1 } = globals;

    const file$e = "node_modules/@smui/menu-surface/MenuSurface.svelte";

    function create_fragment$h(ctx) {
    	let t;
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[2]]: true,
    				"mdc-menu-surface": true,
    				"mdc-menu-surface--fixed": /*fixed*/ ctx[5],
    				"mdc-menu-surface--open": /*isStatic*/ ctx[4],
    				"smui-menu-surface--static": /*isStatic*/ ctx[4],
    				"mdc-menu-surface--fullwidth": /*fullWidth*/ ctx[6],
    				.../*internalClasses*/ ctx[9]
    			})
    		},
    		{
    			style: div_style_value = Object.entries(/*internalStyles*/ ctx[10]).map(func$8).concat([/*style*/ ctx[3]]).join(" ")
    		},
    		/*$$restProps*/ ctx[12]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$e, 4, 0, 105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[28](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document_1.body, "click", /*click_handler*/ ctx[27], true, false, false),
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[1])),
    					action_destroyer(/*forwardEvents*/ ctx[11].call(null, div)),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[29], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 33554432)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[25], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*className, fixed, isStatic, fullWidth, internalClasses*/ 628 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[2]]: true,
    					"mdc-menu-surface": true,
    					"mdc-menu-surface--fixed": /*fixed*/ ctx[5],
    					"mdc-menu-surface--open": /*isStatic*/ ctx[4],
    					"smui-menu-surface--static": /*isStatic*/ ctx[4],
    					"mdc-menu-surface--fullwidth": /*fullWidth*/ ctx[6],
    					.../*internalClasses*/ ctx[9]
    				}))) && { class: div_class_value },
    				(!current || dirty[0] & /*internalStyles, style*/ 1032 && div_style_value !== (div_style_value = Object.entries(/*internalStyles*/ ctx[10]).map(func$8).concat([/*style*/ ctx[3]]).join(" "))) && { style: div_style_value },
    				dirty[0] & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[28](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$8 = ([name, value]) => `${name}: ${value};`;

    function instance_1$b($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","static","anchor","fixed","open","fullWidth","quickOpen","anchorElement","anchorCorner","anchorMargin","maxHeight","horizontallyCenteredOnViewport","isOpen","setOpen","setAbsolutePosition","setIsHoisted","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MenuSurface", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { style = "" } = $$props;
    	let { static: isStatic = false } = $$props;
    	let { anchor = true } = $$props;
    	let { fixed = false } = $$props;
    	let { open = isStatic } = $$props;
    	let { fullWidth = false } = $$props;
    	let { quickOpen = false } = $$props;
    	let { anchorElement = null } = $$props;
    	let { anchorCorner = null } = $$props;
    	let { anchorMargin = { top: 0, right: 0, bottom: 0, left: 0 } } = $$props;
    	let { maxHeight = 0 } = $$props;
    	let { horizontallyCenteredOnViewport = false } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let previousFocus;
    	setContext("SMUI:list:role", "menu");
    	setContext("SMUI:list:item:role", "menuitem");
    	const iCorner = Corner;
    	const iCornerBit = CornerBit;

    	onMount(() => {
    		$$invalidate(8, instance = new MDCMenuSurfaceFoundation({
    				addClass,
    				removeClass,
    				hasClass,
    				hasAnchor: () => !!anchorElement,
    				notifyClose: () => {
    					$$invalidate(0, open = isStatic);

    					if (!open) {
    						dispatch(element, "MDCMenuSurface:closed");
    					}
    				},
    				notifyClosing: () => {
    					$$invalidate(0, open = isStatic);

    					if (!open) {
    						dispatch(element, "MDCMenuSurface:closing");
    					}
    				},
    				notifyOpen: () => {
    					$$invalidate(0, open = true);
    					dispatch(element, "MDCMenuSurface:opened");
    				},
    				isElementInContainer: el => element.contains(el),
    				isRtl: () => getComputedStyle(element).getPropertyValue("direction") === "rtl",
    				setTransformOrigin: origin => {
    					const propertyName = `${getCorrectPropertyName(window, "transform")}-origin`;
    					$$invalidate(10, internalStyles[propertyName] = origin, internalStyles);
    				},
    				isFocused: () => document.activeElement === element,
    				saveFocus: () => {
    					previousFocus = document.activeElement;
    				},
    				restoreFocus: () => {
    					if (element.contains(document.activeElement) && previousFocus && previousFocus.focus) {
    						previousFocus.focus();
    					}
    				},
    				getInnerDimensions: () => {
    					return {
    						width: element.offsetWidth,
    						height: element.offsetHeight
    					};
    				},
    				getAnchorDimensions: () => anchorElement
    				? anchorElement.getBoundingClientRect()
    				: null,
    				getWindowDimensions: () => {
    					return {
    						width: window.innerWidth,
    						height: window.innerHeight
    					};
    				},
    				getBodyDimensions: () => {
    					return {
    						width: document.body.clientWidth,
    						height: document.body.clientHeight
    					};
    				},
    				getWindowScroll: () => {
    					return {
    						x: window.pageXOffset,
    						y: window.pageYOffset
    					};
    				},
    				setPosition: position => {
    					$$invalidate(10, internalStyles.left = "left" in position ? `${position.left}px` : "", internalStyles);
    					$$invalidate(10, internalStyles.right = "right" in position ? `${position.right}px` : "", internalStyles);
    					$$invalidate(10, internalStyles.top = "top" in position ? `${position.top}px` : "", internalStyles);
    					$$invalidate(10, internalStyles.bottom = "bottom" in position ? `${position.bottom}px` : "", internalStyles);
    				},
    				setMaxHeight: height => {
    					$$invalidate(10, internalStyles.maxHeight = height, internalStyles);
    				}
    			}));

    		dispatch(element, "SMUI:menu-surface:mount", {
    			get open() {
    				return open;
    			},
    			set open(value) {
    				$$invalidate(0, open = value);
    			},
    			closeProgrammatic
    		});

    		instance.init();

    		return () => {
    			const isHoisted = instance.isHoistedElement;
    			instance.destroy();

    			if (isHoisted) {
    				element.parentNode.removeChild(element);
    			}
    		};
    	});

    	onDestroy(() => {
    		if (anchor) {
    			element && element.parentNode.classList.remove("mdc-menu-surface--anchor");
    		}
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(9, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(9, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function closeProgrammatic(skipRestoreFocus) {
    		instance.close(skipRestoreFocus);
    		$$invalidate(0, open = false);
    	}

    	function isOpen() {
    		return open;
    	}

    	function setOpen(value) {
    		$$invalidate(0, open = value);
    	}

    	function setAbsolutePosition(...args) {
    		return instance.setAbsolutePosition(...args);
    	}

    	function setIsHoisted(...args) {
    		return instance.setIsHoisted(...args);
    	}

    	function getElement() {
    		return element;
    	}

    	const click_handler = event => instance && open && instance.handleBodyClick(event);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	const keydown_handler = event => instance && instance.handleKeydown(event);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("static" in $$new_props) $$invalidate(4, isStatic = $$new_props.static);
    		if ("anchor" in $$new_props) $$invalidate(14, anchor = $$new_props.anchor);
    		if ("fixed" in $$new_props) $$invalidate(5, fixed = $$new_props.fixed);
    		if ("open" in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ("fullWidth" in $$new_props) $$invalidate(6, fullWidth = $$new_props.fullWidth);
    		if ("quickOpen" in $$new_props) $$invalidate(15, quickOpen = $$new_props.quickOpen);
    		if ("anchorElement" in $$new_props) $$invalidate(13, anchorElement = $$new_props.anchorElement);
    		if ("anchorCorner" in $$new_props) $$invalidate(16, anchorCorner = $$new_props.anchorCorner);
    		if ("anchorMargin" in $$new_props) $$invalidate(17, anchorMargin = $$new_props.anchorMargin);
    		if ("maxHeight" in $$new_props) $$invalidate(18, maxHeight = $$new_props.maxHeight);
    		if ("horizontallyCenteredOnViewport" in $$new_props) $$invalidate(19, horizontallyCenteredOnViewport = $$new_props.horizontallyCenteredOnViewport);
    		if ("$$scope" in $$new_props) $$invalidate(25, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Corner,
    		CornerBit,
    		MDCMenuSurfaceFoundation,
    		getCorrectPropertyName,
    		onMount,
    		onDestroy,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		dispatch,
    		forwardEvents,
    		use,
    		className,
    		style,
    		isStatic,
    		anchor,
    		fixed,
    		open,
    		fullWidth,
    		quickOpen,
    		anchorElement,
    		anchorCorner,
    		anchorMargin,
    		maxHeight,
    		horizontallyCenteredOnViewport,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		previousFocus,
    		iCorner,
    		iCornerBit,
    		hasClass,
    		addClass,
    		removeClass,
    		closeProgrammatic,
    		isOpen,
    		setOpen,
    		setAbsolutePosition,
    		setIsHoisted,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("isStatic" in $$props) $$invalidate(4, isStatic = $$new_props.isStatic);
    		if ("anchor" in $$props) $$invalidate(14, anchor = $$new_props.anchor);
    		if ("fixed" in $$props) $$invalidate(5, fixed = $$new_props.fixed);
    		if ("open" in $$props) $$invalidate(0, open = $$new_props.open);
    		if ("fullWidth" in $$props) $$invalidate(6, fullWidth = $$new_props.fullWidth);
    		if ("quickOpen" in $$props) $$invalidate(15, quickOpen = $$new_props.quickOpen);
    		if ("anchorElement" in $$props) $$invalidate(13, anchorElement = $$new_props.anchorElement);
    		if ("anchorCorner" in $$props) $$invalidate(16, anchorCorner = $$new_props.anchorCorner);
    		if ("anchorMargin" in $$props) $$invalidate(17, anchorMargin = $$new_props.anchorMargin);
    		if ("maxHeight" in $$props) $$invalidate(18, maxHeight = $$new_props.maxHeight);
    		if ("horizontallyCenteredOnViewport" in $$props) $$invalidate(19, horizontallyCenteredOnViewport = $$new_props.horizontallyCenteredOnViewport);
    		if ("element" in $$props) $$invalidate(7, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(8, instance = $$new_props.instance);
    		if ("internalClasses" in $$props) $$invalidate(9, internalClasses = $$new_props.internalClasses);
    		if ("internalStyles" in $$props) $$invalidate(10, internalStyles = $$new_props.internalStyles);
    		if ("previousFocus" in $$props) previousFocus = $$new_props.previousFocus;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*element, anchor*/ 16512) {
    			if (element && anchor && !element.parentNode.classList.contains("mdc-menu-surface--anchor")) {
    				element.parentNode.classList.add("mdc-menu-surface--anchor");
    				$$invalidate(13, anchorElement = element.parentNode);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, open*/ 257) {
    			if (instance && instance.isOpen() !== open) {
    				if (open) {
    					instance.open();
    				} else {
    					instance.close();
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, quickOpen*/ 33024) {
    			if (instance) {
    				instance.setQuickOpen(quickOpen);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, fixed*/ 288) {
    			if (instance) {
    				instance.setFixedPosition(fixed);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, maxHeight*/ 262400) {
    			if (instance && maxHeight > 0) {
    				instance.setMaxHeight(maxHeight);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, horizontallyCenteredOnViewport*/ 524544) {
    			if (instance) {
    				instance.setIsHorizontallyCenteredOnViewport(horizontallyCenteredOnViewport);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, anchorCorner*/ 65792) {
    			if (instance && anchorCorner != null) {
    				if (iCorner.hasOwnProperty(anchorCorner)) {
    					instance.setAnchorCorner(iCorner[anchorCorner]);
    				} else if (iCornerBit.hasOwnProperty(anchorCorner)) {
    					instance.setAnchorCorner(iCornerBit[anchorCorner]);
    				} else {
    					instance.setAnchorCorner(anchorCorner);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, anchorMargin*/ 131328) {
    			if (instance) {
    				instance.setAnchorMargin(anchorMargin);
    			}
    		}
    	};

    	return [
    		open,
    		use,
    		className,
    		style,
    		isStatic,
    		fixed,
    		fullWidth,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		forwardEvents,
    		$$restProps,
    		anchorElement,
    		anchor,
    		quickOpen,
    		anchorCorner,
    		anchorMargin,
    		maxHeight,
    		horizontallyCenteredOnViewport,
    		isOpen,
    		setOpen,
    		setAbsolutePosition,
    		setIsHoisted,
    		getElement,
    		$$scope,
    		slots,
    		click_handler,
    		div_binding,
    		keydown_handler
    	];
    }

    class MenuSurface extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$b,
    			create_fragment$h,
    			safe_not_equal,
    			{
    				use: 1,
    				class: 2,
    				style: 3,
    				static: 4,
    				anchor: 14,
    				fixed: 5,
    				open: 0,
    				fullWidth: 6,
    				quickOpen: 15,
    				anchorElement: 13,
    				anchorCorner: 16,
    				anchorMargin: 17,
    				maxHeight: 18,
    				horizontallyCenteredOnViewport: 19,
    				isOpen: 20,
    				setOpen: 21,
    				setAbsolutePosition: 22,
    				setIsHoisted: 23,
    				getElement: 24
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuSurface",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get use() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get static() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set static(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchor() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchor(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullWidth() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullWidth(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quickOpen() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quickOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorElement() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorElement(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorCorner() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorCorner(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorMargin() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorMargin(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxHeight() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxHeight(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get horizontallyCenteredOnViewport() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set horizontallyCenteredOnViewport(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		return this.$$.ctx[20];
    	}

    	set isOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx[21];
    	}

    	set setOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAbsolutePosition() {
    		return this.$$.ctx[22];
    	}

    	set setAbsolutePosition(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIsHoisted() {
    		return this.$$.ctx[23];
    	}

    	set setIsHoisted(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[24];
    	}

    	set getElement(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/menu/Menu.svelte generated by Svelte v3.38.2 */

    // (1:0) <MenuSurface   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-menu': true,   })}   bind:open   on:SMUI:menu-surface:mount={handleMenuSurfaceAccessor}   on:SMUI:list:mount={handleListAccessor}   on:MDCMenuSurface:opened={() =>     instance && instance.handleMenuSurfaceOpened()}   on:keydown={(event) => instance && instance.handleKeydown(event)}   on:MDCList:action={(event) =>     instance &&     instance.handleItemAction(       listAccessor.getOrderedList()[event.detail.index].element     )}   {...$$restProps}>
    function create_default_slot$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1048576)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(1:0) <MenuSurface   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-menu': true,   })}   bind:open   on:SMUI:menu-surface:mount={handleMenuSurfaceAccessor}   on:SMUI:list:mount={handleListAccessor}   on:MDCMenuSurface:opened={() =>     instance && instance.handleMenuSurfaceOpened()}   on:keydown={(event) => instance && instance.handleKeydown(event)}   on:MDCList:action={(event) =>     instance &&     instance.handleItemAction(       listAccessor.getOrderedList()[event.detail.index].element     )}   {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let menusurface;
    	let updating_open;
    	let current;

    	const menusurface_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[6], .../*use*/ ctx[1]]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[2]]: true,
    				"mdc-menu": true
    			})
    		},
    		/*$$restProps*/ ctx[9]
    	];

    	function menusurface_open_binding(value) {
    		/*menusurface_open_binding*/ ctx[16](value);
    	}

    	let menusurface_props = {
    		$$slots: { default: [create_default_slot$7] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < menusurface_spread_levels.length; i += 1) {
    		menusurface_props = assign(menusurface_props, menusurface_spread_levels[i]);
    	}

    	if (/*open*/ ctx[0] !== void 0) {
    		menusurface_props.open = /*open*/ ctx[0];
    	}

    	menusurface = new MenuSurface({ props: menusurface_props, $$inline: true });
    	/*menusurface_binding*/ ctx[15](menusurface);
    	binding_callbacks.push(() => bind(menusurface, "open", menusurface_open_binding));
    	menusurface.$on("SMUI:menu-surface:mount", /*handleMenuSurfaceAccessor*/ ctx[7]);
    	menusurface.$on("SMUI:list:mount", /*handleListAccessor*/ ctx[8]);
    	menusurface.$on("MDCMenuSurface:opened", /*MDCMenuSurface_opened_handler*/ ctx[17]);
    	menusurface.$on("keydown", /*keydown_handler*/ ctx[18]);
    	menusurface.$on("MDCList:action", /*MDCList_action_handler*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(menusurface.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(menusurface, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menusurface_changes = (dirty & /*forwardEvents, use, classMap, className, $$restProps*/ 582)
    			? get_spread_update(menusurface_spread_levels, [
    					dirty & /*forwardEvents, use*/ 66 && {
    						use: [/*forwardEvents*/ ctx[6], .../*use*/ ctx[1]]
    					},
    					dirty & /*classMap, className*/ 4 && {
    						class: classMap({
    							[/*className*/ ctx[2]]: true,
    							"mdc-menu": true
    						})
    					},
    					dirty & /*$$restProps*/ 512 && get_spread_object(/*$$restProps*/ ctx[9])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 1048576) {
    				menusurface_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty & /*open*/ 1) {
    				updating_open = true;
    				menusurface_changes.open = /*open*/ ctx[0];
    				add_flush_callback(() => updating_open = false);
    			}

    			menusurface.$set(menusurface_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menusurface.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menusurface.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*menusurface_binding*/ ctx[15](null);
    			destroy_component(menusurface, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance_1$a($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","open","isOpen","setOpen","setDefaultFocusState","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, ['default']);
    	const { closest } = ponyfill;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { open = false } = $$props;
    	let element;
    	let instance;
    	let menuSurfaceAccessor;
    	let listAccessor;

    	onMount(() => {
    		$$invalidate(4, instance = new MDCMenuFoundation({
    				addClassToElementAtIndex: (index, className) => {
    					listAccessor.addClassForElementIndex(index, className);
    				},
    				removeClassFromElementAtIndex: (index, className) => {
    					listAccessor.removeClassForElementIndex(index, className);
    				},
    				addAttributeToElementAtIndex: (index, attr, value) => {
    					listAccessor.setAttributeForElementIndex(index, attr, value);
    				},
    				removeAttributeFromElementAtIndex: (index, attr) => {
    					listAccessor.removeAttributeForElementIndex(index, attr);
    				},
    				elementContainsClass: (element, className) => element.classList.contains(className),
    				closeSurface: skipRestoreFocus => menuSurfaceAccessor.closeProgrammatic(skipRestoreFocus),
    				getElementIndex: element => listAccessor.getOrderedList().map(accessor => accessor.element).indexOf(element),
    				notifySelected: evtData => dispatch(element, "MDCMenu:selected", {
    					index: evtData.index,
    					item: listAccessor.getOrderedList()[evtData.index].element
    				}),
    				getMenuItemCount: () => listAccessor.items.length,
    				focusItemAtIndex: index => listAccessor.focusItemAtIndex(index),
    				focusListRoot: () => listAccessor.element.focus(),
    				isSelectableItemAtIndex: index => !!closest(listAccessor.getOrderedList()[index].element, `.${cssClasses$6.MENU_SELECTION_GROUP}`),
    				getSelectedSiblingOfItemAtIndex: index => {
    					const orderedList = listAccessor.getOrderedList();
    					const selectionGroupEl = closest(orderedList[index].element, `.${cssClasses$6.MENU_SELECTION_GROUP}`);
    					const selectedItemEl = selectionGroupEl.querySelector(`.${cssClasses$6.MENU_SELECTED_LIST_ITEM}`);

    					return selectedItemEl
    					? orderedList.map(item => item.element).indexOf(selectedItemEl)
    					: -1;
    				}
    			}));

    		dispatch(element, "SMUI:menu:mount", instance);
    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function handleMenuSurfaceAccessor(event) {
    		if (!menuSurfaceAccessor) {
    			menuSurfaceAccessor = event.detail;
    		}
    	}

    	function handleListAccessor(event) {
    		if (!listAccessor) {
    			$$invalidate(5, listAccessor = event.detail);
    		}
    	}

    	function isOpen() {
    		return open;
    	}

    	function setOpen(value) {
    		$$invalidate(0, open = value);
    	}

    	function setDefaultFocusState(focusState) {
    		instance.setDefaultFocusState(focusState);
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function menusurface_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	function menusurface_open_binding(value) {
    		open = value;
    		$$invalidate(0, open);
    	}

    	const MDCMenuSurface_opened_handler = () => instance && instance.handleMenuSurfaceOpened();
    	const keydown_handler = event => instance && instance.handleKeydown(event);
    	const MDCList_action_handler = event => instance && instance.handleItemAction(listAccessor.getOrderedList()[event.detail.index].element);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("open" in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ("$$scope" in $$new_props) $$invalidate(20, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCMenuFoundation,
    		cssClasses: cssClasses$6,
    		ponyfill,
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		MenuSurface,
    		closest,
    		forwardEvents,
    		use,
    		className,
    		open,
    		element,
    		instance,
    		menuSurfaceAccessor,
    		listAccessor,
    		handleMenuSurfaceAccessor,
    		handleListAccessor,
    		isOpen,
    		setOpen,
    		setDefaultFocusState,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("open" in $$props) $$invalidate(0, open = $$new_props.open);
    		if ("element" in $$props) $$invalidate(3, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(4, instance = $$new_props.instance);
    		if ("menuSurfaceAccessor" in $$props) menuSurfaceAccessor = $$new_props.menuSurfaceAccessor;
    		if ("listAccessor" in $$props) $$invalidate(5, listAccessor = $$new_props.listAccessor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		open,
    		use,
    		className,
    		element,
    		instance,
    		listAccessor,
    		forwardEvents,
    		handleMenuSurfaceAccessor,
    		handleListAccessor,
    		$$restProps,
    		isOpen,
    		setOpen,
    		setDefaultFocusState,
    		getElement,
    		slots,
    		menusurface_binding,
    		menusurface_open_binding,
    		MDCMenuSurface_opened_handler,
    		keydown_handler,
    		MDCList_action_handler,
    		$$scope
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1$a, create_fragment$g, safe_not_equal, {
    			use: 1,
    			class: 2,
    			open: 0,
    			isOpen: 10,
    			setOpen: 11,
    			setDefaultFocusState: 12,
    			getElement: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get use() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		return this.$$.ctx[10];
    	}

    	set isOpen(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx[11];
    	}

    	set setOpen(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setDefaultFocusState() {
    		return this.$$.ctx[12];
    	}

    	set setDefaultFocusState(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[13];
    	}

    	set getElement(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Ul.svelte generated by Svelte v3.38.2 */
    const file$d = "node_modules/@smui/common/Ul.svelte";

    function create_fragment$f(ctx) {
    	let ul;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let ul_levels = [/*$$restProps*/ ctx[3]];
    	let ul_data = {};

    	for (let i = 0; i < ul_levels.length; i += 1) {
    		ul_data = assign(ul_data, ul_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			set_attributes(ul, ul_data);
    			add_location(ul, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			/*ul_binding*/ ctx[7](ul);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, ul, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, ul))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(ul, ul_data = get_spread_update(ul_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    			/*ul_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ul", slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element = null;

    	function getElement() {
    		return element;
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		ul_binding
    	];
    }

    class Ul extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$f, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ul",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get use() {
    		throw new Error("<Ul>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Ul>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Ul>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Nav.svelte generated by Svelte v3.38.2 */
    const file$c = "node_modules/@smui/common/Nav.svelte";

    function create_fragment$e(ctx) {
    	let nav;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let nav_levels = [/*$$restProps*/ ctx[3]];
    	let nav_data = {};

    	for (let i = 0; i < nav_levels.length; i += 1) {
    		nav_data = assign(nav_data, nav_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if (default_slot) default_slot.c();
    			set_attributes(nav, nav_data);
    			add_location(nav, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			if (default_slot) {
    				default_slot.m(nav, null);
    			}

    			/*nav_binding*/ ctx[7](nav);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, nav, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, nav))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(nav, nav_data = get_spread_update(nav_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (default_slot) default_slot.d(detaching);
    			/*nav_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element = null;

    	function getElement() {
    		return element;
    	}

    	function nav_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		nav_binding
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$e, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get use() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/list/List.svelte generated by Svelte v3.38.2 */

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-deprecated-list': true,     'mdc-deprecated-list--non-interactive': nonInteractive,     'mdc-deprecated-list--dense': dense,     'mdc-deprecated-list--textual-list': textualList,     'mdc-deprecated-list--avatar-list': avatarList || selectionDialog,     'mdc-deprecated-list--icon-list': iconList,     'mdc-deprecated-list--image-list': imageList,     'mdc-deprecated-list--thumbnail-list': thumbnailList,     'mdc-deprecated-list--video-list': videoList,     'mdc-deprecated-list--two-line': twoLine,     'smui-list--three-line': threeLine && !twoLine,   })}   {role}   on:keydown={(event) =>     instance &&     instance.handleKeydown(       event,       event.target.classList.contains('mdc-deprecated-list-item'),       getListItemIndex(event.target)     )}   on:focusin={(event) =>     instance && instance.handleFocusIn(event, getListItemIndex(event.target))}   on:focusout={(event) =>     instance && instance.handleFocusOut(event, getListItemIndex(event.target))}   on:click={(event) =>     instance &&     instance.handleClick(       getListItemIndex(event.target),       !matches(event.target, 'input[type="checkbox"], input[type="radio"]')     )}   on:SMUI:list:item:mount={handleItemMount}   on:SMUI:list:item:unmount={handleItemUnmount}   on:SMUI:action={handleAction}   {...$$restProps} >
    function create_default_slot$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[38].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[44], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 8192)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[44], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-deprecated-list': true,     'mdc-deprecated-list--non-interactive': nonInteractive,     'mdc-deprecated-list--dense': dense,     'mdc-deprecated-list--textual-list': textualList,     'mdc-deprecated-list--avatar-list': avatarList || selectionDialog,     'mdc-deprecated-list--icon-list': iconList,     'mdc-deprecated-list--image-list': imageList,     'mdc-deprecated-list--thumbnail-list': thumbnailList,     'mdc-deprecated-list--video-list': videoList,     'mdc-deprecated-list--two-line': twoLine,     'smui-list--three-line': threeLine && !twoLine,   })}   {role}   on:keydown={(event) =>     instance &&     instance.handleKeydown(       event,       event.target.classList.contains('mdc-deprecated-list-item'),       getListItemIndex(event.target)     )}   on:focusin={(event) =>     instance && instance.handleFocusIn(event, getListItemIndex(event.target))}   on:focusout={(event) =>     instance && instance.handleFocusOut(event, getListItemIndex(event.target))}   on:click={(event) =>     instance &&     instance.handleClick(       getListItemIndex(event.target),       !matches(event.target, 'input[type=\\\"checkbox\\\"], input[type=\\\"radio\\\"]')     )}   on:SMUI:list:item:mount={handleItemMount}   on:SMUI:list:item:unmount={handleItemUnmount}   on:SMUI:action={handleAction}   {...$$restProps} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[17], .../*use*/ ctx[0]]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-deprecated-list": true,
    				"mdc-deprecated-list--non-interactive": /*nonInteractive*/ ctx[2],
    				"mdc-deprecated-list--dense": /*dense*/ ctx[3],
    				"mdc-deprecated-list--textual-list": /*textualList*/ ctx[4],
    				"mdc-deprecated-list--avatar-list": /*avatarList*/ ctx[5] || /*selectionDialog*/ ctx[18],
    				"mdc-deprecated-list--icon-list": /*iconList*/ ctx[6],
    				"mdc-deprecated-list--image-list": /*imageList*/ ctx[7],
    				"mdc-deprecated-list--thumbnail-list": /*thumbnailList*/ ctx[8],
    				"mdc-deprecated-list--video-list": /*videoList*/ ctx[9],
    				"mdc-deprecated-list--two-line": /*twoLine*/ ctx[10],
    				"smui-list--three-line": /*threeLine*/ ctx[11] && !/*twoLine*/ ctx[10]
    			})
    		},
    		{ role: /*role*/ ctx[15] },
    		/*$$restProps*/ ctx[23]
    	];

    	var switch_value = /*component*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$6] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[39](switch_instance);
    		switch_instance.$on("keydown", /*keydown_handler*/ ctx[40]);
    		switch_instance.$on("focusin", /*focusin_handler*/ ctx[41]);
    		switch_instance.$on("focusout", /*focusout_handler*/ ctx[42]);
    		switch_instance.$on("click", /*click_handler*/ ctx[43]);
    		switch_instance.$on("SMUI:list:item:mount", /*handleItemMount*/ ctx[19]);
    		switch_instance.$on("SMUI:list:item:unmount", /*handleItemUnmount*/ ctx[20]);
    		switch_instance.$on("SMUI:action", /*handleAction*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*forwardEvents, use, className, nonInteractive, dense, textualList, avatarList, selectionDialog, iconList, imageList, thumbnailList, videoList, twoLine, threeLine, role, $$restProps*/ 8818687)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*forwardEvents, use*/ 131073 && {
    						use: [/*forwardEvents*/ ctx[17], .../*use*/ ctx[0]]
    					},
    					dirty[0] & /*className, nonInteractive, dense, textualList, avatarList, selectionDialog, iconList, imageList, thumbnailList, videoList, twoLine, threeLine*/ 266238 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							"mdc-deprecated-list": true,
    							"mdc-deprecated-list--non-interactive": /*nonInteractive*/ ctx[2],
    							"mdc-deprecated-list--dense": /*dense*/ ctx[3],
    							"mdc-deprecated-list--textual-list": /*textualList*/ ctx[4],
    							"mdc-deprecated-list--avatar-list": /*avatarList*/ ctx[5] || /*selectionDialog*/ ctx[18],
    							"mdc-deprecated-list--icon-list": /*iconList*/ ctx[6],
    							"mdc-deprecated-list--image-list": /*imageList*/ ctx[7],
    							"mdc-deprecated-list--thumbnail-list": /*thumbnailList*/ ctx[8],
    							"mdc-deprecated-list--video-list": /*videoList*/ ctx[9],
    							"mdc-deprecated-list--two-line": /*twoLine*/ ctx[10],
    							"smui-list--three-line": /*threeLine*/ ctx[11] && !/*twoLine*/ ctx[10]
    						})
    					},
    					dirty[0] & /*role*/ 32768 && { role: /*role*/ ctx[15] },
    					dirty[0] & /*$$restProps*/ 8388608 && get_spread_object(/*$$restProps*/ ctx[23])
    				])
    			: {};

    			if (dirty[1] & /*$$scope*/ 8192) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[39](switch_instance);
    					switch_instance.$on("keydown", /*keydown_handler*/ ctx[40]);
    					switch_instance.$on("focusin", /*focusin_handler*/ ctx[41]);
    					switch_instance.$on("focusout", /*focusout_handler*/ ctx[42]);
    					switch_instance.$on("click", /*click_handler*/ ctx[43]);
    					switch_instance.$on("SMUI:list:item:mount", /*handleItemMount*/ ctx[19]);
    					switch_instance.$on("SMUI:list:item:unmount", /*handleItemUnmount*/ ctx[20]);
    					switch_instance.$on("SMUI:action", /*handleAction*/ ctx[21]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[39](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance_1$9($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","nonInteractive","dense","textualList","avatarList","iconList","imageList","thumbnailList","videoList","twoLine","threeLine","vertical","wrapFocus","singleSelection","selectedIndex","radioList","checkList","hasTypeahead","radiolist","checklist","component","layout","setEnabled","getTypeaheadInProgress","getSelectedIndex","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, ['default']);
    	const { closest, matches } = ponyfill;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { nonInteractive = false } = $$props;
    	let { dense = false } = $$props;
    	let { textualList = false } = $$props;
    	let { avatarList = false } = $$props;
    	let { iconList = false } = $$props;
    	let { imageList = false } = $$props;
    	let { thumbnailList = false } = $$props;
    	let { videoList = false } = $$props;
    	let { twoLine = false } = $$props;
    	let { threeLine = false } = $$props;
    	let { vertical = true } = $$props;
    	let { wrapFocus = getContext("SMUI:list:wrapFocus") || false } = $$props;
    	let { singleSelection = false } = $$props;
    	let { selectedIndex = -1 } = $$props;
    	let { radioList = false } = $$props;
    	let { checkList = false } = $$props;
    	let { hasTypeahead = false } = $$props;
    	let { radiolist = false } = $$props;

    	if (radiolist) {
    		radioList = true;
    	}

    	let { checklist = false } = $$props;

    	if (checklist) {
    		checkList = true;
    	}

    	let element;
    	let instance;
    	let items = [];
    	let role = getContext("SMUI:list:role");
    	let nav = getContext("SMUI:list:nav");
    	const itemAccessorMap = new WeakMap();
    	let selectionDialog = getContext("SMUI:dialog:selection");
    	let addLayoutListener = getContext("SMUI:addLayoutListener");
    	let removeLayoutListener;
    	let { component = nav ? Nav : Ul } = $$props;
    	setContext("SMUI:list:nonInteractive", nonInteractive);
    	setContext("SMUI:separator:context", "list");

    	if (!role) {
    		if (singleSelection) {
    			role = "listbox";
    			setContext("SMUI:list:item:role", "option");
    		} else if (radioList) {
    			role = "radiogroup";
    			setContext("SMUI:list:item:role", "radio");
    		} else if (checkList) {
    			role = "group";
    			setContext("SMUI:list:item:role", "checkbox");
    		} else {
    			role = "list";
    			setContext("SMUI:list:item:role", undefined);
    		}
    	}

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(() => {
    		$$invalidate(13, instance = new MDCListFoundation({
    				addClassForElementIndex,
    				focusItemAtIndex,
    				getAttributeForElementIndex: (index, name) => getOrderedList()[index].getAttr(name),
    				getFocusedElementIndex: () => getOrderedList().map(accessor => accessor.element).indexOf(document.activeElement),
    				getListItemCount: () => items.length,
    				getPrimaryTextAtIndex,
    				hasCheckboxAtIndex: index => getOrderedList()[index].hasCheckbox,
    				hasRadioAtIndex: index => getOrderedList()[index].hasRadio,
    				isCheckboxCheckedAtIndex: index => {
    					const listItem = getOrderedList()[index];
    					return listItem.hasCheckbox && listItem.checked;
    				},
    				isFocusInsideList: () => getElement() !== document.activeElement && getElement().contains(document.activeElement),
    				isRootFocused: () => document.activeElement === getElement(),
    				listItemAtIndexHasClass,
    				notifyAction: index => {
    					$$invalidate(24, selectedIndex = index);
    					dispatch(element, "MDCList:action", { index });
    				},
    				removeClassForElementIndex,
    				setAttributeForElementIndex,
    				setCheckedCheckboxOrRadioAtIndex: (index, isChecked) => {
    					getOrderedList()[index].checked = isChecked;
    				},
    				setTabIndexForListItemChildren: (listItemIndex, tabIndexValue) => {
    					const listItem = getOrderedList()[listItemIndex];
    					const selector = "button:not(:disabled), a";

    					Array.prototype.forEach.call(listItem.element.querySelectorAll(selector), el => {
    						el.setAttribute("tabindex", tabIndexValue);
    					});
    				}
    			}));

    		dispatch(element, "SMUI:list:mount", {
    			get element() {
    				return getElement();
    			},
    			get items() {
    				return items;
    			},
    			get typeaheadInProgress() {
    				return instance.isTypeaheadInProgress();
    			},
    			typeaheadMatchItem(nextChar, startingIndex) {
    				return instance.typeaheadMatchItem(nextChar, startingIndex, /** skipFocus */
    				true);
    			},
    			getOrderedList,
    			focusItemAtIndex,
    			addClassForElementIndex,
    			removeClassForElementIndex,
    			// getAttributeForElementIndex,
    			setAttributeForElementIndex,
    			removeAttributeForElementIndex,
    			getPrimaryTextAtIndex
    		});

    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	onDestroy(() => {
    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function handleItemMount(event) {
    		items.push(event.detail);
    		itemAccessorMap.set(event.detail.element, event.detail);

    		if (singleSelection && event.detail.selected) {
    			$$invalidate(24, selectedIndex = getListItemIndex(event.detail.element));
    		}

    		event.stopPropagation();
    	}

    	function handleItemUnmount(event) {
    		const idx = items.indexOf(event.detail);

    		if (idx !== -1) {
    			items.splice(idx, 1);
    			items = items;
    		}

    		itemAccessorMap.delete(event.detail.element);
    		event.stopPropagation();
    	}

    	function handleAction(event) {
    		if (radioList || checkList) {
    			const index = getListItemIndex(event.target);

    			if (index !== -1) {
    				const item = getOrderedList()[index];

    				if (radioList && !item.checked || checkList) {
    					item.checked = !item.checked;
    					item.activateRipple();

    					window.requestAnimationFrame(() => {
    						item.deactivateRipple();
    					});
    				}
    			}
    		}
    	}

    	function getOrderedList() {
    		return [...getElement().children].map(element => itemAccessorMap.get(element)).filter(accessor => accessor && accessor._smui_list_item_accessor);
    	}

    	function focusItemAtIndex(index) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.element.focus();
    	}

    	function listItemAtIndexHasClass(index, className) {
    		const accessor = getOrderedList()[index];
    		return accessor && accessor.hasClass(className);
    	}

    	function addClassForElementIndex(index, className) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.addClass(className);
    	}

    	function removeClassForElementIndex(index, className) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.removeClass(className);
    	}

    	// function getAttributeForElementIndex(index, name) {
    	//   const accessor = getOrderedList()[index];
    	//   accessor && accessor.getAttr(name, value);
    	// }
    	function setAttributeForElementIndex(index, name, value) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.addAttr(name, value);
    	}

    	function removeAttributeForElementIndex(index, name) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.removeAttr(name);
    	}

    	function getPrimaryTextAtIndex(index) {
    		const accessor = getOrderedList()[index];
    		return accessor && accessor.getPrimaryText();
    	}

    	function getListItemIndex(element) {
    		const nearestParent = closest(element, ".mdc-deprecated-list-item, .mdc-deprecated-list");

    		// Get the index of the element if it is a list item.
    		if (nearestParent && matches(nearestParent, ".mdc-deprecated-list-item")) {
    			return getOrderedList().map(item => item.element).indexOf(nearestParent);
    		}

    		return -1;
    	}

    	function layout() {
    		return instance.layout();
    	}

    	function setEnabled(...args) {
    		return instance.setEnabled(...args);
    	}

    	function getTypeaheadInProgress() {
    		return instance.isTypeaheadInProgress();
    	}

    	function getSelectedIndex() {
    		return instance.getSelectedIndex();
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(14, element);
    		});
    	}

    	const keydown_handler = event => instance && instance.handleKeydown(event, event.target.classList.contains("mdc-deprecated-list-item"), getListItemIndex(event.target));
    	const focusin_handler = event => instance && instance.handleFocusIn(event, getListItemIndex(event.target));
    	const focusout_handler = event => instance && instance.handleFocusOut(event, getListItemIndex(event.target));
    	const click_handler = event => instance && instance.handleClick(getListItemIndex(event.target), !matches(event.target, "input[type=\"checkbox\"], input[type=\"radio\"]"));

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(23, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("nonInteractive" in $$new_props) $$invalidate(2, nonInteractive = $$new_props.nonInteractive);
    		if ("dense" in $$new_props) $$invalidate(3, dense = $$new_props.dense);
    		if ("textualList" in $$new_props) $$invalidate(4, textualList = $$new_props.textualList);
    		if ("avatarList" in $$new_props) $$invalidate(5, avatarList = $$new_props.avatarList);
    		if ("iconList" in $$new_props) $$invalidate(6, iconList = $$new_props.iconList);
    		if ("imageList" in $$new_props) $$invalidate(7, imageList = $$new_props.imageList);
    		if ("thumbnailList" in $$new_props) $$invalidate(8, thumbnailList = $$new_props.thumbnailList);
    		if ("videoList" in $$new_props) $$invalidate(9, videoList = $$new_props.videoList);
    		if ("twoLine" in $$new_props) $$invalidate(10, twoLine = $$new_props.twoLine);
    		if ("threeLine" in $$new_props) $$invalidate(11, threeLine = $$new_props.threeLine);
    		if ("vertical" in $$new_props) $$invalidate(27, vertical = $$new_props.vertical);
    		if ("wrapFocus" in $$new_props) $$invalidate(28, wrapFocus = $$new_props.wrapFocus);
    		if ("singleSelection" in $$new_props) $$invalidate(29, singleSelection = $$new_props.singleSelection);
    		if ("selectedIndex" in $$new_props) $$invalidate(24, selectedIndex = $$new_props.selectedIndex);
    		if ("radioList" in $$new_props) $$invalidate(25, radioList = $$new_props.radioList);
    		if ("checkList" in $$new_props) $$invalidate(26, checkList = $$new_props.checkList);
    		if ("hasTypeahead" in $$new_props) $$invalidate(30, hasTypeahead = $$new_props.hasTypeahead);
    		if ("radiolist" in $$new_props) $$invalidate(31, radiolist = $$new_props.radiolist);
    		if ("checklist" in $$new_props) $$invalidate(32, checklist = $$new_props.checklist);
    		if ("component" in $$new_props) $$invalidate(12, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(44, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCListFoundation,
    		ponyfill,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		Ul,
    		Nav,
    		closest,
    		matches,
    		forwardEvents,
    		use,
    		className,
    		nonInteractive,
    		dense,
    		textualList,
    		avatarList,
    		iconList,
    		imageList,
    		thumbnailList,
    		videoList,
    		twoLine,
    		threeLine,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		selectedIndex,
    		radioList,
    		checkList,
    		hasTypeahead,
    		radiolist,
    		checklist,
    		element,
    		instance,
    		items,
    		role,
    		nav,
    		itemAccessorMap,
    		selectionDialog,
    		addLayoutListener,
    		removeLayoutListener,
    		component,
    		handleItemMount,
    		handleItemUnmount,
    		handleAction,
    		getOrderedList,
    		focusItemAtIndex,
    		listItemAtIndexHasClass,
    		addClassForElementIndex,
    		removeClassForElementIndex,
    		setAttributeForElementIndex,
    		removeAttributeForElementIndex,
    		getPrimaryTextAtIndex,
    		getListItemIndex,
    		layout,
    		setEnabled,
    		getTypeaheadInProgress,
    		getSelectedIndex,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("nonInteractive" in $$props) $$invalidate(2, nonInteractive = $$new_props.nonInteractive);
    		if ("dense" in $$props) $$invalidate(3, dense = $$new_props.dense);
    		if ("textualList" in $$props) $$invalidate(4, textualList = $$new_props.textualList);
    		if ("avatarList" in $$props) $$invalidate(5, avatarList = $$new_props.avatarList);
    		if ("iconList" in $$props) $$invalidate(6, iconList = $$new_props.iconList);
    		if ("imageList" in $$props) $$invalidate(7, imageList = $$new_props.imageList);
    		if ("thumbnailList" in $$props) $$invalidate(8, thumbnailList = $$new_props.thumbnailList);
    		if ("videoList" in $$props) $$invalidate(9, videoList = $$new_props.videoList);
    		if ("twoLine" in $$props) $$invalidate(10, twoLine = $$new_props.twoLine);
    		if ("threeLine" in $$props) $$invalidate(11, threeLine = $$new_props.threeLine);
    		if ("vertical" in $$props) $$invalidate(27, vertical = $$new_props.vertical);
    		if ("wrapFocus" in $$props) $$invalidate(28, wrapFocus = $$new_props.wrapFocus);
    		if ("singleSelection" in $$props) $$invalidate(29, singleSelection = $$new_props.singleSelection);
    		if ("selectedIndex" in $$props) $$invalidate(24, selectedIndex = $$new_props.selectedIndex);
    		if ("radioList" in $$props) $$invalidate(25, radioList = $$new_props.radioList);
    		if ("checkList" in $$props) $$invalidate(26, checkList = $$new_props.checkList);
    		if ("hasTypeahead" in $$props) $$invalidate(30, hasTypeahead = $$new_props.hasTypeahead);
    		if ("radiolist" in $$props) $$invalidate(31, radiolist = $$new_props.radiolist);
    		if ("checklist" in $$props) $$invalidate(32, checklist = $$new_props.checklist);
    		if ("element" in $$props) $$invalidate(14, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(13, instance = $$new_props.instance);
    		if ("items" in $$props) items = $$new_props.items;
    		if ("role" in $$props) $$invalidate(15, role = $$new_props.role);
    		if ("nav" in $$props) nav = $$new_props.nav;
    		if ("selectionDialog" in $$props) $$invalidate(18, selectionDialog = $$new_props.selectionDialog);
    		if ("addLayoutListener" in $$props) addLayoutListener = $$new_props.addLayoutListener;
    		if ("removeLayoutListener" in $$props) removeLayoutListener = $$new_props.removeLayoutListener;
    		if ("component" in $$props) $$invalidate(12, component = $$new_props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*instance, vertical*/ 134225920) {
    			if (instance) {
    				instance.setVerticalOrientation(vertical);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, wrapFocus*/ 268443648) {
    			if (instance) {
    				instance.setWrapFocus(wrapFocus);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, hasTypeahead*/ 1073750016) {
    			if (instance) {
    				instance.setHasTypeahead(hasTypeahead);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, singleSelection*/ 536879104) {
    			if (instance) {
    				instance.setSingleSelection(singleSelection);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, singleSelection, selectedIndex*/ 553656320) {
    			if (instance && singleSelection && getSelectedIndex() !== selectedIndex) {
    				instance.setSelectedIndex(selectedIndex);
    			}
    		}
    	};

    	return [
    		use,
    		className,
    		nonInteractive,
    		dense,
    		textualList,
    		avatarList,
    		iconList,
    		imageList,
    		thumbnailList,
    		videoList,
    		twoLine,
    		threeLine,
    		component,
    		instance,
    		element,
    		role,
    		matches,
    		forwardEvents,
    		selectionDialog,
    		handleItemMount,
    		handleItemUnmount,
    		handleAction,
    		getListItemIndex,
    		$$restProps,
    		selectedIndex,
    		radioList,
    		checkList,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		hasTypeahead,
    		radiolist,
    		checklist,
    		layout,
    		setEnabled,
    		getTypeaheadInProgress,
    		getSelectedIndex,
    		getElement,
    		slots,
    		switch_instance_binding,
    		keydown_handler,
    		focusin_handler,
    		focusout_handler,
    		click_handler,
    		$$scope
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$9,
    			create_fragment$d,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				nonInteractive: 2,
    				dense: 3,
    				textualList: 4,
    				avatarList: 5,
    				iconList: 6,
    				imageList: 7,
    				thumbnailList: 8,
    				videoList: 9,
    				twoLine: 10,
    				threeLine: 11,
    				vertical: 27,
    				wrapFocus: 28,
    				singleSelection: 29,
    				selectedIndex: 24,
    				radioList: 25,
    				checkList: 26,
    				hasTypeahead: 30,
    				radiolist: 31,
    				checklist: 32,
    				component: 12,
    				layout: 33,
    				setEnabled: 34,
    				getTypeaheadInProgress: 35,
    				getSelectedIndex: 36,
    				getElement: 37
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get use() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatarList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatarList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnailList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get twoLine() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set twoLine(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threeLine() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threeLine(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapFocus() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapFocus(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get singleSelection() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set singleSelection(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radioList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radioList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checkList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checkList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasTypeahead() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasTypeahead(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radiolist() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radiolist(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checklist() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checklist(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx[33];
    	}

    	set layout(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setEnabled() {
    		return this.$$.ctx[34];
    	}

    	set setEnabled(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getTypeaheadInProgress() {
    		return this.$$.ctx[35];
    	}

    	set getTypeaheadInProgress(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectedIndex() {
    		return this.$$.ctx[36];
    	}

    	set getSelectedIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[37];
    	}

    	set getElement(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/floating-label/FloatingLabel.svelte generated by Svelte v3.38.2 */

    const file$b = "node_modules/@smui/floating-label/FloatingLabel.svelte";

    // (19:0) {:else}
    function create_else_block$1(ctx) {
    	let label;
    	let label_class_value;
    	let label_style_value;
    	let label_for_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	let label_levels = [
    		{
    			class: label_class_value = classMap({
    				[/*className*/ ctx[3]]: true,
    				"mdc-floating-label": true,
    				"mdc-floating-label--float-above": /*floatAbove*/ ctx[0],
    				"mdc-floating-label--required": /*required*/ ctx[1],
    				.../*internalClasses*/ ctx[8]
    			})
    		},
    		{
    			style: label_style_value = Object.entries(/*internalStyles*/ ctx[9]).map(func_1$1).concat([/*style*/ ctx[4]]).join(" ")
    		},
    		{
    			for: label_for_value = /*forId*/ ctx[5] || (/*inputProps*/ ctx[11]
    			? /*inputProps*/ ctx[11].id
    			: null)
    		},
    		/*$$restProps*/ ctx[12]
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			add_location(label, file$b, 19, 2, 494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			/*label_binding*/ ctx[24](label);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, label, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[10].call(null, label))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}

    			set_attributes(label, label_data = get_spread_update(label_levels, [
    				(!current || dirty & /*className, floatAbove, required, internalClasses*/ 267 && label_class_value !== (label_class_value = classMap({
    					[/*className*/ ctx[3]]: true,
    					"mdc-floating-label": true,
    					"mdc-floating-label--float-above": /*floatAbove*/ ctx[0],
    					"mdc-floating-label--required": /*required*/ ctx[1],
    					.../*internalClasses*/ ctx[8]
    				}))) && { class: label_class_value },
    				(!current || dirty & /*internalStyles, style*/ 528 && label_style_value !== (label_style_value = Object.entries(/*internalStyles*/ ctx[9]).map(func_1$1).concat([/*style*/ ctx[4]]).join(" "))) && { style: label_style_value },
    				(!current || dirty & /*forId*/ 32 && label_for_value !== (label_for_value = /*forId*/ ctx[5] || (/*inputProps*/ ctx[11]
    				? /*inputProps*/ ctx[11].id
    				: null))) && { for: label_for_value },
    				dirty & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    			/*label_binding*/ ctx[24](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(19:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if wrapped}
    function create_if_block$5(ctx) {
    	let span;
    	let span_class_value;
    	let span_style_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	let span_levels = [
    		{
    			class: span_class_value = classMap({
    				[/*className*/ ctx[3]]: true,
    				"mdc-floating-label": true,
    				"mdc-floating-label--float-above": /*floatAbove*/ ctx[0],
    				"mdc-floating-label--required": /*required*/ ctx[1],
    				.../*internalClasses*/ ctx[8]
    			})
    		},
    		{
    			style: span_style_value = Object.entries(/*internalStyles*/ ctx[9]).map(func$7).concat([/*style*/ ctx[4]]).join(" ")
    		},
    		/*$$restProps*/ ctx[12]
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$b, 1, 2, 16);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[23](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[10].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				(!current || dirty & /*className, floatAbove, required, internalClasses*/ 267 && span_class_value !== (span_class_value = classMap({
    					[/*className*/ ctx[3]]: true,
    					"mdc-floating-label": true,
    					"mdc-floating-label--float-above": /*floatAbove*/ ctx[0],
    					"mdc-floating-label--required": /*required*/ ctx[1],
    					.../*internalClasses*/ ctx[8]
    				}))) && { class: span_class_value },
    				(!current || dirty & /*internalStyles, style*/ 528 && span_style_value !== (span_style_value = Object.entries(/*internalStyles*/ ctx[9]).map(func$7).concat([/*style*/ ctx[4]]).join(" "))) && { style: span_style_value },
    				dirty & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[23](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(1:0) {#if wrapped}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*wrapped*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$7 = ([name, value]) => `${name}: ${value};`;
    const func_1$1 = ([name, value]) => `${name}: ${value};`;

    function instance_1$8($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","for","floatAbove","required","wrapped","shake","float","setRequired","getWidth","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FloatingLabel", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { style = "" } = $$props;
    	let { for: forId = null } = $$props;
    	let { floatAbove = false } = $$props;
    	let { required = false } = $$props;
    	let { wrapped = false } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let inputProps = getContext("SMUI:generic:input:props") || {};
    	let previousFloatAbove = floatAbove;
    	let previousRequired = required;

    	onMount(() => {
    		$$invalidate(18, instance = new MDCFloatingLabelFoundation({
    				addClass,
    				removeClass,
    				getWidth: () => {
    					const el = getElement();
    					const clone = el.cloneNode(true);
    					el.parentNode.appendChild(clone);
    					clone.classList.add("smui-floating-label--remove-transition");
    					clone.classList.add("smui-floating-label--force-size");
    					clone.classList.remove("mdc-floating-label--float-above");
    					const scrollWidth = clone.scrollWidth;
    					el.parentNode.removeChild(clone);
    					return scrollWidth;
    				},
    				registerInteractionHandler: (evtType, handler) => getElement().addEventListener(evtType, handler),
    				deregisterInteractionHandler: (evtType, handler) => getElement().removeEventListener(evtType, handler)
    			}));

    		const accessor = {
    			get element() {
    				return getElement();
    			},
    			addStyle,
    			removeStyle
    		};

    		dispatch(element, "SMUI:floating-label:mount", accessor);
    		instance.init();

    		return () => {
    			dispatch(element, "SMUI:floating-label:unmount", accessor);
    			instance.destroy();
    		};
    	});

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(8, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(8, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete internalStyles[name];
    				$$invalidate(9, internalStyles);
    			} else {
    				$$invalidate(9, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function removeStyle(name) {
    		if (name in internalStyles) {
    			delete internalStyles[name];
    			$$invalidate(9, internalStyles);
    		}
    	}

    	function shake(shouldShake) {
    		instance.shake(shouldShake);
    	}

    	function float(shouldFloat) {
    		$$invalidate(0, floatAbove = shouldFloat);
    	}

    	function setRequired(isRequired) {
    		$$invalidate(1, required = isRequired);
    	}

    	function getWidth() {
    		return instance.getWidth();
    	}

    	function getElement() {
    		return element;
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	function label_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(2, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(4, style = $$new_props.style);
    		if ("for" in $$new_props) $$invalidate(5, forId = $$new_props.for);
    		if ("floatAbove" in $$new_props) $$invalidate(0, floatAbove = $$new_props.floatAbove);
    		if ("required" in $$new_props) $$invalidate(1, required = $$new_props.required);
    		if ("wrapped" in $$new_props) $$invalidate(6, wrapped = $$new_props.wrapped);
    		if ("$$scope" in $$new_props) $$invalidate(21, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCFloatingLabelFoundation,
    		onMount,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		dispatch,
    		forwardEvents,
    		use,
    		className,
    		style,
    		forId,
    		floatAbove,
    		required,
    		wrapped,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		inputProps,
    		previousFloatAbove,
    		previousRequired,
    		addClass,
    		removeClass,
    		addStyle,
    		removeStyle,
    		shake,
    		float,
    		setRequired,
    		getWidth,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(2, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("style" in $$props) $$invalidate(4, style = $$new_props.style);
    		if ("forId" in $$props) $$invalidate(5, forId = $$new_props.forId);
    		if ("floatAbove" in $$props) $$invalidate(0, floatAbove = $$new_props.floatAbove);
    		if ("required" in $$props) $$invalidate(1, required = $$new_props.required);
    		if ("wrapped" in $$props) $$invalidate(6, wrapped = $$new_props.wrapped);
    		if ("element" in $$props) $$invalidate(7, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(18, instance = $$new_props.instance);
    		if ("internalClasses" in $$props) $$invalidate(8, internalClasses = $$new_props.internalClasses);
    		if ("internalStyles" in $$props) $$invalidate(9, internalStyles = $$new_props.internalStyles);
    		if ("inputProps" in $$props) $$invalidate(11, inputProps = $$new_props.inputProps);
    		if ("previousFloatAbove" in $$props) $$invalidate(19, previousFloatAbove = $$new_props.previousFloatAbove);
    		if ("previousRequired" in $$props) $$invalidate(20, previousRequired = $$new_props.previousRequired);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*previousFloatAbove, floatAbove, instance*/ 786433) {
    			if (previousFloatAbove !== floatAbove) {
    				$$invalidate(19, previousFloatAbove = floatAbove);
    				instance.float(floatAbove);
    			}
    		}

    		if ($$self.$$.dirty & /*previousRequired, required, instance*/ 1310722) {
    			if (previousRequired !== required) {
    				$$invalidate(20, previousRequired = required);
    				instance.setRequired(required);
    			}
    		}
    	};

    	return [
    		floatAbove,
    		required,
    		use,
    		className,
    		style,
    		forId,
    		wrapped,
    		element,
    		internalClasses,
    		internalStyles,
    		forwardEvents,
    		inputProps,
    		$$restProps,
    		shake,
    		float,
    		setRequired,
    		getWidth,
    		getElement,
    		instance,
    		previousFloatAbove,
    		previousRequired,
    		$$scope,
    		slots,
    		span_binding,
    		label_binding
    	];
    }

    class FloatingLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1$8, create_fragment$c, safe_not_equal, {
    			use: 2,
    			class: 3,
    			style: 4,
    			for: 5,
    			floatAbove: 0,
    			required: 1,
    			wrapped: 6,
    			shake: 13,
    			float: 14,
    			setRequired: 15,
    			getWidth: 16,
    			getElement: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FloatingLabel",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get use() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get for() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set for(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get floatAbove() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set floatAbove(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapped() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapped(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shake() {
    		return this.$$.ctx[13];
    	}

    	set shake(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get float() {
    		return this.$$.ctx[14];
    	}

    	set float(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setRequired() {
    		return this.$$.ctx[15];
    	}

    	set setRequired(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getWidth() {
    		return this.$$.ctx[16];
    	}

    	set getWidth(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[17];
    	}

    	set getElement(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/line-ripple/LineRipple.svelte generated by Svelte v3.38.2 */

    const file$a = "node_modules/@smui/line-ripple/LineRipple.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let useActions_action;
    	let mounted;
    	let dispose;

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-line-ripple": true,
    				"mdc-line-ripple--active": /*active*/ ctx[3],
    				.../*internalClasses*/ ctx[5]
    			})
    		},
    		{
    			style: div_style_value = Object.entries(/*internalStyles*/ ctx[6]).map(func$6).concat([/*style*/ ctx[2]]).join(" ")
    		},
    		/*$$restProps*/ ctx[8]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_attributes(div, div_data);
    			add_location(div, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[13](div);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[7].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*className, active, internalClasses*/ 42 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					"mdc-line-ripple": true,
    					"mdc-line-ripple--active": /*active*/ ctx[3],
    					.../*internalClasses*/ ctx[5]
    				})) && { class: div_class_value },
    				dirty & /*internalStyles, style*/ 68 && div_style_value !== (div_style_value = Object.entries(/*internalStyles*/ ctx[6]).map(func$6).concat([/*style*/ ctx[2]]).join(" ")) && { style: div_style_value },
    				dirty & /*$$restProps*/ 256 && /*$$restProps*/ ctx[8]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$6 = ([name, value]) => `${name}: ${value};`;

    function instance_1$7($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","active","activate","deactivate","setRippleCenter","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LineRipple", slots, []);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { style = "" } = $$props;
    	let { active = false } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};

    	onMount(() => {
    		instance = new MDCLineRippleFoundation({
    				addClass,
    				removeClass,
    				hasClass,
    				setStyle: addStyle,
    				registerEventHandler: (evtType, handler) => getElement().addEventListener(evtType, handler),
    				deregisterEventHandler: (evtType, handler) => getElement().removeEventListener(evtType, handler)
    			});

    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(5, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(5, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete internalStyles[name];
    				$$invalidate(6, internalStyles);
    			} else {
    				$$invalidate(6, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function activate() {
    		instance.activate();
    	}

    	function deactivate() {
    		instance.deactivate();
    	}

    	function setRippleCenter(xCoordinate) {
    		instance.setRippleCenter(xCoordinate);
    	}

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(2, style = $$new_props.style);
    		if ("active" in $$new_props) $$invalidate(3, active = $$new_props.active);
    	};

    	$$self.$capture_state = () => ({
    		MDCLineRippleFoundation,
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		style,
    		active,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		hasClass,
    		addClass,
    		removeClass,
    		addStyle,
    		activate,
    		deactivate,
    		setRippleCenter,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("style" in $$props) $$invalidate(2, style = $$new_props.style);
    		if ("active" in $$props) $$invalidate(3, active = $$new_props.active);
    		if ("element" in $$props) $$invalidate(4, element = $$new_props.element);
    		if ("instance" in $$props) instance = $$new_props.instance;
    		if ("internalClasses" in $$props) $$invalidate(5, internalClasses = $$new_props.internalClasses);
    		if ("internalStyles" in $$props) $$invalidate(6, internalStyles = $$new_props.internalStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		style,
    		active,
    		element,
    		internalClasses,
    		internalStyles,
    		forwardEvents,
    		$$restProps,
    		activate,
    		deactivate,
    		setRippleCenter,
    		getElement,
    		div_binding
    	];
    }

    class LineRipple extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1$7, create_fragment$b, safe_not_equal, {
    			use: 0,
    			class: 1,
    			style: 2,
    			active: 3,
    			activate: 9,
    			deactivate: 10,
    			setRippleCenter: 11,
    			getElement: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineRipple",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get use() {
    		throw new Error("<LineRipple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<LineRipple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LineRipple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<LineRipple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activate() {
    		return this.$$.ctx[9];
    	}

    	set activate(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deactivate() {
    		return this.$$.ctx[10];
    	}

    	set deactivate(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setRippleCenter() {
    		return this.$$.ctx[11];
    	}

    	set setRippleCenter(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[12];
    	}

    	set getElement(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/notched-outline/NotchedOutline.svelte generated by Svelte v3.38.2 */

    const file$9 = "node_modules/@smui/notched-outline/NotchedOutline.svelte";

    // (17:2) {#if !noLabel}
    function create_if_block$4(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "mdc-notched-outline__notch");
    			attr_dev(div, "style", div_style_value = Object.entries(/*notchStyles*/ ctx[7]).map(func$5).join(" "));
    			add_location(div, file$9, 17, 4, 500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*notchStyles*/ 128 && div_style_value !== (div_style_value = Object.entries(/*notchStyles*/ ctx[7]).map(func$5).join(" "))) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(17:2) {#if !noLabel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let div2_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*noLabel*/ ctx[3] && create_if_block$4(ctx);

    	let div2_levels = [
    		{
    			class: div2_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-notched-outline": true,
    				"mdc-notched-outline--notched": /*notched*/ ctx[2],
    				"mdc-notched-outline--no-label": /*noLabel*/ ctx[3],
    				.../*internalClasses*/ ctx[6]
    			})
    		},
    		/*$$restProps*/ ctx[9]
    	];

    	let div2_data = {};

    	for (let i = 0; i < div2_levels.length; i += 1) {
    		div2_data = assign(div2_data, div2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "mdc-notched-outline__leading");
    			add_location(div0, file$9, 15, 2, 434);
    			attr_dev(div1, "class", "mdc-notched-outline__trailing");
    			add_location(div1, file$9, 26, 2, 703);
    			set_attributes(div2, div2_data);
    			add_location(div2, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			/*div2_binding*/ ctx[15](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div2, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[8].call(null, div2)),
    					listen_dev(div2, "SMUI:floating-label:mount", /*SMUI_floating_label_mount_handler*/ ctx[16], false, false, false),
    					listen_dev(div2, "SMUI:floating-label:unmount", /*SMUI_floating_label_unmount_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*noLabel*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*noLabel*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			set_attributes(div2, div2_data = get_spread_update(div2_levels, [
    				(!current || dirty & /*className, notched, noLabel, internalClasses*/ 78 && div2_class_value !== (div2_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					"mdc-notched-outline": true,
    					"mdc-notched-outline--notched": /*notched*/ ctx[2],
    					"mdc-notched-outline--no-label": /*noLabel*/ ctx[3],
    					.../*internalClasses*/ ctx[6]
    				}))) && { class: div2_class_value },
    				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
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
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			/*div2_binding*/ ctx[15](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$5 = ([name, value]) => `${name}: ${value};`;

    function instance_1$6($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","notched","noLabel","notch","closeNotch","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotchedOutline", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { notched = false } = $$props;
    	let { noLabel = false } = $$props;
    	let element;
    	let instance;
    	let floatingLabel;
    	let internalClasses = {};
    	let notchStyles = {};

    	onMount(() => {
    		instance = new MDCNotchedOutlineFoundation({
    				addClass,
    				removeClass,
    				setNotchWidthProperty: width => addNotchStyle("width", width + "px"),
    				removeNotchWidthProperty: () => removeNotchStyle("width")
    			});

    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(6, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(6, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addNotchStyle(name, value) {
    		if (notchStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete notchStyles[name];
    				$$invalidate(7, notchStyles);
    			} else {
    				$$invalidate(7, notchStyles[name] = value, notchStyles);
    			}
    		}
    	}

    	function removeNotchStyle(name) {
    		if (name in notchStyles) {
    			delete notchStyles[name];
    			$$invalidate(7, notchStyles);
    		}
    	}

    	function notch(notchWidth) {
    		instance.notch(notchWidth);
    	}

    	function closeNotch() {
    		instance.closeNotch();
    	}

    	function getElement() {
    		return element;
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(5, element);
    		});
    	}

    	const SMUI_floating_label_mount_handler = event => $$invalidate(4, floatingLabel = event.detail);
    	const SMUI_floating_label_unmount_handler = () => $$invalidate(4, floatingLabel = undefined);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("notched" in $$new_props) $$invalidate(2, notched = $$new_props.notched);
    		if ("noLabel" in $$new_props) $$invalidate(3, noLabel = $$new_props.noLabel);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCNotchedOutlineFoundation,
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		notched,
    		noLabel,
    		element,
    		instance,
    		floatingLabel,
    		internalClasses,
    		notchStyles,
    		addClass,
    		removeClass,
    		addNotchStyle,
    		removeNotchStyle,
    		notch,
    		closeNotch,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("notched" in $$props) $$invalidate(2, notched = $$new_props.notched);
    		if ("noLabel" in $$props) $$invalidate(3, noLabel = $$new_props.noLabel);
    		if ("element" in $$props) $$invalidate(5, element = $$new_props.element);
    		if ("instance" in $$props) instance = $$new_props.instance;
    		if ("floatingLabel" in $$props) $$invalidate(4, floatingLabel = $$new_props.floatingLabel);
    		if ("internalClasses" in $$props) $$invalidate(6, internalClasses = $$new_props.internalClasses);
    		if ("notchStyles" in $$props) $$invalidate(7, notchStyles = $$new_props.notchStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*floatingLabel*/ 16) {
    			if (floatingLabel) {
    				floatingLabel.addStyle("transition-duration", "0s");
    				addClass("mdc-notched-outline--upgraded");

    				requestAnimationFrame(() => {
    					floatingLabel.removeStyle("transition-duration");
    				});
    			} else {
    				removeClass("mdc-notched-outline--upgraded");
    			}
    		}
    	};

    	return [
    		use,
    		className,
    		notched,
    		noLabel,
    		floatingLabel,
    		element,
    		internalClasses,
    		notchStyles,
    		forwardEvents,
    		$$restProps,
    		notch,
    		closeNotch,
    		getElement,
    		$$scope,
    		slots,
    		div2_binding,
    		SMUI_floating_label_mount_handler,
    		SMUI_floating_label_unmount_handler
    	];
    }

    class NotchedOutline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1$6, create_fragment$a, safe_not_equal, {
    			use: 0,
    			class: 1,
    			notched: 2,
    			noLabel: 3,
    			notch: 10,
    			closeNotch: 11,
    			getElement: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotchedOutline",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get use() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notched() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notched(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noLabel() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noLabel(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notch() {
    		return this.$$.ctx[10];
    	}

    	set notch(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeNotch() {
    		return this.$$.ctx[11];
    	}

    	set closeNotch(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[12];
    	}

    	set getElement(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/select/helper-text/HelperText.svelte generated by Svelte v3.38.2 */

    const file$8 = "node_modules/@smui/select/helper-text/HelperText.svelte";

    // (17:31) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*content*/ ctx[8]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 256) set_data_dev(t, /*content*/ ctx[8]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(17:31) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:2) {#if content == null}
    function create_if_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(17:2) {#if content == null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let div_aria_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*content*/ ctx[8] == null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-select-helper-text": true,
    				"mdc-select-helper-text--validation-msg": /*validationMsg*/ ctx[4],
    				"mdc-select-helper-text--validation-msg-persistent": /*persistent*/ ctx[3],
    				.../*internalClasses*/ ctx[6]
    			})
    		},
    		{
    			"aria-hidden": div_aria_hidden_value = /*persistent*/ ctx[3] ? null : "true"
    		},
    		{ id: /*id*/ ctx[2] },
    		/*internalAttrs*/ ctx[7],
    		/*$$restProps*/ ctx[10]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			set_attributes(div, div_data);
    			add_location(div, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			/*div_binding*/ ctx[14](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[9].call(null, div))
    				];

    				mounted = true;
    			}
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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, validationMsg, persistent, internalClasses*/ 90 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					"mdc-select-helper-text": true,
    					"mdc-select-helper-text--validation-msg": /*validationMsg*/ ctx[4],
    					"mdc-select-helper-text--validation-msg-persistent": /*persistent*/ ctx[3],
    					.../*internalClasses*/ ctx[6]
    				}))) && { class: div_class_value },
    				(!current || dirty & /*persistent*/ 8 && div_aria_hidden_value !== (div_aria_hidden_value = /*persistent*/ ctx[3] ? null : "true")) && { "aria-hidden": div_aria_hidden_value },
    				(!current || dirty & /*id*/ 4) && { id: /*id*/ ctx[2] },
    				dirty & /*internalAttrs*/ 128 && /*internalAttrs*/ ctx[7],
    				dirty & /*$$restProps*/ 1024 && /*$$restProps*/ ctx[10]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
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
    			/*div_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let counter$2 = 0;

    function instance_1$5($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","id","persistent","validationMsg","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HelperText", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { id = "SMUI-select-helper-text-" + counter$2++ } = $$props;
    	let { persistent = false } = $$props;
    	let { validationMsg = false } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalAttrs = {};
    	let content = null;

    	onMount(() => {
    		instance = new MDCSelectHelperTextFoundation({
    				addClass,
    				removeClass,
    				hasClass,
    				getAttr,
    				setAttr: addAttr,
    				removeAttr,
    				setContent: value => {
    					$$invalidate(8, content = value);
    				}
    			});

    		if (id.startsWith("SMUI-select-helper-text-")) {
    			dispatch(getElement(), "SMUI:select:helper-text:id", id);
    		}

    		dispatch(getElement(), "SMUI:select:helper-text:mount", instance);
    		instance.init();

    		return () => {
    			dispatch(getElement(), "SMUI:select:helper-text:unmount", instance);
    			instance.destroy();
    		};
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(6, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(6, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function getAttr(name) {
    		return name in internalAttrs
    		? internalAttrs[name]
    		: getElement().getAttribute(name);
    	}

    	function addAttr(name, value) {
    		if (internalAttrs[name] !== value) {
    			$$invalidate(7, internalAttrs[name] = value, internalAttrs);
    		}
    	}

    	function removeAttr(name) {
    		if (!(name in internalAttrs) || internalAttrs[name] != null) {
    			$$invalidate(7, internalAttrs[name] = undefined, internalAttrs);
    		}
    	}

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(5, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(2, id = $$new_props.id);
    		if ("persistent" in $$new_props) $$invalidate(3, persistent = $$new_props.persistent);
    		if ("validationMsg" in $$new_props) $$invalidate(4, validationMsg = $$new_props.validationMsg);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		counter: counter$2,
    		MDCSelectHelperTextFoundation,
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		dispatch,
    		forwardEvents,
    		use,
    		className,
    		id,
    		persistent,
    		validationMsg,
    		element,
    		instance,
    		internalClasses,
    		internalAttrs,
    		content,
    		hasClass,
    		addClass,
    		removeClass,
    		getAttr,
    		addAttr,
    		removeAttr,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(2, id = $$new_props.id);
    		if ("persistent" in $$props) $$invalidate(3, persistent = $$new_props.persistent);
    		if ("validationMsg" in $$props) $$invalidate(4, validationMsg = $$new_props.validationMsg);
    		if ("element" in $$props) $$invalidate(5, element = $$new_props.element);
    		if ("instance" in $$props) instance = $$new_props.instance;
    		if ("internalClasses" in $$props) $$invalidate(6, internalClasses = $$new_props.internalClasses);
    		if ("internalAttrs" in $$props) $$invalidate(7, internalAttrs = $$new_props.internalAttrs);
    		if ("content" in $$props) $$invalidate(8, content = $$new_props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		id,
    		persistent,
    		validationMsg,
    		element,
    		internalClasses,
    		internalAttrs,
    		content,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class HelperText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1$5, create_fragment$9, safe_not_equal, {
    			use: 0,
    			class: 1,
    			id: 2,
    			persistent: 3,
    			validationMsg: 4,
    			getElement: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HelperText",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get use() {
    		throw new Error("<HelperText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<HelperText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<HelperText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<HelperText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<HelperText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<HelperText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistent() {
    		throw new Error("<HelperText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistent(value) {
    		throw new Error("<HelperText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validationMsg() {
    		throw new Error("<HelperText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validationMsg(value) {
    		throw new Error("<HelperText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[11];
    	}

    	set getElement(value) {
    		throw new Error("<HelperText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/select/Select.svelte generated by Svelte v3.38.2 */
    const file$7 = "node_modules/@smui/select/Select.svelte";
    const get_helperText_slot_changes = dirty => ({});
    const get_helperText_slot_context = ctx => ({});
    const get_leadingIcon_slot_changes = dirty => ({});
    const get_leadingIcon_slot_context = ctx => ({});
    const get_label_slot_changes_1 = dirty => ({});
    const get_label_slot_context_1 = ctx => ({});
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (52:2) {#if hiddenInput}
    function create_if_block_6(ctx) {
    	let input;

    	let input_levels = [
    		{ type: "hidden" },
    		{ required: /*required*/ ctx[10] },
    		{ disabled: /*disabled*/ ctx[6] },
    		{ value: /*value*/ ctx[0] },
    		prefixFilter(/*$$restProps*/ ctx[53], "input$")
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$7, 52, 4, 1508);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "hidden" },
    				dirty[0] & /*required*/ 1024 && { required: /*required*/ ctx[10] },
    				dirty[0] & /*disabled*/ 64 && { disabled: /*disabled*/ ctx[6] },
    				dirty[0] & /*value*/ 1 && { value: /*value*/ ctx[0] },
    				dirty[1] & /*$$restProps*/ 4194304 && prefixFilter(/*$$restProps*/ ctx[53], "input$")
    			]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(52:2) {#if hiddenInput}",
    		ctx
    	});

    	return block;
    }

    // (86:4) {#if variant === 'filled'}
    function create_if_block_5(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "mdc-select__ripple");
    			add_location(span, file$7, 86, 6, 2430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(86:4) {#if variant === 'filled'}",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#if variant !== 'outlined' && !noLabel && (label != null || $$slots.label)}
    function create_if_block_4(ctx) {
    	let floatinglabel;
    	let current;

    	const floatinglabel_spread_levels = [
    		{ id: /*inputId*/ ctx[11] + "-smui-label" },
    		{
    			floatAbove: /*$selectedTextStore*/ ctx[43] !== ""
    		},
    		{ required: /*required*/ ctx[10] },
    		prefixFilter(/*$$restProps*/ ctx[53], "label$")
    	];

    	let floatinglabel_props = {
    		$$slots: { default: [create_default_slot_5$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < floatinglabel_spread_levels.length; i += 1) {
    		floatinglabel_props = assign(floatinglabel_props, floatinglabel_spread_levels[i]);
    	}

    	floatinglabel = new FloatingLabel({
    			props: floatinglabel_props,
    			$$inline: true
    		});

    	/*floatinglabel_binding*/ ctx[64](floatinglabel);

    	const block = {
    		c: function create() {
    			create_component(floatinglabel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(floatinglabel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const floatinglabel_changes = (dirty[0] & /*inputId, required*/ 3072 | dirty[1] & /*$selectedTextStore, $$restProps*/ 4198400)
    			? get_spread_update(floatinglabel_spread_levels, [
    					dirty[0] & /*inputId*/ 2048 && { id: /*inputId*/ ctx[11] + "-smui-label" },
    					dirty[1] & /*$selectedTextStore*/ 4096 && {
    						floatAbove: /*$selectedTextStore*/ ctx[43] !== ""
    					},
    					dirty[0] & /*required*/ 1024 && { required: /*required*/ ctx[10] },
    					dirty[1] & /*$$restProps*/ 4194304 && get_spread_object(prefixFilter(/*$$restProps*/ ctx[53], "label$"))
    				])
    			: {};

    			if (dirty[0] & /*label*/ 512 | dirty[2] & /*$$scope*/ 33554432) {
    				floatinglabel_changes.$$scope = { dirty, ctx };
    			}

    			floatinglabel.$set(floatinglabel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(floatinglabel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(floatinglabel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*floatinglabel_binding*/ ctx[64](null);
    			destroy_component(floatinglabel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(89:4) {#if variant !== 'outlined' && !noLabel && (label != null || $$slots.label)}",
    		ctx
    	});

    	return block;
    }

    // (90:6) <FloatingLabel         bind:this={floatingLabel}         id={inputId + '-smui-label'}         floatAbove={$selectedTextStore !== ''}         {required}         {...prefixFilter($$restProps, 'label$')}         >
    function create_default_slot_5$1(ctx) {
    	let t_value = (/*label*/ ctx[9] == null ? "" : /*label*/ ctx[9]) + "";
    	let t;
    	let current;
    	const label_slot_template = /*#slots*/ ctx[61].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[87], get_label_slot_context);

    	const block = {
    		c: function create() {
    			t = text(t_value);
    			if (label_slot) label_slot.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (label_slot) {
    				label_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*label*/ 512) && t_value !== (t_value = (/*label*/ ctx[9] == null ? "" : /*label*/ ctx[9]) + "")) set_data_dev(t, t_value);

    			if (label_slot) {
    				if (label_slot.p && (!current || dirty[2] & /*$$scope*/ 33554432)) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[87], dirty, get_label_slot_changes, get_label_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (label_slot) label_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(90:6) <FloatingLabel         bind:this={floatingLabel}         id={inputId + '-smui-label'}         floatAbove={$selectedTextStore !== ''}         {required}         {...prefixFilter($$restProps, 'label$')}         >",
    		ctx
    	});

    	return block;
    }

    // (99:4) {#if variant === 'outlined'}
    function create_if_block_2(ctx) {
    	let notchedoutline;
    	let current;

    	const notchedoutline_spread_levels = [
    		{
    			noLabel: /*noLabel*/ ctx[8] || /*label*/ ctx[9] == null && !/*$$slots*/ ctx[52].label
    		},
    		prefixFilter(/*$$restProps*/ ctx[53], "outline$")
    	];

    	let notchedoutline_props = {
    		$$slots: { default: [create_default_slot_3$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notchedoutline_spread_levels.length; i += 1) {
    		notchedoutline_props = assign(notchedoutline_props, notchedoutline_spread_levels[i]);
    	}

    	notchedoutline = new NotchedOutline({
    			props: notchedoutline_props,
    			$$inline: true
    		});

    	/*notchedoutline_binding*/ ctx[66](notchedoutline);

    	const block = {
    		c: function create() {
    			create_component(notchedoutline.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notchedoutline, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notchedoutline_changes = (dirty[0] & /*noLabel, label*/ 768 | dirty[1] & /*$$slots, $$restProps*/ 6291456)
    			? get_spread_update(notchedoutline_spread_levels, [
    					dirty[0] & /*noLabel, label*/ 768 | dirty[1] & /*$$slots*/ 2097152 && {
    						noLabel: /*noLabel*/ ctx[8] || /*label*/ ctx[9] == null && !/*$$slots*/ ctx[52].label
    					},
    					dirty[1] & /*$$restProps*/ 4194304 && get_spread_object(prefixFilter(/*$$restProps*/ ctx[53], "outline$"))
    				])
    			: {};

    			if (dirty[0] & /*inputId, required, label, noLabel*/ 3840 | dirty[1] & /*$selectedTextStore, $$restProps, floatingLabel, $$slots*/ 6296064 | dirty[2] & /*$$scope*/ 33554432) {
    				notchedoutline_changes.$$scope = { dirty, ctx };
    			}

    			notchedoutline.$set(notchedoutline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notchedoutline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notchedoutline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*notchedoutline_binding*/ ctx[66](null);
    			destroy_component(notchedoutline, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(99:4) {#if variant === 'outlined'}",
    		ctx
    	});

    	return block;
    }

    // (105:8) {#if !noLabel && (label != null || $$slots.label)}
    function create_if_block_3(ctx) {
    	let floatinglabel;
    	let current;

    	const floatinglabel_spread_levels = [
    		{ id: /*inputId*/ ctx[11] + "-smui-label" },
    		{
    			floatAbove: /*$selectedTextStore*/ ctx[43] !== ""
    		},
    		{ required: /*required*/ ctx[10] },
    		prefixFilter(/*$$restProps*/ ctx[53], "label$")
    	];

    	let floatinglabel_props = {
    		$$slots: { default: [create_default_slot_4$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < floatinglabel_spread_levels.length; i += 1) {
    		floatinglabel_props = assign(floatinglabel_props, floatinglabel_spread_levels[i]);
    	}

    	floatinglabel = new FloatingLabel({
    			props: floatinglabel_props,
    			$$inline: true
    		});

    	/*floatinglabel_binding_1*/ ctx[65](floatinglabel);

    	const block = {
    		c: function create() {
    			create_component(floatinglabel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(floatinglabel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const floatinglabel_changes = (dirty[0] & /*inputId, required*/ 3072 | dirty[1] & /*$selectedTextStore, $$restProps*/ 4198400)
    			? get_spread_update(floatinglabel_spread_levels, [
    					dirty[0] & /*inputId*/ 2048 && { id: /*inputId*/ ctx[11] + "-smui-label" },
    					dirty[1] & /*$selectedTextStore*/ 4096 && {
    						floatAbove: /*$selectedTextStore*/ ctx[43] !== ""
    					},
    					dirty[0] & /*required*/ 1024 && { required: /*required*/ ctx[10] },
    					dirty[1] & /*$$restProps*/ 4194304 && get_spread_object(prefixFilter(/*$$restProps*/ ctx[53], "label$"))
    				])
    			: {};

    			if (dirty[0] & /*label*/ 512 | dirty[2] & /*$$scope*/ 33554432) {
    				floatinglabel_changes.$$scope = { dirty, ctx };
    			}

    			floatinglabel.$set(floatinglabel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(floatinglabel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(floatinglabel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*floatinglabel_binding_1*/ ctx[65](null);
    			destroy_component(floatinglabel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(105:8) {#if !noLabel && (label != null || $$slots.label)}",
    		ctx
    	});

    	return block;
    }

    // (106:10) <FloatingLabel             bind:this={floatingLabel}             id={inputId + '-smui-label'}             floatAbove={$selectedTextStore !== ''}             {required}             {...prefixFilter($$restProps, 'label$')}             >
    function create_default_slot_4$1(ctx) {
    	let t_value = (/*label*/ ctx[9] == null ? "" : /*label*/ ctx[9]) + "";
    	let t;
    	let current;
    	const label_slot_template = /*#slots*/ ctx[61].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[87], get_label_slot_context_1);

    	const block = {
    		c: function create() {
    			t = text(t_value);
    			if (label_slot) label_slot.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (label_slot) {
    				label_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*label*/ 512) && t_value !== (t_value = (/*label*/ ctx[9] == null ? "" : /*label*/ ctx[9]) + "")) set_data_dev(t, t_value);

    			if (label_slot) {
    				if (label_slot.p && (!current || dirty[2] & /*$$scope*/ 33554432)) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[87], dirty, get_label_slot_changes_1, get_label_slot_context_1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (label_slot) label_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(106:10) <FloatingLabel             bind:this={floatingLabel}             id={inputId + '-smui-label'}             floatAbove={$selectedTextStore !== ''}             {required}             {...prefixFilter($$restProps, 'label$')}             >",
    		ctx
    	});

    	return block;
    }

    // (100:6) <NotchedOutline         bind:this={notchedOutline}         noLabel={noLabel || (label == null && !$$slots.label)}         {...prefixFilter($$restProps, 'outline$')}       >
    function create_default_slot_3$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*noLabel*/ ctx[8] && (/*label*/ ctx[9] != null || /*$$slots*/ ctx[52].label) && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*noLabel*/ ctx[8] && (/*label*/ ctx[9] != null || /*$$slots*/ ctx[52].label)) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*noLabel, label*/ 768 | dirty[1] & /*$$slots*/ 2097152) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(100:6) <NotchedOutline         bind:this={notchedOutline}         noLabel={noLabel || (label == null && !$$slots.label)}         {...prefixFilter($$restProps, 'outline$')}       >",
    		ctx
    	});

    	return block;
    }

    // (169:4) {#if variant !== 'outlined' && ripple}
    function create_if_block_1$1(ctx) {
    	let lineripple;
    	let current;
    	const lineripple_spread_levels = [prefixFilter(/*$$restProps*/ ctx[53], "ripple$")];
    	let lineripple_props = {};

    	for (let i = 0; i < lineripple_spread_levels.length; i += 1) {
    		lineripple_props = assign(lineripple_props, lineripple_spread_levels[i]);
    	}

    	lineripple = new LineRipple({ props: lineripple_props, $$inline: true });
    	/*lineripple_binding*/ ctx[68](lineripple);

    	const block = {
    		c: function create() {
    			create_component(lineripple.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lineripple, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const lineripple_changes = (dirty[1] & /*$$restProps*/ 4194304)
    			? get_spread_update(lineripple_spread_levels, [get_spread_object(prefixFilter(/*$$restProps*/ ctx[53], "ripple$"))])
    			: {};

    			lineripple.$set(lineripple_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lineripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lineripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*lineripple_binding*/ ctx[68](null);
    			destroy_component(lineripple, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(169:4) {#if variant !== 'outlined' && ripple}",
    		ctx
    	});

    	return block;
    }

    // (195:4) <List       role="listbox"       {wrapFocus}       bind:selectedIndex       on:SMUI:list:mount={(event) => (list = event.detail)}       {...prefixFilter($$restProps, 'list$')}>
    function create_default_slot_2$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[61].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[87], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[2] & /*$$scope*/ 33554432)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[87], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(195:4) <List       role=\\\"listbox\\\"       {wrapFocus}       bind:selectedIndex       on:SMUI:list:mount={(event) => (list = event.detail)}       {...prefixFilter($$restProps, 'list$')}>",
    		ctx
    	});

    	return block;
    }

    // (177:2) <Menu     class={classMap({       [menu$class]: true,       'mdc-select__menu': true,       ...menuClasses,     })}     fullWidth     anchor={false}     {anchorElement}     {anchorCorner}     bind:open={menuOpen}     on:MDCMenu:selected={(event) =>       instance && instance.handleMenuItemAction(event.detail.index)}     on:MDCMenuSurface:closing={() => instance && instance.handleMenuClosing()}     on:MDCMenuSurface:closed={() => instance && instance.handleMenuClosed()}     on:MDCMenuSurface:opened={() => instance && instance.handleMenuOpened()}     {...prefixFilter($$restProps, 'menu$')}   >
    function create_default_slot_1$2(ctx) {
    	let list_1;
    	let updating_selectedIndex;
    	let current;

    	const list_1_spread_levels = [
    		{ role: "listbox" },
    		{ wrapFocus: /*wrapFocus*/ ctx[36] },
    		prefixFilter(/*$$restProps*/ ctx[53], "list$")
    	];

    	function list_1_selectedIndex_binding(value) {
    		/*list_1_selectedIndex_binding*/ ctx[74](value);
    	}

    	let list_1_props = {
    		$$slots: { default: [create_default_slot_2$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < list_1_spread_levels.length; i += 1) {
    		list_1_props = assign(list_1_props, list_1_spread_levels[i]);
    	}

    	if (/*selectedIndex*/ ctx[24] !== void 0) {
    		list_1_props.selectedIndex = /*selectedIndex*/ ctx[24];
    	}

    	list_1 = new List({ props: list_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(list_1, "selectedIndex", list_1_selectedIndex_binding));
    	list_1.$on("SMUI:list:mount", /*SMUI_list_mount_handler*/ ctx[75]);

    	const block = {
    		c: function create() {
    			create_component(list_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_1_changes = (dirty[1] & /*wrapFocus, $$restProps*/ 4194336)
    			? get_spread_update(list_1_spread_levels, [
    					list_1_spread_levels[0],
    					dirty[1] & /*wrapFocus*/ 32 && { wrapFocus: /*wrapFocus*/ ctx[36] },
    					dirty[1] & /*$$restProps*/ 4194304 && get_spread_object(prefixFilter(/*$$restProps*/ ctx[53], "list$"))
    				])
    			: {};

    			if (dirty[2] & /*$$scope*/ 33554432) {
    				list_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selectedIndex && dirty[0] & /*selectedIndex*/ 16777216) {
    				updating_selectedIndex = true;
    				list_1_changes.selectedIndex = /*selectedIndex*/ ctx[24];
    				add_flush_callback(() => updating_selectedIndex = false);
    			}

    			list_1.$set(list_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(177:2) <Menu     class={classMap({       [menu$class]: true,       'mdc-select__menu': true,       ...menuClasses,     })}     fullWidth     anchor={false}     {anchorElement}     {anchorCorner}     bind:open={menuOpen}     on:MDCMenu:selected={(event) =>       instance && instance.handleMenuItemAction(event.detail.index)}     on:MDCMenuSurface:closing={() => instance && instance.handleMenuClosing()}     on:MDCMenuSurface:closed={() => instance && instance.handleMenuClosed()}     on:MDCMenuSurface:opened={() => instance && instance.handleMenuOpened()}     {...prefixFilter($$restProps, 'menu$')}   >",
    		ctx
    	});

    	return block;
    }

    // (204:0) {#if $$slots.helperText}
    function create_if_block$2(ctx) {
    	let helpertext;
    	let current;
    	const helpertext_spread_levels = [prefixFilter(/*$$restProps*/ ctx[53], "helperText$")];

    	let helpertext_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < helpertext_spread_levels.length; i += 1) {
    		helpertext_props = assign(helpertext_props, helpertext_spread_levels[i]);
    	}

    	helpertext = new HelperText({ props: helpertext_props, $$inline: true });
    	helpertext.$on("SMUI:select:helper-text:id", /*SMUI_select_helper_text_id_handler*/ ctx[84]);
    	helpertext.$on("SMUI:select:helper-text:mount", /*SMUI_select_helper_text_mount_handler*/ ctx[85]);
    	helpertext.$on("SMUI:select:helper-text:unmount", /*SMUI_select_helper_text_unmount_handler*/ ctx[86]);

    	const block = {
    		c: function create() {
    			create_component(helpertext.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(helpertext, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const helpertext_changes = (dirty[1] & /*$$restProps*/ 4194304)
    			? get_spread_update(helpertext_spread_levels, [get_spread_object(prefixFilter(/*$$restProps*/ ctx[53], "helperText$"))])
    			: {};

    			if (dirty[2] & /*$$scope*/ 33554432) {
    				helpertext_changes.$$scope = { dirty, ctx };
    			}

    			helpertext.$set(helpertext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(helpertext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(helpertext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(helpertext, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(204:0) {#if $$slots.helperText}",
    		ctx
    	});

    	return block;
    }

    // (205:2) <HelperText     on:SMUI:select:helper-text:id={(event) => (helperId = event.detail)}     on:SMUI:select:helper-text:mount={(event) => (helperText = event.detail)}     on:SMUI:select:helper-text:unmount={() => {       helperId = undefined;       helperText = undefined;     }}     {...prefixFilter($$restProps, 'helperText$')}     >
    function create_default_slot$5(ctx) {
    	let current;
    	const helperText_slot_template = /*#slots*/ ctx[61].helperText;
    	const helperText_slot = create_slot(helperText_slot_template, ctx, /*$$scope*/ ctx[87], get_helperText_slot_context);

    	const block = {
    		c: function create() {
    			if (helperText_slot) helperText_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (helperText_slot) {
    				helperText_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (helperText_slot) {
    				if (helperText_slot.p && (!current || dirty[2] & /*$$scope*/ 33554432)) {
    					update_slot(helperText_slot, helperText_slot_template, ctx, /*$$scope*/ ctx[87], dirty, get_helperText_slot_changes, get_helperText_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(helperText_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(helperText_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (helperText_slot) helperText_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(205:2) <HelperText     on:SMUI:select:helper-text:id={(event) => (helperId = event.detail)}     on:SMUI:select:helper-text:mount={(event) => (helperText = event.detail)}     on:SMUI:select:helper-text:unmount={() => {       helperId = undefined;       helperText = undefined;     }}     {...prefixFilter($$restProps, 'helperText$')}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let span1;
    	let span0;
    	let t5;
    	let span0_id_value;
    	let span0_class_value;
    	let span0_aria_labelledby_value;
    	let useActions_action;
    	let span1_class_value;
    	let useActions_action_1;
    	let t6;
    	let span2;
    	let svg;
    	let polygon0;
    	let polygon1;
    	let span2_class_value;
    	let useActions_action_2;
    	let t7;
    	let div0_class_value;
    	let div0_aria_required_value;
    	let div0_aria_disabled_value;
    	let useActions_action_3;
    	let t8;
    	let menu;
    	let updating_open;
    	let div1_class_value;
    	let div1_style_value;
    	let Ripple_action;
    	let useActions_action_4;
    	let t9;
    	let if_block5_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*hiddenInput*/ ctx[12] && create_if_block_6(ctx);
    	let if_block1 = /*variant*/ ctx[7] === "filled" && create_if_block_5(ctx);
    	let if_block2 = /*variant*/ ctx[7] !== "outlined" && !/*noLabel*/ ctx[8] && (/*label*/ ctx[9] != null || /*$$slots*/ ctx[52].label) && create_if_block_4(ctx);
    	let if_block3 = /*variant*/ ctx[7] === "outlined" && create_if_block_2(ctx);
    	const leadingIcon_slot_template = /*#slots*/ ctx[61].leadingIcon;
    	const leadingIcon_slot = create_slot(leadingIcon_slot_template, ctx, /*$$scope*/ ctx[87], get_leadingIcon_slot_context);

    	let span0_levels = [
    		{
    			id: span0_id_value = /*inputId*/ ctx[11] + "-smui-selected-text"
    		},
    		{
    			class: span0_class_value = classMap({
    				[/*selectedText$class*/ ctx[18]]: true,
    				"mdc-select__selected-text": true
    			})
    		},
    		{ role: "button" },
    		{ "aria-haspopup": "listbox" },
    		{
    			"aria-labelledby": span0_aria_labelledby_value = /*inputId*/ ctx[11] + "-smui-label"
    		},
    		prefixFilter(/*$$restProps*/ ctx[53], "selectedText$")
    	];

    	let span0_data = {};

    	for (let i = 0; i < span0_levels.length; i += 1) {
    		span0_data = assign(span0_data, span0_levels[i]);
    	}

    	let span1_levels = [
    		{
    			class: span1_class_value = classMap({
    				[/*selectedTextContainer$class*/ ctx[16]]: true,
    				"mdc-select__selected-text-container": true
    			})
    		},
    		prefixFilter(/*$$restProps*/ ctx[53], "selectedTextContainer$")
    	];

    	let span1_data = {};

    	for (let i = 0; i < span1_levels.length; i += 1) {
    		span1_data = assign(span1_data, span1_levels[i]);
    	}

    	let span2_levels = [
    		{
    			class: span2_class_value = classMap({
    				[/*dropdownIcon$class*/ ctx[20]]: true,
    				"mdc-select__dropdown-icon": true
    			})
    		},
    		prefixFilter(/*$$restProps*/ ctx[53], "dropdownIcon$")
    	];

    	let span2_data = {};

    	for (let i = 0; i < span2_levels.length; i += 1) {
    		span2_data = assign(span2_data, span2_levels[i]);
    	}

    	let if_block4 = /*variant*/ ctx[7] !== "outlined" && /*ripple*/ ctx[5] && create_if_block_1$1(ctx);

    	let div0_levels = [
    		{
    			class: div0_class_value = classMap({
    				[/*anchor$class*/ ctx[14]]: true,
    				"mdc-select__anchor": true
    			})
    		},
    		{
    			"aria-required": div0_aria_required_value = /*required*/ ctx[10] ? "true" : null
    		},
    		{
    			"aria-disabled": div0_aria_disabled_value = /*disabled*/ ctx[6] ? "true" : null
    		},
    		{ "aria-controls": /*helperId*/ ctx[31] },
    		{ "aria-describedby": /*helperId*/ ctx[31] },
    		/*selectAnchorAttrs*/ ctx[29],
    		prefixFilter(/*$$restProps*/ ctx[53], "anchor$")
    	];

    	let div0_data = {};

    	for (let i = 0; i < div0_levels.length; i += 1) {
    		div0_data = assign(div0_data, div0_levels[i]);
    	}

    	const menu_spread_levels = [
    		{
    			class: classMap({
    				[/*menu$class*/ ctx[21]]: true,
    				"mdc-select__menu": true,
    				.../*menuClasses*/ ctx[33]
    			})
    		},
    		{ fullWidth: true },
    		{ anchor: false },
    		{ anchorElement: /*anchorElement*/ ctx[34] },
    		{ anchorCorner: /*anchorCorner*/ ctx[35] },
    		prefixFilter(/*$$restProps*/ ctx[53], "menu$")
    	];

    	function menu_open_binding(value) {
    		/*menu_open_binding*/ ctx[76](value);
    	}

    	let menu_props = {
    		$$slots: { default: [create_default_slot_1$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < menu_spread_levels.length; i += 1) {
    		menu_props = assign(menu_props, menu_spread_levels[i]);
    	}

    	if (/*menuOpen*/ ctx[32] !== void 0) {
    		menu_props.open = /*menuOpen*/ ctx[32];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, "open", menu_open_binding));
    	menu.$on("MDCMenu:selected", /*MDCMenu_selected_handler*/ ctx[77]);
    	menu.$on("MDCMenuSurface:closing", /*MDCMenuSurface_closing_handler*/ ctx[78]);
    	menu.$on("MDCMenuSurface:closed", /*MDCMenuSurface_closed_handler*/ ctx[79]);
    	menu.$on("MDCMenuSurface:opened", /*MDCMenuSurface_opened_handler*/ ctx[80]);

    	let div1_levels = [
    		{
    			class: div1_class_value = classMap({
    				[/*className*/ ctx[3]]: true,
    				"mdc-select": true,
    				"mdc-select--required": /*required*/ ctx[10],
    				"mdc-select--disabled": /*disabled*/ ctx[6],
    				"mdc-select--filled": /*variant*/ ctx[7] === "filled",
    				"mdc-select--outlined": /*variant*/ ctx[7] === "outlined",
    				"smui-select--standard": /*variant*/ ctx[7] === "standard",
    				"mdc-select--with-leading-icon": /*withLeadingIcon*/ ctx[22] === /*uninitializedValue*/ ctx[45]
    				? /*$$slots*/ ctx[52].leadingIcon
    				: /*withLeadingIcon*/ ctx[22],
    				"mdc-select--no-label": /*noLabel*/ ctx[8] || /*label*/ ctx[9] == null && !/*$$slots*/ ctx[52].label,
    				"mdc-select--invalid": /*invalid*/ ctx[1] !== /*uninitializedValue*/ ctx[45] && /*invalid*/ ctx[1],
    				"mdc-select--activated": /*menuOpen*/ ctx[32],
    				"mdc-data-table__pagination-rows-per-page-select": /*context*/ ctx[46] === "data-table:pagination",
    				.../*internalClasses*/ ctx[26]
    			})
    		},
    		{
    			style: div1_style_value = Object.entries(/*internalStyles*/ ctx[27]).map(func$4).concat([/*style*/ ctx[4]]).join(" ")
    		},
    		exclude(/*$$restProps*/ ctx[53], [
    			"input$",
    			"anchor$",
    			"label$",
    			"outline$",
    			"selectedTextContainer$",
    			"selectedText$",
    			"dropdownIcon$",
    			"ripple$",
    			"menu$",
    			"list$",
    			"helperText$"
    		])
    	];

    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	let if_block5 = /*$$slots*/ ctx[52].helperText && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (leadingIcon_slot) leadingIcon_slot.c();
    			t4 = space();
    			span1 = element("span");
    			span0 = element("span");
    			t5 = text(/*$selectedTextStore*/ ctx[43]);
    			t6 = space();
    			span2 = element("span");
    			svg = svg_element("svg");
    			polygon0 = svg_element("polygon");
    			polygon1 = svg_element("polygon");
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			create_component(menu.$$.fragment);
    			t9 = space();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    			set_attributes(span0, span0_data);
    			add_location(span0, file$7, 125, 6, 3794);
    			set_attributes(span1, span1_data);
    			add_location(span1, file$7, 117, 4, 3532);
    			attr_dev(polygon0, "class", "mdc-select__dropdown-icon-inactive");
    			attr_dev(polygon0, "stroke", "none");
    			attr_dev(polygon0, "fill-rule", "evenodd");
    			attr_dev(polygon0, "points", "7 10 12 15 17 10");
    			add_location(polygon0, file$7, 154, 8, 4616);
    			attr_dev(polygon1, "class", "mdc-select__dropdown-icon-active");
    			attr_dev(polygon1, "stroke", "none");
    			attr_dev(polygon1, "fill-rule", "evenodd");
    			attr_dev(polygon1, "points", "7 15 12 10 17 15");
    			add_location(polygon1, file$7, 160, 8, 4787);
    			attr_dev(svg, "class", "mdc-select__dropdown-icon-graphic");
    			attr_dev(svg, "viewBox", "7 10 10 5");
    			attr_dev(svg, "focusable", "false");
    			add_location(svg, file$7, 149, 6, 4491);
    			set_attributes(span2, span2_data);
    			add_location(span2, file$7, 141, 4, 4266);
    			set_attributes(div0, div0_data);
    			add_location(div0, file$7, 60, 2, 1647);
    			set_attributes(div1, div1_data);
    			add_location(div1, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t2);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t3);

    			if (leadingIcon_slot) {
    				leadingIcon_slot.m(div0, null);
    			}

    			append_dev(div0, t4);
    			append_dev(div0, span1);
    			append_dev(span1, span0);
    			append_dev(span0, t5);
    			/*span0_binding*/ ctx[67](span0);
    			append_dev(div0, t6);
    			append_dev(div0, span2);
    			append_dev(span2, svg);
    			append_dev(svg, polygon0);
    			append_dev(svg, polygon1);
    			append_dev(div0, t7);
    			if (if_block4) if_block4.m(div0, null);
    			/*div0_binding*/ ctx[69](div0);
    			append_dev(div1, t8);
    			mount_component(menu, div1, null);
    			/*div1_binding*/ ctx[81](div1);
    			insert_dev(target, t9, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, if_block5_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span0, /*selectedText$use*/ ctx[17])),
    					action_destroyer(useActions_action_1 = useActions.call(null, span1, /*selectedTextContainer$use*/ ctx[15])),
    					action_destroyer(useActions_action_2 = useActions.call(null, span2, /*dropdownIcon$use*/ ctx[19])),
    					action_destroyer(useActions_action_3 = useActions.call(null, div0, /*anchor$use*/ ctx[13])),
    					listen_dev(div0, "focus", /*focus_handler_1*/ ctx[70], false, false, false),
    					listen_dev(div0, "blur", /*blur_handler_1*/ ctx[71], false, false, false),
    					listen_dev(div0, "click", /*click_handler*/ ctx[72], false, false, false),
    					listen_dev(div0, "keydown", /*keydown_handler*/ ctx[73], false, false, false),
    					listen_dev(div0, "focus", /*focus_handler*/ ctx[62], false, false, false),
    					listen_dev(div0, "blur", /*blur_handler*/ ctx[63], false, false, false),
    					action_destroyer(Ripple_action = Ripple.call(null, div1, {
    						ripple: /*variant*/ ctx[7] === "filled",
    						unbounded: false,
    						addClass: /*addClass*/ ctx[49],
    						removeClass: /*removeClass*/ ctx[50],
    						addStyle: /*addStyle*/ ctx[51]
    					})),
    					action_destroyer(Anchor.call(null, div1, {
    						addClass: /*addClass*/ ctx[49],
    						removeClass: /*removeClass*/ ctx[50]
    					})),
    					action_destroyer(useActions_action_4 = useActions.call(null, div1, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[44].call(null, div1)),
    					listen_dev(div1, "SMUI:select:leading-icon:mount", /*SMUI_select_leading_icon_mount_handler*/ ctx[82], false, false, false),
    					listen_dev(div1, "SMUI:select:leading-icon:unmount", /*SMUI_select_leading_icon_unmount_handler*/ ctx[83], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hiddenInput*/ ctx[12]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*variant*/ ctx[7] === "filled") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*variant*/ ctx[7] !== "outlined" && !/*noLabel*/ ctx[8] && (/*label*/ ctx[9] != null || /*$$slots*/ ctx[52].label)) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*variant, noLabel, label*/ 896 | dirty[1] & /*$$slots*/ 2097152) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*variant*/ ctx[7] === "outlined") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*variant*/ 128) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div0, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (leadingIcon_slot) {
    				if (leadingIcon_slot.p && (!current || dirty[2] & /*$$scope*/ 33554432)) {
    					update_slot(leadingIcon_slot, leadingIcon_slot_template, ctx, /*$$scope*/ ctx[87], dirty, get_leadingIcon_slot_changes, get_leadingIcon_slot_context);
    				}
    			}

    			if (!current || dirty[1] & /*$selectedTextStore*/ 4096) set_data_dev(t5, /*$selectedTextStore*/ ctx[43]);

    			set_attributes(span0, span0_data = get_spread_update(span0_levels, [
    				(!current || dirty[0] & /*inputId*/ 2048 && span0_id_value !== (span0_id_value = /*inputId*/ ctx[11] + "-smui-selected-text")) && { id: span0_id_value },
    				(!current || dirty[0] & /*selectedText$class*/ 262144 && span0_class_value !== (span0_class_value = classMap({
    					[/*selectedText$class*/ ctx[18]]: true,
    					"mdc-select__selected-text": true
    				}))) && { class: span0_class_value },
    				{ role: "button" },
    				{ "aria-haspopup": "listbox" },
    				(!current || dirty[0] & /*inputId*/ 2048 && span0_aria_labelledby_value !== (span0_aria_labelledby_value = /*inputId*/ ctx[11] + "-smui-label")) && {
    					"aria-labelledby": span0_aria_labelledby_value
    				},
    				dirty[1] & /*$$restProps*/ 4194304 && prefixFilter(/*$$restProps*/ ctx[53], "selectedText$")
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*selectedText$use*/ 131072) useActions_action.update.call(null, /*selectedText$use*/ ctx[17]);

    			set_attributes(span1, span1_data = get_spread_update(span1_levels, [
    				(!current || dirty[0] & /*selectedTextContainer$class*/ 65536 && span1_class_value !== (span1_class_value = classMap({
    					[/*selectedTextContainer$class*/ ctx[16]]: true,
    					"mdc-select__selected-text-container": true
    				}))) && { class: span1_class_value },
    				dirty[1] & /*$$restProps*/ 4194304 && prefixFilter(/*$$restProps*/ ctx[53], "selectedTextContainer$")
    			]));

    			if (useActions_action_1 && is_function(useActions_action_1.update) && dirty[0] & /*selectedTextContainer$use*/ 32768) useActions_action_1.update.call(null, /*selectedTextContainer$use*/ ctx[15]);

    			set_attributes(span2, span2_data = get_spread_update(span2_levels, [
    				(!current || dirty[0] & /*dropdownIcon$class*/ 1048576 && span2_class_value !== (span2_class_value = classMap({
    					[/*dropdownIcon$class*/ ctx[20]]: true,
    					"mdc-select__dropdown-icon": true
    				}))) && { class: span2_class_value },
    				dirty[1] & /*$$restProps*/ 4194304 && prefixFilter(/*$$restProps*/ ctx[53], "dropdownIcon$")
    			]));

    			if (useActions_action_2 && is_function(useActions_action_2.update) && dirty[0] & /*dropdownIcon$use*/ 524288) useActions_action_2.update.call(null, /*dropdownIcon$use*/ ctx[19]);

    			if (/*variant*/ ctx[7] !== "outlined" && /*ripple*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*variant, ripple*/ 160) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_1$1(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div0, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			set_attributes(div0, div0_data = get_spread_update(div0_levels, [
    				(!current || dirty[0] & /*anchor$class*/ 16384 && div0_class_value !== (div0_class_value = classMap({
    					[/*anchor$class*/ ctx[14]]: true,
    					"mdc-select__anchor": true
    				}))) && { class: div0_class_value },
    				(!current || dirty[0] & /*required*/ 1024 && div0_aria_required_value !== (div0_aria_required_value = /*required*/ ctx[10] ? "true" : null)) && {
    					"aria-required": div0_aria_required_value
    				},
    				(!current || dirty[0] & /*disabled*/ 64 && div0_aria_disabled_value !== (div0_aria_disabled_value = /*disabled*/ ctx[6] ? "true" : null)) && {
    					"aria-disabled": div0_aria_disabled_value
    				},
    				(!current || dirty[1] & /*helperId*/ 1) && { "aria-controls": /*helperId*/ ctx[31] },
    				(!current || dirty[1] & /*helperId*/ 1) && { "aria-describedby": /*helperId*/ ctx[31] },
    				dirty[0] & /*selectAnchorAttrs*/ 536870912 && /*selectAnchorAttrs*/ ctx[29],
    				dirty[1] & /*$$restProps*/ 4194304 && prefixFilter(/*$$restProps*/ ctx[53], "anchor$")
    			]));

    			if (useActions_action_3 && is_function(useActions_action_3.update) && dirty[0] & /*anchor$use*/ 8192) useActions_action_3.update.call(null, /*anchor$use*/ ctx[13]);

    			const menu_changes = (dirty[0] & /*menu$class*/ 2097152 | dirty[1] & /*menuClasses, anchorElement, anchorCorner, $$restProps*/ 4194332)
    			? get_spread_update(menu_spread_levels, [
    					dirty[0] & /*menu$class*/ 2097152 | dirty[1] & /*menuClasses*/ 4 && {
    						class: classMap({
    							[/*menu$class*/ ctx[21]]: true,
    							"mdc-select__menu": true,
    							.../*menuClasses*/ ctx[33]
    						})
    					},
    					menu_spread_levels[1],
    					menu_spread_levels[2],
    					dirty[1] & /*anchorElement*/ 8 && { anchorElement: /*anchorElement*/ ctx[34] },
    					dirty[1] & /*anchorCorner*/ 16 && { anchorCorner: /*anchorCorner*/ ctx[35] },
    					dirty[1] & /*$$restProps*/ 4194304 && get_spread_object(prefixFilter(/*$$restProps*/ ctx[53], "menu$"))
    				])
    			: {};

    			if (dirty[0] & /*selectedIndex*/ 16777216 | dirty[1] & /*wrapFocus, $$restProps, list*/ 4194400 | dirty[2] & /*$$scope*/ 33554432) {
    				menu_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty[1] & /*menuOpen*/ 2) {
    				updating_open = true;
    				menu_changes.open = /*menuOpen*/ ctx[32];
    				add_flush_callback(() => updating_open = false);
    			}

    			menu.$set(menu_changes);

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [
    				(!current || dirty[0] & /*className, required, disabled, variant, withLeadingIcon, noLabel, label, invalid, internalClasses*/ 71305162 | dirty[1] & /*$$slots, menuOpen*/ 2097154 && div1_class_value !== (div1_class_value = classMap({
    					[/*className*/ ctx[3]]: true,
    					"mdc-select": true,
    					"mdc-select--required": /*required*/ ctx[10],
    					"mdc-select--disabled": /*disabled*/ ctx[6],
    					"mdc-select--filled": /*variant*/ ctx[7] === "filled",
    					"mdc-select--outlined": /*variant*/ ctx[7] === "outlined",
    					"smui-select--standard": /*variant*/ ctx[7] === "standard",
    					"mdc-select--with-leading-icon": /*withLeadingIcon*/ ctx[22] === /*uninitializedValue*/ ctx[45]
    					? /*$$slots*/ ctx[52].leadingIcon
    					: /*withLeadingIcon*/ ctx[22],
    					"mdc-select--no-label": /*noLabel*/ ctx[8] || /*label*/ ctx[9] == null && !/*$$slots*/ ctx[52].label,
    					"mdc-select--invalid": /*invalid*/ ctx[1] !== /*uninitializedValue*/ ctx[45] && /*invalid*/ ctx[1],
    					"mdc-select--activated": /*menuOpen*/ ctx[32],
    					"mdc-data-table__pagination-rows-per-page-select": /*context*/ ctx[46] === "data-table:pagination",
    					.../*internalClasses*/ ctx[26]
    				}))) && { class: div1_class_value },
    				(!current || dirty[0] & /*internalStyles, style*/ 134217744 && div1_style_value !== (div1_style_value = Object.entries(/*internalStyles*/ ctx[27]).map(func$4).concat([/*style*/ ctx[4]]).join(" "))) && { style: div1_style_value },
    				dirty[1] & /*$$restProps*/ 4194304 && exclude(/*$$restProps*/ ctx[53], [
    					"input$",
    					"anchor$",
    					"label$",
    					"outline$",
    					"selectedTextContainer$",
    					"selectedText$",
    					"dropdownIcon$",
    					"ripple$",
    					"menu$",
    					"list$",
    					"helperText$"
    				])
    			]));

    			if (Ripple_action && is_function(Ripple_action.update) && dirty[0] & /*variant*/ 128) Ripple_action.update.call(null, {
    				ripple: /*variant*/ ctx[7] === "filled",
    				unbounded: false,
    				addClass: /*addClass*/ ctx[49],
    				removeClass: /*removeClass*/ ctx[50],
    				addStyle: /*addStyle*/ ctx[51]
    			});

    			if (useActions_action_4 && is_function(useActions_action_4.update) && dirty[0] & /*use*/ 4) useActions_action_4.update.call(null, /*use*/ ctx[2]);

    			if (/*$$slots*/ ctx[52].helperText) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[1] & /*$$slots*/ 2097152) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block$2(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(leadingIcon_slot, local);
    			transition_in(if_block4);
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block5);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(leadingIcon_slot, local);
    			transition_out(if_block4);
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block5);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (leadingIcon_slot) leadingIcon_slot.d(detaching);
    			/*span0_binding*/ ctx[67](null);
    			if (if_block4) if_block4.d();
    			/*div0_binding*/ ctx[69](null);
    			destroy_component(menu);
    			/*div1_binding*/ ctx[81](null);
    			if (detaching) detach_dev(t9);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(if_block5_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let counter$1 = 0;

    function getNormalizedXCoordinate(evt) {
    	const targetClientRect = evt.target.getBoundingClientRect();
    	const xCoordinate = isTouchEvent(evt) ? evt.touches[0].clientX : evt.clientX;
    	return xCoordinate - targetClientRect.left;
    }

    function isTouchEvent(evt) {
    	return !!evt.touches;
    }

    const func$4 = ([name, value]) => `${name}: ${value};`;

    function instance_1$4($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","ripple","disabled","variant","noLabel","label","value","key","dirty","invalid","updateInvalid","required","inputId","hiddenInput","anchor$use","anchor$class","selectedTextContainer$use","selectedTextContainer$class","selectedText$use","selectedText$class","dropdownIcon$use","dropdownIcon$class","menu$class","withLeadingIcon","focus","layout","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $valueStore;
    	let $selectedTextStore;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, ['label','leadingIcon','default','helperText']);
    	const $$slots = compute_slots(slots);
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	const uninitializedValue = () => {
    		
    	};

    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { style = "" } = $$props;
    	let { ripple = true } = $$props;
    	let { disabled = false } = $$props;
    	let { variant = "standard" } = $$props;
    	let { noLabel = false } = $$props;
    	let { label = null } = $$props;
    	let { value = "" } = $$props;
    	let { key = item => item } = $$props;
    	let { dirty = false } = $$props;
    	let { invalid = uninitializedValue } = $$props;
    	let { updateInvalid = invalid === uninitializedValue } = $$props;
    	let { required = false } = $$props;
    	let { inputId = "SMUI-select-" + counter$1++ } = $$props;
    	let { hiddenInput = false } = $$props;
    	let { anchor$use = [] } = $$props;
    	let { anchor$class = "" } = $$props;
    	let { selectedTextContainer$use = [] } = $$props;
    	let { selectedTextContainer$class = "" } = $$props;
    	let { selectedText$use = [] } = $$props;
    	let { selectedText$class = "" } = $$props;
    	let { dropdownIcon$use = [] } = $$props;
    	let { dropdownIcon$class = "" } = $$props;
    	let { menu$class = "" } = $$props;
    	let { withLeadingIcon = uninitializedValue } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let selectAnchor;
    	let selectAnchorAttrs = {};
    	let selectText;
    	let selectedIndex = -1;
    	let helperId;
    	let addLayoutListener = getContext("SMUI:addLayoutListener");
    	let removeLayoutListener;
    	let menuOpen = false;
    	let menuClasses = {};
    	let anchorElement;
    	let anchorCorner;
    	let wrapFocus = false;
    	let list;
    	let context = getContext("SMUI:select:context");

    	// These are instances, not accessors.
    	let leadingIcon;

    	let helperText;

    	// Components
    	let floatingLabel;

    	let lineRipple;
    	let notchedOutline;
    	setContext("SMUI:list:role", "");
    	setContext("SMUI:list:nav", false);

    	// Only needed on initialization.
    	const selectedTextStore = writable("");

    	validate_store(selectedTextStore, "selectedTextStore");
    	component_subscribe($$self, selectedTextStore, value => $$invalidate(43, $selectedTextStore = value));
    	setContext("SMUI:select:selectedText", selectedTextStore);
    	const valueStore = writable(value);
    	validate_store(valueStore, "valueStore");
    	component_subscribe($$self, valueStore, value => $$invalidate(89, $valueStore = value));
    	setContext("SMUI:select:value", valueStore);
    	let previousSelectedIndex = selectedIndex;

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(() => {
    		$$invalidate(23, instance = new MDCSelectFoundation({
    				// getSelectAdapterMethods
    				getMenuItemAttr: (menuItem, attr) => menuItem.getAttribute(attr),
    				setSelectedText: text => {
    					set_store_value(selectedTextStore, $selectedTextStore = text, $selectedTextStore);
    				},
    				isSelectAnchorFocused: () => document.activeElement === selectAnchor,
    				getSelectAnchorAttr,
    				setSelectAnchorAttr: addSelectAnchorAttr,
    				removeSelectAnchorAttr,
    				addMenuClass,
    				removeMenuClass,
    				openMenu: () => {
    					$$invalidate(32, menuOpen = true);
    				},
    				closeMenu: () => {
    					$$invalidate(32, menuOpen = false);
    				},
    				getAnchorElement: () => selectAnchor,
    				setMenuAnchorElement: value => {
    					$$invalidate(34, anchorElement = value);
    				},
    				setMenuAnchorCorner: value => {
    					$$invalidate(35, anchorCorner = value);
    				},
    				setMenuWrapFocus: value => {
    					$$invalidate(36, wrapFocus = value);
    				},
    				getSelectedIndex: () => selectedIndex,
    				setSelectedIndex: index => {
    					// Don't update the instance again.
    					$$invalidate(60, previousSelectedIndex = index);

    					$$invalidate(24, selectedIndex = index);
    					$$invalidate(0, value = getMenuItemValues()[selectedIndex]);
    				},
    				focusMenuItemAtIndex: index => {
    					list.focusItemAtIndex(index);
    				},
    				getMenuItemCount: () => list.items.length,
    				getMenuItemValues: () => getMenuItemValues().map(key),
    				getMenuItemTextAtIndex: index => list.getPrimaryTextAtIndex(index),
    				isTypeaheadInProgress: () => list.typeaheadInProgress,
    				typeaheadMatchItem: (nextChar, startingIndex) => list.typeaheadMatchItem(nextChar, startingIndex),
    				// getCommonAdapterMethods
    				addClass,
    				removeClass,
    				hasClass,
    				setRippleCenter: normalizedX => lineRipple && lineRipple.setRippleCenter(normalizedX),
    				activateBottomLine: () => lineRipple && lineRipple.activate(),
    				deactivateBottomLine: () => lineRipple && lineRipple.deactivate(),
    				notifyChange: _selectedValue => {
    					$$invalidate(54, dirty = true);

    					if (updateInvalid) {
    						$$invalidate(1, invalid = !instance.isValid());
    					}

    					dispatch(getElement(), "MDCSelect:change", { value, index: selectedIndex });
    				},
    				// getOutlineAdapterMethods
    				hasOutline: () => !!notchedOutline,
    				notchOutline: labelWidth => notchedOutline && notchedOutline.notch(labelWidth),
    				closeOutline: () => notchedOutline && notchedOutline.closeNotch(),
    				// getLabelAdapterMethods
    				hasLabel: () => !!floatingLabel,
    				floatLabel: shouldFloat => floatingLabel && floatingLabel.float(shouldFloat),
    				getLabelWidth: () => floatingLabel ? floatingLabel.getWidth() : 0,
    				setLabelRequired: isRequired => floatingLabel && floatingLabel.setRequired(isRequired)
    			},
    		{
    				get helperText() {
    					return helperText;
    				},
    				get leadingIcon() {
    					return leadingIcon;
    				}
    			}));

    		$$invalidate(24, selectedIndex = getMenuItemValues().indexOf(value));
    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	onDestroy(() => {
    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(26, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(26, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete internalStyles[name];
    				$$invalidate(27, internalStyles);
    			} else {
    				$$invalidate(27, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function addMenuClass(className) {
    		if (!menuClasses[className]) {
    			$$invalidate(33, menuClasses[className] = true, menuClasses);
    		}
    	}

    	function removeMenuClass(className) {
    		if (!(className in menuClasses) || menuClasses[className]) {
    			$$invalidate(33, menuClasses[className] = false, menuClasses);
    		}
    	}

    	function getSelectAnchorAttr(name) {
    		return name in selectAnchorAttrs
    		? selectAnchorAttrs[name]
    		: getElement().getAttribute(name);
    	}

    	function addSelectAnchorAttr(name, value) {
    		if (selectAnchorAttrs[name] !== value) {
    			$$invalidate(29, selectAnchorAttrs[name] = value, selectAnchorAttrs);
    		}
    	}

    	function removeSelectAnchorAttr(name) {
    		if (!(name in selectAnchorAttrs) || selectAnchorAttrs[name] != null) {
    			$$invalidate(29, selectAnchorAttrs[name] = undefined, selectAnchorAttrs);
    		}
    	}

    	function getMenuItemValues() {
    		return list.getOrderedList().map(accessor => accessor.getValue());
    	}

    	function focus() {
    		selectAnchor.focus();
    	}

    	function layout() {
    		instance.layout();
    	}

    	function getElement() {
    		return element;
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function floatinglabel_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			floatingLabel = $$value;
    			$$invalidate(40, floatingLabel);
    		});
    	}

    	function floatinglabel_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			floatingLabel = $$value;
    			$$invalidate(40, floatingLabel);
    		});
    	}

    	function notchedoutline_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			notchedOutline = $$value;
    			$$invalidate(42, notchedOutline);
    		});
    	}

    	function span0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			selectText = $$value;
    			$$invalidate(30, selectText);
    		});
    	}

    	function lineripple_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			lineRipple = $$value;
    			$$invalidate(41, lineRipple);
    		});
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			selectAnchor = $$value;
    			$$invalidate(28, selectAnchor);
    		});
    	}

    	const focus_handler_1 = () => instance && instance.handleFocus();
    	const blur_handler_1 = () => instance && instance.handleBlur();

    	const click_handler = event => {
    		selectAnchor.focus();

    		if (instance) {
    			instance.handleClick(getNormalizedXCoordinate(event));
    		}
    	};

    	const keydown_handler = event => instance && instance.handleKeydown(event);

    	function list_1_selectedIndex_binding(value) {
    		selectedIndex = value;
    		$$invalidate(24, selectedIndex);
    	}

    	const SMUI_list_mount_handler = event => $$invalidate(37, list = event.detail);

    	function menu_open_binding(value) {
    		menuOpen = value;
    		$$invalidate(32, menuOpen);
    	}

    	const MDCMenu_selected_handler = event => instance && instance.handleMenuItemAction(event.detail.index);
    	const MDCMenuSurface_closing_handler = () => instance && instance.handleMenuClosing();
    	const MDCMenuSurface_closed_handler = () => instance && instance.handleMenuClosed();
    	const MDCMenuSurface_opened_handler = () => instance && instance.handleMenuOpened();

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(25, element);
    		});
    	}

    	const SMUI_select_leading_icon_mount_handler = event => $$invalidate(38, leadingIcon = event.detail);
    	const SMUI_select_leading_icon_unmount_handler = () => $$invalidate(38, leadingIcon = undefined);
    	const SMUI_select_helper_text_id_handler = event => $$invalidate(31, helperId = event.detail);
    	const SMUI_select_helper_text_mount_handler = event => $$invalidate(39, helperText = event.detail);

    	const SMUI_select_helper_text_unmount_handler = () => {
    		$$invalidate(31, helperId = undefined);
    		$$invalidate(39, helperText = undefined);
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(53, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(2, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(4, style = $$new_props.style);
    		if ("ripple" in $$new_props) $$invalidate(5, ripple = $$new_props.ripple);
    		if ("disabled" in $$new_props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ("variant" in $$new_props) $$invalidate(7, variant = $$new_props.variant);
    		if ("noLabel" in $$new_props) $$invalidate(8, noLabel = $$new_props.noLabel);
    		if ("label" in $$new_props) $$invalidate(9, label = $$new_props.label);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("key" in $$new_props) $$invalidate(55, key = $$new_props.key);
    		if ("dirty" in $$new_props) $$invalidate(54, dirty = $$new_props.dirty);
    		if ("invalid" in $$new_props) $$invalidate(1, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$new_props) $$invalidate(56, updateInvalid = $$new_props.updateInvalid);
    		if ("required" in $$new_props) $$invalidate(10, required = $$new_props.required);
    		if ("inputId" in $$new_props) $$invalidate(11, inputId = $$new_props.inputId);
    		if ("hiddenInput" in $$new_props) $$invalidate(12, hiddenInput = $$new_props.hiddenInput);
    		if ("anchor$use" in $$new_props) $$invalidate(13, anchor$use = $$new_props.anchor$use);
    		if ("anchor$class" in $$new_props) $$invalidate(14, anchor$class = $$new_props.anchor$class);
    		if ("selectedTextContainer$use" in $$new_props) $$invalidate(15, selectedTextContainer$use = $$new_props.selectedTextContainer$use);
    		if ("selectedTextContainer$class" in $$new_props) $$invalidate(16, selectedTextContainer$class = $$new_props.selectedTextContainer$class);
    		if ("selectedText$use" in $$new_props) $$invalidate(17, selectedText$use = $$new_props.selectedText$use);
    		if ("selectedText$class" in $$new_props) $$invalidate(18, selectedText$class = $$new_props.selectedText$class);
    		if ("dropdownIcon$use" in $$new_props) $$invalidate(19, dropdownIcon$use = $$new_props.dropdownIcon$use);
    		if ("dropdownIcon$class" in $$new_props) $$invalidate(20, dropdownIcon$class = $$new_props.dropdownIcon$class);
    		if ("menu$class" in $$new_props) $$invalidate(21, menu$class = $$new_props.menu$class);
    		if ("withLeadingIcon" in $$new_props) $$invalidate(22, withLeadingIcon = $$new_props.withLeadingIcon);
    		if ("$$scope" in $$new_props) $$invalidate(87, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		counter: counter$1,
    		MDCSelectFoundation,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		writable,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		exclude,
    		prefixFilter,
    		useActions,
    		dispatch,
    		Ripple,
    		Anchor,
    		Menu,
    		List,
    		FloatingLabel,
    		LineRipple,
    		NotchedOutline,
    		HelperText,
    		forwardEvents,
    		uninitializedValue,
    		use,
    		className,
    		style,
    		ripple,
    		disabled,
    		variant,
    		noLabel,
    		label,
    		value,
    		key,
    		dirty,
    		invalid,
    		updateInvalid,
    		required,
    		inputId,
    		hiddenInput,
    		anchor$use,
    		anchor$class,
    		selectedTextContainer$use,
    		selectedTextContainer$class,
    		selectedText$use,
    		selectedText$class,
    		dropdownIcon$use,
    		dropdownIcon$class,
    		menu$class,
    		withLeadingIcon,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		selectAnchor,
    		selectAnchorAttrs,
    		selectText,
    		selectedIndex,
    		helperId,
    		addLayoutListener,
    		removeLayoutListener,
    		menuOpen,
    		menuClasses,
    		anchorElement,
    		anchorCorner,
    		wrapFocus,
    		list,
    		context,
    		leadingIcon,
    		helperText,
    		floatingLabel,
    		lineRipple,
    		notchedOutline,
    		selectedTextStore,
    		valueStore,
    		previousSelectedIndex,
    		hasClass,
    		addClass,
    		removeClass,
    		addStyle,
    		addMenuClass,
    		removeMenuClass,
    		getSelectAnchorAttr,
    		addSelectAnchorAttr,
    		removeSelectAnchorAttr,
    		getMenuItemValues,
    		getNormalizedXCoordinate,
    		isTouchEvent,
    		focus,
    		layout,
    		getElement,
    		$valueStore,
    		$selectedTextStore
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(2, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("style" in $$props) $$invalidate(4, style = $$new_props.style);
    		if ("ripple" in $$props) $$invalidate(5, ripple = $$new_props.ripple);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ("variant" in $$props) $$invalidate(7, variant = $$new_props.variant);
    		if ("noLabel" in $$props) $$invalidate(8, noLabel = $$new_props.noLabel);
    		if ("label" in $$props) $$invalidate(9, label = $$new_props.label);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("key" in $$props) $$invalidate(55, key = $$new_props.key);
    		if ("dirty" in $$props) $$invalidate(54, dirty = $$new_props.dirty);
    		if ("invalid" in $$props) $$invalidate(1, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$props) $$invalidate(56, updateInvalid = $$new_props.updateInvalid);
    		if ("required" in $$props) $$invalidate(10, required = $$new_props.required);
    		if ("inputId" in $$props) $$invalidate(11, inputId = $$new_props.inputId);
    		if ("hiddenInput" in $$props) $$invalidate(12, hiddenInput = $$new_props.hiddenInput);
    		if ("anchor$use" in $$props) $$invalidate(13, anchor$use = $$new_props.anchor$use);
    		if ("anchor$class" in $$props) $$invalidate(14, anchor$class = $$new_props.anchor$class);
    		if ("selectedTextContainer$use" in $$props) $$invalidate(15, selectedTextContainer$use = $$new_props.selectedTextContainer$use);
    		if ("selectedTextContainer$class" in $$props) $$invalidate(16, selectedTextContainer$class = $$new_props.selectedTextContainer$class);
    		if ("selectedText$use" in $$props) $$invalidate(17, selectedText$use = $$new_props.selectedText$use);
    		if ("selectedText$class" in $$props) $$invalidate(18, selectedText$class = $$new_props.selectedText$class);
    		if ("dropdownIcon$use" in $$props) $$invalidate(19, dropdownIcon$use = $$new_props.dropdownIcon$use);
    		if ("dropdownIcon$class" in $$props) $$invalidate(20, dropdownIcon$class = $$new_props.dropdownIcon$class);
    		if ("menu$class" in $$props) $$invalidate(21, menu$class = $$new_props.menu$class);
    		if ("withLeadingIcon" in $$props) $$invalidate(22, withLeadingIcon = $$new_props.withLeadingIcon);
    		if ("element" in $$props) $$invalidate(25, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(23, instance = $$new_props.instance);
    		if ("internalClasses" in $$props) $$invalidate(26, internalClasses = $$new_props.internalClasses);
    		if ("internalStyles" in $$props) $$invalidate(27, internalStyles = $$new_props.internalStyles);
    		if ("selectAnchor" in $$props) $$invalidate(28, selectAnchor = $$new_props.selectAnchor);
    		if ("selectAnchorAttrs" in $$props) $$invalidate(29, selectAnchorAttrs = $$new_props.selectAnchorAttrs);
    		if ("selectText" in $$props) $$invalidate(30, selectText = $$new_props.selectText);
    		if ("selectedIndex" in $$props) $$invalidate(24, selectedIndex = $$new_props.selectedIndex);
    		if ("helperId" in $$props) $$invalidate(31, helperId = $$new_props.helperId);
    		if ("addLayoutListener" in $$props) addLayoutListener = $$new_props.addLayoutListener;
    		if ("removeLayoutListener" in $$props) removeLayoutListener = $$new_props.removeLayoutListener;
    		if ("menuOpen" in $$props) $$invalidate(32, menuOpen = $$new_props.menuOpen);
    		if ("menuClasses" in $$props) $$invalidate(33, menuClasses = $$new_props.menuClasses);
    		if ("anchorElement" in $$props) $$invalidate(34, anchorElement = $$new_props.anchorElement);
    		if ("anchorCorner" in $$props) $$invalidate(35, anchorCorner = $$new_props.anchorCorner);
    		if ("wrapFocus" in $$props) $$invalidate(36, wrapFocus = $$new_props.wrapFocus);
    		if ("list" in $$props) $$invalidate(37, list = $$new_props.list);
    		if ("context" in $$props) $$invalidate(46, context = $$new_props.context);
    		if ("leadingIcon" in $$props) $$invalidate(38, leadingIcon = $$new_props.leadingIcon);
    		if ("helperText" in $$props) $$invalidate(39, helperText = $$new_props.helperText);
    		if ("floatingLabel" in $$props) $$invalidate(40, floatingLabel = $$new_props.floatingLabel);
    		if ("lineRipple" in $$props) $$invalidate(41, lineRipple = $$new_props.lineRipple);
    		if ("notchedOutline" in $$props) $$invalidate(42, notchedOutline = $$new_props.notchedOutline);
    		if ("previousSelectedIndex" in $$props) $$invalidate(60, previousSelectedIndex = $$new_props.previousSelectedIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedIndex, instance, value*/ 25165825 | $$self.$$.dirty[1] & /*previousSelectedIndex*/ 536870912) {
    			if (previousSelectedIndex !== selectedIndex) {
    				$$invalidate(60, previousSelectedIndex = selectedIndex);

    				if (instance) {
    					instance.setSelectedIndex(
    						selectedIndex,
    						/* closeMenu */
    						false,
    						/* skipNotify */
    						true
    					);
    				} else {
    					const values = getMenuItemValues();

    					if (value !== values[selectedIndex]) {
    						$$invalidate(0, value = values[selectedIndex]);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			set_store_value(valueStore, $valueStore = value, $valueStore);
    		}

    		if ($$self.$$.dirty[0] & /*instance, value*/ 8388609 | $$self.$$.dirty[1] & /*key*/ 16777216) {
    			if (instance && instance.getValue() !== key(value)) {
    				instance.setValue(key(value));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, disabled*/ 8388672) {
    			if (instance && instance.getDisabled() !== disabled) {
    				instance.setDisabled(disabled);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, invalid*/ 8388610 | $$self.$$.dirty[1] & /*dirty, updateInvalid*/ 41943040) {
    			if (instance && dirty && instance.isValid() !== !invalid) {
    				if (updateInvalid) {
    					$$invalidate(1, invalid = !instance.isValid());
    				} else {
    					instance.setValid(!invalid);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, required*/ 8389632) {
    			if (instance && instance.getRequired() !== required) {
    				instance.setRequired(required);
    			}
    		}
    	};

    	return [
    		value,
    		invalid,
    		use,
    		className,
    		style,
    		ripple,
    		disabled,
    		variant,
    		noLabel,
    		label,
    		required,
    		inputId,
    		hiddenInput,
    		anchor$use,
    		anchor$class,
    		selectedTextContainer$use,
    		selectedTextContainer$class,
    		selectedText$use,
    		selectedText$class,
    		dropdownIcon$use,
    		dropdownIcon$class,
    		menu$class,
    		withLeadingIcon,
    		instance,
    		selectedIndex,
    		element,
    		internalClasses,
    		internalStyles,
    		selectAnchor,
    		selectAnchorAttrs,
    		selectText,
    		helperId,
    		menuOpen,
    		menuClasses,
    		anchorElement,
    		anchorCorner,
    		wrapFocus,
    		list,
    		leadingIcon,
    		helperText,
    		floatingLabel,
    		lineRipple,
    		notchedOutline,
    		$selectedTextStore,
    		forwardEvents,
    		uninitializedValue,
    		context,
    		selectedTextStore,
    		valueStore,
    		addClass,
    		removeClass,
    		addStyle,
    		$$slots,
    		$$restProps,
    		dirty,
    		key,
    		updateInvalid,
    		focus,
    		layout,
    		getElement,
    		previousSelectedIndex,
    		slots,
    		focus_handler,
    		blur_handler,
    		floatinglabel_binding,
    		floatinglabel_binding_1,
    		notchedoutline_binding,
    		span0_binding,
    		lineripple_binding,
    		div0_binding,
    		focus_handler_1,
    		blur_handler_1,
    		click_handler,
    		keydown_handler,
    		list_1_selectedIndex_binding,
    		SMUI_list_mount_handler,
    		menu_open_binding,
    		MDCMenu_selected_handler,
    		MDCMenuSurface_closing_handler,
    		MDCMenuSurface_closed_handler,
    		MDCMenuSurface_opened_handler,
    		div1_binding,
    		SMUI_select_leading_icon_mount_handler,
    		SMUI_select_leading_icon_unmount_handler,
    		SMUI_select_helper_text_id_handler,
    		SMUI_select_helper_text_mount_handler,
    		SMUI_select_helper_text_unmount_handler,
    		$$scope
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$4,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				use: 2,
    				class: 3,
    				style: 4,
    				ripple: 5,
    				disabled: 6,
    				variant: 7,
    				noLabel: 8,
    				label: 9,
    				value: 0,
    				key: 55,
    				dirty: 54,
    				invalid: 1,
    				updateInvalid: 56,
    				required: 10,
    				inputId: 11,
    				hiddenInput: 12,
    				anchor$use: 13,
    				anchor$class: 14,
    				selectedTextContainer$use: 15,
    				selectedTextContainer$class: 16,
    				selectedText$use: 17,
    				selectedText$class: 18,
    				dropdownIcon$use: 19,
    				dropdownIcon$class: 20,
    				menu$class: 21,
    				withLeadingIcon: 22,
    				focus: 57,
    				layout: 58,
    				getElement: 59
    			},
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get use() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dirty() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dirty(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateInvalid() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateInvalid(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hiddenInput() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hiddenInput(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchor$use() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchor$use(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchor$class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchor$class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedTextContainer$use() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTextContainer$use(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedTextContainer$class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTextContainer$class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedText$use() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedText$use(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedText$class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedText$class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownIcon$use() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownIcon$use(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownIcon$class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownIcon$class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menu$class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menu$class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withLeadingIcon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withLeadingIcon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		return this.$$.ctx[57];
    	}

    	set focus(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx[58];
    	}

    	set layout(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[59];
    	}

    	set getElement(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Li.svelte generated by Svelte v3.38.2 */
    const file$6 = "node_modules/@smui/common/Li.svelte";

    function create_fragment$7(ctx) {
    	let li;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let li_levels = [/*$$restProps*/ ctx[3]];
    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			set_attributes(li, li_data);
    			add_location(li, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			/*li_binding*/ ctx[7](li);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, li, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, li))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			/*li_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Li", slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element = null;

    	function getElement() {
    		return element;
    	}

    	function li_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		li_binding
    	];
    }

    class Li extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$7, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Li",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get use() {
    		throw new Error("<Li>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Li>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Li>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/list/Item.svelte generated by Svelte v3.38.2 */
    const file$5 = "node_modules/@smui/list/Item.svelte";

    // (56:3) {#if ripple}
    function create_if_block$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "mdc-deprecated-list-item__ripple");
    			add_location(span, file$5, 55, 15, 1654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(56:3) {#if ripple}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[     ...(nonInteractive       ? []       : [           [             Ripple,             {               ripple: !input,               unbounded: false,               color:                 (activated || selected) && color == null ? 'primary' : color,               disabled,               addClass,               removeClass,               addStyle,             },           ],         ]),     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-deprecated-list-item': true,     'mdc-deprecated-list-item--activated': activated,     'mdc-deprecated-list-item--selected': selected,     'mdc-deprecated-list-item--disabled': disabled,     'mdc-menu-item--selected': !nav && role === 'menuitem' && selected,     'smui-menu-item--non-interactive': nonInteractive,     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...nav && activated ? { 'aria-current': 'page' } : {}}   {...!nav ? { role } : {}}   {...!nav && role === 'option'     ? { 'aria-selected': selected ? 'true' : 'false' }     : {}}   {...!nav && (role === 'radio' || role === 'checkbox')     ? { 'aria-checked': input && input.checked ? 'true' : 'false' }     : {}}   {...!nav ? { 'aria-disabled': disabled ? 'true' : 'false' } : {}}   {tabindex}   on:click={action}   on:keydown={handleKeydown}   on:SMUI:generic:input:mount={(event) => (input = event.detail)}   on:SMUI:generic:input:unmount={() => (input = undefined)}   {href}   {...internalAttrs}   {...$$restProps}   >
    function create_default_slot$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*ripple*/ ctx[6] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[34], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ripple*/ ctx[6]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[34], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[     ...(nonInteractive       ? []       : [           [             Ripple,             {               ripple: !input,               unbounded: false,               color:                 (activated || selected) && color == null ? 'primary' : color,               disabled,               addClass,               removeClass,               addStyle,             },           ],         ]),     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-deprecated-list-item': true,     'mdc-deprecated-list-item--activated': activated,     'mdc-deprecated-list-item--selected': selected,     'mdc-deprecated-list-item--disabled': disabled,     'mdc-menu-item--selected': !nav && role === 'menuitem' && selected,     'smui-menu-item--non-interactive': nonInteractive,     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...nav && activated ? { 'aria-current': 'page' } : {}}   {...!nav ? { role } : {}}   {...!nav && role === 'option'     ? { 'aria-selected': selected ? 'true' : 'false' }     : {}}   {...!nav && (role === 'radio' || role === 'checkbox')     ? { 'aria-checked': input && input.checked ? 'true' : 'false' }     : {}}   {...!nav ? { 'aria-disabled': disabled ? 'true' : 'false' } : {}}   {tabindex}   on:click={action}   on:keydown={handleKeydown}   on:SMUI:generic:input:mount={(event) => (input = event.detail)}   on:SMUI:generic:input:unmount={() => (input = undefined)}   {href}   {...internalAttrs}   {...$$restProps}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [
    				.../*nonInteractive*/ ctx[5]
    				? []
    				: [
    						[
    							Ripple,
    							{
    								ripple: !/*input*/ ctx[12],
    								unbounded: false,
    								color: (/*activated*/ ctx[7] || /*selected*/ ctx[0]) && /*color*/ ctx[4] == null
    								? "primary"
    								: /*color*/ ctx[4],
    								disabled: /*disabled*/ ctx[9],
    								addClass: /*addClass*/ ctx[20],
    								removeClass: /*removeClass*/ ctx[21],
    								addStyle: /*addStyle*/ ctx[22]
    							}
    						]
    					],
    				/*forwardEvents*/ ctx[18],
    				.../*use*/ ctx[1]
    			]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[2]]: true,
    				"mdc-deprecated-list-item": true,
    				"mdc-deprecated-list-item--activated": /*activated*/ ctx[7],
    				"mdc-deprecated-list-item--selected": /*selected*/ ctx[0],
    				"mdc-deprecated-list-item--disabled": /*disabled*/ ctx[9],
    				"mdc-menu-item--selected": !/*nav*/ ctx[19] && /*role*/ ctx[8] === "menuitem" && /*selected*/ ctx[0],
    				"smui-menu-item--non-interactive": /*nonInteractive*/ ctx[5],
    				.../*internalClasses*/ ctx[14]
    			})
    		},
    		{
    			style: Object.entries(/*internalStyles*/ ctx[15]).map(func$3).concat([/*style*/ ctx[3]]).join(" ")
    		},
    		/*nav*/ ctx[19] && /*activated*/ ctx[7]
    		? { "aria-current": "page" }
    		: {},
    		!/*nav*/ ctx[19] ? { role: /*role*/ ctx[8] } : {},
    		!/*nav*/ ctx[19] && /*role*/ ctx[8] === "option"
    		? {
    				"aria-selected": /*selected*/ ctx[0] ? "true" : "false"
    			}
    		: {},
    		!/*nav*/ ctx[19] && (/*role*/ ctx[8] === "radio" || /*role*/ ctx[8] === "checkbox")
    		? {
    				"aria-checked": /*input*/ ctx[12] && /*input*/ ctx[12].checked
    				? "true"
    				: "false"
    			}
    		: {},
    		!/*nav*/ ctx[19]
    		? {
    				"aria-disabled": /*disabled*/ ctx[9] ? "true" : "false"
    			}
    		: {},
    		{ tabindex: /*tabindex*/ ctx[17] },
    		{ href: /*href*/ ctx[10] },
    		/*internalAttrs*/ ctx[16],
    		/*$$restProps*/ ctx[25]
    	];

    	var switch_value = /*component*/ ctx[11];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$4] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[31](switch_instance);
    		switch_instance.$on("click", /*action*/ ctx[23]);
    		switch_instance.$on("keydown", /*handleKeydown*/ ctx[24]);
    		switch_instance.$on("SMUI:generic:input:mount", /*SMUI_generic_input_mount_handler*/ ctx[32]);
    		switch_instance.$on("SMUI:generic:input:unmount", /*SMUI_generic_input_unmount_handler*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*nonInteractive, input, activated, selected, color, disabled, addClass, removeClass, addStyle, forwardEvents, use, className, nav, role, internalClasses, internalStyles, style, tabindex, href, internalAttrs, $$restProps*/ 41932735)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*nonInteractive, input, activated, selected, color, disabled, addClass, removeClass, addStyle, forwardEvents, use*/ 7606963 && {
    						use: [
    							.../*nonInteractive*/ ctx[5]
    							? []
    							: [
    									[
    										Ripple,
    										{
    											ripple: !/*input*/ ctx[12],
    											unbounded: false,
    											color: (/*activated*/ ctx[7] || /*selected*/ ctx[0]) && /*color*/ ctx[4] == null
    											? "primary"
    											: /*color*/ ctx[4],
    											disabled: /*disabled*/ ctx[9],
    											addClass: /*addClass*/ ctx[20],
    											removeClass: /*removeClass*/ ctx[21],
    											addStyle: /*addStyle*/ ctx[22]
    										}
    									]
    								],
    							/*forwardEvents*/ ctx[18],
    							.../*use*/ ctx[1]
    						]
    					},
    					dirty[0] & /*className, activated, selected, disabled, nav, role, nonInteractive, internalClasses*/ 541605 && {
    						class: classMap({
    							[/*className*/ ctx[2]]: true,
    							"mdc-deprecated-list-item": true,
    							"mdc-deprecated-list-item--activated": /*activated*/ ctx[7],
    							"mdc-deprecated-list-item--selected": /*selected*/ ctx[0],
    							"mdc-deprecated-list-item--disabled": /*disabled*/ ctx[9],
    							"mdc-menu-item--selected": !/*nav*/ ctx[19] && /*role*/ ctx[8] === "menuitem" && /*selected*/ ctx[0],
    							"smui-menu-item--non-interactive": /*nonInteractive*/ ctx[5],
    							.../*internalClasses*/ ctx[14]
    						})
    					},
    					dirty[0] & /*internalStyles, style*/ 32776 && {
    						style: Object.entries(/*internalStyles*/ ctx[15]).map(func$3).concat([/*style*/ ctx[3]]).join(" ")
    					},
    					dirty[0] & /*nav, activated*/ 524416 && get_spread_object(/*nav*/ ctx[19] && /*activated*/ ctx[7]
    					? { "aria-current": "page" }
    					: {}),
    					dirty[0] & /*nav, role*/ 524544 && get_spread_object(!/*nav*/ ctx[19] ? { role: /*role*/ ctx[8] } : {}),
    					dirty[0] & /*nav, role, selected*/ 524545 && get_spread_object(!/*nav*/ ctx[19] && /*role*/ ctx[8] === "option"
    					? {
    							"aria-selected": /*selected*/ ctx[0] ? "true" : "false"
    						}
    					: {}),
    					dirty[0] & /*nav, role, input*/ 528640 && get_spread_object(!/*nav*/ ctx[19] && (/*role*/ ctx[8] === "radio" || /*role*/ ctx[8] === "checkbox")
    					? {
    							"aria-checked": /*input*/ ctx[12] && /*input*/ ctx[12].checked
    							? "true"
    							: "false"
    						}
    					: {}),
    					dirty[0] & /*nav, disabled*/ 524800 && get_spread_object(!/*nav*/ ctx[19]
    					? {
    							"aria-disabled": /*disabled*/ ctx[9] ? "true" : "false"
    						}
    					: {}),
    					dirty[0] & /*tabindex*/ 131072 && { tabindex: /*tabindex*/ ctx[17] },
    					dirty[0] & /*href*/ 1024 && { href: /*href*/ ctx[10] },
    					dirty[0] & /*internalAttrs*/ 65536 && get_spread_object(/*internalAttrs*/ ctx[16]),
    					dirty[0] & /*$$restProps*/ 33554432 && get_spread_object(/*$$restProps*/ ctx[25])
    				])
    			: {};

    			if (dirty[0] & /*ripple*/ 64 | dirty[1] & /*$$scope*/ 8) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[31](switch_instance);
    					switch_instance.$on("click", /*action*/ ctx[23]);
    					switch_instance.$on("keydown", /*handleKeydown*/ ctx[24]);
    					switch_instance.$on("SMUI:generic:input:mount", /*SMUI_generic_input_mount_handler*/ ctx[32]);
    					switch_instance.$on("SMUI:generic:input:unmount", /*SMUI_generic_input_unmount_handler*/ ctx[33]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[31](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
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

    let counter = 0;
    const func$3 = ([name, value]) => `${name}: ${value};`;

    function instance$2($$self, $$props, $$invalidate) {
    	let tabindex;

    	const omit_props_names = [
    		"use","class","style","color","nonInteractive","ripple","activated","role","selected","disabled","tabindex","inputId","href","component","getPrimaryText","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	let uninitializedValue = () => {
    		
    	};

    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { style = "" } = $$props;
    	let { color = null } = $$props;
    	let { nonInteractive = getContext("SMUI:list:nonInteractive") } = $$props;
    	setContext("SMUI:list:nonInteractive", undefined);
    	let { ripple = !nonInteractive } = $$props;
    	let { activated = false } = $$props;
    	let { role = getContext("SMUI:list:item:role") } = $$props;
    	setContext("SMUI:list:item:role", undefined);
    	let { selected = false } = $$props;
    	let { disabled = false } = $$props;
    	let { tabindex: tabindexProp = uninitializedValue } = $$props;
    	let { inputId = "SMUI-form-field-list-" + counter++ } = $$props;
    	let { href = null } = $$props;
    	let element;
    	let internalClasses = {};
    	let internalStyles = {};
    	let internalAttrs = {};
    	let input;
    	let addTabindexIfNoItemsSelectedRaf;
    	let nav = getContext("SMUI:list:item:nav");
    	let { component = nav ? href ? A : Span : Li } = $$props;
    	setContext("SMUI:generic:input:props", { id: inputId });

    	// Reset separator context, because we aren't directly under a list anymore.
    	setContext("SMUI:separator:context", undefined);

    	onMount(() => {
    		// Tabindex needs to be '0' if this is the first non-disabled list item, and
    		// no other item is selected.
    		if (!selected && !nonInteractive) {
    			let first = true;
    			let el = element;

    			while (el.previousSibling) {
    				el = el.previousSibling;

    				if (el.nodeType === 1 && el.classList.contains("mdc-deprecated-list-item") && !el.classList.contains("mdc-deprecated-list-item--disabled")) {
    					first = false;
    					break;
    				}
    			}

    			if (first) {
    				// This is first, so now set up a check that no other items are
    				// selected.
    				addTabindexIfNoItemsSelectedRaf = window.requestAnimationFrame(addTabindexIfNoItemsSelected);
    			}
    		}

    		const accessor = {
    			_smui_list_item_accessor: true,
    			get element() {
    				return getElement();
    			},
    			get selected() {
    				return selected;
    			},
    			set selected(value) {
    				$$invalidate(0, selected = value);
    			},
    			hasClass,
    			addClass,
    			removeClass,
    			getAttr,
    			addAttr,
    			removeAttr,
    			getPrimaryText,
    			// For inputs within item.
    			get checked() {
    				return input && input.checked;
    			},
    			set checked(value) {
    				if (input) {
    					$$invalidate(12, input.checked = value, input);
    				}
    			},
    			get hasCheckbox() {
    				return !!(input && input._smui_checkbox_accessor);
    			},
    			get hasRadio() {
    				return !!(input && input._smui_radio_accessor);
    			},
    			activateRipple() {
    				if (input) {
    					input.activateRipple();
    				}
    			},
    			deactivateRipple() {
    				if (input) {
    					input.deactivateRipple();
    				}
    			},
    			// For select options.
    			getValue() {
    				return $$restProps.value;
    			}
    		};

    		dispatch(element, "SMUI:list:item:mount", accessor);

    		return () => {
    			dispatch(element, "SMUI:list:item:unmount", accessor);
    		};
    	});

    	onDestroy(() => {
    		if (addTabindexIfNoItemsSelectedRaf) {
    			window.cancelAnimationFrame(addTabindexIfNoItemsSelectedRaf);
    		}
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(14, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(14, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete internalStyles[name];
    				$$invalidate(15, internalStyles);
    			} else {
    				$$invalidate(15, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function getAttr(name) {
    		return name in internalAttrs
    		? internalAttrs[name]
    		: getElement().getAttribute(name);
    	}

    	function addAttr(name, value) {
    		if (internalAttrs[name] !== value) {
    			$$invalidate(16, internalAttrs[name] = value, internalAttrs);
    		}
    	}

    	function removeAttr(name) {
    		if (!(name in internalAttrs) || internalAttrs[name] != null) {
    			$$invalidate(16, internalAttrs[name] = undefined, internalAttrs);
    		}
    	}

    	function addTabindexIfNoItemsSelected() {
    		// Look through next siblings to see if none of them are selected.
    		let noneSelected = true;

    		let el = element;

    		while (el.nextSibling) {
    			el = el.nextSibling;

    			if (el.nodeType === 1 && el.classList.contains("mdc-deprecated-list-item") && el.attributes["tabindex"] && el.attributes["tabindex"].value === "0") {
    				noneSelected = false;
    				break;
    			}
    		}

    		if (noneSelected) {
    			// This is the first element, and no other element is selected, so the
    			// tabindex should be '0'.
    			$$invalidate(17, tabindex = "0");
    		}
    	}

    	function action(e) {
    		if (!disabled) {
    			dispatch(element, "SMUI:action", e);
    		}
    	}

    	function handleKeydown(e) {
    		const isEnter = e.key === "Enter" || e.keyCode === 13;
    		const isSpace = e.key === "Space" || e.keyCode === 32;

    		if (isEnter || isSpace) {
    			action(e);
    		}
    	}

    	function getPrimaryText() {
    		const element = getElement();
    		const primaryText = element.querySelector(".mdc-deprecated-list-item__primary-text");

    		if (primaryText) {
    			return primaryText.textContent;
    		}

    		const text = element.querySelector(".mdc-deprecated-list-item__text");

    		if (text) {
    			return text.textContent;
    		}

    		return element.textContent;
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(13, element);
    		});
    	}

    	const SMUI_generic_input_mount_handler = event => $$invalidate(12, input = event.detail);
    	const SMUI_generic_input_unmount_handler = () => $$invalidate(12, input = undefined);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(25, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("nonInteractive" in $$new_props) $$invalidate(5, nonInteractive = $$new_props.nonInteractive);
    		if ("ripple" in $$new_props) $$invalidate(6, ripple = $$new_props.ripple);
    		if ("activated" in $$new_props) $$invalidate(7, activated = $$new_props.activated);
    		if ("role" in $$new_props) $$invalidate(8, role = $$new_props.role);
    		if ("selected" in $$new_props) $$invalidate(0, selected = $$new_props.selected);
    		if ("disabled" in $$new_props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("tabindex" in $$new_props) $$invalidate(26, tabindexProp = $$new_props.tabindex);
    		if ("inputId" in $$new_props) $$invalidate(27, inputId = $$new_props.inputId);
    		if ("href" in $$new_props) $$invalidate(10, href = $$new_props.href);
    		if ("component" in $$new_props) $$invalidate(11, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(34, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		counter,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		Ripple,
    		A,
    		Span,
    		Li,
    		forwardEvents,
    		uninitializedValue,
    		use,
    		className,
    		style,
    		color,
    		nonInteractive,
    		ripple,
    		activated,
    		role,
    		selected,
    		disabled,
    		tabindexProp,
    		inputId,
    		href,
    		element,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		input,
    		addTabindexIfNoItemsSelectedRaf,
    		nav,
    		component,
    		hasClass,
    		addClass,
    		removeClass,
    		addStyle,
    		getAttr,
    		addAttr,
    		removeAttr,
    		addTabindexIfNoItemsSelected,
    		action,
    		handleKeydown,
    		getPrimaryText,
    		getElement,
    		tabindex
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("uninitializedValue" in $$props) $$invalidate(36, uninitializedValue = $$new_props.uninitializedValue);
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("nonInteractive" in $$props) $$invalidate(5, nonInteractive = $$new_props.nonInteractive);
    		if ("ripple" in $$props) $$invalidate(6, ripple = $$new_props.ripple);
    		if ("activated" in $$props) $$invalidate(7, activated = $$new_props.activated);
    		if ("role" in $$props) $$invalidate(8, role = $$new_props.role);
    		if ("selected" in $$props) $$invalidate(0, selected = $$new_props.selected);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("tabindexProp" in $$props) $$invalidate(26, tabindexProp = $$new_props.tabindexProp);
    		if ("inputId" in $$props) $$invalidate(27, inputId = $$new_props.inputId);
    		if ("href" in $$props) $$invalidate(10, href = $$new_props.href);
    		if ("element" in $$props) $$invalidate(13, element = $$new_props.element);
    		if ("internalClasses" in $$props) $$invalidate(14, internalClasses = $$new_props.internalClasses);
    		if ("internalStyles" in $$props) $$invalidate(15, internalStyles = $$new_props.internalStyles);
    		if ("internalAttrs" in $$props) $$invalidate(16, internalAttrs = $$new_props.internalAttrs);
    		if ("input" in $$props) $$invalidate(12, input = $$new_props.input);
    		if ("addTabindexIfNoItemsSelectedRaf" in $$props) addTabindexIfNoItemsSelectedRaf = $$new_props.addTabindexIfNoItemsSelectedRaf;
    		if ("nav" in $$props) $$invalidate(19, nav = $$new_props.nav);
    		if ("component" in $$props) $$invalidate(11, component = $$new_props.component);
    		if ("tabindex" in $$props) $$invalidate(17, tabindex = $$new_props.tabindex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*tabindexProp, nonInteractive, disabled, selected, input*/ 67113505) {
    			$$invalidate(17, tabindex = tabindexProp == uninitializedValue
    			? !nonInteractive && !disabled && (selected || input && input.checked) && "0" || "-1"
    			: tabindexProp);
    		}
    	};

    	return [
    		selected,
    		use,
    		className,
    		style,
    		color,
    		nonInteractive,
    		ripple,
    		activated,
    		role,
    		disabled,
    		href,
    		component,
    		input,
    		element,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		tabindex,
    		forwardEvents,
    		nav,
    		addClass,
    		removeClass,
    		addStyle,
    		action,
    		handleKeydown,
    		$$restProps,
    		tabindexProp,
    		inputId,
    		getPrimaryText,
    		getElement,
    		slots,
    		switch_instance_binding,
    		SMUI_generic_input_mount_handler,
    		SMUI_generic_input_unmount_handler,
    		$$scope
    	];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				use: 1,
    				class: 2,
    				style: 3,
    				color: 4,
    				nonInteractive: 5,
    				ripple: 6,
    				activated: 7,
    				role: 8,
    				selected: 0,
    				disabled: 9,
    				tabindex: 26,
    				inputId: 27,
    				href: 10,
    				component: 11,
    				getPrimaryText: 28,
    				getElement: 29
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get use() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activated() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activated(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getPrimaryText() {
    		return this.$$.ctx[28];
    	}

    	set getPrimaryText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[29];
    	}

    	set getElement(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/select/Option.svelte generated by Svelte v3.38.2 */

    // (1:0) <Item   bind:this={element}   use={[forwardEvents, ...use]}   data-value={value}   {value}   {selected}   {...$$restProps}>
    function create_default_slot$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(1:0) <Item   bind:this={element}   use={[forwardEvents, ...use]}   data-value={value}   {value}   {selected}   {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let item;
    	let current;

    	const item_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    		},
    		{ "data-value": /*value*/ ctx[1] },
    		{ value: /*value*/ ctx[1] },
    		{ selected: /*selected*/ ctx[3] },
    		/*$$restProps*/ ctx[7]
    	];

    	let item_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < item_spread_levels.length; i += 1) {
    		item_props = assign(item_props, item_spread_levels[i]);
    	}

    	item = new Item({ props: item_props, $$inline: true });
    	/*item_binding*/ ctx[12](item);

    	const block = {
    		c: function create() {
    			create_component(item.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const item_changes = (dirty & /*forwardEvents, use, value, selected, $$restProps*/ 155)
    			? get_spread_update(item_spread_levels, [
    					dirty & /*forwardEvents, use*/ 17 && {
    						use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    					},
    					dirty & /*value*/ 2 && { "data-value": /*value*/ ctx[1] },
    					dirty & /*value*/ 2 && { value: /*value*/ ctx[1] },
    					dirty & /*selected*/ 8 && { selected: /*selected*/ ctx[3] },
    					dirty & /*$$restProps*/ 128 && get_spread_object(/*$$restProps*/ ctx[7])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 8192) {
    				item_changes.$$scope = { dirty, ctx };
    			}

    			item.$set(item_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*item_binding*/ ctx[12](null);
    			destroy_component(item, detaching);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let selected;
    	const omit_props_names = ["use","class","value","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $selectedValue;
    	let $selectedText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Option", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	const className = "";
    	let { value = "" } = $$props;
    	let element;
    	const selectedText = getContext("SMUI:select:selectedText");
    	validate_store(selectedText, "selectedText");
    	component_subscribe($$self, selectedText, value => $$invalidate(14, $selectedText = value));
    	const selectedValue = getContext("SMUI:select:value");
    	validate_store(selectedValue, "selectedValue");
    	component_subscribe($$self, selectedValue, value => $$invalidate(10, $selectedValue = value));
    	setContext("SMUI:list:item:role", "option");
    	onMount(setSelectedText);
    	onDestroy(setSelectedText);

    	function setSelectedText() {
    		if (selected && element) {
    			set_store_value(selectedText, $selectedText = element.getPrimaryText(), $selectedText);
    		}
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function item_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("value" in $$new_props) $$invalidate(1, value = $$new_props.value);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		Item,
    		forwardEvents,
    		use,
    		className,
    		value,
    		element,
    		selectedText,
    		selectedValue,
    		setSelectedText,
    		getElement,
    		selected,
    		$selectedValue,
    		$selectedText
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
    		if ("element" in $$props) $$invalidate(2, element = $$new_props.element);
    		if ("selected" in $$props) $$invalidate(3, selected = $$new_props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, $selectedValue*/ 1026) {
    			$$invalidate(3, selected = value != null && value !== "" && $selectedValue === value);
    		}
    	};

    	return [
    		use,
    		value,
    		element,
    		selected,
    		forwardEvents,
    		selectedText,
    		selectedValue,
    		$$restProps,
    		className,
    		getElement,
    		$selectedValue,
    		slots,
    		item_binding,
    		$$scope
    	];
    }

    class Option extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$5, safe_not_equal, {
    			use: 0,
    			class: 8,
    			value: 1,
    			getElement: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Option",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get use() {
    		throw new Error("<Option>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		return this.$$.ctx[8];
    	}

    	set class(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Option>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[9];
    	}

    	set getElement(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = {
        ACTIVE: 'mdc-tab-indicator--active',
        FADE: 'mdc-tab-indicator--fade',
        NO_TRANSITION: 'mdc-tab-indicator--no-transition',
    };
    var strings$3 = {
        CONTENT_SELECTOR: '.mdc-tab-indicator__content',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCTabIndicatorFoundation, _super);
        function MDCTabIndicatorFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCTabIndicatorFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCTabIndicatorFoundation, "cssClasses", {
            get: function () {
                return cssClasses$2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabIndicatorFoundation, "strings", {
            get: function () {
                return strings$3;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabIndicatorFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    computeContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    setContentStyleProperty: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCTabIndicatorFoundation.prototype.computeContentClientRect = function () {
            return this.adapter.computeContentClientRect();
        };
        return MDCTabIndicatorFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCFadingTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCFadingTabIndicatorFoundation, _super);
        function MDCFadingTabIndicatorFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCFadingTabIndicatorFoundation.prototype.activate = function () {
            this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        MDCFadingTabIndicatorFoundation.prototype.deactivate = function () {
            this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        return MDCFadingTabIndicatorFoundation;
    }(MDCTabIndicatorFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCSlidingTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCSlidingTabIndicatorFoundation, _super);
        function MDCSlidingTabIndicatorFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCSlidingTabIndicatorFoundation.prototype.activate = function (previousIndicatorClientRect) {
            // Early exit if no indicator is present to handle cases where an indicator
            // may be activated without a prior indicator state
            if (!previousIndicatorClientRect) {
                this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
                return;
            }
            // This animation uses the FLIP approach. You can read more about it at the link below:
            // https://aerotwist.com/blog/flip-your-animations/
            // Calculate the dimensions based on the dimensions of the previous indicator
            var currentClientRect = this.computeContentClientRect();
            var widthDelta = previousIndicatorClientRect.width / currentClientRect.width;
            var xPosition = previousIndicatorClientRect.left - currentClientRect.left;
            this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
            this.adapter.setContentStyleProperty('transform', "translateX(" + xPosition + "px) scaleX(" + widthDelta + ")");
            // Force repaint before updating classes and transform to ensure the transform properly takes effect
            this.computeContentClientRect();
            this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
            this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
            this.adapter.setContentStyleProperty('transform', '');
        };
        MDCSlidingTabIndicatorFoundation.prototype.deactivate = function () {
            this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        return MDCSlidingTabIndicatorFoundation;
    }(MDCTabIndicatorFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$1 = {
        ACTIVE: 'mdc-tab--active',
    };
    var strings$2 = {
        ARIA_SELECTED: 'aria-selected',
        CONTENT_SELECTOR: '.mdc-tab__content',
        INTERACTED_EVENT: 'MDCTab:interacted',
        RIPPLE_SELECTOR: '.mdc-tab__ripple',
        TABINDEX: 'tabIndex',
        TAB_INDICATOR_SELECTOR: '.mdc-tab-indicator',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabFoundation = /** @class */ (function (_super) {
        __extends(MDCTabFoundation, _super);
        function MDCTabFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCTabFoundation.defaultAdapter), adapter)) || this;
            _this.focusOnActivate_ = true;
            return _this;
        }
        Object.defineProperty(MDCTabFoundation, "cssClasses", {
            get: function () {
                return cssClasses$1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabFoundation, "strings", {
            get: function () {
                return strings$2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setAttr: function () { return undefined; },
                    activateIndicator: function () { return undefined; },
                    deactivateIndicator: function () { return undefined; },
                    notifyInteracted: function () { return undefined; },
                    getOffsetLeft: function () { return 0; },
                    getOffsetWidth: function () { return 0; },
                    getContentOffsetLeft: function () { return 0; },
                    getContentOffsetWidth: function () { return 0; },
                    focus: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCTabFoundation.prototype.handleClick = function () {
            // It's up to the parent component to keep track of the active Tab and
            // ensure we don't activate a Tab that's already active.
            this.adapter.notifyInteracted();
        };
        MDCTabFoundation.prototype.isActive = function () {
            return this.adapter.hasClass(cssClasses$1.ACTIVE);
        };
        /**
         * Sets whether the tab should focus itself when activated
         */
        MDCTabFoundation.prototype.setFocusOnActivate = function (focusOnActivate) {
            this.focusOnActivate_ = focusOnActivate;
        };
        /**
         * Activates the Tab
         */
        MDCTabFoundation.prototype.activate = function (previousIndicatorClientRect) {
            this.adapter.addClass(cssClasses$1.ACTIVE);
            this.adapter.setAttr(strings$2.ARIA_SELECTED, 'true');
            this.adapter.setAttr(strings$2.TABINDEX, '0');
            this.adapter.activateIndicator(previousIndicatorClientRect);
            if (this.focusOnActivate_) {
                this.adapter.focus();
            }
        };
        /**
         * Deactivates the Tab
         */
        MDCTabFoundation.prototype.deactivate = function () {
            // Early exit
            if (!this.isActive()) {
                return;
            }
            this.adapter.removeClass(cssClasses$1.ACTIVE);
            this.adapter.setAttr(strings$2.ARIA_SELECTED, 'false');
            this.adapter.setAttr(strings$2.TABINDEX, '-1');
            this.adapter.deactivateIndicator();
        };
        /**
         * Returns the dimensions of the Tab
         */
        MDCTabFoundation.prototype.computeDimensions = function () {
            var rootWidth = this.adapter.getOffsetWidth();
            var rootLeft = this.adapter.getOffsetLeft();
            var contentWidth = this.adapter.getContentOffsetWidth();
            var contentLeft = this.adapter.getContentOffsetLeft();
            return {
                contentLeft: rootLeft + contentLeft,
                contentRight: rootLeft + contentLeft + contentWidth,
                rootLeft: rootLeft,
                rootRight: rootLeft + rootWidth,
            };
        };
        return MDCTabFoundation;
    }(MDCFoundation));

    /* node_modules/@smui/tab-indicator/TabIndicator.svelte generated by Svelte v3.38.2 */

    const file$4 = "node_modules/@smui/tab-indicator/TabIndicator.svelte";

    function create_fragment$4(ctx) {
    	let span1;
    	let span0;
    	let span0_class_value;
    	let span0_style_value;
    	let span0_aria_hidden_value;
    	let useActions_action;
    	let span1_class_value;
    	let useActions_action_1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[21].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);

    	let span0_levels = [
    		{
    			class: span0_class_value = classMap({
    				[/*content$class*/ ctx[6]]: true,
    				"mdc-tab-indicator__content": true,
    				"mdc-tab-indicator__content--underline": /*type*/ ctx[3] === "underline",
    				"mdc-tab-indicator__content--icon": /*type*/ ctx[3] === "icon"
    			})
    		},
    		{
    			style: span0_style_value = Object.entries(/*contentStyles*/ ctx[10]).map(func$2).join(" ")
    		},
    		{
    			"aria-hidden": span0_aria_hidden_value = /*type*/ ctx[3] === "icon" ? "true" : null
    		},
    		prefixFilter(/*$$restProps*/ ctx[12], "content$")
    	];

    	let span0_data = {};

    	for (let i = 0; i < span0_levels.length; i += 1) {
    		span0_data = assign(span0_data, span0_levels[i]);
    	}

    	let span1_levels = [
    		{
    			class: span1_class_value = classMap({
    				[/*className*/ ctx[2]]: true,
    				"mdc-tab-indicator": true,
    				"mdc-tab-indicator--active": /*active*/ ctx[0],
    				"mdc-tab-indicator--fade": /*transition*/ ctx[4] === "fade",
    				.../*internalClasses*/ ctx[9]
    			})
    		},
    		exclude(/*$$restProps*/ ctx[12], ["content$"])
    	];

    	let span1_data = {};

    	for (let i = 0; i < span1_levels.length; i += 1) {
    		span1_data = assign(span1_data, span1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span0, span0_data);
    			add_location(span0, file$4, 13, 2, 316);
    			set_attributes(span1, span1_data);
    			add_location(span1, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);

    			if (default_slot) {
    				default_slot.m(span0, null);
    			}

    			/*span0_binding*/ ctx[22](span0);
    			/*span1_binding*/ ctx[23](span1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span0, /*content$use*/ ctx[5])),
    					action_destroyer(useActions_action_1 = useActions.call(null, span1, /*use*/ ctx[1])),
    					action_destroyer(/*forwardEvents*/ ctx[11].call(null, span1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1048576)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, null, null);
    				}
    			}

    			set_attributes(span0, span0_data = get_spread_update(span0_levels, [
    				(!current || dirty & /*content$class, type*/ 72 && span0_class_value !== (span0_class_value = classMap({
    					[/*content$class*/ ctx[6]]: true,
    					"mdc-tab-indicator__content": true,
    					"mdc-tab-indicator__content--underline": /*type*/ ctx[3] === "underline",
    					"mdc-tab-indicator__content--icon": /*type*/ ctx[3] === "icon"
    				}))) && { class: span0_class_value },
    				(!current || dirty & /*contentStyles*/ 1024 && span0_style_value !== (span0_style_value = Object.entries(/*contentStyles*/ ctx[10]).map(func$2).join(" "))) && { style: span0_style_value },
    				(!current || dirty & /*type*/ 8 && span0_aria_hidden_value !== (span0_aria_hidden_value = /*type*/ ctx[3] === "icon" ? "true" : null)) && { "aria-hidden": span0_aria_hidden_value },
    				dirty & /*$$restProps*/ 4096 && prefixFilter(/*$$restProps*/ ctx[12], "content$")
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*content$use*/ 32) useActions_action.update.call(null, /*content$use*/ ctx[5]);

    			set_attributes(span1, span1_data = get_spread_update(span1_levels, [
    				(!current || dirty & /*className, active, transition, internalClasses*/ 533 && span1_class_value !== (span1_class_value = classMap({
    					[/*className*/ ctx[2]]: true,
    					"mdc-tab-indicator": true,
    					"mdc-tab-indicator--active": /*active*/ ctx[0],
    					"mdc-tab-indicator--fade": /*transition*/ ctx[4] === "fade",
    					.../*internalClasses*/ ctx[9]
    				}))) && { class: span1_class_value },
    				dirty & /*$$restProps*/ 4096 && exclude(/*$$restProps*/ ctx[12], ["content$"])
    			]));

    			if (useActions_action_1 && is_function(useActions_action_1.update) && dirty & /*use*/ 2) useActions_action_1.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (default_slot) default_slot.d(detaching);
    			/*span0_binding*/ ctx[22](null);
    			/*span1_binding*/ ctx[23](null);
    			mounted = false;
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

    const func$2 = ([name, value]) => `${name}: ${value};`;

    function instance_1$3($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","active","type","transition","content$use","content$class","activate","deactivate","computeContentClientRect","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabIndicator", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { type = "underline" } = $$props;
    	let { transition = "slide" } = $$props;
    	let { content$use = [] } = $$props;
    	let { content$class = "" } = $$props;
    	let element;
    	let instance;
    	let content;
    	let internalClasses = {};
    	let contentStyles = {};
    	let changeSets = [];
    	let oldTransition = transition;

    	onMount(() => {
    		$$invalidate(17, instance = getInstance());
    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function getInstance() {
    		const Foundation = ({
    			fade: MDCFadingTabIndicatorFoundation,
    			slide: MDCSlidingTabIndicatorFoundation
    		})[transition] || MDCSlidingTabIndicatorFoundation;

    		return Foundation
    		? new Foundation({
    					addClass: (...props) => doChange(() => addClass(...props)),
    					removeClass: (...props) => doChange(() => removeClass(...props)),
    					computeContentClientRect,
    					setContentStyleProperty: (...props) => doChange(() => addContentStyle(...props))
    				})
    		: undefined;
    	}

    	function doChange(fn) {
    		if (changeSets.length) {
    			changeSets[changeSets.length - 1].push(fn);
    		} else {
    			fn();
    		}
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(9, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(9, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addContentStyle(name, value) {
    		if (contentStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete contentStyles[name];
    				((($$invalidate(10, contentStyles), $$invalidate(19, oldTransition)), $$invalidate(4, transition)), $$invalidate(17, instance));
    			} else {
    				$$invalidate(10, contentStyles[name] = value, contentStyles);
    			}
    		}
    	}

    	function activate(previousIndicatorClientRect) {
    		$$invalidate(0, active = true);
    		instance.activate(previousIndicatorClientRect);
    	}

    	function deactivate() {
    		$$invalidate(0, active = false);
    		instance.deactivate();
    	}

    	function computeContentClientRect() {
    		changeSets.push([]);
    		$$invalidate(18, changeSets);
    		return content.getBoundingClientRect();
    	}

    	function getElement() {
    		return element;
    	}

    	function span0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			content = $$value;
    			$$invalidate(8, content);
    		});
    	}

    	function span1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(0, active = $$new_props.active);
    		if ("type" in $$new_props) $$invalidate(3, type = $$new_props.type);
    		if ("transition" in $$new_props) $$invalidate(4, transition = $$new_props.transition);
    		if ("content$use" in $$new_props) $$invalidate(5, content$use = $$new_props.content$use);
    		if ("content$class" in $$new_props) $$invalidate(6, content$class = $$new_props.content$class);
    		if ("$$scope" in $$new_props) $$invalidate(20, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCFadingTabIndicatorFoundation,
    		MDCSlidingTabIndicatorFoundation,
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		exclude,
    		prefixFilter,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		active,
    		type,
    		transition,
    		content$use,
    		content$class,
    		element,
    		instance,
    		content,
    		internalClasses,
    		contentStyles,
    		changeSets,
    		oldTransition,
    		getInstance,
    		doChange,
    		addClass,
    		removeClass,
    		addContentStyle,
    		activate,
    		deactivate,
    		computeContentClientRect,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(0, active = $$new_props.active);
    		if ("type" in $$props) $$invalidate(3, type = $$new_props.type);
    		if ("transition" in $$props) $$invalidate(4, transition = $$new_props.transition);
    		if ("content$use" in $$props) $$invalidate(5, content$use = $$new_props.content$use);
    		if ("content$class" in $$props) $$invalidate(6, content$class = $$new_props.content$class);
    		if ("element" in $$props) $$invalidate(7, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(17, instance = $$new_props.instance);
    		if ("content" in $$props) $$invalidate(8, content = $$new_props.content);
    		if ("internalClasses" in $$props) $$invalidate(9, internalClasses = $$new_props.internalClasses);
    		if ("contentStyles" in $$props) $$invalidate(10, contentStyles = $$new_props.contentStyles);
    		if ("changeSets" in $$props) $$invalidate(18, changeSets = $$new_props.changeSets);
    		if ("oldTransition" in $$props) $$invalidate(19, oldTransition = $$new_props.oldTransition);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*oldTransition, transition, instance*/ 655376) {
    			if (oldTransition !== transition) {
    				$$invalidate(19, oldTransition = transition);
    				instance && instance.destroy();
    				$$invalidate(9, internalClasses = {});
    				$$invalidate(10, contentStyles = {});
    				$$invalidate(17, instance = getInstance());
    				instance.init();
    			}
    		}

    		if ($$self.$$.dirty & /*changeSets*/ 262144) {
    			// Use sets of changes for DOM updates, to facilitate animations.
    			if (changeSets.length) {
    				requestAnimationFrame(() => {
    					const changeSet = changeSets.shift();
    					$$invalidate(18, changeSets);

    					for (const fn of changeSet) {
    						fn();
    					}
    				});
    			}
    		}
    	};

    	return [
    		active,
    		use,
    		className,
    		type,
    		transition,
    		content$use,
    		content$class,
    		element,
    		content,
    		internalClasses,
    		contentStyles,
    		forwardEvents,
    		$$restProps,
    		activate,
    		deactivate,
    		computeContentClientRect,
    		getElement,
    		instance,
    		changeSets,
    		oldTransition,
    		$$scope,
    		slots,
    		span0_binding,
    		span1_binding
    	];
    }

    class TabIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1$3, create_fragment$4, safe_not_equal, {
    			use: 1,
    			class: 2,
    			active: 0,
    			type: 3,
    			transition: 4,
    			content$use: 5,
    			content$class: 6,
    			activate: 13,
    			deactivate: 14,
    			computeContentClientRect: 15,
    			getElement: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabIndicator",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get use() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$use() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$use(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$class() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$class(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activate() {
    		return this.$$.ctx[13];
    	}

    	set activate(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deactivate() {
    		return this.$$.ctx[14];
    	}

    	set deactivate(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get computeContentClientRect() {
    		return this.$$.ctx[15];
    	}

    	set computeContentClientRect(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[16];
    	}

    	set getElement(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/tab/Tab.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1 } = globals;
    const file$3 = "node_modules/@smui/tab/Tab.svelte";
    const get_tab_indicator_slot_changes_1 = dirty => ({});
    const get_tab_indicator_slot_context_1 = ctx => ({});
    const get_tab_indicator_slot_changes = dirty => ({});
    const get_tab_indicator_slot_context = ctx => ({});

    // (48:4) {#if indicatorSpanOnlyContent}
    function create_if_block_1(ctx) {
    	let tabindicator;
    	let current;

    	const tabindicator_spread_levels = [
    		{ active: /*active*/ ctx[18] },
    		prefixFilter(/*$$restProps*/ ctx[24], "tabIndicator$")
    	];

    	let tabindicator_props = {
    		$$slots: { default: [create_default_slot_2$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tabindicator_spread_levels.length; i += 1) {
    		tabindicator_props = assign(tabindicator_props, tabindicator_spread_levels[i]);
    	}

    	tabindicator = new TabIndicator({
    			props: tabindicator_props,
    			$$inline: true
    		});

    	/*tabindicator_binding*/ ctx[31](tabindicator);

    	const block = {
    		c: function create() {
    			create_component(tabindicator.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabindicator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabindicator_changes = (dirty[0] & /*active, $$restProps*/ 17039360)
    			? get_spread_update(tabindicator_spread_levels, [
    					dirty[0] & /*active*/ 262144 && { active: /*active*/ ctx[18] },
    					dirty[0] & /*$$restProps*/ 16777216 && get_spread_object(prefixFilter(/*$$restProps*/ ctx[24], "tabIndicator$"))
    				])
    			: {};

    			if (dirty[1] & /*$$scope*/ 16) {
    				tabindicator_changes.$$scope = { dirty, ctx };
    			}

    			tabindicator.$set(tabindicator_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabindicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabindicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*tabindicator_binding*/ ctx[31](null);
    			destroy_component(tabindicator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(48:4) {#if indicatorSpanOnlyContent}",
    		ctx
    	});

    	return block;
    }

    // (49:6) <TabIndicator         bind:this={tabIndicator}         {active}         {...prefixFilter($$restProps, 'tabIndicator$')}         >
    function create_default_slot_2$1(ctx) {
    	let current;
    	const tab_indicator_slot_template = /*#slots*/ ctx[30]["tab-indicator"];
    	const tab_indicator_slot = create_slot(tab_indicator_slot_template, ctx, /*$$scope*/ ctx[35], get_tab_indicator_slot_context);

    	const block = {
    		c: function create() {
    			if (tab_indicator_slot) tab_indicator_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (tab_indicator_slot) {
    				tab_indicator_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tab_indicator_slot) {
    				if (tab_indicator_slot.p && (!current || dirty[1] & /*$$scope*/ 16)) {
    					update_slot(tab_indicator_slot, tab_indicator_slot_template, ctx, /*$$scope*/ ctx[35], dirty, get_tab_indicator_slot_changes, get_tab_indicator_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab_indicator_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab_indicator_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tab_indicator_slot) tab_indicator_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(49:6) <TabIndicator         bind:this={tabIndicator}         {active}         {...prefixFilter($$restProps, 'tabIndicator$')}         >",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#if !indicatorSpanOnlyContent}
    function create_if_block(ctx) {
    	let tabindicator;
    	let current;

    	const tabindicator_spread_levels = [
    		{ active: /*active*/ ctx[18] },
    		prefixFilter(/*$$restProps*/ ctx[24], "tabIndicator$")
    	];

    	let tabindicator_props = {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tabindicator_spread_levels.length; i += 1) {
    		tabindicator_props = assign(tabindicator_props, tabindicator_spread_levels[i]);
    	}

    	tabindicator = new TabIndicator({
    			props: tabindicator_props,
    			$$inline: true
    		});

    	/*tabindicator_binding_1*/ ctx[33](tabindicator);

    	const block = {
    		c: function create() {
    			create_component(tabindicator.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabindicator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabindicator_changes = (dirty[0] & /*active, $$restProps*/ 17039360)
    			? get_spread_update(tabindicator_spread_levels, [
    					dirty[0] & /*active*/ 262144 && { active: /*active*/ ctx[18] },
    					dirty[0] & /*$$restProps*/ 16777216 && get_spread_object(prefixFilter(/*$$restProps*/ ctx[24], "tabIndicator$"))
    				])
    			: {};

    			if (dirty[1] & /*$$scope*/ 16) {
    				tabindicator_changes.$$scope = { dirty, ctx };
    			}

    			tabindicator.$set(tabindicator_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabindicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabindicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*tabindicator_binding_1*/ ctx[33](null);
    			destroy_component(tabindicator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(57:2) {#if !indicatorSpanOnlyContent}",
    		ctx
    	});

    	return block;
    }

    // (58:4) <TabIndicator       bind:this={tabIndicator}       {active}       {...prefixFilter($$restProps, 'tabIndicator$')}       >
    function create_default_slot_1$1(ctx) {
    	let current;
    	const tab_indicator_slot_template = /*#slots*/ ctx[30]["tab-indicator"];
    	const tab_indicator_slot = create_slot(tab_indicator_slot_template, ctx, /*$$scope*/ ctx[35], get_tab_indicator_slot_context_1);

    	const block = {
    		c: function create() {
    			if (tab_indicator_slot) tab_indicator_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (tab_indicator_slot) {
    				tab_indicator_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tab_indicator_slot) {
    				if (tab_indicator_slot.p && (!current || dirty[1] & /*$$scope*/ 16)) {
    					update_slot(tab_indicator_slot, tab_indicator_slot_template, ctx, /*$$scope*/ ctx[35], dirty, get_tab_indicator_slot_changes_1, get_tab_indicator_slot_context_1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab_indicator_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab_indicator_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tab_indicator_slot) tab_indicator_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(58:4) <TabIndicator       bind:this={tabIndicator}       {active}       {...prefixFilter($$restProps, 'tabIndicator$')}       >",
    		ctx
    	});

    	return block;
    }

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: false,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-tab': true,     'mdc-tab--active': active,     'mdc-tab--stacked': stacked,     'mdc-tab--min-width': minWidth,     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   role="tab"   aria-selected={active ? 'true' : 'false'}   tabindex={active || forceAccessible ? '0' : '-1'}   {href}   on:click={instance && instance.handleClick()}   {...internalAttrs}   {...exclude($$restProps, ['content$', 'tabIndicator$'])} >
    function create_default_slot$2(ctx) {
    	let span0;
    	let t0;
    	let span0_class_value;
    	let useActions_action;
    	let t1;
    	let t2;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[35], null);
    	let if_block0 = /*indicatorSpanOnlyContent*/ ctx[6] && create_if_block_1(ctx);

    	let span0_levels = [
    		{
    			class: span0_class_value = classMap({
    				[/*content$class*/ ctx[9]]: true,
    				"mdc-tab__content": true
    			})
    		},
    		prefixFilter(/*$$restProps*/ ctx[24], "content$")
    	];

    	let span0_data = {};

    	for (let i = 0; i < span0_levels.length; i += 1) {
    		span0_data = assign(span0_data, span0_levels[i]);
    	}

    	let if_block1 = !/*indicatorSpanOnlyContent*/ ctx[6] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			span1 = element("span");
    			set_attributes(span0, span0_data);
    			add_location(span0, file$3, 37, 2, 818);
    			attr_dev(span1, "class", "mdc-tab__ripple");
    			add_location(span1, file$3, 64, 2, 1497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);

    			if (default_slot) {
    				default_slot.m(span0, null);
    			}

    			append_dev(span0, t0);
    			if (if_block0) if_block0.m(span0, null);
    			/*span0_binding*/ ctx[32](span0);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(useActions_action = useActions.call(null, span0, /*content$use*/ ctx[8]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[35], dirty, null, null);
    				}
    			}

    			if (/*indicatorSpanOnlyContent*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*indicatorSpanOnlyContent*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(span0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			set_attributes(span0, span0_data = get_spread_update(span0_levels, [
    				(!current || dirty[0] & /*content$class*/ 512 && span0_class_value !== (span0_class_value = classMap({
    					[/*content$class*/ ctx[9]]: true,
    					"mdc-tab__content": true
    				}))) && { class: span0_class_value },
    				dirty[0] & /*$$restProps*/ 16777216 && prefixFilter(/*$$restProps*/ ctx[24], "content$")
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*content$use*/ 256) useActions_action.update.call(null, /*content$use*/ ctx[8]);

    			if (!/*indicatorSpanOnlyContent*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*indicatorSpanOnlyContent*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			/*span0_binding*/ ctx[32](null);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: false,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-tab': true,     'mdc-tab--active': active,     'mdc-tab--stacked': stacked,     'mdc-tab--min-width': minWidth,     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   role=\\\"tab\\\"   aria-selected={active ? 'true' : 'false'}   tabindex={active || forceAccessible ? '0' : '-1'}   {href}   on:click={instance && instance.handleClick()}   {...internalAttrs}   {...exclude($$restProps, ['content$', 'tabIndicator$'])} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [
    				[
    					Ripple,
    					{
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						addClass: /*addClass*/ ctx[21],
    						removeClass: /*removeClass*/ ctx[22],
    						addStyle: /*addStyle*/ ctx[23]
    					}
    				],
    				/*forwardEvents*/ ctx[20],
    				.../*use*/ ctx[0]
    			]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-tab": true,
    				"mdc-tab--active": /*active*/ ctx[18],
    				"mdc-tab--stacked": /*stacked*/ ctx[4],
    				"mdc-tab--min-width": /*minWidth*/ ctx[5],
    				.../*internalClasses*/ ctx[15]
    			})
    		},
    		{
    			style: Object.entries(/*internalStyles*/ ctx[16]).map(func$1).concat([/*style*/ ctx[2]]).join(" ")
    		},
    		{ role: "tab" },
    		{
    			"aria-selected": /*active*/ ctx[18] ? "true" : "false"
    		},
    		{
    			tabindex: /*active*/ ctx[18] || /*forceAccessible*/ ctx[19]
    			? "0"
    			: "-1"
    		},
    		{ href: /*href*/ ctx[7] },
    		/*internalAttrs*/ ctx[17],
    		exclude(/*$$restProps*/ ctx[24], ["content$", "tabIndicator$"])
    	];

    	var switch_value = /*component*/ ctx[10];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$2] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[34](switch_instance);

    		switch_instance.$on("click", function () {
    			if (is_function(/*instance*/ ctx[11] && /*instance*/ ctx[11].handleClick())) (/*instance*/ ctx[11] && /*instance*/ ctx[11].handleClick()).apply(this, arguments);
    		});
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const switch_instance_changes = (dirty[0] & /*ripple, addClass, removeClass, addStyle, forwardEvents, use, className, active, stacked, minWidth, internalClasses, internalStyles, style, forceAccessible, href, internalAttrs, $$restProps*/ 33521855)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*ripple, addClass, removeClass, addStyle, forwardEvents, use*/ 15728649 && {
    						use: [
    							[
    								Ripple,
    								{
    									ripple: /*ripple*/ ctx[3],
    									unbounded: false,
    									addClass: /*addClass*/ ctx[21],
    									removeClass: /*removeClass*/ ctx[22],
    									addStyle: /*addStyle*/ ctx[23]
    								}
    							],
    							/*forwardEvents*/ ctx[20],
    							.../*use*/ ctx[0]
    						]
    					},
    					dirty[0] & /*className, active, stacked, minWidth, internalClasses*/ 294962 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							"mdc-tab": true,
    							"mdc-tab--active": /*active*/ ctx[18],
    							"mdc-tab--stacked": /*stacked*/ ctx[4],
    							"mdc-tab--min-width": /*minWidth*/ ctx[5],
    							.../*internalClasses*/ ctx[15]
    						})
    					},
    					dirty[0] & /*internalStyles, style*/ 65540 && {
    						style: Object.entries(/*internalStyles*/ ctx[16]).map(func$1).concat([/*style*/ ctx[2]]).join(" ")
    					},
    					switch_instance_spread_levels[3],
    					dirty[0] & /*active*/ 262144 && {
    						"aria-selected": /*active*/ ctx[18] ? "true" : "false"
    					},
    					dirty[0] & /*active, forceAccessible*/ 786432 && {
    						tabindex: /*active*/ ctx[18] || /*forceAccessible*/ ctx[19]
    						? "0"
    						: "-1"
    					},
    					dirty[0] & /*href*/ 128 && { href: /*href*/ ctx[7] },
    					dirty[0] & /*internalAttrs*/ 131072 && get_spread_object(/*internalAttrs*/ ctx[17]),
    					dirty[0] & /*$$restProps*/ 16777216 && get_spread_object(exclude(/*$$restProps*/ ctx[24], ["content$", "tabIndicator$"]))
    				])
    			: {};

    			if (dirty[0] & /*active, $$restProps, tabIndicator, indicatorSpanOnlyContent, content$class, content, content$use*/ 17064768 | dirty[1] & /*$$scope*/ 16) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[10])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[34](switch_instance);

    					switch_instance.$on("click", function () {
    						if (is_function(/*instance*/ ctx[11] && /*instance*/ ctx[11].handleClick())) (/*instance*/ ctx[11] && /*instance*/ ctx[11].handleClick()).apply(this, arguments);
    					});

    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[34](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
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

    const func$1 = ([name, value]) => `${name}: ${value};`;

    function instance_1$2($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","tab","ripple","stacked","minWidth","indicatorSpanOnlyContent","href","content$use","content$class","component","activate","deactivate","focus","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default','tab-indicator']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { style = "" } = $$props;
    	let { tab: tabId } = $$props;
    	let { ripple = true } = $$props;
    	let { stacked = false } = $$props;
    	let { minWidth = false } = $$props;
    	let { indicatorSpanOnlyContent = false } = $$props;
    	let { href = null } = $$props;
    	let { content$use = [] } = $$props;
    	let { content$class = "" } = $$props;
    	let element;
    	let instance;
    	let content;
    	let tabIndicator;
    	let internalClasses = {};
    	let internalStyles = {};
    	let internalAttrs = {};
    	let focusOnActivate = getContext("SMUI:tab:focusOnActivate");
    	let active = tabId === getContext("SMUI:tab:initialActive");
    	let forceAccessible = false;
    	let { component = href == null ? Button : A } = $$props;
    	setContext("SMUI:label:context", "tab");
    	setContext("SMUI:icon:context", "tab");

    	if (!tabId) {
    		throw new Error("The tab property is required! It should be passed down from the TabBar to the Tab.");
    	}

    	onMount(() => {
    		$$invalidate(11, instance = new MDCTabFoundation({
    				setAttr: addAttr,
    				addClass,
    				removeClass,
    				hasClass,
    				activateIndicator: previousIndicatorClientRect => tabIndicator.activate(previousIndicatorClientRect),
    				deactivateIndicator: () => tabIndicator.deactivate(),
    				notifyInteracted: () => dispatch(getElement(), "MDCTab:interacted", { tabId }),
    				getOffsetLeft: () => getElement().offsetLeft,
    				getOffsetWidth: () => getElement().offsetWidth,
    				getContentOffsetLeft: () => content.offsetLeft,
    				getContentOffsetWidth: () => content.offsetWidth,
    				focus
    			}));

    		const accessor = {
    			tabId,
    			get element() {
    				return getElement();
    			},
    			get active() {
    				return active;
    			},
    			forceAccessible(accessible) {
    				$$invalidate(19, forceAccessible = accessible);
    			},
    			computeIndicatorClientRect: () => tabIndicator.computeContentClientRect(),
    			computeDimensions: () => instance.computeDimensions(),
    			focus,
    			activate,
    			deactivate
    		};

    		dispatch(getElement(), "SMUI:tab:mount", accessor);
    		instance.init();

    		return () => {
    			dispatch(getElement(), "SMUI:tab:unmount", accessor);
    			instance.destroy();
    		};
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(15, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(15, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete internalStyles[name];
    				$$invalidate(16, internalStyles);
    			} else {
    				$$invalidate(16, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function addAttr(name, value) {
    		if (internalAttrs[name] !== value) {
    			$$invalidate(17, internalAttrs[name] = value, internalAttrs);
    		}
    	}

    	function activate(previousIndicatorClientRect, skipFocus) {
    		$$invalidate(18, active = true);

    		if (skipFocus) {
    			instance.setFocusOnActivate(false);
    		}

    		instance.activate(previousIndicatorClientRect);

    		if (skipFocus) {
    			instance.setFocusOnActivate(focusOnActivate);
    		}
    	}

    	function deactivate() {
    		$$invalidate(18, active = false);
    		instance.deactivate();
    	}

    	function focus() {
    		getElement().focus();
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function tabindicator_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tabIndicator = $$value;
    			$$invalidate(14, tabIndicator);
    		});
    	}

    	function span0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			content = $$value;
    			$$invalidate(13, content);
    		});
    	}

    	function tabindicator_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tabIndicator = $$value;
    			$$invalidate(14, tabIndicator);
    		});
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(12, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(24, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("style" in $$new_props) $$invalidate(2, style = $$new_props.style);
    		if ("tab" in $$new_props) $$invalidate(25, tabId = $$new_props.tab);
    		if ("ripple" in $$new_props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("stacked" in $$new_props) $$invalidate(4, stacked = $$new_props.stacked);
    		if ("minWidth" in $$new_props) $$invalidate(5, minWidth = $$new_props.minWidth);
    		if ("indicatorSpanOnlyContent" in $$new_props) $$invalidate(6, indicatorSpanOnlyContent = $$new_props.indicatorSpanOnlyContent);
    		if ("href" in $$new_props) $$invalidate(7, href = $$new_props.href);
    		if ("content$use" in $$new_props) $$invalidate(8, content$use = $$new_props.content$use);
    		if ("content$class" in $$new_props) $$invalidate(9, content$class = $$new_props.content$class);
    		if ("component" in $$new_props) $$invalidate(10, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(35, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTabFoundation,
    		onMount,
    		setContext,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		exclude,
    		prefixFilter,
    		useActions,
    		dispatch,
    		Ripple,
    		A,
    		Button,
    		TabIndicator,
    		forwardEvents,
    		use,
    		className,
    		style,
    		tabId,
    		ripple,
    		stacked,
    		minWidth,
    		indicatorSpanOnlyContent,
    		href,
    		content$use,
    		content$class,
    		element,
    		instance,
    		content,
    		tabIndicator,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		focusOnActivate,
    		active,
    		forceAccessible,
    		component,
    		hasClass,
    		addClass,
    		removeClass,
    		addStyle,
    		addAttr,
    		activate,
    		deactivate,
    		focus,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("style" in $$props) $$invalidate(2, style = $$new_props.style);
    		if ("tabId" in $$props) $$invalidate(25, tabId = $$new_props.tabId);
    		if ("ripple" in $$props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("stacked" in $$props) $$invalidate(4, stacked = $$new_props.stacked);
    		if ("minWidth" in $$props) $$invalidate(5, minWidth = $$new_props.minWidth);
    		if ("indicatorSpanOnlyContent" in $$props) $$invalidate(6, indicatorSpanOnlyContent = $$new_props.indicatorSpanOnlyContent);
    		if ("href" in $$props) $$invalidate(7, href = $$new_props.href);
    		if ("content$use" in $$props) $$invalidate(8, content$use = $$new_props.content$use);
    		if ("content$class" in $$props) $$invalidate(9, content$class = $$new_props.content$class);
    		if ("element" in $$props) $$invalidate(12, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(11, instance = $$new_props.instance);
    		if ("content" in $$props) $$invalidate(13, content = $$new_props.content);
    		if ("tabIndicator" in $$props) $$invalidate(14, tabIndicator = $$new_props.tabIndicator);
    		if ("internalClasses" in $$props) $$invalidate(15, internalClasses = $$new_props.internalClasses);
    		if ("internalStyles" in $$props) $$invalidate(16, internalStyles = $$new_props.internalStyles);
    		if ("internalAttrs" in $$props) $$invalidate(17, internalAttrs = $$new_props.internalAttrs);
    		if ("focusOnActivate" in $$props) $$invalidate(36, focusOnActivate = $$new_props.focusOnActivate);
    		if ("active" in $$props) $$invalidate(18, active = $$new_props.active);
    		if ("forceAccessible" in $$props) $$invalidate(19, forceAccessible = $$new_props.forceAccessible);
    		if ("component" in $$props) $$invalidate(10, component = $$new_props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*instance*/ 2048) {
    			if (instance) {
    				instance.setFocusOnActivate(focusOnActivate);
    			}
    		}
    	};

    	return [
    		use,
    		className,
    		style,
    		ripple,
    		stacked,
    		minWidth,
    		indicatorSpanOnlyContent,
    		href,
    		content$use,
    		content$class,
    		component,
    		instance,
    		element,
    		content,
    		tabIndicator,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		active,
    		forceAccessible,
    		forwardEvents,
    		addClass,
    		removeClass,
    		addStyle,
    		$$restProps,
    		tabId,
    		activate,
    		deactivate,
    		focus,
    		getElement,
    		slots,
    		tabindicator_binding,
    		span0_binding,
    		tabindicator_binding_1,
    		switch_instance_binding,
    		$$scope
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$2,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				style: 2,
    				tab: 25,
    				ripple: 3,
    				stacked: 4,
    				minWidth: 5,
    				indicatorSpanOnlyContent: 6,
    				href: 7,
    				content$use: 8,
    				content$class: 9,
    				component: 10,
    				activate: 26,
    				deactivate: 27,
    				focus: 28,
    				getElement: 29
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tabId*/ ctx[25] === undefined && !("tab" in props)) {
    			console.warn("<Tab> was created without expected prop 'tab'");
    		}
    	}

    	get use() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tab() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tab(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stacked() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stacked(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indicatorSpanOnlyContent() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indicatorSpanOnlyContent(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$use() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$use(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$class() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$class(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activate() {
    		return this.$$.ctx[26];
    	}

    	set activate(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deactivate() {
    		return this.$$.ctx[27];
    	}

    	set deactivate(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		return this.$$.ctx[28];
    	}

    	set focus(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[29];
    	}

    	set getElement(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses = {
        ANIMATING: 'mdc-tab-scroller--animating',
        SCROLL_AREA_SCROLL: 'mdc-tab-scroller__scroll-area--scroll',
        SCROLL_TEST: 'mdc-tab-scroller__test',
    };
    var strings$1 = {
        AREA_SELECTOR: '.mdc-tab-scroller__scroll-area',
        CONTENT_SELECTOR: '.mdc-tab-scroller__scroll-content',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTL = /** @class */ (function () {
        function MDCTabScrollerRTL(adapter) {
            this.adapter = adapter;
        }
        return MDCTabScrollerRTL;
    }());

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLDefault = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLDefault, _super);
        function MDCTabScrollerRTLDefault() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLDefault.prototype.getScrollPositionRTL = function () {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var right = this.calculateScrollEdges_().right;
            // Scroll values on most browsers are ints instead of floats so we round
            return Math.round(right - currentScrollLeft);
        };
        MDCTabScrollerRTLDefault.prototype.scrollToRTL = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(edges.right - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLDefault.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLDefault.prototype.getAnimatingScrollPosition = function (scrollX) {
            return scrollX;
        };
        MDCTabScrollerRTLDefault.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: 0,
                right: contentWidth - rootWidth,
            };
        };
        MDCTabScrollerRTLDefault.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.left, scrollX), edges.right);
        };
        return MDCTabScrollerRTLDefault;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLNegative = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLNegative, _super);
        function MDCTabScrollerRTLNegative() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLNegative.prototype.getScrollPositionRTL = function (translateX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            return Math.round(translateX - currentScrollLeft);
        };
        MDCTabScrollerRTLNegative.prototype.scrollToRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(-scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLNegative.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLNegative.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
            return scrollX - translateX;
        };
        MDCTabScrollerRTLNegative.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: rootWidth - contentWidth,
                right: 0,
            };
        };
        MDCTabScrollerRTLNegative.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.max(Math.min(edges.right, scrollX), edges.left);
        };
        return MDCTabScrollerRTLNegative;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLReverse = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLReverse, _super);
        function MDCTabScrollerRTLReverse() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLReverse.prototype.getScrollPositionRTL = function (translateX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            // Scroll values on most browsers are ints instead of floats so we round
            return Math.round(currentScrollLeft - translateX);
        };
        MDCTabScrollerRTLReverse.prototype.scrollToRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: currentScrollLeft - clampedScrollLeft,
            };
        };
        MDCTabScrollerRTLReverse.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft + scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: currentScrollLeft - clampedScrollLeft,
            };
        };
        MDCTabScrollerRTLReverse.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
            return scrollX + translateX;
        };
        MDCTabScrollerRTLReverse.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: contentWidth - rootWidth,
                right: 0,
            };
        };
        MDCTabScrollerRTLReverse.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.right, scrollX), edges.left);
        };
        return MDCTabScrollerRTLReverse;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerFoundation = /** @class */ (function (_super) {
        __extends(MDCTabScrollerFoundation, _super);
        function MDCTabScrollerFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCTabScrollerFoundation.defaultAdapter), adapter)) || this;
            /**
             * Controls whether we should handle the transitionend and interaction events during the animation.
             */
            _this.isAnimating_ = false;
            return _this;
        }
        Object.defineProperty(MDCTabScrollerFoundation, "cssClasses", {
            get: function () {
                return cssClasses;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabScrollerFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabScrollerFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    eventTargetMatchesSelector: function () { return false; },
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    addScrollAreaClass: function () { return undefined; },
                    setScrollAreaStyleProperty: function () { return undefined; },
                    setScrollContentStyleProperty: function () { return undefined; },
                    getScrollContentStyleValue: function () { return ''; },
                    setScrollAreaScrollLeft: function () { return undefined; },
                    getScrollAreaScrollLeft: function () { return 0; },
                    getScrollContentOffsetWidth: function () { return 0; },
                    getScrollAreaOffsetWidth: function () { return 0; },
                    computeScrollAreaClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    computeScrollContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    computeHorizontalScrollbarHeight: function () { return 0; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCTabScrollerFoundation.prototype.init = function () {
            // Compute horizontal scrollbar height on scroller with overflow initially hidden, then update overflow to scroll
            // and immediately adjust bottom margin to avoid the scrollbar initially appearing before JS runs.
            var horizontalScrollbarHeight = this.adapter.computeHorizontalScrollbarHeight();
            this.adapter.setScrollAreaStyleProperty('margin-bottom', -horizontalScrollbarHeight + 'px');
            this.adapter.addScrollAreaClass(MDCTabScrollerFoundation.cssClasses.SCROLL_AREA_SCROLL);
        };
        /**
         * Computes the current visual scroll position
         */
        MDCTabScrollerFoundation.prototype.getScrollPosition = function () {
            if (this.isRTL_()) {
                return this.computeCurrentScrollPositionRTL_();
            }
            var currentTranslateX = this.calculateCurrentTranslateX_();
            var scrollLeft = this.adapter.getScrollAreaScrollLeft();
            return scrollLeft - currentTranslateX;
        };
        /**
         * Handles interaction events that occur during transition
         */
        MDCTabScrollerFoundation.prototype.handleInteraction = function () {
            // Early exit if we aren't animating
            if (!this.isAnimating_) {
                return;
            }
            // Prevent other event listeners from handling this event
            this.stopScrollAnimation_();
        };
        /**
         * Handles the transitionend event
         */
        MDCTabScrollerFoundation.prototype.handleTransitionEnd = function (evt) {
            // Early exit if we aren't animating or the event was triggered by a different element.
            var evtTarget = evt.target;
            if (!this.isAnimating_ ||
                !this.adapter.eventTargetMatchesSelector(evtTarget, MDCTabScrollerFoundation.strings.CONTENT_SELECTOR)) {
                return;
            }
            this.isAnimating_ = false;
            this.adapter.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
        };
        /**
         * Increment the scroll value by the scrollXIncrement using animation.
         * @param scrollXIncrement The value by which to increment the scroll position
         */
        MDCTabScrollerFoundation.prototype.incrementScroll = function (scrollXIncrement) {
            // Early exit for non-operational increment values
            if (scrollXIncrement === 0) {
                return;
            }
            this.animate_(this.getIncrementScrollOperation_(scrollXIncrement));
        };
        /**
         * Increment the scroll value by the scrollXIncrement without animation.
         * @param scrollXIncrement The value by which to increment the scroll position
         */
        MDCTabScrollerFoundation.prototype.incrementScrollImmediate = function (scrollXIncrement) {
            // Early exit for non-operational increment values
            if (scrollXIncrement === 0) {
                return;
            }
            var operation = this.getIncrementScrollOperation_(scrollXIncrement);
            if (operation.scrollDelta === 0) {
                return;
            }
            this.stopScrollAnimation_();
            this.adapter.setScrollAreaScrollLeft(operation.finalScrollPosition);
        };
        /**
         * Scrolls to the given scrollX value
         */
        MDCTabScrollerFoundation.prototype.scrollTo = function (scrollX) {
            if (this.isRTL_()) {
                return this.scrollToRTL_(scrollX);
            }
            this.scrollTo_(scrollX);
        };
        /**
         * @return Browser-specific {@link MDCTabScrollerRTL} instance.
         */
        MDCTabScrollerFoundation.prototype.getRTLScroller = function () {
            if (!this.rtlScrollerInstance_) {
                this.rtlScrollerInstance_ = this.rtlScrollerFactory_();
            }
            return this.rtlScrollerInstance_;
        };
        /**
         * @return translateX value from a CSS matrix transform function string.
         */
        MDCTabScrollerFoundation.prototype.calculateCurrentTranslateX_ = function () {
            var transformValue = this.adapter.getScrollContentStyleValue('transform');
            // Early exit if no transform is present
            if (transformValue === 'none') {
                return 0;
            }
            // The transform value comes back as a matrix transformation in the form
            // of `matrix(a, b, c, d, tx, ty)`. We only care about tx (translateX) so
            // we're going to grab all the parenthesized values, strip out tx, and
            // parse it.
            var match = /\((.+?)\)/.exec(transformValue);
            if (!match) {
                return 0;
            }
            var matrixParams = match[1];
            // tslint:disable-next-line:ban-ts-ignore "Unused vars" should be a linter warning, not a compiler error.
            // @ts-ignore These unused variables should retain their semantic names for clarity.
            var _a = __read(matrixParams.split(','), 6); _a[0]; _a[1]; _a[2]; _a[3]; var tx = _a[4]; _a[5];
            return parseFloat(tx); // tslint:disable-line:ban
        };
        /**
         * Calculates a safe scroll value that is > 0 and < the max scroll value
         * @param scrollX The distance to scroll
         */
        MDCTabScrollerFoundation.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.left, scrollX), edges.right);
        };
        MDCTabScrollerFoundation.prototype.computeCurrentScrollPositionRTL_ = function () {
            var translateX = this.calculateCurrentTranslateX_();
            return this.getRTLScroller().getScrollPositionRTL(translateX);
        };
        MDCTabScrollerFoundation.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: 0,
                right: contentWidth - rootWidth,
            };
        };
        /**
         * Internal scroll method
         * @param scrollX The new scroll position
         */
        MDCTabScrollerFoundation.prototype.scrollTo_ = function (scrollX) {
            var currentScrollX = this.getScrollPosition();
            var safeScrollX = this.clampScrollValue_(scrollX);
            var scrollDelta = safeScrollX - currentScrollX;
            this.animate_({
                finalScrollPosition: safeScrollX,
                scrollDelta: scrollDelta,
            });
        };
        /**
         * Internal RTL scroll method
         * @param scrollX The new scroll position
         */
        MDCTabScrollerFoundation.prototype.scrollToRTL_ = function (scrollX) {
            var animation = this.getRTLScroller().scrollToRTL(scrollX);
            this.animate_(animation);
        };
        /**
         * Internal method to compute the increment scroll operation values.
         * @param scrollX The desired scroll position increment
         * @return MDCTabScrollerAnimation with the sanitized values for performing the scroll operation.
         */
        MDCTabScrollerFoundation.prototype.getIncrementScrollOperation_ = function (scrollX) {
            if (this.isRTL_()) {
                return this.getRTLScroller().incrementScrollRTL(scrollX);
            }
            var currentScrollX = this.getScrollPosition();
            var targetScrollX = scrollX + currentScrollX;
            var safeScrollX = this.clampScrollValue_(targetScrollX);
            var scrollDelta = safeScrollX - currentScrollX;
            return {
                finalScrollPosition: safeScrollX,
                scrollDelta: scrollDelta,
            };
        };
        /**
         * Animates the tab scrolling
         * @param animation The animation to apply
         */
        MDCTabScrollerFoundation.prototype.animate_ = function (animation) {
            var _this = this;
            // Early exit if translateX is 0, which means there's no animation to perform
            if (animation.scrollDelta === 0) {
                return;
            }
            this.stopScrollAnimation_();
            // This animation uses the FLIP approach.
            // Read more here: https://aerotwist.com/blog/flip-your-animations/
            this.adapter.setScrollAreaScrollLeft(animation.finalScrollPosition);
            this.adapter.setScrollContentStyleProperty('transform', "translateX(" + animation.scrollDelta + "px)");
            // Force repaint
            this.adapter.computeScrollAreaClientRect();
            requestAnimationFrame(function () {
                _this.adapter.addClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
                _this.adapter.setScrollContentStyleProperty('transform', 'none');
            });
            this.isAnimating_ = true;
        };
        /**
         * Stops scroll animation
         */
        MDCTabScrollerFoundation.prototype.stopScrollAnimation_ = function () {
            this.isAnimating_ = false;
            var currentScrollPosition = this.getAnimatingScrollPosition_();
            this.adapter.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
            this.adapter.setScrollContentStyleProperty('transform', 'translateX(0px)');
            this.adapter.setScrollAreaScrollLeft(currentScrollPosition);
        };
        /**
         * Gets the current scroll position during animation
         */
        MDCTabScrollerFoundation.prototype.getAnimatingScrollPosition_ = function () {
            var currentTranslateX = this.calculateCurrentTranslateX_();
            var scrollLeft = this.adapter.getScrollAreaScrollLeft();
            if (this.isRTL_()) {
                return this.getRTLScroller().getAnimatingScrollPosition(scrollLeft, currentTranslateX);
            }
            return scrollLeft - currentTranslateX;
        };
        /**
         * Determines the RTL Scroller to use
         */
        MDCTabScrollerFoundation.prototype.rtlScrollerFactory_ = function () {
            // Browsers have three different implementations of scrollLeft in RTL mode,
            // dependent on the browser. The behavior is based off the max LTR
            // scrollLeft value and 0.
            //
            // * Default scrolling in RTL *
            //    - Left-most value: 0
            //    - Right-most value: Max LTR scrollLeft value
            //
            // * Negative scrolling in RTL *
            //    - Left-most value: Negated max LTR scrollLeft value
            //    - Right-most value: 0
            //
            // * Reverse scrolling in RTL *
            //    - Left-most value: Max LTR scrollLeft value
            //    - Right-most value: 0
            //
            // We use those principles below to determine which RTL scrollLeft
            // behavior is implemented in the current browser.
            var initialScrollLeft = this.adapter.getScrollAreaScrollLeft();
            this.adapter.setScrollAreaScrollLeft(initialScrollLeft - 1);
            var newScrollLeft = this.adapter.getScrollAreaScrollLeft();
            // If the newScrollLeft value is negative,then we know that the browser has
            // implemented negative RTL scrolling, since all other implementations have
            // only positive values.
            if (newScrollLeft < 0) {
                // Undo the scrollLeft test check
                this.adapter.setScrollAreaScrollLeft(initialScrollLeft);
                return new MDCTabScrollerRTLNegative(this.adapter);
            }
            var rootClientRect = this.adapter.computeScrollAreaClientRect();
            var contentClientRect = this.adapter.computeScrollContentClientRect();
            var rightEdgeDelta = Math.round(contentClientRect.right - rootClientRect.right);
            // Undo the scrollLeft test check
            this.adapter.setScrollAreaScrollLeft(initialScrollLeft);
            // By calculating the clientRect of the root element and the clientRect of
            // the content element, we can determine how much the scroll value changed
            // when we performed the scrollLeft subtraction above.
            if (rightEdgeDelta === newScrollLeft) {
                return new MDCTabScrollerRTLReverse(this.adapter);
            }
            return new MDCTabScrollerRTLDefault(this.adapter);
        };
        MDCTabScrollerFoundation.prototype.isRTL_ = function () {
            return this.adapter.getScrollContentStyleValue('direction') === 'rtl';
        };
        return MDCTabScrollerFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Stores result from computeHorizontalScrollbarHeight to avoid redundant processing.
     */
    var horizontalScrollbarHeight_;
    /**
     * Computes the height of browser-rendered horizontal scrollbars using a self-created test element.
     * May return 0 (e.g. on OS X browsers under default configuration).
     */
    function computeHorizontalScrollbarHeight(documentObj, shouldCacheResult) {
        if (shouldCacheResult === void 0) { shouldCacheResult = true; }
        if (shouldCacheResult && typeof horizontalScrollbarHeight_ !== 'undefined') {
            return horizontalScrollbarHeight_;
        }
        var el = documentObj.createElement('div');
        el.classList.add(cssClasses.SCROLL_TEST);
        documentObj.body.appendChild(el);
        var horizontalScrollbarHeight = el.offsetHeight - el.clientHeight;
        documentObj.body.removeChild(el);
        if (shouldCacheResult) {
            horizontalScrollbarHeight_ = horizontalScrollbarHeight;
        }
        return horizontalScrollbarHeight;
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        computeHorizontalScrollbarHeight: computeHorizontalScrollbarHeight
    });

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings = {
        ARROW_LEFT_KEY: 'ArrowLeft',
        ARROW_RIGHT_KEY: 'ArrowRight',
        END_KEY: 'End',
        ENTER_KEY: 'Enter',
        HOME_KEY: 'Home',
        SPACE_KEY: 'Space',
        TAB_ACTIVATED_EVENT: 'MDCTabBar:activated',
        TAB_SCROLLER_SELECTOR: '.mdc-tab-scroller',
        TAB_SELECTOR: '.mdc-tab',
    };
    var numbers = {
        ARROW_LEFT_KEYCODE: 37,
        ARROW_RIGHT_KEYCODE: 39,
        END_KEYCODE: 35,
        ENTER_KEYCODE: 13,
        EXTRA_SCROLL_AMOUNT: 20,
        HOME_KEYCODE: 36,
        SPACE_KEYCODE: 32,
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ACCEPTABLE_KEYS = new Set();
    // IE11 has no support for new Set with iterable so we need to initialize this by hand
    ACCEPTABLE_KEYS.add(strings.ARROW_LEFT_KEY);
    ACCEPTABLE_KEYS.add(strings.ARROW_RIGHT_KEY);
    ACCEPTABLE_KEYS.add(strings.END_KEY);
    ACCEPTABLE_KEYS.add(strings.HOME_KEY);
    ACCEPTABLE_KEYS.add(strings.ENTER_KEY);
    ACCEPTABLE_KEYS.add(strings.SPACE_KEY);
    var KEYCODE_MAP = new Map();
    // IE11 has no support for new Map with iterable so we need to initialize this by hand
    KEYCODE_MAP.set(numbers.ARROW_LEFT_KEYCODE, strings.ARROW_LEFT_KEY);
    KEYCODE_MAP.set(numbers.ARROW_RIGHT_KEYCODE, strings.ARROW_RIGHT_KEY);
    KEYCODE_MAP.set(numbers.END_KEYCODE, strings.END_KEY);
    KEYCODE_MAP.set(numbers.HOME_KEYCODE, strings.HOME_KEY);
    KEYCODE_MAP.set(numbers.ENTER_KEYCODE, strings.ENTER_KEY);
    KEYCODE_MAP.set(numbers.SPACE_KEYCODE, strings.SPACE_KEY);
    var MDCTabBarFoundation = /** @class */ (function (_super) {
        __extends(MDCTabBarFoundation, _super);
        function MDCTabBarFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCTabBarFoundation.defaultAdapter), adapter)) || this;
            _this.useAutomaticActivation_ = false;
            return _this;
        }
        Object.defineProperty(MDCTabBarFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabBarFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTabBarFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    scrollTo: function () { return undefined; },
                    incrementScroll: function () { return undefined; },
                    getScrollPosition: function () { return 0; },
                    getScrollContentWidth: function () { return 0; },
                    getOffsetWidth: function () { return 0; },
                    isRTL: function () { return false; },
                    setActiveTab: function () { return undefined; },
                    activateTabAtIndex: function () { return undefined; },
                    deactivateTabAtIndex: function () { return undefined; },
                    focusTabAtIndex: function () { return undefined; },
                    getTabIndicatorClientRectAtIndex: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    getTabDimensionsAtIndex: function () { return ({ rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 }); },
                    getPreviousActiveTabIndex: function () { return -1; },
                    getFocusedTabIndex: function () { return -1; },
                    getIndexOfTabById: function () { return -1; },
                    getTabListLength: function () { return 0; },
                    notifyTabActivated: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Switches between automatic and manual activation modes.
         * See https://www.w3.org/TR/wai-aria-practices/#tabpanel for examples.
         */
        MDCTabBarFoundation.prototype.setUseAutomaticActivation = function (useAutomaticActivation) {
            this.useAutomaticActivation_ = useAutomaticActivation;
        };
        MDCTabBarFoundation.prototype.activateTab = function (index) {
            var previousActiveIndex = this.adapter.getPreviousActiveTabIndex();
            if (!this.indexIsInRange_(index) || index === previousActiveIndex) {
                return;
            }
            var previousClientRect;
            if (previousActiveIndex !== -1) {
                this.adapter.deactivateTabAtIndex(previousActiveIndex);
                previousClientRect =
                    this.adapter.getTabIndicatorClientRectAtIndex(previousActiveIndex);
            }
            this.adapter.activateTabAtIndex(index, previousClientRect);
            this.scrollIntoView(index);
            this.adapter.notifyTabActivated(index);
        };
        MDCTabBarFoundation.prototype.handleKeyDown = function (evt) {
            // Get the key from the event
            var key = this.getKeyFromEvent_(evt);
            // Early exit if the event key isn't one of the keyboard navigation keys
            if (key === undefined) {
                return;
            }
            // Prevent default behavior for movement keys, but not for activation keys, since :active is used to apply ripple
            if (!this.isActivationKey_(key)) {
                evt.preventDefault();
            }
            if (this.useAutomaticActivation_) {
                if (this.isActivationKey_(key)) {
                    return;
                }
                var index = this.determineTargetFromKey_(this.adapter.getPreviousActiveTabIndex(), key);
                this.adapter.setActiveTab(index);
                this.scrollIntoView(index);
            }
            else {
                var focusedTabIndex = this.adapter.getFocusedTabIndex();
                if (this.isActivationKey_(key)) {
                    this.adapter.setActiveTab(focusedTabIndex);
                }
                else {
                    var index = this.determineTargetFromKey_(focusedTabIndex, key);
                    this.adapter.focusTabAtIndex(index);
                    this.scrollIntoView(index);
                }
            }
        };
        /**
         * Handles the MDCTab:interacted event
         */
        MDCTabBarFoundation.prototype.handleTabInteraction = function (evt) {
            this.adapter.setActiveTab(this.adapter.getIndexOfTabById(evt.detail.tabId));
        };
        /**
         * Scrolls the tab at the given index into view
         * @param index The tab index to make visible
         */
        MDCTabBarFoundation.prototype.scrollIntoView = function (index) {
            // Early exit if the index is out of range
            if (!this.indexIsInRange_(index)) {
                return;
            }
            // Always scroll to 0 if scrolling to the 0th index
            if (index === 0) {
                return this.adapter.scrollTo(0);
            }
            // Always scroll to the max value if scrolling to the Nth index
            // MDCTabScroller.scrollTo() will never scroll past the max possible value
            if (index === this.adapter.getTabListLength() - 1) {
                return this.adapter.scrollTo(this.adapter.getScrollContentWidth());
            }
            if (this.isRTL_()) {
                return this.scrollIntoViewRTL_(index);
            }
            this.scrollIntoView_(index);
        };
        /**
         * Private method for determining the index of the destination tab based on what key was pressed
         * @param origin The original index from which to determine the destination
         * @param key The name of the key
         */
        MDCTabBarFoundation.prototype.determineTargetFromKey_ = function (origin, key) {
            var isRTL = this.isRTL_();
            var maxIndex = this.adapter.getTabListLength() - 1;
            var shouldGoToEnd = key === strings.END_KEY;
            var shouldDecrement = key === strings.ARROW_LEFT_KEY && !isRTL || key === strings.ARROW_RIGHT_KEY && isRTL;
            var shouldIncrement = key === strings.ARROW_RIGHT_KEY && !isRTL || key === strings.ARROW_LEFT_KEY && isRTL;
            var index = origin;
            if (shouldGoToEnd) {
                index = maxIndex;
            }
            else if (shouldDecrement) {
                index -= 1;
            }
            else if (shouldIncrement) {
                index += 1;
            }
            else {
                index = 0;
            }
            if (index < 0) {
                index = maxIndex;
            }
            else if (index > maxIndex) {
                index = 0;
            }
            return index;
        };
        /**
         * Calculates the scroll increment that will make the tab at the given index visible
         * @param index The index of the tab
         * @param nextIndex The index of the next tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the Tab Bar
         */
        MDCTabBarFoundation.prototype.calculateScrollIncrement_ = function (index, nextIndex, scrollPosition, barWidth) {
            var nextTabDimensions = this.adapter.getTabDimensionsAtIndex(nextIndex);
            var relativeContentLeft = nextTabDimensions.contentLeft - scrollPosition - barWidth;
            var relativeContentRight = nextTabDimensions.contentRight - scrollPosition;
            var leftIncrement = relativeContentRight - numbers.EXTRA_SCROLL_AMOUNT;
            var rightIncrement = relativeContentLeft + numbers.EXTRA_SCROLL_AMOUNT;
            if (nextIndex < index) {
                return Math.min(leftIncrement, 0);
            }
            return Math.max(rightIncrement, 0);
        };
        /**
         * Calculates the scroll increment that will make the tab at the given index visible in RTL
         * @param index The index of the tab
         * @param nextIndex The index of the next tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the Tab Bar
         * @param scrollContentWidth The width of the scroll content
         */
        MDCTabBarFoundation.prototype.calculateScrollIncrementRTL_ = function (index, nextIndex, scrollPosition, barWidth, scrollContentWidth) {
            var nextTabDimensions = this.adapter.getTabDimensionsAtIndex(nextIndex);
            var relativeContentLeft = scrollContentWidth - nextTabDimensions.contentLeft - scrollPosition;
            var relativeContentRight = scrollContentWidth - nextTabDimensions.contentRight - scrollPosition - barWidth;
            var leftIncrement = relativeContentRight + numbers.EXTRA_SCROLL_AMOUNT;
            var rightIncrement = relativeContentLeft - numbers.EXTRA_SCROLL_AMOUNT;
            if (nextIndex > index) {
                return Math.max(leftIncrement, 0);
            }
            return Math.min(rightIncrement, 0);
        };
        /**
         * Determines the index of the adjacent tab closest to either edge of the Tab Bar
         * @param index The index of the tab
         * @param tabDimensions The dimensions of the tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the tab bar
         */
        MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdge_ = function (index, tabDimensions, scrollPosition, barWidth) {
            /**
             * Tabs are laid out in the Tab Scroller like this:
             *
             *    Scroll Position
             *    +---+
             *    |   |   Bar Width
             *    |   +-----------------------------------+
             *    |   |                                   |
             *    |   V                                   V
             *    |   +-----------------------------------+
             *    V   |             Tab Scroller          |
             *    +------------+--------------+-------------------+
             *    |    Tab     |      Tab     |        Tab        |
             *    +------------+--------------+-------------------+
             *        |                                   |
             *        +-----------------------------------+
             *
             * To determine the next adjacent index, we look at the Tab root left and
             * Tab root right, both relative to the scroll position. If the Tab root
             * left is less than 0, then we know it's out of view to the left. If the
             * Tab root right minus the bar width is greater than 0, we know the Tab is
             * out of view to the right. From there, we either increment or decrement
             * the index.
             */
            var relativeRootLeft = tabDimensions.rootLeft - scrollPosition;
            var relativeRootRight = tabDimensions.rootRight - scrollPosition - barWidth;
            var relativeRootDelta = relativeRootLeft + relativeRootRight;
            var leftEdgeIsCloser = relativeRootLeft < 0 || relativeRootDelta < 0;
            var rightEdgeIsCloser = relativeRootRight > 0 || relativeRootDelta > 0;
            if (leftEdgeIsCloser) {
                return index - 1;
            }
            if (rightEdgeIsCloser) {
                return index + 1;
            }
            return -1;
        };
        /**
         * Determines the index of the adjacent tab closest to either edge of the Tab Bar in RTL
         * @param index The index of the tab
         * @param tabDimensions The dimensions of the tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the tab bar
         * @param scrollContentWidth The width of the scroller content
         */
        MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdgeRTL_ = function (index, tabDimensions, scrollPosition, barWidth, scrollContentWidth) {
            var rootLeft = scrollContentWidth - tabDimensions.rootLeft - barWidth - scrollPosition;
            var rootRight = scrollContentWidth - tabDimensions.rootRight - scrollPosition;
            var rootDelta = rootLeft + rootRight;
            var leftEdgeIsCloser = rootLeft > 0 || rootDelta > 0;
            var rightEdgeIsCloser = rootRight < 0 || rootDelta < 0;
            if (leftEdgeIsCloser) {
                return index + 1;
            }
            if (rightEdgeIsCloser) {
                return index - 1;
            }
            return -1;
        };
        /**
         * Returns the key associated with a keydown event
         * @param evt The keydown event
         */
        MDCTabBarFoundation.prototype.getKeyFromEvent_ = function (evt) {
            if (ACCEPTABLE_KEYS.has(evt.key)) {
                return evt.key;
            }
            return KEYCODE_MAP.get(evt.keyCode);
        };
        MDCTabBarFoundation.prototype.isActivationKey_ = function (key) {
            return key === strings.SPACE_KEY || key === strings.ENTER_KEY;
        };
        /**
         * Returns whether a given index is inclusively between the ends
         * @param index The index to test
         */
        MDCTabBarFoundation.prototype.indexIsInRange_ = function (index) {
            return index >= 0 && index < this.adapter.getTabListLength();
        };
        /**
         * Returns the view's RTL property
         */
        MDCTabBarFoundation.prototype.isRTL_ = function () {
            return this.adapter.isRTL();
        };
        /**
         * Scrolls the tab at the given index into view for left-to-right user agents.
         * @param index The index of the tab to scroll into view
         */
        MDCTabBarFoundation.prototype.scrollIntoView_ = function (index) {
            var scrollPosition = this.adapter.getScrollPosition();
            var barWidth = this.adapter.getOffsetWidth();
            var tabDimensions = this.adapter.getTabDimensionsAtIndex(index);
            var nextIndex = this.findAdjacentTabIndexClosestToEdge_(index, tabDimensions, scrollPosition, barWidth);
            if (!this.indexIsInRange_(nextIndex)) {
                return;
            }
            var scrollIncrement = this.calculateScrollIncrement_(index, nextIndex, scrollPosition, barWidth);
            this.adapter.incrementScroll(scrollIncrement);
        };
        /**
         * Scrolls the tab at the given index into view in RTL
         * @param index The tab index to make visible
         */
        MDCTabBarFoundation.prototype.scrollIntoViewRTL_ = function (index) {
            var scrollPosition = this.adapter.getScrollPosition();
            var barWidth = this.adapter.getOffsetWidth();
            var tabDimensions = this.adapter.getTabDimensionsAtIndex(index);
            var scrollWidth = this.adapter.getScrollContentWidth();
            var nextIndex = this.findAdjacentTabIndexClosestToEdgeRTL_(index, tabDimensions, scrollPosition, barWidth, scrollWidth);
            if (!this.indexIsInRange_(nextIndex)) {
                return;
            }
            var scrollIncrement = this.calculateScrollIncrementRTL_(index, nextIndex, scrollPosition, barWidth, scrollWidth);
            this.adapter.incrementScroll(scrollIncrement);
        };
        return MDCTabBarFoundation;
    }(MDCFoundation));

    /* node_modules/@smui/tab-scroller/TabScroller.svelte generated by Svelte v3.38.2 */

    const file$2 = "node_modules/@smui/tab-scroller/TabScroller.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div0_style_value;
    	let useActions_action;
    	let div1_class_value;
    	let div1_style_value;
    	let useActions_action_1;
    	let div2_class_value;
    	let useActions_action_2;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	let div0_levels = [
    		{
    			class: div0_class_value = classMap({
    				[/*scrollContent$class*/ ctx[6]]: true,
    				"mdc-tab-scroller__scroll-content": true
    			})
    		},
    		{
    			style: div0_style_value = Object.entries(/*scrollContentStyles*/ ctx[14]).map(func).join(" ")
    		},
    		prefixFilter(/*$$restProps*/ ctx[16], "scrollContent$")
    	];

    	let div0_data = {};

    	for (let i = 0; i < div0_levels.length; i += 1) {
    		div0_data = assign(div0_data, div0_levels[i]);
    	}

    	let div1_levels = [
    		{
    			class: div1_class_value = classMap({
    				[/*scrollArea$class*/ ctx[4]]: true,
    				"mdc-tab-scroller__scroll-area": true,
    				.../*scrollAreaClasses*/ ctx[12]
    			})
    		},
    		{
    			style: div1_style_value = Object.entries(/*scrollAreaStyles*/ ctx[13]).map(func_1).join(" ")
    		},
    		prefixFilter(/*$$restProps*/ ctx[16], "scrollArea$")
    	];

    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	let div2_levels = [
    		{
    			class: div2_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-tab-scroller": true,
    				"mdc-tab-scroller--align-start": /*align*/ ctx[2] === "start",
    				"mdc-tab-scroller--align-end": /*align*/ ctx[2] === "end",
    				"mdc-tab-scroller--align-center": /*align*/ ctx[2] === "center",
    				.../*internalClasses*/ ctx[11]
    			})
    		},
    		exclude(/*$$restProps*/ ctx[16], ["scrollArea$", "scrollContent$"])
    	];

    	let div2_data = {};

    	for (let i = 0; i < div2_levels.length; i += 1) {
    		div2_data = assign(div2_data, div2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div0, div0_data);
    			add_location(div0, file$2, 32, 4, 1108);
    			set_attributes(div1, div1_data);
    			add_location(div1, file$2, 14, 2, 406);
    			set_attributes(div2, div2_data);
    			add_location(div2, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[24](div0);
    			/*div1_binding*/ ctx[26](div1);
    			/*div2_binding*/ ctx[32](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div0, /*scrollContent$use*/ ctx[5])),
    					listen_dev(div0, "transitionend", /*transitionend_handler*/ ctx[25], false, false, false),
    					action_destroyer(useActions_action_1 = useActions.call(null, div1, /*scrollArea$use*/ ctx[3])),
    					listen_dev(div1, "wheel", /*wheel_handler*/ ctx[27], { passive: true }, false, false),
    					listen_dev(div1, "touchstart", /*touchstart_handler*/ ctx[28], { passive: true }, false, false),
    					listen_dev(div1, "pointerdown", /*pointerdown_handler*/ ctx[29], false, false, false),
    					listen_dev(div1, "mousedown", /*mousedown_handler*/ ctx[30], false, false, false),
    					listen_dev(div1, "keydown", /*keydown_handler*/ ctx[31], false, false, false),
    					action_destroyer(useActions_action_2 = useActions.call(null, div2, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[15].call(null, div2))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 4194304)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			set_attributes(div0, div0_data = get_spread_update(div0_levels, [
    				(!current || dirty[0] & /*scrollContent$class*/ 64 && div0_class_value !== (div0_class_value = classMap({
    					[/*scrollContent$class*/ ctx[6]]: true,
    					"mdc-tab-scroller__scroll-content": true
    				}))) && { class: div0_class_value },
    				(!current || dirty[0] & /*scrollContentStyles*/ 16384 && div0_style_value !== (div0_style_value = Object.entries(/*scrollContentStyles*/ ctx[14]).map(func).join(" "))) && { style: div0_style_value },
    				dirty[0] & /*$$restProps*/ 65536 && prefixFilter(/*$$restProps*/ ctx[16], "scrollContent$")
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*scrollContent$use*/ 32) useActions_action.update.call(null, /*scrollContent$use*/ ctx[5]);

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [
    				(!current || dirty[0] & /*scrollArea$class, scrollAreaClasses*/ 4112 && div1_class_value !== (div1_class_value = classMap({
    					[/*scrollArea$class*/ ctx[4]]: true,
    					"mdc-tab-scroller__scroll-area": true,
    					.../*scrollAreaClasses*/ ctx[12]
    				}))) && { class: div1_class_value },
    				(!current || dirty[0] & /*scrollAreaStyles*/ 8192 && div1_style_value !== (div1_style_value = Object.entries(/*scrollAreaStyles*/ ctx[13]).map(func_1).join(" "))) && { style: div1_style_value },
    				dirty[0] & /*$$restProps*/ 65536 && prefixFilter(/*$$restProps*/ ctx[16], "scrollArea$")
    			]));

    			if (useActions_action_1 && is_function(useActions_action_1.update) && dirty[0] & /*scrollArea$use*/ 8) useActions_action_1.update.call(null, /*scrollArea$use*/ ctx[3]);

    			set_attributes(div2, div2_data = get_spread_update(div2_levels, [
    				(!current || dirty[0] & /*className, align, internalClasses*/ 2054 && div2_class_value !== (div2_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					"mdc-tab-scroller": true,
    					"mdc-tab-scroller--align-start": /*align*/ ctx[2] === "start",
    					"mdc-tab-scroller--align-end": /*align*/ ctx[2] === "end",
    					"mdc-tab-scroller--align-center": /*align*/ ctx[2] === "center",
    					.../*internalClasses*/ ctx[11]
    				}))) && { class: div2_class_value },
    				dirty[0] & /*$$restProps*/ 65536 && exclude(/*$$restProps*/ ctx[16], ["scrollArea$", "scrollContent$"])
    			]));

    			if (useActions_action_2 && is_function(useActions_action_2.update) && dirty[0] & /*use*/ 1) useActions_action_2.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[24](null);
    			/*div1_binding*/ ctx[26](null);
    			/*div2_binding*/ ctx[32](null);
    			mounted = false;
    			run_all(dispose);
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

    const func = ([name, value]) => `${name}: ${value};`;
    const func_1 = ([name, value]) => `${name}: ${value};`;

    function instance_1$1($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","align","scrollArea$use","scrollArea$class","scrollContent$use","scrollContent$class","getScrollPosition","getScrollContentWidth","incrementScroll","scrollTo","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabScroller", slots, ['default']);
    	const { matches } = ponyfill;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { align = null } = $$props;
    	let { scrollArea$use = [] } = $$props;
    	let { scrollArea$class = "" } = $$props;
    	let { scrollContent$use = [] } = $$props;
    	let { scrollContent$class = "" } = $$props;
    	let element;
    	let instance;
    	let scrollArea;
    	let scrollContent;
    	let internalClasses = {};
    	let scrollAreaClasses = {};
    	let scrollAreaStyles = {};
    	let scrollContentStyles = {};

    	onMount(() => {
    		$$invalidate(8, instance = new MDCTabScrollerFoundation({
    				eventTargetMatchesSelector: (evtTarget, selector) => matches(evtTarget, selector),
    				addClass,
    				removeClass,
    				addScrollAreaClass,
    				setScrollAreaStyleProperty: addScrollAreaStyle,
    				setScrollContentStyleProperty: addScrollContentStyle,
    				getScrollContentStyleValue: getScrollContentStyle,
    				setScrollAreaScrollLeft: scrollX => $$invalidate(9, scrollArea.scrollLeft = scrollX, scrollArea),
    				getScrollAreaScrollLeft: () => scrollArea.scrollLeft,
    				getScrollContentOffsetWidth: () => scrollContent.offsetWidth,
    				getScrollAreaOffsetWidth: () => scrollArea.offsetWidth,
    				computeScrollAreaClientRect: () => scrollArea.getBoundingClientRect(),
    				computeScrollContentClientRect: () => scrollContent.getBoundingClientRect(),
    				computeHorizontalScrollbarHeight: () => computeHorizontalScrollbarHeight(document)
    			}));

    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addScrollAreaClass(className) {
    		if (!scrollAreaClasses[className]) {
    			$$invalidate(12, scrollAreaClasses[className] = true, scrollAreaClasses);
    		}
    	}

    	function addScrollAreaStyle(name, value) {
    		if (scrollAreaStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete scrollAreaStyles[name];
    				$$invalidate(13, scrollAreaStyles);
    			} else {
    				$$invalidate(13, scrollAreaStyles[name] = value, scrollAreaStyles);
    			}
    		}
    	}

    	function addScrollContentStyle(name, value) {
    		if (scrollContentStyles[name] != value) {
    			if (value === "" || value == null) {
    				delete scrollContentStyles[name];
    				$$invalidate(14, scrollContentStyles);
    			} else {
    				$$invalidate(14, scrollContentStyles[name] = value, scrollContentStyles);
    			}
    		}
    	}

    	function getScrollContentStyle(name) {
    		return name in scrollContentStyles
    		? scrollContentStyles[name]
    		: getComputedStyle(scrollContent).getPropertyValue(name);
    	}

    	function getScrollPosition() {
    		return instance.getScrollPosition();
    	}

    	function getScrollContentWidth() {
    		return scrollContent.offsetWidth;
    	}

    	function incrementScroll(scrollXIncrement) {
    		instance.incrementScroll(scrollXIncrement);
    	}

    	function scrollTo(scrollX) {
    		instance.scrollTo(scrollX);
    	}

    	function getElement() {
    		return element;
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scrollContent = $$value;
    			$$invalidate(10, scrollContent);
    		});
    	}

    	const transitionend_handler = event => instance && instance.handleTransitionEnd(event);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scrollArea = $$value;
    			$$invalidate(9, scrollArea);
    		});
    	}

    	const wheel_handler = () => instance && instance.handleInteraction();
    	const touchstart_handler = () => instance && instance.handleInteraction();
    	const pointerdown_handler = () => instance && instance.handleInteraction();
    	const mousedown_handler = () => instance && instance.handleInteraction();
    	const keydown_handler = () => instance && instance.handleInteraction();

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(16, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("align" in $$new_props) $$invalidate(2, align = $$new_props.align);
    		if ("scrollArea$use" in $$new_props) $$invalidate(3, scrollArea$use = $$new_props.scrollArea$use);
    		if ("scrollArea$class" in $$new_props) $$invalidate(4, scrollArea$class = $$new_props.scrollArea$class);
    		if ("scrollContent$use" in $$new_props) $$invalidate(5, scrollContent$use = $$new_props.scrollContent$use);
    		if ("scrollContent$class" in $$new_props) $$invalidate(6, scrollContent$class = $$new_props.scrollContent$class);
    		if ("$$scope" in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTabScrollerFoundation,
    		util,
    		ponyfill,
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		exclude,
    		prefixFilter,
    		useActions,
    		matches,
    		forwardEvents,
    		use,
    		className,
    		align,
    		scrollArea$use,
    		scrollArea$class,
    		scrollContent$use,
    		scrollContent$class,
    		element,
    		instance,
    		scrollArea,
    		scrollContent,
    		internalClasses,
    		scrollAreaClasses,
    		scrollAreaStyles,
    		scrollContentStyles,
    		addClass,
    		removeClass,
    		addScrollAreaClass,
    		addScrollAreaStyle,
    		addScrollContentStyle,
    		getScrollContentStyle,
    		getScrollPosition,
    		getScrollContentWidth,
    		incrementScroll,
    		scrollTo,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("align" in $$props) $$invalidate(2, align = $$new_props.align);
    		if ("scrollArea$use" in $$props) $$invalidate(3, scrollArea$use = $$new_props.scrollArea$use);
    		if ("scrollArea$class" in $$props) $$invalidate(4, scrollArea$class = $$new_props.scrollArea$class);
    		if ("scrollContent$use" in $$props) $$invalidate(5, scrollContent$use = $$new_props.scrollContent$use);
    		if ("scrollContent$class" in $$props) $$invalidate(6, scrollContent$class = $$new_props.scrollContent$class);
    		if ("element" in $$props) $$invalidate(7, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(8, instance = $$new_props.instance);
    		if ("scrollArea" in $$props) $$invalidate(9, scrollArea = $$new_props.scrollArea);
    		if ("scrollContent" in $$props) $$invalidate(10, scrollContent = $$new_props.scrollContent);
    		if ("internalClasses" in $$props) $$invalidate(11, internalClasses = $$new_props.internalClasses);
    		if ("scrollAreaClasses" in $$props) $$invalidate(12, scrollAreaClasses = $$new_props.scrollAreaClasses);
    		if ("scrollAreaStyles" in $$props) $$invalidate(13, scrollAreaStyles = $$new_props.scrollAreaStyles);
    		if ("scrollContentStyles" in $$props) $$invalidate(14, scrollContentStyles = $$new_props.scrollContentStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		align,
    		scrollArea$use,
    		scrollArea$class,
    		scrollContent$use,
    		scrollContent$class,
    		element,
    		instance,
    		scrollArea,
    		scrollContent,
    		internalClasses,
    		scrollAreaClasses,
    		scrollAreaStyles,
    		scrollContentStyles,
    		forwardEvents,
    		$$restProps,
    		getScrollPosition,
    		getScrollContentWidth,
    		incrementScroll,
    		scrollTo,
    		getElement,
    		$$scope,
    		slots,
    		div0_binding,
    		transitionend_handler,
    		div1_binding,
    		wheel_handler,
    		touchstart_handler,
    		pointerdown_handler,
    		mousedown_handler,
    		keydown_handler,
    		div2_binding
    	];
    }

    class TabScroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$1,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				align: 2,
    				scrollArea$use: 3,
    				scrollArea$class: 4,
    				scrollContent$use: 5,
    				scrollContent$class: 6,
    				getScrollPosition: 17,
    				getScrollContentWidth: 18,
    				incrementScroll: 19,
    				scrollTo: 20,
    				getElement: 21
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabScroller",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get use() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollArea$use() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollArea$use(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollArea$class() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollArea$class(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollContent$use() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollContent$use(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollContent$class() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollContent$class(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getScrollPosition() {
    		return this.$$.ctx[17];
    	}

    	set getScrollPosition(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getScrollContentWidth() {
    		return this.$$.ctx[18];
    	}

    	set getScrollContentWidth(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get incrementScroll() {
    		return this.$$.ctx[19];
    	}

    	set incrementScroll(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollTo() {
    		return this.$$.ctx[20];
    	}

    	set scrollTo(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[21];
    	}

    	set getElement(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/tab-bar/TabBar.svelte generated by Svelte v3.38.2 */
    const file$1 = "node_modules/@smui/tab-bar/TabBar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[34] = i;
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({ tab: dirty[0] & /*tabs*/ 4 });
    const get_default_slot_context = ctx => ({ tab: /*tab*/ ctx[32] });

    // (21:4) {#each tabs as tab, i (key(tab))}
    function create_each_block$1(key_2, ctx) {
    	let first;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[27], get_default_slot_context);

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (default_slot) default_slot.c();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, tabs*/ 134217732)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[27], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(21:4) {#each tabs as tab, i (key(tab))}",
    		ctx
    	});

    	return block;
    }

    // (17:2) <TabScroller     bind:this={tabScroller}     {...prefixFilter($$restProps, 'tabScroller$')}   >
    function create_default_slot$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*tabs*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*key*/ ctx[3](/*tab*/ ctx[32]);
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

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$$scope, tabs, key*/ 134217740) {
    				each_value = /*tabs*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
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

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(17:2) <TabScroller     bind:this={tabScroller}     {...prefixFilter($$restProps, 'tabScroller$')}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let tabscroller;
    	let div_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const tabscroller_spread_levels = [prefixFilter(/*$$restProps*/ ctx[10], "tabScroller$")];

    	let tabscroller_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tabscroller_spread_levels.length; i += 1) {
    		tabscroller_props = assign(tabscroller_props, tabscroller_spread_levels[i]);
    	}

    	tabscroller = new TabScroller({ props: tabscroller_props, $$inline: true });
    	/*tabscroller_binding*/ ctx[21](tabscroller);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				"mdc-tab-bar": true
    			})
    		},
    		{ role: "tablist" },
    		exclude(/*$$restProps*/ ctx[10], ["tabScroller$"])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabscroller.$$.fragment);
    			set_attributes(div, div_data);
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tabscroller, div, null);
    			/*div_binding*/ ctx[22](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[7].call(null, div)),
    					listen_dev(div, "SMUI:tab:mount", /*SMUI_tab_mount_handler*/ ctx[23], false, false, false),
    					listen_dev(div, "SMUI:tab:unmount", /*SMUI_tab_unmount_handler*/ ctx[24], false, false, false),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[25], false, false, false),
    					listen_dev(div, "MDCTab:interacted", /*MDCTab_interacted_handler*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const tabscroller_changes = (dirty[0] & /*$$restProps*/ 1024)
    			? get_spread_update(tabscroller_spread_levels, [get_spread_object(prefixFilter(/*$$restProps*/ ctx[10], "tabScroller$"))])
    			: {};

    			if (dirty[0] & /*$$scope, tabs*/ 134217732) {
    				tabscroller_changes.$$scope = { dirty, ctx };
    			}

    			tabscroller.$set(tabscroller_changes);

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*className*/ 2 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					"mdc-tab-bar": true
    				}))) && { class: div_class_value },
    				{ role: "tablist" },
    				dirty[0] & /*$$restProps*/ 1024 && exclude(/*$$restProps*/ ctx[10], ["tabScroller$"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabscroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabscroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*tabscroller_binding*/ ctx[21](null);
    			destroy_component(tabscroller);
    			/*div_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
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

    function instance_1($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","tabs","key","focusOnActivate","focusOnProgrammatic","useAutomaticActivation","active","scrollIntoView","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabBar", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { tabs = [] } = $$props;
    	let { key = tab => tab } = $$props;
    	let { focusOnActivate = true } = $$props;
    	let { focusOnProgrammatic = false } = $$props;
    	let { useAutomaticActivation = true } = $$props;
    	let { active = null } = $$props;
    	let element;
    	let instance;
    	let tabScroller;
    	let activeIndex = tabs.indexOf(active);
    	let tabAccessorMap = {};
    	let tabAccessorWeakMap = new WeakMap();
    	let skipFocus = false;
    	setContext("SMUI:tab:focusOnActivate", focusOnActivate);
    	setContext("SMUI:tab:initialActive", active);

    	onMount(() => {
    		$$invalidate(4, instance = new MDCTabBarFoundation({
    				scrollTo: scrollX => tabScroller.scrollTo(scrollX),
    				incrementScroll: scrollXIncrement => tabScroller.incrementScroll(scrollXIncrement),
    				getScrollPosition: () => tabScroller.getScrollPosition(),
    				getScrollContentWidth: () => tabScroller.getScrollContentWidth(),
    				getOffsetWidth: () => getElement().offsetWidth,
    				isRTL: () => getComputedStyle(getElement()).getPropertyValue("direction") === "rtl",
    				setActiveTab: index => {
    					$$invalidate(11, active = tabs[index]);
    					$$invalidate(17, activeIndex = index);
    					instance.activateTab(index);
    				},
    				activateTabAtIndex: (index, clientRect) => getAccessor(tabs[index]).activate(clientRect, skipFocus),
    				deactivateTabAtIndex: index => getAccessor(tabs[index]).deactivate(),
    				focusTabAtIndex: index => getAccessor(tabs[index]).focus(),
    				getTabIndicatorClientRectAtIndex: index => getAccessor(tabs[index]).computeIndicatorClientRect(),
    				getTabDimensionsAtIndex: index => getAccessor(tabs[index]).computeDimensions(),
    				getPreviousActiveTabIndex: () => {
    					for (let i = 0; i < tabs.length; i++) {
    						if (getAccessor(tabs[i]).active) {
    							return i;
    						}
    					}

    					return -1;
    				},
    				getFocusedTabIndex: () => {
    					const tabElements = tabs.map(tab => getAccessor(tab).element);
    					const activeElement = document.activeElement;
    					return tabElements.indexOf(activeElement);
    				},
    				getIndexOfTabById: id => tabs.indexOf(id),
    				getTabListLength: () => tabs.length,
    				notifyTabActivated: index => dispatch(getElement(), "MDCTabBar:activated", { index })
    			}));

    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function handleTabMount(event) {
    		const accessor = event.detail;
    		addAccessor(accessor.tabId, accessor);
    	}

    	function handleTabUnmount(event) {
    		const accessor = event.detail;
    		removeAccessor(accessor.tabId);
    	}

    	function getAccessor(tabId) {
    		return tabId instanceof Object
    		? tabAccessorWeakMap.get(tabId)
    		: tabAccessorMap[tabId];
    	}

    	function addAccessor(tabId, accessor) {
    		if (tabId instanceof Object) {
    			tabAccessorWeakMap.set(tabId, accessor);
    			$$invalidate(19, tabAccessorWeakMap);
    		} else {
    			$$invalidate(18, tabAccessorMap[tabId] = accessor, tabAccessorMap);
    			$$invalidate(18, tabAccessorMap);
    		}
    	}

    	function removeAccessor(tabId) {
    		if (tabId instanceof Object) {
    			tabAccessorWeakMap.delete(tabId);
    			$$invalidate(19, tabAccessorWeakMap);
    		} else {
    			delete tabAccessorMap[tabId];
    			$$invalidate(18, tabAccessorMap);
    		}
    	}

    	function scrollIntoView(index) {
    		instance.scrollIntoView(index);
    	}

    	function getElement() {
    		return element;
    	}

    	function tabscroller_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tabScroller = $$value;
    			$$invalidate(6, tabScroller);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(5, element);
    		});
    	}

    	const SMUI_tab_mount_handler = event => handleTabMount(event);
    	const SMUI_tab_unmount_handler = event => handleTabUnmount(event);
    	const keydown_handler = event => instance && instance.handleKeyDown(event);
    	const MDCTab_interacted_handler = event => instance && instance.handleTabInteraction(event);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("tabs" in $$new_props) $$invalidate(2, tabs = $$new_props.tabs);
    		if ("key" in $$new_props) $$invalidate(3, key = $$new_props.key);
    		if ("focusOnActivate" in $$new_props) $$invalidate(12, focusOnActivate = $$new_props.focusOnActivate);
    		if ("focusOnProgrammatic" in $$new_props) $$invalidate(13, focusOnProgrammatic = $$new_props.focusOnProgrammatic);
    		if ("useAutomaticActivation" in $$new_props) $$invalidate(14, useAutomaticActivation = $$new_props.useAutomaticActivation);
    		if ("active" in $$new_props) $$invalidate(11, active = $$new_props.active);
    		if ("$$scope" in $$new_props) $$invalidate(27, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTabBarFoundation,
    		onMount,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		exclude,
    		prefixFilter,
    		useActions,
    		dispatch,
    		TabScroller,
    		forwardEvents,
    		use,
    		className,
    		tabs,
    		key,
    		focusOnActivate,
    		focusOnProgrammatic,
    		useAutomaticActivation,
    		active,
    		element,
    		instance,
    		tabScroller,
    		activeIndex,
    		tabAccessorMap,
    		tabAccessorWeakMap,
    		skipFocus,
    		handleTabMount,
    		handleTabUnmount,
    		getAccessor,
    		addAccessor,
    		removeAccessor,
    		scrollIntoView,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("tabs" in $$props) $$invalidate(2, tabs = $$new_props.tabs);
    		if ("key" in $$props) $$invalidate(3, key = $$new_props.key);
    		if ("focusOnActivate" in $$props) $$invalidate(12, focusOnActivate = $$new_props.focusOnActivate);
    		if ("focusOnProgrammatic" in $$props) $$invalidate(13, focusOnProgrammatic = $$new_props.focusOnProgrammatic);
    		if ("useAutomaticActivation" in $$props) $$invalidate(14, useAutomaticActivation = $$new_props.useAutomaticActivation);
    		if ("active" in $$props) $$invalidate(11, active = $$new_props.active);
    		if ("element" in $$props) $$invalidate(5, element = $$new_props.element);
    		if ("instance" in $$props) $$invalidate(4, instance = $$new_props.instance);
    		if ("tabScroller" in $$props) $$invalidate(6, tabScroller = $$new_props.tabScroller);
    		if ("activeIndex" in $$props) $$invalidate(17, activeIndex = $$new_props.activeIndex);
    		if ("tabAccessorMap" in $$props) $$invalidate(18, tabAccessorMap = $$new_props.tabAccessorMap);
    		if ("tabAccessorWeakMap" in $$props) $$invalidate(19, tabAccessorWeakMap = $$new_props.tabAccessorWeakMap);
    		if ("skipFocus" in $$props) skipFocus = $$new_props.skipFocus;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*active, tabs, activeIndex, instance, focusOnProgrammatic*/ 141332) {
    			if (active !== tabs[activeIndex]) {
    				$$invalidate(17, activeIndex = tabs.indexOf(active));

    				if (instance) {
    					skipFocus = !focusOnProgrammatic;
    					instance.activateTab(activeIndex);
    					skipFocus = false;
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*tabs, tabAccessorWeakMap, tabAccessorMap, activeIndex*/ 917508) {
    			if (tabs.length) {
    				// Manually get the accessor so it is reactive.
    				const accessor = tabs[0] instanceof Object
    				? tabAccessorWeakMap.get(tabs[0])
    				: tabAccessorMap[tabs[0]];

    				if (accessor) {
    					accessor.forceAccessible(activeIndex === -1);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, useAutomaticActivation*/ 16400) {
    			if (instance) {
    				instance.setUseAutomaticActivation(useAutomaticActivation);
    			}
    		}
    	};

    	return [
    		use,
    		className,
    		tabs,
    		key,
    		instance,
    		element,
    		tabScroller,
    		forwardEvents,
    		handleTabMount,
    		handleTabUnmount,
    		$$restProps,
    		active,
    		focusOnActivate,
    		focusOnProgrammatic,
    		useAutomaticActivation,
    		scrollIntoView,
    		getElement,
    		activeIndex,
    		tabAccessorMap,
    		tabAccessorWeakMap,
    		slots,
    		tabscroller_binding,
    		div_binding,
    		SMUI_tab_mount_handler,
    		SMUI_tab_unmount_handler,
    		keydown_handler,
    		MDCTab_interacted_handler,
    		$$scope
    	];
    }

    class TabBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				tabs: 2,
    				key: 3,
    				focusOnActivate: 12,
    				focusOnProgrammatic: 13,
    				useAutomaticActivation: 14,
    				active: 11,
    				scrollIntoView: 15,
    				getElement: 16
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabBar",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get use() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabs() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabs(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusOnActivate() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusOnActivate(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusOnProgrammatic() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusOnProgrammatic(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useAutomaticActivation() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useAutomaticActivation(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollIntoView() {
    		return this.$$.ctx[15];
    	}

    	set scrollIntoView(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[16];
    	}

    	set getElement(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (50:2) <Content class="mdc-typography--headline4">
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Gauge chart");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(50:2) <Content class=\\\"mdc-typography--headline4\\\">",
    		ctx
    	});

    	return block;
    }

    // (51:2) <Content class="mdc-typography--body2">
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("This is a card!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(51:2) <Content class=\\\"mdc-typography--body2\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:1) <Card style="width: 360px; margin: 2em auto;">
    function create_default_slot_7(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let content0;
    	let t1;
    	let content1;
    	let current;

    	content0 = new Content({
    			props: {
    				class: "mdc-typography--headline4",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	content1 = new Content({
    			props: {
    				class: "mdc-typography--body2",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			create_component(content0.$$.fragment);
    			t1 = space();
    			create_component(content1.$$.fragment);
    			if (img.src !== (img_src_value = "img/placeholder.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "placeholder");
    			add_location(img, file, 48, 2, 1234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(content0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(content1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const content0_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				content0_changes.$$scope = { dirty, ctx };
    			}

    			content0.$set(content0_changes);
    			const content1_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				content1_changes.$$scope = { dirty, ctx };
    			}

    			content1.$set(content1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content0.$$.fragment, local);
    			transition_in(content1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content0.$$.fragment, local);
    			transition_out(content1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			destroy_component(content0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(content1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(48:1) <Card style=\\\"width: 360px; margin: 2em auto;\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:5) <Option value={fruit}>
    function create_default_slot_6(ctx) {
    	let t_value = /*fruit*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(68:5) <Option value={fruit}>",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#each fruits as fruit}
    function create_each_block_1(ctx) {
    	let option;
    	let current;

    	option = new Option({
    			props: {
    				value: /*fruit*/ ctx[9],
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(option.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(option, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const option_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				option_changes.$$scope = { dirty, ctx };
    			}

    			option.$set(option_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(option.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(option.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(option, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(67:4) {#each fruits as fruit}",
    		ctx
    	});

    	return block;
    }

    // (66:3) <Select bind:value label="Pick a fruit">
    function create_default_slot_5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*fruits*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fruits*/ 4) {
    				each_value_1 = /*fruits*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(66:3) <Select bind:value label=\\\"Pick a fruit\\\">",
    		ctx
    	});

    	return block;
    }

    // (87:4) <Label>
    function create_default_slot_4(ctx) {
    	let t_value = /*tab*/ ctx[6] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tab*/ 64 && t_value !== (t_value = /*tab*/ ctx[6] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(87:4) <Label>",
    		ctx
    	});

    	return block;
    }

    // (86:3) <Tab {tab}>
    function create_default_slot_3(ctx) {
    	let label;
    	let current;

    	label = new CommonLabel({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty & /*$$scope, tab*/ 4160) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(86:3) <Tab {tab}>",
    		ctx
    	});

    	return block;
    }

    // (80:2) <TabBar    tabs={["Cases", "Hospitalized", "Deaths", "ICU"]}    let:tab    bind:active   >
    function create_default_slot_2(ctx) {
    	let tab;
    	let current;

    	tab = new Tab({
    			props: {
    				tab: /*tab*/ ctx[6],
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab_changes = {};
    			if (dirty & /*tab*/ 64) tab_changes.tab = /*tab*/ ctx[6];

    			if (dirty & /*$$scope, tab*/ 4160) {
    				tab_changes.$$scope = { dirty, ctx };
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(80:2) <TabBar    tabs={[\\\"Cases\\\", \\\"Hospitalized\\\", \\\"Deaths\\\", \\\"ICU\\\"]}    let:tab    bind:active   >",
    		ctx
    	});

    	return block;
    }

    // (95:6) <Label>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*tab*/ ctx[6]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(95:6) <Label>",
    		ctx
    	});

    	return block;
    }

    // (94:4) <Button on:click={() => (active = tab)}      >
    function create_default_slot(ctx) {
    	let label;
    	let current;

    	label = new CommonLabel({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(94:4) <Button on:click={() => (active = tab)}      >",
    		ctx
    	});

    	return block;
    }

    // (93:3) {#each ["Cases", "Hospitalized", "Deaths", "ICU"] as tab}
    function create_each_block(ctx) {
    	let button;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*tab*/ ctx[6]);
    	}

    	button = new Button_1({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(93:3) {#each [\\\"Cases\\\", \\\"Hospitalized\\\", \\\"Deaths\\\", \\\"ICU\\\"] as tab}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let link3;
    	let link4;
    	let link5;
    	let t0;
    	let menu;
    	let t1;
    	let main;
    	let card;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let div1;
    	let div0;
    	let select;
    	let updating_value;
    	let t7;
    	let pre0;
    	let t8;
    	let t9;
    	let t10;
    	let div4;
    	let tabbar;
    	let updating_active;
    	let t11;
    	let div3;
    	let div2;
    	let t13;
    	let t14;
    	let pre1;
    	let t15;
    	let t16;
    	let current;
    	menu = new Menu$1({ $$inline: true });

    	card = new Card({
    			props: {
    				style: "width: 360px; margin: 2em auto;",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[3](value);
    	}

    	let select_props = {
    		label: "Pick a fruit",
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		select_props.value = /*value*/ ctx[0];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding));

    	function tabbar_active_binding(value) {
    		/*tabbar_active_binding*/ ctx[4](value);
    	}

    	let tabbar_props = {
    		tabs: ["Cases", "Hospitalized", "Deaths", "ICU"],
    		$$slots: {
    			default: [
    				create_default_slot_2,
    				({ tab }) => ({ 6: tab }),
    				({ tab }) => tab ? 64 : 0
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*active*/ ctx[1] !== void 0) {
    		tabbar_props.active = /*active*/ ctx[1];
    	}

    	tabbar = new TabBar({ props: tabbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabbar, "active", tabbar_active_binding));
    	let each_value = ["Cases", "Hospitalized", "Deaths", "ICU"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 4; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			link3 = element("link");
    			link4 = element("link");
    			link5 = element("link");
    			t0 = space();
    			create_component(menu.$$.fragment);
    			t1 = space();
    			main = element("main");
    			create_component(card.$$.fragment);
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "This is how vaccination progresses in Spain";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat donec\n\t\tpretium, proin metus. Amet, malesuada dui purus amet ullamcorper dui,\n\t\tnec. Dis nisl eu tristique dolor fames consectetur.";
    			t6 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(select.$$.fragment);
    			t7 = space();
    			pre0 = element("pre");
    			t8 = text("Selected: ");
    			t9 = text(/*value*/ ctx[0]);
    			t10 = space();
    			div4 = element("div");
    			create_component(tabbar.$$.fragment);
    			t11 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Programmatically select:";
    			t13 = space();

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			pre1 = element("pre");
    			t15 = text("Selected: ");
    			t16 = text(/*active*/ ctx[1]);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link0, file, 17, 1, 454);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700");
    			add_location(link1, file, 21, 1, 549);
    			attr_dev(link2, "rel", "preconnect");
    			attr_dev(link2, "href", "https://fonts.gstatic.com");
    			add_location(link2, file, 25, 1, 655);
    			attr_dev(link3, "href", "https://fonts.googleapis.com/css?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
    			attr_dev(link3, "rel", "stylesheet");
    			add_location(link3, file, 26, 1, 715);
    			attr_dev(link4, "rel", "stylesheet");
    			attr_dev(link4, "href", "/build/mdc.typography.css");
    			add_location(link4, file, 36, 1, 995);
    			attr_dev(link5, "rel", "stylesheet");
    			attr_dev(link5, "href", "/build/smui.css");
    			add_location(link5, file, 39, 1, 1071);
    			attr_dev(p0, "class", "mdc-typography--headline2");
    			add_location(p0, file, 53, 1, 1431);
    			attr_dev(p1, "class", "mdc-typography--body1");
    			add_location(p1, file, 57, 1, 1523);
    			attr_dev(pre0, "class", "status");
    			add_location(pre0, file, 71, 3, 1985);
    			add_location(div0, file, 64, 2, 1834);
    			attr_dev(div1, "class", "columns margins");
    			set_style(div1, "justify-content", "flex-start");
    			add_location(div1, file, 63, 1, 1765);
    			add_location(div2, file, 91, 3, 2372);
    			set_style(div3, "margin-top", "1em");
    			add_location(div3, file, 90, 2, 2338);
    			attr_dev(pre1, "class", "status");
    			add_location(pre1, file, 99, 2, 2577);
    			add_location(div4, file, 75, 1, 2048);
    			attr_dev(main, "class", "svelte-5iqe6t");
    			add_location(main, file, 46, 0, 1177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, link3);
    			append_dev(document.head, link4);
    			append_dev(document.head, link5);
    			insert_dev(target, t0, anchor);
    			mount_component(menu, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(card, main, null);
    			append_dev(main, t2);
    			append_dev(main, p0);
    			append_dev(main, t4);
    			append_dev(main, p1);
    			append_dev(main, t6);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			mount_component(select, div0, null);
    			append_dev(div0, t7);
    			append_dev(div0, pre0);
    			append_dev(pre0, t8);
    			append_dev(pre0, t9);
    			append_dev(main, t10);
    			append_dev(main, div4);
    			mount_component(tabbar, div4, null);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t13);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div4, t14);
    			append_dev(div4, pre1);
    			append_dev(pre1, t15);
    			append_dev(pre1, t16);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    			const select_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				select_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);
    			if (!current || dirty & /*value*/ 1) set_data_dev(t9, /*value*/ ctx[0]);
    			const tabbar_changes = {};

    			if (dirty & /*$$scope, tab*/ 4160) {
    				tabbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 2) {
    				updating_active = true;
    				tabbar_changes.active = /*active*/ ctx[1];
    				add_flush_callback(() => updating_active = false);
    			}

    			tabbar.$set(tabbar_changes);

    			if (dirty & /*active*/ 2) {
    				each_value = ["Cases", "Hospitalized", "Deaths", "ICU"];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < 4; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = 4; i < 4; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*active*/ 2) set_data_dev(t16, /*active*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(card.$$.fragment, local);
    			transition_in(select.$$.fragment, local);
    			transition_in(tabbar.$$.fragment, local);

    			for (let i = 0; i < 4; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(card.$$.fragment, local);
    			transition_out(select.$$.fragment, local);
    			transition_out(tabbar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < 4; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(link3);
    			detach_dev(link4);
    			detach_dev(link5);
    			if (detaching) detach_dev(t0);
    			destroy_component(menu, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(card);
    			destroy_component(select);
    			destroy_component(tabbar);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let fruits = ["Pomme", "Orange", "Banana", "Mango"];
    	let value = "Orange";
    	let active = "Home";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function tabbar_active_binding(value) {
    		active = value;
    		$$invalidate(1, active);
    	}

    	const click_handler = tab => $$invalidate(1, active = tab);

    	$$self.$capture_state = () => ({
    		Menu: Menu$1,
    		Button: Button_1,
    		Card,
    		Content,
    		Select,
    		Option,
    		fruits,
    		value,
    		Tab,
    		Label: CommonLabel,
    		TabBar,
    		active
    	});

    	$$self.$inject_state = $$props => {
    		if ("fruits" in $$props) $$invalidate(2, fruits = $$props.fruits);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		active,
    		fruits,
    		select_value_binding,
    		tabbar_active_binding,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const url = 'https://raw.githubusercontent.com/X80110/covid-vaccination-tracker/main/app/public/data.json';

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
    	const data = json;

        new App({
          target: document.body,
          props: {
    		    data: data
      
          }
    	});
    });

    var app$1 = app;

    return app$1;

}());
//# sourceMappingURL=bundle.js.map
