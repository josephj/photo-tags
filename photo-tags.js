/*global $, window */
(function () {

    /**
     * @class PhotoTags
     * @example
     *
     *     new photoTags('.photo-wrapper', {
     *         tags: [
     *             {x: 0, y: 0, width: 100, height: 200}
     *             {x: 100, y: 100, width: 50, height: 100}
     *         ]
     *     });
     */
    function PhotoTags (el, options) {
        var that = this,
            $el = $(el);

        options = options || {};

        that.el = $el;

        // Options
        that.form = options.form || $(PhotoTags.FORM_TEMPLATE);
        that.offset = 0;
        that.options = $.extend({}, options);
        that.saveUrl = options.saveUrl || null;
        that.saveCallback = options.saveCallback || function () {};
        that.tags = options.tags || [];

        // Event options
        that.onTagStart = options.onTagStart || function () {};
        that.onTagEnd = options.onTagEnd || function () {};
        that.onTagAdded = options.onTagAdd || function () {};
        that.onTagOver = options.onTagOver || function () {};
        that.onTagOut = options.onTagOut || function () {};
        that.onTagClick = options.onTagClick || function () {};
        that.onRender = options.onRender || function () {};

        // Bind Event
        $el.on('click', '.photo-tags-item', function (e) {that.onTagClick($(e.currentTarget));});
        $el.on('mouseenter', '.photo-tags-item', function (e) {that.onTagOver($(e.currentTarget));});
        $el.on('mouseleave', '.photo-tags-item', function (e) {that.onTagOut($(e.currentTarget));});
        $el.on('submit', '.photo-tags-form', $.proxy(that.handleTagSave, that));
    }

    //=================
    // Constants
    //=================
    PhotoTags.DEFAULT_SETTING = {
        disable: false,
        handles: true,
        keys: {
            arrows: 15,
            shift: 5
        },
        fadeSpeed: 200,
    };

    PhotoTags.FORM_TEMPLATE = [
       '<form class="photo-tags-form photo-tags-form-hide">',
       '     <input type="hidden" name="x1">',
       '     <input type="hidden" name="y1">',
       '     <input type="hidden" name="x2">',
       '     <input type="hidden" name="y2">',
       '     <input type="hidden" name="w">',
       '     <input type="hidden" name="h">',
       '     <label class="photo-tags-form-label">',
       '         <select data-placeholder="Choose tags..." type="text" name="tag" class="photo-tags-form-input chosen-select">',
       '             <option>Leo</option>',
       '             <option>Jessica</option>',
       '             <option>Henry</option>',
       '         </select>',
       '     </label>',
       '     <button type="submit" class="photo-tags-form-button">Save</button>',
       '</form>'
    ].join('\n');

    PhotoTags.ITEM_TEMPLATE = [
        '<div class="photo-tags-item">',
        '    <span class="photo-tags-item-label">{{label}}</span>',
        '</div>'
    ].join('\n');

    PhotoTags.PREFIX = 'photo-tags-';

    //==================
    // Public Methods
    //==================
    var proto = {
        log: function (msg, type) {
            type = type || 'info';
            if (!window.console || window.console[type]) {
                return;
            }
            window.console[type](msg);
        },
        /**
         * Handles when a new tag being saved.
         * @method handleTagSave
         */
        handleTagSave: function (e) {
            var that = this,
                $form = that.form,
                $el = that.el;
            that.log('handleTagSave() is executed');
            e.preventDefault();
            if (that.saveUrl) {
                $.ajax({
                    url: that.saveUrl,
                    data: $form.serialize(),
                    success: function () {

                    },
                    fail: function () {

                    }
                });
            } else {
                var tag = that.appendTag({
                    'x': $form.find('[name=x1]').val(),
                    'y': $form.find('[name=y1]').val(),
                    'w': $form.find('[name=w]').val(),
                    'h': $form.find('[name=h]').val(),
                    'label': $form.find('[name=tag]').val()
                });

                // Add to tags array
                that.tags.push(tag);

                // Trigger event
                that.onTagAdded(tag);

                $form.addClass(PhotoTags.PREFIX + 'form-hide');
            }
            $el.find('img').imgAreaSelect({hide: true});
            $el.removeClass(PhotoTags.PREFIX + 'active');
        },
        /**
         * Append a tag by providing tag position and dimension
         *
         * @method appendTag
         * @param {Object} tag
         * @return {Object} The original object with id attribute.
         */
        appendTag: function (tag) {
            var that = this,
                id = PhotoTags.PREFIX + 'item-' + that.offset,
                $tag = $(PhotoTags.ITEM_TEMPLATE.replace('{{label}}', tag.label));

            that.log('appendTag() is executed');

            // Append
            $tag.attr('id', id);
            $tag.css({
                'left': parseInt(tag.x, 10) + 'px',
                'top': parseInt(tag.y, 10) + 'px',
                'width': parseInt(tag.w, 10) + 'px',
                'height': parseInt(tag.h, 10) + 'px'
            });
            $tag.data(tag);
            if (tag.url) {
                $tag.attr('data-url', tag.url);
            }
            that.el.append($tag);

            tag.id = id; // Set tag ID
            that.offset += 1; // Update the offset

            return tag;
        },
        /**
         * Renders this widget
         *
         * @method render
         */
        render: function () {
            var that = this,
                $el = that.el,
                $form = that.form,
                i;

            that.log('render() is executed');

            // Render Form
            $el.append($form);

            // Render imgAreaSelect
            $el.find('img').imgAreaSelect($.extend({
                onSelectStart: function(img, selection){
                    $el.addClass('photo-tags-active');
                    $form.addClass(PhotoTags.PREFIX + 'form-hide');
                },
                onSelectEnd: function (img, selection) {
                    $form.find('[name=x1]').val(selection.x1);
                    $form.find('[name=y1]').val(selection.y1);
                    $form.find('[name=x2]').val(selection.x2);
                    $form.find('[name=y2]').val(selection.y2);
                    $form.find('[name=w]').val(selection.width);
                    $form.find('[name=h]').val(selection.height);
                    $form.css('left', selection.x1);
                    $form.css('top', selection.y2);
                    if (selection.width === 0 && selection.height === 0) {
                        $form.addClass(PhotoTags.PREFIX + 'form-hide');
                    } else {
                        $form.removeClass(PhotoTags.PREFIX + 'form-hide');
                    }
                    that.onTagStart(img, selection);
                }
            }, that.options));

            // Render Tags
            for (i in that.tags) {
                if (that.tags.hasOwnProperty(i)) {
                    that.appendTag(that.tags[i]);
                }
            }

            that.onRender();
        }
    };
    $.extend(PhotoTags.prototype, proto);

    // Promote to global
    window.PhotoTags = PhotoTags;

}());
