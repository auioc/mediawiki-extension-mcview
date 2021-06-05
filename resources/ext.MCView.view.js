/* global mw */

/**
 * @typedef {Object} ItemStack
 * @property {string} id - Item id, namespace:name.
 * @property {number} count - Stack count.
 */

// eslint-disable-next-line no-unused-vars
mw.hook('wikipage.categories').add(() => {
    (async () => {
        $.ajax({
            type: 'GET',
            url: mw.config.get('wgMCViewMapFile'),
            dataType: 'json',
            success: (j) => {
                console.log('[MCView] MapJson: %o', j);
                window.MCView = {};
                window.MCView.map = j;
                render();
            },
        });

        const error_message = (message) => {
            return $('<div></div>')
                .html(`[MCViewC]解析失败: ${message}`)
                .addClass('mcview-error');
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
        // const mcui_anvil_hammer = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><defs><style>.a{fill:#444;}.b{fill:#493615;}.c{fill:#281e0b;}.d{fill:#684e1e;}.e{fill:#896727;}.f{fill:#c1c1c1;}.g{fill:#d8d8d8;}.h{fill:#fff;}</style></defs><polygon class="a" points="14 12 14 10 12 10 12 8 10 8 10 6 12 6 12 4 14 4 14 2 16 2 16 4 18 4 18 6 20 6 20 8 22 8 22 10 24 10 24 12 26 12 26 14 28 14 28 16 26 16 26 18 24 18 24 20 22 20 22 18 20 18 20 16 18 16 18 18 20 18 20 20 22 20 22 22 22.88 22 24 22 24 20 26 20 26 18 28 18 28 16 30 16 30 14 28 14 28 12 26 12 26 10 24 10 24 8 22 8 22 6 20 6 20 4 18 4 18 2 16 2 16 0 14 0 14 2 12 2 12 4 10 4 10 6 8 6 8 8 10 8 10 10 12 10 12 12 14 12"/><polygon class="b" points="0 26 2 26 2 24 4 24 4 22 6 22 6 20 8 20 8 18 10 18 10 16 12 16 12 14 14 14 14 12 16 12 16 14 14 14 14 16 12 16 12 18 10 18 10 20 8 20 8 22 6 22 6 24 4 24 4 26 2 26 2 28 0 28 0 26"/><polyline class="b" points="20 4 22 4 22 6 20 6"/><polygon class="c" points="2 28 4 28 4 26 6 26 6 24 8 24 8 22 10 22 10 20 12 20 12 18 14 18 14 16 16 16 16 14 18 14 18 16 16 16 16 18 14 18 14 20 12 20 12 22 10 22 10 24 8 24 8 26 6 26 6 28 4 28 4 30 2 30 2 28"/><polyline class="c" points="24 8 26 8 26 10 24 10"/><rect class="d" y="28" width="2" height="2"/><rect class="d" x="4" y="24" width="2" height="2"/><rect class="d" x="8" y="20" width="2" height="2"/><rect class="d" x="12" y="16" width="2" height="2"/><rect class="d" x="22" y="6" width="2" height="2"/><rect class="e" x="2" y="26" width="2" height="2"/><rect class="e" x="6" y="22" width="2" height="2"/><rect class="e" x="10" y="18" width="2" height="2"/><rect class="e" x="14" y="14" width="2" height="2"/><polygon class="f" points="18 6 20 6 20 8 22 8 22 10 24 10 24 12 22 12 22 10 20 10 20 8 18 8 18 6"/><rect class="g" x="16" y="4" width="2" height="2"/><rect class="g" x="12" y="8" width="2" height="2"/><rect class="g" x="20" y="16" width="2" height="2"/><rect class="g" x="24" y="12" width="2" height="2"/><polygon class="h" points="10 8 10 6 12 6 12 4 14 4 14 2 16 2 16 6 18 6 18 8 20 8 20 10 22 10 22 12 24 12 24 14 28 14 28 16 26 16 26 18 24 18 24 20 22 20 22 16 18 16 18 14 16 14 16 12 14 12 14 10 14 8 10 8"/></svg>';

        const render = () => {
            $('div.mcview-wrapper').each((index, element_item) => {
                let element = $(element_item);
                let type = element.data('mcview-type');
                element.removeAttr('data-mcview-type');

                if (element.children('.mcview-data').length === 0) {
                    element.html(error_message('无效的Wrapper'));
                    return true;
                }

                let data = {};
                try {
                    data = JSON.parse(element.children('.mcview-data').html());
                } catch (error) {
                    element.html(error_message(`无效的JSON数据 ${error}`));
                    return true;
                }

                switch (type) {
                    case 'itemstack': {
                        element.append(createItemStack(data));
                        break;
                    }
                    case 'itemicon': {
                        element.append(createItemIcon(data));
                        break;
                    }
                    case 'crafting': {
                        element.append(
                            createCraftTable(
                                data.input,
                                data.output,
                                data.shapeless
                            )
                        );
                        break;
                    }
                    case 'smelting': {
                        element.append(
                            createFurnace(data.input, data.output, data.exp)
                        );
                        break;
                    }

                    case 'processing-a':
                    case 'processing-b':
                    case 'processing-c':
                    case 'processing-d': {
                        element.append(
                            createProcessor(
                                type.split('-')[1],
                                data.input,
                                data.output
                            )
                        );
                        break;
                    }
                    case 'inventory': {
                        element.append(
                            createInventory(data.items, data.size, data.title)
                        );
                        break;
                    }
                    default: {
                        element.append(error_message(`未知的类型:${type}`));
                        break;
                    }
                }
            });
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
                    let createAnimatedSlot = (
                        itemstack_array,
                        warpper_element
                    ) => {
                        let animated_slot =
                            $('<div></div>').addClass('mcui-slot animated');

                        Array.from(itemstack_array).forEach(
                            (item_stack, index) => {
                                animated_slot.append(
                                    $('<div></div>')
                                        .append(createItemStack(item_stack))
                                        .attr(
                                            'style',
                                            index > 0 ? 'display:none' : ''
                                        )
                                        .addClass('animate-item')
                                );
                            }
                        );

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
                                    if (
                                        switch_item_timer.index ==
                                        itemstack_array.length
                                    ) {
                                        switch_item_timer.index = 0;
                                    }
                                }, 1000);
                            },
                            suspend: function () {
                                clearInterval(switch_item_timer.timer);
                            },
                        };
                        switch_item_timer.start();

                        warpper_element
                            .get(0)
                            .addEventListener('mouseover', () => {
                                switch_item_timer.suspend();
                            });
                        warpper_element
                            .get(0)
                            .addEventListener('mouseleave', () => {
                                switch_item_timer.start();
                            });

                        return animated_slot;
                    };

                    return createAnimatedSlot(slot_items, warpper_element);
                } else {
                    return $('<div></div>')
                        .append(createItemStack(slot_items[0]))
                        .addClass('mcui-slot');
                }
            } else {
                return $('<div></div>')
                    .append(createItemStack(slot_items))
                    .addClass('mcui-slot');
            }
        };

        /**
         * @param {ItemStack} item_stack
         * @return {JQuery<HTMLElement>}
         */
        const createItemStack = (item_stack) => {
            if (item_stack === null) {
                return $('<div class="mcui-slot-placeholder"></div>');
            }

            let id = String(item_stack.id).split(':');
            let namespace = id[0],
                name = id[1];

            let stacksize = parseInt(item_stack.count);

            let item_map = window.MCView.map[namespace].item;

            let style_id = `mcview-itemstack-${namespace}`;
            if ($(`style#${style_id}`).length == 0) {
                $('head').append(`<style id="${style_id}"></style>`);
                $(`style#${style_id}`).append(
                    `.mcview.item-image-medium.${namespace}{background-image:url(${item_map.image.medium});}`
                );
                $(`style#${style_id}`).append(
                    `.mcview.item-image-large.${namespace}{background-image:url(${item_map.image.large});}`
                );
            }

            let item = item_map.map[name];

            let element = $('<div></div>').addClass('mcview-itemstack');

            if (item) {
                let image_left = item.index % 32;
                let image_top = parseInt(item.index / 32);

                let image_html = $('<div></div>')
                    .addClass(
                        `mcview item-image item-image-medium ${namespace}`
                    )
                    .css(
                        'background-position',
                        `-${image_left * 32}px -${image_top * 32}px`
                    );
                element.append(image_html);

                let stackcount_html = $('<span></span>')
                    .addClass('mcview item-stacksize mcfont')
                    .html(stacksize > 1 ? stacksize : '');
                element.append(stackcount_html);

                let tooltip = $('<div></div>')
                    .addClass('mcview item-tooltip')
                    .append(
                        `<div class="zh-name">${item.zh_name} (${item.en_name})</div>`
                    )
                    .append(
                        `<div class="register-name">${item.register_name}</div>`
                    )
                    .append(
                        `<div class="item-preview"><div class="mcview item-image-large ${namespace}" style="background-position:-${
                            image_left * 128
                        }px -${image_top * 128}px"></div></div>`
                    );
                element.append(tooltip);
            } else {
                element.append(
                    `<span style="color:red">MCView解析失败: 映射表中不存在item:${namespace}:${name}</span>`
                );
            }

            return element;
        };

        /**
         * @deprecated
         * @param {string} item_id
         * @return {JQuery<HTMLElement>}
         */
        const createItemIcon = (item_id) => {
            item_id = item_id.split(':');
            let namespace = item_id[0];
            let name = item_id[1];
            let item_map = window.MCView.map[namespace].item;
            let style_id = `mcview-itemicon-${namespace}`;
            if ($(`style#${style_id}`).length == 0) {
                $('head').append(`<style id="${style_id}"></style>`);
                $(`style#${style_id}`).append(
                    `.mcview.item-image-small.${namespace}{background-image:url(${item_map.image.small});}`
                );
            }
            let item = item_map.map[name];
            let element = $('<div></div>');
            element.addClass('mcview-itemicon');
            if (item) {
                element.append(
                    $('<div></div>')
                        .css(
                            'background-position',
                            `-${(item.index % 32) * 16}px -${
                                parseInt(item.index / 32) * 16
                            }px`
                        )
                        .addClass(
                            `mcview item-image item-image-small ${namespace}`
                        )
                );
            } else {
                element.append(
                    `<span style="color:red">MCView解析失败: 映射表中不存在item:${namespace}:${name}</span>`
                );
            }
            return element;
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
                input_element.append(
                    $('<div></div>').addClass(`mcui-row row-${i} frow`)
                );
            }
            Array.from(input).forEach((input_row, index) => {
                let row = input_element.children(`.mcui-row.row-${index}`);
                Array.from(input_row).forEach((input_slot) => {
                    row.append(createItemSlot(input_slot, table));
                });
                input_element.append(row);
            });
            table.append(input_element);

            table.append(
                $('<div></div>')
                    .addClass('mcui-arrow mcui-inactive')
                    .append(mcui_arrow_a)
            ); //arrow

            table.append(
                $('<div></div>')
                    .addClass('mcui-output')
                    .append(createItemSlot(output, table).addClass('large'))
            ); //output

            if (shapeless) {
                table.append(
                    $('<div></div>')
                        .addClass('mcui-icon craft-shapeless mcui-inactive')
                        .attr(
                            'title',
                            '此配方是无序的，原料可以放置在合成网格的任意位置。'
                        )
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
                input_element.append(
                    $('<div></div>').addClass(`mcui-row row-${i} frow`)
                );
            }
            input_element
                .children('.mcui-row.row-1')
                .append(mcui_fuel)
                .addClass('mcui-fuel mcui-inactive');
            Array.from(input).forEach((input_slot, index) => {
                let row = input_element.children(
                    `.mcui-row.row-${index == 0 ? index : 2}`
                );
                row.append(createItemSlot(input_slot, furnace));
            });
            furnace.append(input_element);

            furnace.append(
                $('<div></div>')
                    .addClass('mcui-arrow mcui-inactive')
                    .append(mcui_arrow_b)
            ); // arrow

            furnace.append(
                $('<div></div>')
                    .addClass('mcui-output')
                    .append(createItemSlot(output, furnace).addClass('large'))
            ); // output

            let exp_element = $('<div></div>');
            exp_element.append(`<div>${exp}</div>`);

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
                    .append(
                        $('<div></div>')
                            .addClass('mcui-input')
                            .append($('<div></div>').addClass('mcui-row frow'))
                    ) // input
                    .append(
                        $('<div></div>')
                            .addClass('mcui-arrow mcui-inactive')
                            .append(mcui_arrow_b)
                    ) // arrow
                    .append(
                        $('<div></div>')
                            .addClass('mcui-output')
                            .append($('<div></div>').addClass('mcui-row frow'))
                    ) // output
            );

            let input_element = element.find('.mcui-input>.mcui-row');
            let output_element = element.find('.mcui-output>.mcui-row');

            let plus_element = $('<div></div>')
                .addClass('mcui-plus mcui-inactive')
                .append(mcui_plus);

            switch (type.toLowerCase()) {
                case 'a': {
                    input_element.append(createItemSlot(input));
                    output_element.append(createItemSlot(output));
                    break;
                }
                case 'b': {
                    input_element
                        .append(createItemSlot(input[0]))
                        .append(plus_element)
                        .append(createItemSlot(input[1]));
                    output_element.append(createItemSlot(output));
                    break;
                }
                case 'c': {
                    input_element.append(createItemSlot(input));
                    output_element
                        .append(createItemSlot(output[0]))
                        .append(plus_element)
                        .append(createItemSlot(output[1]));
                    break;
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
                    break;
                }
                default:
                    break;
            }

            return element;
        };

        /**
         * @typedef {Object} InventoryItem
         * @property {number} index
         * @property {ItemStack} item
         */
        /**
         * @param {InventoryItem[]} item_list
         * @param {number[]} size
         * @param {string} title
         * @return {JQuery<HTMLElement>}
         */
        const createInventory = (item_list, size, title) => {
            let inv_element = $('<div></div>').addClass('mcui-inventory');
            for (let r = 0; r < size[1]; r++) {
                let row_element = $('<div></div>').addClass(
                    `mcui-row row-${r} frow`
                );
                for (let s = 0; s < size[0]; s++) {
                    row_element.append(
                        $('<div></div>').addClass(
                            `mcui-slot slot-${
                                r * size[0] + s
                            } mcui-col col-${s}`
                        )
                    );
                }
                inv_element.append(row_element);
            }

            item_list.forEach((slot_item) => {
                if (Object.prototype.hasOwnProperty.call(slot_item, 'index')) {
                    inv_element
                        .find(
                            `.mcui-row>.mcui-slot.slot-${Number(
                                slot_item.index
                            )}`
                        )
                        .append(createItemStack(slot_item.item));
                    return true;
                }
                if (Object.prototype.hasOwnProperty.call(slot_item, 'pos')) {
                    inv_element
                        .find(
                            `.mcui-row.row-${slot_item.pos[0]}>.mcui-col.col-${slot_item.pos[1]}`
                        )
                        .append(createItemStack(slot_item.item));
                    return true;
                }
            });

            let title_elemnet = mcui_title.clone().html(title);

            return mcui
                .clone()
                .attr('style', 'padding-top:0px')
                .append(
                    mcui_container
                        .clone()
                        .append(title_elemnet)
                        .append(inv_element)
                );
        };
    })();
});
