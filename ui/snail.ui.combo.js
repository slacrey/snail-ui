/*!
 * Snail UI Button @VERSION
 *
 * Depends:
 *	snail.ui.core.js
 *	snail.ui.widget.js
 */
(function ($, undefined) {

    var CLASS = {
        active:'sn-state-active',
        hover:'sn-state-hover',
        focus:'sn-state-focus',
        item:'sn-droplist-item',
        emptyTextClass:'sn-empty-text',
        disabled:'sn-state-disabled'
    }

    $.widget("sn.combo", {
        version:"@VERSION",
        options:{
            listAutoWidth:true,
            listMaxHeight:'200',
            listHeight:200,
            readOnly:true,
            disabled:false,
            multi:false,
            multiSeparator:',',
            emptyText:'请选择...',
            valueField:'value',
            inputField:'text',
            optionField:'text',
            value:'',
            dataSource:null
        },
        _create:function () {
            var valueEl = this.element,
                htmlButton = '<a class="sn-combo-button sn-combo-down sn-corner-br sn-button sn-state-default sn-button-text-only" tabindex="-1" role="button">'
                    + '<span class="sn-button-text"><span class="sn-icon sn-icon-triangle-1-s">down</span></span></a>';
            var span = $('<span class="sn-combo sn-widget sn-widget-content sn-corner-all"></span>').insertAfter(valueEl).wrapInner(valueEl);
            this.textInput = valueEl.clone().removeAttr("id").removeAttr("name").addClass("sn-combo-input sn-corner-left").appendTo(span);
            this.expandTrigger = $(htmlButton).appendTo(span);
            valueEl.hide();
            this.dropList = $($('<div id="drop-list" class="sn-widget sn-widget-content sn-corner-all sn-helper-reset"><div class="sn-droplist"></div></div>').css({position:'absolute', zIndex:2000}).appendTo(document.body).children()[0]).hide();
            this.dropList.css({
                'display':'block'
            });
        },

        _init:function () {
            var self = this, options = self.options,
                valueEl = self.element, inputEl = self.textInput;

            this._refeshEmptyText(options.emptyText);

            options.disabled ? inputEl.attr('disabled', true) : inputEl.removeAttr('disabled');
            options.readOnly ? inputEl.attr('readonly', 'readOnly') : inputEl.removeAttr('readonly');

            self._initCombo();

            var unusable = options.disabled;
            if (unusable) {
                self.expandTrigger.addClass('sn-state-disabled');
            } else {
                self._bindEvent();
            }

        },

        widget:function () {
            return this.buttonElement;
        },

        _destroy:function () {
            var self = this,
                options = self.options, inputEl = self.textInput,
                valueInput = self.element, dropList = self.dropList,
                expandTrigger = self.expandTrigger;


        },

        _initCombo:function () {
            var self = this,
                options = self.options, source = options.dataSource,
                value = options.value, valueInput = self.element;

            if (source && typeof source == 'string') {
//                self._ajaxLoad(source);
            } else if (source && typeof source == 'object') {
                self._loadData(source);
            } else {
                self.dataHasLoaded = true;
            }

        },

        _bindEvent:function () {
            var self = this,
                options = self.options, inputEl = self.textInput,
                dropList = self.dropList,
                expandTrigger = self.expandTrigger, isFocus = self.isFocus = false;
            expandTrigger.unbind().bind('click',
                function (event) {
                    event.preventDefault();
                    if (isFocus) {
                        return;
                    }

                    if (!options.disabled) {
                        self._showDropList();
                    }
                }).bind("mouseover",
                function () {
                    if (!options.disabled) {
                        $(this).addClass(CLASS.hover);
                    }
                }).bind('mouseout',
                function () {
                    $(this).removeClass(CLASS.hover);
                }).bind('mousedown', function (event) {
                    event.stopPropagation();
                });
            inputEl.unbind().bind('focus',
                function (event) {
                    if (isFocus)
                        return;

                    if (!options.disabled) {
                        self._showDropList();
                    }
                }).bind('mousedown',
                function (event) {
                    event.stopPropagation();
                });

            dropList.mousedown(function (event) {
                event.stopPropagation(); //document的mousedown会隐藏下拉框，这里要阻止冒泡
            });
            $(document).bind('mousedown.combo', this.globalEvent = function () {
                self._hideDropList();
            });
        },

        _hideDropList:function () {
            var self = this,
                dropList = self.dropList,
                dropListContainer = dropList.parent(),
                expandTrigger = self.expandTrigger;
            dropListContainer.hide();
            dropList.hide();
            self.isFocus = false;
            expandTrigger.removeClass(CLASS.active);
        },

        _showDropList:function () {
            var self = this, options = self.options,
                inputEl = self.textInput, valueInput = self.element,
                dropList = self.dropList.scrollTop(0).css('height', options.listHeight),
                nowValue = valueInput.val(), valuedItem,
                allItems = self._getAllOptionsBeforeFiltered().removeClass(CLASS.hover),
                expandTrigger = self.expandTrigger, enableMulti = options.multi;

            self.isFocus = false;
            expandTrigger.addClass(CLASS.active);
            if (allItems.size() <= 0) { //如果下拉框没有数据
                return;
            }

            allItems.removeClass(CLASS.focus);
            if (nowValue !== undefined && nowValue !== '') {
                var allValues = $.data(valueInput, 'allValues');
                if (options.multi) {
                    var selectedValues = nowValue.split(options.multiSeparator);
                    for (var i = 0; i < selectedValues.length; i++) {
                        var index = selectedValues ? $.inArray(selectedValues[i], allValues) : -1;
                        if (index > -1) {
                            $(allItems.get(index)).addClass(CLASS.focus);
                        }
                    }
                    valuedItem = selectedValues[0];
                } else {
                    var index = allValues ? $.inArray(nowValue, allValues) : -1;
                    if (index > -1) {
                        valuedItem = $(allItems.get(index)).addClass(CLASS.focus);
                    }
                }
            }

            var dropListContainer = dropList.parent(), span = inputEl.parent();
            dropList.width(span.outerWidth() - 6);
            if (!options.listAutoWidth) {
                dropListContainer.width(span.outerWidth() - 6);
            } else {
                if ($.browser.msie && ($.browser.version == "7.0") && !$.support.style) {
                    dropListContainer.width(dropList.show().outerWidth());
                } else {
                    dropListContainer.width(dropList.outerWidth());
                }
            }
            if (options.listHeight != 'auto' && dropList.show().height() > options.listHeight) {
                dropList.height(options.listHeight).css({
                    'overflow-y':'scroll',
                    'overflow-x':'hidden'
                });
            }
            var inputPos = span.offset();
            dropListContainer.css({
                'left':inputPos.left,
                'top':inputPos.top + span.outerHeight()
            });
            dropList.show();
            dropListContainer.show();
            if (valuedItem && !enableMulti) { //自动滚动滚动条到高亮的行
                dropList.scrollTop($(valuedItem).parent().offset().top - dropList.offset().top);
            }
        },

        _setOption:function (key, value) {
            this._super(key, value);
            if (key === "disabled") {
                if (value) {
                    this.element.prop("disabled", true);
                } else {
                    this.element.prop("disabled", false);
                }
                return;
            }
        },

        _loadData:function (records) {
            var self = this, options = this.options,
                valueEl = this.element;
            options.dataSource = records;
            self.dataHasLoaded = true;
            //build all inputText
            var inputField = options.inputField;
            var allInputText = [];
            if (typeof inputField === 'string') {
                $(records).each(function () {
                    allInputText.push(this[inputField]);
                });
            } else {
                $(records).each(function (index) {
                    allInputText.push(inputField(this, index));
                });
            }
            $.data(valueEl, 'allInputText', allInputText);

            //build all value
            var valueField = options.valueField;
            var allValues = [];
            if (typeof valueField === 'string') {
                $(records).each(function () {
                    allValues.push('' + this[valueField]);
                });
            } else {
                $(records).each(function (index) {
                    allValues.push('' + valueField(this, index));
                });
            }
            $.data(valueEl, 'allValues', allValues);

            //build dropList
            var dropList = this.dropList.empty();
            if (options.listProvider) {
                var selectableOptions = options.listProvider(dropList, records);
                if (selectableOptions) {
                    selectableOptions.each(function () {
                        $(this).addClass(CLASS.item);
                    });
                }
            } else {
                var optionField = options.optionField;
                var innerHtml = '';
                var self = this;
                if (typeof optionField === 'string') {
                    $(records).each(function (index) {
                        innerHtml += self._wrapText(index, this[options.optionField]);
                    });
                } else {
                    $(records).each(function (index) {
                        innerHtml += self._wrapText(index, options.optionField(this, index));
                    });
                }
                if (innerHtml) {
                    $(innerHtml).appendTo(dropList);
                    dropList.show().css('height', 'auto');
                    if (options.listMaxHeight != 'auto' && dropList.height() > options.listMaxHeight) {
                        dropList.height(options.listMaxHeight).css('overflow-y', 'auto');
                    }
                    dropList.hide();
                    if (valueEl.parent().hasClass(CLASS.hover)) {
                        self._showDropList();
                    }
                }
            }

            if (options.value) {
                this._setValue('' + options.value);
            }
            this._bindEventsToList();
        },
        _bindEventsToList:function () {
            var self = this,
                items = self._getAllOptionsBeforeFiltered();
            items.hover(
                function () {
                    items.removeClass(CLASS.active);
                    $(this).addClass(CLASS.active);
                },
                function () {
                    $(this).removeClass(CLASS.active);
                }).mousedown(function () {
                    self._backfill(this);
                });
        },
        _backfill:function (source) {
            if (source.length === 0) {
                return;
            }

            var self = this, valueEl = self.element,
                dropList = self.dropList,
                options = self.options,
                enableMulti = options.multi,
                items = self._getAllOptionsBeforeFiltered();

            if (enableMulti) {
                $(source).toggleClass(CLASS.focus).removeClass(CLASS.active);
            } else {
                items.removeClass(CLASS.focus);
                $(source).addClass(CLASS.focus);
            }

            if (dropList.css('display') == 'none') {
                return;
            }
            var value = [], selectedIndexs = $(dropList.children());
            for (var i = 0; i < selectedIndexs.length; i++) {
                var dItem = $($(selectedIndexs[i]).children()[0]);
                if (dItem.hasClass(CLASS.focus)) {
                    var nowIndex = $(selectedIndexs[i]).index();
                    if (nowIndex > -1) {
                        value.push($.data(valueEl, 'allValues')[nowIndex]);
                    }
                }
            }

            this._setValue(value.join(enableMulti ? options.multiSeparator : ''));
            if (!enableMulti) {
                self._hideDropList();
            }
        },
        _findHighlightItem:function () {
            var dropList = this.dropList;
            var hoverItem = dropList.find('.sn-state-active');

            // only one item hover
            if (hoverItem.length > 0) {
                return hoverItem;
            }
            var selectedItems = dropList.find('.sn-state-focus');
            return selectedItems.length > 0 ? selectedItems[0] : selectedItems;
        },
        _getAllOptionsBeforeFiltered:function () {
            var self = this;
            return $(self.dropList.find('.sn-select-item'));
        },
        _wrapText:function (index, text) {
            return '<div class="sn-droplist-item"><a href="#" id="sn-id-'
                + index + '" class="sn-corner-all sn-select-item" tabindex="-1" role="selectitem">'
                + text + '</a></div>';
        },
        value:function (v) {
            var self = this;
            if (typeof v === 'undefined') {
                var value = self.element.val();
                return value ? value : '';
            } else {
                self._setValue(v + '');
                return self;
            }
        },
        _setValue:function (value) {
            var input = this.textInput, valueEl = this.element;
            var valueChange = true;
            var oldValue = valueEl.val();
            var options = this.options;
            if (value == oldValue) {
                valueChange = false;
            }
            var allValues = $.data(valueEl, 'allValues');

            var inputText = [], values = [];
            if (options.multi) {
                values = value.split(options.multiSeparator);
            } else {
                values.push(value);
            }
            for (var i = 0; i < values.length; i++) {
                var index = allValues ? $.inArray(values[i], allValues) : -1;
                if (index > -1) {
                    inputText.push($.data(valueEl, 'allInputText')[index]);
                } else if (!options.forceSelection) {
                    //与getValue保持一致，当setValue的值不在allVlues中，则将value值作为text显示在输入框中。bug616。
                    inputText.push(value);
                } else {
                    valueEl.val('');
                    value = '';
                }
            }
            valueEl.val(value);
            if (options.multi) {
                input.val(inputText.join(options.multiSeparator));
            } else {
                input.val(inputText.join(''));
            }
            options.value = value;
            // trigger onValueChange event
            if (options.onValueChange && valueChange) {
                this._trigger("onValueChange", null, input, value, oldValue);
            }
            //refresh the emptyText
            this._refeshEmptyText(options.emptyText);
        },
        _refeshEmptyText:function (emptyText) {
            var self = this, inputEl = this.textInput;
            if (!emptyText)
                return;
            if (inputEl.val() === '') {
                inputEl.val(emptyText).addClass(CLASS.emptyTextClass);
            } else {
                if (inputEl.val() === emptyText) {
                    inputEl.val('');
                }
                inputEl.removeClass(CLASS.emptyTextClass);
            }
        }
    });

}(jQuery) );
