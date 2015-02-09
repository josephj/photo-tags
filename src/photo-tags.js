/*global $, window, document, Mustache */
(function () {

    /**
     * @class PhotoTags
     * @example
     *
     *     new photoTags('.photo-wrapper', {
     *         tags: [
     *             {x1: 0, y1: 0, width: 100, height: 200}
     *             {x1: 100, y1: 100, width: 50, height: 100}
     *         ]
     *     });
     */
    function PhotoTags (wrapper, options) {
        var that = this;
        that.wrapper = $(wrapper);
        that.init(options);
        that.bind();
    }

    //=================
    // Constants
    //=================
    // Default imgAreaSelect options
    PhotoTags.DEFAULT_SETTING = {
        fadeSpeed: 200,
        handles: true,
        keys: {
            arrows: 15,
            shift: 5
        },
        instance: true
    };
    // Default form Mustache template
    PhotoTags.FORM_TEMPLATE = [
       '<form class="photo-tags-form photo-tags-form-hide">',
       '     <input type="hidden" name="x1">',
       '     <input type="hidden" name="y1">',
       '     <input type="hidden" name="x2">',
       '     <input type="hidden" name="y2">',
       '     <input type="hidden" name="width">',
       '     <input type="hidden" name="height">',
       '     <label class="photo-tags-form-label">',
       '         <select data-placeholder="Choose tags..." type="text" name="tag" class="photo-tags-form-input chosen-select">',
       '             <option>Leo</option>',
       '             <option>Jessica</option>',
       '             <option>Henry</option>',
       '         </select>',
       '     </label>',
       '     <button type="submit" class="photo-tags-form-button">Save</button>',
       '     <button type="reset" class="photo-tags-form-button">Cancel</button>',
       '</form>'
    ].join('\n');
    // Default selection Mustache template
    PhotoTags.TAG_TEMPLATE = [
        '<div class="photo-tags-item">',
        '    <span class="photo-tags-item-remove"></span>',
        '    <span class="photo-tags-item-label">{{label}}</span>',
        '</div>'
    ].join('\n');
    // Class or Selector prefix
    PhotoTags.PREFIX = 'photo-tags-';
    // Default selection selector
    PhotoTags.ITEM_SELECTOR = '.' + PhotoTags.PREFIX + 'item';
    // Default selection label selector
    PhotoTags.LABEL_SELECTOR = '.' + PhotoTags.PREFIX + 'item-label';
    // Default selection selector
    PhotoTags.REMOVE_SELECTOR = '.' + PhotoTags.PREFIX + 'item-remove';
    // Wrapper class
    PhotoTags.WRAPPER_CLASS = PhotoTags.PREFIX.slice(0, -1);
    // Disable class
    PhotoTags.DISABLED_CLASS = PhotoTags.PREFIX + 'disabled';

    //==================
    // Public Methods
    //==================
    var proto = {
        //================
        // Utilities
        //================
        log: function (msg, type) {
            var that = this;
            type = type || 'info';
            if (!that.debug || !window.console || !window.console[type]) {
                return;
            }
            window.console[type]('[PhotoTags] ' + msg);
        },
        //================
        // Event Handlers
        //================
        handleResize: function () {
            var that = this,
                hotspots = that.hotspots,
                imgAreaSelect = that.imgAreaSelect,
                $image = that.image,
                $tags = that.wrapper.find(PhotoTags.ITEM_SELECTOR),
                i, j, $tag, tag;

            that.log('handleResize() is executed');

            // Resize the photo tags
            // Update ratioX and ratioY
            that.ratioX = $image[0].width / that.naturalWidth;
            that.ratioY = $image[0].height / that.naturalHeight;
            for (i = 0, j = $tags.length; i < j; i++) {
                $tag = $($tags[i]);
                tag = $tag.data();
                $tag.css({
                    'left'   : parseInt(tag.x1 * that.ratioX, 10) + 'px',
                    'top'    : parseInt(tag.y1 * that.ratioY, 10) + 'px',
                    'width'  : parseInt(tag.width * that.ratioX, 10) + 'px',
                    'height' : parseInt(tag.height * that.ratioY, 10) + 'px'
                });
            }


            if (!that.enabled || !that.wrapper.hasClass(PhotoTags.PREFIX + 'active')) {
                return;
            }


            // Hide
            that.hide();
        },
        handleSelectStart: function (img, selection) {
            var that = this,
                prefix = PhotoTags.PREFIX;

            that.log('handleSelectStart() is executed');

            that.form.addClass(prefix + 'form-hide');
            that.wrapper.addClass(prefix + 'active');
        },
        handleSelectEnd: function (img, selection) {
            var that = this,
                $form = that.form,
                $img = that.wrapper.find('img'),
                prefix = PhotoTags.PREFIX,
                offset = $img.offset(),
                ratioX, ratioY;

            that.log('handleSelectStart() is executed');

            img = $img[0];

            // Save position and dimension information
            $form.find('[name=x1]').val(selection.x1 / that.ratioX);
            $form.find('[name=y1]').val(selection.y1 / that.ratioY);
            $form.find('[name=x2]').val(selection.x2 / that.ratioX);
            $form.find('[name=y2]').val(selection.y2 / that.ratioY);
            $form.find('[name=width]').val(selection.width / that.ratioX);
            $form.find('[name=height]').val(selection.height / that.ratioY);

            // Set the position of form
            $form.css('left', selection.x1 + offset.left + 'px');
            $form.css('top', selection.y2 + offset.top + 'px');

            // Toggle form visibility
            if (selection.width === 0 && selection.height === 0) {
                $form.addClass(PhotoTags.PREFIX + 'form-hide');
            } else {
                $form.removeClass(PhotoTags.PREFIX + 'form-hide');
            }

            // Trigger event
            that.onTagStart(img, selection);
        },
        handleTagRemove: function (e) {
            var that = this,
                $item = $(e.currentTarget).parents(PhotoTags.ITEM_SELECTOR),
                id = $item.attr('id');

            that.log('handleTagRemove() is executed');
            that.removeTag(id);
        },
        handleTagReset: function (e) {
            var that = this,
                $form = that.form,
                $wrapper = that.wrapper;

            that.log('handleTagSave() is executed');

            e.preventDefault();

            that.imgAreaSelect.setOptions({hide: true});
            that.imgAreaSelect.update();

            $form.addClass(PhotoTags.PREFIX + 'form-hide');
            $wrapper.removeClass(PhotoTags.PREFIX + 'active');
        },
        handleTagSave: function (e) {
            var that = this,
                $form = that.form,
                $wrapper = that.wrapper,
                $tag, tag, value;

            that.log('handleTagSave() is executed');

            e.preventDefault();

            value = $form.find('[name=tag]').val();
            if (!value) {
                return;
            }

            tag = {
                'x1': $form.find('[name=x1]').val(),
                'y1': $form.find('[name=y1]').val(),
                'x2': $form.find('[name=x2]').val(),
                'y2': $form.find('[name=y2]').val(),
                'width': $form.find('[name=width]').val(),
                'height': $form.find('[name=height]').val(),
                'label': $form.find('[name=tag] option:selected').text(),
                'value': $form.find('[name=tag]').val()
            };
            that.onBeforeTagAdd(tag);
            $tag = that.appendTag(tag);

            // Add to tags array
            that.tags.push(tag);

            // Trigger event
            that.onTagAdd($tag, tag);

            $form.addClass(PhotoTags.PREFIX + 'form-hide');
            that.imgAreaSelect.setOptions({hide: true});
            that.imgAreaSelect.update();
            $wrapper.removeClass(PhotoTags.PREFIX + 'active');
        },
        // Append a tag
        appendTag: function (tag) {
            try {

            var that = this,
                $tag = $(Mustache.render(that.tagTemplate, tag)),
                $label,
                id = tag.id;

            } catch (e) {
                console.log(that.tagTemplate);
                console.log(tag);
                alert(e.message);
            }

            that.log('appendTag() is executed');

            // Provide ID to tag if it's not provided
            if (!id) {
                id = PhotoTags.PREFIX + 'item-' + that.offset;
                $tag.attr('id', id);
                tag.id = id;
            }

            // Set position and append
            $tag
                .data(tag)
                .css({
                    'left'   : parseInt(tag.x1 * that.ratioX, 10) + 'px',
                    'top'    : parseInt(tag.y1 * that.ratioY, 10) + 'px',
                    'width'  : parseInt(tag.width * that.ratioX, 10) + 'px',
                    'height' : parseInt(tag.height * that.ratioY, 10) + 'px'
                });
            that.wrapper.append($tag);

            $label = $tag.find(PhotoTags.LABEL_SELECTOR);
            if ($label.offset().top < that.wrapper.offset().top) {
                $label.addClass(PhotoTags.PREFIX + 'item-label-bottom');
            }

            that.offset += 1;

            that.onTagAppend($tag, tag);

            return $tag;
        },
        removeTag: function (id) {
            var that = this,
                $tag,
                i;

            that.log('removeTag() is executed');

            $tag = that.wrapper.find('#' + id);
            $tag.remove();
            for (i = that.tags.length - 1; i >= 0; i--) {
                if (id === that.tags[i].id) {
                    that.tags.splice(i, 1);
                    break;
                }
            }
            that.onTagRemove(id);
        },
        hide: function () {
            var that = this;

            that.log('hide() is executed');

            that.wrapper.removeClass(PhotoTags.PREFIX + 'active');
            that.form.addClass(PhotoTags.PREFIX + 'form-hide');
            that.imgAreaSelect.setOptions({hide: true});
            // [STAC-4270] Clear selection manually.
            $('.imgareaselect-outer').remove();
            that.imgAreaSelect.update();
        },
        enable: function () {
            var that = this;

            that.log('enable() is executed');

            that.toggle(true);
        },
        disable: function () {
            var that = this;

            that.log('disable() is executed');

            that.toggle(false);
        },
        toggle: function (enable) {
            var that = this,
                $wrapper = that.wrapper,
                options;

            // Stop if the next state is same w/ current state
            if (enable === that.enabled) {
                return;
            }

            // Reverse
            if (typeof enable === 'undefined') {
                enable = !(that.enabled);
            }

            that.log('toggle(' + enable + ') is executed');

            options = (enable) ? {disable: false} : {hide: true, disable: true};
            that.imgAreaSelect.setOptions(options);
            that.imgAreaSelect.update();
            $wrapper.toggleClass(PhotoTags.DISABLED_CLASS, !(enable));
            that.enabled = enable;
        },
        //======================
        // Lifecycle Methods
        //======================
        // Initialize all properties
        init: function (options) {
            var that = this,
                $image = that.wrapper.find('img');

            that.log('init() is executed');

            // Properties: wrapper, debug, form, offset, tags
            options = options || {};
            that.options = $.extend({}, options); // Hack - Avoid byref issue

            that.debug = (options.debug && options.debug !== '0') ? true : false;
            that.enabled = (options.enabled === false) ? false : true;
            that.editable = (options.editable === false) ? false : true;
            that.offset = 0; // A serial no when we manually create tag id
            that.tags = (options.tags && $.isArray(options.tags)) ? options.tags : [];
            that.form = options.form || $(PhotoTags.FORM_TEMPLATE);
            that.imgAreaSelect = null;
            that.image = $image;
            that.tagTemplate = options.tagTemplate || PhotoTags.TAG_TEMPLATE;

            that.naturalWidth = $image[0].naturalWidth || $image.data('max-width');
            that.naturalWidth = parseInt(that.naturalWidth, 10);
            that.naturalHeight = $image[0].naturalHeight || $image.data('max-height');
            that.naturalHeight = parseInt(that.naturalHeight, 10);
            that.ratioX = $image[0].width / that.naturalWidth;
            that.ratioY = $image[0].height / that.naturalHeight;

            // Event callbacks: tagAppend, tagStart, tagEnd, beforeTagAdd, tagAdd,
            //                  tagRemove, tagOver, tagOut, tagClick, render
            that.onTagAppend = options.onTagAppend || function () {};
            that.onTagStart = options.onTagStart || function () {};
            that.onBeforeTagAdd = options.onBeforeTagAdd || function () {};
            that.onTagAdd = options.onTagAdd || function () {};
            that.onTagRemove = options.onTagRemove || function () {};
            that.onTagOver = options.onTagOver || function () {};
            that.onTagOut = options.onTagOut || function () {};
            that.onTagClick = options.onTagClick || function () {};
            that.onRender = options.onRender || function () {};
        },
        // Set event binding
        bind: function () {
            var that = this,
                $form = that.form,
                $wrapper = that.wrapper;

            that.log('bind() is executed');

            $wrapper.on('click.phototags', PhotoTags.ITEM_SELECTOR, function (e) {that.onTagClick($(e.currentTarget));});
            $wrapper.on('click.phototags', PhotoTags.REMOVE_SELECTOR, function (e) {e.stopPropagation();that.onTagOut($(e.currentTarget));});
            $wrapper.on('mouseenter.phototags', PhotoTags.ITEM_SELECTOR, function (e) {that.onTagOver($(e.currentTarget));});
            $wrapper.on('click.phototags', PhotoTags.REMOVE_SELECTOR, $.proxy(that.handleTagRemove, that));
            $form.on('submit', $.proxy(that.handleTagSave, that));
            $form.on('reset', $.proxy(that.handleTagReset, that));
            $(window).resize($.proxy(that.handleResize, that));
        },
        // Render UI
        render: function () {
            var that = this,
                $form = that.form,
                $wrapper = that.wrapper,
                options = {},
                tags = that.tags,
                i;

            that.log('render() is executed');

            // 1. Render Form
            $(document.body).append($form); // Escape from the mask overlays
            $form.css('zIndex', 2001); // FIXME
            // 2. Render imgAreaSelect
            options = $.extend({
                zIndex: 1043, // FIXME
                hide: (!that.enabled) ? true : false,
                disable: (!that.enabled) ? true : false,
                onSelectStart: $.proxy(that.handleSelectStart, that),
                onSelectEnd: $.proxy(that.handleSelectEnd, that)
            }, PhotoTags.DEFAULT_SETTING);
            // Hide the imgAreaSelect if the editable attribute being set to false
            if (!that.editable) {
                options.disable = true;
                options.hide = true;
            }
            that.imgAreaSelect = $wrapper.find('img').imgAreaSelect(options);

            // 3. Render exisiting tags/selections
            for (i in tags) {
                if (tags.hasOwnProperty(i)) {
                    that.appendTag(tags[i]);
                }
            }
            // 4. Add class to wrapper
            $wrapper.addClass(PhotoTags.WRAPPER_CLASS);
            // 5. Finish and trigger event
            that.onRender($wrapper, that.tags);

            if (!that.enabled) {
                $wrapper.addClass(PhotoTags.DISABLED_CLASS);
            }
        },
        // Destroy current instance
        destroy: function () {
            var that = this;

            that.log('destroy() is executed');

            that.wrapper
                .unbind('click.phototags')
                .unbind('mouseenter.phototags')
                .unbind('mouseleave.phototags');
            that.imgAreaSelect.setOptions({remove: true});
            that.imgAreaSelect.update();
            that.form.remove();
            that.wrapper.find(PhotoTags.ITEM_SELECTOR).remove();
            that = null;
        }
    };
    $.extend(PhotoTags.prototype, proto);

    // Promote to global
    if (!window.Stackla) {
        window.Stackla = {};
    }
    window.Stackla.PhotoTags = PhotoTags;

}());
