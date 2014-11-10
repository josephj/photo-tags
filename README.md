Photo Tags Utility
------------------

A JavaScript photo tagging utility which allows you to choose multiple regions. 

```html
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/imgareaselect/0.9.10/css/imgareaselect-default.css" />
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/imgareaselect/0.9.10/css/imgareaselect-animated.css"/>
<link rel="stylesheet" href="photo-tags.css" />
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/chosen/1.1.0/chosen.jquery.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/imgareaselect/0.9.10/js/jquery.imgareaselect.min.js"></script>
<script src="photo-tags.js"></script>
<script>
var tags = [
    {x: 300, y: 80, w: 300, h: 295, label: 'Andy'},
    {x: 128, y: 258, w: 152,  h: 92, label: 'Mary'},
    {x: 16, y: 358, w: 269,  h: 192, label: 'George'}
];
var photoTags = new PhotoTags('.photo-tags', {tags: tags});
photoTags.render();
</script>



