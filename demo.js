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
        var that = this;
        options = options || {};

        that.el = $(el);
        that.enable = options.enable || true;
        that.offset = 0;
        that.form = options.form || $(PhotoTags.FORM_TEMPLATE);
        that.options = $.extend({}, options);
        that.saveUrl = options.saveUrl || null;
        that.saveCallback = options.saveCallback || function () {};
        that.tags = options.tags || [];
        that.onTagStart = options.onTagStart || function () {};
        that.onTagEnd = options.onTagEnd || function () {};
        that.onTagClick = options.onTagClick || function () {};
        that.onTagOver = options.onTagOver || function () {};
        that.onTagOut = options.onTagOut || function () {};
    }

    //=================
    // Constants
    //=================
    PhotoTags.PREFIX = 'photo-tags-';
    PhotoTags.ITEM_TEMPLATE = [
        '<div class="photo-tags-item">',
        '    <span class="photo-tags-label">{{label}}</span>',
        '</div>'
    ].join('\n');
    PhotoTags.FORM_TEMPLATE = [
       '<form class="photo-tags-form photo-tags-form-hide">',
       '     <input type="hidden" name="x1">',
       '     <input type="hidden" name="y1">',
       '     <input type="hidden" name="x2">',
       '     <input type="hidden" name="y2">',
       '     <input type="hidden" name="w">',
       '     <input type="hidden" name="h">',
       '     <label class="photo-tags-form-label">',
       '         <select data-placeholder="Choose tags..." type="text" name="tag" class="photo-tags-form-input chosen-select" multiple>',
       '             <option>Leo</option>',
       '             <option>Jessica</option>',
       '             <option>Henry</option>',
       '         </select>',
       '     </label>',
       '     <button type="submit" class="photo-tags-form-button">Save</button>',
       '</form>'
    ].join('\n');
    PhotoTags.DEFAULT_SETTING = {
        disable: false,
        handles: true,
        keys: {
            arrows: 15,
            shift: 5
        },
        fadeSpeed: 200,
    };

    var proto = {
        log: function (msg, type) {
            type = type || 'info';
            if (!window.console || window.console[type]) {
                return;
            }
            window.console[type](msg);
        },
        render: function () {
            var that = this,
                i,
                $el = that.el,
                $form = that.form;

            that.log('render() is executed');

            // Render Form
            $el.append($form);

            // Render imgAreaSelect
            $.extend(that.options, {
                onSelectStart: function(img, selection){
                    $el.addClass('photo-tags-active');
                    $form.addClass(PhotoTags.PREFIX + 'form-hide');
                    that.onTagStart(img, selection);
                },
                onSelectEnd: function (img, selection) {
                    //$el.removeClass('photo-tags-active');
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
                    that.onTagEnd(img, selection);
                }
            });
            $el.find('img').imgAreaSelect(that.options);

            // Render Tags
            var $tag = null,
                tag,
                offset = 0;
            for (i in that.tags) {
                if (that.tags.hasOwnProperty(i)) {
                    tag = that.tags[i];
                    $tag = $(PhotoTags.ITEM_TEMPLATE.replace('{{label}}', tag.label));
                    $tag.attr('id', 'photo-tags-item-' + that.offset);
                    $tag.css({
                        'left': tag.x,
                        'top': tag.y,
                        'width': parseInt(tag.w, 10) + 'px',
                        'height': parseInt(tag.h, 10) + 'px'
                    });
                    tag.id = $tag.attr('id');
                    if (tag.url) {
                        $tag.attr('data-url', tag.url);
                    }

                    that.offset += 1;

                    $tag.data(tag);
                    tag.el = $el.append($tag);
                }
            }

            // Bind Event
            $el.on('click', '.photo-tags-item[data-url]', function (e) {
                var $tag = $(e.currentTarget);
                window.open($(e.currentTarget).data('url'));
                that.onTagClick();
            });

            $el.on('mouseenter', '.photo-tags-item', function (e) {
                that.log('mouseenter');
                that.onTagOver();
            });

            $el.on('mouseleave', '.photo-tags-item', function (e) {
                that.log('mouseleave');
                that.onTagOut();
            });

            $form.on('submit', function (e) {
                e.preventDefault();
                console.log($form.serialize());
            });


        }
    };
    $.extend(PhotoTags.prototype, proto);

    window.PhotoTags = PhotoTags;

}());
