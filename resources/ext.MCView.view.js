/* global mw */
/* global ZSchema */

/**
 * @typedef {Object} ItemStack
 * @property {string} id - Item id, namespace:name.
 * @property {number} count - Stack count.
 */

// eslint-disable-next-line no-unused-vars
mw.hook('wikipage.categories').add(() => {
    (async () => {
        'use strict';

        const loadScript = (url, callback) => {
            var script = document.createElement('script');
            script.onload = function () {
                callback();
            };
            script.src = url;
            document.head.appendChild(script);
        };

        const error_message = (message, detail = null) => {
            let error_id = Math.random();
            console.error('[MCViewC]<%s> %s %o', error_id, message, detail);
            return $('<div></div>').addClass('mcview-error').attr('data-mcview-error', error_id);
        };

        const mcui = $('<div></div>').addClass('mcview mcui');
        const mcui_title = $('<div></div>').addClass('mcui-title');
        const mcui_container = $('<div></div>').addClass('container fcol');

        const mcui_arrow_a =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 26"><polygon points="0 10 18 10 18 0 20 0 20 2 22 2 22 4 24 4 24 6 26 6 26 8 28 8 28 10 30 10 30 12 32 12 32 14 30 14 30 16 28 16 28 18 26 18 26 20 24 20 24 22 22 22 22 24 20 24 20 26 18 26 18 24 18 16 0 16 0 10" class="a"/></svg>';
        const mcui_arrow_b =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30"><polygon class="a" points="0 12 28 12 28 0 30 0 30 2 32 2 32 4 34 4 34 6 36 6 36 8 38 8 38 10 40 10 40 12 42 12 42 14 44 14 44 16 42 16 42 18 40 18 40 20 38 20 38 22 36 22 36 24 34 24 34 26 32 26 32 28 30 28 30 30 28 30 28 18 0 18 0 12"/></svg>';
        const mcui_shapeless =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 15"><polygon class="a" points="0 2 5 2 5 3 6 3 6 4 7 4 7 6 5 6 5 5 0 5 0 2"/><polygon class="a" points="0 13 5 13 5 12 6 12 6 11 7 11 7 10 8 10 8 9 9 9 9 8 10 8 10 7 11 7 11 6 12 6 12 5 15 5 15 7 16 7 16 6 17 6 17 5 18 5 18 4 19 4 19 3 18 3 18 2 17 2 17 1 16 1 16 0 15 0 15 2 12 2 12 3 11 3 11 4 10 4 10 5 9 5 9 6 8 6 8 7 7 7 7 8 6 8 6 9 5 9 5 10 0 10 0 13"/><polygon class="a" points="10 9 12 9 12 10 15 10 15 8 16 8 16 9 17 9 17 10 18 10 18 11 19 11 19 12 18 12 18 13 17 13 17 14 16 14 16 15 15 15 15 13 12 13 12 12 11 12 11 11 10 11 10 9"/></svg>';
        const mcui_fuel =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26"><rect class="a" x="2" width="2" height="4"/><polygon class="a" points="6 4 6 14 4 14 4 18 6 18 6 26 0 26 0 24 2 24 2 20 0 20 0 12 2 12 2 8 4 8 4 4 6 4"/><rect class="a" x="12" y="4" width="2" height="4"/><polygon class="a" points="16 8 16 18 14 18 14 22 16 22 16 26 10 26 10 16 12 16 12 12 14 12 14 8 16 8"/><rect class="a" x="22" width="2" height="4"/><polygon class="a" points="20 4 22 4 22 8 24 8 24 12 26 12 26 20 24 20 24 24 26 24 26 26 20 26 20 18 22 18 22 14 20 14 20 4"/></svg>';
        const mcui_plus =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13"><polygon points="0 5 5 5 5 0 8 0 8 5 13 5 13 8 8 8 8 13 5 13 5 8 0 8 0 5" style="fill:#8b8b8b"/></svg>';

        const base_json_schema = {
            itemstack: {
                id: '#itemstack',
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                pattern: '^.+:.+$',
                            },
                            count: {
                                type: 'integer',
                                maximum: 64,
                                minimum: 1,
                            },
                            durability: {
                                type: 'number',
                                maximum: 1,
                                minimum: 0,
                            },
                        },
                        additionalProperties: false,
                        required: ['id'],
                    },
                    { type: 'null' },
                ],
            },
            itemslot: {
                id: '#itemslot',
                oneOf: [
                    { $ref: '#itemstack' },
                    {
                        type: 'array',
                        items: { $ref: '#itemstack' },
                    },
                ],
            },
        };

        const itemstack_schema = { $ref: '#itemstack' };
        const itemslot_schema = { $ref: '#itemslot' };
        const crafting_schema = {
            type: 'object',
            properties: {
                input: {
                    type: 'array',
                    minItems: 3,
                    maxItems: 3,
                    items: {
                        type: 'array',
                        minItems: 3,
                        maxItems: 3,
                        items: { $ref: '#itemslot' },
                    },
                },
                output: { $ref: '#itemslot' },
                shapeless: { type: 'boolean' },
            },
            required: ['input', 'output'],
            additionalProperties: false,
        };
        const smelting_schema = {
            type: 'object',
            properties: {
                input: {
                    type: 'array',
                    minItems: 2,
                    maxItems: 2,
                    items: { $ref: '#itemslot' },
                },
                output: { $ref: '#itemslot' },
                exp: {
                    oneOf: [{ type: 'null' }, { type: 'number' }],
                },
            },
            required: ['input', 'output'],
            additionalProperties: false,
        };
        const inventory_schema = {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            index: { type: 'integer', minimum: 0 },
                            pos: {
                                type: 'array',
                                minItems: 2,
                                maxItems: 2,
                                items: { type: 'integer', minimum: 0 },
                            },
                            item: { $ref: '#itemstack' },
                            slot: { type: 'boolean' },
                        },
                        oneOf: [{ required: ['index', 'item'] }, { required: ['pos', 'item'] }],
                        additionalProperties: false,
                    },
                    uniqueItems: true,
                },
                size: {
                    type: 'array',
                    minItems: 2,
                    maxItems: 2,
                    items: { type: 'integer', minimum: 1 },
                },
                slot: { type: 'boolean' },
                title: { type: 'string' },
            },
            required: ['items', 'size'],
            additionalProperties: false,
        };

        loadScript('https://cdn.jsdelivr.net/npm/z-schema@5.0.1/dist/ZSchema-browser-min.js', () => {
            $.ajax({
                type: 'GET',
                url: mw.config.get('wgMCViewMapFile'),
                dataType: 'json',
                success: (j) => {
                    window.MCView = {};
                    window.MCView.map = j;
                    window.MCView.validator = new ZSchema();
                    window.MCView.render = render;
                    $('div.mcview-wrapper').each((index, element_item) => {
                        let element = $(element_item);
                        render(element);
                    });
                },
            });
        });

        const render = (element) => {
            const validate = (data, schema) => {
                schema.definitions = base_json_schema;
                return window.MCView.validator.validate(data, schema);
            };

            let type = element.data('mcview-type');

            element.children().not('.mcview-data').remove();

            if (element.children('.mcview-data').length === 0) {
                element.html(error_message('Invalid wrapper'));
                return false;
            }

            let data = {};
            try {
                data = JSON.parse(element.children('.mcview-data').html());
            } catch (error) {
                element.html(error_message(`Invalid JSON data: ${error}`));
                return false;
            }

            switch (type) {
                case 'itemstack': {
                    if (validate(data, itemstack_schema)) {
                        element.append(createItemStack(data));
                        return true;
                    }
                    break;
                }
                case 'itemslot': {
                    if (validate(data, itemslot_schema)) {
                        element.append(createItemSlot(data, element));
                        return true;
                    }
                    break;
                }
                case 'crafting': {
                    if (validate(data, crafting_schema)) {
                        element.append(createCraftTable(data.input, data.output, data.shapeless));
                        return true;
                    }
                    break;
                }
                case 'smelting': {
                    if (validate(data, smelting_schema)) {
                        element.append(createFurnace(data.input, data.output, data.exp));
                        return true;
                    }
                    break;
                }
                case 'inventory': {
                    if (validate(data, inventory_schema)) {
                        element.append(createInventory(data.items, data.size, data.slot, data.title));
                        return true;
                    }
                    break;
                }
                case 'processing-a':
                case 'processing-b':
                case 'processing-c':
                case 'processing-d': {
                    element.append(createProcessor(type.split('-')[1], data.input, data.output));
                    return true;
                }
                default: {
                    element.append(error_message(`Unknown type:${type}`));
                    return false;
                }
            }
            element.append(error_message('JSON validation failed', window.MCView.validator.getLastErrors()));
            return false;
        };

        /**
         * @param {ItemStack} item_stack
         * @return {JQuery<HTMLElement>}
         */
        const createItemStack = (item_stack) => {
            if (item_stack === null) {
                return $('<div></div>').addClass('mcui-itemstack-placeholder');
            }

            let id = String(item_stack.id).split(':');
            let namespace = id[0],
                name = id[1];

            let stacksize = item_stack.count ? item_stack.count : 1;
            let durability = item_stack.durability;

            let item_map = window.MCView.map[namespace].item;

            let style_id = `mcview-itemstack-${namespace}`;
            if ($(`style#${style_id}`).length == 0) {
                $('head').append(`<style id="${style_id}"></style>`);
                $(`style#${style_id}`).append(
                    `.mcview.item-image-medium.${namespace}{background-image:url(${item_map.image.medium});}`
                );
            }

            let item = item_map.map[name];

            if (!item) {
                return error_message(`item:${namespace}:${name} does not exist in the mapping table`);
            }

            let element = $('<div></div>').addClass('mcview-itemstack');

            let image_left = item.index % 32;
            let image_top = parseInt(item.index / 32);

            let image_html = $('<div></div>')
                .addClass(`mcview item-image item-image-medium ${namespace}`)
                .css('background-position', `-${image_left * 32}px -${image_top * 32}px`);
            element.append(image_html);

            if (stacksize > 1) {
                let stackcount_html = $('<span></span>').addClass('mcview item-stacksize mcfont').html(stacksize);
                element.append(stackcount_html);
            }

            if (durability !== undefined) {
                let durability_html = $('<div></div>')
                    .addClass('mcview item-durability')
                    .append(
                        $('<span></span>')
                            .addClass('value')
                            .css({
                                width: `${Number(durability * 100).toFixed(1)}%`,
                                backgroundColor: `hsl(${durability * 108},100%,50%)`,
                            })
                    );
                element.append(durability_html);
            }

            let tooltip = $('<div></div>')
                .addClass('mcview item-tooltip mcfont unifont')
                .append(`<div class="zh-name">${item.zh_name} (${item.en_name})</div>`)
                .append(`<div class="register-name">${item.register_name}</div>`);
            element.append(tooltip);

            return element;
        };

        /**
         * @param {ItemStack|ItemStack[]} slot_items
         * @param {JQuery<HTMLElement>} warpper_element
         * @return {JQuery<HTMLElement>} Item slot
         * @version 0.2.4
         */
        const createItemSlot = (slot_items, warpper_element = null) => {
            if (Array.isArray(slot_items)) {
                if (slot_items.length > 1) {
                    /**
                     * @param {ItemStack[]} itemstack_array
                     * @param {JQuery<HTMLElement>} warpper_element
                     * @return {JQuery<HTMLElement>} Animated item slot
                     */
                    let createAnimatedSlot = (itemstack_array, warpper_element) => {
                        let animated_slot = $('<div></div>').addClass('mcui-slot animated');

                        Array.from(itemstack_array).forEach((item_stack, index) => {
                            animated_slot.append(
                                $('<div></div>')
                                    .append(createItemStack(item_stack))
                                    .attr('style', index > 0 ? 'display:none' : '')
                                    .addClass('animate-item')
                            );
                        });

                        let switch_item_timer = {
                            timer: 0,
                            index: 0,
                            start: function () {
                                switch_item_timer.timer = setInterval(() => {
                                    animated_slot
                                        .children('.animate-item')
                                        .eq(switch_item_timer.index)
                                        .show()
                                        .siblings()
                                        .hide();
                                    switch_item_timer.index++;
                                    if (switch_item_timer.index == itemstack_array.length) {
                                        switch_item_timer.index = 0;
                                    }
                                }, 1000);
                            },
                            suspend: function () {
                                clearInterval(switch_item_timer.timer);
                            },
                        };
                        switch_item_timer.start();

                        if (warpper_element !== null) {
                            warpper_element.get(0).addEventListener('mouseover', () => {
                                switch_item_timer.suspend();
                            });
                            warpper_element.get(0).addEventListener('mouseleave', () => {
                                switch_item_timer.start();
                            });
                        }

                        return animated_slot;
                    };

                    return createAnimatedSlot(slot_items, warpper_element);
                } else {
                    return $('<div></div>').append(createItemStack(slot_items[0])).addClass('mcui-slot');
                }
            } else {
                return $('<div></div>').append(createItemStack(slot_items)).addClass('mcui-slot');
            }
        };

        /**
         * @param {(ItemStack[]|ItemStack)[]} input
         * @param {ItemStack} output
         * @param {boolean} shapeless
         * @return {JQuery<HTMLElement>}
         */
        const createCraftTable = (input, output, shapeless) => {
            let table = $('<div></div>').addClass('mcui-crafting-table frow');

            let input_element = $('<div></div>').addClass('mcui-input fcol');
            for (var i = 0; i < 3; i++) {
                input_element.append($('<div></div>').addClass(`mcui-row row-${i} frow`));
            }
            Array.from(input).forEach((input_row, index) => {
                let row = input_element.children(`.mcui-row.row-${index}`);
                Array.from(input_row).forEach((input_slot) => {
                    row.append(createItemSlot(input_slot, table));
                });
                input_element.append(row);
            });
            table.append(input_element);

            table.append($('<div></div>').addClass('mcui-arrow mcui-inactive').append(mcui_arrow_a)); //arrow

            table.append(
                $('<div></div>').addClass('mcui-output').append(createItemSlot(output, table).addClass('large'))
            ); //output

            if (shapeless) {
                table.append(
                    $('<div></div>')
                        .addClass('mcui-icon craft-shapeless mcui-inactive')
                        .attr('title', '此配方是无序的，原料可以放置在合成网格的任意位置。')
                        .append(mcui_shapeless)
                );
            }

            return mcui.clone().append(table);
        };

        /**
         * @param {(ItemStack|ItemStack[])[]} input
         * @param {ItemStack|ItemStack[]} output
         * @param {number} exp
         * @return {JQuery<HTMLElement>}
         */
        const createFurnace = (input, output, exp) => {
            let furnace = $('<div></div>').addClass('mcui-furnace frow');

            let input_element = $('<div></div>').addClass('mcui-input fcol');
            for (var i = 0; i < 3; i++) {
                input_element.append($('<div></div>').addClass(`mcui-row row-${i} frow`));
            }
            input_element.children('.mcui-row.row-1').append(mcui_fuel).addClass('mcui-fuel mcui-inactive');
            Array.from(input).forEach((input_slot, index) => {
                let row = input_element.children(`.mcui-row.row-${index == 0 ? index : 2}`);
                row.append(createItemSlot(input_slot, furnace));
            });
            furnace.append(input_element);

            furnace.append($('<div></div>').addClass('mcui-arrow mcui-inactive').append(mcui_arrow_b)); // arrow

            furnace.append(
                $('<div></div>').addClass('mcui-output').append(createItemSlot(output, furnace).addClass('large'))
            ); // output

            if (exp !== undefined && exp !== null) {
                furnace.append(
                    $('<div class="mcui-exp mcfont"></div>')
                        .append(`<span class="mcui-icon exp-orb"></span>`)
                        .append(`<span>${exp}</span>`)
                );
            }

            return mcui.clone().append(furnace);
        };

        /**
         * @param {string} type
         * @param {ItemStack|ItemStack[]} input
         * @param {ItemStack|ItemStack[]} output
         * @return {JQuery<HTMLElement>}
         */
        const createProcessor = (type, input, output) => {
            let element = mcui.clone().append(
                $('<div></div>')
                    .addClass('mcui-processor frow')
                    .append($('<div></div>').addClass('mcui-input').append($('<div></div>').addClass('mcui-row frow'))) // input
                    .append($('<div></div>').addClass('mcui-arrow mcui-inactive').append(mcui_arrow_b)) // arrow
                    .append($('<div></div>').addClass('mcui-output').append($('<div></div>').addClass('mcui-row frow'))) // output
            );

            let input_element = element.find('.mcui-input>.mcui-row');
            let output_element = element.find('.mcui-output>.mcui-row');

            let plus_element = $('<div></div>').addClass('mcui-plus mcui-inactive').append(mcui_plus);

            switch (type.toLowerCase()) {
                case 'a': {
                    input_element.append(createItemSlot(input));
                    output_element.append(createItemSlot(output));
                    return element;
                }
                case 'b': {
                    input_element
                        .append(createItemSlot(input[0]))
                        .append(plus_element)
                        .append(createItemSlot(input[1]));
                    output_element.append(createItemSlot(output));
                    return element;
                }
                case 'c': {
                    input_element.append(createItemSlot(input));
                    output_element
                        .append(createItemSlot(output[0]))
                        .append(plus_element)
                        .append(createItemSlot(output[1]));
                    return element;
                }
                case 'd': {
                    input_element
                        .append(createItemSlot(input[0]))
                        .append(plus_element)
                        .append(createItemSlot(input[1]));
                    output_element
                        .append(createItemSlot(output[0]))
                        .append(plus_element.clone())
                        .append(createItemSlot(output[1]));
                    return element;
                }
                default:
                    return false;
            }
        };

        /**
         * @typedef {Object} InventoryItem
         * @property {number} index
         * @property {number[]} pos
         * @property {ItemStack} item
         * @property {boolean} slot
         */
        /**
         * @param {InventoryItem[]} item_list
         * @param {number[]} size
         * @param {boolean} display_slot
         * @param {string} title
         * @return {JQuery<HTMLElement>}
         */
        const createInventory = (item_list, size, display_slot, title) => {
            let inv_element = $('<div></div>').addClass('mcui-inventory');
            for (let r = 0; r < size[1]; r++) {
                let row_element = $('<div></div>').addClass(`mcui-row row-${r} frow`);
                for (let s = 0; s < size[0]; s++) {
                    row_element.append(
                        $('<div></div>')
                            .addClass(`slot-${r * size[0] + s} mcui-col col-${s}`)
                            .append(
                                $('<div></div>').addClass(`mcui-slot${display_slot === false ? '-placeholder' : ''}`)
                            )
                    );
                }
                inv_element.append(row_element);
            }

            item_list.forEach((slot_item) => {
                inv_element
                    .find(
                        Object.prototype.hasOwnProperty.call(slot_item, 'index')
                            ? `.mcui-row>.slot-${Number(slot_item.index)}`
                            : Object.prototype.hasOwnProperty.call(slot_item, 'pos')
                            ? `.mcui-row.row-${slot_item.pos[1]}>.mcui-col.col-${slot_item.pos[0]}`
                            : null
                    )
                    .html(
                        $('<div></div>')
                            .addClass(`mcui-slot${slot_item.slot === false ? '-placeholder' : ''}`)
                            .append(createItemStack(slot_item.item))
                    );
            });

            if (title !== undefined) {
                let title_elemnet = mcui_title.clone().html(title);
                return mcui
                    .clone()
                    .attr('style', 'padding-top:0px')
                    .append(mcui_container.clone().append(title_elemnet).append(inv_element));
            }
            return mcui.clone().append(mcui_container.clone().append(inv_element));
        };
    })();
});
