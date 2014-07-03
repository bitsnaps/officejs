/*global window, rJS, RSVP, console, jQuery, $, JSON, Handlebars,
  promiseEventListener, RegExp */
/*jslint maxlen:80, nomen: true */


(function (window, rJS, $, Handlebars, promiseEventListener) {
  "use strict";
  var gk = rJS(window),
    rows_template_source = gk.__template_element
      .getElementById('rows-template').innerHTML,
    rows_template = Handlebars.compile(rows_template_source);
  gk.declareAcquiredMethod("allDocs", "allDocs")
    .declareAcquiredMethod("displayThisPage", "displayThisPage")
    .declareAcquiredMethod("displayThisTitle", "displayThisTitle")
    .declareAcquiredMethod("plEnablePage", "plEnablePage")
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareMethod('render', function (options) {
      var gadget = this,
        list = gadget.__element.getElementsByTagName('ul')[0];
      return new RSVP.Queue()
        .push(function () {
          return gadget.displayThisTitle("playlist");
        })
        .push(function () {
          return gadget.allDocs({"include_docs": true});
        })
        .push(function (e) {
          var tmp = [],
            i,
            j,
            exp;
          if (options.id !== undefined) {
            for (i = 0, j = 0; i < e.data.rows.length; i += 1) {
              exp = new RegExp(options.id, "i");
              if (e.data.rows[i].doc.title.search(exp) !== -1) {
                tmp[j] = e.data.rows[i];
                j += 1;
              }
            }
            e.data.rows = tmp;
          }
          gadget.id = options.id;
          list.innerHTML = rows_template({
            "rows" : e.data.rows
          });
          $(list).listview("refresh");
        });
    })
    .declareMethod('startService', function () {
      var g = this,
        research = g.__element.getElementsByClassName('research')[0];
      if (g.id !== undefined) {
        research.value = g.id;
      }
      return new RSVP.Queue()
        .push(function () {
          return g.plEnablePage();
        })
        .push(function () {
          return promiseEventListener(research, "change", false);
        })
        .push(function (e) {
          return g.displayThisPage({page: "playlist",
                                    id: research.value});
        })
        .push(function (url) {
          window.location = url;
        });
    });
}(window, rJS, jQuery, Handlebars, promiseEventListener));
