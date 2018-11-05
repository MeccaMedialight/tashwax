// just for the demo
define(function (require) {
    var tash = require('tashwax'), viewData;
    $(document).ready(function () {

        // 1. The easiest? ... load template and render into an element
        viewData = {foo: 'test1'};
        tash.loadAndRender('./templates/template.html', viewData, $('#test'));

        // 2. Load a template, render it and make a callback with rendered HTML
        viewData = {foo: 'test2'};
        tash.loadAndRender('./templates/template.html', viewData, function (ht) {
            $('#test2').html(ht);
        });

        // 3. Load a template, callback with the template when its ready
        viewData = {foo: 'test3'};
        tash.loadTemplate('./templates/template.html', function (tpl, src) {
            $('#test3').html(tash.render(tpl, viewData));
        });
    });
});